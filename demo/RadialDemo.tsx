import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRadialMenu } from '@npmegar/abanico';

const TOOLS = ['Measure', 'Identify', 'Draw', 'Table', 'Hexbin', 'Share'];

export const RadialDemo = () => {
    const [tool, setTool] = useState('none');
    const menu = useRadialMenu({
        count: TOOLS.length,
        label: 'Tools',
        radius: 76,
        openOn: 'release',
        getLabel: (index) => TOOLS[index] ?? '',
        isDisabled: (index) => TOOLS[index] === 'Hexbin',
        onSelect: (index) => setTool(TOOLS[index] ?? ''),
    });
    return (
        <section className="card piel" data-grana-tono="dia">
            <h2>Radial menu</h2>
            <p className="hint">Right click the map (a right drag does not open it), hold a finger on it, or focus it and press the menu key (Shift+F10).</p>
            <div {...menu.getTargetProps()} className="map-area" role="application" aria-label="Map" tabIndex={0}>Map</div>
            <output data-testid="radial-value">{tool}</output>
            {menu.open && menu.center && createPortal(
                <div {...menu.getMenuProps()} className="radial" style={{ left: menu.center.x, top: menu.center.y }}>
                    {TOOLS.map((name, index) => {
                        const { x, y } = menu.getItemPosition(index);
                        return <div key={name} {...menu.getItemProps(index)} className="radial-item" style={{ transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))` }}>{name}</div>;
                    })}
                </div>,
                document.body,
            )}
        </section>
    );
};
