import { useState } from 'react';
import { createPortal } from 'react-dom';
import { filterItems, highlight, useCombobox, type UseCombobox } from '@npmegar/muestrario';
import { Close } from 'tesela/react';

interface Place {
    name: string;
    region: string;
}

const STATES: Place[] = [
    { name: 'Aguascalientes', region: 'Center' }, { name: 'Guanajuato', region: 'Center' }, { name: 'Querétaro', region: 'Center' },
    { name: 'Colima', region: 'West' }, { name: 'Jalisco', region: 'West' }, { name: 'Michoacán', region: 'West' },
    { name: 'Nayarit', region: 'West' }, { name: 'Chihuahua', region: 'North' }, { name: 'Sonora', region: 'North' },
];
const TOWNS = ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco', 'El Salto', 'Puerto Vallarta', 'Lagos de Moreno', 'Tepatitlán', 'Ocotlán', 'Ameca', 'Autlán'];

const searchTowns = (query: string, signal: AbortSignal): Promise<string[]> => new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(filterItems(TOWNS, query, (town) => town)), 400);
    signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('aborted', 'AbortError'));
    });
});

const Marked = ({ label, query }: { label: string; query: string }) => (
    <>{highlight(label, query).map((segment, index) => (segment.match ? <mark key={index}>{segment.text}</mark> : <span key={index}>{segment.text}</span>))}</>
);

const List = <T,>({ combo, label }: { combo: UseCombobox<T>; label: (item: T) => string }) => (combo.open
    ? createPortal(
        <ul className="listbox" {...combo.getListboxProps()} style={{ ...combo.getListboxProps().style, maxHeight: Math.min(260, combo.position?.availableHeight ?? 260) }}>
            {combo.groups
                ? combo.groups.map((group) => (
                    <li key={group.label} {...combo.getGroupProps(group)}>
                        <span className="group-label" {...combo.getGroupLabelProps(group)}>{group.label}</span>
                        <ul>{group.options.map(({ item, index }) => <li key={label(item)} className="option" {...combo.getOptionProps(item, index)}><Marked label={label(item)} query={combo.inputValue} /></li>)}</ul>
                    </li>
                ))
                : combo.items.map((item, index) => <li key={label(item)} className="option" {...combo.getOptionProps(item, index)}><Marked label={label(item)} query={combo.inputValue} /></li>)}
            {combo.items.length === 0 && <li className="empty">{combo.statusText}</li>}
        </ul>,
        document.body,
    )
    : null);

const StatePicker = () => {
    const combo = useCombobox<Place>({ items: STATES, getLabel: (place) => place.name, groupBy: (place) => place.region, isDisabled: (place) => place.name === 'Sonora' });
    return (
        <label className="field">State
            <span className="combo" data-testid="state" {...combo.getAnchorProps()}>
                <input {...combo.getInputProps()} />
                {combo.value && <button className="clear" {...combo.getClearProps()}><Close size={14} /></button>}
            </span>
            <List combo={combo} label={(place) => place.name} />
            <span className="sr-only" {...combo.getStatusProps()}>{combo.statusText}</span>
        </label>
    );
};

const TownsPicker = () => {
    const combo = useCombobox<string>({ items: TOWNS, getLabel: (town) => town, multiple: true });
    return (
        <div className="field">
            <span aria-hidden="true">Municipalities</span>
            <span className="combo chips-field" data-testid="towns" {...combo.getAnchorProps()}>
                {combo.values.map((town) => <span key={town} className="tag">{town}<button {...combo.getRemoveProps(town)}><Close size={14} /></button></span>)}
                <input aria-label="Municipalities" {...combo.getInputProps()} />
            </span>
            <List combo={combo} label={(town) => town} />
        </div>
    );
};

const AsyncPicker = () => {
    const combo = useCombobox<string>({ load: searchTowns, getLabel: (town) => town, minChars: 2 });
    return (
        <label className="field">Remote search
            <span className="combo" {...combo.getAnchorProps()}><input {...combo.getInputProps()} /></span>
            <List combo={combo} label={(town) => town} />
            <span className="status" data-testid="async-status" {...combo.getStatusProps()}>{combo.statusText}</span>
        </label>
    );
};

const TagsPicker = () => {
    const combo = useCombobox<string>({ items: ['water', 'forest', 'climate'], getLabel: (tag) => tag, multiple: true, onCreate: (text) => text.toLowerCase() });
    return (
        <div className="field">
            <span aria-hidden="true">Tags</span>
            <span className="combo chips-field" data-testid="tags" {...combo.getAnchorProps()}>
                {combo.values.map((tag) => <span key={tag} className="tag">{tag}<button {...combo.getRemoveProps(tag)}><Close size={14} /></button></span>)}
                <input aria-label="Tags" {...combo.getInputProps()} />
            </span>
            {combo.open && createPortal(
                <ul className="listbox" {...combo.getListboxProps()}>
                    {combo.items.map((tag, index) => <li key={tag} className="option" {...combo.getOptionProps(tag, index)}>{tag}</li>)}
                    {combo.createText && <li className="option create" {...combo.getCreateProps()}>{combo.createText}</li>}
                </ul>,
                document.body,
            )}
        </div>
    );
};

const MANY = Array.from({ length: 2000 }, (_, index) => `Block ${String(index + 1).padStart(4, '0')}`);

const VirtualPicker = () => {
    const combo = useCombobox<string>({ items: MANY, getLabel: (item) => item, virtual: { itemHeight: 32, height: 240 } });
    return (
        <label className="field">Long list (2000)
            <span className="combo" {...combo.getAnchorProps()}><input {...combo.getInputProps()} /></span>
            {combo.open && createPortal(
                <ul className="listbox virtual" data-testid="virtual" {...combo.getListboxProps()}>
                    <li {...combo.getSizerProps()} />
                    {combo.virtualItems?.map(({ item, index, style }) => <li key={item} className="option" style={style} {...combo.getOptionProps(item, index)}>{item}</li>)}
                </ul>,
                document.body,
            )}
        </label>
    );
};

const COMMANDS = ['Measure distance', 'Export map', 'Open table', 'Share link'];

const CommandPicker = () => {
    const [ran, setRan] = useState('nothing');
    const combo = useCombobox<string>({
        items: COMMANDS,
        getLabel: (item) => item,
        selectBehavior: 'command',
        position: false,
        onSelect: (item) => {
            setRan(item);
            combo.setInputValue('');
        },
    });
    return (
        <label className="field">Command
            <span className="combo" {...combo.getAnchorProps()}><input {...combo.getInputProps()} /></span>
            {combo.open && (
                <ul className="listbox inline" data-testid="commands" {...combo.getListboxProps()}>
                    {combo.items.map((item, index) => <li key={item} className="option" {...combo.getOptionProps(item, index)}>{item}</li>)}
                </ul>
            )}
            <output data-testid="command-ran">{ran}</output>
        </label>
    );
};

export const ComboboxDemo = () => (
    <section className="card combobox-card">
        <h2>Combobox</h2>
        <p className="hint">Ignores accents and case, with groups, several values as chips, and a debounced, cancellable search.</p>
        <StatePicker />
        <TownsPicker />
        <AsyncPicker />
        <TagsPicker />
        <VirtualPicker />
        <CommandPicker />
    </section>
);
