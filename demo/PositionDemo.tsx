import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { usePosition, type Placement } from '@npmegar/plomada/react';

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
                    <span>Room: {position.position?.availableHeight ?? 0} px high</span>
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
            <h2>Floating with plomada</h2>
            <p className="hint">Scroll with the panel open: it flips and shifts to stay inside the window.</p>
            <div className="chips placements">
                {PLACEMENTS.map((value) => (
                    <button key={value} className="chip" aria-pressed={value === placement} onClick={() => setPlacement(value)}>{value}</button>
                ))}
            </div>
            <div className="stage">
                <Popover label="Open" placement={placement} testId="main" />
            </div>
            <Popover label="Corner" placement="bottom" testId="corner" style={{ position: 'fixed', right: 16, bottom: 16 }} />
        </section>
    );
};
