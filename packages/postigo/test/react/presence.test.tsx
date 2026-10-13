import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDialog, type UseDialogOptions } from '@ghegar/postigo/react';

const Dialog = (options: UseDialogOptions) => {
    const dialog = useDialog(options);
    return (
        <>
            <main data-testid="app"><button {...dialog.getTriggerProps()}>open</button></main>
            {dialog.mounted && createPortal(
                <div {...dialog.getDialogProps()}>
                    <h2 {...dialog.getTitleProps()}>uno</h2>
                    <button {...dialog.getCloseProps()}>close</button>
                </div>,
                document.body,
            )}
        </>
    );
};

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('useDialog presence', () => {
    it('makes the rest of the page inert while a modal is open', () => {
        render(<Dialog />);
        const app = screen.getByTestId('app').parentElement as HTMLElement;
        screen.getByText('open').focus();
        fireEvent.click(screen.getByText('open'));
        expect(app.hasAttribute('inert')).toBe(true);
        fireEvent.click(screen.getByText('close'));
        expect(app.hasAttribute('inert')).toBe(false);
        expect(document.activeElement).toBe(screen.getByText('open'));
    });

    it('can leave the page alone', () => {
        render(<Dialog inert={false} />);
        fireEvent.click(screen.getByText('open'));
        expect(screen.getByTestId('app').parentElement?.hasAttribute('inert')).toBe(false);
    });

    it('stays mounted while it exits', () => {
        vi.useFakeTimers();
        render(<Dialog exit={200} />);
        fireEvent.click(screen.getByText('open'));
        fireEvent.click(screen.getByText('close'));
        const dialog = screen.getByRole('dialog', { hidden: true });
        expect(dialog.dataset.state).toBe('closed');
        act(() => vi.advanceTimersByTime(199));
        expect(screen.queryByRole('dialog', { hidden: true })).not.toBeNull();
        act(() => vi.advanceTimersByTime(1));
        expect(screen.queryByRole('dialog', { hidden: true })).toBeNull();
    });

    it('unmounts early when the animation ends', () => {
        render(<Dialog exit={5000} />);
        fireEvent.click(screen.getByText('open'));
        fireEvent.click(screen.getByText('close'));
        const dialog = screen.getByRole('dialog', { hidden: true });
        fireEvent.animationEnd(dialog);
        expect(screen.queryByRole('dialog', { hidden: true })).toBeNull();
    });
});
