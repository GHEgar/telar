import { diffDays, type IsoDate } from './date.js';
import type { DateRange } from './types.js';

export const EMPTY_RANGE: DateRange = { start: null, end: null };

export const isPending = (range: DateRange): range is { start: IsoDate; end: null } => range.start !== null && range.end === null;

export const rangeLength = (from: IsoDate, to: IsoDate): number => Math.abs(diffDays(from, to)) + 1;

export const isRangeBlocked = (start: IsoDate, iso: IsoDate, minDays?: number, maxDays?: number): boolean => {
    if (iso === start) return false;
    const length = rangeLength(start, iso);
    return (minDays !== undefined && length < minDays) || (maxDays !== undefined && length > maxDays);
};

export const pickRange = (range: DateRange, iso: IsoDate, minDays?: number): DateRange => {
    if (!isPending(range)) return { start: iso, end: null };
    if (iso === range.start && minDays !== undefined && minDays > 1) return EMPTY_RANGE;
    return iso < range.start ? { start: iso, end: range.start } : { start: range.start, end: iso };
};

export const normalizeRange = (range: DateRange | null | undefined): DateRange => {
    if (!range) return EMPTY_RANGE;
    const { start, end } = range;
    if (start && end && end < start) return { start: end, end: start };
    if (!start && end) return { start: end, end: null };
    return { start: start ?? null, end: end ?? null };
};

export const sameRange = (a: DateRange, b: DateRange): boolean => a.start === b.start && a.end === b.end;
