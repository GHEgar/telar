import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clampCenter, radialLayout, useRadialMenu, type UseRadialMenuOptions } from '@npmegar/abanico';

const TOOLS = ['Measure', 'Identify', 'Draw', 'Share'];

const Canvas = (options: Partial<UseRadialMenuOptions>) => {
    const menu = useRadialMenu({ count: TOOLS.length, label: 'Tools', getLabel: (index) => TOOLS[index] ?? '', ...options });
    return (
        <>
            <button type="button">outside</button>
            <div {...menu.getTargetProps()} tabIndex={0} data-testid="map" />
            {menu.open && (
                <div {...menu.getMenuProps()} data-x={menu.center?.x} data-y={menu.center?.y}>
                    {TOOLS.map((tool, index) => <div key={tool} {...menu.getItemProps(index)} data-left={menu.getItemPosition(index).x}>{tool}</div>)}
                </div>
            )}
        </>
    );
};

const item = (name: string): HTMLElement => screen.getByRole('menuitem', { name });

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('radialLayout', () => {
    it('places a full circle clockwise from the top and an arc from end to end', () => {
        expect(radialLayout(4, { radius: 10 })).toEqual([
            { x: 0, y: -10, angle: -90 },
            { x: 10, y: 0, angle: 0 },
            { x: 0, y: 10, angle: 90 },
            { x: -10, y: 0, angle: 180 },
        ]);
        expect(radialLayout(3, { radius: 10, startAngle: 180, sweep: 180 }).map((position) => position.angle)).toEqual([180, 270, 360]);
        expect(clampCenter({ x: 5, y: 500 }, 100, { width: 800, height: 600 })).toEqual({ x: 100, y: 500 });
    });
});

describe('useRadialMenu', () => {
    it('opens at the right-click point and focuses the first tool', () => {
        render(<Canvas />);
        const map = screen.getByTestId('map');
        map.focus();
        expect(fireEvent.contextMenu(map, { clientX: 400, clientY: 300 })).toBe(false);
        const menu = screen.getByRole('menu', { name: 'Tools' });
        expect(menu.getAttribute('data-layout')).toBe('radial');
        expect([menu.dataset.x, menu.dataset.y]).toEqual(['400', '300']);
        expect(document.activeElement).toBe(item('Measure'));
        expect(item('Identify').getAttribute('data-angle')).toBe('0');
    });

    it('walks the circle with arrows, wraps, skips disabled ones and returns focus on select', () => {
        const onSelect = vi.fn();
        render(<Canvas onSelect={onSelect} isDisabled={(index) => index === 2} />);
        const map = screen.getByTestId('map');
        map.focus();
        fireEvent.contextMenu(map, { clientX: 400, clientY: 300 });
        fireEvent.keyDown(item('Measure'), { key: 'ArrowLeft' });
        expect(document.activeElement).toBe(item('Share'));
        fireEvent.keyDown(item('Share'), { key: 'ArrowRight' });
        expect(document.activeElement).toBe(item('Measure'));
        fireEvent.keyDown(item('Measure'), { key: 'ArrowDown' });
        fireEvent.keyDown(item('Identify'), { key: 'ArrowDown' });
        expect(document.activeElement).toBe(item('Share'));
        fireEvent.keyDown(item('Share'), { key: 'i' });
        fireEvent.keyDown(item('Identify'), { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith(1);
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(map);
    });

    it('closes with Escape back to the map and with an outside press', () => {
        render(<Canvas />);
        const map = screen.getByTestId('map');
        map.focus();
        fireEvent.contextMenu(map, { clientX: 10, clientY: 10 });
        expect(screen.getByRole('menu').dataset.x).toBe('120');
        fireEvent.keyDown(item('Measure'), { key: 'Escape' });
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(map);
        fireEvent.contextMenu(map, { clientX: 400, clientY: 300 });
        fireEvent.pointerDown(screen.getByRole('button', { name: 'outside' }));
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('opens from the menu key at the center of the map', () => {
        render(<Canvas />);
        const map = screen.getByTestId('map');
        map.getBoundingClientRect = () => ({ left: 100, top: 100, width: 400, height: 300, right: 500, bottom: 400, x: 100, y: 100, toJSON: () => ({}) });
        map.focus();
        fireEvent.keyDown(map, { key: 'F10', shiftKey: true });
        fireEvent.contextMenu(map, { clientX: 0, clientY: 0 });
        expect([screen.getByRole('menu').dataset.x, screen.getByRole('menu').dataset.y]).toEqual(['300', '250']);
    });

    it('opens on a long touch press unless the finger moves', () => {
        vi.useFakeTimers();
        render(<Canvas longPress={400} />);
        const map = screen.getByTestId('map');
        fireEvent.pointerDown(map, { pointerId: 1, pointerType: 'touch', button: 0, clientX: 300, clientY: 300 });
        fireEvent.pointerMove(document, { pointerId: 1, clientX: 330, clientY: 300 });
        act(() => vi.advanceTimersByTime(500));
        expect(screen.queryByRole('menu')).toBeNull();
        fireEvent.pointerUp(document, { pointerId: 1 });
        fireEvent.pointerDown(map, { pointerId: 2, pointerType: 'touch', button: 0, clientX: 300, clientY: 300 });
        fireEvent.pointerMove(document, { pointerId: 2, clientX: 303, clientY: 302 });
        act(() => vi.advanceTimersByTime(400));
        expect(screen.getByRole('menu').dataset.x).toBe('300');
        fireEvent.contextMenu(map, { clientX: 300, clientY: 300 });
        expect(screen.getAllByRole('menu')).toHaveLength(1);
    });
});
