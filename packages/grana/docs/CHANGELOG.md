# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

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
