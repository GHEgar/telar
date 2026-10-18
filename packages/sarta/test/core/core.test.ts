import { describe, expect, it, vi } from 'vitest';
import { createSortable, offsetsFor, reorder, targetIndex } from '@npmegar/sarta';

const spans = [
    { start: 0, end: 40 },
    { start: 50, end: 70 },
    { start: 80, end: 140 },
    { start: 150, end: 190 },
];

describe('geometry', () => {
    it('reorders a copy of the list', () => {
        const list = ['a', 'b', 'c', 'd'];
        expect(reorder(list, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
        expect(reorder(list, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
        expect(reorder(list, 9, 0)).toEqual(list);
        expect(list).toEqual(['a', 'b', 'c', 'd']);
    });

    it('finds the target by centers with uneven sizes', () => {
        expect(targetIndex(spans, 0, 0)).toBe(0);
        expect(targetIndex(spans, 0, 45)).toBe(1);
        expect(targetIndex(spans, 0, 100)).toBe(2);
        expect(targetIndex(spans, 3, -61)).toBe(2);
        expect(targetIndex(spans, 3, -200)).toBe(0);
    });

    it('shifts the others by the dragged size plus its gap', () => {
        expect(offsetsFor(spans, 0, 2, null)).toEqual([100, -50, -50, 0]);
        expect(offsetsFor(spans, 3, 1, null)).toEqual([0, 50, 50, -100]);
        expect(offsetsFor(spans, 1, 1, 7)).toEqual([0, 7, 0, 0]);
    });
});

describe('createSortable', () => {
    const labels = ['Roads', 'Rivers', 'Parks'];

    it('announces each keyboard step and reports the move', () => {
        const onReorder = vi.fn();
        const sortable = createSortable({ count: 3, onReorder, getLabel: (index) => labels[index] ?? '' });
        expect(sortable.grab(0, 'keyboard')).toBe(true);
        expect(sortable.getSnapshot().announcement).toBe('Picked up Roads. Position 1 of 3.');
        sortable.moveBy(1);
        expect(sortable.getSnapshot().announcement).toBe('Roads moved to position 2 of 3.');
        sortable.moveToEdge('end');
        sortable.moveBy(1);
        expect(sortable.getSnapshot().over).toBe(2);
        expect(sortable.drop()).toEqual({ from: 0, to: 2 });
        expect(onReorder).toHaveBeenCalledWith(0, 2);
        expect(sortable.getSnapshot().announcement).toBe('Roads dropped at position 3 of 3.');
        expect(sortable.getSnapshot().active).toBeNull();
    });

    it('cancels back to the start and does not report a drop in place', () => {
        const onReorder = vi.fn();
        const sortable = createSortable({ count: 3, onReorder, getLabel: (index) => labels[index] ?? '' });
        sortable.grab(2, 'keyboard');
        sortable.moveToEdge('start');
        sortable.cancel();
        expect(sortable.getSnapshot().announcement).toBe('Reorder cancelled. Parks is back at position 3 of 3.');
        sortable.grab(1, 'keyboard');
        sortable.drop();
        expect(onReorder).not.toHaveBeenCalled();
    });

    it('follows the pointer with the measured spans', () => {
        const sortable = createSortable({ count: 4 });
        sortable.grab(0, 'pointer', spans);
        sortable.moveBy(1);
        expect(sortable.getSnapshot().over).toBe(0);
        sortable.drag(100);
        expect(sortable.getSnapshot().over).toBe(2);
        expect(sortable.getSnapshot().offsets).toEqual([100, -50, -50, 0]);
        expect(sortable.getSnapshot().announcement).toBe('Item 1 moved to position 3 of 4.');
        expect(sortable.drop()).toEqual({ from: 0, to: 2 });
        expect(sortable.getSnapshot().offsets).toEqual([0, 0, 0, 0]);
    });
});
