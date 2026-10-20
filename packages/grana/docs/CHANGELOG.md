# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.3.0] - 2026-10-19

### Agregado

- `--grana-escala` (1 por omisión): factor de tamaño de interfaz para multiplicar tamaños con `calc()`
  o aplicarlo con `zoom`; redefinirlo en un contenedor escala todo lo que hay dentro. `escala` en el
  módulo.
- Colores de estado `--grana-peligro` y `--grana-exito` con su tinta `--grana-peligro-tinta` y
  `--grana-exito-tinta`; `estado`, `estadoRgb` y `estadoHex` en el módulo.
- Por tono: superficie sólida `--grana-superficie`, halo de texto `--grana-halo` para leer sobre el
  mapa y `--grana-sombra-vidrio`; `superficie`, `halo` y `sombra` en `tonos`.

### Cambiado

- `--grana-sombra-vidrio` pasa a cada tono con tres capas (`0 1px 2px`, `0 6px 12px -2px` y
  `0 22px 44px -10px`) que separan más el vidrio del fondo: fuerza 0.3 de día y 0.42 de tarde y de
  noche. `sombras` ya no trae `vidrio`.
- `--grana-vidrio-filtro` se resuelve en cada elemento y no en `:root`: redefinir
  `--grana-vidrio-desenfoque` o `--grana-vidrio-saturacion` en un contenedor ya surte efecto. Con
  `prefers-reduced-transparency: reduce` lo anula `grana.css` y no `tonos.css`. `variablesGlobales()` ya
  no lo incluye; su valor resuelto sigue en `vidrio.filtro`.

## [0.2.0] - 2026-10-19

### Agregado

- La rampa de datos y el acento también en sRGB, para renderers que no leen OKLCH (deck.gl, WebGL):
  `datosRgb` y `acentoRgb` (`[r, g, b]` de 0 a 255) y `datosHex` y `acentoHex`. El acento trae `base`,
  `fuerte` y `tinta`.
- `oklchARgb`, `leerOklch` y `rgbAHex`: conversión OKLCH → sRGB pura en TS, sin canvas ni DOM, con
  recorte por canal como lo pinta Chrome; coincide con el CSS a un paso de 255 como mucho.

## [0.1.0] - 2026-10-18

### Agregado

- `grana.css`: acento coral `oklch(0.68 0.18 32)` con variantes suave y fuerte, rampa de datos de cuatro
  clases, tipografía Rotulo y monoespaciada, escala tipográfica, pesos, interlineado, radios, espaciado,
  sombras, foco, duraciones y curvas, y bandas de z con los nombres de las de biombo.
- `tonos.css`: tonos `dia`, `tarde` y `noche` con mapa base y vidrio, aplicables con
  `[data-grana-tono]` en cualquier contenedor; `:root` toma `dia` o `noche` según `prefers-color-scheme`.
- Vidrio intenso: desenfoque de 24 px y saturación 1.5; fondo opaco y sin filtro con
  `prefers-reduced-transparency: reduce`.
- Duraciones de `0.01ms` con `prefers-reduced-motion: reduce`.
- Módulo TS con los mismos valores como objetos tipados, `tonoPorHora`, `variablesGlobales` y
  `variablesDeTono`.
