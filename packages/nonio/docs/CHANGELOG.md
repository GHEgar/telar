# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado con
[SemVer](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] - 2026-10-18

### Agregado

- `createSlider`: slider de un valor (`number`) o de dos asas (`[number, number]`) con `min`, `max`,
  `step` sin ruido de decimales, `pageStep` y `minDistance` entre asas, que no se cruzan.
- Teclado de la APG: flechas, Mayús + flecha y RePág/AvPág con el paso largo, Inicio y Fin al límite
  de cada asa.
- Arrastre por puntero: el riel mueve el asa más cercana, el asa conserva el punto donde se tomó y
  `dragRange` desliza entero el tramo entre las dos; `moveRange(by)` hace lo mismo desde código.
- Orientación horizontal y vertical, deshabilitado, `onChange` en cada cambio y `onChangeEnd` al
  soltar o después de cada tecla.
- `useSlider` en `/react`: `role="slider"` con `aria-valuenow`, `aria-valuemin` y `aria-valuemax` que
  reflejan la otra asa, `aria-valuetext` con `getValueText` y nombre con `getAriaLabel` o
  `getLabelProps`. Sin estilos: porcentajes en el snapshot y atributos `data-*`.
