import type { RefCallback } from 'react';

type Handler = (...args: unknown[]) => unknown;

interface Cached {
    own: unknown;
    merged: RefCallback<Element>;
}

export type MergedRefCache = WeakMap<object, Cached>;

const assign = (ref: unknown, element: Element | null): void => {
    if (typeof ref === 'function') (ref as (element: Element | null) => void)(element);
    else if (ref && typeof ref === 'object') (ref as { current: unknown }).current = element;
};

const prevented = (value: unknown): boolean =>
    typeof value === 'object' && value !== null && (value as { defaultPrevented?: unknown }).defaultPrevented === true;

export const mergeRefs = (cache: MergedRefCache, user: object, own: unknown): RefCallback<Element> => {
    const last = cache.get(user);
    if (last && last.own === own) return last.merged;
    const merged: RefCallback<Element> = (element) => {
        assign(user, element);
        assign(own, element);
    };
    cache.set(user, { own, merged });
    return merged;
};

export const composeHandlers = (user: Handler, own: Handler): Handler => (...args) => {
    user(...args);
    if (!prevented(args[0])) own(...args);
};

export const mergeTriggerProps = (
    user: Record<string, unknown>,
    own: Record<string, unknown>,
    cache: MergedRefCache,
): Record<string, unknown> => {
    const result: Record<string, unknown> = { ...user, ...own };
    for (const [key, value] of Object.entries(own)) {
        const previous = user[key];
        if (previous === undefined || previous === null) continue;
        if (key === 'ref') result.ref = mergeRefs(cache, previous as object, value);
        else if (key === 'aria-describedby') result[key] = `${String(previous)} ${String(value)}`;
        else if (typeof previous === 'function' && typeof value === 'function') result[key] = composeHandlers(previous as Handler, value as Handler);
    }
    return result;
};

