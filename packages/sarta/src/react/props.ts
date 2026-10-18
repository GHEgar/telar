import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, RefCallback } from 'react';

export type Orientation = 'vertical' | 'horizontal';

export interface ListProps {
    'data-orientation': Orientation;
    'data-sorting'?: true;
}

export interface ItemProps {
    ref: RefCallback<HTMLElement>;
    'data-index': number;
    'data-dragging'?: true;
    'data-over'?: true;
}

export interface HandleProps {
    ref: RefCallback<HTMLElement>;
    type: 'button';
    tabIndex: 0 | -1;
    'aria-label': string;
    'aria-describedby': string;
    'aria-pressed': boolean;
    'aria-disabled'?: true;
    'data-active'?: true;
    'data-grabbed'?: true;
    onKeyDown: (event: KeyboardEvent) => void;
    onFocus: () => void;
    onBlur: (event: FocusEvent) => void;
    onPointerDown: (event: PointerEvent) => void;
    onContextMenu: (event: MouseEvent) => void;
}

export interface InstructionsProps {
    id: string;
    hidden: true;
    children: string;
}

export interface AnnouncerProps {
    role: 'status';
    'aria-live': 'assertive';
    'aria-atomic': true;
    children: string;
}
