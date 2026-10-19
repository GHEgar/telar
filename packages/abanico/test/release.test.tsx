import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    RELEASE_TOLERANCE, RELEASE_WINDOW, rightPress, useRadialMenu, type EscapeLayerLike, type EscapeStackLike, type RightPress,
    type UseRadialMenuOptions,
} from '@npmegar/abanico';

const TOOLS = ['Measure', 'Identify', 'Draw', 'Share'];

const Canvas = (options: Partial<UseRadialMenuOptions>) => {
    const menu = useRadialMenu({ count: TOOLS.length, label: 'Tools', getLabel: (index) => TOOLS[index] ?? '', openOn: 'release', ...options });
    return (
        <>
            <div {...menu.getTargetProps()} tabIndex={0} data-testid="map" />
            {menu.open && (
                <div {...menu.getMenuProps()} data-x={menu.center?.x} data-y={menu.center?.y}>
                    {TOOLS.map((tool, index) => <div key={tool} {...menu.getItemProps(index)}>{tool}</div>)}
                </div>
            )}
        </>
    );
};

const mouse = (button: number, clientX: number, clientY: number) => ({ button, pointerType: 'mouse', clientX, clientY });

const createStack = () => {
    const layers: EscapeLayerLike[] = [];
    const stack: EscapeStackLike = {
        push: (layer) => {
            layers.push(layer);
            return () => {
                layers.splice(layers.indexOf(layer), 1);
            };
        },
    };
    const onKeyDown = (event: KeyboardEvent): void => {
        const top = [...layers].sort((a, b) => b.priority - a.priority)[0];
        if (event.key !== 'Escape' || !top) return;
        top.onEscape(event);
        event.preventDefault();
        event.stopPropagation();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return { stack, layers, detach: () => window.removeEventListener('keydown', onKeyDown, true) };
};

afterEach(cleanup);

describe('rightPress', () => {
    it('opens on release when the context menu arrives first (Linux and macOS)', () => {
        let press: RightPress | null = rightPress.down(null, mouse(2, 100, 80), 10);
        const step = rightPress.contextMenu(press, { clientX: 100, clientY: 80 }, 12);
        expect(step.open).toBeUndefined();
        press = step.press;
        expect(rightPress.up(press, { button: 2 }).open).toEqual({ x: 100, y: 80 });
    });

    it('opens on the context menu that arrives after release (Windows)', () => {
        let press = rightPress.down(null, mouse(2, 40, 30), 10);
        press = rightPress.up(press, { button: 2 }).press;
        expect(rightPress.contextMenu(press, { clientX: 40, clientY: 30 }, 20).open).toEqual({ x: 40, y: 30 });
    });

    it('does not open after a right drag', () => {
        let press = rightPress.down(null, mouse(2, 100, 100), 10);
        press = rightPress.contextMenu(press, { clientX: 100, clientY: 100 }, 11).press;
        press = rightPress.move(press, { clientX: 100 + RELEASE_TOLERANCE + 1, clientY: 100 });
        expect(rightPress.up(press, { button: 2 })).toEqual({ press: null });
    });

    it('falls back for the keyboard and for stale presses', () => {
        expect(rightPress.contextMenu(null, { clientX: 0, clientY: 0 }, 5).fallback).toBe(true);
        const stale = rightPress.up(rightPress.down(null, mouse(2, 5, 5), 0), { button: 2 }).press;
        expect(rightPress.contextMenu(stale, { clientX: 5, clientY: 5 }, RELEASE_WINDOW + 1).fallback).toBe(true);
    });

    it('ignores the left button and touch', () => {
        expect(rightPress.down(null, mouse(0, 1, 1), 0)).toBeNull();
        expect(rightPress.down(null, { ...mouse(2, 1, 1), pointerType: 'touch' }, 0)).toBeNull();
    });
});

describe('useRadialMenu with openOn release', () => {
    it('waits for the release and opens at the press point', () => {
        render(<Canvas />);
        const map = screen.getByTestId('map');
        fireEvent.pointerDown(map, mouse(2, 300, 200));
        expect(fireEvent.contextMenu(map, { clientX: 300, clientY: 200 })).toBe(false);
        expect(screen.queryByRole('menu')).toBeNull();
        fireEvent.pointerMove(document, { clientX: 303, clientY: 202 });
        fireEvent.pointerUp(document, mouse(2, 303, 202));
        expect([screen.getByRole('menu').dataset.x, screen.getByRole('menu').dataset.y]).toEqual(['300', '200']);
    });

    it('opens when the context menu comes after the release', () => {
        render(<Canvas />);
        const map = screen.getByTestId('map');
        fireEvent.pointerDown(map, mouse(2, 300, 200));
        fireEvent.pointerUp(document, mouse(2, 300, 200));
        expect(screen.queryByRole('menu')).toBeNull();
        fireEvent.contextMenu(map, { clientX: 300, clientY: 200 });
        expect(screen.getByRole('menu').dataset.x).toBe('300');
    });

    it('stays closed after a right drag, so the map can rotate', () => {
        render(<Canvas />);
        const map = screen.getByTestId('map');
        fireEvent.pointerDown(map, mouse(2, 300, 200));
        fireEvent.contextMenu(map, { clientX: 300, clientY: 200 });
        fireEvent.pointerMove(document, { clientX: 360, clientY: 200 });
        fireEvent.pointerUp(document, mouse(2, 360, 200));
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('still opens from the menu key', () => {
        render(<Canvas />);
        const map = screen.getByTestId('map');
        map.focus();
        fireEvent.contextMenu(map, { clientX: 0, clientY: 0 });
        expect(screen.getByRole('menu')).not.toBeNull();
    });
});

describe('escapeStack', () => {
    it('closes through a stack that listens for Escape in capture and returns focus', () => {
        const { stack, layers, detach } = createStack();
        render(<Canvas openOn="contextmenu" escapeStack={stack} />);
        const map = screen.getByTestId('map');
        map.focus();
        fireEvent.contextMenu(map, { clientX: 300, clientY: 200 });
        expect(layers).toHaveLength(1);
        expect(layers[0]?.priority).toBe(200);
        fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Measure' }), { key: 'Escape' });
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(map);
        expect(layers).toHaveLength(0);
        detach();
    });
});
