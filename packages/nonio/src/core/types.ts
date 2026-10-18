export type Orientation = 'horizontal' | 'vertical';

export type Pair = readonly [number, number];

export type SliderValue = number | Pair;

export type Dragging = number | 'range' | null;

export interface SliderOptions<V extends SliderValue = number> {
    value?: V;
    defaultValue?: V;
    onChange?: (value: V) => void;
    onChangeEnd?: (value: V) => void;
    min?: number;
    max?: number;
    step?: number;
    pageStep?: number;
    minDistance?: number;
    dragRange?: boolean;
    orientation?: Orientation;
    disabled?: boolean;
}

export interface SliderSnapshot {
    values: readonly number[];
    percents: readonly number[];
    rangeStart: number;
    rangeEnd: number;
    dragging: Dragging;
    min: number;
    max: number;
    step: number;
    orientation: Orientation;
    disabled: boolean;
    range: boolean;
    dragRange: boolean;
}

export interface Slider<V extends SliderValue = number> {
    subscribe(listener: () => void): () => void;
    getSnapshot(): SliderSnapshot;
    value(): V;
    bounds(index: number): readonly [number, number];
    setThumb(index: number, value: number): boolean;
    keyDown(index: number, key: string, shift?: boolean): boolean;
    startDrag(ratio: number, target?: number | 'range'): void;
    moveDrag(ratio: number): void;
    endDrag(): void;
    moveRange(by: number): void;
    update(patch: SliderOptions<V>): void;
}

export interface CreateSlider {
    (options?: SliderOptions): Slider;
    (options: SliderOptions<Pair>): Slider<Pair>;
}
