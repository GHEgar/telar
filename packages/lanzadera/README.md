# @npmegar/lanzadera

Headless roving focus for React: one tab stop for a group, arrow keys that follow its orientation (or
both axes in a grid), Home/End, looping, right-to-left, disabled items and typeahead that ignores
accents. It is the keyboard layer under `@npmegar/solapa` and the other telar pieces.

```bash
npm install @npmegar/lanzadera
```

```tsx
import { useRovingFocus } from '@npmegar/lanzadera/react';

function Toolbar({ items }: { items: string[] }) {
    const roving = useRovingFocus({ count: items.length, orientation: 'horizontal', getLabel: (i) => items[i] ?? '' });
    return (
        <div role="toolbar">
            {items.map((item, i) => <button key={item} {...roving.getItemProps(i)}>{item}</button>)}
        </div>
    );
}
```

## Options

| Option | Default | |
|---|---|---|
| `count` | | Number of items |
| `orientation` | `'both'` | `'horizontal'`, `'vertical'` or `'both'` |
| `columns` | | Up and down move by this many items, without wrapping |
| `loop` | `true` | Left and right wrap around |
| `rtl` | `false` | Swap left and right |
| `isDisabled(index)` | | Skipped by every key |
| `activeIndex`, `defaultIndex`, `onActiveChange` | first enabled | Controlled when `activeIndex` is passed |
| `getLabel(index)` | | Enables typeahead |
| `typeaheadTimeout` | `500` | Milliseconds before the typed query resets |

`handleKey(event)` lets a wrapper run the same logic from its own `onKeyDown`.

## Radio groups and segmented controls

There is no separate piece for them: a radio group is roving focus where the checked item follows
focus. Control `activeIndex` with the checked value:

```tsx
function ViewSwitch({ value, onChange }: { value: number; onChange: (index: number) => void }) {
    const modes = ['Map', 'Table', 'Both'];
    const roving = useRovingFocus({ count: modes.length, orientation: 'horizontal', activeIndex: value, onActiveChange: onChange });
    return (
        <div role="radiogroup" aria-label="View">
            {modes.map((mode, i) => (
                <button key={mode} role="radio" aria-checked={i === value} onClick={() => onChange(i)} {...roving.getItemProps(i)}>
                    {mode}
                </button>
            ))}
        </div>
    );
}
```

## Without React

`moveIndex(current, key, options)` and `createTypeahead()` are exported from `@npmegar/lanzadera`.

## License

AGPL-3.0-only
