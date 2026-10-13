import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCombobox, virtualRange, type UseComboboxOptions } from '@ghegar/muestrario';

const TAGS = ['agua', 'bosque', 'clima'];

const Tags = (options: Partial<UseComboboxOptions<string>>) => {
    const combo = useCombobox<string>({ items: TAGS, getLabel: (item) => item, ...options });
    return (
        <>
            <input aria-label="Etiqueta" {...combo.getInputProps()} />
            {combo.open && (
                <ul {...combo.getListboxProps()}>
                    {combo.items.map((item, index) => <li key={item} {...combo.getOptionProps(item, index)}>{item}</li>)}
                    {combo.createText && <li {...combo.getCreateProps()}>{combo.createText}</li>}
                </ul>
            )}
            <output>{combo.values.join(',') || String(combo.value)}</output>
        </>
    );
};

const input = (): HTMLInputElement => screen.getByRole('combobox') as HTMLInputElement;
const type = (text: string) => fireEvent.change(input(), { target: { value: text } });

afterEach(cleanup);

describe('creating options', () => {
    it('offers to create the typed text when nothing matches exactly', () => {
        const onCreate = vi.fn((text: string) => text.toLowerCase());
        render(<Tags multiple onCreate={onCreate} />);
        type('Agua');
        expect(screen.queryByRole('option', { name: 'Crear «Agua»' })).toBeNull();
        type('Río');
        const create = screen.getByRole('option', { name: 'Crear «Río»' });
        expect(input().getAttribute('aria-activedescendant')).toBe(create.id);
        fireEvent.keyDown(input(), { key: 'Enter' });
        expect(onCreate).toHaveBeenCalledWith('Río');
        expect(screen.getByText('río', { selector: 'output' })).toBeTruthy();
    });

    it('reaches the create option with the arrows after the matches', () => {
        render(<Tags onCreate={(text) => text} />);
        type('b');
        fireEvent.keyDown(input(), { key: 'ArrowDown' });
        expect(input().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Crear «b»' }).id);
        fireEvent.click(screen.getByRole('option', { name: 'Crear «b»' }));
        expect(input().value).toBe('b');
        expect(screen.getByText('b', { selector: 'output' })).toBeTruthy();
    });

    it('does nothing when onCreate returns nothing', () => {
        render(<Tags onCreate={() => undefined} />);
        type('nuevo');
        fireEvent.keyDown(input(), { key: 'Enter' });
        expect(screen.getByText('null', { selector: 'output' })).toBeTruthy();
    });
});

describe('free text', () => {
    it('keeps what was typed on blur', () => {
        render(<Tags freeText />);
        type('lo que sea');
        fireEvent.blur(input());
        expect(input().value).toBe('lo que sea');
    });
});

describe('virtual lists', () => {
    const MANY = Array.from({ length: 1000 }, (_, index) => `Elemento ${index + 1}`);

    const Long = () => {
        const combo = useCombobox<string>({ items: MANY, getLabel: (item) => item, virtual: { itemHeight: 30, height: 300, overscan: 2 } });
        return (
            <>
                <input aria-label="Lista" {...combo.getInputProps()} />
                {combo.open && (
                    <ul {...combo.getListboxProps()}>
                        <li {...combo.getSizerProps()} />
                        {combo.virtualItems?.map(({ item, index, style }) => <li key={item} style={style} {...combo.getOptionProps(item, index)}>{item}</li>)}
                    </ul>
                )}
            </>
        );
    };

    it('computes the visible window', () => {
        expect(virtualRange(1000, 30, 300, 0, 2)).toEqual([0, 12]);
        expect(virtualRange(1000, 30, 300, 3000, 2)).toEqual([98, 112]);
        expect(virtualRange(5, 30, 300, 0, 2)).toEqual([0, 5]);
    });

    it('renders only the window with set size and position', () => {
        render(<Long />);
        fireEvent.keyDown(input(), { key: 'ArrowDown' });
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(12);
        expect(options[0]?.getAttribute('aria-setsize')).toBe('1000');
        expect(options[3]?.getAttribute('aria-posinset')).toBe('4');
        expect(options[3]?.style.top).toBe('90px');
        expect(screen.getByRole('listbox').firstElementChild?.getAttribute('style')).toContain('height: 30000px');
    });

    it('scrolls the listbox to keep the active option visible', () => {
        const scrollTo = vi.fn();
        Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo });
        render(<Long />);
        fireEvent.keyDown(input(), { key: 'ArrowUp' });
        expect(scrollTo).toHaveBeenLastCalledWith({ top: 1000 * 30 - 300 });
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
    });
});
