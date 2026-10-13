import { useState } from 'react';
import { addDays, todayIso, weekdayOf, type DateRange, type IsoDate } from '@ghegar/almanaque';
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
                <h2>Una fecha</h2>
                <p className="hint">Entre hoy menos un año y hoy más 90 días. Flechas, Inicio, Fin, RePág y AvPág (con Shift, por año); en meses y años también, y Esc regresa.</p>
                <Calendar value={value} onSelect={setValue} min={addDays(today, -365)} max={addDays(today, 90)} />
                <output data-testid="single-value">{value ?? 'sin fecha'}</output>
            </section>
            <section className="card">
                <h2>Rango de 2 a 14 días</h2>
                <p className="hint">Dos meses, fines de semana deshabilitados.</p>
                <label className="toggle">
                    <input type="checkbox" checked={contiguous} onChange={(event) => setContiguous(event.target.checked)} />
                    Sin cruzar días deshabilitados
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
