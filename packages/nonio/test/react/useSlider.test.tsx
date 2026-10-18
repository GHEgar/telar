import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSlider, type Pair, type UseSliderOptions } from '@npmegar/nonio/react';

const box = { left: 100, top: 50, width: 200, height: 200, right: 300, bottom: 250, x: 100, y: 50, toJSON: () => ({}) };

const Opacity = (options: UseSliderOptions) => {
    const slider = useSlider(options);
    return (
        <div {...slider.getRootProps()} data-testid="root">
            <span {...slider.getLabelProps()}>Opacity</span>
            <div {...slider.getTrackProps()} data-testid="track">
                <div {...slider.getRangeProps()} />
                <div {...slider.getThumbProps(0)} />
            </div>
            <output>{slider.value}</output>
        </div>
    );
};

const Window = (options: UseSliderOptions<Pair>) => {
    const slider = useSlider(options);
    return (
        <div {...slider.getTrackProps()} data-testid="track">
            <div {...slider.getRangeProps()} data-testid="range" />
            <div {...slider.getThumbProps(0)} />
            <div {...slider.getThumbProps(1)} />
            <output>{slider.value.join('-')}</output>
        </div>
    );
};

const stubTrack = (): HTMLElement => {
    const track = screen.getByTestId('track');
    track.getBoundingClientRect = () => box as DOMRect;
    return track;
};

afterEach(cleanup);

describe('useSlider', () => {
    it('exposes the slider role with its value, limits, text and label', () => {
        render(<Opacity defaultValue={40} getValueText={(value) => `${value} %`} />);
        const thumb = screen.getByRole('slider', { name: 'Opacity' });
        expect(thumb.getAttribute('aria-valuenow')).toBe('40');
        expect(thumb.getAttribute('aria-valuemin')).toBe('0');
        expect(thumb.getAttribute('aria-valuemax')).toBe('100');
        expect(thumb.getAttribute('aria-valuetext')).toBe('40 %');
        expect(thumb.getAttribute('aria-orientation')).toBe('horizontal');
        expect(thumb.tabIndex).toBe(0);
        fireEvent.click(screen.getByText('Opacity'));
        expect(document.activeElement).toBe(thumb);
    });

    it('moves with the keyboard and prevents the page from scrolling', () => {
        const onChangeEnd = vi.fn();
        render(<Opacity defaultValue={40} onChangeEnd={onChangeEnd} />);
        const thumb = screen.getByRole('slider');
        const event = fireEvent.keyDown(thumb, { key: 'ArrowUp' });
        expect(event).toBe(false);
        expect(thumb.getAttribute('aria-valuenow')).toBe('41');
        fireEvent.keyDown(thumb, { key: 'PageUp' });
        fireEvent.keyDown(thumb, { key: 'Home' });
        expect(screen.getByRole('status', { hidden: true }).textContent).toBe('0');
        expect(onChangeEnd).toHaveBeenLastCalledWith(0);
        expect(fireEvent.keyDown(thumb, { key: 'Tab' })).toBe(true);
    });

    it('drags from the track in both orientations', () => {
        const onChangeEnd = vi.fn();
        const { unmount } = render(<Opacity defaultValue={0} onChangeEnd={onChangeEnd} />);
        const track = stubTrack();
        fireEvent.pointerDown(track, { clientX: 150, clientY: 0, button: 0 });
        const thumb = screen.getByRole('slider');
        expect(thumb.getAttribute('aria-valuenow')).toBe('25');
        expect(document.activeElement).toBe(thumb);
        expect(screen.getByTestId('root').hasAttribute('data-dragging')).toBe(true);
        fireEvent.pointerMove(document, { clientX: 260, clientY: 0 });
        expect(thumb.getAttribute('aria-valuenow')).toBe('80');
        fireEvent.pointerUp(document);
        expect(onChangeEnd).toHaveBeenCalledWith(80);
        expect(screen.getByTestId('root').hasAttribute('data-dragging')).toBe(false);
        fireEvent.pointerMove(document, { clientX: 100, clientY: 0 });
        expect(thumb.getAttribute('aria-valuenow')).toBe('80');
        unmount();
        render(<Opacity defaultValue={0} orientation="vertical" />);
        fireEvent.pointerDown(stubTrack(), { clientX: 0, clientY: 100, button: 0 });
        expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('75');
        expect(screen.getByRole('slider').getAttribute('aria-orientation')).toBe('vertical');
    });

    it('keeps two thumbs ordered and drags the window between them', () => {
        render(<Window defaultValue={[20, 40]} dragRange minDistance={10} getAriaLabel={(index) => (index ? 'End' : 'Start')} />);
        const start = screen.getByRole('slider', { name: 'Start' });
        const end = screen.getByRole('slider', { name: 'End' });
        expect(start.getAttribute('aria-valuemax')).toBe('30');
        expect(end.getAttribute('aria-valuemin')).toBe('30');
        fireEvent.keyDown(start, { key: 'End' });
        expect(start.getAttribute('aria-valuenow')).toBe('30');
        stubTrack();
        fireEvent.pointerDown(screen.getByTestId('range'), { clientX: 170, clientY: 0, button: 0 });
        expect(screen.getByTestId('range').hasAttribute('data-dragging')).toBe(true);
        fireEvent.pointerMove(document, { clientX: 190, clientY: 0 });
        expect(screen.getByText('40-50')).toBeTruthy();
        fireEvent.pointerUp(document);
    });

    it('can be controlled and disabled', () => {
        const Controlled = () => {
            const [value, setValue] = useState(10);
            return <Opacity value={value} onChange={(next) => setValue(Math.min(next, 12))} />;
        };
        render(<Controlled />);
        const thumb = screen.getByRole('slider');
        fireEvent.keyDown(thumb, { key: 'ArrowUp' });
        fireEvent.keyDown(thumb, { key: 'ArrowUp' });
        fireEvent.keyDown(thumb, { key: 'ArrowUp' });
        expect(thumb.getAttribute('aria-valuenow')).toBe('12');
        cleanup();
        render(<Opacity defaultValue={10} disabled />);
        const disabled = screen.getByRole('slider');
        expect(disabled.getAttribute('aria-disabled')).toBe('true');
        fireEvent.keyDown(disabled, { key: 'ArrowUp' });
        fireEvent.pointerDown(stubTrack(), { clientX: 300, clientY: 0, button: 0 });
        expect(disabled.getAttribute('aria-valuenow')).toBe('10');
    });
});
