import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePosition, type UsePositionOptions } from '@npmegar/plomada/react';

const rect = (left: number, top: number, width: number, height: number) => ({
    left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}),
});

let referenceTop = 100;

beforeEach(() => {
    referenceTop = 100;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        if (this.dataset.role === 'reference') return rect(100, referenceTop, 80, 30);
        if (this.dataset.role === 'scroller') return rect(0, 0, 400, 200);
        if (this.dataset.role === 'container') return rect(50, 40, 600, 400);
        return rect(0, 0, 200, 120);
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(120);
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            return this.closest('[data-role="container"]');
        },
    });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: null });
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(600);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLElement.prototype, 'offsetParent');
});

const Scene = (options: UsePositionOptions) => {
    const position = usePosition(options);
    return (
        <div data-role="container" style={{ position: 'relative' }}>
            <div data-role="scroller" style={{ overflow: 'auto' }}>
                <button data-role="reference" {...position.getReferenceProps()}>open</button>
            </div>
            <div data-testid="floating" {...position.getFloatingProps()}>panel</div>
        </div>
    );
};

describe('usePosition options', () => {
    it('positions against the offset parent with the absolute strategy', () => {
        render(<Scene strategy="absolute" placement="bottom-start" />);
        const floating = screen.getByTestId('floating');
        expect(floating.style.position).toBe('absolute');
        expect(floating.style.left).toBe(`${100 - 50}px`);
        expect(floating.style.top).toBe(`${138 - 40}px`);
    });

    it('reports and hides a reference scrolled out of its container', () => {
        referenceTop = 260;
        render(<Scene hide />);
        const floating = screen.getByTestId('floating');
        expect(floating.dataset.referenceHidden).toBe('true');
        expect(floating.style.visibility).toBe('hidden');
    });

    it('only reports when hide is off', () => {
        referenceTop = 260;
        render(<Scene />);
        const floating = screen.getByTestId('floating');
        expect(floating.dataset.referenceHidden).toBe('true');
        expect(floating.style.visibility).toBe('');
    });
});
