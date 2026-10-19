# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.3.0] - 2026-10-19

### Agregado

- Modo comando (`selectBehavior: 'command'`): elegir una opción llama a `onSelect(item)` sin llenar el
  input ni tocar `value` o `values`; el texto se queda como estaba.
- `onSelect(item)`, en los dos modos, y `closeOnSelect` (por omisión `true` con un valor y `false` con
  varios) para dejar la lista abierta después de elegir.
- `setInputValue(text)`: escribe en el input y filtra como si se hubiera tecleado; si la lista está
  abierta, apunta a la primera coincidencia. No abre una lista cerrada.
- `position: false`: no usa plomada; la lista no recibe `style` ni `data-placement` y `position` queda
  en `null`, para el consumidor que la coloca él mismo.

### Cambiado

- Etiquetas y locale por defecto en inglés (`en-US`); quien dependa de los textos en español debe
  pasarlos con `labels`.
- Se publica como `@npmegar/muestrario` en lugar de `@ghegar/muestrario`.
- Depende de `@npmegar/lanzadera` y `@npmegar/plomada`.

## [0.2.0] - 2026-10-13

### Agregado

- `onCreate(text)`: una opción más al final cuando nada coincide exacto; lo que devuelve se elige.
- `freeText`: con un valor, el texto escrito se queda al perder el foco.
- Lista virtual (`virtual: { itemHeight, height, overscan }`) con `aria-setsize` y `aria-posinset`.

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
