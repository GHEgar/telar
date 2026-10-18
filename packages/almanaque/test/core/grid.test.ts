import { describe, expect, it } from 'vitest';
import { buildLabels, buildMonthGrid } from '@npmegar/almanaque';

describe('grid', () => {
    it('builds Monday-first full weeks with outside days', () => {
        const weeks = buildMonthGrid({ year: 2026, month: 10 });
        expect(weeks).toHaveLength(5);
        expect(weeks[0]?.[0]).toEqual({ iso: '2026-09-28', day: 28, outside: true });
        expect(weeks[0]?.[3]).toEqual({ iso: '2026-10-01', day: 1, outside: false });
        expect(weeks[4]?.[6]).toEqual({ iso: '2026-11-01', day: 1, outside: true });
    });

    it('pads to six weeks when asked', () => {
        expect(buildMonthGrid({ year: 2021, month: 2 })).toHaveLength(4);
        expect(buildMonthGrid({ year: 2021, month: 2 }, true)).toHaveLength(6);
    });

    it('labels in en-US by default', () => {
        const labels = buildLabels();
        expect(labels.months[0]).toBe('January');
        expect(labels.weekdays).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
        expect(labels.formatDay('2026-10-13')).toBe('Tuesday, October 13, 2026');
        expect(labels.formatTitle(2026, 10)).toBe('October 2026');
        expect(labels.chooseMonth).toBe('Choose month');
        expect(buildLabels('en-US', { nextMonth: 'Next' }).nextMonth).toBe('Next');
    });

    it('labels in another locale when asked', () => {
        const labels = buildLabels('es-MX', { nextMonth: 'Mes siguiente' });
        expect(labels.months[0]).toBe('Enero');
        expect(labels.weekdays).toEqual(['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']);
        expect(labels.formatDay('2026-10-13')).toBe('Martes, 13 de octubre de 2026');
        expect(labels.nextMonth).toBe('Mes siguiente');
    });
});
