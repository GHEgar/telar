# @ghegar/glosa

Headless tooltip for React, positioned by `@ghegar/plomada`. It opens on hover after a delay and at
once on keyboard focus, stays open while the pointer moves onto it, closes on leave, blur, click and
Escape, and wires `role="tooltip"` and `aria-describedby`. Right after one tooltip closes, the next
opens without delay. Touch pointers are ignored. No styles.

```bash
npm install @ghegar/glosa
```

```tsx
import { createPortal } from 'react-dom';
import { useTooltip } from '@ghegar/glosa';

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

Escape is caught on `document` in the capture phase and prevented, so a tooltip inside a
`@ghegar/postigo` dialog closes first and the dialog stays open.

## License

AGPL-3.0-only
