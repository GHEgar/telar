import { useState } from 'react';
import { useToaster } from '@npmegar/pregon/react';
import { Close } from 'tesela/react';

export const ToastDemo = () => {
    const [log, setLog] = useState('nothing yet');
    const t = useToaster({ limit: 3, exit: 200, closeOnEscape: true });
    const note = (title: string) => (reason: string) => setLog(`${title}: ${reason}`);
    return (
        <section className="card piel" data-grana-tono="dia">
            <h2>Toasts</h2>
            <p className="hint">Hover or Tab into the stack to pause it; Escape closes the newest. Screen readers hear each one through the live regions.</p>
            <div className="toolbar">
                <button type="button" className="glass-button" onClick={() => t.show({ title: 'Layer uploaded', description: 'roads.geojson, 1 204 features', onDismiss: note('Layer uploaded') })}>Upload</button>
                <button type="button" className="glass-button" onClick={() => t.show({ title: 'Link copied', duration: 2500, onDismiss: note('Link copied') })}>Copy link</button>
                <button type="button" className="glass-button" onClick={() => t.show({ title: 'Network error', description: 'The tiles could not load', priority: 'assertive', onDismiss: note('Network error') })}>Fail</button>
                <button type="button" className="glass-button" onClick={() => t.show({ title: 'Layer removed', action: { label: 'Undo', onAction: () => setLog('Undo') }, onDismiss: note('Layer removed') })}>Remove</button>
            </div>
            <p className="log" data-testid="toast-log">{log}</p>
            <ol {...t.getViewportProps()} className="toasts">
                {t.toasts.map((toast) => (
                    <li key={toast.id} {...t.getToastProps(toast.id)} className="toast">
                        <div className="toast-text">
                            <strong {...t.getTitleProps(toast.id)}>{toast.title}</strong>
                            {toast.description && <span {...t.getDescriptionProps(toast.id)}>{toast.description}</span>}
                        </div>
                        {toast.action && <button {...t.getActionProps(toast.id)} className="toast-action">{toast.action.label}</button>}
                        <button {...t.getCloseProps(toast.id)} className="toast-close"><Close size={16} /></button>
                    </li>
                ))}
            </ol>
            {t.queued > 0 && <p className="hint" data-testid="toast-queued">{t.queued} waiting</p>}
            <div {...t.getAnnouncerProps('polite')} className="sr-only" />
            <div {...t.getAnnouncerProps('assertive')} className="sr-only" />
        </section>
    );
};
