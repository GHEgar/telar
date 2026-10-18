import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import type { Pair, Slider, SliderOptions, SliderSnapshot, SliderValue } from '../core/index.js';
import { buildSlider } from '../core/slider.js';
import { ratioFromPoint, type LabelProps, type RangeProps, type RootProps, type ThumbProps, type TrackProps } from './props.js';

export interface UseSliderOptions<V extends SliderValue = number> extends SliderOptions<V> {
    getValueText?: (value: number, index: number) => string;
    getAriaLabel?: (index: number) => string;
}

export interface UseSlider<V extends SliderValue = number> extends SliderSnapshot {
    value: V;
    slider: Slider<V>;
    moveRange(by: number): void;
    getRootProps(): RootProps;
    getLabelProps(): LabelProps;
    getTrackProps(): TrackProps;
    getRangeProps(): RangeProps;
    getThumbProps(index: number): ThumbProps;
}

interface Point {
    clientX: number;
    clientY: number;
}

export interface UseSliderHook {
    (options?: UseSliderOptions): UseSlider;
    (options: UseSliderOptions<Pair>): UseSlider<Pair>;
}

const useSliderOf = <V extends SliderValue>(options: UseSliderOptions<V> = {}): UseSlider<V> => {
    const [slider] = useState(() => buildSlider<V>(options));
    const snapshot = useSyncExternalStore(slider.subscribe, slider.getSnapshot, slider.getSnapshot);
    const { getValueText, getAriaLabel, ...settings } = options;
    const labelId = useId();
    const track = useRef<HTMLElement | null>(null);
    const thumbs = useRef(new Map<number, HTMLElement>());
    const stop = useRef<(() => void) | null>(null);

    useLayoutEffect(() => {
        slider.update(settings);
    });

    useEffect(() => () => {
        stop.current?.();
    }, []);

    const ratio = useCallback((point: Point): number => {
        const element = track.current;
        if (!element) return 0;
        return ratioFromPoint(element.getBoundingClientRect(), point.clientX, point.clientY, slider.getSnapshot().orientation);
    }, [slider]);

    const begin = (event: PointerEvent, target?: number | 'range'): void => {
        if (event.defaultPrevented || event.button !== 0 || slider.getSnapshot().disabled || !track.current) return;
        event.preventDefault();
        stop.current?.();
        slider.startDrag(ratio(event), target);
        const dragging = slider.getSnapshot().dragging;
        if (dragging === null) return;
        if (typeof dragging === 'number') thumbs.current.get(dragging)?.focus();
        const onMove = (move: globalThis.PointerEvent): void => slider.moveDrag(ratio(move));
        const finish = (): void => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', finish);
            document.removeEventListener('pointercancel', finish);
            stop.current = null;
            slider.endDrag();
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', finish);
        document.addEventListener('pointercancel', finish);
        stop.current = finish;
    };

    const { orientation, disabled, dragging, range } = snapshot;
    const flags = {
        ...(disabled ? { 'data-disabled': true as const } : {}),
    };
    const value = (range ? [snapshot.values[0], snapshot.values[1]] : snapshot.values[0]) as V;

    return {
        ...snapshot,
        value,
        slider,
        moveRange: slider.moveRange,
        getRootProps: () => ({
            'data-orientation': orientation,
            ...flags,
            ...(dragging === null ? {} : { 'data-dragging': true as const }),
            ...(range ? { 'data-range': true as const } : {}),
        }),
        getLabelProps: () => ({
            id: labelId,
            onClick: () => thumbs.current.get(0)?.focus(),
        }),
        getTrackProps: () => ({
            ref: (element: HTMLElement | null) => {
                track.current = element;
            },
            'data-orientation': orientation,
            ...flags,
            onPointerDown: (event) => begin(event),
        }),
        getRangeProps: () => ({
            'data-orientation': orientation,
            ...(snapshot.dragRange ? { 'data-draggable': true as const } : {}),
            ...(dragging === 'range' ? { 'data-dragging': true as const } : {}),
            onPointerDown: (event) => begin(event, snapshot.dragRange ? 'range' : undefined),
        }),
        getThumbProps: (index) => {
            const current = snapshot.values[index] ?? snapshot.min;
            const [low, high] = slider.bounds(index);
            const text = getValueText?.(current, index);
            const label = getAriaLabel?.(index);
            return {
                ref: (element: HTMLElement | null) => {
                    if (element) thumbs.current.set(index, element);
                    else thumbs.current.delete(index);
                },
                role: 'slider',
                tabIndex: 0,
                'aria-valuenow': current,
                'aria-valuemin': low,
                'aria-valuemax': high,
                ...(text === undefined ? {} : { 'aria-valuetext': text }),
                'aria-orientation': orientation,
                ...(disabled ? { 'aria-disabled': true as const } : {}),
                ...(label === undefined ? { 'aria-labelledby': labelId } : { 'aria-label': label }),
                'data-thumb': index,
                'data-orientation': orientation,
                ...(dragging === index ? { 'data-dragging': true as const } : {}),
                ...flags,
                onKeyDown: (event) => {
                    if (slider.keyDown(index, event.key, event.shiftKey)) event.preventDefault();
                },
                onPointerDown: (event) => begin(event, index),
            };
        },
    };
};

export const useSlider: UseSliderHook = useSliderOf;
