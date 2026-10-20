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
    -webkit-backdrop-filter: var(--grana-vidrio-filtro);
    backdrop-filter: var(--grana-vidrio-filtro);
    box-shadow: var(--grana-sombra-vidrio);
    color: var(--grana-vidrio-tinta);
    font: var(--grana-texto-m) / var(--grana-interlineado-normal) var(--grana-font);
    z-index: var(--grana-z-floating);
}
```

Declare `-webkit-backdrop-filter` before `backdrop-filter`. Minifiers such as Lightning CSS keep only the
last of the pair, and Chrome ignores the prefixed one.

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

Each tone sets these variables:

| Group | Variables |
|---|---|
| Map base | `--grana-mapa-tierra`, `-manzanas`, `-calles`, `-avenidas`, `-agua`, `-parques`, `-brillo` |
| Glass | `--grana-vidrio-fondo`, `-solido`, `-tinta`, `-tinta-tenue`, `-linea`, `-borde` |
| Surface | `--grana-superficie`: an opaque surface for chips, handles and cards that must not show the map through |
| Halo | `--grana-halo`: a `text-shadow` in the tone's background color, to read text laid straight on the map |
| Shadow | `--grana-sombra-vidrio`: three layers (`0 1px 2px`, `0 6px 12px -2px`, `0 22px 44px -10px`), 0.3 strong by day and 0.42 at dusk and night |

```css
.label-on-map {
    color: var(--grana-vidrio-tinta);
    text-shadow: var(--grana-halo);
}
```

With `prefers-reduced-transparency: reduce`, `--grana-vidrio-fondo` becomes the opaque
`--grana-vidrio-solido` and `--grana-vidrio-filtro` becomes `none`.

## Tokens

| Group | Variables | Values |
|---|---|---|
| Accent | `--grana-acento`, `-suave`, `-fuerte`, `-tinta` | `oklch(0.68 0.18 32)`; soft is a 22% `color-mix` with transparent, strong is relative OKLCH 0.1 darker; ink on accent is white |
| Data ramp | `--grana-datos-1` … `-4` | Four coral classes from light to dark |
| State | `--grana-peligro`, `-peligro-tinta`; `--grana-exito`, `-exito-tinta` | Danger `oklch(0.62 0.21 25)` and success `oklch(0.62 0.15 155)`, white ink on both |
| Scale | `--grana-escala` | `1`; see [Interface scale](#interface-scale) |
| Glass | `--grana-vidrio-desenfoque`, `-saturacion`, `-filtro` | `24px`, `1.5`, `blur() saturate()` |
| Type | `--grana-font`, `--grana-font-mono` | Rotulo with `system-ui`; `ui-monospace` stack for data |
| Type scale | `--grana-texto-2xs` … `-3xl` | 10, 11, 12, 13, 15, 18, 22, 28 px |
| Weights and leading | `--grana-peso-normal`, `-medio`, `-fuerte`; `--grana-interlineado-apretado`, `-normal` | 400, 500, 600; 1.2, 1.45 |
| Radius | `--grana-radio-chico`, `-control`, `-fila`, `-vidrio`, `-pildora` | 4, 8, 11, 16, 999 px |
| Spacing | `--grana-espacio-1` … `-6` | 4, 8, 12, 16, 24, 32 px |
| Shadow | `--grana-sombra-flotante` | Small floating controls; the glass shadow comes with each tone |
| Focus | `--grana-foco-ancho`, `-separacion` | `2px`, `2px` |
| Motion | `--grana-duracion-rapida`, `-media`, `-lenta`, `-tono`; `--grana-curva`, `-salida` | 150, 250, 350, 600 ms; `ease` and a decelerating curve |
| z bands | `--grana-z-overlay`, `-docked`, `-floating`, `-menu`, `-modal` | 5, 20, 30, 50, 60 |

With `prefers-reduced-motion: reduce` every duration becomes `0.01ms`, not `0`, so `transitionend` and
`animationend` still fire for code that waits on them.

## Interface scale

`--grana-escala` is a unitless factor, `1` by default. grana does not apply it to its own sizes, so the
type scale and spacing stay the same unless a piece opts in. Multiply what should grow with it, or
zoom a whole container, and change the factor on any ancestor:

```css
.toolbar {
    padding: calc(var(--grana-espacio-2) * var(--grana-escala));
    font-size: calc(var(--grana-texto-m) * var(--grana-escala));
}

.panel {
    zoom: var(--grana-escala);
}

.app[data-size='large'] {
    --grana-escala: 1.2;
}
```

Use one of the two per element: a `calc()` size inside a zoomed container is scaled twice.

## Glass filter

`--grana-vidrio-filtro` is declared on every element (`:where(*)`, `::before`, `::after`) from
`--grana-vidrio-desenfoque` and `--grana-vidrio-saturacion`, so overriding the blur or the saturation
on a container changes the glass inside it:

```css
.sidebar {
    --grana-vidrio-desenfoque: 12px;
    --grana-vidrio-saturacion: 1;
}
```

Because every element recomputes it, a container cannot pass a whole new `--grana-vidrio-filtro` down to
its descendants; override the two inputs instead, or set the filter on the element that uses it.

The z bands share their names and bases with the default bands of the biombo panel manager, so
`bandas` from the module can be passed as its `bands` option and CSS layers line up with its panels.

## Values in TypeScript

| Export | What it holds |
|---|---|
| `tonos` | `{ dia, tarde, noche }`, each with `esquema`, `mapa`, `vidrio`, `superficie`, `halo` and `sombra` |
| `tonos[tono].superficie`, `.halo`, `.sombra` | Solid surface, text halo and glass shadow of each tone |
| `acento`, `datos`, `estado`, `escala`, `vidrio`, `tipografia`, `radios`, `espacios`, `sombras`, `foco`, `movimiento`, `bandas` | The global tokens |
| `TONOS`, `HORAS` | Tone names in order; the hours where tones change |
| `variablesGlobales()`, `variablesDeTono(tono)` | `{ '--grana-…': value }` maps, as declared on `:root` and the tones; `--grana-vidrio-filtro` is declared per element and lives in `vidrio.filtro` |

Colors are CSS strings. The accent's soft and strong variants keep their `color-mix` and relative OKLCH
form, so they work in CSS and canvas but not in renderers that only parse hex or `rgb()`.

For renderers that only read sRGB (deck.gl, WebGL, some chart libraries), the data ramp and the
accent also come converted:

| Export | What it holds |
|---|---|
| `datosRgb`, `datosHex` | The four data classes as `[r, g, b]` (0–255) and `#rrggbb` |
| `acentoRgb`, `acentoHex` | `{ base, fuerte, tinta }` in the same two forms |
| `estadoRgb`, `estadoHex` | `{ peligro, peligroTinta, exito, exitoTinta }` in the same two forms |
| `oklchARgb(oklch)`, `leerOklch(css)`, `rgbAHex(rgb)` | The pure conversion, without canvas or DOM |

```ts
import { datosRgb } from '@npmegar/grana';

new HexagonLayer({ id: 'hexbin', data, colorRange: [...datosRgb] });
```

Channels outside sRGB are clipped, as Chrome paints them; tests keep the values within one step of
what the browser renders for the CSS variables.

## Known limitations

- The accent's derived values (`--grana-acento-suave`, `-fuerte`) resolve on `:root`. Override
  `--grana-acento` there, not on a nested container, or redeclare the derived ones.
- `--grana-acento-fuerte` uses relative color syntax (`oklch(from …)`); older browsers drop it.
- Support for `prefers-reduced-transparency` is still partial; where the browser does not report it,
  the glass stays translucent.

## License

AGPL-3.0-only
