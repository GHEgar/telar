import {
    clampIso, compareMonths, daysInMonth, monthOf, normalizeIso, parseIso, shiftMonth, toIso, todayIso,
    type IsoDate, type YearMonth,
} from './date.js';
import { resolveChipKey, resolveKey, type ChipAction } from './keyboard.js';
import { buildLabels } from './labels.js';
import { createLimits } from './limits.js';
import { normalizeRange, pickRange, sameRange } from './range.js';
import { buildSnapshot, isDayDisabled, visibleAnchor, type CalendarConfig, type CalendarState } from './snapshot.js';
import type { Calendar, CalendarOptions, CalendarSnapshot, CalendarView, DateRange, KeyModifiers } from './types.js';

const CALLBACKS = new Set(['onSelect', 'onRangeChange']);

const buildConfig = (options: CalendarOptions): CalendarConfig => ({
    limits: createLimits({ min: normalizeIso(options.min), max: normalizeIso(options.max), isDisabled: options.isDisabled }),
    labels: buildLabels(options.locale, options.labels),
    months: Math.max(1, Math.floor(options.months ?? 1)),
    fixedWeeks: options.fixedWeeks ?? false,
    minDays: options.minDays,
    maxDays: options.maxDays,
    yearsBack: options.yearsBack ?? 100,
    yearsForward: options.yearsForward ?? 10,
});

const initialState = (options: CalendarOptions, config: CalendarConfig): CalendarState => {
    const today = normalizeIso(options.today) ?? todayIso();
    const value = normalizeIso(options.value);
    const range = normalizeRange(options.range);
    const focused = clampIso(value ?? range.start ?? today, config.limits.min, config.limits.max);
    return {
        mode: options.mode ?? 'single',
        view: 'days',
        anchor: options.initialMonth ?? monthOf(focused),
        focused,
        value,
        range,
        hover: null,
        today,
    };
};

const sameDayIn = (iso: IsoDate, month: YearMonth): IsoDate => {
    const day = parseIso(iso)?.day ?? 1;
    return toIso(month.year, month.month, Math.min(day, daysInMonth(month.year, month.month)));
};

export const createCalendar = (initial: CalendarOptions = {}): Calendar => {
    let options = initial;
    let config = buildConfig(options);
    let state = initialState(options, config);
    let snapshot: CalendarSnapshot = buildSnapshot(state, config);
    const listeners = new Set<() => void>();

    const commit = (patch: Partial<CalendarState>): void => {
        state = { ...state, ...patch };
        snapshot = buildSnapshot(state, config);
        listeners.forEach((listener) => listener());
    };

    const clamp = (iso: IsoDate): IsoDate => clampIso(iso, config.limits.min, config.limits.max);

    const moveFocus = (to: IsoDate): void => {
        const focused = clamp(to);
        commit({ focused, anchor: visibleAnchor(state.anchor, focused, config.months) });
    };

    const showMonth = (anchor: YearMonth, view: CalendarView = state.view): void => {
        commit({ anchor, view, focused: clamp(sameDayIn(state.focused, anchor)) });
    };

    const select = (iso: IsoDate): void => {
        if (isDayDisabled(state, config, iso)) return;
        const anchor = visibleAnchor(state.anchor, iso, config.months);
        if (state.mode === 'single') {
            commit({ value: iso, focused: iso, anchor });
            options.onSelect?.(iso);
            return;
        }
        const range = pickRange(state.range, iso, config.minDays);
        commit({ range, focused: iso, anchor, hover: null });
        options.onRangeChange?.(range);
    };

    const monthTarget = (action: Exclude<ChipAction, null>): YearMonth | null => {
        if (action.type === 'step') return shiftMonth(state.anchor, action.by);
        if (action.type === 'edge') return { year: state.anchor.year, month: action.to === 'first' ? 1 : 12 };
        return null;
    };

    const yearTarget = (action: Exclude<ChipAction, null>): YearMonth | null => {
        const years = snapshot.yearCells;
        const first = years[0]?.year ?? state.anchor.year;
        const last = years.at(-1)?.year ?? state.anchor.year;
        let year: number | null = null;
        if (action.type === 'step') year = Math.min(last, Math.max(first, state.anchor.year + action.by));
        if (action.type === 'edge') year = action.to === 'first' ? first : last;
        return year === null ? null : { year, month: state.anchor.month };
    };

    const chipKey = (action: ChipAction, target: (action: Exclude<ChipAction, null>) => YearMonth | null, pick: (value: number) => void): boolean => {
        if (!action) return false;
        if (action.type === 'close') commit({ view: 'days' });
        else if (action.type === 'select') pick(state.view === 'months' ? state.anchor.month : state.anchor.year);
        else {
            const anchor = target(action);
            const blocked = !anchor || (state.view === 'months' ? config.limits.isMonthDisabled(anchor) : config.limits.isYearDisabled(anchor.year));
            if (!blocked && compareMonths(anchor, state.anchor) !== 0) commit({ anchor });
        }
        return true;
    };

    const api: Calendar = {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSnapshot: () => snapshot,
        previous() {
            if (!snapshot.canPrevious) return;
            if (state.view === 'months') showMonth({ ...state.anchor, year: state.anchor.year - 1 });
            else showMonth(shiftMonth(state.anchor, -1));
        },
        next() {
            if (!snapshot.canNext) return;
            if (state.view === 'months') showMonth({ ...state.anchor, year: state.anchor.year + 1 });
            else showMonth(shiftMonth(state.anchor, 1));
        },
        setView(view) {
            if (view !== state.view) commit({ view });
        },
        toggleView(view) {
            commit({ view: state.view === view ? 'days' : view });
        },
        goTo(month) {
            showMonth(month);
        },
        pickMonth(month) {
            if (config.limits.isMonthDisabled({ year: state.anchor.year, month })) return;
            showMonth({ year: state.anchor.year, month }, 'days');
        },
        pickYear(year) {
            if (config.limits.isYearDisabled(year)) return;
            showMonth({ year, month: state.anchor.month }, 'days');
        },
        select,
        hover(iso) {
            if (state.mode !== 'range' || state.range.end !== null || state.range.start === null) return;
            if (iso !== state.hover) commit({ hover: iso });
        },
        focus(iso) {
            if (iso !== state.focused) moveFocus(iso);
        },
        keyDown(key: string, modifiers?: KeyModifiers) {
            if (state.view === 'months') return chipKey(resolveChipKey(key, 12), monthTarget, (month) => api.pickMonth(month));
            if (state.view === 'years') return chipKey(resolveChipKey(key, 12), yearTarget, (year) => api.pickYear(year));
            const action = resolveKey(state.focused, key, modifiers);
            if (!action) return false;
            if (action.type === 'select') select(state.focused);
            else moveFocus(action.to);
            return true;
        },
        clear() {
            if (state.mode === 'single') {
                if (state.value === null) return;
                commit({ value: null });
                options.onSelect?.(null);
                return;
            }
            const range = normalizeRange(null);
            commit({ range, hover: null });
            options.onRangeChange?.(range);
        },
        setValue(value) {
            const next = normalizeIso(value);
            if (next === state.value) return;
            commit(next ? { value: next, focused: next, anchor: visibleAnchor(state.anchor, next, config.months) } : { value: null });
        },
        setRange(range: DateRange | null) {
            const next = normalizeRange(range);
            if (sameRange(next, state.range)) return;
            const focused = next.start ?? state.focused;
            commit({ range: next, focused, anchor: visibleAnchor(state.anchor, focused, config.months) });
        },
        update(patch) {
            options = { ...options, ...patch };
            if (Object.keys(patch).every((key) => CALLBACKS.has(key))) return;
            config = buildConfig(options);
            const next: Partial<CalendarState> = {};
            if (patch.mode && patch.mode !== state.mode) Object.assign(next, { mode: patch.mode, hover: null });
            if ('today' in patch) next.today = normalizeIso(patch.today) ?? todayIso();
            commit(next);
        },
    };
    return api;
};
