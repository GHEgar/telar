import type { FocusEvent, ReactNode, RefCallback } from 'react';
import type { Priority, ToastState } from '../core/index.js';

export interface ToasterLabels {
    region: string;
    close: string;
}

export const DEFAULT_LABELS: ToasterLabels = {
    region: 'Notifications',
    close: 'Dismiss',
};

export interface ViewportProps {
    ref: RefCallback<HTMLElement>;
    role: 'region';
    'aria-label': string;
    tabIndex: -1;
    'data-paused'?: true;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: (event: FocusEvent) => void;
}

export interface ToastProps {
    ref: RefCallback<HTMLElement>;
    id: string;
    'aria-labelledby': string;
    'aria-describedby'?: string;
    'data-state': ToastState;
    'data-priority': Priority;
    'data-index': number;
    'data-paused'?: true;
}

export interface TextProps {
    id: string;
}

export interface CloseProps {
    type: 'button';
    'aria-label': string;
    onClick: () => void;
}

export interface ActionProps {
    type: 'button';
    onClick: () => void;
}

export interface AnnouncerProps {
    role: 'status' | 'alert';
    'aria-live': Priority;
    'aria-atomic': true;
    children: ReactNode;
}

export const domId = (base: string, id: string, part: string): string => `${base}-${id.replace(/[^\w-]/g, '_')}-${part}`;
