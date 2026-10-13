import { useCallback, useRef, useState, type KeyboardEvent, type RefCallback } from 'react';
import { createTypeahead, moveIndex, type MoveOptions } from '../core/index.js';

export interface UseRovingFocusOptions extends Omit<MoveOptions, 'count'> {
    count: number;
    activeIndex?: number;
    defaultIndex?: number;
    onActiveChange?: (index: number) => void;
    getLabel?: (index: number) => string;
    typeaheadTimeout?: number;
}

export interface ItemProps {
    ref: RefCallback<HTMLElement>;
    tabIndex: 0 | -1;
    'data-active'?: true;
    onKeyDown: (event: KeyboardEvent) => void;
    onFocus: () => void;
}

export interface UseRovingFocus {
    activeIndex: number;
    setActiveIndex(index: number, focus?: boolean): void;
    focusItem(index: number): void;
    handleKey(event: KeyboardEvent): number | null;
    getItemProps(index: number): ItemProps;
}

const firstEnabled = (count: number, isDisabled?: (index: number) => boolean): number => {
    for (let index = 0; index < count; index += 1) if (!isDisabled?.(index)) return index;
    return -1;
};

export const useRovingFocus = (options: UseRovingFocusOptions): UseRovingFocus => {
    const { count, isDisabled, onActiveChange, getLabel } = options;
    const [inner, setInner] = useState(options.defaultIndex ?? -1);
    const [typeahead] = useState(() => createTypeahead(options.typeaheadTimeout));
    const items = useRef(new Map<number, HTMLElement>());
    const wanted = options.activeIndex ?? inner;
    const valid = wanted >= 0 && wanted < count && !isDisabled?.(wanted);
    const activeIndex = valid ? wanted : firstEnabled(count, isDisabled);

    const focusItem = useCallback((index: number) => {
        items.current.get(index)?.focus();
    }, []);

    const setActiveIndex = useCallback((index: number, focus = false) => {
        setInner(index);
        onActiveChange?.(index);
        if (focus) focusItem(index);
    }, [focusItem, onActiveChange]);

    const handleKey = (event: KeyboardEvent): number | null => {
        const moved = moveIndex(activeIndex, event.key, { ...options, count });
        const next = moved ?? (getLabel && !event.ctrlKey && !event.metaKey && !event.altKey
            ? typeahead.match(event.key, activeIndex, getLabel, count, isDisabled)
            : null);
        if (next === null) return null;
        event.preventDefault();
        if (next !== activeIndex) setActiveIndex(next, true);
        return next;
    };

    return {
        activeIndex,
        setActiveIndex,
        focusItem,
        handleKey,
        getItemProps: (index) => ({
            ref: (element: HTMLElement | null) => {
                if (element) items.current.set(index, element);
                else items.current.delete(index);
            },
            tabIndex: index === activeIndex ? 0 : -1,
            ...(index === activeIndex ? { 'data-active': true as const } : {}),
            onKeyDown: (event) => {
                handleKey(event);
            },
            onFocus: () => {
                if (index !== activeIndex && !isDisabled?.(index)) setActiveIndex(index);
            },
        }),
    };
};
