import { describe, expect, it } from 'vitest';
import { describeAccept, judgeDrag, matchesAccept, parseAccept } from '@npmegar/buzon';

describe('accept', () => {
    it('parses the input syntax', () => {
        expect(parseAccept('.PDF, image/*, text/csv')).toEqual({ extensions: ['.pdf'], mimes: ['text/csv'], wildcards: ['image/'] });
        expect(parseAccept(['*/*'])).toBeNull();
        expect(parseAccept('')).toBeNull();
    });

    it('matches by extension, exact MIME and wildcard', () => {
        const rules = parseAccept('.pdf,image/*,text/csv');
        expect(matchesAccept({ name: 'Informe.PDF', type: '' }, rules)).toBe(true);
        expect(matchesAccept({ name: 'foto', type: 'image/webp' }, rules)).toBe(true);
        expect(matchesAccept({ name: 'datos.txt', type: 'text/csv' }, rules)).toBe(true);
        expect(matchesAccept({ name: 'nota.txt', type: 'text/plain' }, rules)).toBe(false);
        expect(matchesAccept({ name: 'nota.txt', type: 'text/plain' }, null)).toBe(true);
    });

    it('describes formats in English by default', () => {
        expect(describeAccept('image/png,image/jpeg,.webp')).toBe('PNG, JPG, or WEBP');
        expect(describeAccept('.pdf')).toBe('PDF');
        expect(describeAccept('image/*,application/pdf')).toBe('images or PDF');
        expect(describeAccept('.jpg,image/jpeg')).toBe('JPG');
        expect(describeAccept(undefined)).toBe('');
    });

    it('describes formats in another locale when asked', () => {
        expect(describeAccept('image/*,application/pdf', 'es-MX', { image: 'imágenes' })).toBe('imágenes o PDF');
    });

    it('judges a drag from item types', () => {
        const images = parseAccept('image/*');
        expect(judgeDrag([{ kind: 'file', type: 'image/png' }], images)).toBe('accept');
        expect(judgeDrag([{ kind: 'file', type: 'application/pdf' }], images)).toBe('reject');
        expect(judgeDrag([{ kind: 'file', type: 'image/png' }, { kind: 'file', type: 'text/plain' }], images)).toBe('unknown');
        expect(judgeDrag([{ kind: 'file', type: 'application/pdf' }], parseAccept('.pdf,image/*'))).toBe('unknown');
        expect(judgeDrag([{ kind: 'string', type: 'text/plain' }], images)).toBe('reject');
        expect(judgeDrag([], images)).toBe('unknown');
    });
});
