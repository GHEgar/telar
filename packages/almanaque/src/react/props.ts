import type { KeyboardEvent, RefCallback } from 'react';
import type { Calendar, CalendarSnapshot, DayCell, MonthCell, MonthGrid, YearCell } from '../core/index.js';

export interface RootProps {
    ref: RefCallback<HTMLElement>;
    'data-view': CalendarSnapshot['view'];
    'data-mode': CalendarSnapshot['mode'];
    onMouseLeave: () => void;
}

export interface GridProps {
    role: 'grid';
    'aria-label': string;
    'aria-multiselectable'?: true;
    'data-month': string;
}

export interface WeekdayProps {
    role: 'columnheader';
    'aria-label': string;
    title: string;
}

export interface DayProps {
    role: 'gridcell';
    tabIndex: number;
    'aria-label': string;
    'aria-selected': boolean;
    'aria-disabled'?: true;
    'aria-current'?: 'date';
    'data-iso': string;
    'data-outside'?: true;
    'data-today'?: true;
    'data-selected'?: true;
    'data-disabled'?: true;
    'data-focused'?: true;
    'data-range-start'?: true;
    'data-range-end'?: true;
    'data-in-range'?: true;
    'data-preview'?: true;
    onClick: () => void;
    onMouseEnter: () => void;
    onFocus: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
}

export interface ButtonProps {
    type: 'button';
    disabled?: boolean;
    tabIndex?: number;
    'aria-label'?: string;
    'aria-pressed'?: boolean;
    'data-current'?: true;
    'data-chip'?: true;
    'data-year'?: number;
    onClick: () => void;
    onKeyDown?: (event: KeyboardEvent) => void;
}

const flag = (value: boolean): true | undefined => (value ? true : undefined);

const keyHandler = (calendar: Calendar, onKey: () => void) => (event: KeyboardEvent): void => {
    if (!calendar.keyDown(event.key, { shiftKey: event.shiftKey })) return;
    event.preventDefault();
    onKey();
};

export const rootProps = (snapshot: CalendarSnapshot, calendar: Calendar, ref: RefCallback<HTMLElement>): RootProps => ({
    ref,
    'data-view': snapshot.view,
    'data-mode': snapshot.mode,
    onMouseLeave: () => calendar.hover(null),
});

export const gridProps = (snapshot: CalendarSnapshot, grid: MonthGrid): GridProps => ({
    role: 'grid',
    'aria-label': grid.title,
    ...(snapshot.mode === 'range' ? { 'aria-multiselectable': true as const } : {}),
    'data-month': `${grid.year}-${String(grid.month).padStart(2, '0')}`,
});

export const weekdayProps = (snapshot: CalendarSnapshot, index: number): WeekdayProps => ({
    role: 'columnheader',
    'aria-label': snapshot.weekdaysLong[index] ?? '',
    title: snapshot.weekdaysLong[index] ?? '',
});

export const dayProps = (calendar: Calendar, cell: DayCell, onKey: () => void): DayProps => ({
    role: 'gridcell',
    tabIndex: cell.focused && !cell.outside ? 0 : -1,
    'aria-label': cell.label,
    'aria-selected': cell.selected || cell.inRange,
    'aria-disabled': flag(cell.disabled),
    'aria-current': cell.today ? 'date' : undefined,
    'data-iso': cell.iso,
    'data-outside': flag(cell.outside),
    'data-today': flag(cell.today),
    'data-selected': flag(cell.selected),
    'data-disabled': flag(cell.disabled),
    'data-focused': flag(cell.focused),
    'data-range-start': flag(cell.rangeStart),
    'data-range-end': flag(cell.rangeEnd),
    'data-in-range': flag(cell.inRange),
    'data-preview': flag(cell.preview),
    onClick: () => calendar.select(cell.iso),
    onMouseEnter: () => calendar.hover(cell.iso),
    onFocus: () => calendar.focus(cell.iso),
    onKeyDown: keyHandler(calendar, onKey),
} as DayProps);

export const monthProps = (calendar: Calendar, cell: MonthCell, onKey: () => void): ButtonProps => ({
    type: 'button',
    disabled: cell.disabled,
    tabIndex: cell.current ? 0 : -1,
    'aria-pressed': cell.current,
    'data-current': flag(cell.current),
    'data-chip': true,
    onClick: () => {
        onKey();
        calendar.pickMonth(cell.month);
    },
    onKeyDown: keyHandler(calendar, onKey),
} as ButtonProps);

export const yearProps = (calendar: Calendar, cell: YearCell, onKey: () => void): ButtonProps => ({
    type: 'button',
    disabled: cell.disabled,
    tabIndex: cell.current ? 0 : -1,
    'aria-pressed': cell.current,
    'data-current': flag(cell.current),
    'data-chip': true,
    'data-year': cell.year,
    onClick: () => {
        onKey();
        calendar.pickYear(cell.year);
    },
    onKeyDown: keyHandler(calendar, onKey),
} as ButtonProps);
