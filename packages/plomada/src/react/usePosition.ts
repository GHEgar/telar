import { useCallback, useLayoutEffect, useState, type CSSProperties, type RefCallback } from 'react';
import {
    autoUpdate, computePosition, isReferenceHidden, offsetOrigin, rectOf, sizeOf, viewportRect,
    type Align, type Placement, type Position, type PositionOptions, type Side,
} from '../core/index.js';

export type Strategy = 'fixed' | 'absolute';

export interface UsePositionOptions extends PositionOptions {
    open?: boolean;
    sameWidth?: boolean;
    strategy?: Strategy;
    hide?: boolean;
}

export interface FloatingProps {
    ref: RefCallback<HTMLElement>;
    style: CSSProperties;
    'data-side'?: Side;
    'data-align'?: Align;
    'data-placement'?: Placement;
    'data-reference-hidden'?: true;
}

export interface ReferenceProps {
    ref: RefCallback<Element>;
}

export interface UsePosition {
    position: Position | null;
    referenceHidden: boolean;
    referenceWidth: number;
    setReference: RefCallback<Element>;
    setFloating: RefCallback<HTMLElement>;
    floatingStyles: CSSProperties;
    arrowStyles: CSSProperties;
    getReferenceProps(): ReferenceProps;
    getFloatingProps(): FloatingProps;
}

interface Placed extends Position {
    originLeft: number;
    originTop: number;
    hidden: boolean;
}

const samePosition = (a: Placed | null, b: Placed): boolean => !!a
    && a.originLeft === b.originLeft && a.originTop === b.originTop && a.hidden === b.hidden
    && a.x === b.x && a.y === b.y && a.placement === b.placement
    && a.availableWidth === b.availableWidth && a.availableHeight === b.availableHeight
    && a.arrow.x === b.arrow.x && a.arrow.y === b.arrow.y;

export const usePosition = (options: UsePositionOptions = {}): UsePosition => {
    const { open = true, sameWidth = false, strategy = 'fixed', hide = false, placement, offset, padding, flip, shift, arrowPadding } = options;
    const [reference, setReference] = useState<Element | null>(null);
    const [floating, setFloating] = useState<HTMLElement | null>(null);
    const [placed, setPlaced] = useState<Placed | null>(null);
    const [referenceWidth, setReferenceWidth] = useState(0);

    useLayoutEffect(() => {
        if (!open || !reference || !floating) return undefined;
        const settings: PositionOptions = {
            ...(placement === undefined ? {} : { placement }),
            ...(offset === undefined ? {} : { offset }),
            ...(padding === undefined ? {} : { padding }),
            ...(flip === undefined ? {} : { flip }),
            ...(shift === undefined ? {} : { shift }),
            ...(arrowPadding === undefined ? {} : { arrowPadding }),
        };
        return autoUpdate(reference, floating, () => {
            const rect = rectOf(reference);
            const origin = strategy === 'absolute' ? offsetOrigin(floating) : { left: 0, top: 0 };
            const next: Placed = {
                ...computePosition(rect, sizeOf(floating), viewportRect(), settings),
                originLeft: Math.round(origin.left),
                originTop: Math.round(origin.top),
                hidden: isReferenceHidden(reference),
            };
            setPlaced((current) => (samePosition(current, next) ? current : next));
            setReferenceWidth(Math.round(rect.width));
        });
    }, [open, reference, floating, placement, offset, padding, flip, shift, arrowPadding, strategy]);

    const position: Position | null = placed;
    const referenceHidden = placed?.hidden ?? false;

    const floatingStyles: CSSProperties = placed
        ? {
            position: strategy,
            left: placed.x - placed.originLeft,
            top: placed.y - placed.originTop,
            ...(sameWidth ? { width: referenceWidth } : {}),
            ...(hide && placed.hidden ? { visibility: 'hidden' } : {}),
        }
        : { position: strategy, left: 0, top: 0, visibility: 'hidden' };
    const arrowStyles: CSSProperties = position?.arrow.x !== null && position?.arrow.x !== undefined
        ? { position: 'absolute', left: position.arrow.x }
        : { position: 'absolute', top: position?.arrow.y ?? 0 };
    const setFloatingElement = useCallback((element: HTMLElement | null) => setFloating(element), []);
    const setReferenceElement = useCallback((element: Element | null) => setReference(element), []);

    return {
        position,
        referenceHidden,
        referenceWidth,
        setReference: setReferenceElement,
        setFloating: setFloatingElement,
        floatingStyles,
        arrowStyles,
        getReferenceProps: () => ({ ref: setReferenceElement }),
        getFloatingProps: () => ({
            ref: setFloatingElement,
            style: floatingStyles,
            ...(position ? { 'data-side': position.side, 'data-align': position.align, 'data-placement': position.placement } : {}),
            ...(referenceHidden ? { 'data-reference-hidden': true as const } : {}),
        }),
    };
};
