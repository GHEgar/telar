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

Give `.radial` `position: fixed` and center each item on it. Selecting and Escape return focus to what
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

The hook returns `point` (where it was opened), `center` (shifted to fit) and `openAt({ x, y })`.
`radialLayout(count, options)` is the pure geometry, also exported. On iOS add
`-webkit-touch-callout: none` to the area so the long press does not open the system callout.

## License

AGPL-3.0-only
