import { describe, expect, it } from 'vitest';
import { estado, movimiento, TONOS, tonos, variablesDeTono, variablesGlobales, vidrio } from '../src/index.js';
import { buscar, leer, reglas, resolver, soloVariables } from './css.js';

const grana = reglas(leer('grana.css'));
const capas = reglas(leer('tonos.css'));

describe('grana.css', () => {
    it('imports the tones', () => {
        expect(leer('grana.css').startsWith('@import \'./tonos.css\';')).toBe(true);
    });

    it('declares the same global values as the module', () => {
        expect(resolver(buscar(grana, ':root'))).toEqual(variablesGlobales());
    });

    it('prefixes every variable', () => {
        for (const regla of [...grana, ...capas]) {
            for (const nombre of Object.keys(soloVariables(regla.declaraciones))) {
                expect(nombre).toMatch(/^--grana-[a-z0-9-]+$/);
            }
        }
    });

    it('resolves the glass filter on every element, not on :root', () => {
        expect(buscar(grana, ':root')['--grana-vidrio-filtro']).toBeUndefined();
        expect(buscar(grana, ':where(*), ::before, ::after')).toEqual({
            '--grana-vidrio-filtro': 'blur(var(--grana-vidrio-desenfoque)) saturate(var(--grana-vidrio-saturacion))',
        });
        const resuelto = resolver({ ...buscar(grana, ':root'), ...buscar(grana, ':where(*), ::before, ::after') });
        expect(resuelto['--grana-vidrio-filtro']).toBe(vidrio.filtro);
    });

    it('drops the glass filter with reduced transparency after declaring it', () => {
        const selector = ':where(*), ::before, ::after';
        expect(buscar(grana, selector, '@media (prefers-reduced-transparency: reduce)')).toEqual({ '--grana-vidrio-filtro': 'none' });
        const indices = grana.map((regla) => regla.selector === selector ? regla.media : undefined);
        expect(indices.indexOf(null)).toBeLessThan(indices.indexOf('@media (prefers-reduced-transparency: reduce)'));
    });

    it('declares the interface scale and the state colors', () => {
        const raiz = buscar(grana, ':root');
        expect(raiz['--grana-escala']).toBe('1');
        expect(raiz['--grana-peligro']).toBe(estado.peligro);
        expect(raiz['--grana-exito']).toBe(estado.exito);
        expect(raiz['--grana-peligro-tinta']).toBe('#ffffff');
        expect(raiz['--grana-exito-tinta']).toBe('#ffffff');
    });

    it('shortens every duration with reduced motion', () => {
        const reducidas = buscar(grana, ':root', '@media (prefers-reduced-motion: reduce)');
        const duraciones = Object.keys(variablesGlobales()).filter((nombre) => nombre.startsWith('--grana-duracion-'));
        expect(Object.keys(reducidas).sort()).toEqual(duraciones.sort());
        expect(new Set(Object.values(reducidas))).toEqual(new Set([movimiento.reducida]));
    });
});

describe('tonos.css', () => {
    it.each(TONOS)('declares the %s tone like the module', (tono) => {
        const regla = buscar(capas, `[data-grana-tono='${tono}']`);
        expect(soloVariables(regla)).toEqual(variablesDeTono(tono));
        expect(regla['color-scheme']).toBe(tonos[tono].esquema);
    });

    it('defaults to dia and to noche on a dark scheme', () => {
        expect(soloVariables(buscar(capas, ':root'))).toEqual(variablesDeTono('dia'));
        const oscuro = buscar(capas, ':root', '@media (prefers-color-scheme: dark)');
        expect(soloVariables(oscuro)).toEqual(variablesDeTono('noche'));
    });

    it('makes the glass opaque with reduced transparency', () => {
        const opaco = buscar(capas, ':root, [data-grana-tono]', '@media (prefers-reduced-transparency: reduce)');
        expect(opaco).toEqual({ '--grana-vidrio-fondo': 'var(--grana-vidrio-solido)' });
    });

    it.each(TONOS)('gives the %s tone a solid surface, a text halo and a three-layer shadow', (tono) => {
        const regla = buscar(capas, `[data-grana-tono='${tono}']`);
        expect(regla['--grana-superficie']).toMatch(/^#[0-9a-f]{6}$/);
        expect(regla['--grana-halo']).toMatch(/^0 0 6px rgba\(/);
        const sombra = regla['--grana-sombra-vidrio'] ?? '';
        expect(sombra.split('), ')).toHaveLength(3);
        expect(sombra).toMatch(/^0 1px 2px .*, 0 6px 12px -2px .*, 0 22px 44px -10px rgba\(.*, (0\.3|0\.42)\)$/);
    });

    it('casts a deeper shadow at night than by day', () => {
        expect(tonos.dia.sombra.endsWith(', 0.3)')).toBe(true);
        expect(tonos.noche.sombra.endsWith(', 0.42)')).toBe(true);
        expect(tonos.dia.sombra).toContain('rgba(26, 38, 100, 0.15)');
    });

    it('keeps the intense glass opacity', () => {
        expect(tonos.dia.vidrio.fondo).toMatch(/0\.44\)$/);
        expect(tonos.tarde.vidrio.fondo).toMatch(/0\.38\)$/);
        expect(tonos.noche.vidrio.fondo).toMatch(/0\.38\)$/);
    });
});
