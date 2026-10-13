import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { usePosition, type Placement } from '@ghegar/plomada/react';

const PLACEMENTS: Placement[] = ['top', 'right', 'bottom-start', 'bottom', 'bottom-end', 'left'];

const Popover = ({ label, placement, testId, style }: { label: string; placement: Placement; testId: string; style?: CSSProperties }) => {
    const [open, setOpen] = useState(false);
    const position = usePosition({ open, placement, offset: 10 });
    return (
        <>
            <button className="button" style={style} data-testid={`${testId}-trigger`} onClick={() => setOpen(!open)} {...position.getReferenceProps()}>
                {label}
            </button>
            {open && createPortal(
                <div className="popover" data-testid={testId} {...position.getFloatingProps()}>
                    <span className="arrow-tip" style={position.arrowStyles} />
                    <strong>{position.position?.placement ?? '…'}</strong>
                    <span>Espacio: {position.position?.availableHeight ?? 0} px de alto</span>
                </div>,
                document.body,
            )}
        </>
    );
};

export const PositionDemo = () => {
    const [placement, setPlacement] = useState<Placement>('bottom');
    return (
        <section className="card tall position-card">
            <h2>Flotantes con plomada</h2>
            <p className="hint">Haz scroll con el panel abierto: se voltea y se recorre para no salir de la ventana.</p>
            <div className="chips placements">
                {PLACEMENTS.map((value) => (
                    <button key={value} className="chip" aria-pressed={value === placement} onClick={() => setPlacement(value)}>{value}</button>
                ))}
            </div>
            <div className="stage">
                <Popover label="Abrir" placement={placement} testId="main" />
            </div>
            <Popover label="Esquina" placement="bottom" testId="corner" style={{ position: 'fixed', right: 16, bottom: 16 }} />
        </section>
    );
};
