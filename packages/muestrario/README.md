# @ghegar/muestrario

Headless combobox for React, following the WAI-ARIA editable combobox with list autocomplete. Type to
filter (accents and case ignored), move with the arrows while focus stays in the input
(`aria-activedescendant`), pick with Enter or a click. It also loads options remotely with debounce and
cancellation, groups them, takes several values as chips and announces counts in a live region. The list
is positioned by `@ghegar/plomada`, as wide as the field. No styles; Spanish (es-MX) messages by default.

```bash
npm install @ghegar/muestrario
```

```tsx
import { createPortal } from 'react-dom';
import { highlight, useCombobox } from '@ghegar/muestrario';

function StatePicker({ states }: { states: string[] }) {
    const combo = useCombobox({ items: states, getLabel: (state) => state });
    return (
        <>
            <div {...combo.getAnchorProps()}>
                <input aria-label="State" {...combo.getInputProps()} />
            </div>
            {combo.open && createPortal(
                <ul {...combo.getListboxProps()}>
                    {combo.items.map((state, i) => (
                        <li key={state} {...combo.getOptionProps(state, i)}>
                            {highlight(state, combo.inputValue).map((s, j) => (s.match ? <b key={j}>{s.text}</b> : s.text))}
                        </li>
                    ))}
                </ul>,
                document.body,
            )}
            <span className="sr-only" {...combo.getStatusProps()}>{combo.statusText}</span>
        </>
    );
}
```

Style options with `[data-active]`, `[data-selected]` and `[data-disabled]`. With chips, do not wrap the
field in a `<label>`: the first remove button would take the label. Use `aria-label` or
`aria-labelledby` on the input.

## Options

| Option | Default | |
|---|---|---|
| `getLabel(item)` | | Text shown, filtered and announced |
| `getKey(item)` | `getLabel` | Identity for selection |
| `items` | | Local options |
| `load(query, signal)` | | Remote options; the previous request is aborted |
| `filter` | accent-insensitive contains | Your own `(item, query) => boolean`, or `false` |
| `minChars`, `debounce` | `0`, `200` | For `load` |
| `groupBy(item)` | | Group label; options are reordered by group |
| `isDisabled(item)` | | |
| `value`, `defaultValue`, `onChange` | | Single value, controlled when `value` is passed |
| `multiple`, `values`, `defaultValues`, `onValuesChange` | | Several values |
| `openOnFocus` | `false` | |
| `placement`, `offset` | `'bottom-start'` | Passed to plomada |
| `labels` | es-MX | `noResults`, `loading`, `error`, `clear`, `remove`, `typeMore(n)`, `results(n)` |

Keys: ArrowDown/ArrowUp open and move, Alt+ArrowDown opens, Enter picks, Escape closes and then clears
the text, Backspace on an empty input removes the last chip, Tab closes. On blur a single combobox goes
back to the chosen label.

Helpers `normalize`, `matches`, `filterItems`, `highlight` and `groupItems` are exported too.

## License

AGPL-3.0-only
