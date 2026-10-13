import { firstOfMonth, lastOfMonth, toIso, type IsoDate, type YearMonth } from './date.js';

export interface LimitOptions {
    min?: IsoDate | null | undefined;
    max?: IsoDate | null | undefined;
    isDisabled?: ((iso: IsoDate) => boolean) | undefined;
}

export interface Limits {
    min: IsoDate | null;
    max: IsoDate | null;
    isDayDisabled(iso: IsoDate): boolean;
    isMonthDisabled(month: YearMonth): boolean;
    isYearDisabled(year: number): boolean;
}

export const createLimits = ({ min, max, isDisabled }: LimitOptions): Limits => {
    const low = min ?? null;
    const high = max ?? null;
    const outside = (from: IsoDate, to: IsoDate): boolean => (!!low && to < low) || (!!high && from > high);
    return {
        min: low,
        max: high,
        isDayDisabled: (iso) => outside(iso, iso) || (isDisabled?.(iso) ?? false),
        isMonthDisabled: (month) => outside(firstOfMonth(month), lastOfMonth(month)),
        isYearDisabled: (year) => outside(toIso(year, 1, 1), toIso(year, 12, 31)),
    };
};
