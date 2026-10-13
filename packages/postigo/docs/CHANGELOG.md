# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-13

### Agregado

- Pila de capas: Escape y el clic fuera solo llegan a la capa de encima; un Escape ya prevenido por un
  componente interno no cierra el diálogo.
- Trap de foco que recalcula los tabulables en cada Tab y excluye deshabilitados, ocultos e `inert`.
- Bloqueo del scroll con contador, que compensa la barra y restaura el estilo previo.
- `useDialog`: controlado o no, `dialog` o `alertdialog`, modal o no, `initialFocus`, `returnFocus`,
  `closeOnEscape`, `closeOnOutsideClick` y `onOpenChange` con el motivo del cierre.
