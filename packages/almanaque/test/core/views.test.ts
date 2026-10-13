import { describe, expect, it } from 'vitest';
import { createCalendar } from '@ghegar/almanaque';

describe('keyboard in months and years', () => {
    it('moves through months and picks one', () => {
        const calendar = createCalendar({ today: '2026-10-13', max: '2027-01-31' });
        calendar.toggleView('months');
        calendar.keyDown('ArrowDown');
        expect(calendar.getSnapshot()).toMatchObject({ year: 2027, month: 1 });
        expect(calendar.keyDown('ArrowRight')).toBe(true);
        expect(calendar.getSnapshot().month).toBe(1);
        calendar.keyDown('Home');
        expect(calendar.getSnapshot()).toMatchObject({ year: 2027, month: 1 });
        calendar.keyDown('PageUp');
        calendar.keyDown('End');
        expect(calendar.getSnapshot()).toMatchObject({ year: 2026, month: 12 });
        calendar.keyDown('ArrowLeft');
        calendar.keyDown('Enter');
        expect(calendar.getSnapshot()).toMatchObject({ view: 'days', year: 2026, month: 11, focused: '2026-11-13' });
    });

    it('moves through years within the list', () => {
        const calendar = createCalendar({ today: '2026-10-13', min: '2020-01-01', max: '2030-12-31' });
        calendar.toggleView('years');
        calendar.keyDown('ArrowUp');
        expect(calendar.getSnapshot().year).toBe(2023);
        calendar.keyDown('PageUp');
        expect(calendar.getSnapshot().year).toBe(2020);
        calendar.keyDown('End');
        expect(calendar.getSnapshot().year).toBe(2030);
        calendar.keyDown(' ');
        expect(calendar.getSnapshot()).toMatchObject({ view: 'days', year: 2030, month: 10 });
    });

    it('closes the view with Escape and ignores other keys', () => {
        const calendar = createCalendar({ today: '2026-10-13' });
        calendar.toggleView('years');
        expect(calendar.keyDown('a')).toBe(false);
        calendar.keyDown('Escape');
        expect(calendar.getSnapshot()).toMatchObject({ view: 'days', year: 2026, month: 10 });
    });
});
