import { describe, expect, it, vi } from 'vitest';
import { createCalendar, type CalendarSnapshot, type DayCell } from '@npmegar/almanaque';

const day = (snapshot: CalendarSnapshot, iso: string): DayCell => {
    const found = snapshot.grids.flatMap((grid) => grid.weeks.flat()).find((cell) => cell.iso === iso && !cell.outside);
    if (!found) throw new Error(`missing ${iso}`);
    return found;
};

describe('createCalendar single', () => {
    it('opens on the value, else today', () => {
        expect(createCalendar({ today: '2026-10-13' }).getSnapshot()).toMatchObject({ year: 2026, month: 10, focused: '2026-10-13' });
        expect(createCalendar({ today: '2026-10-13', value: '2025-02-03' }).getSnapshot()).toMatchObject({ year: 2025, month: 2 });
    });

    it('selects and reports', () => {
        const onSelect = vi.fn();
        const calendar = createCalendar({ today: '2026-10-13', onSelect });
        calendar.select('2026-10-20');
        expect(onSelect).toHaveBeenCalledWith('2026-10-20');
        expect(day(calendar.getSnapshot(), '2026-10-20').selected).toBe(true);
        expect(day(calendar.getSnapshot(), '2026-10-13').today).toBe(true);
        calendar.clear();
        expect(onSelect).toHaveBeenLastCalledWith(null);
    });

    it('follows an outside day into its month', () => {
        const calendar = createCalendar({ today: '2026-10-13' });
        calendar.select('2026-11-01');
        expect(calendar.getSnapshot()).toMatchObject({ month: 11, value: '2026-11-01' });
    });

    it('respects min, max and isDisabled', () => {
        const calendar = createCalendar({
            today: '2026-10-13', min: '2026-10-05', max: '2026-11-10', isDisabled: (iso) => iso === '2026-10-14',
        });
        const snapshot = calendar.getSnapshot();
        expect(day(snapshot, '2026-10-04').disabled).toBe(true);
        expect(day(snapshot, '2026-10-14').disabled).toBe(true);
        expect(snapshot.canPrevious).toBe(false);
        expect(snapshot.canNext).toBe(true);
        calendar.select('2026-10-14');
        expect(calendar.getSnapshot().value).toBeNull();
        calendar.next();
        expect(calendar.getSnapshot()).toMatchObject({ month: 11, canNext: false });
        calendar.next();
        expect(calendar.getSnapshot().month).toBe(11);
    });

    it('switches between days, months and years', () => {
        const calendar = createCalendar({ today: '2026-10-13', max: '2027-03-31' });
        calendar.toggleView('months');
        let snapshot = calendar.getSnapshot();
        expect(snapshot.view).toBe('months');
        expect(snapshot.monthCells[9]).toMatchObject({ label: 'October', current: true, disabled: false });
        calendar.next();
        snapshot = calendar.getSnapshot();
        expect(snapshot.year).toBe(2027);
        expect(snapshot.monthCells[3]?.disabled).toBe(true);
        expect(snapshot.canNext).toBe(false);
        calendar.pickMonth(4);
        expect(calendar.getSnapshot().month).toBe(10);
        calendar.pickMonth(2);
        expect(calendar.getSnapshot()).toMatchObject({ view: 'days', year: 2027, month: 2, focused: '2027-02-28' });
        calendar.toggleView('years');
        snapshot = calendar.getSnapshot();
        expect(snapshot.yearCells[0]?.year).toBe(1926);
        expect(snapshot.yearCells.at(-1)?.year).toBe(2027);
        calendar.pickYear(2001);
        expect(calendar.getSnapshot()).toMatchObject({ view: 'days', year: 2001, month: 2 });
    });

    it('moves focus with the keyboard', () => {
        const calendar = createCalendar({ today: '2026-10-31' });
        expect(calendar.keyDown('ArrowRight')).toBe(true);
        expect(calendar.getSnapshot()).toMatchObject({ focused: '2026-11-01', month: 11 });
        calendar.keyDown('ArrowUp');
        expect(calendar.getSnapshot().focused).toBe('2026-10-25');
        calendar.keyDown('Home');
        expect(calendar.getSnapshot().focused).toBe('2026-10-19');
        calendar.keyDown('End');
        expect(calendar.getSnapshot().focused).toBe('2026-10-25');
        calendar.keyDown('PageDown', { shiftKey: true });
        expect(calendar.getSnapshot()).toMatchObject({ focused: '2027-10-25', year: 2027 });
        calendar.keyDown('Enter');
        expect(calendar.getSnapshot().value).toBe('2027-10-25');
        expect(calendar.keyDown('a')).toBe(false);
    });

    it('keeps focus inside the limits', () => {
        const calendar = createCalendar({ today: '2026-10-13', max: '2026-10-15' });
        calendar.keyDown('ArrowDown');
        expect(calendar.getSnapshot().focused).toBe('2026-10-15');
    });
});

describe('createCalendar range', () => {
    it('opens, previews and closes a range', () => {
        const onRangeChange = vi.fn();
        const calendar = createCalendar({ mode: 'range', today: '2026-10-13', onRangeChange });
        calendar.select('2026-10-20');
        expect(onRangeChange).toHaveBeenLastCalledWith({ start: '2026-10-20', end: null });
        calendar.hover('2026-10-16');
        let snapshot = calendar.getSnapshot();
        expect(day(snapshot, '2026-10-18').preview).toBe(true);
        expect(day(snapshot, '2026-10-21').preview).toBe(false);
        calendar.select('2026-10-16');
        snapshot = calendar.getSnapshot();
        expect(snapshot.range).toEqual({ start: '2026-10-16', end: '2026-10-20' });
        expect(day(snapshot, '2026-10-18')).toMatchObject({ inRange: true, preview: false });
        expect(day(snapshot, '2026-10-16')).toMatchObject({ rangeStart: true, selected: true });
        calendar.select('2026-10-01');
        expect(calendar.getSnapshot().range).toEqual({ start: '2026-10-01', end: null });
    });

    it('blocks lengths outside minDays and maxDays', () => {
        const calendar = createCalendar({ mode: 'range', today: '2026-10-13', minDays: 3, maxDays: 5 });
        calendar.select('2026-10-10');
        const snapshot = calendar.getSnapshot();
        expect(day(snapshot, '2026-10-11').disabled).toBe(true);
        expect(day(snapshot, '2026-10-12').disabled).toBe(false);
        expect(day(snapshot, '2026-10-14').disabled).toBe(false);
        expect(day(snapshot, '2026-10-15').disabled).toBe(true);
        expect(day(snapshot, '2026-10-06').disabled).toBe(false);
        expect(day(snapshot, '2026-10-10').disabled).toBe(false);
        calendar.select('2026-10-10');
        expect(calendar.getSnapshot().range).toEqual({ start: null, end: null });
    });

    it('shows several months and steps one at a time', () => {
        const calendar = createCalendar({ mode: 'range', today: '2026-12-13', months: 2, max: '2027-01-31' });
        let snapshot = calendar.getSnapshot();
        expect(snapshot.grids.map((grid) => grid.title)).toEqual(['December 2026', 'January 2027']);
        expect(snapshot.canNext).toBe(false);
        calendar.previous();
        snapshot = calendar.getSnapshot();
        expect(snapshot.grids.map((grid) => `${grid.year}-${grid.month}`)).toEqual(['2026-11', '2026-12']);
        calendar.select('2027-01-05');
        expect(calendar.getSnapshot().grids[0]?.month).toBe(12);
    });

    it('syncs controlled values without callbacks', () => {
        const onRangeChange = vi.fn();
        const calendar = createCalendar({ mode: 'range', today: '2026-10-13', onRangeChange });
        const before = calendar.getSnapshot();
        calendar.setRange(null);
        expect(calendar.getSnapshot()).toBe(before);
        calendar.setRange({ start: '2027-03-10', end: '2027-03-01' });
        expect(calendar.getSnapshot()).toMatchObject({ range: { start: '2027-03-01', end: '2027-03-10' }, month: 3 });
        expect(onRangeChange).not.toHaveBeenCalled();
    });
});
