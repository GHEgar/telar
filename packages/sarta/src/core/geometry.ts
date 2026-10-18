export interface Span {
    start: number;
    end: number;
}

export const reorder = <T>(list: readonly T[], from: number, to: number): T[] => {
    const next = [...list];
    if (from < 0 || from >= list.length || from === to) return next;
    const [item] = next.splice(from, 1) as [T];
    next.splice(Math.min(Math.max(to, 0), next.length), 0, item);
    return next;
};

const middle = (span: Span): number => (span.start + span.end) / 2;

export const targetIndex = (spans: readonly Span[], from: number, delta: number): number => {
    const own = spans[from];
    if (!own) return from;
    const center = middle(own) + delta;
    let to = from;
    spans.forEach((span, index) => {
        if (index < from && center < middle(span)) to -= 1;
        if (index > from && center > middle(span)) to += 1;
    });
    return to;
};

export const offsetsFor = (spans: readonly Span[], from: number, to: number, delta: number | null): number[] => {
    const offsets = spans.map(() => 0);
    const own = spans[from];
    const target = spans[to];
    if (!own || !target) return offsets;
    const size = own.end - own.start;
    const after = spans[from + 1];
    const before = spans[from - 1];
    const up = after ? after.start - own.start : size;
    const down = before ? own.end - before.end : size;
    spans.forEach((_, index) => {
        if (to > from && index > from && index <= to) offsets[index] = -up;
        if (to < from && index >= to && index < from) offsets[index] = down;
    });
    if (delta !== null) offsets[from] = delta;
    else if (to > from) offsets[from] = target.end - own.end;
    else if (to < from) offsets[from] = target.start - own.start;
    return offsets;
};
