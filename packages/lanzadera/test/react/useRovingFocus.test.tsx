import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRovingFocus, type UseRovingFocusOptions } from '@npmegar/lanzadera/react';

const NAMES = ['Uno', 'Dos', 'Tres', 'Cuatro'];

const Toolbar = (options: Partial<UseRovingFocusOptions>) => {
    const roving = useRovingFocus({ count: NAMES.length, getLabel: (index) => NAMES[index] ?? '', ...options });
    return (
        <div role="toolbar">
            {NAMES.map((name, index) => (
                <button key={name} disabled={options.isDisabled?.(index)} {...roving.getItemProps(index)}>{name}</button>
            ))}
        </div>
    );
};

afterEach(cleanup);

describe('useRovingFocus', () => {
    it('keeps one tab stop and moves focus with arrows', () => {
        const onActiveChange = vi.fn();
        render(<Toolbar orientation="horizontal" onActiveChange={onActiveChange} />);
        const [uno, dos] = screen.getAllByRole('button');
        expect(uno?.tabIndex).toBe(0);
        expect(dos?.tabIndex).toBe(-1);
        uno?.focus();
        fireEvent.keyDown(uno as HTMLElement, { key: 'ArrowRight' });
        expect(document.activeElement).toBe(dos);
        expect(dos?.tabIndex).toBe(0);
        expect(onActiveChange).toHaveBeenLastCalledWith(1);
        fireEvent.keyDown(dos as HTMLElement, { key: 'End' });
        expect(document.activeElement?.textContent).toBe('Cuatro');
    });

    it('starts on the first enabled item and skips disabled ones', () => {
        render(<Toolbar isDisabled={(index) => index === 0 || index === 2} />);
        const dos = screen.getByText('Dos');
        expect(dos.tabIndex).toBe(0);
        dos.focus();
        fireEvent.keyDown(dos, { key: 'ArrowRight' });
        expect(document.activeElement?.textContent).toBe('Cuatro');
    });

    it('jumps by typeahead and follows focus from clicks', () => {
        render(<Toolbar />);
        const uno = screen.getByText('Uno');
        uno.focus();
        fireEvent.keyDown(uno, { key: 't' });
        expect(document.activeElement?.textContent).toBe('Tres');
        fireEvent.focus(screen.getByText('Dos'));
        expect(screen.getByText('Dos').tabIndex).toBe(0);
    });

    it('can be controlled', () => {
        render(<Toolbar activeIndex={2} />);
        expect(screen.getByText('Tres').tabIndex).toBe(0);
    });
});
