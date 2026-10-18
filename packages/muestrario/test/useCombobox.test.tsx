import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCombobox, type UseComboboxOptions } from '@npmegar/muestrario';

const STATES = ['Aguascalientes', 'Jalisco', 'Michoacán', 'Nayarit', 'Querétaro', 'Zacatecas'];

type Options = Partial<UseComboboxOptions<string>>;

const Combo = (options: Options) => {
    const combo = useCombobox<string>({ items: STATES, getLabel: (item) => item, ...options });
    return (
        <div>
            <div {...combo.getAnchorProps()}>
                {combo.values.map((item) => <span key={item}>{item}<button {...combo.getRemoveProps(item)}>x</button></span>)}
                <input aria-label="Estado" {...combo.getInputProps()} />
            </div>
            {combo.open && (
                <ul {...combo.getListboxProps()} aria-label="Estados">
                    {combo.items.map((item, index) => <li key={item} {...combo.getOptionProps(item, index)}>{item}</li>)}
                </ul>
            )}
            <p {...combo.getStatusProps()}>{combo.statusText}</p>
            <button>after</button>
        </div>
    );
};

const input = (): HTMLInputElement => screen.getByRole('combobox') as HTMLInputElement;
const type = (text: string) => fireEvent.change(input(), { target: { value: text } });
const key = (name: string, extra = {}) => fireEvent.keyDown(input(), { key: name, ...extra });

afterEach(cleanup);

describe('useCombobox single', () => {
    it('filters without accents, points at the first match and selects with Enter', () => {
        const onChange = vi.fn();
        render(<Combo onChange={onChange} />);
        type('michoa');
        const option = screen.getByRole('option', { name: 'Michoacán' });
        expect(screen.getAllByRole('option')).toHaveLength(1);
        expect(input().getAttribute('aria-activedescendant')).toBe(option.id);
        expect(input().getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('status').textContent).toBe('1 result');
        key('Enter');
        expect(onChange).toHaveBeenCalledWith('Michoacán');
        expect(input().value).toBe('Michoacán');
        expect(screen.queryByRole('listbox')).toBeNull();
        key('ArrowDown');
        expect(screen.getAllByRole('option')).toHaveLength(STATES.length);
    });

    it('moves with arrows over disabled options and closes, then clears with Escape', () => {
        render(<Combo isDisabled={(item) => item === 'Jalisco'} />);
        key('ArrowDown');
        expect(screen.getByRole('option', { name: 'Aguascalientes' }).dataset.active).toBe('true');
        key('ArrowDown');
        expect(screen.getByRole('option', { name: 'Michoacán' }).dataset.active).toBe('true');
        key('ArrowUp');
        key('ArrowUp');
        expect(screen.getByRole('option', { name: 'Zacatecas' }).dataset.active).toBe('true');
        key('Escape');
        expect(screen.queryByRole('listbox')).toBeNull();
        type('za');
        key('Escape');
        key('Escape');
        expect(input().value).toBe('');
        key('ArrowUp');
        expect(screen.getByRole('option', { name: 'Zacatecas' }).dataset.active).toBe('true');
    });

    it('restores the chosen label on blur and shows no results', () => {
        render(<Combo defaultValue="Nayarit" />);
        type('xyz');
        expect(screen.queryAllByRole('option')).toHaveLength(0);
        expect(screen.getByRole('status').textContent).toBe('No results');
        fireEvent.blur(input());
        expect(input().value).toBe('Nayarit');
        expect(screen.getByRole('status').textContent).toBe('');
    });

    it('selects by click without losing focus and follows a controlled value', () => {
        const Controlled = () => {
            const [value, setValue] = useState<string | null>(null);
            return (
                <>
                    <button onClick={() => setValue('Zacatecas')}>set</button>
                    <Combo value={value} onChange={setValue} />
                </>
            );
        };
        render(<Controlled />);
        fireEvent.click(input());
        const option = screen.getByRole('option', { name: 'Querétaro' });
        expect(fireEvent.mouseDown(option)).toBe(false);
        fireEvent.click(option);
        expect(input().value).toBe('Querétaro');
        fireEvent.click(screen.getByText('set'));
        expect(input().value).toBe('Zacatecas');
    });
});

describe('useCombobox multiple', () => {
    it('toggles values, keeps the list open and removes chips', () => {
        const onValuesChange = vi.fn();
        render(<Combo multiple onValuesChange={onValuesChange} />);
        type('ja');
        expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true');
        key('Enter');
        expect(onValuesChange).toHaveBeenLastCalledWith(['Jalisco']);
        expect(input().value).toBe('');
        expect(screen.getByRole('listbox')).toBeTruthy();
        fireEvent.click(screen.getByRole('option', { name: 'Nayarit' }));
        expect(screen.getByRole('option', { name: 'Nayarit' }).getAttribute('aria-selected')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Remove Jalisco' }));
        expect(onValuesChange).toHaveBeenLastCalledWith(['Nayarit']);
        key('Backspace');
        expect(onValuesChange).toHaveBeenLastCalledWith([]);
    });

    it('orders groups visually and navigates in that order', () => {
        const region = (item: string): string => (['Jalisco', 'Nayarit', 'Michoacán'].includes(item) ? 'Occidente' : 'Centro');
        render(<Combo groupBy={region} />);
        key('ArrowDown');
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
            'Aguascalientes', 'Querétaro', 'Zacatecas', 'Jalisco', 'Michoacán', 'Nayarit',
        ]);
        key('ArrowDown');
        key('ArrowDown');
        key('ArrowDown');
        expect(screen.getByRole('option', { name: 'Jalisco' }).dataset.active).toBe('true');
    });
});
