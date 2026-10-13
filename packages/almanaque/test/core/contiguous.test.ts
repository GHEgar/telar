import { describe, expect, it } from 'vitest';
import { createCalendar, weekdayOf, type CalendarSnapshot } from '@ghegar/almanaque';

const disabled = (snapshot: CalendarSnapshot, iso: string): boolean | undefined => snapshot.grids
    .flatMap((grid) => grid.weeks.flat())
    .find((cell) => cell.iso === iso && !cell.outside)?.disabled;

const holiday = (iso: string): boolean => iso === '2026-10-21' || iso === '2026-10-07';

describe('contiguous ranges', () => {
    it('lets a range cross disabled days by default', () => {
        const calendar = createCalendar({ mode: 'range', today: '2026-10-13', isDisabled: holiday });
        calendar.select('2026-10-14');
        expect(disabled(calendar.getSnapshot(), '2026-10-28')).toBe(false);
        calendar.select('2026-10-28');
        expect(calendar.getSnapshot().range).toEqual({ start: '2026-10-14', end: '2026-10-28' });
    });

    it('stops at the first disabled day on each side', () => {
        const calendar = createCalendar({ mode: 'range', today: '2026-10-13', isDisabled: holiday, contiguous: true });
        calendar.select('2026-10-14');
        const snapshot = calendar.getSnapshot();
        expect(disabled(snapshot, '2026-10-20')).toBe(false);
        expect(disabled(snapshot, '2026-10-22')).toBe(true);
        expect(disabled(snapshot, '2026-10-08')).toBe(false);
        expect(disabled(snapshot, '2026-10-06')).toBe(true);
        calendar.hover('2026-10-25');
        expect(calendar.getSnapshot().grids[0]?.weeks.flat().some((cell) => cell.preview)).toBe(false);
        calendar.select('2026-10-25');
        expect(calendar.getSnapshot().range).toEqual({ start: '2026-10-14', end: null });
        calendar.select('2026-10-20');
        expect(calendar.getSnapshot().range).toEqual({ start: '2026-10-14', end: '2026-10-20' });
    });

    it('applies to days outside the visible months', () => {
        const weekend = (iso: string): boolean => weekdayOf(iso) >= 5;
        const calendar = createCalendar({ mode: 'range', today: '2026-10-13', isDisabled: weekend, contiguous: true });
        calendar.select('2026-10-30');
        calendar.next();
        expect(disabled(calendar.getSnapshot(), '2026-11-02')).toBe(true);
        calendar.select('2026-11-02');
        expect(calendar.getSnapshot().range.end).toBeNull();
    });
});
