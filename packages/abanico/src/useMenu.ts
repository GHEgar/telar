import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRovingFocus } from '@ghegar/lanzadera/react';
import { usePosition, type Placement, type Position } from '@ghegar/plomada/react';
import { ROLES, type ItemOptions, type MenuLink, type MenuParent } from './link.js';
import type { GroupProps, MenuButtonProps, MenuItemProps, MenuProps, SeparatorProps, SubmenuTriggerProps } from './props.js';

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
    parent?: MenuParent;
}

export interface UseMenu {
    open: boolean;
    activeIndex: number;
    position: Position | null;
    link: MenuLink;
    setOpen(open: boolean): void;
    close(): void;
    closeAll(): void;
    getButtonProps(): MenuButtonProps;
    getTriggerProps(): SubmenuTriggerProps;
    getMenuProps(): MenuProps;
    getItemProps(index: number, item?: ItemOptions): MenuItemProps;
    getSeparatorProps(): SeparatorProps;
    getGroupProps(label: string): GroupProps;
}

type Target = 'first' | 'last' | null;

export const useMenu = (options: UseMenuOptions): UseMenu => {
    const { count, isDisabled, getLabel, closeOnSelect = true, parent } = options;
    const id = useId();
    const buttonId = `${id}-button`;
    const menuId = `${id}-menu`;
    const [inner, setInner] = useState(options.defaultOpen ?? false);
    const reachable = !parent || (parent.link.open && parent.link.activeIndex === parent.index);
    if (inner && !reachable) setInner(false);
    const own = options.open ?? (inner && reachable);
    const open = own && reachable;
    const target = useRef<Target>(null);
    const menu = useRef<HTMLElement | null>(null);
    const button = useRef<HTMLElement | null>(null);
    const children = useRef(new Set<(node: Node) => boolean>());
    const settings = useRef(options);

    useLayoutEffect(() => {
        settings.current = options;
    });

    const setOpen = useCallback((next: boolean, focus: Target = 'first') => {
        setInner(next);
        target.current = next ? focus : null;
        settings.current.onOpenChange?.(next);
    }, []);

    const close = useCallback(() => {
        setOpen(false);
        button.current?.focus();
    }, [setOpen]);

    const closeAll = useCallback(() => {
        setOpen(false);
        if (settings.current.parent) settings.current.parent.link.closeAll();
        else button.current?.focus();
    }, [setOpen]);

    const contains = useCallback((node: Node): boolean => !!menu.current?.contains(node)
        || [...children.current].some((child) => child(node)), []);

    const roving = useRovingFocus({
        count,
        orientation: 'vertical',
        ...(isDisabled ? { isDisabled } : {}),
        ...(getLabel ? { getLabel } : {}),
        ...(options.loop === undefined ? {} : { loop: options.loop }),
    });
    const position = usePosition({
        open,
        placement: options.placement ?? (parent ? 'right-start' : 'bottom-start'),
        offset: options.offset ?? (parent ? 0 : 8),
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
        const unregister = parent?.link.register(contains);
        const onPointerDown = (event: PointerEvent): void => {
            const node = event.target as Node;
            if (contains(node) || button.current?.contains(node)) return;
            setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => {
            unregister?.();
            document.removeEventListener('pointerdown', onPointerDown, true);
        };
    }, [open, setOpen, contains, parent?.link]);

    const select = (index: number, kind: ItemOptions['type'] = 'item'): void => {
        if (isDisabled?.(index)) return;
        settings.current.onSelect?.(index);
        if (kind === 'item' && closeOnSelect) closeAll();
    };

    const menuKey = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' || (parent && event.key === 'ArrowLeft')) {
            event.preventDefault();
            event.stopPropagation();
            close();
        } else if (event.key === 'Tab') {
            closeAll();
        }
    };

    const itemProps = (index: number, item: ItemOptions = {}): MenuItemProps => {
        const base = roving.getItemProps(index);
        const disabled = isDisabled?.(index) ?? false;
        const kind = item.type ?? 'item';
        return {
            ...base,
            role: ROLES[kind],
            ...(kind === 'item' ? {} : { 'aria-checked': item.checked ?? false }),
            ...(disabled ? { 'aria-disabled': true as const, 'data-disabled': true as const } : {}),
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
    };

    const link: MenuLink = {
        open,
        activeIndex: roving.activeIndex,
        closeAll,
        register: (child) => {
            children.current.add(child);
            return () => children.current.delete(child);
        },
        itemProps,
    };
    const reference = position.getReferenceProps();
    const floating = position.getFloatingProps();
    const attachButton = (element: Element | null): void => {
        button.current = element instanceof HTMLElement ? element : null;
        reference.ref(element);
    };

    return {
        open,
        activeIndex: roving.activeIndex,
        position: position.position,
        link,
        setOpen: (next) => setOpen(next),
        close,
        closeAll,
        getButtonProps: () => ({
            ref: attachButton,
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
        getTriggerProps: () => {
            const base = parent ? parent.link.itemProps(parent.index) : itemProps(0);
            return {
                ...base,
                ref: (element: HTMLElement | null) => {
                    base.ref(element);
                    attachButton(element);
                },
                id: buttonId,
                'aria-haspopup': 'menu',
                'aria-expanded': open,
                ...(open ? { 'aria-controls': menuId } : {}),
                onClick: () => setOpen(true, 'first'),
                onKeyDown: (event) => {
                    if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setOpen(true, 'first');
                        return;
                    }
                    base.onKeyDown(event);
                },
                onPointerMove: () => {
                    base.onPointerMove();
                    if (!own) setOpen(true, null);
                },
            };
        },
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
        getItemProps: itemProps,
        getSeparatorProps: () => ({ role: 'separator' }),
        getGroupProps: (label) => ({ role: 'group', 'aria-label': label }),
    };
};
