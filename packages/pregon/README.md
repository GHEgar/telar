# @npmegar/pregon

Headless toasts for React. A queue with a visible limit, a duration per toast, pause while the pointer
is over the stack or focus is inside it (and while the page is hidden), close and action buttons,
`polite` or `assertive` priority and announcements through live regions that are always mounted, so
screen readers hear every toast once. pregon never moves focus to a toast. It ships no styles: state,
prop getters and `data-*` attributes.

```bash
npm install @npmegar/pregon
```

```tsx
import { createToaster } from '@npmegar/pregon';
import { useToaster } from '@npmegar/pregon/react';

export const toaster = createToaster({ limit: 3 });

export function Toasts() {
    const t = useToaster({ toaster, closeOnEscape: true });
    return (
        <>
            <ol {...t.getViewportProps()} className="toasts">
                {t.toasts.map((toast) => (
                    <li key={toast.id} {...t.getToastProps(toast.id)} className="toast">
                        <strong {...t.getTitleProps(toast.id)}>{toast.title}</strong>
                        {toast.action && <button {...t.getActionProps(toast.id)}>{toast.action.label}</button>}
                        <button {...t.getCloseProps(toast.id)}>×</button>
                    </li>
                ))}
            </ol>
            <div {...t.getAnnouncerProps('polite')} className="sr-only" />
            <div {...t.getAnnouncerProps('assertive')} className="sr-only" />
        </>
    );
}

toaster.show({ title: 'Layer uploaded', description: 'roads.geojson' });
```

Animate with `[data-state="open"]` and `[data-state="closed"]` (set `exit` to keep a closed toast that
long), and style by `[data-priority]`, `[data-paused]` and `[data-index]`. `toasts` is in the order
they appeared; reverse it to stack the newest on top.

## Showing a toast

| Field | Default | |
|---|---|---|
| `title` | | Also the announced text |
| `description` | | Announced after the title |
| `priority` | `'polite'` | `'assertive'` goes to the `alert` region and jumps ahead of waiting polite toasts |
| `duration` | toaster's `duration` | `Infinity` keeps it; a toast with an `action` and no `duration` stays until dismissed |
| `action` | | `{ label, onAction }`: the action button runs it and dismisses the toast |
| `announce` | title and description | Replaces the announced text |
| `id` | generated | Showing an id again updates that toast and restarts its clock |
| `data` | | Anything you need to render it |
| `onDismiss(reason)` | | `timeout`, `close`, `action`, `escape` or `api` |

`show` returns the id; `dismiss(id?)` closes one or all of them.

## Options

| Option | Default | |
|---|---|---|
| `toaster` | its own | A store from `createToaster`, to show toasts from outside React |
| `limit` | `3` | Visible at once; the rest wait and their clock starts when shown |
| `duration` | `5000` | Milliseconds |
| `exit` | `0` | Milliseconds a closed toast stays rendered |
| `closeOnEscape` | `false` | Escape anywhere closes the newest, unless something else prevented it |
| `pauseOnHover`, `pauseOnFocus`, `pauseOnPageHidden` | `true` | |
| `labels` | English | `region` (`Notifications`) and `close` (`Dismiss`) |

## Focus

Showing or closing a toast never moves focus, with one exception: when the toast being closed holds the
focus (you pressed its close button), focus moves to the viewport so it is not lost to `body`. Toast
buttons are reached with Tab in DOM order, and the stack stays paused while focus is inside it.

## Without React

`createToaster` from `@npmegar/pregon` is the store: `show`, `dismiss`, `pause(reason)`,
`resume(reason)`, `subscribe` and `getSnapshot`, whose `announcements` hold the text for each region.

## Known limitations

- No promise helper, swipe to dismiss or hotkey to jump to the stack.

## License

AGPL-3.0-only
