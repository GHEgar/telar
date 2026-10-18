import { describe, expect, it } from 'vitest';
import { tonoPorHora } from '../src/index.js';

describe('tonoPorHora', () => {
    it.each([
        [7, 'dia'],
        [12, 'dia'],
        [17.49, 'dia'],
        [17.5, 'tarde'],
        [19.99, 'tarde'],
        [6, 'tarde'],
        [6.5, 'tarde'],
        [20, 'noche'],
        [0, 'noche'],
        [5.99, 'noche'],
        [23.5, 'noche'],
    ] as const)('%s h is %s', (horas, tono) => {
        expect(tonoPorHora(horas)).toBe(tono);
    });

    it('wraps around the day', () => {
        expect(tonoPorHora(36)).toBe('dia');
        expect(tonoPorHora(-5)).toBe('tarde');
        expect(tonoPorHora(24)).toBe('noche');
    });

    it('falls back to noche for a number that is not finite', () => {
        expect(tonoPorHora(Number.NaN)).toBe('noche');
    });
});
