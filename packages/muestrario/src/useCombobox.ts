import { useEffect, useId, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { moveIndex } from '@ghegar/lanzadera';
import { usePosition, type Placement, type Position } from '@ghegar/plomada/react';
import { filterItems, groupItems, type Group } from './filter.js';
import { DEFAULT_LABELS, type ComboboxLabels } from './labels.js';
import type {
    AnchorProps, ButtonProps, GroupLabelProps, GroupProps, InputProps, ListboxProps, OptionProps, StatusProps,
} from './props.js';
import { useAsyncItems, type AsyncStatus, type Loader } from './useAsyncItems.js';

export interface UseComboboxOptions<T> {
    getLabel: (item: T) => string;
    getKey?: (item: T) => string;
    items?: readonly T[];
    load?: Loader<T>;
    filter?: ((item: T, query: string) => boolean) | false;
    groupBy?: (item: T) => string;
    isDisabled?: (item: T) => boolean;
    multiple?: boolean;
    value?: T | null;
    defaultValue?: T | null;
    onChange?: (value: T | null) => void;
    values?: readonly T[];
    defaultValues?: readonly T[];
    onValuesChange?: (values: T[]) => void;
    minChars?: number;
    debounce?: number;
    openOnFocus?: boolean;
    placement?: Placement;
    offset?: number;
    labels?: Partial<ComboboxLabels>;
}

export interface UseCombobox<T> {
    open: boolean;
    inputValue: string;
    items: readonly T[];
    groups: Group<T>[] | null;
    activeIndex: number;
    value: T | null;
    values: readonly T[];
    status: AsyncStatus;
    statusText: string;
    position: Position | null;
    setOpen(open: boolean): void;
    select(item: T): void;
    clear(): void;
    getAnchorProps(): AnchorProps;
    getInputProps(): InputProps;
    getListboxProps(): ListboxProps;
    getOptionProps(item: T, index: number): OptionProps;
    getGroupProps(group: Group<T>): GroupProps;
    getGroupLabelProps(group: Group<T>): GroupLabelProps;
    getRemoveProps(item: T): ButtonProps;
    getClearProps(): ButtonProps;
    getStatusProps(): StatusProps;
}

const FIRST = -2;
const keep = (event: MouseEvent): void => event.preventDefault();

export const useCombobox = <T>(options: UseComboboxOptions<T>): UseCombobox<T> => {
    const { getLabel, isDisabled, multiple = false, minChars = 0, debounce = 200, groupBy } = options;
    const getKey = options.getKey ?? getLabel;
    const labels = { ...DEFAULT_LABELS, ...options.labels };
    const base = useId();
    const listId = `${base}-listbox`;
    const [open, setOpenState] = useState(false);
    const [singleInner, setSingleInner] = useState<T | null>(options.defaultValue ?? null);
    const [valuesInner, setValuesInner] = useState<readonly T[]>(options.defaultValues ?? []);
    const value = options.value === undefined ? singleInner : options.value;
    const values = options.values ?? valuesInner;
    const [input, setInput] = useState(() => (value && !multiple ? getLabel(value) : ''));
    const [filtering, setFiltering] = useState(false);
    const [active, setActive] = useState(-1);
    const valueKey = value === null ? null : getKey(value);
    const [shownKey, setShownKey] = useState(valueKey);
    if (!multiple && shownKey !== valueKey) {
        setShownKey(valueKey);
        setInput(value === null ? '' : getLabel(value));
        setFiltering(false);
    }

    const query = filtering ? input : '';
    const remote = useAsyncItems(options.load, query, open, minChars, debounce);
    const local = options.items ?? [];
    const source = options.load
        ? remote.items
        : options.filter === false ? local
            : options.filter ? local.filter((item) => !query.trim() || (options.filter as (item: T, query: string) => boolean)(item, query))
                : filterItems(local, query, getLabel);
    const groups = groupBy ? groupItems(source, groupBy) : null;
    const items = groups ? groups.flatMap((group) => group.options.map((option) => option.item)) : source;
    const disabledAt = (index: number): boolean => { const item = items[index]; return item === undefined || (isDisabled?.(item) ?? false); };
    const firstEnabled = items.findIndex((_, index) => !disabledAt(index));
    const activeIndex = !open ? -1 : active === FIRST ? firstEnabled : active < items.length && !disabledAt(active) ? active : -1;
    const isChosen = (item: T): boolean => (multiple ? values.some((other) => getKey(other) === getKey(item)) : !!value && getKey(value) === getKey(item));
    const optionId = (index: number): string => `${base}-option-${index}`;

    const position = usePosition({ open, sameWidth: true, placement: options.placement ?? 'bottom-start', ...(options.offset === undefined ? {} : { offset: options.offset }) });

    useEffect(() => {
        if (activeIndex >= 0) document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' });
    });

    const setOpen = (next: boolean, start = -1): void => {
        setOpenState(next);
        setActive(next ? start : -1);
    };

    const setSingle = (next: T | null): void => {
        setSingleInner(next);
        options.onChange?.(next);
    };

    const setMany = (next: T[]): void => {
        setValuesInner(next);
        options.onValuesChange?.(next);
    };

    const select = (item: T): void => {
        if (isDisabled?.(item)) return;
        setFiltering(false);
        if (multiple) {
            setMany(isChosen(item) ? values.filter((other) => getKey(other) !== getKey(item)) : [...values, item]);
            setInput('');
            return;
        }
        setSingle(item);
        setInput(getLabel(item));
        setOpen(false);
    };

    const clear = (): void => {
        setInput('');
        setFiltering(false);
        if (multiple) setMany([]);
        else setSingle(null);
    };

    const step = (key: string): void => {
        if (!open) {
            setOpen(true, key === 'ArrowUp' ? items.length - 1 : FIRST);
            return;
        }
        const from = activeIndex < 0 ? (key === 'ArrowUp' ? 'End' : 'Home') : key;
        const next = moveIndex(activeIndex, from, { count: items.length, orientation: 'vertical', isDisabled: disabledAt });
        if (next !== null) setActive(next);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                event.preventDefault();
                if (event.altKey && event.key === 'ArrowDown') setOpen(true);
                else step(event.key);
                return;
            case 'Enter': {
                const item = items[activeIndex];
                if (!open || item === undefined) return;
                event.preventDefault();
                select(item);
                return;
            }
            case 'Escape':
                if (open) setOpen(false);
                else if (input) {
                    setInput('');
                    setFiltering(false);
                } else return;
                event.preventDefault();
                return;
            case 'Backspace':
                if (multiple && !input && values.length) setMany(values.slice(0, -1));
                return;
            case 'Tab':
                setOpen(false);
                return;
            default:
                return;
        }
    };

    const statusText = (() => {
        if (options.load && open && input.trim().length < minChars) return labels.typeMore(minChars);
        if (remote.status === 'loading') return labels.loading;
        if (remote.status === 'error') return labels.error;
        if (!open) return '';
        return items.length ? labels.results(items.length) : labels.noResults;
    })();

    const reference = position.getReferenceProps();
    const floating = position.getFloatingProps();

    return {
        open,
        inputValue: input,
        items,
        groups,
        activeIndex,
        value,
        values,
        status: remote.status,
        statusText,
        position: position.position,
        setOpen: (next) => setOpen(next),
        select,
        clear,
        getAnchorProps: () => reference,
        getInputProps: () => ({
            ref: reference.ref,
            id: `${base}-input`,
            type: 'text',
            role: 'combobox',
            value: input,
            autoComplete: 'off',
            'aria-autocomplete': 'list',
            'aria-expanded': open,
            'aria-controls': listId,
            ...(activeIndex >= 0 ? { 'aria-activedescendant': optionId(activeIndex) } : {}),
            onChange: (event) => {
                setInput(event.target.value);
                setFiltering(true);
                setOpen(true, FIRST);
            },
            onKeyDown,
            onFocus: () => {
                if (options.openOnFocus && !open) setOpen(true);
            },
            onBlur: () => {
                setOpen(false);
                setFiltering(false);
                setInput(multiple || !value ? '' : getLabel(value));
            },
            onClick: () => {
                if (!open) setOpen(true);
            },
        }),
        getListboxProps: () => ({
            ...floating,
            id: listId,
            role: 'listbox',
            ...(multiple ? { 'aria-multiselectable': true as const } : {}),
            ...(remote.status === 'loading' ? { 'aria-busy': true as const } : {}),
            onMouseDown: keep,
        }),
        getOptionProps: (item, index) => {
            const disabled = isDisabled?.(item) ?? false;
            const chosen = isChosen(item);
            return {
                id: optionId(index),
                role: 'option',
                'aria-selected': multiple ? chosen : index === activeIndex,
                ...(disabled ? { 'aria-disabled': true as const, 'data-disabled': true as const } : {}),
                ...(index === activeIndex ? { 'data-active': true as const } : {}),
                ...(chosen ? { 'data-selected': true as const } : {}),
                onClick: () => select(item),
                onMouseDown: keep,
                onPointerMove: () => {
                    if (!disabled && index !== activeIndex) setActive(index);
                },
            };
        },
        getGroupProps: (group) => ({ role: 'group', 'aria-labelledby': `${base}-group-${groups?.indexOf(group) ?? 0}` }),
        getGroupLabelProps: (group) => ({ id: `${base}-group-${groups?.indexOf(group) ?? 0}`, role: 'presentation' }),
        getRemoveProps: (item) => ({
            type: 'button',
            tabIndex: -1,
            'aria-label': `${labels.remove} ${getLabel(item)}`,
            onClick: () => setMany(values.filter((other) => getKey(other) !== getKey(item))),
            onMouseDown: keep,
        }),
        getClearProps: () => ({ type: 'button', tabIndex: -1, 'aria-label': labels.clear, onClick: clear, onMouseDown: keep }),
        getStatusProps: () => ({ role: 'status', 'aria-live': 'polite', 'aria-atomic': true }),
    };
};
