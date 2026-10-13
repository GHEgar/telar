import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDialog, type UseDialog } from '@ghegar/postigo/react';
import { Calendar } from './Calendar.js';

const Layer = ({ dialog, children }: { dialog: UseDialog; children: ReactNode }) => (dialog.open
    ? createPortal(<div className="backdrop"><div className="dialog" {...dialog.getDialogProps()}>{children}</div></div>, document.body)
    : null);

const Confirm = ({ onConfirm }: { onConfirm: () => void }) => {
    const dialog = useDialog({ role: 'alertdialog', describedBy: true, closeOnOutsideClick: false });
    return (
        <>
            <button className="button danger" {...dialog.getTriggerProps()}>Descartar</button>
            <Layer dialog={dialog}>
                <h3 {...dialog.getTitleProps()}>¿Descartar la solicitud?</h3>
                <p {...dialog.getDescriptionProps()}>Se pierde lo capturado. Este diálogo no se cierra con un clic fuera.</p>
                <div className="actions">
                    <button className="button" {...dialog.getCloseProps()}>Volver</button>
                    <button className="button danger" onClick={() => { dialog.close(); onConfirm(); }}>Descartar</button>
                </div>
            </Layer>
        </>
    );
};

export const DialogDemo = () => {
    const [log, setLog] = useState<string[]>([]);
    const [date, setDate] = useState<string | null>(null);
    const dialog = useDialog({ onOpenChange: (open, reason) => setLog((lines) => [`${open ? 'abre' : 'cierra'}: ${reason}`, ...lines].slice(0, 6)) });
    return (
        <section className="card tall">
            <h2>Solicitud</h2>
            <p className="hint">Tab no sale del diálogo, Escape cierra solo la capa de encima, el scroll de la página queda bloqueado.</p>
            <button className="button" {...dialog.getTriggerProps()}>Nueva solicitud</button>
            <ol className="log" data-testid="dialog-log">{log.map((line, index) => <li key={index}>{line}</li>)}</ol>
            <Layer dialog={dialog}>
                <h3 {...dialog.getTitleProps()}>Nueva solicitud</h3>
                <label className="field">Motivo <input name="motivo" /></label>
                <Calendar value={date} onSelect={setDate} months={1} />
                <div className="actions">
                    <Confirm onConfirm={dialog.close} />
                    <button className="button" {...dialog.getCloseProps()}>Guardar</button>
                </div>
            </Layer>
        </section>
    );
};
