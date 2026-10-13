import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDemo } from './CalendarDemo.js';
import { DropzoneDemo } from './DropzoneDemo.js';

const PAGES = {
    almanaque: CalendarDemo,
    buzon: DropzoneDemo,
};

type Page = keyof typeof PAGES;

const current = (): Page => (location.hash.slice(1) === 'buzon' ? 'buzon' : 'almanaque');

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
                    <a key={name} href={`#${name}`} aria-current={name === page ? 'page' : undefined}>@ghegar/{name}</a>
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
