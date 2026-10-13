import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePosition, type UsePositionOptions } from '@ghegar/plomada/react';

const rect = (left: number, top: number, width: number, height: number) => ({
    left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}),
});

let buttonTop = 100;

beforeEach(() => {
    buttonTop = 100;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        return this.dataset.role === 'reference' ? rect(100, buttonTop, 80, 30) : rect(0, 0, 200, 120);
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(120);
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: null });
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(600);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

const Popover = (options: UsePositionOptions) => {
    const position = usePosition(options);
    return (
        <>
            <button data-role="reference" {...position.getReferenceProps()}>open</button>
            {options.open !== false && <div data-testid="floating" {...position.getFloatingProps()}>panel</div>}
        </>
    );
};

describe('usePosition', () => {
    it('positions the floating element before paint', () => {
        render(<Popover placement="bottom-start" sameWidth />);
        const floating = screen.getByTestId('floating');
        expect(floating.style.position).toBe('fixed');
        expect(floating.style.left).toBe('100px');
        expect(floating.style.top).toBe('138px');
        expect(floating.style.width).toBe('80px');
        expect(floating.dataset.side).toBe('bottom');
        expect(floating.style.visibility).toBe('');
    });

    it('updates on scroll and flips near the bottom', async () => {
        render(<Popover />);
        buttonTop = 540;
        await act(async () => {
            window.dispatchEvent(new Event('scroll'));
            await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        });
        const floating = screen.getByTestId('floating');
        expect(floating.dataset.side).toBe('top');
        expect(floating.style.top).toBe(`${540 - 8 - 120}px`);
    });

    it('stays hidden while there is nothing to measure', () => {
        const Lonely = () => {
            const position = usePosition();
            return <div data-testid="floating" {...position.getFloatingProps()}>panel</div>;
        };
        render(<Lonely />);
        expect(screen.getByTestId('floating').style.visibility).toBe('hidden');
    });
});
