import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMenu } from '@npmegar/abanico';
import { useTooltip } from '@npmegar/glosa';
import { Check, ChevronDown, ChevronRight } from 'tesela/react';

const ACTIONS = ['Edit', 'Duplicate', 'Share', 'Export', 'Archive', 'Delete'];

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

const EXPORTS = ['PNG', 'PDF', 'CSV'];

const Actions = ({ onPick }: { onPick: (action: string) => void }) => {
    const [pinned, setPinned] = useState(false);
    const menu = useMenu({
        count: ACTIONS.length + 1,
        getLabel: (index) => (index === ACTIONS.length ? 'Pin' : ACTIONS[index] ?? ''),
        isDisabled: (index) => ACTIONS[index] === 'Share',
        onSelect: (index) => {
            if (index === ACTIONS.length) setPinned(!pinned);
            else onPick(ACTIONS[index] ?? '');
        },
    });
    const exportIndex = ACTIONS.indexOf('Share') + 1;
    const exports = useMenu({ count: EXPORTS.length, getLabel: (index) => EXPORTS[index] ?? '', parent: { link: menu.link, index: exportIndex }, onSelect: (index) => onPick(`Export ${EXPORTS[index]}`) });
    return (
        <>
            <button className="button" {...menu.getButtonProps()}>Actions <ChevronDown size={16} /></button>
            {menu.open && createPortal(
                <div className="menu" {...menu.getMenuProps()}>
                    {ACTIONS.map((action, index) => (index === exportIndex
                        ? <div key={action} className="menu-item submenu" {...exports.getTriggerProps()}>{action}<ChevronRight size={16} /></div>
                        : <div key={action} className={action === 'Delete' ? 'menu-item danger' : 'menu-item'} {...menu.getItemProps(index)}>{action}</div>))}
                    <div className="menu-separator" {...menu.getSeparatorProps()} />
                    <div className="menu-item" {...menu.getItemProps(ACTIONS.length, { type: 'checkbox', checked: pinned })}>{pinned && <Check size={16} />}Pin</div>
                </div>,
                document.body,
            )}
            {exports.open && createPortal(
                <div className="menu" {...exports.getMenuProps()}>
                    {EXPORTS.map((name, index) => <div key={name} className="menu-item" {...exports.getItemProps(index)}>{name}</div>)}
                </div>,
                document.body,
            )}
        </>
    );
};

export const MenuDemo = () => {
    const [picked, setPicked] = useState('nothing');
    return (
        <section className="card">
            <h2>Tooltip and menu</h2>
            <p className="hint">Hover or Tab to the buttons; the menu opens with the arrows and searches as you type.</p>
            <div className="toolbar">
                <Tool label="Save" hint="Saves your changes (Ctrl+S)" />
                <Tool label="Undo" hint="Undoes the last change" />
                <Actions onPick={setPicked} />
            </div>
            <output data-testid="menu-value">{picked}</output>
        </section>
    );
};
