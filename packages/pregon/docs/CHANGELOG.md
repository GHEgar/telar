# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-18

### Agregado

- `createToaster`: cola de avisos con límite de visibles, duración por aviso (`Infinity` para que no
  se cierre solo, y así por defecto si trae acción), prioridad `polite` o `assertive` (que se adelanta
  en la cola), pausa con razones contadas que conserva el tiempo restante y salida animada con `exit`.
- Anuncios en dos live regions fijas; un mensaje repetido se vuelve a anunciar.
- `useToaster` en `/react`, con su propio store o con uno creado fuera de React: viewport `region` que
  pausa con el puntero o el foco dentro, pausa con la página oculta, botones de cerrar y de acción,
  títulos y descripciones enlazados con ARIA y Escape opcional que cierra el último.
- No mueve el foco, salvo para no perderlo: si el aviso que se cierra lo tenía, pasa al viewport.
