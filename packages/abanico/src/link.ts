import type { MenuItemProps } from './props.js';

export interface MenuLink {
    open: boolean;
    activeIndex: number;
    closeAll(): void;
    register(contains: (node: Node) => boolean): () => void;
    itemProps(index: number): MenuItemProps;
}

export interface MenuParent {
    link: MenuLink;
    index: number;
}

export type ItemKind = 'item' | 'checkbox' | 'radio';

export interface ItemOptions {
    type?: ItemKind;
    checked?: boolean;
    soon?: boolean;
}

export const ROLES = { item: 'menuitem', checkbox: 'menuitemcheckbox', radio: 'menuitemradio' } as const;
