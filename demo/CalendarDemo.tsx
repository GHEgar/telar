import { useState } from 'react';
import { addDays, todayIso, weekdayOf, type DateRange, type IsoDate } from '@npmegar/almanaque';
import { Calendar } from './Calendar.js';

const today = todayIso();
const weekend = (iso: IsoDate): boolean => weekdayOf(iso) >= 5;

export const CalendarDemo = () => {
    const [value, setValue] = useState<IsoDate | null>(null);
    const [range, setRange] = useState<DateRange>({ start: null, end: null });
    const [contiguous, setContiguous] = useState(false);
    return (
        <>
            <section className="card">
                <h2>A single date</h2>
                <p className="hint">From a year ago to 90 days ahead. Arrows, Home, End, Page Up and Page Down (with Shift, by year); also in months and years, and Esc goes back.</p>
                <Calendar value={value} onSelect={setValue} min={addDays(today, -365)} max={addDays(today, 90)} />
                <output data-testid="single-value">{value ?? 'no date'}</output>
            </section>
            <section className="card">
                <h2>Range of 2 to 14 days</h2>
                <p className="hint">Two months, weekends disabled.</p>
                <label className="toggle">
                    <input type="checkbox" checked={contiguous} onChange={(event) => setContiguous(event.target.checked)} />
                    Without crossing disabled days
                </label>
                <Calendar
                    mode="range" range={range} onRangeChange={setRange} months={2} minDays={2} maxDays={14}
                    isDisabled={weekend} contiguous={contiguous}
                />
                <output data-testid="range-value">{range.start ?? '—'} → {range.end ?? '—'}</output>
            </section>
        </>
    );
};
