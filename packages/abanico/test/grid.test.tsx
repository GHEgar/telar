import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMenu, verticalNeighbor, type UseMenuOptions } from '@npmegar/abanico';

const GROUPS = [
    { label: 'Tools', items: ['Measure', 'Time', 'Table', 'Export', 'Share'] },
    { label: 'Map', items: ['Layers', 'Gallery', 'Settings'] },
];
const ITEMS = GROUPS.flatMap((group) => group.items);
const COLUMNS = 3;

const place = (index: number): { x: number; y: number } => {
    const group = index < 5 ? 0 : 1;
    const local = group === 0 ? index : index - 5;
    return { x: (local % COLUMNS) * 100, y: group * 80 + Math.floor(local / COLUMNS) * 30 };
};

const Menu = (options: Partial<UseMenuOptions>) => {
    const menu = useMenu({ count: ITEMS.length, grid: true, getLabel: (index) => ITEMS[index] ?? '', ...options });
    return (
        <>
            <button {...menu.getButtonProps()}>Start</button>
            {menu.open && (
                <div {...menu.getMenuProps()}>
                    {GROUPS.map((group) => (
                        <div key={group.label} {...menu.getGroupProps(group.label)}>
                            {group.items.map((label) => {
                                const index = ITEMS.indexOf(label);
                                const { x, y } = place(index);
                                return <div key={label} {...menu.getItemProps(index)} data-x={x} data-y={y}>{label}</div>;
                            })}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

const item = (name: string): HTMLElement => screen.getByRole('menuitem', { name });

const press = (name: string, key: string): void => {
    fireEvent.keyDown(item(name), { key });
};

beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const x = Number(this.dataset.x ?? 0);
        const y = Number(this.dataset.y ?? 0);
        const sized = this.dataset.x !== undefined;
        return { left: x, top: y, x, y, width: sized ? 96 : 0, height: sized ? 26 : 0, right: x + 96, bottom: y + 26, toJSON: () => ({}) } as DOMRect;
    });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('useMenu({ grid: true })', () => {
    it('moves down and up by column, across groups', () => {
        render(<Menu />);
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        expect(document.activeElement).toBe(item('Measure'));
        press('Measure', 'ArrowRight');
        expect(document.activeElement).toBe(item('Time'));
        press('Time', 'ArrowDown');
        expect(document.activeElement).toBe(item('Share'));
        press('Share', 'ArrowDown');
        expect(document.activeElement).toBe(item('Gallery'));
        press('Gallery', 'ArrowUp');
        expect(document.activeElement).toBe(item('Share'));
        press('Share', 'ArrowUp');
        expect(document.activeElement).toBe(item('Time'));
        press('Time', 'ArrowUp');
        expect(document.activeElement).toBe(item('Time'));
    });

    it('goes to the nearest column of a shorter row and walks the reading order sideways', () => {
        render(<Menu />);
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        press('Measure', 'End');
        expect(document.activeElement).toBe(item('Settings'));
        press('Settings', 'ArrowRight');
        expect(document.activeElement).toBe(item('Measure'));
        press('Measure', 'ArrowLeft');
        expect(document.activeElement).toBe(item('Settings'));
        press('Settings', 'ArrowUp');
        expect(document.activeElement).toBe(item('Share'));
    });

    it('skips disabled items and keeps typeahead', () => {
        render(<Menu isDisabled={(index) => index === 4} />);
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        press('Measure', 'ArrowRight');
        press('Time', 'ArrowDown');
        expect(document.activeElement).toBe(item('Export'));
        press('Export', 'g');
        expect(document.activeElement).toBe(item('Gallery'));
    });
});

describe('verticalNeighbor', () => {
    const box = (left: number, top: number) => ({ left, top, width: 10, height: 10 });

    it('picks the closest row first and then the closest column', () => {
        const boxes = [box(0, 0), box(20, 0), box(0, 20), box(35, 21), box(20, 40)];
        expect(verticalNeighbor(boxes, 0, 1)).toBe(2);
        expect(verticalNeighbor(boxes, 1, 1)).toBe(3);
        expect(verticalNeighbor(boxes, 1, 1, (index) => index === 3)).toBe(2);
        expect(verticalNeighbor(boxes, 3, 1)).toBe(4);
        expect(verticalNeighbor(boxes, 4, -1)).toBe(3);
        expect(verticalNeighbor(boxes, 0, -1)).toBeNull();
    });

    it('gives up without layout', () => {
        const empty = { left: 0, top: 0, width: 0, height: 0 };
        expect(verticalNeighbor([empty, empty], 0, 1)).toBeNull();
    });
});
