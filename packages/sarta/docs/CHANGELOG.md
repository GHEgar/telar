# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-18

### Agregado

- `reorder`, `targetIndex` y `offsetsFor`: mover un elemento de lugar, destino por centros y
  desplazamientos de cada elemento con tamaños y huecos distintos.
- `createSortable`: agarrar, mover, soltar y cancelar con anuncios «position N of M»; `onReorder(from,
  to)` solo si cambió de lugar.
- `useSortable` en `/react`: asas con foco itinerante de `@npmegar/lanzadera`; Espacio o Enter agarran
  y sueltan, las flechas del eje, Inicio y Fin mueven, Escape o perder el foco cancelan.
- Arrastre con ratón tras 4 px y con el dedo al mantener presionado 250 ms, sin desplazar la página;
  Escape cancela. El DOM no se mueve durante el arrastre: `offsets` en píxeles para `transform`, y al
  soltar el foco sigue al elemento en su nuevo lugar.
- Instrucciones ocultas en `aria-describedby`, `aria-pressed` mientras está agarrada y textos en inglés
  reemplazables con `labels`.
