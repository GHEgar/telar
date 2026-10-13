# @ghegar/abanico

Headless menu button for React, following the WAI-ARIA menu button pattern. Keyboard opening on the
first or last item, roving focus with typeahead (`@ghegar/lanzadera`), disabled items, selection that
returns focus to the button, Escape, Tab and outside click to close, and positioning by
`@ghegar/plomada`. No styles.

```bash
npm install @ghegar/abanico
```

```tsx
import { createPortal } from 'react-dom';
import { useMenu } from '@ghegar/abanico';

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

## License

AGPL-3.0-only
