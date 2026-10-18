import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Regla {
    media: string | null;
    selector: string;
    declaraciones: Record<string, string>;
}

export const leer = (archivo: string): string =>
    readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', archivo), 'utf8');

const declaraciones = (cuerpo: string): Record<string, string> => Object.fromEntries(
    cuerpo.split(';').map((parte) => parte.trim()).filter(Boolean).map((parte) => {
        const corte = parte.indexOf(':');
        return [parte.slice(0, corte).trim(), parte.slice(corte + 1).trim()];
    }),
);

export function reglas(css: string): Regla[] {
    const resultado: Regla[] = [];
    const pila: string[] = [];
    let texto = '';
    for (const caracter of css.replace(/@import[^;]+;/g, '')) {
        if (caracter === '{') {
            pila.push(texto.trim());
            texto = '';
        } else if (caracter === '}') {
            const cabeza = pila.pop() ?? '';
            if (!cabeza.startsWith('@')) {
                const media = pila.find((nivel) => nivel.startsWith('@media')) ?? null;
                resultado.push({ media, selector: cabeza.replace(/\s+/g, ' '), declaraciones: declaraciones(texto) });
            }
            texto = '';
        } else {
            texto += caracter;
        }
    }
    return resultado;
}

export function buscar(lista: Regla[], selector: string, media: string | null = null): Record<string, string> {
    const regla = lista.find((item) => item.selector === selector && item.media === media);
    if (!regla) {
        throw new Error(`Sin regla ${selector} en ${media ?? 'raíz'}`);
    }
    return regla.declaraciones;
}

export function resolver(valores: Record<string, string>): Record<string, string> {
    const sustituir = (valor: string): string =>
        valor.replace(/var\((--[\w-]+)\)/g, (_, nombre: string) => sustituir(valores[nombre] ?? `var(${nombre})`));
    return Object.fromEntries(Object.entries(valores).map(([nombre, valor]) => [nombre, sustituir(valor)]));
}

export const soloVariables = (valores: Record<string, string>): Record<string, string> =>
    Object.fromEntries(Object.entries(valores).filter(([nombre]) => nombre.startsWith('--')));
