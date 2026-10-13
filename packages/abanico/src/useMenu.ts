import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRovingFocus } from '@ghegar/lanzadera/react';
import { usePosition, type Placement, type Position } from '@ghegar/plomada/react';
import type { MenuButtonProps, MenuItemProps, MenuProps } from './props.js';

export interface UseMenuOptions {
    count: number;
    onSelect?: (index: number) => void;
    getLabel?: (index: number) => string;
    isDisabled?: (index: number) => boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnSelect?: boolean;
    loop?: boolean;
    placement?: Placement;
    offset?: number;
}

export interface UseMenu {
    open: boolean;
    activeIndex: number;
    position: Position | null;
    setOpen(open: boolean): void;
    getButtonProps(): MenuButtonProps;
    getMenuProps(): MenuProps;
    getItemProps(index: number): MenuItemProps;
}

type Target = 'first' | 'last' | null;

export const useMenu = (options: UseMenuOptions): UseMenu => {
    const { count, isDisabled, getLabel, closeOnSelect = true } = options;
    const id = useId();
    const buttonId = `${id}-button`;
    const menuId = `${id}-menu`;
    const [inner, setInner] = useState(options.defaultOpen ?? false);
    const open = options.open ?? inner;
    const target = useRef<Target>(null);
    const menu = useRef<HTMLElement | null>(null);
    const button = useRef<HTMLElement | null>(null);
    const settings = useRef(options);

    useLayoutEffect(() => {
        settings.current = options;
    });

    const setOpen = useCallback((next: boolean, focus: Target = 'first') => {
        setInner(next);
        target.current = next ? focus : null;
        settings.current.onOpenChange?.(next);
    }, []);

    const closeToButton = useCallback(() => {
        setOpen(false);
        button.current?.focus();
    }, [setOpen]);

    const roving = useRovingFocus({
        count,
        orientation: 'vertical',
        ...(isDisabled ? { isDisabled } : {}),
        ...(getLabel ? { getLabel } : {}),
        ...(options.loop === undefined ? {} : { loop: options.loop }),
    });
    const position = usePosition({
        open,
        placement: options.placement ?? 'bottom-start',
        ...(options.offset === undefined ? {} : { offset: options.offset }),
    });

    const { setActiveIndex } = roving;
    const positioned = position.position !== null;
    useEffect(() => {
        const wanted = target.current;
        if (!open || !positioned || !wanted) return;
        target.current = null;
        let index = -1;
        for (let step = 0; step < count; step += 1) {
            const candidate = wanted === 'first' ? step : count - 1 - step;
            if (!isDisabled?.(candidate)) {
                index = candidate;
                break;
            }
        }
        if (index >= 0) setActiveIndex(index, true);
        else menu.current?.focus();
    }, [open, positioned, count, isDisabled, setActiveIndex]);

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event: PointerEvent): void => {
            const node = event.target as Node;
            if (menu.current?.contains(node) || button.current?.contains(node)) return;
            setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [open, setOpen]);

    const select = (index: number): void => {
        if (isDisabled?.(index)) return;
        settings.current.onSelect?.(index);
        if (closeOnSelect) closeToButton();
    };

    const menuKey = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeToButton();
        } else if (event.key === 'Tab') {
            setOpen(false);
        }
    };

    const reference = position.getReferenceProps();
    const floating = position.getFloatingProps();

    return {
        open,
        activeIndex: roving.activeIndex,
        position: position.position,
        setOpen: (next) => setOpen(next),
        getButtonProps: () => ({
            ref: (element: Element | null) => {
                button.current = element instanceof HTMLElement ? element : null;
                reference.ref(element);
            },
            id: buttonId,
            type: 'button',
            'aria-haspopup': 'menu',
            'aria-expanded': open,
            ...(open ? { 'aria-controls': menuId } : {}),
            onClick: () => setOpen(!open),
            onKeyDown: (event) => {
                if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setOpen(true, 'first');
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setOpen(true, 'last');
                }
            },
        }),
        getMenuProps: () => ({
            ...floating,
            ref: (element: HTMLElement | null) => {
                menu.current = element;
                floating.ref(element);
            },
            id: menuId,
            role: 'menu',
            tabIndex: -1,
            'aria-labelledby': buttonId,
            'data-state': open ? 'open' : 'closed',
            onKeyDown: menuKey,
        }),
        getItemProps: (index) => {
            const item = roving.getItemProps(index);
            const disabled = isDisabled?.(index) ?? false;
            return {
                ...item,
                role: 'menuitem',
                ...(disabled ? { 'aria-disabled': true as const, 'data-disabled': true as const } : {}),
                onClick: () => select(index),
                onKeyDown: (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        select(index);
                        return;
                    }
                    item.onKeyDown(event);
                },
                onPointerMove: () => {
                    if (!disabled && index !== roving.activeIndex) setActiveIndex(index, true);
                },
            };
        },
    };
};
