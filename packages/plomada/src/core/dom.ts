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
