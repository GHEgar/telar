# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-13

### Agregado

- `useTooltip`: abre con el puntero tras `delay` y con el foco visible al instante; se queda abierto
  mientras el puntero pasa al tooltip; cierra con `closeDelay`, al salir, con blur, con clic y con
  Escape (antes que un diálogo de postigo).
- Calentamiento: justo después de cerrar uno, el siguiente abre sin espera.
- `role="tooltip"` y `aria-describedby` en el disparador mientras está abierto; posición con plomada,
  arriba por defecto.
- Ignora el puntero táctil; `disabled` lo apaga.
