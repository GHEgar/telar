# <picture><source media="(prefers-color-scheme: dark)" srcset=".github/assets/icon-dark.svg"><img src=".github/assets/icon-light.svg" width="36" height="36" alt=""></picture> telar

[![license](https://img.shields.io/github/license/GHEgar/telar)](LICENSE)

Headless React components, one package each: calendar, dropzone, dialog, tabs, tooltip, menu, combobox and more.

![Picking a date, filtering a combobox, a tooltip and a keyboard menu, and a dialog stacked over another](.github/assets/demo.gif)

Each piece owns the behavior — state, keyboard, focus, ARIA and events — and you own every pixel: they
ship no styles and no portals, only state, prop getters and `data-*` attributes to style against. The
only inline styles are functional ones (`position: fixed`, `left`, `top` from the positioning layer).
Every piece is published on its own under `@ghegar/`, with its own version and changelog.

## Install

```bash
npm install @ghegar/almanaque
```

| Package | What it is | Depends on |
|---|---|---|
| [`@ghegar/almanaque`](packages/almanaque) | Calendar in es-MX: Monday-first weeks, timezone-free ISO dates, day/month/year views, limits and ranges | `react >= 19` |
| [`@ghegar/buzon`](packages/buzon) | File dropzone: type, size, count and duplicate validation, accumulation, rejections and previews | `react >= 19` |
| [`@ghegar/postigo`](packages/postigo) | Modal dialog: layer stack, focus trap and return, Escape and outside click for the top layer, counted scroll lock | `react >= 19` |
| [`@ghegar/lanzadera`](packages/lanzadera) | Roving focus: arrows by orientation or grid, Home/End, disabled items, typeahead | `react >= 19` |
| [`@ghegar/solapa`](packages/solapa) | Tabs: linked panels, automatic or manual activation, vertical orientation | lanzadera |
| [`@ghegar/plomada`](packages/plomada) | Floating positioning: side and alignment, flip, shift, available space, arrow, auto update | `react >= 19` |
| [`@ghegar/glosa`](packages/glosa) | Tooltip: hover and focus with delays, hoverable, Escape, aria-describedby | plomada |
| [`@ghegar/abanico`](packages/abanico) | Menu button: keyboard opening, roving focus with typeahead, disabled items, Escape and outside click | lanzadera, plomada |
| [`@ghegar/muestrario`](packages/muestrario) | Combobox: accent-insensitive filter, async loading, groups, multiple values with chips | lanzadera, plomada |

React 19 is a peer of every piece. almanaque, buzon, postigo, lanzadera and plomada export a
framework-free core from the package root and the hooks from `/react`; solapa, glosa, abanico and
muestrario are React only and export their hook from the root. Each package README has the full option
table.

## Quick start

```tsx
import { createPortal } from 'react-dom';
import { useTooltip } from '@ghegar/glosa';
import { useTabs } from '@ghegar/solapa';

const VIEWS = ['Map', 'Table'];

export function Views() {
    const tabs = useTabs({ values: VIEWS });
    const tooltip = useTooltip({ delay: 400 });
    return (
        <>
            <div {...tabs.getListProps()}>{VIEWS.map((v) => <button key={v} {...tabs.getTabProps(v)}>{v}</button>)}</div>
            {VIEWS.map((v) => <section key={v} {...tabs.getPanelProps(v)}>{v} view</section>)}
            <button {...tooltip.getTriggerProps()}>Export</button>
            {tooltip.open && createPortal(<div {...tooltip.getTooltipProps()}>PNG or PDF</div>, document.body)}
        </>
    );
}
```

## How the pieces work

| Concept | What it means |
|---|---|
| Prop getters | `getRootProps()`, `getTriggerProps()`, `getItemProps(i)`…: spread them on your elements; they carry ids, ARIA, handlers and `ref` |
| Controlled or not | Pass the value (`value`, `open`, `files`, `activeIndex`) with its callback to control it; leave it out and the piece keeps its own |
| Styling | Only through attributes: `[data-selected]`, `[data-active]`, `[data-disabled]`, `[data-state]`, `[data-side]`… |
| Portals | Yours: render floating content with `createPortal` where you want it |
| Layers | Escape goes to the topmost layer: a glosa tooltip inside a postigo dialog closes first, and any component that calls `preventDefault()` on Escape keeps it |
| Without React | The pieces with a core expose the same store (`subscribe`, `getSnapshot`) and their pure helpers |

## @ghegar/almanaque

Every date is a plain `YYYY-MM-DD` string: no `Date` objects, no time zones. Single dates or ranges
(`mode: 'range'`, `minDays`, `maxDays`, hover preview), several months side by side and the APG date
picker keyboard.

```tsx
import { useCalendar } from '@ghegar/almanaque/react';

export function DatePicker({ value, onChange }: { value: string | null; onChange: (iso: string | null) => void }) {
    const calendar = useCalendar({ value, onSelect: onChange, min: '2026-01-01' });
    return (
        <div {...calendar.getRootProps()}>
            <button {...calendar.getPreviousProps()}>‹</button>
            <button {...calendar.getViewProps('months')}>{calendar.title}</button>
            <button {...calendar.getNextProps()}>›</button>
            {calendar.grids.map((grid) => (
                <div key={grid.title} {...calendar.getGridProps(grid)}>
                    {grid.weeks.map((week) => (
                        <div role="row" key={week[0]?.iso}>
                            {week.map((cell) => <span key={cell.iso} {...calendar.getDayProps(cell)}>{cell.day}</span>)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
```

## @ghegar/buzon

Validates what is dropped, not only what the file dialog lets through, and reports rejections with codes
(`type`, `size`, `duplicate`, `custom`, `count`). Uploading is up to you.

```tsx
import { useDropzone } from '@ghegar/buzon/react';

export function Uploader({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
    const zone = useDropzone({ files, onChange, accept: 'image/*,.pdf', multiple: true, maxFiles: 5 });
    return (
        <div {...zone.getRootProps()}>
            <input {...zone.getInputProps()} />
            Drop files or click
            {zone.rejections.map((r) => <p key={r.file.name}>{r.file.name}: {r.codes.join(', ')}</p>)}
            {zone.files.map((file) => <button key={file.name} {...zone.getRemoveProps(file)}>{file.name} ×</button>)}
        </div>
    );
}
```

## @ghegar/postigo

Dialogs stack: Escape and outside clicks reach only the top one, Tab stays inside, focus goes back where
it came from and the scroll lock is counted. Outside the dialog it only touches `overflow` and
`padding-right` on `body` and `inert` on the rest of the page.

```tsx
import { createPortal } from 'react-dom';
import { useDialog } from '@ghegar/postigo/react';

export function EditDialog() {
    const dialog = useDialog();
    return (
        <>
            <button {...dialog.getTriggerProps()}>Edit</button>
            {dialog.open && createPortal(
                <div {...dialog.getDialogProps()}>
                    <h2 {...dialog.getTitleProps()}>Edit</h2>
                    <input />
                    <button {...dialog.getCloseProps()}>Done</button>
                </div>,
                document.body,
            )}
        </>
    );
}
```

## @ghegar/lanzadera

One tab stop per group and arrows that follow its orientation. It is the keyboard layer under solapa,
abanico and muestrario, and it also covers radio groups and segmented controls.

```tsx
import { useRovingFocus } from '@ghegar/lanzadera/react';

export function Toolbar({ items }: { items: string[] }) {
    const roving = useRovingFocus({ count: items.length, orientation: 'horizontal', getLabel: (i) => items[i] ?? '' });
    return (
        <div role="toolbar">
            {items.map((item, i) => <button key={item} {...roving.getItemProps(i)}>{item}</button>)}
        </div>
    );
}
```

## @ghegar/solapa

Tabs and panels linked with ids and ARIA. Inactive panels get `hidden`; `activation: 'manual'` waits for
Enter or Space.

```tsx
import { useTabs } from '@ghegar/solapa';

const SECTIONS = ['summary', 'map', 'history'];

export function Sections() {
    const tabs = useTabs({ values: SECTIONS, activation: 'manual' });
    return (
        <>
            <div {...tabs.getListProps()}>
                {SECTIONS.map((value) => <button key={value} {...tabs.getTabProps(value)}>{value}</button>)}
            </div>
            {SECTIONS.map((value) => <div key={value} {...tabs.getPanelProps(value)}>{value}</div>)}
        </>
    );
}
```

## @ghegar/plomada

Flips when there is no room, shifts back into the viewport, reports the available height and the arrow
offset, and follows the reference on scroll and resize.

```tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePosition } from '@ghegar/plomada/react';

export function Popover() {
    const [open, setOpen] = useState(false);
    const position = usePosition({ open, placement: 'bottom-start', offset: 6 });
    return (
        <>
            <button {...position.getReferenceProps()} onClick={() => setOpen(!open)}>Options</button>
            {open && createPortal(<div {...position.getFloatingProps()}>Popover</div>, document.body)}
        </>
    );
}
```

## @ghegar/glosa

Opens on hover after `delay` (600 ms by default) and at once on keyboard focus, stays open while the
pointer is on it, and the next tooltip opens without delay right after one closes.

```tsx
import { createPortal } from 'react-dom';
import { useTooltip } from '@ghegar/glosa';

export function SaveButton() {
    const tooltip = useTooltip({ placement: 'bottom' });
    return (
        <>
            <button {...tooltip.getTriggerProps()}>Save</button>
            {tooltip.open && createPortal(<div {...tooltip.getTooltipProps()}>Save changes<span style={tooltip.arrowStyles} /></div>, document.body)}
        </>
    );
}
```

## @ghegar/abanico

The WAI-ARIA menu button: arrows open on the first or last item, typeahead, disabled items, and
selection returns focus to the button.

```tsx
import { createPortal } from 'react-dom';
import { useMenu } from '@ghegar/abanico';

const ACTIONS = ['Edit', 'Duplicate', 'Delete'];

export function Actions({ onAction }: { onAction: (action: string) => void }) {
    const menu = useMenu({ count: ACTIONS.length, getLabel: (i) => ACTIONS[i] ?? '', onSelect: (i) => onAction(ACTIONS[i] ?? '') });
    return (
        <>
            <button {...menu.getButtonProps()}>Actions</button>
            {menu.open && createPortal(
                <div {...menu.getMenuProps()}>
                    {ACTIONS.map((action, i) => <div key={action} {...menu.getItemProps(i)}>{action}</div>)}
                </div>,
                document.body,
            )}
        </>
    );
}
```

## @ghegar/muestrario

An editable combobox with list autocomplete: focus stays in the input (`aria-activedescendant`), the
filter ignores accents and case, and `load(query, signal)` fetches remote options with debounce and abort.

```tsx
import { createPortal } from 'react-dom';
import { useCombobox } from '@ghegar/muestrario';

export function StatePicker({ states }: { states: string[] }) {
    const combo = useCombobox({ items: states, getLabel: (state) => state });
    return (
        <>
            <div {...combo.getAnchorProps()}>
                <input aria-label="State" {...combo.getInputProps()} />
            </div>
            {combo.open && createPortal(
                <ul {...combo.getListboxProps()}>
                    {combo.items.map((state, i) => <li key={state} {...combo.getOptionProps(state, i)}>{state}</li>)}
                </ul>,
                document.body,
            )}
            <span {...combo.getStatusProps()}>{combo.statusText}</span>
        </>
    );
}
```

## Known limitations

- Labels and messages default to Spanish (es-MX); almanaque, buzon and muestrario take `labels` to
  replace them. almanaque weeks always start on Monday.
- buzon only guesses `[data-drag]` while dragging from the MIME types the browser exposes; extension
  rules can only be checked on drop.
- glosa ignores touch pointers, and a `disabled` button never opens its tooltip: use `aria-disabled` or a
  focusable wrapper.

## Development

```bash
npm install
npm test
npm test -- --project almanaque
npm run lint
npm run typecheck
npm run build
npm run demo
npm run e2e
```

The demo is one Vite app with a page per piece (`#almanaque`, `#buzon`, `#postigo`, `#solapa`,
`#plomada`, `#abanico`, `#muestrario`); lanzadera shows up under solapa and glosa under abanico. The e2e
suite runs Playwright against it on port 5181 and connects over CDP to a Chrome on `127.0.0.1:9222` when
one is listening.

## Contributing

Issues are welcome. Open one before sending a pull request.

## License

AGPL-3.0-only © GHEgar
