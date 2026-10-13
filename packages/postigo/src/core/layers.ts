export interface Layer {
    element(): HTMLElement | null;
    onEscape?(event: KeyboardEvent): void;
    onOutside?(event: PointerEvent): void;
    ignore?(): readonly (Element | null)[];
}

const stack: Layer[] = [];

const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    stack.at(-1)?.onEscape?.(event);
};

const onPointerDown = (event: PointerEvent): void => {
    const top = stack.at(-1);
    if (!top) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (top.element()?.contains(target)) return;
    if (top.ignore?.().some((element) => element?.contains(target))) return;
    top.onOutside?.(event);
};

const install = (on: boolean): void => {
    if (on) {
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown, true);
        return;
    }
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('pointerdown', onPointerDown, true);
};

export const pushLayer = (layer: Layer): (() => void) => {
    stack.push(layer);
    if (stack.length === 1) install(true);
    return () => {
        const index = stack.indexOf(layer);
        if (index < 0) return;
        stack.splice(index, 1);
        if (stack.length === 0) install(false);
    };
};

export const isTopLayer = (layer: Layer): boolean => stack.at(-1) === layer;

export const layerCount = (): number => stack.length;
