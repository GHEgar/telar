import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCalendar, type CalendarOptions, type IsoDate } from '@ghegar/almanaque/react';

const Picker = (options: CalendarOptions) => {
    const calendar = useCalendar(options);
    return (
        <div {...calendar.getRootProps()}>
            <button {...calendar.getPreviousProps()}>prev</button>
            <button {...calendar.getViewProps('months')}>{calendar.title}</button>
            <button {...calendar.getNextProps()}>next</button>
            {calendar.view === 'days' && calendar.grids.map((grid) => (
                <div key={grid.title} {...calendar.getGridProps(grid)}>
                    {grid.weeks.map((week) => (
                        <div role="row" key={week[0]?.iso}>
                            {week.map((cell) => <span key={cell.iso} {...calendar.getDayProps(cell)}>{cell.day}</span>)}
                        </div>
                    ))}
                </div>
            ))}
            {calendar.view === 'months' && calendar.monthCells.map((cell) => (
                <button key={cell.month} {...calendar.getMonthProps(cell)}>{cell.shortLabel}</button>
            ))}
            {calendar.view === 'years' && calendar.yearCells.map((cell) => (
                <button key={cell.year} {...calendar.getYearProps(cell)}>{cell.year}</button>
            ))}
        </div>
    );
};

const cell = (iso: string): HTMLElement => {
    const element = document.querySelector<HTMLElement>(`[data-iso="${iso}"]:not([data-outside])`);
    if (!element) throw new Error(`missing ${iso}`);
    return element;
};

afterEach(cleanup);

describe('useCalendar', () => {
    it('renders an accessible grid and selects', () => {
        const onSelect = vi.fn();
        render(<Picker today="2026-10-13" onSelect={onSelect} />);
        expect(screen.getByRole('grid', { name: 'Octubre 2026' })).toBeTruthy();
        expect(cell('2026-10-13').getAttribute('aria-current')).toBe('date');
        expect(cell('2026-10-13').tabIndex).toBe(0);
        fireEvent.click(cell('2026-10-20'));
        expect(onSelect).toHaveBeenCalledWith('2026-10-20');
        expect(cell('2026-10-20').getAttribute('aria-selected')).toBe('true');
    });

    it('moves DOM focus after a key', () => {
        render(<Picker today="2026-10-31" />);
        act(() => cell('2026-10-31').focus());
        fireEvent.keyDown(cell('2026-10-31'), { key: 'ArrowRight' });
        expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Noviembre 2026');
        expect(document.activeElement).toBe(cell('2026-11-01'));
    });

    it('follows a controlled value', () => {
        const Controlled = () => {
            const [value, setValue] = useState<IsoDate | null>('2026-01-15');
            return (
                <>
                    <button onClick={() => setValue('2027-05-02')}>jump</button>
                    <Picker today="2026-10-13" value={value} onSelect={setValue} />
                </>
            );
        };
        render(<Controlled />);
        expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Enero 2026');
        fireEvent.click(screen.getByText('jump'));
        expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Mayo 2027');
        expect(cell('2027-05-02').dataset.selected).toBe('true');
    });

    it('picks a month from the months view', () => {
        render(<Picker today="2026-10-13" max="2026-12-31" />);
        fireEvent.click(screen.getByRole('button', { name: 'Elegir mes' }));
        expect(screen.getByRole('button', { name: 'Año siguiente' })).toHaveProperty('disabled', true);
        fireEvent.click(screen.getByText('Mar'));
        expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Marzo 2026');
    });

    it('applies new limits from props', () => {
        const { rerender } = render(<Picker today="2026-10-13" />);
        expect(cell('2026-10-02').getAttribute('aria-disabled')).toBeNull();
        rerender(<Picker today="2026-10-13" min="2026-10-05" />);
        expect(cell('2026-10-02').getAttribute('aria-disabled')).toBe('true');
    });

    it('drives the months view from the keyboard', () => {
        render(<Picker today="2026-10-13" />);
        fireEvent.click(screen.getByRole('button', { name: 'Elegir mes' }));
        const october = screen.getByText('Oct');
        expect(document.activeElement).toBe(october);
        expect(october.tabIndex).toBe(0);
        expect(screen.getByText('Sep').tabIndex).toBe(-1);
        fireEvent.keyDown(october, { key: 'ArrowUp' });
        expect(document.activeElement).toBe(screen.getByText('Jul'));
        fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
        expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Julio 2026');
        expect(document.activeElement).toBe(cell('2026-07-13'));
    });
});
