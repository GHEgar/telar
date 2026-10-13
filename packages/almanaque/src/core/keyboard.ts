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
