import {
    acento,
    bandas,
    datos,
    escala,
    espacios,
    estado,
    foco,
    movimiento,
    radios,
    sombras,
    tipografia,
    tonos,
    vidrio,
    type Tono,
} from './tokens.js';

const kebab = (name: string): string => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const prefixed = (group: string, values: Readonly<Record<string, string | number>>): Record<string, string> =>
    Object.fromEntries(Object.entries(values).map(([key, value]) => [`--grana-${group}-${kebab(key)}`, String(value)]));

export function variablesGlobales(): Record<string, string> {
    return {
        '--grana-acento': acento.base,
        '--grana-acento-suave': acento.suave,
        '--grana-acento-fuerte': acento.fuerte,
        '--grana-acento-tinta': acento.tinta,
        ...Object.fromEntries(datos.map((color, index) => [`--grana-datos-${index + 1}`, color])),
        '--grana-peligro': estado.peligro,
        '--grana-peligro-tinta': estado.peligroTinta,
        '--grana-exito': estado.exito,
        '--grana-exito-tinta': estado.exitoTinta,
        '--grana-escala': String(escala),
        '--grana-vidrio-desenfoque': vidrio.desenfoque,
        '--grana-vidrio-saturacion': vidrio.saturacion,
        '--grana-font': tipografia.familia,
        '--grana-font-mono': tipografia.mono,
        ...prefixed('texto', tipografia.tamanos),
        ...prefixed('peso', tipografia.pesos),
        ...prefixed('interlineado', tipografia.interlineado),
        ...prefixed('radio', radios),
        ...prefixed('espacio', espacios),
        ...prefixed('sombra', sombras),
        ...prefixed('foco', foco),
        '--grana-duracion-rapida': movimiento.rapida,
        '--grana-duracion-media': movimiento.media,
        '--grana-duracion-lenta': movimiento.lenta,
        '--grana-duracion-tono': movimiento.tono,
        '--grana-curva': movimiento.curva,
        '--grana-curva-salida': movimiento.curvaSalida,
        ...prefixed('z', bandas),
    };
}

export function variablesDeTono(tono: Tono): Record<string, string> {
    const { mapa, vidrio: capa, superficie, halo, sombra } = tonos[tono];
    return {
        ...prefixed('mapa', { ...mapa }),
        ...prefixed('vidrio', { ...capa }),
        '--grana-superficie': superficie,
        '--grana-halo': halo,
        '--grana-sombra-vidrio': sombra,
    };
}
