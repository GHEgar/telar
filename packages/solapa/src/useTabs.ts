import { useCallback, useId, useState, type FocusEvent, type KeyboardEvent, type RefCallback } from 'react';
import { useRovingFocus } from '@ghegar/lanzadera/react';

export type Activation = 'automatic' | 'manual';

export interface UseTabsOptions {
    values: readonly string[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    activation?: Activation;
    loop?: boolean;
    isDisabled?: (value: string) => boolean;
}

export interface ListProps {
    role: 'tablist';
    'aria-orientation': 'horizontal' | 'vertical';
    onBlur: (event: FocusEvent) => void;
}

export interface TabProps {
    ref: RefCallback<HTMLElement>;
    id: string;
    role: 'tab';
    type: 'button';
    tabIndex: 0 | -1;
    disabled?: true;
    'aria-selected': boolean;
    'aria-controls': string;
    'data-state': 'active' | 'inactive';
    onClick: () => void;
    onFocus: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
}

export interface PanelProps {
    id: string;
    role: 'tabpanel';
    tabIndex: 0;
    hidden: boolean;
    'aria-labelledby': string;
    'data-state': 'active' | 'inactive';
}

export interface UseTabs {
    value: string | undefined;
    setValue(value: string): void;
    getListProps(): ListProps;
    getTabProps(value: string): TabProps;
    getPanelProps(value: string): PanelProps;
}

const slug = (value: string): string => value.replace(/[^\w-]/g, '_');

export const useTabs = (options: UseTabsOptions): UseTabs => {
    const { values, isDisabled, onValueChange, orientation = 'horizontal', activation = 'automatic' } = options;
    const base = useId();
    const [inner, setInner] = useState(options.defaultValue);
    const disabledAt = (index: number): boolean => isDisabled?.(values[index] ?? '') ?? false;
    const wanted = options.value ?? inner;
    const firstEnabled = values.find((candidate) => !isDisabled?.(candidate));
    const value = wanted !== undefined && values.includes(wanted) && !isDisabled?.(wanted) ? wanted : firstEnabled;
    const selectedIndex = value === undefined ? -1 : values.indexOf(value);
    const [focusIndex, setFocusIndex] = useState<number | null>(null);

    const setValue = useCallback((next: string) => {
        setInner(next);
        onValueChange?.(next);
    }, [onValueChange]);

    const roving = useRovingFocus({
        count: values.length,
        orientation,
        isDisabled: disabledAt,
        activeIndex: activation === 'automatic' ? selectedIndex : focusIndex ?? selectedIndex,
        onActiveChange: (index) => {
            if (activation === 'manual') setFocusIndex(index);
            else if (values[index] !== undefined && values[index] !== value) setValue(values[index]);
        },
        ...(options.loop === undefined ? {} : { loop: options.loop }),
    });

    const tabId = (target: string): string => `${base}-tab-${slug(target)}`;
    const panelId = (target: string): string => `${base}-panel-${slug(target)}`;

    return {
        value,
        setValue,
        getListProps: () => ({
            role: 'tablist',
            'aria-orientation': orientation,
            onBlur: (event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusIndex(null);
            },
        }),
        getTabProps: (target) => {
            const index = values.indexOf(target);
            const item = roving.getItemProps(index);
            const selected = target === value;
            const disabled = isDisabled?.(target) ?? false;
            return {
                ...item,
                id: tabId(target),
                role: 'tab',
                type: 'button',
                ...(disabled ? { disabled: true as const } : {}),
                'aria-selected': selected,
                'aria-controls': panelId(target),
                'data-state': selected ? 'active' : 'inactive',
                onClick: () => {
                    if (!disabled && !selected) setValue(target);
                },
                onKeyDown: (event) => {
                    if (activation === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        if (!disabled) setValue(target);
                        return;
                    }
                    item.onKeyDown(event);
                },
            };
        },
        getPanelProps: (target) => ({
            id: panelId(target),
            role: 'tabpanel',
            tabIndex: 0,
            hidden: target !== value,
            'aria-labelledby': tabId(target),
            'data-state': target === value ? 'active' : 'inactive',
        }),
    };
};
