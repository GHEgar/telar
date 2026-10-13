import { useEffect, useRef, useState } from 'react';

export type Loader<T> = (query: string, signal: AbortSignal) => Promise<readonly T[]>;

export type AsyncStatus = 'idle' | 'loading' | 'ready' | 'error';

interface Loaded<T> {
    query: string;
    items: readonly T[];
    failed: boolean;
}

export interface AsyncItems<T> {
    items: readonly T[];
    status: AsyncStatus;
}

const EMPTY: readonly never[] = [];

export const useAsyncItems = <T>(load: Loader<T> | undefined, query: string, enabled: boolean, minChars: number, debounce: number): AsyncItems<T> => {
    const [loaded, setLoaded] = useState<Loaded<T> | null>(null);
    const loader = useRef(load);
    const trimmed = query.trim();
    const active = !!load && enabled && trimmed.length >= minChars;

    useEffect(() => {
        loader.current = load;
    });

    useEffect(() => {
        if (!active) return undefined;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            loader.current?.(trimmed, controller.signal).then(
                (items) => {
                    if (!controller.signal.aborted) setLoaded({ query: trimmed, items, failed: false });
                },
                () => {
                    if (!controller.signal.aborted) setLoaded({ query: trimmed, items: EMPTY, failed: true });
                },
            );
        }, debounce);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [active, trimmed, debounce]);

    if (!load) return { items: EMPTY, status: 'idle' };
    if (!active) return { items: EMPTY, status: 'idle' };
    if (!loaded || loaded.query !== trimmed) return { items: loaded?.items ?? EMPTY, status: 'loading' };
    return { items: loaded.items, status: loaded.failed ? 'error' : 'ready' };
};
