export type Side = 'top' | 'right' | 'bottom' | 'left';

export type Align = 'start' | 'center' | 'end';

export type Placement = Side | `${Side}-${Exclude<Align, 'center'>}`;

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface PositionOptions {
    placement?: Placement;
    offset?: number;
    padding?: number;
    flip?: boolean;
    shift?: boolean;
    arrowPadding?: number;
}

export interface Position {
    x: number;
    y: number;
    side: Side;
    align: Align;
    placement: Placement;
    flipped: boolean;
    availableWidth: number;
    availableHeight: number;
    arrow: { x: number | null; y: number | null };
}

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export const parsePlacement = (placement: Placement): [Side, Align] => {
    const [side, align] = placement.split('-') as [Side, Align | undefined];
    return [side, align ?? 'center'];
};

const isVertical = (side: Side): boolean => side === 'top' || side === 'bottom';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, Math.max(min, max)));

const space = (side: Side, reference: Rect, viewport: Rect, offset: number, padding: number): number => {
    switch (side) {
        case 'bottom': return viewport.top + viewport.height - padding - (reference.top + reference.height) - offset;
        case 'top': return reference.top - viewport.top - padding - offset;
        case 'right': return viewport.left + viewport.width - padding - (reference.left + reference.width) - offset;
        case 'left': return reference.left - viewport.left - padding - offset;
    }
};

const alongAxis = (align: Align, start: number, length: number, size: number): number => {
    if (align === 'start') return start;
    if (align === 'end') return start + length - size;
    return start + length / 2 - size / 2;
};

const place = (side: Side, align: Align, reference: Rect, floating: Size, offset: number): { x: number; y: number } => {
    if (isVertical(side)) {
        const x = alongAxis(align, reference.left, reference.width, floating.width);
        const y = side === 'bottom' ? reference.top + reference.height + offset : reference.top - offset - floating.height;
        return { x, y };
    }
    const y = alongAxis(align, reference.top, reference.height, floating.height);
    const x = side === 'right' ? reference.left + reference.width + offset : reference.left - offset - floating.width;
    return { x, y };
};

export const computePosition = (reference: Rect, floating: Size, viewport: Rect, options: PositionOptions = {}): Position => {
    const { placement = 'bottom', offset = 8, padding = 8, flip = true, shift = true, arrowPadding = 8 } = options;
    const [preferred, align] = parsePlacement(placement);
    const need = isVertical(preferred) ? floating.height : floating.width;
    const room = space(preferred, reference, viewport, offset, padding);
    const other = space(OPPOSITE[preferred], reference, viewport, offset, padding);
    const side = flip && room < need && other > room ? OPPOSITE[preferred] : preferred;
    let { x, y } = place(side, align, reference, floating, offset);
    if (shift && isVertical(side)) x = clamp(x, viewport.left + padding, viewport.left + viewport.width - padding - floating.width);
    if (shift && !isVertical(side)) y = clamp(y, viewport.top + padding, viewport.top + viewport.height - padding - floating.height);
    const vertical = isVertical(side);
    const arrowX = vertical ? clamp(reference.left + reference.width / 2 - x, arrowPadding, floating.width - arrowPadding) : null;
    const arrowY = vertical ? null : clamp(reference.top + reference.height / 2 - y, arrowPadding, floating.height - arrowPadding);
    return {
        x: Math.round(x),
        y: Math.round(y),
        side,
        align,
        placement: (align === 'center' ? side : `${side}-${align}`) as Placement,
        flipped: side !== preferred,
        availableWidth: Math.max(0, vertical ? viewport.width - 2 * padding : space(side, reference, viewport, offset, padding)),
        availableHeight: Math.max(0, vertical ? space(side, reference, viewport, offset, padding) : viewport.height - 2 * padding),
        arrow: { x: arrowX === null ? null : Math.round(arrowX), y: arrowY === null ? null : Math.round(arrowY) },
    };
};
