export type Priority = 'polite' | 'assertive';

export type DismissReason = 'timeout' | 'close' | 'action' | 'escape' | 'api';

export type ToastState = 'open' | 'closed';

export interface ToastAction {
    label: string;
    onAction?: () => void;
}

export interface ToastInput<D = unknown> {
    id?: string;
    title: string;
    description?: string;
    priority?: Priority;
    duration?: number;
    action?: ToastAction;
    announce?: string;
    data?: D;
    onDismiss?: (reason: DismissReason) => void;
}

export interface Toast<D = unknown> {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    duration: number;
    action?: ToastAction;
    state: ToastState;
    data?: D;
}

export interface ToasterOptions {
    limit?: number;
    duration?: number;
    exit?: number;
}

export interface ToasterSnapshot<D = unknown> {
    toasts: readonly Toast<D>[];
    queued: number;
    paused: boolean;
    announcements: Readonly<Record<Priority, string>>;
}

export interface Toaster<D = unknown> {
    subscribe(listener: () => void): () => void;
    getSnapshot(): ToasterSnapshot<D>;
    show(toast: ToastInput<D>): string;
    dismiss(id?: string, reason?: DismissReason): void;
    pause(reason: string): void;
    resume(reason: string): void;
    update(options: ToasterOptions): void;
    destroy(): void;
}
