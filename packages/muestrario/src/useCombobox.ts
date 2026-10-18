import { useEffect, useId, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { moveIndex } from '@npmegar/lanzadera';
import { usePosition } from '@npmegar/plomada/react';
import { filterItems, groupItems, normalize } from './filter.js';
import { DEFAULT_LABELS } from './labels.js';
import type { UseCombobox, UseComboboxOptions } from './types.js';
import { useAsyncItems } from './useAsyncItems.js';
import { useVirtual } from './useVirtual.js';

const FIRST = -2;
const keep = (event: MouseEvent): void => event.preventDefault();

export const useCombobox = <T>(options: UseComboboxOptions<T>): UseCombobox<T> => {
    const { getLabel, isDisabled, multiple = false, minChars = 0, debounce = 200, groupBy } = options;
    const getKey = options.getKey ?? getLabel;
    const labels = { ...DEFAULT_LABELS, ...options.labels };
    const base = useId();
    const listId = `${base}-listbox`;
    const createId = `${base}-create`;
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
    const custom = options.filter;
    const source = options.load
        ? remote.items
        : custom === false ? local
            : custom ? local.filter((item) => !query.trim() || custom(item, query))
                : filterItems(local, query, getLabel);
    const groups = groupBy ? groupItems(source, groupBy) : null;
    const items = groups ? groups.flatMap((group) => group.options.map((option) => option.item)) : source;
    const text = input.trim();
    const canCreate = !!options.onCreate && filtering && !!text && !items.some((item) => normalize(getLabel(item)) === normalize(text));
    const createIndex = canCreate ? items.length : -1;
    const total = items.length + (canCreate ? 1 : 0);
    const disabledAt = (index: number): boolean => {
        if (index === createIndex) return false;
        const item = items[index];
        return item === undefined || (isDisabled?.(item) ?? false);
    };
    const firstEnabled = Array.from({ length: total }, (_, index) => index).find((index) => !disabledAt(index)) ?? -1;
    const activeIndex = !open ? -1 : active === FIRST ? firstEnabled : active < total && !disabledAt(active) ? active : -1;
    const isChosen = (item: T): boolean => (multiple ? values.some((other) => getKey(other) === getKey(item)) : !!value && getKey(value) === getKey(item));
    const optionId = (index: number): string => (index === createIndex ? createId : `${base}-option-${index}`);

    const position = usePosition({ open, sameWidth: true, placement: options.placement ?? 'bottom-start', ...(options.offset === undefined ? {} : { offset: options.offset }) });
    const virtual = useVirtual(options.virtual, items.length, activeIndex);

    useEffect(() => {
        if (activeIndex >= 0 && !options.virtual) document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' });
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

    const create = (): void => {
        const made = options.onCreate?.(text);
        if (made !== undefined && made !== null) select(made);
    };

    const clear = (): void => {
        setInput('');
        setFiltering(false);
        if (multiple) setMany([]);
        else setSingle(null);
    };

    const step = (key: string): void => {
        if (!open) {
            setOpen(true, key === 'ArrowUp' ? total - 1 : FIRST);
            return;
        }
        const from = activeIndex < 0 ? (key === 'ArrowUp' ? 'End' : 'Home') : key;
        const next = moveIndex(activeIndex, from, { count: total, orientation: 'vertical', isDisabled: disabledAt });
        if (next !== null) setActive(next);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        const { key } = event;
        if (key === 'ArrowDown' || key === 'ArrowUp') {
            event.preventDefault();
            if (event.altKey && key === 'ArrowDown') setOpen(true);
            else step(key);
        } else if (key === 'Enter') {
            if (!open || activeIndex < 0) return;
            event.preventDefault();
            const item = items[activeIndex];
            if (activeIndex === createIndex) create();
            else if (item !== undefined) select(item);
        } else if (key === 'Escape') {
            if (open) setOpen(false);
            else if (input) {
                setInput('');
                setFiltering(false);
            } else return;
            event.preventDefault();
        } else if (key === 'Backspace') {
            if (multiple && !input && values.length) setMany(values.slice(0, -1));
        } else if (key === 'Tab') {
            setOpen(false);
        }
    };

    const statusText = (() => {
        if (options.load && open && text.length < minChars) return labels.typeMore(minChars);
        if (remote.status === 'loading') return labels.loading;
        if (remote.status === 'error') return labels.error;
        if (!open) return '';
        return items.length ? labels.results(items.length) : labels.noResults;
    })();

    const reference = position.getReferenceProps();
    const floating = position.getFloatingProps();
    const optionProps = (index: number, chosen: boolean, disabled: boolean, onClick: () => void) => ({
        id: optionId(index),
        role: 'option' as const,
        'aria-selected': multiple ? chosen : index === activeIndex,
        ...(virtual && index !== createIndex ? { 'aria-setsize': items.length, 'aria-posinset': index + 1 } : {}),
        ...(disabled ? { 'aria-disabled': true as const, 'data-disabled': true as const } : {}),
        ...(index === activeIndex ? { 'data-active': true as const } : {}),
        ...(chosen ? { 'data-selected': true as const } : {}),
        onClick,
        onMouseDown: keep,
        onPointerMove: () => {
            if (!disabled && index !== activeIndex) setActive(index);
        },
    });

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
        createText: canCreate ? labels.create(text) : null,
        virtualItems: virtual ? virtual.items.flatMap(({ index, style }) => {
            const item = items[index];
            return item === undefined ? [] : [{ item, index, style }];
        }) : null,
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
                if (!options.freeText || multiple) setInput(multiple || !value ? '' : getLabel(value));
            },
            onClick: () => {
                if (!open) setOpen(true);
            },
        }),
        getListboxProps: () => ({
            ...floating,
            ...(virtual ? {
                ref: (element: HTMLElement | null) => {
                    floating.ref(element);
                    virtual.scrollerRef(element);
                },
                onScroll: virtual.onScroll,
            } : {}),
            id: listId,
            role: 'listbox',
            ...(multiple ? { 'aria-multiselectable': true as const } : {}),
            ...(remote.status === 'loading' ? { 'aria-busy': true as const } : {}),
            onMouseDown: keep,
        }),
        getOptionProps: (item, index) => optionProps(index, isChosen(item), isDisabled?.(item) ?? false, () => select(item)),
        getCreateProps: () => optionProps(createIndex, false, false, create),
        getSizerProps: () => ({ 'aria-hidden': true, style: virtual?.sizerStyle ?? {} }),
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
