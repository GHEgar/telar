import type { KeyboardEvent, PointerEvent, RefCallback } from 'react';
import type { Orientation } from '../core/index.js';

export interface RootProps {
    'data-orientation': Orientation;
    'data-disabled'?: true;
    'data-dragging'?: true;
    'data-range'?: true;
}

export interface LabelProps {
    id: string;
    onClick: () => void;
}

export interface TrackProps {
    ref: RefCallback<HTMLElement>;
    'data-orientation': Orientation;
    'data-disabled'?: true;
    onPointerDown: (event: PointerEvent) => void;
}

export interface RangeProps {
    'data-orientation': Orientation;
    'data-draggable'?: true;
    'data-dragging'?: true;
    onPointerDown: (event: PointerEvent) => void;
}

export interface ThumbProps {
    ref: RefCallback<HTMLElement>;
    role: 'slider';
    tabIndex: 0;
    'aria-valuenow': number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-valuetext'?: string;
    'aria-orientation': Orientation;
    'aria-disabled'?: true;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'data-thumb': number;
    'data-orientation': Orientation;
    'data-dragging'?: true;
    'data-disabled'?: true;
    onKeyDown: (event: KeyboardEvent) => void;
    onPointerDown: (event: PointerEvent) => void;
}

export interface Box {
    left: number;
    top: number;
    width: number;
    height: number;
}

export const ratioFromPoint = (box: Box, x: number, y: number, orientation: Orientation): number => {
    const length = orientation === 'vertical' ? box.height : box.width;
    if (length <= 0) return 0;
    const offset = orientation === 'vertical' ? box.top + box.height - y : x - box.left;
    return Math.min(Math.max(offset / length, 0), 1);
};
