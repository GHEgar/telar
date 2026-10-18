# @npmegar/sarta

Headless sortable list for React. Drag by a handle with the mouse, or with a finger after a long press;
reorder from the keyboard with Space and the arrow keys; hear every step through a live region. The
list stays in your hands: sarta takes the item count and calls `onReorder(from, to)`. The DOM does not
move while dragging, so focus is never lost; sarta returns pixel offsets for each item and `data-*`
attributes, and you apply them with `transform`.

```bash
npm install @npmegar/sarta
```

```tsx
import { useState } from 'react';
import { reorder, useSortable } from '@npmegar/sarta/react';

function Layers({ initial }: { initial: string[] }) {
    const [layers, setLayers] = useState(initial);
    const sortable = useSortable({
        count: layers.length,
        getLabel: (i) => layers[i] ?? '',
        onReorder: (from, to) => setLayers((list) => reorder(list, from, to)),
    });
    return (
        <>
            <ul {...sortable.getListProps()}>
                {layers.map((layer, i) => (
                    <li key={layer} {...sortable.getItemProps(i)} style={{ transform: `translateY(${sortable.offsets[i]}px)` }}>
                        <button {...sortable.getHandleProps(i)}>⠿</button>
                        {layer}
                    </li>
                ))}
            </ul>
            <p {...sortable.getInstructionsProps()} />
            <div {...sortable.getAnnouncerProps()} className="sr-only" />
        </>
    );
}
```

Add a `transition` on `transform` for the items that make room, and drop it from `[data-dragging]` so the
dragged one follows the pointer. `[data-sorting]` on the list, `[data-over]` on the target and
`[data-grabbed]` on the handle are there to style against. Set `touch-action: none` on the handle if a
finger should drag at once instead of after the long press.

## Options

| Option | Default | |
|---|---|---|
| `count` | | Number of items |
| `onReorder(from, to)` | | Only when the item changed place |
| `getLabel(index)` | `Item N` | Name used in the handle label and the announcements |
| `orientation` | `'vertical'` | `'horizontal'` uses left and right |
| `isDisabled(index)` | | Cannot be picked up nor focused; others can pass over it |
| `roving` | `true` | The handles are one tab stop with arrow navigation (`@npmegar/lanzadera`); `false` makes each its own |
| `touchDelay` | `250` | Milliseconds to hold a finger before dragging; moving 8 px first cancels it |
| `dragThreshold` | `4` | Pixels the mouse moves before dragging, so a click stays a click |
| `labels` | English | `handle`, `instructions`, `grabbed`, `moved`, `dropped`, `cancelled` |

Measurements come from the elements that receive `getItemProps`, taken when an item is picked up.

## Keyboard

| Key | Not grabbed | Grabbed |
|---|---|---|
| Space, Enter | Pick up | Drop |
| Arrows along the axis | Move focus to the next handle | Move one place |
| Home, End | First or last handle | Move to the first or last place |
| Escape | | Cancel and return |

Leaving the handle while an item is grabbed cancels; Escape also cancels a pointer drag.

## Without React

`createSortable` from `@npmegar/sarta` is the store (`grab`, `move`, `drag`, `drop`, `cancel`) with the
announcements, and `reorder`, `targetIndex` and `offsetsFor` are pure.

## Known limitations

- No auto scroll of the container, dragging between lists, trees or grids.

## License

AGPL-3.0-only
