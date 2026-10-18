import { describe, expect, it } from 'vitest';
import { movimiento, TONOS, tonos, variablesDeTono, variablesGlobales } from '../src/index.js';
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
        expect(opaco).toEqual({ '--grana-vidrio-fondo': 'var(--grana-vidrio-solido)', '--grana-vidrio-filtro': 'none' });
    });

    it('keeps the intense glass opacity', () => {
        expect(tonos.dia.vidrio.fondo).toMatch(/0\.44\)$/);
        expect(tonos.tarde.vidrio.fondo).toMatch(/0\.38\)$/);
        expect(tonos.noche.vidrio.fondo).toMatch(/0\.38\)$/);
    });
});
