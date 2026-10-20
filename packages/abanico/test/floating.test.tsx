import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMenu, useRadialMenu } from '@npmegar/abanico';

const ITEMS = ['Measure', 'Draw', 'Play'];

afterEach(cleanup);

describe('useMenu({ floating: false })', () => {
    const Menu = () => {
        const menu = useMenu({ count: ITEMS.length, floating: false });
        return (
            <>
                <button {...menu.getButtonProps()}>Start</button>
                {menu.open && (
                    <div {...menu.getMenuProps()} style={{ bottom: 40 }} data-testid="menu">
                        {ITEMS.map((label, index) => <div key={label} {...menu.getItemProps(index, { soon: index === 2 })}>{label}</div>)}
                    </div>
                )}
            </>
        );
    };

    it('leaves the menu unpositioned so your own style stays, and still focuses the first item', () => {
        render(<Menu />);
        fireEvent.keyDown(screen.getByRole('button', { name: 'Start' }), { key: 'ArrowDown' });
        const menu = screen.getByTestId('menu');
        expect(menu.style.position).toBe('');
        expect(menu.style.bottom).toBe('40px');
        expect(menu.hasAttribute('data-side')).toBe(false);
        expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Measure' }));
    });

    it('marks upcoming items with data-soon and keeps them selectable', () => {
        render(<Menu />);
        fireEvent.click(screen.getByRole('button', { name: 'Start' }));
        const play = screen.getByRole('menuitem', { name: 'Play' });
        expect(play.hasAttribute('data-soon')).toBe(true);
        expect(play.hasAttribute('aria-disabled')).toBe(false);
        expect(screen.getByRole('menuitem', { name: 'Draw' }).hasAttribute('data-soon')).toBe(false);
    });

    it('keeps the button ref stable across renders', () => {
        const refs = new Set<unknown>();
        const Probe = () => {
            const menu = useMenu({ count: 1 });
            refs.add(menu.getButtonProps().ref);
            return <button {...menu.getButtonProps()}>Open</button>;
        };
        const { rerender } = render(<Probe />);
        rerender(<Probe />);
        expect(refs.size).toBe(1);
    });
});

describe('useRadialMenu soon items', () => {
    it('marks them with data-soon', () => {
        const onSelect = vi.fn();
        const Radial = () => {
            const menu = useRadialMenu({ count: ITEMS.length, label: 'Tools', defaultOpen: true, onSelect });
            return (
                <div {...menu.getMenuProps()}>
                    {ITEMS.map((label, index) => <div key={label} {...menu.getItemProps(index, { soon: index === 2 })}>{label}</div>)}
                </div>
            );
        };
        render(<Radial />);
        const play = screen.getByRole('menuitem', { name: 'Play' });
        expect(play.hasAttribute('data-soon')).toBe(true);
        act(() => play.click());
        expect(onSelect).toHaveBeenCalledWith(2);
    });
});
