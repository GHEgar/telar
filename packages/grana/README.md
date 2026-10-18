# @npmegar/grana

Design tokens as CSS custom properties: coral accent, data ramp, time-of-day tones, glass, type and z bands.

grana is not a component: it ships two stylesheets of `--grana-*` custom properties and a TypeScript
module with the same values as typed data, for places CSS does not reach (map styles, canvas, charts).
It declares variables only — no selectors for your elements, no classes, no resets. Three tones (`dia`,
`tarde`, `noche`) follow the time of day and apply to any container with `data-grana-tono`.

```bash
npm install @npmegar/grana rotulo
```

| Entry | What it is |
|---|---|
| `@npmegar/grana/grana.css` | Every token; imports `tonos.css` |
| `@npmegar/grana/tonos.css` | Only the tones: map base and glass colors |
| `@npmegar/grana` | The same values as objects, `tonoPorHora`, `variablesGlobales` and `variablesDeTono` |

The typeface is not bundled. `--grana-font` starts with `'Rotulo'`; load it from the `rotulo` package
(`import 'rotulo/rotulo.css'`) or the stack falls back to `system-ui`.

## Quick start

```ts
import 'rotulo/rotulo.css';
import '@npmegar/grana/grana.css';
import { tonoPorHora } from '@npmegar/grana';

document.documentElement.dataset.granaTono = tonoPorHora(new Date().getHours());
```

```css
.panel {
    background: var(--grana-vidrio-fondo);
    border: 1px solid var(--grana-vidrio-borde);
    border-radius: var(--grana-radio-vidrio);
    backdrop-filter: var(--grana-vidrio-filtro);
    box-shadow: var(--grana-sombra-vidrio);
    color: var(--grana-vidrio-tinta);
    font: var(--grana-texto-m) / var(--grana-interlineado-normal) var(--grana-font);
    z-index: var(--grana-z-floating);
}
```

## Tones

| Tone | Hours (`tonoPorHora`) | `color-scheme` | Glass opacity |
|---|---|---|---|
| `dia` | 7:00 to 17:30 | `light` | 0.44 |
| `tarde` | 17:30 to 20:00 and 6:00 to 7:00 | `dark` | 0.38 |
| `noche` | 20:00 to 6:00 | `dark` | 0.38 |

`tonoPorHora(hours)` takes fractional hours (`17.5` is 17:30) and wraps around the day; pass the local
solar hour of the place on screen to follow its sun. Without the attribute, `:root` gets `dia`, or
`noche` when the system prefers a dark scheme. Tones nest: a `data-grana-tono` container overrides its
ancestors for everything inside it.

Each tone sets two groups of variables:

| Group | Variables |
|---|---|
| Map base | `--grana-mapa-tierra`, `-manzanas`, `-calles`, `-avenidas`, `-agua`, `-parques`, `-brillo` |
| Glass | `--grana-vidrio-fondo`, `-solido`, `-tinta`, `-tinta-tenue`, `-linea`, `-borde` |

With `prefers-reduced-transparency: reduce`, `--grana-vidrio-fondo` becomes the opaque
`--grana-vidrio-solido` and `--grana-vidrio-filtro` becomes `none`.

## Tokens

| Group | Variables | Values |
|---|---|---|
| Accent | `--grana-acento`, `-suave`, `-fuerte`, `-tinta` | `oklch(0.68 0.18 32)`; soft is a 22% `color-mix` with transparent, strong is relative OKLCH 0.1 darker; ink on accent is white |
| Data ramp | `--grana-datos-1` … `-4` | Four coral classes from light to dark |
| Glass | `--grana-vidrio-desenfoque`, `-saturacion`, `-filtro` | `24px`, `1.5`, `blur() saturate()` |
| Type | `--grana-font`, `--grana-font-mono` | Rotulo with `system-ui`; `ui-monospace` stack for data |
| Type scale | `--grana-texto-2xs` … `-3xl` | 10, 11, 12, 13, 15, 18, 22, 28 px |
| Weights and leading | `--grana-peso-normal`, `-medio`, `-fuerte`; `--grana-interlineado-apretado`, `-normal` | 400, 500, 600; 1.2, 1.45 |
| Radius | `--grana-radio-chico`, `-control`, `-fila`, `-vidrio`, `-pildora` | 4, 8, 11, 16, 999 px |
| Spacing | `--grana-espacio-1` … `-6` | 4, 8, 12, 16, 24, 32 px |
| Shadow | `--grana-sombra-vidrio`, `-flotante` | Glass panels; small floating controls |
| Focus | `--grana-foco-ancho`, `-separacion` | `2px`, `2px` |
| Motion | `--grana-duracion-rapida`, `-media`, `-lenta`, `-tono`; `--grana-curva`, `-salida` | 150, 250, 350, 600 ms; `ease` and a decelerating curve |
| z bands | `--grana-z-overlay`, `-docked`, `-floating`, `-menu`, `-modal` | 5, 20, 30, 50, 60 |

With `prefers-reduced-motion: reduce` every duration becomes `0.01ms`, not `0`, so `transitionend` and
`animationend` still fire for code that waits on them.

The z bands share their names and bases with the default bands of the biombo panel manager, so
`bandas` from the module can be passed as its `bands` option and CSS layers line up with its panels.

## Values in TypeScript

| Export | What it holds |
|---|---|
| `tonos` | `{ dia, tarde, noche }`, each with `esquema`, `mapa` and `vidrio` |
| `acento`, `datos`, `vidrio`, `tipografia`, `radios`, `espacios`, `sombras`, `foco`, `movimiento`, `bandas` | The global tokens |
| `TONOS`, `HORAS` | Tone names in order; the hours where tones change |
| `variablesGlobales()`, `variablesDeTono(tono)` | `{ '--grana-…': value }` maps, as declared in the stylesheets |

Colors are CSS strings. The accent's soft and strong variants keep their `color-mix` and relative OKLCH
form, so they work in CSS and canvas but not in renderers that only parse hex or `rgb()`.

## Known limitations

- Derived values (`--grana-acento-suave`, `-fuerte`, `--grana-vidrio-filtro`) resolve on `:root`.
  Override `--grana-acento` or the blur there, not on a nested container, or redeclare the derived ones.
- `--grana-acento-fuerte` uses relative color syntax (`oklch(from …)`); older browsers drop it.
- Support for `prefers-reduced-transparency` is still partial; where the browser does not report it,
  the glass stays translucent.

## License

AGPL-3.0-only
