import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { announcementText, createToaster } from '@npmegar/pregon';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

const titles = (toaster: ReturnType<typeof createToaster>): string[] => toaster.getSnapshot().toasts.map((toast) => toast.title);

describe('createToaster', () => {
    it('closes after its duration and never with Infinity or an action', () => {
        const onDismiss = vi.fn();
        const toaster = createToaster({ duration: 1000 });
        toaster.show({ title: 'Saved', onDismiss });
        toaster.show({ title: 'Sticky', duration: Infinity });
        toaster.show({ title: 'Undo?', action: { label: 'Undo' } });
        vi.advanceTimersByTime(999);
        expect(titles(toaster)).toEqual(['Saved', 'Sticky', 'Undo?']);
        vi.advanceTimersByTime(1);
        expect(titles(toaster)).toEqual(['Sticky', 'Undo?']);
        expect(onDismiss).toHaveBeenCalledWith('timeout');
        vi.advanceTimersByTime(60_000);
        expect(titles(toaster)).toEqual(['Sticky', 'Undo?']);
    });

    it('queues beyond the limit, starts the clock when shown and lets assertive jump ahead', () => {
        const toaster = createToaster({ limit: 2, duration: 1000 });
        toaster.show({ title: 'A' });
        toaster.show({ title: 'B' });
        toaster.show({ title: 'C' });
        toaster.show({ title: 'Offline', priority: 'assertive' });
        expect(titles(toaster)).toEqual(['A', 'B']);
        expect(toaster.getSnapshot().queued).toBe(2);
        vi.advanceTimersByTime(1000);
        expect(titles(toaster)).toEqual(['Offline', 'C']);
        expect(toaster.getSnapshot().announcements.assertive).toBe('Offline');
        vi.advanceTimersByTime(999);
        expect(titles(toaster)).toEqual(['Offline', 'C']);
        toaster.update({ limit: 3 });
        toaster.dismiss();
        expect(titles(toaster)).toEqual([]);
    });

    it('pauses with the time left and counts the reasons', () => {
        const toaster = createToaster({ duration: 1000 });
        toaster.show({ title: 'A' });
        vi.advanceTimersByTime(600);
        toaster.pause('hover');
        toaster.pause('focus');
        expect(toaster.getSnapshot().paused).toBe(true);
        vi.advanceTimersByTime(5000);
        toaster.resume('hover');
        vi.advanceTimersByTime(5000);
        expect(titles(toaster)).toEqual(['A']);
        toaster.resume('focus');
        vi.advanceTimersByTime(399);
        expect(titles(toaster)).toEqual(['A']);
        vi.advanceTimersByTime(1);
        expect(titles(toaster)).toEqual([]);
    });

    it('keeps a closed toast for its exit and frees its place at once', () => {
        const toaster = createToaster({ limit: 1, exit: 200 });
        const first = toaster.show({ title: 'A' });
        toaster.show({ title: 'B' });
        toaster.dismiss(first, 'close');
        expect(toaster.getSnapshot().toasts.map((toast) => `${toast.title}:${toast.state}`)).toEqual(['A:closed', 'B:open']);
        vi.advanceTimersByTime(200);
        expect(titles(toaster)).toEqual(['B']);
    });

    it('announces again a repeated message and clears it when its toast leaves', () => {
        const toaster = createToaster();
        const first = toaster.show({ title: 'Copied', description: 'Link ready' });
        expect(toaster.getSnapshot().announcements.polite).toBe('Copied. Link ready');
        toaster.show({ title: 'Copied', description: 'Link ready' });
        expect(toaster.getSnapshot().announcements.polite).toBe('Copied. Link ready ');
        toaster.dismiss();
        expect(toaster.getSnapshot().announcements.polite).toBe('');
        toaster.show({ id: first, title: 'Again' });
        toaster.show({ id: first, title: 'Updated' });
        expect(titles(toaster)).toEqual(['Updated']);
        expect(announcementText({ title: 'Done!', description: 'All good' })).toBe('Done! All good');
        expect(announcementText({ title: 'X', announce: 'Custom' })).toBe('Custom');
    });
});
