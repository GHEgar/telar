export type Tono = 'dia' | 'tarde' | 'noche';

export interface MapaBase {
    tierra: string;
    manzanas: string;
    calles: string;
    avenidas: string;
    agua: string;
    parques: string;
    brillo: string;
}

export interface Vidrio {
    fondo: string;
    solido: string;
    tinta: string;
    tintaTenue: string;
    linea: string;
    borde: string;
}

export interface ValoresDeTono {
    esquema: 'light' | 'dark';
    mapa: MapaBase;
    vidrio: Vidrio;
}

export const TONOS: readonly Tono[] = ['dia', 'tarde', 'noche'];

const VIDRIO_OSCURO: Vidrio = {
    fondo: 'rgba(18, 22, 34, 0.38)',
    solido: 'rgba(18, 22, 34, 0.72)',
    tinta: '#f3eef2',
    tintaTenue: '#c3b6c8',
    linea: 'rgba(255, 255, 255, 0.14)',
    borde: 'rgba(255, 255, 255, 0.18)',
};

export const tonos: Readonly<Record<Tono, ValoresDeTono>> = {
    dia: {
        esquema: 'light',
        mapa: {
            tierra: '#e8edef',
            manzanas: '#dbe2e6',
            calles: '#ffffff',
            avenidas: '#ffd38a',
            agua: '#a9c9e6',
            parques: '#cde3cf',
            brillo: 'transparent',
        },
        vidrio: {
            fondo: 'rgba(250, 252, 255, 0.44)',
            solido: 'rgba(250, 252, 255, 0.8)',
            tinta: '#10202c',
            tintaTenue: '#4c5d6d',
            linea: 'rgba(20, 40, 60, 0.14)',
            borde: 'rgba(255, 255, 255, 0.6)',
        },
    },
    tarde: {
        esquema: 'dark',
        mapa: {
            tierra: '#2a2440',
            manzanas: '#352d4f',
            calles: '#463c63',
            avenidas: '#ffb36b',
            agua: '#1c2547',
            parques: '#2c3f45',
            brillo: '#ffcf8a',
        },
        vidrio: VIDRIO_OSCURO,
    },
    noche: {
        esquema: 'dark',
        mapa: {
            tierra: '#141a2e',
            manzanas: '#1e2640',
            calles: '#2a3352',
            avenidas: '#ffcf7a',
            agua: '#0a1530',
            parques: '#17302a',
            brillo: '#ffb54d',
        },
        vidrio: VIDRIO_OSCURO,
    },
};

const ACENTO_BASE = 'oklch(0.68 0.18 32)';

export const acento = {
    base: ACENTO_BASE,
    suave: `color-mix(in oklch, ${ACENTO_BASE} 22%, transparent)`,
    fuerte: `oklch(from ${ACENTO_BASE} calc(l - 0.1) c h)`,
    tinta: '#ffffff',
} as const;

export const datos = [
    'oklch(0.86 0.06 50)',
    'oklch(0.78 0.11 42)',
    'oklch(0.7 0.16 34)',
    'oklch(0.6 0.2 28)',
] as const;

export const vidrio = {
    desenfoque: '24px',
    saturacion: '1.5',
    filtro: 'blur(24px) saturate(1.5)',
} as const;

export const tipografia = {
    familia: '\'Rotulo\', system-ui, sans-serif',
    mono: 'ui-monospace, \'SF Mono\', \'Cascadia Mono\', Menlo, Consolas, monospace',
    tamanos: {
        '2xs': '10px',
        xs: '11px',
        s: '12px',
        m: '13px',
        l: '15px',
        xl: '18px',
        '2xl': '22px',
        '3xl': '28px',
    },
    pesos: {
        normal: '400',
        medio: '500',
        fuerte: '600',
    },
    interlineado: {
        apretado: '1.2',
        normal: '1.45',
    },
} as const;

export const radios = {
    chico: '4px',
    control: '8px',
    fila: '11px',
    vidrio: '16px',
    pildora: '999px',
} as const;

export const espacios = {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '24px',
    6: '32px',
} as const;

export const sombras = {
    vidrio: '0 10px 30px rgba(0, 0, 0, 0.3)',
    flotante: '0 6px 18px rgba(0, 0, 0, 0.3)',
} as const;

export const foco = {
    ancho: '2px',
    separacion: '2px',
} as const;

export const movimiento = {
    rapida: '150ms',
    media: '250ms',
    lenta: '350ms',
    tono: '600ms',
    curva: 'ease',
    curvaSalida: 'cubic-bezier(0.2, 0, 0, 1)',
    reducida: '0.01ms',
} as const;

export const bandas = {
    overlay: 5,
    docked: 20,
    floating: 30,
    menu: 50,
    modal: 60,
} as const;
