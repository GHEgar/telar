import { addDays, endOfWeek, firstOfMonth, lastOfMonth, startOfWeek, type IsoDate, type YearMonth } from './date.js';

export interface GridDay {
    iso: IsoDate;
    day: number;
    outside: boolean;
}

export const buildMonthGrid = (month: YearMonth, fixedWeeks = false): GridDay[][] => {
    const first = firstOfMonth(month);
    const last = lastOfMonth(month);
    const start = startOfWeek(first);
    const end = endOfWeek(last);
    const weeks: GridDay[][] = [];
    let cursor = start;
    while (cursor <= end || (fixedWeeks && weeks.length < 6)) {
        const week: GridDay[] = [];
        for (let index = 0; index < 7; index += 1) {
            week.push({ iso: cursor, day: Number(cursor.slice(8)), outside: cursor < first || cursor > last });
            cursor = addDays(cursor, 1);
        }
        weeks.push(week);
    }
    return weeks;
};
