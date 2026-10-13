# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-13

### Agregado

- `useMenu`: botón de menú del patrón de la APG. Flecha abajo, Enter o Espacio abren en el primer
  elemento y flecha arriba en el último; flechas, Inicio, Fin y typeahead dentro del menú con lanzadera.
- Enter, Espacio o clic eligen y regresan el foco al botón; Escape cierra y regresa el foco; Tab y el
  clic fuera cierran.
- Elementos deshabilitados con `aria-disabled`, que el teclado salta y el clic ignora.
- Posición con plomada (`bottom-start` por defecto); el foco espera a que el menú esté colocado.
