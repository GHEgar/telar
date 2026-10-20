import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRovingFocus } from '@npmegar/lanzadera/react';
import { ROLES, type ItemOptions } from './link.js';
import { MENU_ESCAPE_PRIORITY, type EscapeStackLike } from './escape.js';
import type { RadialItemProps, RadialMenuProps, RadialTargetProps } from './props.js';
import { clampCenter, radialLayout, type Point, type RadialPosition } from './radial.js';
import { rightPress, type RightPress } from './release.js';

export interface UseRadialMenuOptions {
    count: number;
    label: string;
    onSelect?: (index: number) => void;
    getLabel?: (index: number) => string;
    isDisabled?: (index: number) => boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnSelect?: boolean;
    radius?: number;
    startAngle?: number;
    sweep?: number;
    padding?: number;
    longPress?: number;
    openOn?: 'contextmenu' | 'release';
    escapeStack?: EscapeStackLike;
    escapePriority?: number;
}

export interface UseRadialMenu {
    open: boolean;
    point: Point | null;
    center: Point | null;
    activeIndex: number;
    openAt(point: Point): void;
    close(): void;
    getTargetProps(): RadialTargetProps;
    getMenuProps(): RadialMenuProps;
    getItemProps(index: number, item?: ItemOptions): RadialItemProps;
    getItemPosition(index: number): RadialPosition;
}

const TOLERANCE = 8;

export const useRadialMenu = (options: UseRadialMenuOptions): UseRadialMenu => {
    const { count, isDisabled, getLabel, closeOnSelect = true, radius = 80, padding = 40, escapeStack } = options;
    const escapePriority = options.escapePriority ?? MENU_ESCAPE_PRIORITY;
    const menuId = `${useId()}-menu`;
    const [inner, setInner] = useState(options.defaultOpen ?? false);
    const [point, setPoint] = useState<Point | null>(null);
    const [center, setCenter] = useState<Point | null>(null);
    const open = options.open ?? inner;
    const menu = useRef<HTMLElement | null>(null);
    const returnTo = useRef<Element | null>(null);
    const pending = useRef(false);
    const skip = useRef(false);
    const settings = useRef(options);

    useLayoutEffect(() => {
        settings.current = options;
    });

    const setOpen = useCallback((next: boolean) => {
        setInner(next);
        settings.current.onOpenChange?.(next);
    }, []);

    const close = useCallback((restore = true) => {
        setOpen(false);
        const target = returnTo.current;
        returnTo.current = null;
        if (restore && target instanceof HTMLElement && target.isConnected) target.focus();
    }, [setOpen]);

    const openAt = useCallback((at: Point) => {
        const active = document.activeElement;
        if (!menu.current?.contains(active)) returnTo.current = active;
        setPoint(at);
        setCenter(clampCenter(at, radius + padding, { width: window.innerWidth, height: window.innerHeight }));
        pending.current = true;
        setOpen(true);
    }, [radius, padding, setOpen]);

    const roving = useRovingFocus({
        count,
        orientation: 'both',
        loop: true,
        ...(isDisabled ? { isDisabled } : {}),
        ...(getLabel ? { getLabel } : {}),
    });
    const { setActiveIndex } = roving;

    useEffect(() => {
        if (!open || !pending.current) return;
        pending.current = false;
        let index = -1;
        for (let candidate = 0; candidate < count; candidate += 1) {
            if (!isDisabled?.(candidate)) {
                index = candidate;
                break;
            }
        }
        if (index >= 0) setActiveIndex(index, true);
        else menu.current?.focus();
    }, [open, count, isDisabled, setActiveIndex]);

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event: PointerEvent): void => {
            if (!menu.current?.contains(event.target as Node)) close(false);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [open, close]);

    useEffect(() => {
        if (!open || !escapeStack) return undefined;
        return escapeStack.push({ id: `abanico:${menuId}`, priority: escapePriority, onEscape: () => close() });
    }, [open, escapeStack, escapePriority, menuId, close]);

    const press = useRef<(() => void) | null>(null);
    const right = useRef<RightPress | null>(null);
    const tracking = useRef<(() => void) | null>(null);
    useEffect(() => () => {
        press.current?.();
        tracking.current?.();
    }, []);

    const trackRight = (): void => {
        tracking.current?.();
        const onMove = (event: PointerEvent): void => {
            right.current = rightPress.move(right.current, event);
        };
        const onUp = (event: PointerEvent): void => {
            if (event.button !== 2) return;
            stop();
            const step = rightPress.up(right.current, event);
            right.current = step.press;
            if (step.open) openAt(step.open);
        };
        const stop = (): void => {
            document.removeEventListener('pointermove', onMove, true);
            document.removeEventListener('pointerup', onUp, true);
            tracking.current = null;
        };
        document.addEventListener('pointermove', onMove, true);
        document.addEventListener('pointerup', onUp, true);
        tracking.current = stop;
    };

    const select = (index: number, kind: ItemOptions['type'] = 'item'): void => {
        if (isDisabled?.(index)) return;
        settings.current.onSelect?.(index);
        if (kind === 'item' && closeOnSelect) close();
    };

    const menuKey = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close();
        } else if (event.key === 'Tab') {
            close(false);
        }
    };

    const centerOf = (element: Element): Point => {
        const rect = element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };

    const layout = radialLayout(count, {
        radius,
        ...(options.startAngle === undefined ? {} : { startAngle: options.startAngle }),
        ...(options.sweep === undefined ? {} : { sweep: options.sweep }),
    });

    return {
        open,
        point,
        center,
        activeIndex: roving.activeIndex,
        openAt,
        close: () => close(),
        getTargetProps: () => ({
            onContextMenu: (event) => {
                event.preventDefault();
                if (skip.current) {
                    skip.current = false;
                    return;
                }
                if (options.openOn === 'release') {
                    const step = rightPress.contextMenu(right.current, event, performance.now());
                    right.current = step.press;
                    if (step.open) openAt(step.open);
                    if (!step.fallback) return;
                }
                const keyboard = event.clientX === 0 && event.clientY === 0;
                openAt(keyboard ? centerOf(event.currentTarget) : { x: event.clientX, y: event.clientY });
            },
            onKeyDown: (event) => {
                if (event.key !== 'ContextMenu' && !(event.key === 'F10' && event.shiftKey)) return;
                event.preventDefault();
                skip.current = true;
                setTimeout(() => {
                    skip.current = false;
                }, 500);
                openAt(centerOf(event.currentTarget));
            },
            onPointerDown: (event) => {
                skip.current = false;
                if (options.openOn === 'release' && event.pointerType === 'mouse' && event.button === 2) {
                    right.current = rightPress.down(right.current, event, performance.now());
                    trackRight();
                }
                if (event.pointerType !== 'touch' || event.button !== 0) return;
                press.current?.();
                const start = { x: event.clientX, y: event.clientY, id: event.pointerId };
                const done = (): void => {
                    clearTimeout(timer);
                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', done);
                    document.removeEventListener('pointercancel', done);
                    press.current = null;
                };
                const onMove = (move: PointerEvent): void => {
                    if (move.pointerId === start.id && Math.hypot(move.clientX - start.x, move.clientY - start.y) > TOLERANCE) done();
                };
                const timer = setTimeout(() => {
                    done();
                    skip.current = true;
                    openAt({ x: start.x, y: start.y });
                }, options.longPress ?? 500);
                document.addEventListener('pointermove', onMove);
                document.addEventListener('pointerup', done);
                document.addEventListener('pointercancel', done);
                press.current = done;
            },
        }),
        getMenuProps: () => ({
            ref: (element: HTMLElement | null) => {
                menu.current = element;
            },
            id: menuId,
            role: 'menu',
            tabIndex: -1,
            'aria-label': options.label,
            'data-state': open ? 'open' : 'closed',
            'data-layout': 'radial',
            onKeyDown: menuKey,
        }),
        getItemProps: (index, item = {}) => {
            const base = roving.getItemProps(index);
            const disabled = isDisabled?.(index) ?? false;
            const kind = item.type ?? 'item';
            return {
                ...base,
                role: ROLES[kind],
                ...(kind === 'item' ? {} : { 'aria-checked': item.checked ?? false }),
                ...(disabled ? { 'aria-disabled': true as const, 'data-disabled': true as const } : {}),
                ...(item.soon ? { 'data-soon': true as const } : {}),
                'data-angle': layout[index]?.angle ?? 0,
                onClick: () => select(index, kind),
                onKeyDown: (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        select(index, kind);
                        return;
                    }
                    base.onKeyDown(event);
                },
                onPointerMove: () => {
                    if (!disabled && index !== roving.activeIndex) setActiveIndex(index, true);
                },
            };
        },
        getItemPosition: (index) => layout[index] ?? { x: 0, y: 0, angle: 0 },
    };
};
