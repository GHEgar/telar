# @npmegar/glosa

Headless tooltip for React, positioned by `@npmegar/plomada`. It opens on hover after a delay and at
once on keyboard focus, stays open while the pointer moves onto it, closes on leave, blur, click and
Escape, and wires `role="tooltip"` and `aria-describedby`. Right after one tooltip closes, the next
opens without delay. Touch pointers are ignored. No styles.

```bash
npm install @npmegar/glosa
```

```tsx
import { createPortal } from 'react-dom';
import { useTooltip } from '@npmegar/glosa';

function SaveButton() {
    const tooltip = useTooltip({ delay: 500 });
    return (
        <>
            <button {...tooltip.getTriggerProps()}>Save</button>
            {tooltip.open && createPortal(
                <div {...tooltip.getTooltipProps()} className="tooltip">
                    Save changes (Ctrl+S)
                    <span className="arrow" style={tooltip.arrowStyles} />
                </div>,
                document.body,
            )}
        </>
    );
}
```

## Options

| Option | Default | |
|---|---|---|
| `delay` | `600` | Milliseconds of hover before opening |
| `closeDelay` | `150` | Milliseconds after leaving before closing |
| `open`, `defaultOpen`, `onOpenChange` | `false` | Controlled when `open` is passed |
| `disabled` | `false` | |
| `placement`, `offset`, `padding`, `flip`, `shift` | `'top'` | Passed to plomada |

## Merging your props

The trigger often carries props of its own: a menu button's handlers, a ref, a description. Pass them
to `getTriggerProps` instead of spreading two objects that overwrite each other:

```tsx
const menu = useMenu({ count: 3 });
const tooltip = useTooltip();
const ref = useRef<HTMLButtonElement>(null);

<button {...tooltip.getTriggerProps({ ...menu.getButtonProps(), ref, 'aria-describedby': 'hint' })}>
    Options
</button>
```

| Prop | How it is merged |
|---|---|
| `on*` handlers | Yours run first; the tooltip's run after, unless yours call `event.preventDefault()` |
| `aria-describedby` | Your ids and the tooltip id, space-separated, while it is open |
| `ref` | Both your ref (object or callback) and the positioning ref receive the element |
| Anything else | Kept as you passed it |

The merged ref is cached per ref you pass, so it keeps its identity across renders and the trigger is
not detached and measured again. Keep your ref stable (`useRef`, or a callback from `useCallback`); an
inline callback is a new ref on every render.

Escape is caught on `document` in the capture phase and prevented, so a tooltip inside a
`@npmegar/postigo` dialog closes first and the dialog stays open.

## Disabled controls

A `disabled` button gets neither pointer events nor focus, so a tooltip on it never opens. Either keep
the control enabled and mark it `aria-disabled="true"` (it stays focusable and announced as disabled),
or put the trigger props on a wrapper:

```tsx
<span tabIndex={0} {...tooltip.getTriggerProps()}>
    <button disabled>Publish</button>
</span>
```

## License

AGPL-3.0-only
