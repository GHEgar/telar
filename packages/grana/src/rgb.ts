import { acento, datos } from './tokens.js';

export type Rgb = readonly [number, number, number];

export interface Oklch {
    l: number;
    c: number;
    h: number;
}

const FORMA = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/;

export function leerOklch(css: string): Oklch {
    const partes = FORMA.exec(css.trim());
    if (!partes) {
        throw new Error(`No es un color oklch(L C H): ${css}`);
    }
    const [, l = '0', porcentaje, c = '0', h = '0'] = partes;
    return { l: porcentaje ? Number(l) / 100 : Number(l), c: Number(c), h: Number(h) };
}

const gamma = (lineal: number): number =>
    (lineal <= 0.0031308 ? 12.92 * lineal : 1.055 * lineal ** (1 / 2.4) - 0.055);

const canal = (lineal: number): number => Math.round(Math.min(Math.max(gamma(lineal), 0), 1) * 255);

export function oklchARgb({ l, c, h }: Oklch): Rgb {
    const radianes = (h * Math.PI) / 180;
    const a = c * Math.cos(radianes);
    const b = c * Math.sin(radianes);
    const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        canal(4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp),
        canal(-1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp),
        canal(-0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp),
    ];
}

export const rgbAHex = (rgb: Rgb): string => `#${rgb.map((valor) => valor.toString(16).padStart(2, '0')).join('')}`;

const hexARgb = (hex: string): Rgb => [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16)) as unknown as Rgb;

const BASE = leerOklch(acento.base);

export const datosRgb: readonly Rgb[] = datos.map((color) => oklchARgb(leerOklch(color)));

export const datosHex: readonly string[] = datosRgb.map(rgbAHex);

export const acentoRgb: Readonly<{ base: Rgb; fuerte: Rgb; tinta: Rgb }> = {
    base: oklchARgb(BASE),
    fuerte: oklchARgb({ ...BASE, l: BASE.l - 0.1 }),
    tinta: hexARgb(acento.tinta),
};

export const acentoHex: Readonly<{ base: string; fuerte: string; tinta: string }> = {
    base: rgbAHex(acentoRgb.base),
    fuerte: rgbAHex(acentoRgb.fuerte),
    tinta: rgbAHex(acentoRgb.tinta),
};
