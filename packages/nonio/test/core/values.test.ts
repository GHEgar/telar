import { describe, expect, it } from 'vitest';
import { keyValue, percentOf, snap, valueAt } from '@npmegar/nonio';

describe('values', () => {
    it('snaps to the step from min without float noise', () => {
        expect(snap(0.3000001, 0, 1, 0.1)).toBe(0.3);
        expect(snap(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
        expect(snap(7, 1, 20, 5)).toBe(6);
        expect(snap(-4, 0, 10, 1)).toBe(0);
        expect(snap(9.9, 0, 10, 3)).toBe(10);
        expect(snap(8.9, 0, 10, 3)).toBe(9);
    });

    it('converts between values, ratios and percents', () => {
        expect(percentOf(25, 0, 200)).toBe(12.5);
        expect(percentOf(5, 5, 5)).toBe(0);
        expect(valueAt(0.5, 10, 20)).toBe(15);
        expect(valueAt(2, 10, 20)).toBe(20);
    });

    it('maps keys to the next value', () => {
        const context = { low: 0, high: 100, step: 1, pageStep: 10 };
        expect(keyValue('ArrowUp', 5, context)).toEqual({ value: 6, exact: false });
        expect(keyValue('ArrowLeft', 5, context)).toEqual({ value: 4, exact: false });
        expect(keyValue('ArrowRight', 5, { ...context, shift: true })).toEqual({ value: 15, exact: false });
        expect(keyValue('PageDown', 5, context)).toEqual({ value: -5, exact: false });
        expect(keyValue('End', 5, context)).toEqual({ value: 100, exact: true });
        expect(keyValue('a', 5, context)).toBeNull();
    });
});
