import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTabbables, inertOthers, layerCount, lockScroll, pushLayer, scrollLocks, trapFocus } from '@npmegar/postigo';

afterEach(() => {
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
});

const mount = (html: string): HTMLElement => {
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    return container;
};

const tab = (shiftKey = false) => ({ key: 'Tab', shiftKey, preventDefault: vi.fn() });

describe('tabbables', () => {
    it('skips disabled, hidden, inert and negative tabindex', () => {
        const container = mount(`
            <button id="a">a</button>
            <button disabled>x</button>
            <input type="hidden">
            <input id="b">
            <div hidden><button>x</button></div>
            <div inert><a href="#">x</a></div>
            <fieldset disabled><input></fieldset>
            <span tabindex="-1">x</span>
            <span id="c" tabindex="0">c</span>
            <button style="display: none">x</button>
        `);
        expect(getTabbables(container).map((element) => element.id)).toEqual(['a', 'b', 'c']);
    });

    it('wraps Tab and Shift+Tab, recalculating each time', () => {
        const container = mount('<button id="a">a</button><button id="b">b</button>');
        const [first, last] = getTabbables(container);
        last?.focus();
        expect(trapFocus(container, tab())).toBe(true);
        expect(document.activeElement).toBe(first);
        expect(trapFocus(container, tab(true))).toBe(true);
        expect(document.activeElement).toBe(last);
        const extra = document.createElement('button');
        container.append(extra);
        last?.focus();
        expect(trapFocus(container, tab())).toBe(false);
        expect(trapFocus(container, { key: 'a', shiftKey: false, preventDefault: vi.fn() })).toBe(false);
    });

    it('keeps focus on an empty container', () => {
        const container = mount('<p>nada</p>');
        container.tabIndex = -1;
        const event = tab();
        trapFocus(container, event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(document.activeElement).toBe(container);
    });
});

describe('layers', () => {
    it('sends Escape and outside clicks only to the top layer', () => {
        const below = mount('<button>below</button>');
        const above = mount('<button>above</button>');
        const bottom = { element: () => below, onEscape: vi.fn(), onOutside: vi.fn() };
        const top = { element: () => above, onEscape: vi.fn(), onOutside: vi.fn() };
        const removeBottom = pushLayer(bottom);
        const removeTop = pushLayer(top);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(top.onEscape).toHaveBeenCalledTimes(1);
        expect(bottom.onEscape).not.toHaveBeenCalled();
        below.querySelector('button')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(top.onOutside).toHaveBeenCalledTimes(1);
        above.querySelector('button')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(top.onOutside).toHaveBeenCalledTimes(1);
        removeTop();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(bottom.onEscape).toHaveBeenCalledTimes(1);
        removeBottom();
        removeBottom();
        expect(layerCount()).toBe(0);
    });

    it('ignores prevented Escape and ignored elements', () => {
        const panel = mount('<p>panel</p>');
        const opener = mount('<button>open</button>');
        const layer = { element: () => panel, ignore: () => [opener], onEscape: vi.fn(), onOutside: vi.fn() };
        const remove = pushLayer(layer);
        const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
        escape.preventDefault();
        document.dispatchEvent(escape);
        opener.querySelector('button')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(layer.onEscape).not.toHaveBeenCalled();
        expect(layer.onOutside).not.toHaveBeenCalled();
        remove();
    });
});

describe('lockScroll', () => {
    it('counts nested locks and restores the previous style', () => {
        document.body.style.overflow = 'scroll';
        const first = lockScroll();
        const second = lockScroll();
        expect(document.body.style.overflow).toBe('hidden');
        first();
        first();
        expect(scrollLocks()).toBe(1);
        expect(document.body.style.overflow).toBe('hidden');
        second();
        expect(scrollLocks()).toBe(0);
        expect(document.body.style.overflow).toBe('scroll');
    });
});

describe('inertOthers', () => {
    it('marks the rest of the page and restores it, counting nested calls', () => {
        const app = mount('<main>app</main>');
        const kept = mount('<aside>ya inerte</aside>');
        kept.setAttribute('inert', '');
        const outer = mount('<div role="dialog">outer</div>');
        const inner = mount('<div role="dialog">inner</div>');
        const releaseOuter = inertOthers(outer);
        expect(app.hasAttribute('inert')).toBe(true);
        expect(inner.hasAttribute('inert')).toBe(true);
        expect(outer.hasAttribute('inert')).toBe(false);
        inner.removeAttribute('inert');
        const releaseInner = inertOthers(inner);
        expect(outer.hasAttribute('inert')).toBe(true);
        releaseInner();
        expect(outer.hasAttribute('inert')).toBe(false);
        expect(app.hasAttribute('inert')).toBe(true);
        releaseOuter();
        releaseOuter();
        expect(app.hasAttribute('inert')).toBe(false);
        expect(kept.hasAttribute('inert')).toBe(true);
    });
});
