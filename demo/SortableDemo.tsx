import { useState } from 'react';
import { reorder, useSortable } from '@npmegar/sarta/react';

const LAYERS = ['Roads', 'Rivers', 'Parks', 'Schools', 'Elevation'];

export const SortableDemo = () => {
    const [layers, setLayers] = useState(LAYERS);
    const sortable = useSortable({
        count: layers.length,
        getLabel: (index) => layers[index] ?? '',
        onReorder: (from, to) => setLayers((list) => reorder(list, from, to)),
    });
    return (
        <section className="card piel" data-grana-tono="dia">
            <h2>Sortable list</h2>
            <p className="hint">Drag a handle, hold it with a finger, or focus it and press Space, the arrows and Space again.</p>
            <ul {...sortable.getListProps()} className="stack">
                {layers.map((layer, index) => (
                    <li key={layer} {...sortable.getItemProps(index)} className="stack-row" style={{ transform: `translateY(${sortable.offsets[index] ?? 0}px)` }}>
                        <button {...sortable.getHandleProps(index)} className="stack-handle">⠿</button>
                        <span>{layer}</span>
                    </li>
                ))}
            </ul>
            <p {...sortable.getInstructionsProps()} />
            <div {...sortable.getAnnouncerProps()} className="sr-only" />
            <p className="log" data-testid="stack-order">{layers.join(', ')}</p>
        </section>
    );
};
