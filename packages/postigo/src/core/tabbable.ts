const CANDIDATES = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'iframe',
    'summary',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    '[tabindex]',
].join(',');

export interface TabKeyEvent {
    key: string;
    shiftKey: boolean;
    preventDefault(): void;
}

const isTabbable = (element: HTMLElement): boolean => {
    if (element.tabIndex < 0) return false;
    if ((element as HTMLInputElement).disabled) return false;
    if (element instanceof HTMLInputElement && element.type === 'hidden') return false;
    if (element.closest('[hidden], [inert], fieldset[disabled]')) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
};

export const getTabbables = (container: HTMLElement): HTMLElement[] => Array.from(container.querySelectorAll<HTMLElement>(CANDIDATES)).filter(isTabbable);

export const focusFirst = (container: HTMLElement, preferred?: HTMLElement | null): void => {
    const target = preferred && container.contains(preferred) ? preferred : getTabbables(container)[0] ?? container;
    target.focus();
};

export const trapFocus = (container: HTMLElement, event: TabKeyEvent): boolean => {
    if (event.key !== 'Tab') return false;
    const tabbables = getTabbables(container);
    const first = tabbables[0];
    const last = tabbables.at(-1);
    const active = document.activeElement;
    if (!first || !last) {
        event.preventDefault();
        container.focus();
        return true;
    }
    const inside = active instanceof Node && container.contains(active);
    if (event.shiftKey && (!inside || active === first || active === container)) {
        event.preventDefault();
        last.focus();
        return true;
    }
    if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault();
        first.focus();
        return true;
    }
    return false;
};
