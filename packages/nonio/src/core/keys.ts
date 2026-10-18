export interface KeyContext {
    low: number;
    high: number;
    step: number;
    pageStep: number;
    shift?: boolean;
}

export type KeyResult = { value: number; exact: boolean } | null;

export const keyValue = (key: string, current: number, { low, high, step, pageStep, shift = false }: KeyContext): KeyResult => {
    const arrow = shift ? pageStep : step;
    switch (key) {
        case 'ArrowRight':
        case 'ArrowUp': return { value: current + arrow, exact: false };
        case 'ArrowLeft':
        case 'ArrowDown': return { value: current - arrow, exact: false };
        case 'PageUp': return { value: current + pageStep, exact: false };
        case 'PageDown': return { value: current - pageStep, exact: false };
        case 'Home': return { value: low, exact: true };
        case 'End': return { value: high, exact: true };
        default: return null;
    }
};
