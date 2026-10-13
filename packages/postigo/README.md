# @ghegar/postigo

Headless modal dialog for React. Dialogs stack: Escape and outside clicks reach only the top one, Tab
stays inside it, focus goes back where it came from, and the page scroll is locked with a counter so
closing a nested dialog does not unlock the one below. It ships no styles and no portal: only state,
ARIA and `data-*` attributes. The only things it touches outside the dialog are `overflow` and
`padding-right` on `body` and the `inert` attribute on the rest of the page while a modal is open.

```bash
npm install @ghegar/postigo
```

```tsx
import { createPortal } from 'react-dom';
import { useDialog } from '@ghegar/postigo/react';

function EditDialog() {
    const dialog = useDialog({ onOpenChange: (open, reason) => console.log(open, reason) });
    return (
        <>
            <button {...dialog.getTriggerProps()}>Edit</button>
            {dialog.open && createPortal(
                <div className="backdrop">
                    <div {...dialog.getDialogProps()} className="dialog">
                        <h2 {...dialog.getTitleProps()}>Edit</h2>
                        <input />
                        <button {...dialog.getCloseProps()}>Done</button>
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}
```

Render `getTitleProps()` on the title or pass `label`; pass `describedBy: true` when you render
`getDescriptionProps()`.

## Options

| Option | Default | |
|---|---|---|
| `open`, `defaultOpen` | `false` | Controlled when `open` is passed |
| `onOpenChange(open, reason)` | | `reason`: `trigger`, `escape`, `outside` or `close` |
| `role` | `'dialog'` | Or `'alertdialog'` |
| `modal` | `true` | `aria-modal`, focus trap and scroll lock; non-modal dialogs get none |
| `label` | | `aria-label` instead of `aria-labelledby` |
| `describedBy` | `false` | Adds `aria-describedby` |
| `initialFocus` | first tabbable | Ref to focus on open; falls back to the dialog itself |
| `returnFocus` | `true` | `false`, or a ref to focus on close instead of the previous element |
| `closeOnEscape`, `closeOnOutsideClick` | `true` | |
| `inert` | `true` | Modal only: the rest of the page gets `inert` while it is open |
| `exit` | `0` | Milliseconds to keep it mounted after closing; `animationend` or `transitionend` end it sooner |

Render with `dialog.mounted` instead of `dialog.open` when you animate the exit, and style
`[data-state="closed"]`.

An outside click is a `pointerdown` outside the dialog and its trigger, so a drag that starts inside
and ends outside does not close it. Components inside the dialog keep Escape for themselves by calling
`preventDefault()` on it.

## Without React

`pushLayer`, `trapFocus`, `getTabbables`, `focusFirst`, `lockScroll` and `inertOthers` are exported from
`@ghegar/postigo`.

## License

AGPL-3.0-only
