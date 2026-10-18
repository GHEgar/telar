import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTooltip } from '@npmegar/glosa';

const Wrapped = () => {
    const tooltip = useTooltip({ delay: 0 });
    return (
        <>
            <span tabIndex={0} {...tooltip.getTriggerProps()}>
                <button disabled>Publicar</button>
            </span>
            {tooltip.open && <div {...tooltip.getTooltipProps()}>Falta el título</div>}
        </>
    );
};

const AriaDisabled = () => {
    const tooltip = useTooltip({ delay: 0 });
    return (
        <>
            <button aria-disabled="true" {...tooltip.getTriggerProps()}>Publicar</button>
            {tooltip.open && <div {...tooltip.getTooltipProps()}>Falta el título</div>}
        </>
    );
};

afterEach(cleanup);

describe('tooltips on disabled controls', () => {
    it('works through a focusable wrapper', () => {
        render(<Wrapped />);
        const wrapper = screen.getByText('Publicar').parentElement as HTMLElement;
        fireEvent.pointerEnter(wrapper, { pointerType: 'mouse' });
        expect(screen.getByRole('tooltip').textContent).toBe('Falta el título');
        expect(wrapper.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
    });

    it('works on aria-disabled controls, which keep focus and events', () => {
        render(<AriaDisabled />);
        act(() => screen.getByText('Publicar').focus());
        expect(screen.getByRole('tooltip')).toBeTruthy();
    });
});
