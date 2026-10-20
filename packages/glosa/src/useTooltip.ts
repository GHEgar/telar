import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from 'react';
import { usePosition, type FloatingProps, type Position, type ReferenceProps, type UsePositionOptions } from '@npmegar/plomada/react';
import { mergeTriggerProps, type MergedRefCache } from './merge.js';

const WARM_UP = 300;
let lastClosed = Number.NEGATIVE_INFINITY;

export interface UseTooltipOptions extends Omit<UsePositionOptions, 'open' | 'sameWidth'> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    delay?: number;
    closeDelay?: number;
    disabled?: boolean;
}

export interface TooltipTriggerProps extends ReferenceProps {
    'aria-describedby'?: string;
    onPointerEnter: (event: PointerEvent) => void;
    onPointerLeave: () => void;
    onPointerDown: () => void;
    onFocus: (event: FocusEvent) => void;
    onBlur: () => void;
}

export type MergedTriggerProps<P extends object> = Omit<P, keyof TooltipTriggerProps> & TooltipTriggerProps;

export interface TooltipProps extends FloatingProps {
    id: string;
    role: 'tooltip';
    'data-state': 'open' | 'closed';
    onPointerEnter: () => void;
    onPointerLeave: () => void;
}

export interface UseTooltip {
    open: boolean;
    position: Position | null;
    arrowStyles: CSSProperties;
    show(): void;
    hide(): void;
    getTriggerProps(): TooltipTriggerProps;
    getTriggerProps<P extends object>(props: P): MergedTriggerProps<P>;
    getTooltipProps(): TooltipProps;
}

const focusVisible = (element: Element): boolean => {
    try {
        return element.matches(':focus-visible');
    } catch {
        return true;
    }
};

export const useTooltip = (options: UseTooltipOptions = {}): UseTooltip => {
    const { delay = 600, closeDelay = 150, disabled = false, defaultOpen, open: controlled, onOpenChange, ...placementOptions } = options;
    const id = useId();
    const [inner, setInner] = useState(defaultOpen ?? false);
    const open = !disabled && (controlled ?? inner);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const current = useRef(open);
    const notify = useRef(onOpenChange);
    const [refs] = useState<MergedRefCache>(() => new WeakMap());

    useLayoutEffect(() => {
        current.current = open;
        notify.current = onOpenChange;
    });

    const set = useCallback((next: boolean) => {
        clearTimeout(timer.current);
        if (next === current.current) return;
        if (!next) lastClosed = Date.now();
        current.current = next;
        setInner(next);
        notify.current?.(next);
    }, []);

    const schedule = useCallback((next: boolean, wait: number) => {
        clearTimeout(timer.current);
        if (next === current.current) return;
        if (wait <= 0) set(next);
        else timer.current = setTimeout(() => set(next), wait);
    }, [set]);

    const show = useCallback((instant = false) => {
        schedule(true, instant || Date.now() - lastClosed < WARM_UP ? 0 : delay);
    }, [schedule, delay]);
    const hide = useCallback(() => schedule(false, closeDelay), [schedule, closeDelay]);

    useEffect(() => () => clearTimeout(timer.current), []);

    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            set(false);
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [open, set]);

    const position = usePosition({ placement: 'top', ...placementOptions, open });

    return {
        open,
        position: position.position,
        arrowStyles: position.arrowStyles,
        show: () => show(true),
        hide: () => set(false),
        getTriggerProps: <P extends object>(props?: P) => {
            const own: TooltipTriggerProps = {
                ...position.getReferenceProps(),
                ...(open ? { 'aria-describedby': id } : {}),
                onPointerEnter: (event) => {
                    if (event.pointerType !== 'touch' && !disabled) show();
                },
                onPointerLeave: hide,
                onPointerDown: () => set(false),
                onFocus: (event) => {
                    if (!disabled && focusVisible(event.currentTarget)) show(true);
                },
                onBlur: () => set(false),
            };
            if (!props) return own;
            return mergeTriggerProps(props as Record<string, unknown>, own as unknown as Record<string, unknown>, refs) as unknown as MergedTriggerProps<P>;
        },
        getTooltipProps: () => ({
            ...position.getFloatingProps(),
            id,
            role: 'tooltip',
            'data-state': open ? 'open' : 'closed',
            onPointerEnter: () => clearTimeout(timer.current),
            onPointerLeave: hide,
        }),
    };
};
