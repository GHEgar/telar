# @npmegar/muestrario

Headless combobox for React, following the WAI-ARIA editable combobox with list autocomplete. Type to
filter (accents and case ignored), move with the arrows while focus stays in the input
(`aria-activedescendant`), pick with Enter or a click. It also loads options remotely with debounce and
cancellation, groups them, takes several values as chips and announces counts in a live region. The list
is positioned by `@npmegar/plomada`, as wide as the field. No styles; English messages by default.

```bash
npm install @npmegar/muestrario
```

```tsx
import { createPortal } from 'react-dom';
import { highlight, useCombobox } from '@npmegar/muestrario';

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
| `onSelect(item)` | | Called whenever an option is picked, in both behaviors |
| `selectBehavior` | `'fill'` | `'command'` runs `onSelect` without filling the input or touching the value |
| `closeOnSelect` | `true`, `false` with `multiple` | Keep the list open after a pick |
| `multiple`, `values`, `defaultValues`, `onValuesChange` | | Several values |
| `openOnFocus` | `false` | |
| `position` | `true` | `false` skips plomada: the listbox gets no `style` and `position` stays `null` |
| `placement`, `offset` | `'bottom-start'` | Passed to plomada |
| `labels` | English: No results, Searching…, Type at least N characters, N results | `noResults`, `loading`, `error`, `clear`, `remove`, `typeMore(n)`, `results(n)` |

Keys: ArrowDown/ArrowUp open and move, Alt+ArrowDown opens, Enter picks, Escape closes and then clears
the text, Backspace on an empty input removes the last chip, Tab closes. On blur a single combobox goes
back to the chosen label.

## Command palette

With `selectBehavior: 'command'` the combobox is a launcher: picking an option calls `onSelect(item)`
and leaves the typed text alone, so the query survives the action. `setInputValue(text)` writes into the
input and filters as if it had been typed (it does not open a closed list); call it with `''` to clear
after running a command. With `position: false` the list is laid out by you, for example inside a card
above the field.

```tsx
const combo = useCombobox({
    items: commands,
    getLabel: (command) => command.title,
    selectBehavior: 'command',
    position: false,
    onSelect: (command) => {
        command.run();
        combo.setInputValue('');
    },
});
```

Helpers `normalize`, `matches`, `filterItems`, `highlight` and `groupItems` are exported too.

## License

AGPL-3.0-only
