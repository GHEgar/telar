import { describe, expect, it } from 'vitest';
import { filterItems, groupItems, highlight, matches, normalize } from '@ghegar/muestrario';

describe('filter helpers', () => {
    it('ignores accents, case and surrounding space', () => {
        expect(normalize('  Michoacán ')).toBe('michoacan');
        expect(matches('Querétaro', 'quere')).toBe(true);
        expect(filterItems(['León', 'Lagos', 'Tala'], 'LE', (item) => item)).toEqual(['León']);
        expect(filterItems(['a', 'b'], '  ', (item) => item)).toEqual(['a', 'b']);
    });

    it('highlights every match on the original text', () => {
        expect(highlight('San Andrés', 'an')).toEqual([
            { text: 'S', match: false },
            { text: 'an', match: true },
            { text: ' ', match: false },
            { text: 'An', match: true },
            { text: 'drés', match: false },
        ]);
        expect(highlight('Querétaro', 'ret')).toEqual([
            { text: 'Que', match: false },
            { text: 'rét', match: true },
            { text: 'aro', match: false },
        ]);
        expect(highlight('Tala', '')).toEqual([{ text: 'Tala', match: false }]);
    });

    it('groups keeping first appearance and numbers options in visual order', () => {
        const groups = groupItems(['b1', 'a1', 'b2'], (item) => item[0] ?? '');
        expect(groups.map((group) => group.label)).toEqual(['b', 'a']);
        expect(groups.flatMap((group) => group.options.map((option) => `${option.item}:${option.index}`))).toEqual(['b1:0', 'b2:1', 'a1:2']);
    });
});
