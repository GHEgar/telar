import type { IsoDate, YearMonth } from './date.js';
import type { GridDay } from './grid.js';
import type { CalendarLabels } from './labels.js';

export type CalendarMode = 'single' | 'range';

export type CalendarView = 'days' | 'months' | 'years';

export interface DateRange {
    start: IsoDate | null;
    end: IsoDate | null;
}

export interface CalendarOptions {
    mode?: CalendarMode;
    value?: IsoDate | null;
    range?: DateRange | null;
    onSelect?: (value: IsoDate | null) => void;
    onRangeChange?: (range: DateRange) => void;
    min?: IsoDate | null;
    max?: IsoDate | null;
    isDisabled?: (iso: IsoDate) => boolean;
    minDays?: number;
    maxDays?: number;
    contiguous?: boolean;
    today?: IsoDate;
    initialMonth?: YearMonth;
    months?: number;
    fixedWeeks?: boolean;
    yearsBack?: number;
    yearsForward?: number;
    locale?: string;
    labels?: Partial<CalendarLabels>;
}

export interface DayCell extends GridDay {
    label: string;
    weekday: number;
    today: boolean;
    selected: boolean;
    disabled: boolean;
    focused: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    inRange: boolean;
    preview: boolean;
}

export interface MonthGrid extends YearMonth {
    title: string;
    weeks: DayCell[][];
}

export interface MonthCell {
    month: number;
    label: string;
    shortLabel: string;
    current: boolean;
    disabled: boolean;
}

export interface YearCell {
    year: number;
    current: boolean;
    disabled: boolean;
}

export interface CalendarSnapshot extends YearMonth {
    mode: CalendarMode;
    view: CalendarView;
    today: IsoDate;
    focused: IsoDate;
    value: IsoDate | null;
    range: DateRange;
    hover: IsoDate | null;
    title: string;
    grids: MonthGrid[];
    monthCells: MonthCell[];
    yearCells: YearCell[];
    weekdays: readonly string[];
    weekdaysLong: readonly string[];
    canPrevious: boolean;
    canNext: boolean;
    labels: CalendarLabels;
}

export interface KeyModifiers {
    shiftKey?: boolean;
}

export interface Calendar {
    subscribe(listener: () => void): () => void;
    getSnapshot(): CalendarSnapshot;
    previous(): void;
    next(): void;
    setView(view: CalendarView): void;
    toggleView(view: Exclude<CalendarView, 'days'>): void;
    goTo(month: YearMonth): void;
    pickMonth(month: number): void;
    pickYear(year: number): void;
    select(iso: IsoDate): void;
    hover(iso: IsoDate | null): void;
    focus(iso: IsoDate): void;
    keyDown(key: string, modifiers?: KeyModifiers): boolean;
    clear(): void;
    setValue(value: IsoDate | null): void;
    setRange(range: DateRange | null): void;
    update(options: Partial<CalendarOptions>): void;
}
