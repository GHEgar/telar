import 'rotulo';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDemo } from './CalendarDemo.js';
import { ComboboxDemo } from './ComboboxDemo.js';
import { DialogDemo } from './DialogDemo.js';
import { DropzoneDemo } from './DropzoneDemo.js';
import { MenuDemo } from './MenuDemo.js';
import { PositionDemo } from './PositionDemo.js';
import { RadialDemo } from './RadialDemo.js';
import { SliderDemo } from './SliderDemo.js';
import { SortableDemo } from './SortableDemo.js';
import { TabsDemo } from './TabsDemo.js';
import { ToastDemo } from './ToastDemo.js';

const AbanicoDemo = () => (
    <>
        <MenuDemo />
        <RadialDemo />
    </>
);

const PAGES = {
    almanaque: CalendarDemo,
    buzon: DropzoneDemo,
    postigo: DialogDemo,
    solapa: TabsDemo,
    plomada: PositionDemo,
    abanico: AbanicoDemo,
    muestrario: ComboboxDemo,
    nonio: SliderDemo,
    pregon: ToastDemo,
    sarta: SortableDemo,
};

type Page = keyof typeof PAGES;

const current = (): Page => {
    const hash = location.hash.slice(1);
    return hash in PAGES ? hash as Page : 'almanaque';
};

const App = () => {
    const [page, setPage] = useState<Page>(current);
    useEffect(() => {
        const onHash = () => setPage(current());
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);
    const Demo = PAGES[page];
    return (
        <>
            <nav className="nav">
                <strong>telar</strong>
                {(Object.keys(PAGES) as Page[]).map((name) => (
                    <a key={name} href={`#${name}`} aria-current={name === page ? 'page' : undefined}>@npmegar/{name}</a>
                ))}
            </nav>
            <main className="main">
                <Demo />
            </main>
        </>
    );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<StrictMode><App /></StrictMode>);
