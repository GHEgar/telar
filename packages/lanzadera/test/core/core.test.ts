import { describe, expect, it } from 'vitest';
import { createTypeahead, moveIndex } from '@ghegar/lanzadera';

describe('moveIndex', () => {
    it('moves along the orientation and loops', () => {
        expect(moveIndex(0, 'ArrowRight', { count: 3, orientation: 'horizontal' })).toBe(1);
        expect(moveIndex(2, 'ArrowRight', { count: 3, orientation: 'horizontal' })).toBe(0);
        expect(moveIndex(2, 'ArrowRight', { count: 3, orientation: 'horizontal', loop: false })).toBeNull();
        expect(moveIndex(0, 'ArrowDown', { count: 3, orientation: 'horizontal' })).toBeNull();
        expect(moveIndex(0, 'ArrowUp', { count: 3, orientation: 'vertical' })).toBe(2);
        expect(moveIndex(1, 'ArrowRight', { count: 3, rtl: true })).toBe(0);
    });

    it('skips disabled items and jumps to the ends', () => {
        const isDisabled = (index: number): boolean => index === 1 || index === 4;
        expect(moveIndex(0, 'ArrowRight', { count: 5, isDisabled })).toBe(2);
        expect(moveIndex(0, 'End', { count: 5, isDisabled })).toBe(3);
        expect(moveIndex(3, 'Home', { count: 5, isDisabled: (index) => index === 0 })).toBe(1);
        expect(moveIndex(0, 'ArrowRight', { count: 2, isDisabled: (index) => index === 1 })).toBeNull();
    });

    it('steps by rows in a grid without wrapping vertically', () => {
        const grid = { count: 8, columns: 3 };
        expect(moveIndex(1, 'ArrowDown', grid)).toBe(4);
        expect(moveIndex(6, 'ArrowDown', grid)).toBeNull();
        expect(moveIndex(1, 'ArrowUp', grid)).toBeNull();
        expect(moveIndex(5, 'ArrowRight', grid)).toBe(6);
    });

    it('ignores other keys and empty lists', () => {
        expect(moveIndex(0, 'a', { count: 3 })).toBeNull();
        expect(moveIndex(0, 'ArrowRight', { count: 0 })).toBeNull();
    });
});

describe('createTypeahead', () => {
    const labels = ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Ciudad de México', 'Jalisco'];
    const label = (index: number): string => labels[index] ?? '';

    it('matches prefixes, accents and repeated letters', () => {
        let time = 0;
        const typeahead = createTypeahead(500, () => time);
        expect(typeahead.match('j', 0, label, labels.length)).toBe(5);
        time += 100;
        expect(typeahead.match('c', 0, label, labels.length)).toBeNull();
        time += 1000;
        expect(typeahead.match('c', 0, label, labels.length)).toBe(3);
        time += 100;
        expect(typeahead.match('c', 3, label, labels.length)).toBe(4);
        time += 1000;
        expect(typeahead.match('b', 0, label, labels.length)).toBe(1);
        time += 100;
        expect(typeahead.match('a', 1, label, labels.length)).toBe(1);
        time += 1000;
        typeahead.reset();
        expect(typeahead.match('M', 0, (index) => ['éxito', 'México'][index] ?? '', 2)).toBe(1);
        expect(typeahead.match('Enter', 0, label, labels.length)).toBeNull();
    });
});
