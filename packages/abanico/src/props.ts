import type { KeyboardEvent, RefCallback } from 'react';
import type { FloatingProps } from '@ghegar/plomada/react';

export interface MenuButtonProps {
    ref: RefCallback<Element>;
    id: string;
    type: 'button';
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    'aria-controls'?: string;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
}

export interface MenuProps extends FloatingProps {
    id: string;
    role: 'menu';
    tabIndex: -1;
    'aria-labelledby': string;
    'data-state': 'open' | 'closed';
    onKeyDown: (event: KeyboardEvent) => void;
}

export type ItemRole = 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';

export interface MenuItemProps {
    ref: RefCallback<HTMLElement>;
    role: ItemRole;
    'aria-checked'?: boolean;
    tabIndex: 0 | -1;
    'aria-disabled'?: true;
    'data-active'?: true;
    'data-disabled'?: true;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
    onFocus: () => void;
    onPointerMove: () => void;
}

export interface SubmenuTriggerProps extends MenuItemProps {
    id: string;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    'aria-controls'?: string;
}

export interface SeparatorProps {
    role: 'separator';
}

export interface GroupProps {
    role: 'group';
    'aria-label': string;
}
