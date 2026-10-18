import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { reorder, useSortable, type UseSortableOptions } from '@npmegar/sarta/react';

const LAYERS = ['Roads', 'Rivers', 'Parks', 'Schools'];

const Layers = (options: Partial<UseSortableOptions>) => {
    const [layers, setLayers] = useState(LAYERS);
    const sortable = useSortable({
        count: layers.length,
        getLabel: (index) => layers[index] ?? '',
        onReorder: (from, to) => setLayers((list) => reorder(list, from, to)),
        ...options,
    });
    return (
        <>
            <ul {...sortable.getListProps()}>
                {layers.map((layer, index) => (
                    <li key={layer} {...sortable.getItemProps(index)}>
                        <button {...sortable.getHandleProps(index)}>⠿</button>
                        {layer}
                    </li>
                ))}
            </ul>
            <p {...sortable.getInstructionsProps()} />
            <div {...sortable.getAnnouncerProps()} />
            <span data-testid="order">{layers.join(',')}</span>
            <span data-testid="offsets">{sortable.offsets.join(',')}</span>
        </>
    );
};

const handle = (name: string): HTMLElement => screen.getByRole('button', { name: `Reorder ${name}` });
const order = (): string => screen.getByTestId('order').textContent ?? '';
const status = (): string => screen.getByRole('status').textContent ?? '';

const stubRows = (): void => {
    screen.getAllByRole('listitem').forEach((row, index) => {
        row.getBoundingClientRect = () => ({ top: index * 50, bottom: index * 50 + 40, left: 0, right: 200, width: 200, height: 40, x: 0, y: index * 50, toJSON: () => ({}) });
    });
};

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('useSortable', () => {
    it('picks up, moves and drops with the keyboard and keeps focus on the moved item', () => {
        render(<Layers />);
        const roads = handle('Roads');
        expect(roads.getAttribute('aria-describedby')).toBe(document.querySelector('p[hidden]')?.id);
        roads.focus();
        fireEvent.keyDown(roads, { key: ' ' });
        expect(roads.getAttribute('aria-pressed')).toBe('true');
        expect(status()).toBe('Picked up Roads. Position 1 of 4.');
        fireEvent.keyDown(roads, { key: 'ArrowDown' });
        fireEvent.keyDown(roads, { key: 'ArrowDown' });
        expect(status()).toBe('Roads moved to position 3 of 4.');
        expect(order()).toBe('Roads,Rivers,Parks,Schools');
        fireEvent.keyDown(roads, { key: ' ' });
        expect(order()).toBe('Rivers,Parks,Roads,Schools');
        expect(status()).toBe('Roads dropped at position 3 of 4.');
        expect(document.activeElement).toBe(handle('Roads'));
        expect(handle('Roads').tabIndex).toBe(0);
        fireEvent.keyDown(handle('Roads'), { key: 'Enter' });
        fireEvent.keyDown(handle('Roads'), { key: 'Home' });
        fireEvent.keyDown(handle('Roads'), { key: 'Enter' });
        expect(order()).toBe('Roads,Rivers,Parks,Schools');
    });

    it('cancels with Escape or blur and moves focus with arrows when not grabbed', () => {
        render(<Layers />);
        const roads = handle('Roads');
        roads.focus();
        fireEvent.keyDown(roads, { key: 'ArrowDown' });
        expect(document.activeElement).toBe(handle('Rivers'));
        const rivers = handle('Rivers');
        fireEvent.keyDown(rivers, { key: 'Enter' });
        fireEvent.keyDown(rivers, { key: 'ArrowUp' });
        fireEvent.keyDown(rivers, { key: 'Escape' });
        expect(status()).toBe('Reorder cancelled. Rivers is back at position 2 of 4.');
        expect(order()).toBe(LAYERS.join(','));
        fireEvent.keyDown(rivers, { key: ' ' });
        fireEvent.blur(rivers);
        expect(rivers.getAttribute('aria-pressed')).toBe('false');
    });

    it('skips disabled items and leaves every handle tabbable without roving', () => {
        render(<Layers isDisabled={(index) => index === 1} roving={false} />);
        expect(handle('Rivers').getAttribute('aria-disabled')).toBe('true');
        fireEvent.keyDown(handle('Rivers'), { key: ' ' });
        expect(handle('Rivers').getAttribute('aria-pressed')).toBe('false');
        expect(screen.getAllByRole('button').map((button) => button.tabIndex)).toEqual([0, 0, 0, 0]);
    });

    it('drags with the mouse after a small threshold', () => {
        render(<Layers />);
        stubRows();
        const roads = handle('Roads');
        fireEvent.pointerDown(roads, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 10, clientY: 20 });
        fireEvent.pointerMove(document, { pointerId: 1, clientX: 10, clientY: 22 });
        expect(roads.getAttribute('aria-pressed')).toBe('false');
        fireEvent.pointerMove(document, { pointerId: 1, clientX: 10, clientY: 80 });
        expect(roads.getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByTestId('offsets').textContent).toBe('60,-50,0,0');
        fireEvent.pointerMove(document, { pointerId: 1, clientX: 10, clientY: 125 });
        fireEvent.pointerUp(document, { pointerId: 1 });
        expect(order()).toBe('Rivers,Parks,Roads,Schools');
        fireEvent.pointerDown(handle('Schools'), { pointerId: 2, pointerType: 'mouse', button: 0, clientX: 0, clientY: 170 });
        fireEvent.pointerMove(document, { pointerId: 2, clientX: 0, clientY: 20 });
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(order()).toBe('Rivers,Parks,Roads,Schools');
        expect(status()).toBe('Reorder cancelled. Schools is back at position 4 of 4.');
    });

    it('starts a touch drag only after a long press without moving', () => {
        vi.useFakeTimers();
        render(<Layers />);
        stubRows();
        const roads = handle('Roads');
        fireEvent.pointerDown(roads, { pointerId: 3, pointerType: 'touch', button: 0, clientX: 10, clientY: 20 });
        fireEvent.pointerMove(document, { pointerId: 3, clientX: 10, clientY: 40 });
        act(() => vi.advanceTimersByTime(300));
        expect(roads.getAttribute('aria-pressed')).toBe('false');
        fireEvent.pointerUp(document, { pointerId: 3 });
        fireEvent.pointerDown(roads, { pointerId: 4, pointerType: 'touch', button: 0, clientX: 10, clientY: 20 });
        act(() => vi.advanceTimersByTime(250));
        expect(roads.getAttribute('aria-pressed')).toBe('true');
        const touch = new Event('touchmove', { cancelable: true });
        document.dispatchEvent(touch);
        expect(touch.defaultPrevented).toBe(true);
        expect(fireEvent.contextMenu(roads)).toBe(false);
        fireEvent.pointerMove(document, { pointerId: 4, clientX: 10, clientY: 80 });
        fireEvent.pointerUp(document, { pointerId: 4 });
        expect(order()).toBe('Rivers,Roads,Parks,Schools');
    });
});
