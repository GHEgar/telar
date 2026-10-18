# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

### Cambiado

- Se publica como `@npmegar/postigo` en lugar de `@ghegar/postigo`.

## [0.2.0] - 2026-10-13

### Agregado

- `inert` (activo por defecto en los modales): el resto de la página queda inerte mientras el diálogo
  está abierto, con un contador para los anidados y sin tocar lo que ya era inerte.
- `exit` y `mounted`: el diálogo sigue montado con `data-state="closed"` hasta que termina su
  animación o pasan `exit` milisegundos.
- `inertOthers` en el core.

## [0.1.0] - 2026-10-13

### Agregado

- Pila de capas: Escape y el clic fuera solo llegan a la capa de encima; un Escape ya prevenido por un
  componente interno no cierra el diálogo.
- Trap de foco que recalcula los tabulables en cada Tab y excluye deshabilitados, ocultos e `inert`.
- Bloqueo del scroll con contador, que compensa la barra y restaura el estilo previo.
- `useDialog`: controlado o no, `dialog` o `alertdialog`, modal o no, `initialFocus`, `returnFocus`,
  `closeOnEscape`, `closeOnOutsideClick` y `onOpenChange` con el motivo del cierre.
