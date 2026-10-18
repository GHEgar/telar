import { createTimer, type Timer } from './timer.js';
import type { DismissReason, Priority, Toast, Toaster, ToasterOptions, ToasterSnapshot, ToastInput } from './types.js';

interface Entry<D> {
    toast: Toast<D>;
    input: ToastInput<D>;
    timer: Timer | null;
    exit: ReturnType<typeof setTimeout> | null;
}

const NBSP = ' ';

export const announcementText = (toast: Pick<ToastInput, 'title' | 'description' | 'announce'>): string => {
    if (toast.announce !== undefined) return toast.announce;
    if (!toast.description) return toast.title;
    const separator = /[.!?:…]$/u.test(toast.title) ? ' ' : '. ';
    return `${toast.title}${separator}${toast.description}`;
};

export const createToaster = <D = unknown>(initial: ToasterOptions = {}): Toaster<D> => {
    let options = initial;
    let counter = 0;
    let visible: Entry<D>[] = [];
    let waiting: Entry<D>[] = [];
    const reasons = new Set<string>();
    const announcements: Record<Priority, string> = { polite: '', assertive: '' };
    const spoken: Record<Priority, { id: string; text: string } | null> = { polite: null, assertive: null };
    const listeners = new Set<() => void>();

    const build = (): ToasterSnapshot<D> => ({
        toasts: visible.map((entry) => entry.toast),
        queued: waiting.length,
        paused: reasons.size > 0,
        announcements: { ...announcements },
    });
    let snapshot = build();

    const commit = (): void => {
        snapshot = build();
        listeners.forEach((listener) => listener());
    };

    const durationOf = (input: ToastInput<D>): number => {
        if (input.duration !== undefined) return input.duration;
        return input.action ? Infinity : options.duration ?? 5000;
    };

    const toastOf = (id: string, input: ToastInput<D>): Toast<D> => ({
        id,
        title: input.title,
        priority: input.priority ?? 'polite',
        duration: durationOf(input),
        state: 'open',
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.action === undefined ? {} : { action: input.action }),
        ...(input.data === undefined ? {} : { data: input.data }),
    });

    const announce = (entry: Entry<D>): void => {
        const { priority, id } = entry.toast;
        const text = announcementText(entry.input);
        const previous = spoken[priority];
        const repeat = previous !== null && previous.text === text && !announcements[priority].endsWith(NBSP);
        announcements[priority] = repeat ? `${text}${NBSP}` : text;
        spoken[priority] = { id, text };
    };

    const startTimer = (entry: Entry<D>): void => {
        entry.timer?.clear();
        entry.timer = createTimer(entry.toast.duration, () => dismiss(entry.toast.id, 'timeout'));
        if (reasons.size === 0) entry.timer.resume();
    };

    const reveal = (entry: Entry<D>): void => {
        visible = [...visible, entry];
        startTimer(entry);
        announce(entry);
    };

    const flush = (): void => {
        const limit = Math.max(options.limit ?? 3, 1);
        let open = visible.filter((entry) => entry.toast.state === 'open').length;
        while (open < limit && waiting.length) {
            const [next, ...rest] = waiting;
            waiting = rest;
            if (next) reveal(next);
            open += 1;
        }
    };

    const remove = (entry: Entry<D>): void => {
        visible = visible.filter((item) => item !== entry);
        const { priority, id } = entry.toast;
        if (spoken[priority]?.id === id) {
            announcements[priority] = '';
            spoken[priority] = null;
        }
    };

    const close = (entry: Entry<D>, reason: DismissReason): void => {
        entry.timer?.clear();
        entry.toast = { ...entry.toast, state: 'closed' };
        visible = visible.map((item) => (item === entry ? entry : item));
        const exit = options.exit ?? 0;
        if (exit > 0) {
            entry.exit = setTimeout(() => {
                remove(entry);
                commit();
            }, exit);
        } else {
            remove(entry);
        }
        entry.input.onDismiss?.(reason);
    };

    function dismiss(id?: string, reason: DismissReason = 'api'): void {
        const targets = id === undefined
            ? visible.filter((entry) => entry.toast.state === 'open')
            : visible.filter((entry) => entry.toast.id === id && entry.toast.state === 'open');
        const dropped = id === undefined ? waiting : waiting.filter((entry) => entry.toast.id === id);
        if (!targets.length && !dropped.length) return;
        waiting = waiting.filter((entry) => !dropped.includes(entry));
        dropped.forEach((entry) => entry.input.onDismiss?.(reason));
        targets.forEach((entry) => close(entry, reason));
        flush();
        commit();
    }

    const find = (id: string): Entry<D> | undefined => visible.find((entry) => entry.toast.id === id && entry.toast.state === 'open')
        ?? waiting.find((entry) => entry.toast.id === id);

    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSnapshot: () => snapshot,
        show(input) {
            counter += 1;
            const id = input.id ?? `toast-${counter}`;
            const existing = find(id);
            if (existing) {
                existing.input = input;
                existing.toast = toastOf(id, input);
                if (visible.includes(existing)) {
                    visible = [...visible];
                    startTimer(existing);
                    announce(existing);
                }
                commit();
                return id;
            }
            const entry: Entry<D> = { toast: toastOf(id, input), input, timer: null, exit: null };
            if (entry.toast.priority === 'assertive') {
                const at = waiting.findIndex((item) => item.toast.priority === 'polite');
                waiting = at < 0 ? [...waiting, entry] : [...waiting.slice(0, at), entry, ...waiting.slice(at)];
            } else {
                waiting = [...waiting, entry];
            }
            flush();
            commit();
            return id;
        },
        dismiss,
        pause(reason) {
            const was = reasons.size;
            reasons.add(reason);
            if (was > 0 || reasons.size === was) return;
            visible.forEach((entry) => entry.timer?.pause());
            commit();
        },
        resume(reason) {
            if (!reasons.delete(reason) || reasons.size > 0) return;
            visible.forEach((entry) => {
                if (entry.toast.state === 'open') entry.timer?.resume();
            });
            commit();
        },
        update(patch) {
            const next = { ...options, ...patch };
            if (next.limit === options.limit && next.duration === options.duration && next.exit === options.exit) return;
            options = next;
            flush();
            commit();
        },
        destroy() {
            [...visible, ...waiting].forEach((entry) => {
                entry.timer?.clear();
                if (entry.exit !== null) clearTimeout(entry.exit);
            });
        },
    };
};
