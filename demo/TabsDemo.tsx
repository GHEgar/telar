import { useRovingFocus } from '@ghegar/lanzadera/react';
import { useTabs } from '@ghegar/solapa';

const SECTIONS = ['Resumen', 'Mapa', 'Datos abiertos', 'Historial'];
const STATES = ['Aguascalientes', 'Baja California', 'Campeche', 'Chiapas', 'Colima', 'Jalisco', 'Michoacán', 'Nayarit', 'Zacatecas'];

const Horizontal = () => {
    const tabs = useTabs({ values: SECTIONS, isDisabled: (value) => value === 'Historial' });
    return (
        <section className="card">
            <h2>Pestañas automáticas</h2>
            <p className="hint">Las flechas eligen al moverse; Historial está deshabilitada.</p>
            <div className="tabs" data-testid="tabs-auto" {...tabs.getListProps()}>
                {SECTIONS.map((value) => <button key={value} className="tab" {...tabs.getTabProps(value)}>{value}</button>)}
            </div>
            {SECTIONS.map((value) => <div key={value} className="panel" {...tabs.getPanelProps(value)}>Contenido de {value.toLowerCase()}.</div>)}
        </section>
    );
};

const Vertical = () => {
    const tabs = useTabs({ values: SECTIONS, orientation: 'vertical', activation: 'manual', defaultValue: 'Mapa' });
    return (
        <section className="card">
            <h2>Pestañas verticales manuales</h2>
            <p className="hint">Arriba y abajo mueven el foco; Enter o Espacio eligen.</p>
            <div className="vertical">
                <div className="tabs column" data-testid="tabs-manual" {...tabs.getListProps()}>
                    {SECTIONS.map((value) => <button key={value} className="tab" {...tabs.getTabProps(value)}>{value}</button>)}
                </div>
                {SECTIONS.map((value) => <div key={value} className="panel" {...tabs.getPanelProps(value)}>Contenido de {value.toLowerCase()}.</div>)}
            </div>
        </section>
    );
};

const Grid = () => {
    const roving = useRovingFocus({ count: STATES.length, columns: 3, getLabel: (index) => STATES[index] ?? '' });
    return (
        <section className="card">
            <h2>Cuadrícula con lanzadera</h2>
            <p className="hint">Flechas en dos ejes, Inicio y Fin, y búsqueda al teclear («ja», «m»).</p>
            <div className="grid" role="toolbar" aria-label="Estados" data-testid="grid">
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
