import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMenu, type UseMenuOptions } from '@ghegar/abanico';

const ITEMS = ['Editar', 'Duplicar', 'Archivar', 'Eliminar'];

const Menu = (options: Partial<UseMenuOptions>) => {
    const menu = useMenu({ count: ITEMS.length, getLabel: (index) => ITEMS[index] ?? '', ...options });
    return (
        <>
            <p>afuera</p>
            <button {...menu.getButtonProps()}>Acciones</button>
            {menu.open && (
                <div {...menu.getMenuProps()}>
                    {ITEMS.map((item, index) => <div key={item} {...menu.getItemProps(index)}>{item}</div>)}
                </div>
            )}
        </>
    );
};

const item = (name: string): HTMLElement => screen.getByRole('menuitem', { name });

afterEach(cleanup);

describe('useMenu', () => {
    it('opens from the keyboard on the first or last item', () => {
        render(<Menu />);
        const button = screen.getByRole('button', { name: 'Acciones' });
        expect(button.getAttribute('aria-haspopup')).toBe('menu');
        fireEvent.keyDown(button, { key: 'ArrowDown' });
        const menu = screen.getByRole('menu', { name: 'Acciones' });
        expect(button.getAttribute('aria-controls')).toBe(menu.id);
        expect(document.activeElement).toBe(item('Editar'));
        fireEvent.keyDown(item('Editar'), { key: 'Escape' });
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(button);
        fireEvent.keyDown(button, { key: 'ArrowUp' });
        expect(document.activeElement).toBe(item('Eliminar'));
    });

    it('moves with arrows and typeahead and selects with Enter', () => {
        const onSelect = vi.fn();
        render(<Menu onSelect={onSelect} isDisabled={(index) => index === 1} />);
        fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
        expect(document.activeElement).toBe(item('Editar'));
        fireEvent.keyDown(item('Editar'), { key: 'ArrowDown' });
        expect(document.activeElement).toBe(item('Archivar'));
        expect(item('Duplicar').getAttribute('aria-disabled')).toBe('true');
        fireEvent.keyDown(item('Archivar'), { key: 'e' });
        expect(document.activeElement).toBe(item('Eliminar'));
        fireEvent.keyDown(item('Eliminar'), { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith(3);
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Acciones' }));
    });

    it('ignores disabled items and can stay open after selecting', () => {
        const onSelect = vi.fn();
        render(<Menu onSelect={onSelect} isDisabled={(index) => index === 1} closeOnSelect={false} />);
        fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
        fireEvent.click(item('Duplicar'));
        fireEvent.click(item('Archivar'));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(2);
        expect(screen.getByRole('menu')).toBeTruthy();
    });

    it('closes on an outside pointer down, Tab and the button', () => {
        const onOpenChange = vi.fn();
        render(<Menu onOpenChange={onOpenChange} />);
        const button = screen.getByRole('button', { name: 'Acciones' });
        fireEvent.click(button);
        fireEvent.pointerDown(item('Editar'));
        expect(screen.getByRole('menu')).toBeTruthy();
        fireEvent.pointerDown(screen.getByText('afuera'));
        expect(screen.queryByRole('menu')).toBeNull();
        fireEvent.click(button);
        fireEvent.keyDown(item('Editar'), { key: 'Tab' });
        expect(screen.queryByRole('menu')).toBeNull();
        fireEvent.click(button);
        fireEvent.click(button);
        expect(screen.queryByRole('menu')).toBeNull();
        expect(onOpenChange.mock.calls.map(([open]) => open)).toEqual([true, false, true, false, true, false]);
    });

    it('follows the pointer over the items', () => {
        render(<Menu />);
        fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
        fireEvent.pointerMove(item('Archivar'));
        expect(document.activeElement).toBe(item('Archivar'));
        expect(item('Archivar').dataset.active).toBe('true');
    });
});
