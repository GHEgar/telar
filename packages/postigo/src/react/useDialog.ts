import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { focusFirst, lockScroll, pushLayer, trapFocus } from '../core/index.js';
import type { CloseProps, DialogProps, DialogRole, OpenChangeReason, TitleProps, TriggerProps } from './props.js';

export interface UseDialogOptions {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: OpenChangeReason) => void;
    role?: DialogRole;
    modal?: boolean;
    label?: string;
    describedBy?: boolean;
    initialFocus?: RefObject<HTMLElement | null>;
    returnFocus?: boolean | RefObject<HTMLElement | null>;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
}

export interface UseDialog {
    open: boolean;
    setOpen(open: boolean): void;
    close(): void;
    getTriggerProps(): TriggerProps;
    getDialogProps(): DialogProps;
    getTitleProps(): TitleProps;
    getDescriptionProps(): TitleProps;
    getCloseProps(): CloseProps;
}

const focusable = (element: Element | null): element is HTMLElement => element instanceof HTMLElement && element.isConnected;

export const useDialog = (options: UseDialogOptions = {}): UseDialog => {
    const [inner, setInner] = useState(options.defaultOpen ?? false);
    const controlled = options.open !== undefined;
    const open = controlled ? options.open === true : inner;
    const modal = options.modal ?? true;
    const id = useId();
    const dialog = useRef<HTMLElement | null>(null);
    const trigger = useRef<HTMLElement | null>(null);
    const settings = useRef(options);

    useLayoutEffect(() => {
        settings.current = options;
    });

    const change = useCallback((next: boolean, reason: OpenChangeReason) => {
        if (!controlled) setInner(next);
        settings.current.onOpenChange?.(next, reason);
    }, [controlled]);

    useEffect(() => {
        if (!open) return undefined;
        const previous = document.activeElement;
        const release = modal ? lockScroll() : () => undefined;
        const remove = pushLayer({
            element: () => dialog.current,
            ignore: () => [trigger.current],
            onEscape: (event) => {
                if (settings.current.closeOnEscape === false) return;
                event.preventDefault();
                change(false, 'escape');
            },
            onOutside: () => {
                if (settings.current.closeOnOutsideClick !== false) change(false, 'outside');
            },
        });
        if (dialog.current) focusFirst(dialog.current, settings.current.initialFocus?.current);
        return () => {
            remove();
            release();
            const { returnFocus } = settings.current;
            if (returnFocus === false) return;
            const target = typeof returnFocus === 'object' ? returnFocus.current : previous;
            if (focusable(target)) target.focus();
        };
    }, [open, modal, change]);

    const setDialog = useCallback((element: HTMLElement | null) => {
        dialog.current = element;
    }, []);
    const setTrigger = useCallback((element: HTMLElement | null) => {
        trigger.current = element;
    }, []);
    const close = useCallback(() => change(false, 'close'), [change]);
    const setOpen = useCallback((next: boolean) => change(next, next ? 'trigger' : 'close'), [change]);
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;

    return {
        open,
        setOpen,
        close,
        getTriggerProps: () => ({
            ref: setTrigger,
            type: 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            ...(open ? { 'aria-controls': id } : {}),
            onClick: () => change(!open, open ? 'close' : 'trigger'),
        }),
        getDialogProps: () => ({
            ref: setDialog,
            id,
            role: options.role ?? 'dialog',
            tabIndex: -1,
            ...(modal ? { 'aria-modal': true as const } : {}),
            ...(options.label === undefined ? { 'aria-labelledby': titleId } : { 'aria-label': options.label }),
            ...(options.describedBy ? { 'aria-describedby': descriptionId } : {}),
            'data-state': open ? 'open' : 'closed',
            onKeyDown: (event) => {
                const container = event.currentTarget;
                if (!modal || !(container instanceof HTMLElement) || !container.contains(event.target as Node)) return;
                trapFocus(container, event);
            },
        }),
        getTitleProps: () => ({ id: titleId }),
        getDescriptionProps: () => ({ id: descriptionId }),
        getCloseProps: () => ({ type: 'button', onClick: close }),
    };
};
