import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent, RefCallback } from 'react';
import type { FloatingProps } from '@ghegar/plomada/react';

export interface AnchorProps {
    ref: RefCallback<Element>;
}

export interface InputProps {
    ref: RefCallback<Element>;
    id: string;
    type: 'text';
    role: 'combobox';
    value: string;
    autoComplete: 'off';
    'aria-autocomplete': 'list';
    'aria-expanded': boolean;
    'aria-controls': string;
    'aria-activedescendant'?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: (event: FocusEvent<HTMLInputElement>) => void;
    onClick: () => void;
}

export interface ListboxProps extends FloatingProps {
    id: string;
    role: 'listbox';
    'aria-multiselectable'?: true;
    'aria-busy'?: true;
    onMouseDown: (event: MouseEvent) => void;
}

export interface OptionProps {
    id: string;
    role: 'option';
    'aria-selected': boolean;
    'aria-disabled'?: true;
    'data-active'?: true;
    'data-selected'?: true;
    'data-disabled'?: true;
    onClick: () => void;
    onMouseDown: (event: MouseEvent) => void;
    onPointerMove: () => void;
}

export interface GroupProps {
    role: 'group';
    'aria-labelledby': string;
}

export interface GroupLabelProps {
    id: string;
    role: 'presentation';
}

export interface ButtonProps {
    type: 'button';
    tabIndex: -1;
    'aria-label': string;
    onClick: () => void;
    onMouseDown: (event: MouseEvent) => void;
}

export interface StatusProps {
    role: 'status';
    'aria-live': 'polite';
    'aria-atomic': true;
}
