# @ghegar/plomada

Headless positioning for floating elements in React: tooltips, menus, listboxes and popovers. Pick a
side and an alignment; plomada flips to the other side when there is not enough room, shifts the
element back into the viewport, reports the space left for a scrolling list and where the arrow goes,
and follows the reference on scroll and resize. The only styles it returns are functional:
`position: fixed`, `left`, `top` and, with `sameWidth`, `width`.

```bash
npm install @ghegar/plomada
```

```tsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePosition } from '@ghegar/plomada/react';

function Popover() {
    const [open, setOpen] = useState(false);
    const position = usePosition({ open, placement: 'bottom-start', offset: 6 });
    return (
        <>
            <button {...position.getReferenceProps()} onClick={() => setOpen(!open)}>Options</button>
            {open && createPortal(
                <div {...position.getFloatingProps()} className="popover">
                    <span className="arrow" style={position.arrowStyles} />
                    …
                </div>,
                document.body,
            )}
        </>
    );
}
```

Style by side with `[data-side="top|right|bottom|left"]`; cap a list with
`maxHeight: position.position?.availableHeight`.

## Options

| Option | Default | |
|---|---|---|
| `open` | `true` | Measure only while open |
| `placement` | `'bottom'` | `side` or `side-start` / `side-end` |
| `offset` | `8` | Gap between reference and floating element |
| `padding` | `8` | Minimum distance to the viewport edges |
| `flip` | `true` | Use the opposite side when it has more room |
| `shift` | `true` | Slide along the edge to stay inside the viewport |
| `arrowPadding` | `8` | Keep the arrow away from rounded corners |
| `sameWidth` | `false` | Match the reference width (listboxes) |

## Without React

`computePosition(reference, floating, viewport, options)` is pure; `autoUpdate`, `rectOf`, `sizeOf` and
`viewportRect` wire it to the DOM. All exported from `@ghegar/plomada`.

## License

AGPL-3.0-only
