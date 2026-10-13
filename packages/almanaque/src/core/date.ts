export type IsoDate = string;

export interface YearMonth {
    year: number;
    month: number;
}

export interface DateParts extends YearMonth {
    day: number;
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number, size = 2): string => String(value).padStart(size, '0');

export const isLeapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const daysInMonth = (year: number, month: number): number => {
    if (month === 2) return isLeapYear(year) ? 29 : 28;
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

export const toIso = (year: number, month: number, day: number): IsoDate => `${pad(year, 4)}-${pad(month)}-${pad(day)}`;

export const parseIso = (value: unknown): DateParts | null => {
    if (typeof value !== 'string') return null;
    const match = ISO.exec(value.slice(0, 10));
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
    return { year, month, day };
};

export const isIso = (value: unknown): value is IsoDate => typeof value === 'string' && value.length === 10 && parseIso(value) !== null;

export const normalizeIso = (value: unknown): IsoDate | null => {
    const parts = parseIso(value);
    return parts ? toIso(parts.year, parts.month, parts.day) : null;
};

export const toDays = (iso: IsoDate): number => {
    const parts = parseIso(iso);
    if (!parts) throw new RangeError(`Invalid ISO date: ${iso}`);
    const year = parts.month <= 2 ? parts.year - 1 : parts.year;
    const era = Math.floor(year / 400);
    const yearOfEra = year - era * 400;
    const dayOfYear = Math.floor((153 * (parts.month + (parts.month > 2 ? -3 : 9)) + 2) / 5) + parts.day - 1;
    const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
    return era * 146097 + dayOfEra - 719468;
};

export const fromDays = (days: number): IsoDate => {
    const shifted = days + 719468;
    const era = Math.floor(shifted / 146097);
    const dayOfEra = shifted - era * 146097;
    const yearOfEra = Math.floor(
        (dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365,
    );
    const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
    const monthIndex = Math.floor((5 * dayOfYear + 2) / 153);
    const day = dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1;
    const month = monthIndex < 10 ? monthIndex + 3 : monthIndex - 9;
    return toIso(yearOfEra + era * 400 + (month <= 2 ? 1 : 0), month, day);
};

export const addDays = (iso: IsoDate, amount: number): IsoDate => fromDays(toDays(iso) + amount);

export const diffDays = (from: IsoDate, to: IsoDate): number => toDays(to) - toDays(from);

export const weekdayOf = (iso: IsoDate): number => (((toDays(iso) + 3) % 7) + 7) % 7;

export const startOfWeek = (iso: IsoDate): IsoDate => addDays(iso, -weekdayOf(iso));

export const endOfWeek = (iso: IsoDate): IsoDate => addDays(iso, 6 - weekdayOf(iso));

export const shiftMonth = ({ year, month }: YearMonth, amount: number): YearMonth => {
    const total = year * 12 + (month - 1) + amount;
    return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
};

export const monthOf = (iso: IsoDate): YearMonth => {
    const parts = parseIso(iso);
    if (!parts) throw new RangeError(`Invalid ISO date: ${iso}`);
    return { year: parts.year, month: parts.month };
};

export const compareMonths = (a: YearMonth, b: YearMonth): number => (a.year - b.year) * 12 + (a.month - b.month);

export const firstOfMonth = ({ year, month }: YearMonth): IsoDate => toIso(year, month, 1);

export const lastOfMonth = ({ year, month }: YearMonth): IsoDate => toIso(year, month, daysInMonth(year, month));

export const addMonths = (iso: IsoDate, amount: number): IsoDate => {
    const parts = parseIso(iso);
    if (!parts) throw new RangeError(`Invalid ISO date: ${iso}`);
    const target = shiftMonth(parts, amount);
    return toIso(target.year, target.month, Math.min(parts.day, daysInMonth(target.year, target.month)));
};

export const todayIso = (now: Date = new Date()): IsoDate => toIso(now.getFullYear(), now.getMonth() + 1, now.getDate());

export const clampIso = (iso: IsoDate, min: IsoDate | null, max: IsoDate | null): IsoDate => {
    if (min && iso < min) return min;
    if (max && iso > max) return max;
    return iso;
};
