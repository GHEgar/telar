# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

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
