import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToaster, useToaster, type ToasterOptions, type ToastInput, type UseToasterOptions } from '@npmegar/pregon/react';

let store = createToaster();

const Toasts = (options: UseToasterOptions) => {
    const toaster = useToaster(options);
    return (
        <>
            <button type="button">outside</button>
            <button type="button" onClick={() => toaster.show({ title: 'Own' })}>add</button>
            <span data-testid="queued">{toaster.queued}</span>
            <ol {...toaster.getViewportProps()}>
                {toaster.toasts.map((toast) => (
                    <li key={toast.id} {...toaster.getToastProps(toast.id)}>
                        <strong {...toaster.getTitleProps(toast.id)}>{toast.title}</strong>
                        {toast.description && <p {...toaster.getDescriptionProps(toast.id)}>{toast.description}</p>}
                        {toast.action && <button {...toaster.getActionProps(toast.id)}>{toast.action.label}</button>}
                        <button {...toaster.getCloseProps(toast.id)}>×</button>
                    </li>
                ))}
            </ol>
            <div {...toaster.getAnnouncerProps('polite')} />
            <div {...toaster.getAnnouncerProps('assertive')} />
        </>
    );
};

const list = () => within(screen.getByRole('region'));

const show = (toast: ToastInput): void => {
    act(() => {
        store.show(toast);
    });
};

const setup = (options: UseToasterOptions = {}, settings: ToasterOptions = {}) => {
    store = createToaster(settings);
    return render(<Toasts toaster={store} {...options} />);
};

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    store.destroy();
});

describe('useToaster', () => {
    it('announces in the matching live region without moving focus', () => {
        setup();
        const outside = screen.getByRole('button', { name: 'outside' });
        outside.focus();
        show({ title: 'Layer uploaded', description: 'roads.geojson' });
        show({ title: 'Network error', priority: 'assertive' });
        expect(screen.getByRole('status').textContent).toBe('Layer uploaded. roads.geojson');
        expect(screen.getByRole('alert').textContent).toBe('Network error');
        expect(screen.getByRole('region', { name: 'Notifications' })).toBeTruthy();
        const item = list().getByText('Layer uploaded').closest('li') as HTMLElement;
        expect(item.getAttribute('aria-describedby')).toBe(list().getByText('roads.geojson').id);
        expect(document.activeElement).toBe(outside);
    });

    it('dismisses with the close button and runs the action', () => {
        const onAction = vi.fn();
        const onDismiss = vi.fn();
        setup();
        show({ title: 'Deleted', action: { label: 'Undo', onAction }, onDismiss });
        show({ title: 'Saved' });
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
        expect(onAction).toHaveBeenCalledOnce();
        expect(onDismiss).toHaveBeenCalledWith('action');
        fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
        expect(list().queryByText('Saved')).toBeNull();
    });

    it('pauses while hovered or focused and keeps focus when its toast closes', () => {
        setup({}, { duration: 1000 });
        show({ title: 'Exported' });
        const region = screen.getByRole('region');
        fireEvent.pointerEnter(region);
        act(() => vi.advanceTimersByTime(3000));
        expect(region.hasAttribute('data-paused')).toBe(true);
        expect(list().getByText('Exported')).toBeTruthy();
        fireEvent.pointerLeave(region);
        const close = screen.getByRole('button', { name: 'Dismiss' });
        act(() => close.focus());
        act(() => vi.advanceTimersByTime(3000));
        expect(list().getByText('Exported')).toBeTruthy();
        fireEvent.click(close);
        expect(document.activeElement).toBe(region);
        act(() => screen.getByRole('button', { name: 'outside' }).focus());
        show({ title: 'Next' });
        act(() => vi.advanceTimersByTime(1000));
        expect(list().queryByText('Next')).toBeNull();
    });

    it('closes the last toast with Escape only when asked and not prevented', () => {
        const { unmount } = setup();
        show({ title: 'A' });
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(list().getByText('A')).toBeTruthy();
        unmount();
        setup({ closeOnEscape: true });
        show({ title: 'A' });
        show({ title: 'B' });
        const blocker = (event: KeyboardEvent) => event.preventDefault();
        document.addEventListener('keydown', blocker, true);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(list().getByText('B')).toBeTruthy();
        document.removeEventListener('keydown', blocker, true);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(list().queryByText('B')).toBeNull();
        expect(list().getByText('A')).toBeTruthy();
    });

    it('creates its own store when none is given', () => {
        render(<Toasts limit={1} />);
        fireEvent.click(screen.getByRole('button', { name: 'add' }));
        fireEvent.click(screen.getByRole('button', { name: 'add' }));
        expect(list().getByText('Own')).toBeTruthy();
        expect(screen.getByRole('status').textContent).toBe('Own');
        expect(screen.getByTestId('queued').textContent).toBe('1');
    });
});
