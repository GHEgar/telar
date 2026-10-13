import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCombobox, type Loader } from '@ghegar/muestrario';

const Search = ({ load }: { load: Loader<string> }) => {
    const combo = useCombobox<string>({ load, getLabel: (item) => item, minChars: 2, debounce: 200 });
    return (
        <>
            <input aria-label="Buscar" {...combo.getInputProps()} />
            {combo.open && <ul {...combo.getListboxProps()}>{combo.items.map((item, index) => <li key={item} {...combo.getOptionProps(item, index)}>{item}</li>)}</ul>}
            <p {...combo.getStatusProps()}>{combo.statusText}</p>
        </>
    );
};

const type = (text: string) => fireEvent.change(screen.getByRole('combobox'), { target: { value: text } });
const status = (): string => screen.getByRole('status').textContent ?? '';

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('useCombobox async', () => {
    it('waits for minChars, debounces, aborts the previous request and shows results', async () => {
        const signals: AbortSignal[] = [];
        const load = vi.fn((query: string, signal: AbortSignal) => {
            signals.push(signal);
            return Promise.resolve([`${query} uno`, `${query} dos`]);
        });
        render(<Search load={load} />);
        type('g');
        expect(status()).toBe('Escribe al menos 2 letras');
        type('gu');
        expect(status()).toBe('Buscando…');
        expect(screen.getByRole('listbox').getAttribute('aria-busy')).toBe('true');
        act(() => vi.advanceTimersByTime(100));
        type('gua');
        await act(async () => {
            vi.advanceTimersByTime(200);
        });
        expect(load).toHaveBeenCalledTimes(1);
        expect(load).toHaveBeenCalledWith('gua', expect.any(AbortSignal));
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['gua uno', 'gua dos']);
        expect(status()).toBe('2 resultados');
        expect(screen.getByRole('option', { name: 'gua uno' }).dataset.active).toBe('true');
        type('guad');
        expect(signals[0]?.aborted).toBe(true);
    });

    it('reports a failed load', async () => {
        render(<Search load={() => Promise.reject(new Error('caído'))} />);
        type('gua');
        await act(async () => {
            vi.advanceTimersByTime(200);
        });
        expect(status()).toBe('No se pudo cargar la lista');
    });
});
