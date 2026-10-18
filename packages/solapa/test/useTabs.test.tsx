import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTabs, type UseTabsOptions } from '@npmegar/solapa';

const VALUES = ['general', 'mapa', 'datos abiertos', 'historial'];

const Tabs = (options: Partial<UseTabsOptions>) => {
    const tabs = useTabs({ values: VALUES, ...options });
    return (
        <>
            <div {...tabs.getListProps()}>
                {VALUES.map((value) => <button key={value} {...tabs.getTabProps(value)}>{value}</button>)}
            </div>
            {VALUES.map((value) => <section key={value} {...tabs.getPanelProps(value)}>panel {value}</section>)}
            <button>after</button>
        </>
    );
};

const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });

afterEach(cleanup);

describe('useTabs', () => {
    it('links tabs and panels and shows the first one', () => {
        render(<Tabs />);
        expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('horizontal');
        const general = tab('general');
        expect(general.getAttribute('aria-selected')).toBe('true');
        expect(general.tabIndex).toBe(0);
        expect(tab('mapa').tabIndex).toBe(-1);
        const panel = screen.getByRole('tabpanel');
        expect(panel.getAttribute('aria-labelledby')).toBe(general.id);
        expect(general.getAttribute('aria-controls')).toBe(panel.id);
        expect(tab('datos abiertos').getAttribute('aria-controls')).toMatch(/datos_abiertos$/);
        expect(screen.getByText('panel mapa').hidden).toBe(true);
    });

    it('selects as focus moves when activation is automatic', () => {
        const onValueChange = vi.fn();
        render(<Tabs onValueChange={onValueChange} />);
        tab('general').focus();
        fireEvent.keyDown(tab('general'), { key: 'ArrowRight' });
        expect(document.activeElement).toBe(tab('mapa'));
        expect(onValueChange).toHaveBeenLastCalledWith('mapa');
        expect(screen.getByRole('tabpanel').textContent).toBe('panel mapa');
        fireEvent.keyDown(tab('mapa'), { key: 'ArrowLeft' });
        fireEvent.keyDown(tab('general'), { key: 'ArrowLeft' });
        expect(document.activeElement).toBe(tab('historial'));
    });

    it('waits for Enter when activation is manual and resets the tab stop on blur', () => {
        render(<Tabs activation="manual" />);
        tab('general').focus();
        fireEvent.keyDown(tab('general'), { key: 'ArrowRight' });
        expect(document.activeElement).toBe(tab('mapa'));
        expect(tab('general').getAttribute('aria-selected')).toBe('true');
        fireEvent.keyDown(tab('mapa'), { key: 'ArrowRight' });
        fireEvent.blur(tab('datos abiertos'), { relatedTarget: screen.getByText('after') });
        expect(tab('general').tabIndex).toBe(0);
        tab('mapa').focus();
        fireEvent.keyDown(tab('mapa'), { key: 'Enter' });
        expect(tab('mapa').getAttribute('aria-selected')).toBe('true');
    });

    it('skips disabled tabs and supports vertical lists', () => {
        render(<Tabs orientation="vertical" isDisabled={(value) => value === 'mapa'} />);
        expect(tab('mapa')).toHaveProperty('disabled', true);
        tab('general').focus();
        fireEvent.keyDown(tab('general'), { key: 'ArrowRight' });
        expect(document.activeElement).toBe(tab('general'));
        fireEvent.keyDown(tab('general'), { key: 'ArrowDown' });
        expect(document.activeElement).toBe(tab('datos abiertos'));
    });

    it('can be controlled and falls back when the value is not valid', () => {
        const { rerender } = render(<Tabs value="historial" />);
        expect(tab('historial').getAttribute('aria-selected')).toBe('true');
        rerender(<Tabs value="nada" />);
        expect(tab('general').getAttribute('aria-selected')).toBe('true');
        fireEvent.click(tab('mapa'));
        expect(tab('general').getAttribute('aria-selected')).toBe('true');
    });
});
