import { keyValue } from './keys.js';
import type { CreateSlider, Dragging, Slider, SliderOptions, SliderSnapshot, SliderValue } from './types.js';
import { clamp, percentOf, roundTo, snap, valueAt } from './values.js';

const sameList = (a: readonly number[], b: readonly number[]): boolean => a.length === b.length && a.every((value, index) => value === b[index]);

const sameSnapshot = (a: SliderSnapshot, b: SliderSnapshot): boolean => sameList(a.values, b.values)
    && a.dragging === b.dragging && a.min === b.min && a.max === b.max && a.step === b.step
    && a.orientation === b.orientation && a.disabled === b.disabled && a.dragRange === b.dragRange;

const listOf = (value: SliderValue): number[] => (typeof value === 'number' ? [value] : [value[0], value[1]]);

export const buildSlider = <V extends SliderValue>(initial: SliderOptions<V> = {}): Slider<V> => {
    let options = initial;
    const range = typeof (initial.value ?? initial.defaultValue ?? 0) !== 'number';
    const min = (): number => options.min ?? 0;
    const max = (): number => Math.max(options.max ?? 100, min());
    const step = (): number => options.step ?? 1;
    const gap = (): number => (range ? Math.max(options.minDistance ?? 0, 0) : 0);

    const normalize = (list: readonly number[]): number[] => {
        const sorted = [...list].sort((a, b) => a - b).map((value) => clamp(value, min(), max()));
        if (sorted.length === 2 && (sorted[1] ?? 0) - (sorted[0] ?? 0) < gap()) {
            sorted[1] = Math.min((sorted[0] ?? 0) + gap(), max());
            sorted[0] = Math.max((sorted[1] ?? 0) - gap(), min());
        }
        return sorted;
    };

    const start = initial.value ?? initial.defaultValue;
    let values = normalize(start === undefined ? (range ? [min(), max()] : [min()]) : listOf(start));
    let dragging: Dragging = null;
    let anchor = 0;
    let startValues: readonly number[] = values;
    let latest: readonly number[] = values;
    const listeners = new Set<() => void>();

    const build = (): SliderSnapshot => {
        const percents = values.map((value) => percentOf(value, min(), max()));
        return {
            values,
            percents,
            rangeStart: range ? percents[0] ?? 0 : 0,
            rangeEnd: percents[range ? 1 : 0] ?? 0,
            dragging,
            min: min(),
            max: max(),
            step: step(),
            orientation: options.orientation ?? 'horizontal',
            disabled: options.disabled ?? false,
            range,
            dragRange: range && (options.dragRange ?? false),
        };
    };
    let snapshot = build();

    const commit = (): void => {
        const next = build();
        if (sameSnapshot(snapshot, next)) return;
        snapshot = next;
        listeners.forEach((listener) => listener());
    };

    const valueOf = (list: readonly number[]): V => (range ? [list[0], list[1]] : list[0]) as V;

    const emit = (list: number[]): boolean => {
        if (sameList(list, values)) return false;
        latest = list;
        if (options.value === undefined) {
            values = list;
            commit();
        }
        options.onChange?.(valueOf(list));
        return true;
    };

    const bounds = (index: number): readonly [number, number] => {
        if (!range) return [min(), max()];
        return index === 0 ? [min(), (values[1] ?? max()) - gap()] : [(values[0] ?? min()) + gap(), max()];
    };

    const place = (index: number, raw: number, exact = false): boolean => {
        const [low, high] = bounds(index);
        const next = clamp(exact ? raw : snap(raw, min(), max(), step()), low, high);
        const list = [...values];
        list[index] = next;
        return emit(list);
    };

    const shift = (from: readonly number[], delta: number): boolean => {
        const [low = 0, high = 0] = from;
        const width = high - low;
        const steps = step() > 0 ? Math.round(delta / step()) * step() : delta;
        const next = roundTo(clamp(low + steps, min(), max() - width), [step(), min(), low]);
        return emit([next, roundTo(next + width, [step(), min(), low, high])]);
    };

    const nearest = (raw: number): number => {
        if (!range) return 0;
        const [low = 0, high = 0] = values;
        const toLow = Math.abs(raw - low);
        const toHigh = Math.abs(raw - high);
        if (toLow === toHigh) return raw > low ? 1 : 0;
        return toLow < toHigh ? 0 : 1;
    };

    const end = (): void => options.onChangeEnd?.(valueOf(latest));

    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSnapshot: () => snapshot,
        value: () => valueOf(values),
        bounds,
        setThumb: (index, value) => place(index, value),
        keyDown(index, key, shiftKey = false) {
            if (options.disabled || index < 0 || index >= values.length) return false;
            const [low, high] = bounds(index);
            const pageStep = options.pageStep ?? step() * 10;
            const result = keyValue(key, values[index] ?? 0, { low, high, step: step(), pageStep, shift: shiftKey });
            if (!result) return false;
            if (place(index, result.value, result.exact)) end();
            return true;
        },
        startDrag(ratio, target) {
            if (options.disabled) return;
            const raw = valueAt(ratio, min(), max());
            if (target === 'range') {
                if (!snapshot.dragRange) return;
                dragging = 'range';
                anchor = raw;
                startValues = values;
                commit();
                return;
            }
            const index = target ?? nearest(raw);
            dragging = index;
            anchor = target === undefined ? 0 : raw - (values[index] ?? 0);
            commit();
            place(index, raw - anchor);
        },
        moveDrag(ratio) {
            if (dragging === null) return;
            const raw = valueAt(ratio, min(), max());
            if (dragging === 'range') shift(startValues, raw - anchor);
            else place(dragging, raw - anchor);
        },
        endDrag() {
            if (dragging === null) return;
            dragging = null;
            commit();
            end();
        },
        moveRange(by) {
            if (!range || options.disabled) return;
            if (shift(values, by)) end();
        },
        update(patch) {
            options = { ...options, ...patch };
            if (patch.value !== undefined) values = normalize(listOf(patch.value));
            else values = normalize(values);
            latest = values;
            commit();
        },
    };
};

export const createSlider: CreateSlider = buildSlider;
