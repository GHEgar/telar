import { offsetsFor, targetIndex, type Span } from './geometry.js';
import { DEFAULT_LABELS, type SortableLabels } from './labels.js';
import type { Sortable, SortableOptions, SortableSnapshot, SortMode } from './types.js';

const NBSP = ' ';

export const createSortable = (initial: SortableOptions): Sortable => {
    let options = initial;
    let active: number | null = null;
    let over: number | null = null;
    let mode: SortMode | null = null;
    let spans: readonly Span[] = [];
    let delta = 0;
    let announcement = '';
    const listeners = new Set<() => void>();

    const labels = (): SortableLabels => ({ ...DEFAULT_LABELS, ...options.labels });
    const labelOf = (index: number): string => options.getLabel?.(index) ?? `Item ${index + 1}`;

    const build = (): SortableSnapshot => ({
        active,
        over,
        mode,
        offsets: active === null || over === null || spans.length !== options.count
            ? Array.from({ length: options.count }, () => 0)
            : offsetsFor(spans, active, over, mode === 'pointer' ? delta : null),
        announcement,
    });
    let snapshot = build();

    const commit = (): void => {
        snapshot = build();
        listeners.forEach((listener) => listener());
    };

    const say = (text: string): void => {
        announcement = text === announcement ? `${text}${NBSP}` : text;
    };

    const reset = (): void => {
        active = null;
        over = null;
        mode = null;
        spans = [];
        delta = 0;
    };

    const move = (to: number): void => {
        if (active === null || mode !== 'keyboard') return;
        const next = Math.min(Math.max(to, 0), options.count - 1);
        if (next === over) return;
        over = next;
        say(labels().moved(labelOf(active), next + 1, options.count));
        commit();
    };

    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSnapshot: () => snapshot,
        grab(index, grabMode, measured = []) {
            if (active !== null || index < 0 || index >= options.count) return false;
            active = index;
            over = index;
            mode = grabMode;
            spans = measured;
            delta = 0;
            say(labels().grabbed(labelOf(index), index + 1, options.count));
            commit();
            return true;
        },
        move,
        moveBy: (by) => move((over ?? 0) + by),
        moveToEdge: (edge) => move(edge === 'start' ? 0 : options.count - 1),
        drag(next) {
            if (active === null || mode !== 'pointer') return;
            delta = next;
            const target = spans.length === options.count ? targetIndex(spans, active, next) : active;
            if (target !== over) say(labels().moved(labelOf(active), target + 1, options.count));
            over = target;
            commit();
        },
        drop() {
            if (active === null || over === null) return null;
            const result = { from: active, to: over };
            say(labels().dropped(labelOf(active), over + 1, options.count));
            reset();
            commit();
            if (result.from !== result.to) options.onReorder?.(result.from, result.to);
            return result;
        },
        cancel() {
            if (active === null) return;
            say(labels().cancelled(labelOf(active), active + 1, options.count));
            reset();
            commit();
        },
        update(patch) {
            const recount = patch.count !== undefined && patch.count !== options.count;
            options = { ...options, ...patch };
            if (!recount) return;
            reset();
            commit();
        },
    };
};
