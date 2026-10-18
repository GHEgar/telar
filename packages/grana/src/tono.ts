import type { Tono } from './tokens.js';

export const HORAS = {
    amanecer: 6,
    dia: 7,
    tarde: 17.5,
    noche: 20,
} as const;

export function tonoPorHora(horas: number): Tono {
    const hora = ((horas % 24) + 24) % 24;
    if (hora >= HORAS.dia && hora < HORAS.tarde) {
        return 'dia';
    }
    if ((hora >= HORAS.tarde && hora < HORAS.noche) || (hora >= HORAS.amanecer && hora < HORAS.dia)) {
        return 'tarde';
    }
    return 'noche';
}
