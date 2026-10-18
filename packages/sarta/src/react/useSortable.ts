import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react';
import { useRovingFocus } from '@npmegar/lanzadera/react';
import { createSortable, DEFAULT_LABELS, type Move, type Sortable, type SortableOptions, type SortableSnapshot, type Span } from '../core/index.js';
import type { AnnouncerProps, HandleProps, InstructionsProps, ItemProps, ListProps, Orientation } from './props.js';
import { startPress } from './press.js';

export interface UseSortableOptions extends SortableOptions {
    orientation?: Orientation;
    isDisabled?: (index: number) => boolean;
    roving?: boolean;
    touchDelay?: number;
    dragThreshold?: number;
}

export interface UseSortable extends SortableSnapshot {
    sortable: Sortable;
    getListProps(): ListProps;
    getItemProps(index: number): ItemProps;
    getHandleProps(index: number): HandleProps;
    getInstructionsProps(): InstructionsProps;
    getAnnouncerProps(): AnnouncerProps;
}

const KEYS: Record<Orientation, { forward: string; backward: string }> = {
    vertical: { forward: 'ArrowDown', backward: 'ArrowUp' },
    horizontal: { forward: 'ArrowRight', backward: 'ArrowLeft' },
};

export const useSortable = (options: UseSortableOptions): UseSortable => {
    const { count, onReorder, getLabel, labels, isDisabled, orientation = 'vertical', roving: rove = true } = options;
    const [sortable] = useState(() => createSortable(options));
    const snapshot = useSyncExternalStore(sortable.subscribe, sortable.getSnapshot, sortable.getSnapshot);
    const instructionsId = useId();
    const items = useRef(new Map<number, HTMLElement>());
    const pending = useRef<number | null>(null);
    const stop = useRef<(() => void) | null>(null);
    const pressing = useRef(false);
    const text = { ...DEFAULT_LABELS, ...labels };

    useLayoutEffect(() => {
        sortable.update({ count, onReorder, getLabel, labels } as SortableOptions);
    }, [sortable, count, onReorder, getLabel, labels]);

    const roving = useRovingFocus({ count, orientation, ...(isDisabled ? { isDisabled } : {}) });
    const { focusItem, setActiveIndex } = roving;

    useLayoutEffect(() => {
        const index = pending.current;
        if (index === null) return;
        pending.current = null;
        focusItem(index);
    });

    useEffect(() => () => {
        stop.current?.();
    }, []);

    const measure = (): Span[] => Array.from({ length: count }, (_, index) => {
        const rect = items.current.get(index)?.getBoundingClientRect();
        if (!rect) return { start: 0, end: 0 };
        return orientation === 'vertical' ? { start: rect.top, end: rect.bottom } : { start: rect.left, end: rect.right };
    });

    const settle = (move: Move | null): void => {
        if (!move) return;
        setActiveIndex(move.to);
        pending.current = move.to;
    };

    const keyboardMove = (event: KeyboardEvent): boolean => {
        const keys = KEYS[orientation];
        switch (event.key) {
            case keys.forward: sortable.moveBy(1); break;
            case keys.backward: sortable.moveBy(-1); break;
            case 'Home': sortable.moveToEdge('start'); break;
            case 'End': sortable.moveToEdge('end'); break;
            case ' ':
            case 'Enter': settle(sortable.drop()); break;
            case 'Escape': sortable.cancel(); break;
            default: return event.key === 'Tab';
        }
        return true;
    };

    const onKeyDown = (index: number, event: KeyboardEvent): void => {
        const current = sortable.getSnapshot();
        if (current.active !== null) {
            if (current.active === index && current.mode === 'keyboard' && keyboardMove(event) && event.key !== 'Tab') event.preventDefault();
            return;
        }
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            if (!isDisabled?.(index)) sortable.grab(index, 'keyboard', measure());
            return;
        }
        if (rove) roving.handleKey(event);
    };

    const onPointerDown = (index: number, event: PointerEvent): void => {
        if (event.button !== 0 || isDisabled?.(index) || sortable.getSnapshot().active !== null) return;
        stop.current?.();
        pressing.current = true;
        stop.current = startPress(event, {
            vertical: orientation === 'vertical',
            touchDelay: options.touchDelay ?? 250,
            threshold: options.dragThreshold ?? 4,
            tolerance: 8,
            onStart: () => sortable.grab(index, 'pointer', measure()),
            onMove: (delta) => sortable.drag(delta),
            onEnd: () => settle(sortable.drop()),
            onCancel: () => sortable.cancel(),
            onFinish: () => {
                pressing.current = false;
                stop.current = null;
            },
        });
    };

    const { active, over, mode } = snapshot;

    return {
        ...snapshot,
        sortable,
        getListProps: () => ({
            'data-orientation': orientation,
            ...(active === null ? {} : { 'data-sorting': true as const }),
        }),
        getItemProps: (index) => ({
            ref: (element: HTMLElement | null) => {
                if (element) items.current.set(index, element);
                else items.current.delete(index);
            },
            'data-index': index,
            ...(active === index ? { 'data-dragging': true as const } : {}),
            ...(active !== null && active !== index && over === index ? { 'data-over': true as const } : {}),
        }),
        getHandleProps: (index) => {
            const base = roving.getItemProps(index);
            const disabled = isDisabled?.(index) ?? false;
            return {
                ...base,
                type: 'button',
                tabIndex: rove ? base.tabIndex : 0,
                'aria-label': text.handle(getLabel?.(index) ?? `Item ${index + 1}`),
                'aria-describedby': instructionsId,
                'aria-pressed': active === index,
                ...(disabled ? { 'aria-disabled': true as const } : {}),
                ...(active === index ? { 'data-grabbed': true as const } : {}),
                onKeyDown: (event) => onKeyDown(index, event),
                onBlur: () => {
                    const current = sortable.getSnapshot();
                    if (current.active === index && current.mode === 'keyboard') sortable.cancel();
                },
                onPointerDown: (event) => onPointerDown(index, event),
                onContextMenu: (event) => {
                    if (pressing.current || mode === 'pointer') event.preventDefault();
                },
            };
        },
        getInstructionsProps: () => ({ id: instructionsId, hidden: true, children: text.instructions }),
        getAnnouncerProps: () => ({ role: 'status', 'aria-live': 'assertive', 'aria-atomic': true, children: snapshot.announcement }),
    };
};
