import { describe, expect, it, vi } from 'vitest';
import { createSlider } from '@npmegar/nonio';

describe('createSlider', () => {
    it('moves one thumb with keys inside its limits', () => {
        const onChange = vi.fn();
        const onChangeEnd = vi.fn();
        const slider = createSlider({ defaultValue: 50, onChange, onChangeEnd });
        expect(slider.keyDown(0, 'ArrowRight')).toBe(true);
        expect(slider.value()).toBe(51);
        slider.keyDown(0, 'PageDown');
        expect(slider.value()).toBe(41);
        slider.keyDown(0, 'ArrowDown', true);
        expect(slider.value()).toBe(31);
        slider.keyDown(0, 'End');
        expect(slider.getSnapshot().percents).toEqual([100]);
        expect(slider.keyDown(0, 'ArrowUp')).toBe(true);
        expect(onChange).toHaveBeenCalledTimes(4);
        expect(onChangeEnd).toHaveBeenLastCalledWith(100);
        expect(slider.keyDown(0, 'x')).toBe(false);
    });

    it('keeps two thumbs apart by minDistance', () => {
        const slider = createSlider({ defaultValue: [20, 30] as const, minDistance: 5 });
        expect(slider.bounds(0)).toEqual([0, 25]);
        expect(slider.bounds(1)).toEqual([25, 100]);
        slider.keyDown(0, 'End');
        expect(slider.value()).toEqual([25, 30]);
        slider.keyDown(1, 'Home');
        expect(slider.value()).toEqual([25, 30]);
        slider.keyDown(1, 'PageUp');
        expect(slider.value()).toEqual([25, 40]);
        const snapshot = slider.getSnapshot();
        expect([snapshot.rangeStart, snapshot.rangeEnd]).toEqual([25, 40]);
    });

    it('drags the nearest thumb from the track and reports the end once', () => {
        const onChangeEnd = vi.fn();
        const slider = createSlider({ defaultValue: [20, 60] as const, onChangeEnd });
        slider.startDrag(0.5);
        expect(slider.getSnapshot().dragging).toBe(1);
        expect(slider.value()).toEqual([20, 50]);
        slider.moveDrag(0.1);
        expect(slider.value()).toEqual([20, 20]);
        expect(onChangeEnd).not.toHaveBeenCalled();
        slider.endDrag();
        expect(slider.getSnapshot().dragging).toBeNull();
        expect(onChangeEnd).toHaveBeenCalledOnce();
        slider.startDrag(0.3);
        expect(slider.getSnapshot().dragging).toBe(1);
        slider.endDrag();
        slider.startDrag(0.1);
        expect(slider.getSnapshot().dragging).toBe(0);
    });

    it('keeps the grab offset when a thumb is dragged directly', () => {
        const slider = createSlider({ defaultValue: 40 });
        slider.startDrag(0.43, 0);
        expect(slider.value()).toBe(40);
        slider.moveDrag(0.53);
        expect(slider.value()).toBe(50);
    });

    it('drags the whole range and stops at the edges', () => {
        const slider = createSlider({ defaultValue: [20, 40] as const, dragRange: true, step: 5 });
        slider.startDrag(0.3, 'range');
        expect(slider.getSnapshot().dragging).toBe('range');
        slider.moveDrag(0.42);
        expect(slider.value()).toEqual([30, 50]);
        slider.moveDrag(1);
        expect(slider.value()).toEqual([80, 100]);
        slider.endDrag();
        slider.moveRange(-100);
        expect(slider.value()).toEqual([0, 20]);
        expect(createSlider({ defaultValue: [20, 40] as const }).getSnapshot().dragRange).toBe(false);
    });

    it('asks before changing a controlled value and ignores input while disabled', () => {
        const onChange = vi.fn();
        const slider = createSlider({ value: 10, onChange });
        slider.keyDown(0, 'ArrowUp');
        expect(onChange).toHaveBeenCalledWith(11);
        expect(slider.value()).toBe(10);
        slider.update({ value: 11 });
        expect(slider.value()).toBe(11);
        slider.update({ disabled: true });
        expect(slider.keyDown(0, 'ArrowUp')).toBe(false);
        slider.startDrag(1);
        expect(slider.getSnapshot().dragging).toBeNull();
    });
});
