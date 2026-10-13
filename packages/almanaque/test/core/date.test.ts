import { describe, expect, it } from 'vitest';
import {
    addDays, addMonths, diffDays, endOfWeek, fromDays, isIso, normalizeIso, parseIso, shiftMonth, startOfWeek,
    toDays, weekdayOf,
} from '@ghegar/almanaque';

describe('date', () => {
    it('round-trips days since epoch', () => {
        expect(toDays('1970-01-01')).toBe(0);
        for (const iso of ['1600-02-29', '1999-12-31', '2000-02-29', '2024-03-01', '2100-02-28']) {
            expect(fromDays(toDays(iso))).toBe(iso);
        }
    });

    it('validates ISO dates', () => {
        expect(isIso('2026-02-29')).toBe(false);
        expect(isIso('2024-02-29')).toBe(true);
        expect(isIso('2026-13-01')).toBe(false);
        expect(parseIso('2026-10-13T08:00:00Z')).toEqual({ year: 2026, month: 10, day: 13 });
        expect(normalizeIso('2026-10-13T23:59:00-06:00')).toBe('2026-10-13');
        expect(normalizeIso(null)).toBeNull();
    });

    it('counts weekdays from Monday', () => {
        expect(weekdayOf('2026-10-12')).toBe(0);
        expect(weekdayOf('2026-10-18')).toBe(6);
        expect(weekdayOf('1969-12-29')).toBe(0);
        expect(startOfWeek('2026-10-15')).toBe('2026-10-12');
        expect(endOfWeek('2026-10-15')).toBe('2026-10-18');
    });

    it('does arithmetic across months and years', () => {
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
        expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
        expect(diffDays('2026-01-01', '2026-12-31')).toBe(364);
        expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
        expect(addMonths('2024-02-29', 12)).toBe('2025-02-28');
        expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
        expect(shiftMonth({ year: 2026, month: 12 }, 13)).toEqual({ year: 2028, month: 1 });
    });
});
