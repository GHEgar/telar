import type { KeyboardEvent, RefCallback } from 'react';

export type DialogRole = 'dialog' | 'alertdialog';

export type OpenChangeReason = 'trigger' | 'escape' | 'outside' | 'close';

export interface TriggerProps {
    ref: RefCallback<HTMLElement>;
    type: 'button';
    'aria-haspopup': 'dialog';
    'aria-expanded': boolean;
    'aria-controls'?: string;
    onClick: () => void;
}

export interface DialogProps {
    ref: RefCallback<HTMLElement>;
    id: string;
    role: DialogRole;
    tabIndex: -1;
    'aria-modal'?: true;
    'aria-labelledby'?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
    'data-state': 'open' | 'closed';
    onKeyDown: (event: KeyboardEvent) => void;
}

export interface TitleProps {
    id: string;
}

export interface CloseProps {
    type: 'button';
    onClick: () => void;
}
