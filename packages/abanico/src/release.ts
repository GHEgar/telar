import type { Point } from './radial.js';

export interface RightPress {
    x: number;
    y: number;
    time: number;
    down: boolean;
    moved: boolean;
    requested: boolean;
}

export interface RightPressStep {
    press: RightPress | null;
    open?: Point;
    fallback?: true;
}

interface PressEvent {
    button: number;
    pointerType: string;
    clientX: number;
    clientY: number;
}

export const RELEASE_TOLERANCE = 6;
export const RELEASE_WINDOW = 1000;

const pointOf = (press: RightPress): Point => ({ x: press.x, y: press.y });

export const rightPress = {
    down(current: RightPress | null, event: PressEvent, now: number): RightPress | null {
        if (event.button !== 2 || event.pointerType !== 'mouse') return current;
        return { x: event.clientX, y: event.clientY, time: now, down: true, moved: false, requested: false };
    },
    move(current: RightPress | null, event: Pick<PressEvent, 'clientX' | 'clientY'>): RightPress | null {
        if (!current?.down || current.moved) return current;
        if (Math.hypot(event.clientX - current.x, event.clientY - current.y) <= RELEASE_TOLERANCE) return current;
        return { ...current, moved: true };
    },
    up(current: RightPress | null, event: Pick<PressEvent, 'button'>): RightPressStep {
        if (event.button !== 2 || !current) return { press: current };
        if (current.requested) return current.moved ? { press: null } : { press: null, open: pointOf(current) };
        return { press: { ...current, down: false } };
    },
    contextMenu(current: RightPress | null, event: Pick<PressEvent, 'clientX' | 'clientY'>, now: number): RightPressStep {
        const keyboard = event.clientX === 0 && event.clientY === 0;
        if (!current || keyboard || now - current.time > RELEASE_WINDOW) return { press: null, fallback: true };
        if (current.down) return { press: { ...current, requested: true } };
        return current.moved ? { press: null } : { press: null, open: pointOf(current) };
    },
};
