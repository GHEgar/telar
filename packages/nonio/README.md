# @npmegar/nonio

Headless slider for React, following the WAI-ARIA slider and multi-thumb slider patterns. One value or a
two-thumb range, steps without float noise, a larger page step, thumbs that never cross, pointer drag
on the track and the thumbs, a range you can drag as a whole, vertical orientation and value text.
nonio owns the value, the keyboard and the pointer; you own every pixel: it returns percentages and
`data-*` attributes, never styles.

```bash
npm install @npmegar/nonio
```

```tsx
import { useSlider } from '@npmegar/nonio/react';

function Opacity({ onChange }: { onChange: (value: number) => void }) {
    const slider = useSlider({ defaultValue: 80, onChange, getValueText: (value) => `${value} %` });
    return (
        <div {...slider.getRootProps()} className="slider">
            <span {...slider.getLabelProps()}>Opacity</span>
            <div {...slider.getTrackProps()} className="track">
                <div {...slider.getRangeProps()} className="fill" style={{ width: `${slider.rangeEnd}%` }} />
                <div {...slider.getThumbProps(0)} className="thumb" style={{ left: `${slider.percents[0]}%` }} />
            </div>
        </div>
    );
}
```

Style with `[data-orientation]`, `[data-dragging]` and `[data-disabled]`. The track needs
`position: relative` and the thumbs `position: absolute`; in a vertical slider use `bottom` instead of
`left`.

## A range you can slide

Pass a pair to get two thumbs. With `dragRange`, pressing the segment between them drags both and keeps
the width, which is how a time window slides along a timeline:

```tsx
const timeWindow = useSlider({
    defaultValue: [2010, 2015],
    min: 1990,
    max: 2025,
    minDistance: 1,
    dragRange: true,
    getAriaLabel: (index) => (index === 0 ? 'Start year' : 'End year'),
    onChangeEnd: (range) => loadLayer(range),
});
// left: `${timeWindow.rangeStart}%`, width: `${timeWindow.rangeEnd - timeWindow.rangeStart}%`
```

`moveRange(by)` slides the window from code, for example from your own keyboard shortcut.

## Options

| Option | Default | |
|---|---|---|
| `value`, `defaultValue` | `min` | A number or a `[start, end]` pair; controlled when `value` is passed |
| `onChange(value)` | | Every change |
| `onChangeEnd(value)` | | When the pointer is released and after each key: the place for expensive work |
| `min`, `max`, `step` | `0`, `100`, `1` | `max` is always reachable, even off the step grid |
| `pageStep` | `step × 10` | Page Up/Down and Shift + arrow |
| `minDistance` | `0` | Minimum gap between two thumbs |
| `dragRange` | `false` | Drag the segment between two thumbs |
| `orientation` | `'horizontal'` | `'vertical'` puts the minimum at the bottom |
| `disabled` | `false` | |
| `getValueText(value, index)` | | `aria-valuetext`, such as `14:00` |
| `getAriaLabel(index)` | | Thumb names; without it the thumbs point to `getLabelProps()` |

The hook also returns `value`, `values`, `percents`, `rangeStart`, `rangeEnd` and `dragging` (`null`, a
thumb index or `'range'`).

## Keyboard

| Key | Action |
|---|---|
| Right or Up arrow | Increase by `step` |
| Left or Down arrow | Decrease by `step` |
| Shift + arrow, Page Up/Down | Change by `pageStep` |
| Home, End | The thumb's own limit: `min`/`max`, or the other thumb |

## Without React

`createSlider(options)` from `@npmegar/nonio` is the same store (`subscribe`, `getSnapshot`,
`keyDown`, `startDrag`, `moveDrag`, `endDrag`, `moveRange`), fed with ratios along the track. `snap`,
`percentOf` and `valueAt` are the pure helpers.

## Known limitations

- No tick marks, hidden form inputs, right-to-left or more than two thumbs.

## License

AGPL-3.0-only
