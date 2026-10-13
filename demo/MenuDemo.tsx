import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMenu } from '@ghegar/abanico';
import { useTooltip } from '@ghegar/glosa';

const ACTIONS = ['Editar', 'Duplicar', 'Compartir', 'Archivar', 'Eliminar'];

const Tool = ({ label, hint }: { label: string; hint: string }) => {
    const tooltip = useTooltip({ delay: 500 });
    return (
        <>
            <button className="button" {...tooltip.getTriggerProps()}>{label}</button>
            {tooltip.open && createPortal(
                <div className="tooltip" {...tooltip.getTooltipProps()}>
                    {hint}
                    <span className="tooltip-arrow" style={tooltip.arrowStyles} />
                </div>,
                document.body,
            )}
        </>
    );
};

const Actions = ({ onPick }: { onPick: (action: string) => void }) => {
    const menu = useMenu({
        count: ACTIONS.length,
        getLabel: (index) => ACTIONS[index] ?? '',
        isDisabled: (index) => ACTIONS[index] === 'Compartir',
        onSelect: (index) => onPick(ACTIONS[index] ?? ''),
    });
    return (
        <>
            <button className="button" {...menu.getButtonProps()}>Acciones ▾</button>
            {menu.open && createPortal(
                <div className="menu" {...menu.getMenuProps()}>
                    {ACTIONS.map((action, index) => (
                        <div key={action} className={action === 'Eliminar' ? 'menu-item danger' : 'menu-item'} {...menu.getItemProps(index)}>{action}</div>
                    ))}
                </div>,
                document.body,
            )}
        </>
    );
};

export const MenuDemo = () => {
    const [picked, setPicked] = useState('nada');
    return (
        <section className="card">
            <h2>Tooltip y menú</h2>
            <p className="hint">Pasa el puntero o llega con Tab a los botones; el menú abre con flechas y busca al teclear.</p>
            <div className="toolbar">
                <Tool label="Guardar" hint="Guarda los cambios (Ctrl+S)" />
                <Tool label="Deshacer" hint="Deshace el último cambio" />
                <Actions onPick={setPicked} />
            </div>
            <output data-testid="menu-value">{picked}</output>
        </section>
    );
};
