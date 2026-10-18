export interface Timer {
    resume(): void;
    pause(): void;
    clear(): void;
    remaining(): number;
}

export const createTimer = (duration: number, onDone: () => void): Timer => {
    let remaining = duration;
    let started = 0;
    let handle: ReturnType<typeof setTimeout> | null = null;

    const pause = (): void => {
        if (handle === null) return;
        clearTimeout(handle);
        handle = null;
        remaining -= Date.now() - started;
    };

    return {
        resume() {
            if (handle !== null || !Number.isFinite(remaining)) return;
            started = Date.now();
            handle = setTimeout(() => {
                handle = null;
                remaining = 0;
                onDone();
            }, Math.max(remaining, 0));
        },
        pause,
        clear() {
            pause();
            remaining = 0;
        },
        remaining: () => (handle === null ? remaining : remaining - (Date.now() - started)),
    };
};
