# @ghegar/solapa

Headless tabs for React, built on `@ghegar/lanzadera`. Tabs and panels are linked with ids and ARIA,
the tab list has a single tab stop, arrows follow the orientation, disabled tabs are skipped and
activation is automatic (select on focus) or manual (Enter or Space). Inactive panels get `hidden`; it
ships no styles.

```bash
npm install @ghegar/solapa
```

```tsx
import { useTabs } from '@ghegar/solapa';

const SECTIONS = ['summary', 'map', 'history'];

function Sections() {
    const tabs = useTabs({ values: SECTIONS });
    return (
        <>
            <div {...tabs.getListProps()}>
                {SECTIONS.map((value) => <button key={value} {...tabs.getTabProps(value)}>{value}</button>)}
            </div>
            {SECTIONS.map((value) => <div key={value} {...tabs.getPanelProps(value)}>…</div>)}
        </>
    );
}
```

Style the active tab with `[data-state="active"]` or `[aria-selected="true"]`.

## Options

| Option | Default | |
|---|---|---|
| `values` | | One string per tab, in order |
| `value`, `defaultValue`, `onValueChange` | first enabled | Controlled when `value` is passed |
| `orientation` | `'horizontal'` | `'vertical'` uses up and down |
| `activation` | `'automatic'` | `'manual'` waits for Enter or Space |
| `loop` | `true` | |
| `isDisabled(value)` | | |

## License

AGPL-3.0-only
