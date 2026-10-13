import { addDays, addMonths, endOfWeek, startOfWeek, type IsoDate } from './date.js';
import type { KeyModifiers } from './types.js';

export type KeyAction = { type: 'move'; to: IsoDate } | { type: 'select' } | null;

export const resolveKey = (focused: IsoDate, key: string, modifiers: KeyModifiers = {}): KeyAction => {
    const move = (to: IsoDate): KeyAction => ({ type: 'move', to });
    switch (key) {
        case 'ArrowLeft': return move(addDays(focused, -1));
        case 'ArrowRight': return move(addDays(focused, 1));
        case 'ArrowUp': return move(addDays(focused, -7));
        case 'ArrowDown': return move(addDays(focused, 7));
        case 'Home': return move(startOfWeek(focused));
        case 'End': return move(endOfWeek(focused));
        case 'PageUp': return move(addMonths(focused, modifiers.shiftKey ? -12 : -1));
        case 'PageDown': return move(addMonths(focused, modifiers.shiftKey ? 12 : 1));
        case 'Enter':
        case ' ': return { type: 'select' };
        default: return null;
    }
};

export type ChipAction =
    | { type: 'step'; by: number }
    | { type: 'edge'; to: 'first' | 'last' }
    | { type: 'select' }
    | { type: 'close' }
    | null;

const CHIP_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };

export const resolveChipKey = (key: string, page: number): ChipAction => {
    const step = CHIP_STEPS[key];
    if (step !== undefined) return { type: 'step', by: step };
    switch (key) {
        case 'PageUp': return { type: 'step', by: -page };
        case 'PageDown': return { type: 'step', by: page };
        case 'Home': return { type: 'edge', to: 'first' };
        case 'End': return { type: 'edge', to: 'last' };
        case 'Enter':
        case ' ': return { type: 'select' };
        case 'Escape': return { type: 'close' };
        default: return null;
    }
};
