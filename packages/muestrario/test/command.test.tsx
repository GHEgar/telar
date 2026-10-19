import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCombobox, type UseComboboxOptions } from '@npmegar/muestrario';

const ACTIONS = ['Measure', 'Export map', 'Open table'];

const Palette = (options: Partial<UseComboboxOptions<string>>) => {
    const combo = useCombobox<string>({ items: ACTIONS, getLabel: (item) => item, ...options });
    return (
        <>
            <input aria-label="Command" {...combo.getInputProps()} />
            {combo.open && (
                <ul {...combo.getListboxProps()} data-testid="list">
                    {combo.items.map((item, index) => <li key={item} {...combo.getOptionProps(item, index)}>{item}</li>)}
                </ul>
            )}
            <output>{String(combo.value)}</output>
            <output data-testid="position">{String(combo.position)}</output>
            <button type="button" onClick={() => combo.setInputValue('table')}>table</button>
            <button type="button" onClick={() => combo.setInputValue('')}>empty</button>
            <button type="button" onClick={() => combo.setInputValue('exp')}>exp</button>
        </>
    );
};

const input = (): HTMLInputElement => screen.getByRole('combobox') as HTMLInputElement;
const type = (text: string) => fireEvent.change(input(), { target: { value: text } });

const write = (name: string) => fireEvent.click(screen.getByRole('button', { name }));

afterEach(cleanup);

describe('command mode', () => {
    it('runs the option without filling the input or changing the value', () => {
        const onSelect = vi.fn();
        const onChange = vi.fn();
        render(<Palette selectBehavior="command" onSelect={onSelect} onChange={onChange} />);
        type('exp');
        fireEvent.keyDown(input(), { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith('Export map');
        expect(onChange).not.toHaveBeenCalled();
        expect(input().value).toBe('exp');
        expect(screen.queryByRole('listbox')).toBeNull();
        expect(screen.getAllByText('null', { selector: 'output' })[0]).toBeTruthy();
    });

    it('stays open with the same query when closeOnSelect is false', () => {
        const onSelect = vi.fn();
        render(<Palette selectBehavior="command" closeOnSelect={false} onSelect={onSelect} />);
        type('e');
        fireEvent.click(screen.getByRole('option', { name: 'Open table' }));
        expect(onSelect).toHaveBeenCalledWith('Open table');
        expect(screen.getByRole('listbox')).toBeTruthy();
        expect(input().value).toBe('e');
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Measure', 'Export map', 'Open table']);
    });

    it('still calls onSelect in fill mode', () => {
        const onSelect = vi.fn();
        render(<Palette onSelect={onSelect} />);
        type('mea');
        fireEvent.keyDown(input(), { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith('Measure');
        expect(input().value).toBe('Measure');
    });
});

describe('setInputValue', () => {
    it('writes the text and filters as if it were typed', () => {
        render(<Palette selectBehavior="command" />);
        input().focus();
        type('m');
        write('table');
        expect(input().value).toBe('table');
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Open table']);
        expect(input().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Open table' }).id);
        write('empty');
        expect(input().value).toBe('');
        expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('does not open a closed list', () => {
        render(<Palette />);
        write('exp');
        expect(input().value).toBe('exp');
        expect(screen.queryByRole('listbox')).toBeNull();
        fireEvent.keyDown(input(), { key: 'ArrowDown' });
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Export map']);
    });
});

describe('position false', () => {
    it('leaves the listbox without plomada styles', () => {
        render(<Palette position={false} />);
        type('m');
        const list = screen.getByTestId('list');
        expect(list.getAttribute('style')).toBeNull();
        expect(list.hasAttribute('data-placement')).toBe(false);
        expect(screen.getByTestId('position').textContent).toBe('null');
    });

    it('positions by default', () => {
        render(<Palette />);
        type('m');
        expect(screen.getByTestId('list').getAttribute('style')).toContain('position');
    });
});
