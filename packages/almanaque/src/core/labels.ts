import { parseIso, type IsoDate } from './date.js';

export interface CalendarLabels {
    months: readonly string[];
    monthsShort: readonly string[];
    weekdays: readonly string[];
    weekdaysLong: readonly string[];
    previousMonth: string;
    nextMonth: string;
    previousYear: string;
    nextYear: string;
    chooseMonth: string;
    chooseYear: string;
    formatDay(iso: IsoDate): string;
    formatTitle(year: number, month: number): string;
}

const capitalize = (text: string): string => text.charAt(0).toLocaleUpperCase() + text.slice(1);

const utc = (year: number, month: number, day: number): Date => new Date(Date.UTC(year, month - 1, day, 12));

const SPANISH = {
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    previousYear: 'Año anterior',
    nextYear: 'Año siguiente',
    chooseMonth: 'Elegir mes',
    chooseYear: 'Elegir año',
};

export const buildLabels = (locale = 'es-MX', overrides: Partial<CalendarLabels> = {}): CalendarLabels => {
    const month = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
    const monthShort = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
    const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
    const long = new Intl.DateTimeFormat(locale, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    });
    const monthNumbers = Array.from({ length: 12 }, (_, index) => index + 1);
    const mondays = Array.from({ length: 7 }, (_, index) => utc(2024, 1, 1 + index));
    const months = monthNumbers.map((value) => capitalize(month.format(utc(2024, value, 1))));
    return {
        months,
        monthsShort: monthNumbers.map((value) => capitalize(monthShort.format(utc(2024, value, 1)).replace('.', ''))),
        weekdays: mondays.map((date) => capitalize(weekday.format(date).replace('.', '').slice(0, 2))),
        weekdaysLong: mondays.map((date) => capitalize(weekdayLong.format(date))),
        ...SPANISH,
        formatDay: (iso) => {
            const parts = parseIso(iso);
            return parts ? capitalize(long.format(utc(parts.year, parts.month, parts.day))) : iso;
        },
        formatTitle: (year, value) => `${months[value - 1] ?? ''} ${year}`,
        ...overrides,
    };
};
