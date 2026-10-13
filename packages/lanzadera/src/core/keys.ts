export type Orientation = 'horizontal' | 'vertical' | 'both';

export interface MoveOptions {
    count: number;
    orientation?: Orientation;
    loop?: boolean;
    columns?: number;
    rtl?: boolean;
    isDisabled?: (index: number) => boolean;
}

type Step = { by: number } | { to: 'first' | 'last' };

const stepFor = (key: string, { orientation = 'both', columns, rtl = false }: MoveOptions): Step | null => {
    const horizontal = orientation !== 'vertical';
    const vertical = orientation !== 'horizontal';
    const forward = rtl ? -1 : 1;
    switch (key) {
        case 'ArrowRight': return horizontal ? { by: forward } : null;
        case 'ArrowLeft': return horizontal ? { by: -forward } : null;
        case 'ArrowDown': return vertical ? { by: columns ?? 1 } : null;
        case 'ArrowUp': return vertical ? { by: -(columns ?? 1) } : null;
        case 'Home': return { to: 'first' };
        case 'End': return { to: 'last' };
        default: return null;
    }
};

const firstEnabled = (from: number, direction: 1 | -1, options: MoveOptions): number | null => {
    for (let index = from; index >= 0 && index < options.count; index += direction) {
        if (!options.isDisabled?.(index)) return index;
    }
    return null;
};

const advance = (current: number, by: number, options: MoveOptions): number | null => {
    const { count, loop = true } = options;
    let index = current;
    for (let tries = 0; tries < count; tries += 1) {
        let next = index + by;
        if (next < 0 || next >= count) {
            if (!loop || Math.abs(by) !== 1) return null;
            next = (next + count) % count;
        }
        if (!options.isDisabled?.(next)) return next;
        index = next;
    }
    return null;
};

export const moveIndex = (current: number, key: string, options: MoveOptions): number | null => {
    if (options.count <= 0) return null;
    const step = stepFor(key, options);
    if (!step) return null;
    if ('to' in step) {
        return step.to === 'first' ? firstEnabled(0, 1, options) : firstEnabled(options.count - 1, -1, options);
    }
    const next = advance(current, step.by, options);
    return next === current ? null : next;
};
