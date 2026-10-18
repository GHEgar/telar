export interface Point {
    x: number;
    y: number;
}

export interface RadialPosition extends Point {
    angle: number;
}

export interface RadialLayoutOptions {
    radius?: number;
    startAngle?: number;
    sweep?: number;
}

const round = (value: number): number => Math.round(value * 1000) / 1000 + 0;

export const radialLayout = (count: number, { radius = 80, startAngle = -90, sweep = 360 }: RadialLayoutOptions = {}): RadialPosition[] => {
    const full = Math.abs(sweep) >= 360;
    const slots = full ? count : Math.max(count - 1, 1);
    return Array.from({ length: count }, (_, index) => {
        const angle = startAngle + (count === 1 && !full ? sweep / 2 : (sweep * index) / slots);
        const radians = (angle * Math.PI) / 180;
        return { x: round(radius * Math.cos(radians)), y: round(radius * Math.sin(radians)), angle: round(angle) };
    });
};

export const clampCenter = (point: Point, reach: number, viewport: { width: number; height: number }): Point => {
    const axis = (value: number, size: number): number => (size < reach * 2 ? size / 2 : Math.min(Math.max(value, reach), size - reach));
    return { x: axis(point.x, viewport.width), y: axis(point.y, viewport.height) };
};
