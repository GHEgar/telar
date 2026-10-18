export interface PressStart {
    pointerId: number;
    pointerType: string;
    clientX: number;
    clientY: number;
}

export interface PressOptions {
    vertical: boolean;
    touchDelay: number;
    threshold: number;
    tolerance: number;
    onStart(): boolean;
    onMove(delta: number): void;
    onEnd(): void;
    onCancel(): void;
    onFinish(): void;
}

const preventScroll = (event: TouchEvent): void => event.preventDefault();

export const startPress = (start: PressStart, options: PressOptions): (() => void) => {
    const touch = start.pointerType === 'touch';
    let started = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (): void => {
        if (timer !== null) clearTimeout(timer);
        timer = null;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onCancel);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('keydown', onKey, true);
        options.onFinish();
    };

    const begin = (): void => {
        timer = null;
        if (!options.onStart()) {
            cleanup();
            return;
        }
        started = true;
        if (touch) document.addEventListener('touchmove', preventScroll, { passive: false });
        document.addEventListener('keydown', onKey, true);
    };

    function onMove(event: PointerEvent): void {
        if (event.pointerId !== start.pointerId) return;
        const dx = event.clientX - start.clientX;
        const dy = event.clientY - start.clientY;
        if (!started) {
            const distance = Math.hypot(dx, dy);
            if (touch && distance > options.tolerance) cleanup();
            else if (!touch && distance >= options.threshold) begin();
            if (!started) return;
        }
        options.onMove(options.vertical ? dy : dx);
    }

    function onUp(event: PointerEvent): void {
        if (event.pointerId !== start.pointerId) return;
        cleanup();
        if (started) options.onEnd();
    }

    function onCancel(): void {
        cleanup();
        if (started) options.onCancel();
    }

    function onKey(event: KeyboardEvent): void {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        onCancel();
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
    if (touch) timer = setTimeout(begin, options.touchDelay);
    return () => {
        const wasStarted = started;
        cleanup();
        if (wasStarted) options.onCancel();
    };
};
