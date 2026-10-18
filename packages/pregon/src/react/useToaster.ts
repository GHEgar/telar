import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createToaster, type DismissReason, type Priority, type Toaster, type ToasterOptions, type ToasterSnapshot, type ToastInput } from '../core/index.js';
import {
    DEFAULT_LABELS, domId, type ActionProps, type AnnouncerProps, type CloseProps, type TextProps, type ToasterLabels,
    type ToastProps, type ViewportProps,
} from './props.js';

export interface UseToasterOptions<D = unknown> extends ToasterOptions {
    toaster?: Toaster<D>;
    closeOnEscape?: boolean;
    pauseOnHover?: boolean;
    pauseOnFocus?: boolean;
    pauseOnPageHidden?: boolean;
    labels?: Partial<ToasterLabels>;
}

export interface UseToaster<D = unknown> extends ToasterSnapshot<D> {
    toaster: Toaster<D>;
    show(toast: ToastInput<D>): string;
    dismiss(id?: string, reason?: DismissReason): void;
    getViewportProps(): ViewportProps;
    getToastProps(id: string): ToastProps;
    getTitleProps(id: string): TextProps;
    getDescriptionProps(id: string): TextProps;
    getCloseProps(id: string): CloseProps;
    getActionProps(id: string): ActionProps;
    getAnnouncerProps(priority: Priority): AnnouncerProps;
}

export const useToaster = <D = unknown>(options: UseToasterOptions<D> = {}): UseToaster<D> => {
    const { limit, duration, exit, closeOnEscape = false, pauseOnHover = true, pauseOnFocus = true, pauseOnPageHidden = true } = options;
    const [own] = useState(() => (options.toaster ? null : createToaster<D>({ limit, duration, exit } as ToasterOptions)));
    const toaster = options.toaster ?? own as Toaster<D>;
    const snapshot = useSyncExternalStore(toaster.subscribe, toaster.getSnapshot, toaster.getSnapshot);
    const base = useId();
    const viewport = useRef<HTMLElement | null>(null);
    const elements = useRef(new Map<string, HTMLElement>());
    const labels = { ...DEFAULT_LABELS, ...options.labels };

    useEffect(() => {
        own?.update({ limit, duration, exit } as ToasterOptions);
    }, [own, limit, duration, exit]);

    useEffect(() => () => own?.destroy(), [own]);

    useEffect(() => {
        if (!pauseOnPageHidden) return undefined;
        const sync = (): void => {
            if (document.hidden) toaster.pause('hidden');
            else toaster.resume('hidden');
        };
        sync();
        document.addEventListener('visibilitychange', sync);
        return () => {
            document.removeEventListener('visibilitychange', sync);
            toaster.resume('hidden');
        };
    }, [toaster, pauseOnPageHidden]);

    useEffect(() => {
        if (!viewport.current?.contains(document.activeElement)) toaster.resume('focus');
    }, [toaster, snapshot.toasts]);

    const dismiss = useCallback((id?: string, reason: DismissReason = 'api') => {
        const active = document.activeElement;
        const held = id === undefined
            ? !!active && !!viewport.current?.contains(active) && active !== viewport.current
            : !!active && !!elements.current.get(id)?.contains(active);
        toaster.dismiss(id, reason);
        if (held) viewport.current?.focus();
    }, [toaster]);

    useEffect(() => {
        if (!closeOnEscape) return undefined;
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape' || event.defaultPrevented) return;
            const last = toaster.getSnapshot().toasts.filter((toast) => toast.state === 'open').at(-1);
            if (!last) return;
            event.preventDefault();
            dismiss(last.id, 'escape');
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [toaster, closeOnEscape, dismiss]);

    const find = (id: string) => snapshot.toasts.find((toast) => toast.id === id);
    const paused = snapshot.paused ? { 'data-paused': true as const } : {};

    return {
        ...snapshot,
        toaster,
        show: toaster.show,
        dismiss,
        getViewportProps: () => ({
            ref: (element: HTMLElement | null) => {
                viewport.current = element;
            },
            role: 'region',
            'aria-label': labels.region,
            tabIndex: -1,
            ...paused,
            onPointerEnter: () => {
                if (pauseOnHover) toaster.pause('hover');
            },
            onPointerLeave: () => toaster.resume('hover'),
            onFocus: () => {
                if (pauseOnFocus) toaster.pause('focus');
            },
            onBlur: (event) => {
                if (!viewport.current?.contains(event.relatedTarget as Node | null)) toaster.resume('focus');
            },
        }),
        getToastProps: (id) => {
            const toast = find(id);
            return {
                ref: (element: HTMLElement | null) => {
                    if (element) elements.current.set(id, element);
                    else elements.current.delete(id);
                },
                id: domId(base, id, 'toast'),
                'aria-labelledby': domId(base, id, 'title'),
                ...(toast?.description ? { 'aria-describedby': domId(base, id, 'description') } : {}),
                'data-state': toast?.state ?? 'closed',
                'data-priority': toast?.priority ?? 'polite',
                'data-index': snapshot.toasts.findIndex((item) => item.id === id),
                ...paused,
            };
        },
        getTitleProps: (id) => ({ id: domId(base, id, 'title') }),
        getDescriptionProps: (id) => ({ id: domId(base, id, 'description') }),
        getCloseProps: (id) => ({
            type: 'button',
            'aria-label': labels.close,
            onClick: () => dismiss(id, 'close'),
        }),
        getActionProps: (id) => ({
            type: 'button',
            onClick: () => {
                find(id)?.action?.onAction?.();
                dismiss(id, 'action');
            },
        }),
        getAnnouncerProps: (priority) => ({
            role: priority === 'assertive' ? 'alert' : 'status',
            'aria-live': priority,
            'aria-atomic': true,
            children: snapshot.announcements[priority],
        }),
    };
};
