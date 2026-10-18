import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { useRovingFocus } from '@npmegar/lanzadera/react';

const MODES = ['Mapa', 'Tabla', 'Ambos'];

const Segmented = () => {
    const [mode, setMode] = useState(1);
    const roving = useRovingFocus({ count: MODES.length, orientation: 'horizontal', activeIndex: mode, onActiveChange: setMode });
    return (
        <div role="radiogroup" aria-label="Vista">
            {MODES.map((name, index) => (
                <button key={name} role="radio" aria-checked={index === mode} onClick={() => setMode(index)} {...roving.getItemProps(index)}>{name}</button>
            ))}
        </div>
    );
};

afterEach(cleanup);

describe('radio group on lanzadera', () => {
    it('checks the radio that receives focus and keeps one tab stop', () => {
        render(<Segmented />);
        const radio = (name: string): HTMLElement => screen.getByRole('radio', { name });
        expect(radio('Tabla').tabIndex).toBe(0);
        expect(radio('Mapa').tabIndex).toBe(-1);
        radio('Tabla').focus();
        fireEvent.keyDown(radio('Tabla'), { key: 'ArrowRight' });
        expect(radio('Ambos').getAttribute('aria-checked')).toBe('true');
        expect(document.activeElement).toBe(radio('Ambos'));
        fireEvent.keyDown(radio('Ambos'), { key: 'ArrowRight' });
        expect(radio('Mapa').getAttribute('aria-checked')).toBe('true');
        fireEvent.click(radio('Tabla'));
        expect(radio('Tabla').tabIndex).toBe(0);
    });
});
