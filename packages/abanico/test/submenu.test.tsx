import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMenu } from '@ghegar/abanico';

const ROOT = ['Nuevo', 'Exportar', 'Cuadrícula', 'Cerrar'];
const EXPORT = ['PNG', 'PDF', 'CSV'];

const FileMenu = ({ onRoot, onExport }: { onRoot: (index: number) => void; onExport: (index: number) => void }) => {
    const [grid, setGrid] = useState(false);
    const root = useMenu({
        count: ROOT.length,
        getLabel: (index) => ROOT[index] ?? '',
        onSelect: (index) => {
            if (index === 2) setGrid(!grid);
            onRoot(index);
        },
    });
    const sub = useMenu({ count: EXPORT.length, getLabel: (index) => EXPORT[index] ?? '', parent: { link: root.link, index: 1 }, onSelect: onExport });
    return (
        <>
            <p>afuera</p>
            <button {...root.getButtonProps()}>Archivo</button>
            {root.open && (
                <div {...root.getMenuProps()}>
                    <div {...root.getItemProps(0)}>Nuevo</div>
                    <div {...sub.getTriggerProps()}>Exportar</div>
                    <div {...root.getSeparatorProps()} />
                    <div {...root.getGroupProps('Vista')}>
                        <div {...root.getItemProps(2, { type: 'checkbox', checked: grid })}>Cuadrícula</div>
                    </div>
                    <div {...root.getItemProps(3)}>Cerrar</div>
                </div>
            )}
            {sub.open && (
                <div {...sub.getMenuProps()}>
                    {EXPORT.map((name, index) => <div key={name} {...sub.getItemProps(index)}>{name}</div>)}
                </div>
            )}
        </>
    );
};

const item = (name: string): HTMLElement => screen.getByText(name, { selector: '[role^="menuitem"]' });
const open = () => fireEvent.keyDown(screen.getByRole('button', { name: 'Archivo' }), { key: 'ArrowDown' });

afterEach(cleanup);

describe('submenus', () => {
    it('opens with ArrowRight and closes with ArrowLeft or Escape back to the trigger', () => {
        render(<FileMenu onRoot={vi.fn()} onExport={vi.fn()} />);
        open();
        const trigger = item('Exportar');
        trigger.focus();
        fireEvent.keyDown(trigger, { key: 'ArrowRight' });
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('menu', { name: 'Exportar' })).toBeTruthy();
        expect(document.activeElement).toBe(item('PNG'));
        fireEvent.keyDown(item('PNG'), { key: 'ArrowLeft' });
        expect(screen.queryByRole('menu', { name: 'Exportar' })).toBeNull();
        expect(document.activeElement).toBe(item('Exportar'));
        fireEvent.keyDown(item('Exportar'), { key: 'Enter' });
        fireEvent.keyDown(item('PNG'), { key: 'Escape' });
        expect(screen.queryByRole('menu', { name: 'Exportar' })).toBeNull();
        expect(screen.getByRole('menu', { name: 'Archivo' })).toBeTruthy();
    });

    it('selects inside the submenu, closes everything and returns to the button', () => {
        const onExport = vi.fn();
        render(<FileMenu onRoot={vi.fn()} onExport={onExport} />);
        open();
        fireEvent.keyDown(item('Nuevo'), { key: 'ArrowDown' });
        fireEvent.keyDown(item('Exportar'), { key: 'ArrowRight' });
        fireEvent.keyDown(item('PNG'), { key: 'ArrowDown' });
        fireEvent.keyDown(item('PDF'), { key: 'Enter' });
        expect(onExport).toHaveBeenCalledWith(1);
        expect(screen.queryAllByRole('menu')).toHaveLength(0);
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Archivo' }));
    });

    it('opens on hover without taking focus and closes when another item is active', () => {
        render(<FileMenu onRoot={vi.fn()} onExport={vi.fn()} />);
        open();
        fireEvent.pointerMove(item('Exportar'));
        expect(screen.getByRole('menu', { name: 'Exportar' })).toBeTruthy();
        expect(document.activeElement).toBe(item('Exportar'));
        fireEvent.pointerDown(item('CSV'));
        expect(screen.getByRole('menu', { name: 'Archivo' })).toBeTruthy();
        fireEvent.pointerMove(item('Nuevo'));
        expect(screen.queryByRole('menu', { name: 'Exportar' })).toBeNull();
        fireEvent.keyDown(item('Nuevo'), { key: 'ArrowDown' });
        expect(document.activeElement).toBe(item('Exportar'));
        expect(screen.queryByRole('menu', { name: 'Exportar' })).toBeNull();
        fireEvent.pointerDown(screen.getByText('afuera'));
        expect(screen.queryAllByRole('menu')).toHaveLength(0);
    });

    it('toggles a checkbox item without closing and exposes separators and groups', () => {
        const onRoot = vi.fn();
        render(<FileMenu onRoot={onRoot} onExport={vi.fn()} />);
        open();
        const grid = screen.getByRole('menuitemcheckbox', { name: 'Cuadrícula' });
        expect(grid.getAttribute('aria-checked')).toBe('false');
        fireEvent.click(grid);
        expect(screen.getByRole('menuitemcheckbox', { name: 'Cuadrícula' }).getAttribute('aria-checked')).toBe('true');
        expect(screen.getByRole('menu', { name: 'Archivo' })).toBeTruthy();
        expect(screen.getByRole('separator')).toBeTruthy();
        expect(screen.getByRole('group', { name: 'Vista' })).toBeTruthy();
    });
});
