# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

### Cambiado

- Se publica como `@npmegar/plomada` en lugar de `@ghegar/plomada`.

## [0.1.0] - 2026-10-13

### Agregado

- `computePosition`: lado y alineación, separación, volteo al lado con más espacio, recorrido dentro
  del viewport con margen, espacio disponible y posición de la flecha.
- `autoUpdate`: recalcula en el siguiente cuadro con scroll (de cualquier contenedor), resize, el
  viewport visual y `ResizeObserver` sobre la referencia y el flotante.
- `usePosition`: posición fija calculada antes de pintar, oculta hasta medir; `sameWidth`,
  `getReferenceProps`, `getFloatingProps` con `data-side`, `data-align` y `data-placement`, y estilos de
  la flecha.
