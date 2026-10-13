# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-13

### Agregado

- `useCombobox`: combobox editable con lista (patrón de la APG) y `aria-activedescendant`; al teclear
  apunta a la primera coincidencia y Enter la elige.
- Filtro sin acentos ni mayúsculas, o uno propio, o ninguno; `highlight` para marcar las coincidencias.
- Carga remota con `load(query, signal)`, `minChars`, espera (`debounce`) y cancelación de la petición
  anterior; estados `loading` y `error`.
- Grupos con `groupBy`, en el orden en que se ven y se recorren con el teclado.
- Varios valores (`multiple`) con chips, quitar con su botón o con Retroceso, y lista abierta al elegir.
- Región `status` con «Escribe al menos N letras», «Buscando…», «Sin resultados» o «N resultados».
- Posición con plomada, del ancho del campo; el input sirve de referencia si no se usa
  `getAnchorProps`.
