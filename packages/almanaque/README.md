# @ghegar/almanaque

Headless calendar for React, Spanish (es-MX) by default. Weeks run Monday to Sunday and every date is a
plain `YYYY-MM-DD` string: no `Date` objects, no time zones, no off-by-one surprises. Day, month and
year views, `min`/`max`/`isDisabled` limits, single dates and ranges (with `minDays`/`maxDays` and hover
preview), several months side by side and full keyboard support. It ships no styles: only state, ARIA
and `data-*` attributes.

```bash
npm install @ghegar/almanaque
```

```tsx
import { useCalendar } from '@ghegar/almanaque/react';

function DatePicker({ value, onChange }: { value: string | null; onChange: (iso: string | null) => void }) {
    const calendar = useCalendar({ value, onSelect: onChange, min: '2026-01-01' });
    return (
        <div {...calendar.getRootProps()}>
            <button {...calendar.getPreviousProps()}>‹</button>
            <button {...calendar.getViewProps('months')}>{calendar.title}</button>
            <button {...calendar.getNextProps()}>›</button>
            {calendar.grids.map((grid) => (
                <div key={grid.title} {...calendar.getGridProps(grid)}>
                    {grid.weeks.map((week) => (
                        <div role="row" key={week[0]?.iso}>
                            {week.map((cell) => <span key={cell.iso} {...calendar.getDayProps(cell)}>{cell.day}</span>)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
```

Style it through the attributes: `[data-selected]`, `[data-today]`, `[data-disabled]`, `[data-outside]`,
`[data-in-range]`, `[data-range-start]`, `[data-range-end]`, `[data-preview]`.

## Options

| Option | Default | |
|---|---|---|
| `mode` | `'single'` | `'single'` or `'range'` |
| `value`, `onSelect` | | Single date, controlled when `value` is passed |
| `range`, `onRangeChange` | | `{ start, end }`, controlled when `range` is passed |
| `min`, `max`, `isDisabled` | | Limits; they also disable months, years and arrows |
| `minDays`, `maxDays` | | Range length in days, both ends included |
| `months` | `1` | Months shown side by side; arrows move one month |
| `fixedWeeks` | `false` | Always six weeks per month |
| `today` | local date | Injectable for tests |
| `yearsBack`, `yearsForward` | `100`, `10` | Year list when there are no limits |
| `locale`, `labels` | `'es-MX'` | Names come from `Intl`; any label can be replaced |

## Keyboard

Arrows move by day and week, Home/End go to the start and end of the week, PageUp/PageDown change the
month (with Shift, the year), Enter or Space selects. Focus is roving: only the focused day is tabbable.

## Without React

`createCalendar(options)` returns the same store (`subscribe`, `getSnapshot`, `select`, `keyDown`, …), and
the date helpers (`addDays`, `addMonths`, `diffDays`, `weekdayOf`, `buildMonthGrid`, …) are exported from
`@ghegar/almanaque`.

## License

AGPL-3.0-only
