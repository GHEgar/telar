# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-13

### Agregado

- Fechas ISO `YYYY-MM-DD` sin zona: aritmética con enteros, semana de lunes a domingo.
- `createCalendar`: vistas de días, meses y años; `min`, `max` e `isDisabled`; modos `single` y
  `range` con vista previa al pasar el ratón, `minDays` y `maxDays`; varios meses con `months`.
- Navegación con teclado del patrón de date picker de la APG.
- Etiquetas es-MX con `Intl`, reemplazables con `labels`.
- `useCalendar` con prop getters, ARIA y atributos `data-*`; valor y rango controlados.
