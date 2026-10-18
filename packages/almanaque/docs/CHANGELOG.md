# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

### Cambiado

- Etiquetas y locale por defecto en inglés (`en-US`); quien dependa de los textos en español debe
  pasarlos con `labels` y `locale`.
- Se publica como `@npmegar/almanaque` en lugar de `@ghegar/almanaque`.

## [0.3.0] - 2026-10-13

### Agregado

- `contiguous` en modo rango: con el inicio elegido, se deshabilitan los días que quedan detrás del
  primer día deshabilitado en cada dirección, también fuera de los meses visibles.

## [0.2.0] - 2026-10-13

### Agregado

- Teclado en las vistas de meses y años: flechas (de tres en tres en vertical), Inicio, Fin, RePág,
  AvPág, Enter o Espacio para elegir y Escape para volver a los días.
- Foco itinerante en los botones de mes y año (`tabIndex` y `data-chip`); al abrir una vista o elegir,
  el foco pasa al elemento actual.

### Cambiado

- `getMonthProps` y `getYearProps` traen `tabIndex` y `onKeyDown`.

## [0.1.0] - 2026-10-13

### Agregado

- Fechas ISO `YYYY-MM-DD` sin zona: aritmética con enteros, semana de lunes a domingo.
- `createCalendar`: vistas de días, meses y años; `min`, `max` e `isDisabled`; modos `single` y
  `range` con vista previa al pasar el ratón, `minDays` y `maxDays`; varios meses con `months`.
- Navegación con teclado del patrón de date picker de la APG.
- Etiquetas es-MX con `Intl`, reemplazables con `labels`.
- `useCalendar` con prop getters, ARIA y atributos `data-*`; valor y rango controlados.
