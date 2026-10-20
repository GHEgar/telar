# @npmegar/abanico

Headless menu button and radial menu for React, following the WAI-ARIA menu button pattern. Keyboard opening on the
first or last item, roving focus with typeahead (`@npmegar/lanzadera`), disabled items, selection that
returns focus to the button, Escape, Tab and outside click to close, and positioning by
`@npmegar/plomada`. No styles.

```bash
npm install @npmegar/abanico
```

```tsx
import { createPortal } from 'react-dom';
import { useMenu } from '@npmegar/abanico';

const ACTIONS = ['Edit', 'Duplicate', 'Delete'];

function Actions({ onAction }: { onAction: (action: string) => void }) {
    const menu = useMenu({
        count: ACTIONS.length,
        getLabel: (i) => ACTIONS[i] ?? '',
        onSelect: (i) => onAction(ACTIONS[i] ?? ''),
    });
    return (
        <>
            <button {...menu.getButtonProps()}>Actions</button>
            {menu.open && createPortal(
                <div {...menu.getMenuProps()} className="menu">
                    {ACTIONS.map((action, i) => <div key={action} {...menu.getItemProps(i)}>{action}</div>)}
                </div>,
                document.body,
            )}
        </>
    );
}
```

Style the highlighted item with `[data-active]` and disabled ones with `[data-disabled]`.

## Options

| Option | Default | |
|---|---|---|
| `count` | | Number of items |
| `onSelect(index)` | | |
| `getLabel(index)` | | Enables typeahead |
| `isDisabled(index)` | | |
| `open`, `defaultOpen`, `onOpenChange` | `false` | Controlled when `open` is passed |
| `closeOnSelect` | `true` | |
| `loop` | `true` | |
| `placement`, `offset` | `'bottom-start'` | Passed to plomada |
| `floating` | `true` | `false` skips plomada: `getMenuProps()` carries no `style` or `data-side`, and you place the menu |
| `grid` | `false` | Two-axis arrows for items laid out in columns; see [Grid menus](#grid-menus) |

`getItemProps(index, item)` takes `{ type: 'checkbox' | 'radio', checked }` for checkable items and
`{ soon: true }` to mark an action that is not ready yet with `data-soon`; it stays focusable and
selectable, so `onSelect` can tell the user it is coming.

## Grid menus

A start menu often groups its actions under headings, each group a grid of tiles. With `grid: true`,
Left and Right walk the items in reading order and wrap around; Up and Down jump to the nearest item in
the row above or below, measured on screen, so they cross from one group to the next and follow
`grid-template-columns: repeat(auto-fill, …)` as it reflows. Home, End and typeahead work as usual.

```tsx
const menu = useMenu({ count: ITEMS.length, grid: true, floating: false, getLabel: (i) => ITEMS[i]?.label ?? '' });

<div {...menu.getMenuProps()} className="start-menu" style={{ bottom: 72 }}>
    {GROUPS.map((group) => (
        <div key={group} {...menu.getGroupProps(group)}>
            <span aria-hidden="true">{group}</span>
            <div className="tiles">
                {ITEMS.map((item, i) => item.group === group && <div key={item.id} {...menu.getItemProps(i)}>{item.label}</div>)}
            </div>
        </div>
    ))}
</div>
```

Up and Down need layout: without it (no rendered boxes) they do nothing. The geometry is exported as
`verticalNeighbor(boxes, from, direction, isDisabled)`.

## Radial menu

`useRadialMenu` opens the same kind of menu at a point instead of under a button: right click, the
context menu key (at the center of the area) or a long touch press on the area that gets
`getTargetProps()`. The items sit on a circle around that point; the keyboard is the menu's, with every
arrow walking the circle and wrapping around.

```tsx
import { createPortal } from 'react-dom';
import { useRadialMenu } from '@npmegar/abanico';

const TOOLS = ['Measure', 'Identify', 'Draw', 'Share'];

function MapArea({ onTool }: { onTool: (tool: string) => void }) {
    const menu = useRadialMenu({ count: TOOLS.length, label: 'Tools', getLabel: (i) => TOOLS[i] ?? '', onSelect: (i) => onTool(TOOLS[i] ?? '') });
    return (
        <>
            <div {...menu.getTargetProps()} tabIndex={0} className="map" />
            {menu.open && menu.center && createPortal(
                <div {...menu.getMenuProps()} className="radial" style={{ left: menu.center.x, top: menu.center.y }}>
                    {TOOLS.map((tool, i) => {
                        const { x, y } = menu.getItemPosition(i);
                        return <div key={tool} {...menu.getItemProps(i)} style={{ transform: `translate(${x}px, ${y}px)` }}>{tool}</div>;
                    })}
                </div>,
                document.body,
            )}
        </>
    );
}
```

Give `.radial` `position: fixed` and center each item on it. `getItemProps(i, { soon: true })` adds
`data-soon` here too. Selecting and Escape return focus to what
had it before opening; Tab and an outside press only close.

| Option | Default | |
|---|---|---|
| `count`, `label` | | Number of items and the menu's accessible name |
| `onSelect`, `getLabel`, `isDisabled`, `closeOnSelect` | | As in `useMenu` |
| `open`, `defaultOpen`, `onOpenChange` | `false` | Controlled when `open` is passed |
| `radius` | `80` | Pixels from the center to each item |
| `startAngle` | `-90` | Degrees; `-90` is the top, angles grow clockwise |
| `sweep` | `360` | Below 360 the items spread over an arc from end to end |
| `padding` | `40` | Room kept around the circle when the center is shifted into the viewport |
| `longPress` | `500` | Milliseconds a finger holds still before opening |
| `openOn` | `'contextmenu'` | `'release'` opens on the right button's release, and only if the mouse did not drag |
| `escapeStack` | | A shared Escape stack to register with while open |
| `escapePriority` | `200` | Priority of that layer (biombo's menu band) |

The hook returns `point` (where it was opened), `center` (shifted to fit) and `openAt({ x, y })`.
`radialLayout(count, options)` is the pure geometry, also exported. On iOS add
`-webkit-touch-callout: none` to the area so the long press does not open the system callout.

### Right drag on a map

Maps often rotate or tilt with a right drag. With `openOn: 'release'` a mouse right press does not open
the menu; releasing it does, at the press point, unless the pointer moved more than 6 px in between. It
works whether the browser sends `contextmenu` on press (Linux, macOS) or after release (Windows); the
context menu key, Shift+F10 and the long touch press open as before. The pure state machine is exported
as `rightPress`.

### Escape with another library

The menu closes on Escape from its own `keydown`. A library that listens for Escape on `window` in the
capture phase and stops it (a panel manager, a modal stack) gets there first. Pass that library's stack
as `escapeStack`: any object with `push({ id, priority, onEscape }) => remove` works. The menu pushes a
layer while it is open, and Escape closes it and returns focus. With biombo inside a `BiomboProvider`:

```tsx
import { useManager } from 'biombo/react';

const menu = useRadialMenu({ count, label: 'Tools', openOn: 'release', escapeStack: useManager().escape });
```

Outside a provider, register the close with that library's own hook instead, for example
`useEscape(() => menu.close(), { priority: ESCAPE_PRIORITY.menu, enabled: menu.open })`.

## License

AGPL-3.0-only
