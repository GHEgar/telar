import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDialog, type UseDialogOptions } from '@npmegar/postigo/react';

const Dialog = ({ name, children, ...options }: UseDialogOptions & { name: string; children?: ReactNode }) => {
    const dialog = useDialog(options);
    return (
        <>
            <button {...dialog.getTriggerProps()}>open {name}</button>
            {dialog.open && createPortal(
                <div {...dialog.getDialogProps()}>
                    <h2 {...dialog.getTitleProps()}>{name}</h2>
                    <input aria-label={`${name} field`} />
                    {children}
                    <button {...dialog.getCloseProps()}>close {name}</button>
                </div>,
                document.body,
            )}
        </>
    );
};

const escape = () => fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });

afterEach(cleanup);

describe('useDialog', () => {
    it('opens from the trigger, labels itself and focuses the first field', () => {
        render(<Dialog name="uno" />);
        const trigger = screen.getByText('open uno');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(trigger);
        const dialog = screen.getByRole('dialog', { name: 'uno' });
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
        expect(document.activeElement).toBe(screen.getByLabelText('uno field'));
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('closes with Escape, returns focus and releases the scroll', () => {
        const onOpenChange = vi.fn();
        render(<Dialog name="uno" onOpenChange={onOpenChange} />);
        const trigger = screen.getByText('open uno');
        trigger.focus();
        fireEvent.click(trigger);
        escape();
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(onOpenChange).toHaveBeenLastCalledWith(false, 'escape');
        expect(document.activeElement).toBe(trigger);
        expect(document.body.style.overflow).toBe('');
    });

    it('closes only the top dialog of a nested pair', () => {
        render(<Dialog name="padre"><Dialog name="hijo" /></Dialog>);
        fireEvent.click(screen.getByText('open padre'));
        const inner = screen.getByText('open hijo');
        inner.focus();
        fireEvent.click(inner);
        expect(screen.getAllByRole('dialog')).toHaveLength(2);
        escape();
        expect(screen.getAllByRole('dialog')).toHaveLength(1);
        expect(document.activeElement).toBe(inner);
        expect(document.body.style.overflow).toBe('hidden');
        escape();
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.body.style.overflow).toBe('');
    });

    it('closes on a pointer down outside but not on the trigger or inside', () => {
        const onOpenChange = vi.fn();
        render(<><p>afuera</p><Dialog name="uno" onOpenChange={onOpenChange} /></>);
        fireEvent.click(screen.getByText('open uno'));
        fireEvent.pointerDown(screen.getByLabelText('uno field'));
        fireEvent.pointerDown(screen.getByText('open uno'));
        expect(screen.getByRole('dialog')).toBeTruthy();
        fireEvent.pointerDown(screen.getByText('afuera'));
        expect(onOpenChange).toHaveBeenLastCalledWith(false, 'outside');
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('respects closeOnEscape and closeOnOutsideClick', () => {
        render(<><p>afuera</p><Dialog name="uno" role="alertdialog" closeOnEscape={false} closeOnOutsideClick={false} /></>);
        fireEvent.click(screen.getByText('open uno'));
        escape();
        fireEvent.pointerDown(screen.getByText('afuera'));
        expect(screen.getByRole('alertdialog')).toBeTruthy();
        fireEvent.click(screen.getByText('close uno'));
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('wraps Tab inside and leaves a nested dialog alone', () => {
        render(<Dialog name="padre"><Dialog name="hijo" /></Dialog>);
        fireEvent.click(screen.getByText('open padre'));
        const close = screen.getByText('close padre');
        close.focus();
        fireEvent.keyDown(close, { key: 'Tab' });
        expect(document.activeElement).toBe(screen.getByLabelText('padre field'));
        fireEvent.click(screen.getByText('open hijo'));
        const childClose = screen.getByText('close hijo');
        childClose.focus();
        fireEvent.keyDown(childClose, { key: 'Tab' });
        expect(document.activeElement).toBe(screen.getByLabelText('hijo field'));
    });

    it('keeps focus when the parent re-renders with an inline callback', () => {
        const Parent = () => {
            const [count, setCount] = useState(0);
            return (
                <Dialog name="uno" defaultOpen onOpenChange={() => setCount(count + 1)}>
                    <button onClick={() => setCount(count + 1)}>tick {count}</button>
                </Dialog>
            );
        };
        render(<Parent />);
        const tick = screen.getByText('tick 0');
        tick.focus();
        fireEvent.click(tick);
        expect(document.activeElement).toBe(screen.getByText('tick 1'));
    });

    it('works controlled, with initialFocus and returnFocus', () => {
        const Controlled = () => {
            const [open, setOpen] = useState(false);
            const ok = useRef<HTMLButtonElement>(null);
            const back = useRef<HTMLButtonElement>(null);
            const dialog = useDialog({ open, onOpenChange: setOpen, initialFocus: ok, returnFocus: back, label: 'Confirmar' });
            return (
                <>
                    <button ref={back}>back</button>
                    <button onClick={() => setOpen(true)}>show</button>
                    {open && (
                        <div {...dialog.getDialogProps()}>
                            <input aria-label="nota" />
                            <button ref={ok} {...dialog.getCloseProps()}>ok</button>
                        </div>
                    )}
                </>
            );
        };
        render(<Controlled />);
        fireEvent.click(screen.getByText('show'));
        expect(screen.getByRole('dialog', { name: 'Confirmar' })).toBeTruthy();
        expect(document.activeElement).toBe(screen.getByText('ok'));
        act(() => screen.getByText('ok').click());
        expect(document.activeElement).toBe(screen.getByText('back'));
    });
});
