# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.3.0] - 2026-10-18

### Agregado

- `useRadialMenu`: menú radial que se abre en un punto con clic derecho, con la tecla de menú o
  Mayús+F10 (en el centro del área) o al mantener presionado con el dedo (`longPress`, 500 ms) sin
  moverse.
- El mismo teclado que el menú: foco en el primero al abrir, flechas que recorren el círculo con
  vuelta, Inicio, Fin y typeahead; Enter o Espacio eligen. Elegir y Escape regresan el foco a lo que lo
  tenía antes de abrir; Tab y el clic fuera solo cierran.
- `radialLayout` y `clampCenter`: posiciones en círculo o en arco (`radius`, `startAngle`, `sweep`) y
  centro recorrido para que el círculo quepa en el viewport. El hook las expone como `center` y
  `getItemPosition(index)`, en números y sin estilos.

### Cambiado

- Se publica como `@npmegar/abanico` en lugar de `@ghegar/abanico`.
- Depende de `@npmegar/lanzadera` y `@npmegar/plomada`.

## [0.2.0] - 2026-10-13

### Agregado

- Submenús con `parent: { link, index }` y `getTriggerProps`: flecha derecha, Enter o Espacio los
  abren; flecha izquierda o Escape regresan al padre; un clic dentro del submenú no cierra al padre.
- Elementos marcables `checkbox` y `radio` con `aria-checked`, que no cierran el menú al elegirse.
- `getSeparatorProps` y `getGroupProps`.

### Cambiado

- Depende de `@ghegar/plomada` `^0.2.0`.

## [0.1.0] - 2026-10-13

### Agregado

- `useMenu`: botón de menú del patrón de la APG. Flecha abajo, Enter o Espacio abren en el primer
  elemento y flecha arriba en el último; flechas, Inicio, Fin y typeahead dentro del menú con lanzadera.
- Enter, Espacio o clic eligen y regresan el foco al botón; Escape cierra y regresa el foco; Tab y el
  clic fuera cierran.
- Elementos deshabilitados con `aria-disabled`, que el teclado salta y el clic ignora.
- Posición con plomada (`bottom-start` por defecto); el foco espera a que el menú esté colocado.
