# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.5.0] - 2026-10-19

### Agregado

- `useMenu({ grid: true })`: navegación en rejilla para menús agrupados en columnas. Izquierda y derecha
  recorren el orden de lectura con vuelta; arriba y abajo van a la opción más cercana de la fila de
  arriba o de abajo según la posición en pantalla, también entre grupos y con columnas de
  `auto-fill`. Inicio, Fin y typeahead siguen igual.
- `verticalNeighbor(boxes, from, direction, isDisabled)` y el tipo `Box`: la geometría pura de esa
  navegación.
- `useMenu({ floating: false })`: el menú no se posiciona con plomada; `getMenuProps()` no trae `style`
  ni `data-side`, así que la posición queda en el CSS o en el `style` propio sin descartar nada. El
  foco entra al abrir sin esperar a una posición.
- `soon` en las opciones de `getItemProps(index, { soon: true })`, en `useMenu` y en `useRadialMenu`:
  marca la acción con `data-soon` para pintarla como «pronto» sin deshabilitarla.

### Cambiado

- La ref de `getButtonProps()` es estable entre renders, así que mezclarla con otra (por ejemplo, con
  el `getTriggerProps(props)` de glosa) no reengancha el botón en cada render.
- Con `grid`, la flecha izquierda en un submenú se mueve en vez de cerrarlo; Escape lo sigue cerrando.

## [0.4.0] - 2026-10-19

### Agregado

- `useRadialMenu({ openOn: 'release' })`: con el ratón, el radial abre al soltar el botón derecho si no
  hubo arrastre (más de 6 px), así que arrastrar con clic derecho sigue girando o inclinando el mapa.
  Sirve con el `contextmenu` antes de soltar (Linux, macOS) y después (Windows); la tecla de menú, el
  toque largo y un `contextmenu` sin `pointerdown` previo abren como antes.
- `rightPress`, `RELEASE_TOLERANCE` y `RELEASE_WINDOW`: la lógica pura de ese gesto.
- `escapeStack` y `escapePriority` (200 por omisión): mientras el radial está abierto registra una capa
  en una pila de Escape estructural (`push(layer) → quitar`), como la de biombo, para que Escape lo
  cierre y regrese el foco aunque esa pila escuche en captura antes que el menú.

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
