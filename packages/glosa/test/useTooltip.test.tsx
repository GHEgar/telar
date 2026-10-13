import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTooltip, type UseTooltipOptions } from '@ghegar/glosa';

const Tip = ({ label = 'save', ...options }: UseTooltipOptions & { label?: string }) => {
    const tooltip = useTooltip(options);
    return (
        <>
            <button {...tooltip.getTriggerProps()}>{label}</button>
            {tooltip.open && <div {...tooltip.getTooltipProps()}>tip {label}</div>}
        </>
    );
};

const hover = (element: HTMLElement) => fireEvent.pointerEnter(element, { pointerType: 'mouse' });

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-13T12:00:00'));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('useTooltip', () => {
    it('opens after the delay and describes the trigger', () => {
        render(<Tip delay={500} />);
        const trigger = screen.getByText('save');
        hover(trigger);
        act(() => vi.advanceTimersByTime(499));
        expect(screen.queryByRole('tooltip')).toBeNull();
        act(() => vi.advanceTimersByTime(1));
        const tooltip = screen.getByRole('tooltip');
        expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
        expect(tooltip.style.position).toBe('fixed');
    });

    it('stays open while the pointer moves into it and closes after leaving', () => {
        render(<Tip delay={0} closeDelay={100} />);
        hover(screen.getByText('save'));
        fireEvent.pointerLeave(screen.getByText('save'));
        fireEvent.pointerEnter(screen.getByRole('tooltip'));
        act(() => vi.advanceTimersByTime(500));
        expect(screen.getByRole('tooltip')).toBeTruthy();
        fireEvent.pointerLeave(screen.getByRole('tooltip'));
        act(() => vi.advanceTimersByTime(100));
        expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('opens at once on focus and closes on blur, click and Escape', () => {
        render(<Tip />);
        const trigger = screen.getByText('save');
        act(() => trigger.focus());
        expect(screen.getByRole('tooltip')).toBeTruthy();
        const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true });
        act(() => {
            document.dispatchEvent(escape);
        });
        expect(escape.defaultPrevented).toBe(true);
        expect(screen.queryByRole('tooltip')).toBeNull();
        act(() => trigger.blur());
        act(() => trigger.focus());
        fireEvent.pointerDown(trigger);
        expect(screen.queryByRole('tooltip')).toBeNull();
        act(() => trigger.blur());
        act(() => trigger.focus());
        expect(screen.getByRole('tooltip')).toBeTruthy();
        act(() => trigger.blur());
        expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('skips the delay right after another tooltip closed', () => {
        render(<><Tip label="a" delay={600} /><Tip label="b" delay={600} /></>);
        act(() => screen.getByText('a').focus());
        act(() => screen.getByText('a').blur());
        act(() => vi.advanceTimersByTime(100));
        hover(screen.getByText('b'));
        expect(screen.getByRole('tooltip').textContent).toBe('tip b');
    });

    it('ignores touch and disabled tooltips', () => {
        render(<><Tip label="a" delay={0} /><Tip label="b" disabled /></>);
        act(() => vi.advanceTimersByTime(1000));
        fireEvent.pointerEnter(screen.getByText('a'), { pointerType: 'touch' });
        act(() => screen.getByText('b').focus());
        act(() => vi.advanceTimersByTime(1000));
        expect(screen.queryByRole('tooltip')).toBeNull();
    });
});
