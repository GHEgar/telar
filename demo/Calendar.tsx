import { useCalendar, type CalendarOptions } from '@ghegar/almanaque/react';

export const Calendar = (options: CalendarOptions) => {
    const calendar = useCalendar(options);
    return (
        <div className="calendar" {...calendar.getRootProps()}>
            <header className="calendar-header">
                <button className="arrow" {...calendar.getPreviousProps()}>‹</button>
                <div className="calendar-title">
                    <button className="title-button" {...calendar.getViewProps('months')}>
                        {calendar.labels.months[calendar.month - 1]}
                    </button>
                    <button className="title-button" {...calendar.getViewProps('years')}>{calendar.year}</button>
                </div>
                <button className="arrow" {...calendar.getNextProps()}>›</button>
            </header>
            {calendar.view === 'days' && (
                <div className="months">
                    {calendar.grids.map((grid) => (
                        <div key={grid.title} className="month" {...calendar.getGridProps(grid)}>
                            {calendar.grids.length > 1 && <div className="month-title">{grid.title}</div>}
                            <div role="row" className="week">
                                {calendar.weekdays.map((weekday, index) => (
                                    <span key={weekday} className="weekday" {...calendar.getWeekdayProps(index)}>{weekday}</span>
                                ))}
                            </div>
                            {grid.weeks.map((week) => (
                                <div role="row" key={week[0]?.iso} className="week">
                                    {week.map((cell) => (
                                        <span key={cell.iso} className="day" {...calendar.getDayProps(cell)}>
                                            {cell.outside && calendar.grids.length > 1 ? '' : cell.day}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            {calendar.view === 'months' && (
                <div className="chips">
                    {calendar.monthCells.map((cell) => (
                        <button key={cell.month} className="chip" {...calendar.getMonthProps(cell)}>{cell.shortLabel}</button>
                    ))}
                </div>
            )}
            {calendar.view === 'years' && (
                <div className="chips years">
                    {calendar.yearCells.map((cell) => (
                        <button key={cell.year} className="chip" {...calendar.getYearProps(cell)}>{cell.year}</button>
                    ))}
                </div>
            )}
        </div>
    );
};
