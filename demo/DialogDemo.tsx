import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDialog, type UseDialog } from '@ghegar/postigo/react';
import { Calendar } from './Calendar.js';

const Layer = ({ dialog, children }: { dialog: UseDialog; children: ReactNode }) => (dialog.mounted
    ? createPortal(<div className="backdrop" data-state={dialog.open ? 'open' : 'closed'}><div className="dialog" {...dialog.getDialogProps()}>{children}</div></div>, document.body)
    : null);

const Confirm = ({ onConfirm }: { onConfirm: () => void }) => {
    const dialog = useDialog({ role: 'alertdialog', describedBy: true, closeOnOutsideClick: false });
    return (
        <>
            <button className="button danger" {...dialog.getTriggerProps()}>Discard</button>
            <Layer dialog={dialog}>
                <h3 {...dialog.getTitleProps()}>Discard the request?</h3>
                <p {...dialog.getDescriptionProps()}>What you entered will be lost. This dialog does not close on an outside click.</p>
                <div className="actions">
                    <button className="button" {...dialog.getCloseProps()}>Back</button>
                    <button className="button danger" onClick={() => { dialog.close(); onConfirm(); }}>Discard</button>
                </div>
            </Layer>
        </>
    );
};

export const DialogDemo = () => {
    const [log, setLog] = useState<string[]>([]);
    const [date, setDate] = useState<string | null>(null);
    const dialog = useDialog({ exit: 300, onOpenChange: (open, reason) => setLog((lines) => [`${open ? 'open' : 'close'}: ${reason}`, ...lines].slice(0, 6)) });
    return (
        <section className="card tall">
            <h2>Request</h2>
            <p className="hint">Tab stays inside the dialog, Escape closes only the top layer, and page scroll is locked.</p>
            <button className="button" {...dialog.getTriggerProps()}>New request</button>
            <ol className="log" data-testid="dialog-log">{log.map((line, index) => <li key={index}>{line}</li>)}</ol>
            <Layer dialog={dialog}>
                <h3 {...dialog.getTitleProps()}>New request</h3>
                <label className="field">Reason <input name="reason" /></label>
                <Calendar value={date} onSelect={setDate} months={1} />
                <div className="actions">
                    <Confirm onConfirm={dialog.close} />
                    <button className="button" {...dialog.getCloseProps()}>Save</button>
                </div>
            </Layer>
        </section>
    );
};
