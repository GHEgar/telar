import { useRovingFocus } from '@npmegar/lanzadera/react';
import { useTabs } from '@npmegar/solapa';

const SECTIONS = ['Summary', 'Map', 'Open data', 'History'];
const STATES = ['Aguascalientes', 'Baja California', 'Campeche', 'Chiapas', 'Colima', 'Jalisco', 'Michoacán', 'Nayarit', 'Zacatecas'];

const Horizontal = () => {
    const tabs = useTabs({ values: SECTIONS, isDisabled: (value) => value === 'History' });
    return (
        <section className="card">
            <h2>Automatic tabs</h2>
            <p className="hint">Arrows select as they move; History is disabled.</p>
            <div className="tabs" data-testid="tabs-auto" {...tabs.getListProps()}>
                {SECTIONS.map((value) => <button key={value} className="tab" {...tabs.getTabProps(value)}>{value}</button>)}
            </div>
            {SECTIONS.map((value) => <div key={value} className="panel" {...tabs.getPanelProps(value)}>{value} content.</div>)}
        </section>
    );
};

const Vertical = () => {
    const tabs = useTabs({ values: SECTIONS, orientation: 'vertical', activation: 'manual', defaultValue: 'Map' });
    return (
        <section className="card">
            <h2>Manual vertical tabs</h2>
            <p className="hint">Up and down move focus; Enter or Space selects.</p>
            <div className="vertical">
                <div className="tabs column" data-testid="tabs-manual" {...tabs.getListProps()}>
                    {SECTIONS.map((value) => <button key={value} className="tab" {...tabs.getTabProps(value)}>{value}</button>)}
                </div>
                {SECTIONS.map((value) => <div key={value} className="panel" {...tabs.getPanelProps(value)}>{value} content.</div>)}
            </div>
        </section>
    );
};

const Grid = () => {
    const roving = useRovingFocus({ count: STATES.length, columns: 3, getLabel: (index) => STATES[index] ?? '' });
    return (
        <section className="card">
            <h2>Grid with lanzadera</h2>
            <p className="hint">Arrows on two axes, Home and End, and typeahead (“ja”, “m”).</p>
            <div className="grid" role="toolbar" aria-label="States" data-testid="grid">
                {STATES.map((name, index) => <button key={name} className="chip" {...roving.getItemProps(index)}>{name}</button>)}
            </div>
        </section>
    );
};

export const TabsDemo = () => (
    <>
        <Horizontal />
        <Vertical />
        <Grid />
    </>
);
