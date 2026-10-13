interface Saved {
    overflow: string;
    paddingRight: string;
}

let count = 0;
let saved: Saved | null = null;

const restore = (): void => {
    if (!saved) return;
    document.body.style.overflow = saved.overflow;
    document.body.style.paddingRight = saved.paddingRight;
    saved = null;
};

export const lockScroll = (): (() => void) => {
    if (typeof document === 'undefined') return () => undefined;
    if (count === 0) {
        const { body, documentElement } = document;
        const gap = window.innerWidth - documentElement.clientWidth;
        saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
        if (gap > 0) body.style.paddingRight = `calc(${getComputedStyle(body).paddingRight} + ${gap}px)`;
        body.style.overflow = 'hidden';
    }
    count += 1;
    let released = false;
    return () => {
        if (released) return;
        released = true;
        count -= 1;
        if (count === 0) restore();
    };
};

export const scrollLocks = (): number => count;
