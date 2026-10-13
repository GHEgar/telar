import { monthOf, parseIso, shiftMonth, weekdayOf, type IsoDate, type YearMonth } from './date.js';
import { buildMonthGrid, type GridDay } from './grid.js';
import type { CalendarLabels } from './labels.js';
import type { Limits } from './limits.js';
import { isPending, isRangeBlocked } from './range.js';
import type {
    CalendarMode, CalendarSnapshot, CalendarView, DateRange, DayCell, MonthCell, YearCell,
} from './types.js';

export interface CalendarState {
    mode: CalendarMode;
    view: CalendarView;
    anchor: YearMonth;
    focused: IsoDate;
    value: IsoDate | null;
    range: DateRange;
    hover: IsoDate | null;
    today: IsoDate;
}

export interface CalendarConfig {
    limits: Limits;
    labels: CalendarLabels;
    months: number;
    fixedWeeks: boolean;
    minDays: number | undefined;
    maxDays: number | undefined;
    yearsBack: number;
    yearsForward: number;
}

export const isDayDisabled = (state: CalendarState, config: CalendarConfig, iso: IsoDate): boolean => {
    if (config.limits.isDayDisabled(iso)) return true;
    if (state.mode !== 'range' || !isPending(state.range)) return false;
    return isRangeBlocked(state.range.start, iso, config.minDays, config.maxDays);
};

const previewBounds = (state: CalendarState, config: CalendarConfig): [IsoDate, IsoDate] | null => {
    const { range, hover } = state;
    if (state.mode !== 'range' || !isPending(range) || !hover || isDayDisabled(state, config, hover)) return null;
    return hover < range.start ? [hover, range.start] : [range.start, hover];
};

const buildDay = (
    state: CalendarState,
    config: CalendarConfig,
    preview: [IsoDate, IsoDate] | null,
    { iso, day, outside }: GridDay,
): DayCell => {
    const { start, end } = state.range;
    const ranged = state.mode === 'range';
    return {
        iso,
        day,
        outside,
        label: config.labels.formatDay(iso),
        weekday: weekdayOf(iso),
        today: iso === state.today,
        selected: ranged ? iso === start || iso === end : iso === state.value,
        disabled: isDayDisabled(state, config, iso),
        focused: iso === state.focused,
        rangeStart: ranged && iso === start,
        rangeEnd: ranged && iso === end,
        inRange: ranged && !!start && !!end && iso >= start && iso <= end,
        preview: !!preview && iso >= preview[0] && iso <= preview[1],
    };
};

const yearBounds = (state: CalendarState, config: CalendarConfig): [number, number] => {
    const current = Number(state.today.slice(0, 4));
    const min = parseIso(config.limits.min)?.year ?? current - config.yearsBack;
    const max = parseIso(config.limits.max)?.year ?? current + config.yearsForward;
    return [Math.min(min, state.anchor.year), Math.max(max, state.anchor.year)];
};

export const buildSnapshot = (state: CalendarState, config: CalendarConfig): CalendarSnapshot => {
    const { anchor, view } = state;
    const { limits, labels } = config;
    const preview = previewBounds(state, config);
    const grids = Array.from({ length: config.months }, (_, index) => {
        const month = shiftMonth(anchor, index);
        return {
            ...month,
            title: labels.formatTitle(month.year, month.month),
            weeks: buildMonthGrid(month, config.fixedWeeks).map((week) => week.map((day) => buildDay(state, config, preview, day))),
        };
    });
    const monthCells: MonthCell[] = labels.months.map((label, index) => ({
        month: index + 1,
        label,
        shortLabel: labels.monthsShort[index] ?? label,
        current: anchor.month === index + 1,
        disabled: limits.isMonthDisabled({ year: anchor.year, month: index + 1 }),
    }));
    const [firstYear, lastYear] = yearBounds(state, config);
    const yearCells: YearCell[] = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
        const year = firstYear + index;
        return { year, current: year === anchor.year, disabled: limits.isYearDisabled(year) };
    });
    const canPrevious = view === 'days'
        ? !limits.isMonthDisabled(shiftMonth(anchor, -1))
        : view === 'months' && !limits.isYearDisabled(anchor.year - 1);
    const canNext = view === 'days'
        ? !limits.isMonthDisabled(shiftMonth(anchor, config.months))
        : view === 'months' && !limits.isYearDisabled(anchor.year + 1);
    return {
        ...anchor,
        mode: state.mode,
        view,
        today: state.today,
        focused: state.focused,
        value: state.value,
        range: state.range,
        hover: state.hover,
        title: labels.formatTitle(anchor.year, anchor.month),
        grids,
        monthCells,
        yearCells,
        weekdays: labels.weekdays,
        weekdaysLong: labels.weekdaysLong,
        canPrevious,
        canNext,
        labels,
    };
};

export const visibleAnchor = (anchor: YearMonth, iso: IsoDate, months: number): YearMonth => {
    const target = monthOf(iso);
    const offset = (target.year - anchor.year) * 12 + (target.month - anchor.month);
    if (offset < 0) return target;
    if (offset >= months) return shiftMonth(target, -(months - 1));
    return anchor;
};
