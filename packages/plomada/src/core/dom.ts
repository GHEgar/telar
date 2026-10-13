import type { Rect, Size } from './compute.js';

export const rectOf = (element: Element): Rect => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { left, top, width, height };
};

export const sizeOf = (element: HTMLElement): Size => ({ width: element.offsetWidth, height: element.offsetHeight });

export const viewportRect = (): Rect => {
    const visual = window.visualViewport;
    if (visual) return { left: visual.offsetLeft, top: visual.offsetTop, width: visual.width, height: visual.height };
    return { left: 0, top: 0, width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
};

export const autoUpdate = (reference: Element, floating: HTMLElement, update: () => void): (() => void) => {
    let frame = 0;
    const schedule = (): void => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = 0;
            update();
        });
    };
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(reference);
    observer?.observe(floating);
    update();
    return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener('scroll', schedule, { capture: true });
        window.removeEventListener('resize', schedule);
        window.visualViewport?.removeEventListener('resize', schedule);
        observer?.disconnect();
    };
};

const clips = (element: Element): boolean => {
    const { overflow, overflowX, overflowY } = getComputedStyle(element);
    return /auto|scroll|hidden|clip/.test(`${overflow}${overflowX}${overflowY}`);
};

export const isReferenceHidden = (reference: Element): boolean => {
    const rect = reference.getBoundingClientRect();
    const view = viewportRect();
    let left = view.left;
    let top = view.top;
    let right = view.left + view.width;
    let bottom = view.top + view.height;
    for (let node = reference.parentElement; node && node !== document.body; node = node.parentElement) {
        if (!clips(node)) continue;
        const box = node.getBoundingClientRect();
        left = Math.max(left, box.left);
        top = Math.max(top, box.top);
        right = Math.min(right, box.right);
        bottom = Math.min(bottom, box.bottom);
    }
    return rect.right <= left || rect.left >= right || rect.bottom <= top || rect.top >= bottom;
};

export const offsetOrigin = (floating: HTMLElement): { left: number; top: number } => {
    const parent = floating.offsetParent;
    if (!(parent instanceof HTMLElement)) return { left: 0, top: 0 };
    const box = parent.getBoundingClientRect();
    return { left: box.left + parent.clientLeft - parent.scrollLeft, top: box.top + parent.clientTop - parent.scrollTop };
};
