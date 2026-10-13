import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createCalendar, type Calendar, type CalendarOptions, type CalendarSnapshot, type DayCell, type MonthCell, type MonthGrid, type YearCell } from '../core/index.js';
import {
    dayProps, gridProps, monthProps, rootProps, weekdayProps, yearProps,
    type ButtonProps, type DayProps, type GridProps, type RootProps, type WeekdayProps,
} from './props.js';

export interface UseCalendar extends CalendarSnapshot {
    calendar: Calendar;
    getRootProps(): RootProps;
    getGridProps(grid: MonthGrid): GridProps;
    getWeekdayProps(index: number): WeekdayProps;
    getDayProps(cell: DayCell): DayProps;
    getPreviousProps(): ButtonProps;
    getNextProps(): ButtonProps;
    getViewProps(view: 'months' | 'years'): ButtonProps;
    getMonthProps(cell: MonthCell): ButtonProps;
    getYearProps(cell: YearCell): ButtonProps;
}

export const useCalendar = (options: CalendarOptions = {}): UseCalendar => {
    const [calendar] = useState(() => createCalendar(options));
    const { onSelect, onRangeChange } = options;
    useLayoutEffect(() => {
        calendar.update({ onSelect, onRangeChange } as CalendarOptions);
    }, [calendar, onSelect, onRangeChange]);
    const snapshot = useSyncExternalStore(calendar.subscribe, calendar.getSnapshot, calendar.getSnapshot);
    const root = useRef<HTMLElement | null>(null);
    const fromKeyboard = useRef(false);

    const { mode, min, max, isDisabled, minDays, maxDays, today, months, fixedWeeks, yearsBack, yearsForward, locale, labels } = options;
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        calendar.update({ mode, min, max, isDisabled, minDays, maxDays, today, months, fixedWeeks, yearsBack, yearsForward, locale, labels } as CalendarOptions);
    }, [calendar, mode, min, max, isDisabled, minDays, maxDays, today, months, fixedWeeks, yearsBack, yearsForward, locale, labels]);

    const { value } = options;
    const controlledValue = value !== undefined;
    useEffect(() => {
        if (controlledValue) calendar.setValue(value);
    }, [calendar, controlledValue, value]);

    const start = options.range?.start;
    const end = options.range?.end;
    const controlledRange = options.range !== undefined;
    useEffect(() => {
        if (controlledRange) calendar.setRange({ start: start ?? null, end: end ?? null });
    }, [calendar, controlledRange, start, end]);

    useEffect(() => {
        if (!fromKeyboard.current) return;
        fromKeyboard.current = false;
        const target = root.current?.querySelector<HTMLElement>(`[data-iso="${snapshot.focused}"]:not([data-outside])`);
        target?.focus();
    }, [snapshot.focused, snapshot.year, snapshot.month]);

    useEffect(() => {
        if (snapshot.view !== 'years') return;
        root.current?.querySelector<HTMLElement>('[data-year][data-current]')?.scrollIntoView?.({ block: 'center' });
    }, [snapshot.view]);

    const setRoot = useCallback((element: HTMLElement | null) => {
        root.current = element;
    }, []);
    const markKeyboard = useCallback(() => {
        fromKeyboard.current = true;
    }, []);
    const { labels: text, view } = snapshot;

    return {
        ...snapshot,
        calendar,
        getRootProps: () => rootProps(snapshot, calendar, setRoot),
        getGridProps: (grid) => gridProps(snapshot, grid),
        getWeekdayProps: (index) => weekdayProps(snapshot, index),
        getDayProps: (cell) => dayProps(calendar, cell, markKeyboard),
        getPreviousProps: () => ({
            type: 'button',
            disabled: !snapshot.canPrevious,
            'aria-label': view === 'months' ? text.previousYear : text.previousMonth,
            onClick: calendar.previous,
        }),
        getNextProps: () => ({
            type: 'button',
            disabled: !snapshot.canNext,
            'aria-label': view === 'months' ? text.nextYear : text.nextMonth,
            onClick: calendar.next,
        }),
        getViewProps: (target) => ({
            type: 'button',
            'aria-pressed': view === target,
            'aria-label': target === 'months' ? text.chooseMonth : text.chooseYear,
            onClick: () => calendar.toggleView(target),
        }),
        getMonthProps: (cell) => monthProps(calendar, cell),
        getYearProps: (cell) => yearProps(calendar, cell),
    };
};
