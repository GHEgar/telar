import { describe, expect, it } from 'vitest';
import { computePosition, parsePlacement } from '@npmegar/plomada';

const viewport = { left: 0, top: 0, width: 800, height: 600 };
const button = { left: 100, top: 100, width: 80, height: 30 };
const panel = { width: 200, height: 120 };

describe('computePosition', () => {
    it('places below, centered, with offset', () => {
        const position = computePosition(button, panel, viewport);
        expect(position).toMatchObject({ x: 40, y: 138, side: 'bottom', align: 'center', placement: 'bottom', flipped: false });
        expect(position.availableHeight).toBe(600 - 8 - 130 - 8);
        expect(position.arrow).toEqual({ x: 100, y: null });
    });

    it('aligns to start and end', () => {
        expect(computePosition(button, panel, viewport, { placement: 'bottom-start' }).x).toBe(100);
        expect(computePosition(button, panel, viewport, { placement: 'bottom-end' }).x).toBe(-20 + 8 + 20);
        expect(computePosition(button, panel, viewport, { placement: 'right-start', offset: 4 })).toMatchObject({ x: 184, y: 100, side: 'right' });
    });

    it('flips to the side with more room', () => {
        const low = { ...button, top: 540 };
        expect(computePosition(low, panel, viewport)).toMatchObject({ side: 'top', y: 540 - 8 - 120, flipped: true, placement: 'top' });
        expect(computePosition(low, panel, viewport, { flip: false }).side).toBe('bottom');
        const cramped = { left: 0, top: 0, width: 800, height: 200 };
        expect(computePosition({ ...button, top: 20 }, panel, cramped).side).toBe('bottom');
        expect(computePosition({ ...button, left: 10 }, panel, viewport, { placement: 'left' })).toMatchObject({ side: 'right', flipped: true });
    });

    it('shifts into the viewport and keeps the arrow on the reference', () => {
        const edge = { ...button, left: 740, width: 50 };
        const position = computePosition(edge, panel, viewport);
        expect(position.x).toBe(800 - 8 - 200);
        expect(position.arrow.x).toBe(765 - 592);
        expect(computePosition(edge, panel, viewport, { shift: false }).x).toBe(665);
        const tall = computePosition({ ...button, top: 5, height: 10 }, { width: 100, height: 300 }, viewport, { placement: 'right' });
        expect(tall.y).toBe(8);
        expect(tall.arrow).toEqual({ x: null, y: 8 });
    });

    it('parses placements', () => {
        expect(parsePlacement('top')).toEqual(['top', 'center']);
        expect(parsePlacement('left-end')).toEqual(['left', 'end']);
    });
});
