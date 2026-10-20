import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState, type FocusEvent, type PointerEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTooltip } from '@npmegar/glosa';

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T12:00:00'));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('getTriggerProps(props)', () => {
    it('runs the user handlers before its own and keeps the other props', () => {
        const calls: string[] = [];
        const Tip = () => {
            const tooltip = useTooltip({ delay: 0 });
            return (
                <>
                    <button {...tooltip.getTriggerProps({
                        className: 'mine',
                        title: 'kept',
                        onPointerEnter: (event: PointerEvent) => calls.push(`enter ${event.type}`),
                        onFocus: () => calls.push('focus'),
                        onClick: () => calls.push('click'),
                    })}>save</button>
                    {tooltip.open && <div {...tooltip.getTooltipProps()}>tip</div>}
                </>
            );
        };
        render(<Tip />);
        const trigger = screen.getByText('save');
        expect(trigger.className).toBe('mine');
        expect(trigger.title).toBe('kept');
        fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
        expect(calls).toEqual(['enter pointerenter']);
        expect(screen.getByRole('tooltip')).toBeTruthy();
        fireEvent.click(trigger);
        expect(calls).toContain('click');
    });

    it('skips its own handler when the user prevents the default', () => {
        const Tip = () => {
            const tooltip = useTooltip({ delay: 0 });
            return (
                <>
                    <button {...tooltip.getTriggerProps({ onFocus: (event: FocusEvent) => event.preventDefault() })}>save</button>
                    {tooltip.open && <div {...tooltip.getTooltipProps()}>tip</div>}
                </>
            );
        };
        render(<Tip />);
        act(() => screen.getByText('save').focus());
        expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('joins aria-describedby with the user ids while open', () => {
        const Tip = () => {
            const tooltip = useTooltip({ delay: 0 });
            return (
                <>
                    <button {...tooltip.getTriggerProps({ 'aria-describedby': 'hint' })}>save</button>
                    {tooltip.open && <div {...tooltip.getTooltipProps()}>tip</div>}
                </>
            );
        };
        render(<Tip />);
        const trigger = screen.getByText('save');
        expect(trigger.getAttribute('aria-describedby')).toBe('hint');
        fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
        expect(trigger.getAttribute('aria-describedby')).toBe(`hint ${screen.getByRole('tooltip').id}`);
    });

    it('fills object and callback refs and keeps positioning the tooltip', () => {
        const seen: (Element | null)[] = [];
        let objectRef: { current: HTMLButtonElement | null } = { current: null };
        const Tip = () => {
            const tooltip = useTooltip({ delay: 0 });
            const ref = useRef<HTMLButtonElement | null>(null);
            objectRef = ref;
            return (
                <>
                    <button {...tooltip.getTriggerProps({ ref })}>a</button>
                    <button {...tooltip.getTriggerProps({ ref: (element: Element | null) => void seen.push(element) })}>b</button>
                    {tooltip.open && <div {...tooltip.getTooltipProps()}>tip</div>}
                </>
            );
        };
        render(<Tip />);
        expect(objectRef.current).toBe(screen.getByText('a'));
        expect(seen[0]).toBe(screen.getByText('b'));
        fireEvent.pointerEnter(screen.getByText('a'), { pointerType: 'mouse' });
        expect(screen.getByRole('tooltip').style.position).toBe('fixed');
    });

    it('keeps the same merged ref across renders so the position does not loop', () => {
        const renders = vi.fn();
        let bump = (): void => undefined;
        const Tip = () => {
            const tooltip = useTooltip({ delay: 0 });
            const ref = useRef<HTMLButtonElement | null>(null);
            const [count, setCount] = useState(0);
            bump = () => setCount((value) => value + 1);
            renders();
            const other = useRef<HTMLButtonElement | null>(null);
            const props = tooltip.getTriggerProps({ ref });
            tooltip.getTriggerProps({ ref: other });
            const again = tooltip.getTriggerProps({ ref });
            return (
                <>
                    <button {...props} data-same={props.ref === again.ref ? '' : undefined}>save {count}</button>
                    {tooltip.open && <div {...tooltip.getTooltipProps()}>tip</div>}
                </>
            );
        };
        render(<Tip />);
        fireEvent.pointerEnter(screen.getByText('save 0'), { pointerType: 'mouse' });
        act(() => bump());
        act(() => vi.advanceTimersByTime(100));
        expect(screen.getByText('save 1').hasAttribute('data-same')).toBe(true);
        expect(renders.mock.calls.length).toBeLessThan(10);
        expect(screen.getByRole('tooltip')).toBeTruthy();
    });

    it('settles with an inline callback ref that changes on every render', () => {
        const renders = vi.fn();
        const Tip = () => {
            const tooltip = useTooltip({ delay: 0 });
            renders();
            return (
                <>
                    <button {...tooltip.getTriggerProps({ ref: (element: Element | null) => void element })}>save</button>
                    {tooltip.open && <div {...tooltip.getTooltipProps()}>tip</div>}
                </>
            );
        };
        render(<Tip />);
        fireEvent.pointerEnter(screen.getByText('save'), { pointerType: 'mouse' });
        act(() => vi.advanceTimersByTime(100));
        expect(screen.getByRole('tooltip').style.position).toBe('fixed');
        expect(renders.mock.calls.length).toBeLessThan(10);
    });
});
