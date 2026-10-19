import { describe, expect, it } from 'vitest';
import { acento, acentoHex, acentoRgb, datos, datosHex, datosRgb, leerOklch, oklchARgb, rgbAHex, type Rgb } from '../src/index.js';
import { buscar, leer, reglas } from './css.js';

const CHROME: Record<string, Rgb> = {
    'oklch(0.86 0.06 50)': [242, 198, 174],
    'oklch(0.78 0.11 42)': [243, 160, 127],
    'oklch(0.7 0.16 34)': [241, 116, 88],
    'oklch(0.6 0.2 28)': [222, 61, 52],
    'oklch(0.68 0.18 32)': [243, 101, 76],
    'oklch(0.58 0.18 32)': [207, 67, 44],
    'oklch(62.8% 0.2577 29.23)': [255, 0, 0],
    'oklch(0.9 0.3 140)': [75, 255, 0],
};

const cerca = (actual: Rgb, esperado: Rgb): void => {
    actual.forEach((valor, canal) => expect(Math.abs(valor - (esperado[canal] ?? 0))).toBeLessThanOrEqual(1));
};

const raiz = buscar(reglas(leer('grana.css')), ':root');

describe('oklchARgb', () => {
    it.each(Object.entries(CHROME))('paints %s like Chrome within one step', (css, esperado) => {
        cerca(oklchARgb(leerOklch(css)), esperado);
    });

    it('clips out-of-gamut channels and keeps the extremes exact', () => {
        expect(oklchARgb({ l: 1, c: 0, h: 0 })).toEqual([255, 255, 255]);
        expect(oklchARgb({ l: 0, c: 0, h: 0 })).toEqual([0, 0, 0]);
        expect(oklchARgb({ l: 0.9, c: 0.3, h: 140 }).every((valor) => valor >= 0 && valor <= 255)).toBe(true);
    });

    it('reads lightness as a number or a percentage and rejects other forms', () => {
        expect(leerOklch('oklch(68% 0.18 32deg)')).toEqual({ l: 0.68, c: 0.18, h: 32 });
        expect(() => leerOklch('rgb(0 0 0)')).toThrow();
    });
});

describe('RGB exports', () => {
    it('convert the data ramp declared in grana.css', () => {
        datos.forEach((color, indice) => {
            const css = raiz[`--grana-datos-${indice + 1}`] ?? '';
            expect(css).toBe(color);
            expect(datosRgb[indice]).toEqual(oklchARgb(leerOklch(css)));
            cerca(datosRgb[indice] ?? [0, 0, 0], CHROME[css] ?? [0, 0, 0]);
        });
        expect(datosHex).toEqual(['#f2c6ae', '#f39f7f', '#f17458', '#de3d34']);
    });

    it('convert the accent, its strong variant and the ink', () => {
        expect(raiz['--grana-acento']).toBe(acento.base);
        cerca(acentoRgb.base, CHROME['oklch(0.68 0.18 32)'] ?? [0, 0, 0]);
        cerca(acentoRgb.fuerte, CHROME['oklch(0.58 0.18 32)'] ?? [0, 0, 0]);
        expect(acentoRgb.tinta).toEqual([255, 255, 255]);
        expect(acentoHex).toEqual({ base: '#f3654c', fuerte: '#cf432c', tinta: '#ffffff' });
        expect(rgbAHex([0, 15, 255])).toBe('#000fff');
    });
});
