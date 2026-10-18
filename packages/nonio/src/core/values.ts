export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const decimals = (value: number): number => {
    if (!Number.isFinite(value)) return 0;
    const [mantissa = '', exponent] = String(value).split('e-');
    const dot = mantissa.indexOf('.');
    return (dot < 0 ? 0 : mantissa.length - dot - 1) + Number(exponent ?? 0);
};

export const roundTo = (value: number, reference: readonly number[]): number => {
    const precision = Math.max(...reference.map(decimals));
    return Number(value.toFixed(Math.min(precision, 20)));
};

export const snap = (value: number, min: number, max: number, step: number): number => {
    const bounded = clamp(value, min, max);
    if (step <= 0) return bounded;
    const snapped = roundTo(min + Math.round((bounded - min) / step) * step, [step, min]);
    if (snapped > max || Math.abs(max - bounded) < Math.abs(snapped - bounded)) return max;
    return snapped;
};

export const percentOf = (value: number, min: number, max: number): number => (max === min ? 0 : ((value - min) / (max - min)) * 100);

export const valueAt = (ratio: number, min: number, max: number): number => min + clamp(ratio, 0, 1) * (max - min);
