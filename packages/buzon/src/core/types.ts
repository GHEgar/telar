import type { Accept } from './accept.js';

export type RejectionCode = 'type' | 'size' | 'count' | 'duplicate' | 'custom';

export interface FileRejection {
    file: File;
    codes: RejectionCode[];
    message?: string;
}

export type DragStatus = 'accept' | 'reject' | 'unknown';

export interface ValidationOptions {
    accept?: Accept;
    maxSize?: number;
    minSize?: number;
    maxFiles?: number;
    multiple?: boolean;
    allowDuplicates?: boolean;
    validate?: (file: File, current: readonly File[]) => string | null | undefined;
}

export interface ValidationResult {
    files: File[];
    accepted: File[];
    rejections: FileRejection[];
}

export interface DropzoneOptions extends ValidationOptions {
    files?: readonly File[];
    disabled?: boolean;
    onChange?: (files: File[]) => void;
    onReject?: (rejections: FileRejection[]) => void;
}

export interface DropzoneSnapshot {
    files: readonly File[];
    rejections: readonly FileRejection[];
    dragging: boolean;
    dragStatus: DragStatus | null;
    disabled: boolean;
    multiple: boolean;
    accept: string | undefined;
    full: boolean;
}

export interface DragItem {
    kind: string;
    type: string;
}

export interface Dropzone {
    subscribe(listener: () => void): () => void;
    getSnapshot(): DropzoneSnapshot;
    add(files: Iterable<File> | ArrayLike<File>): ValidationResult | null;
    remove(target: File | number): void;
    clear(): void;
    setFiles(files: readonly File[]): void;
    dismissRejections(): void;
    dragEnter(items?: Iterable<DragItem> | ArrayLike<DragItem>): void;
    dragLeave(): void;
    drop(files: Iterable<File> | ArrayLike<File>): ValidationResult | null;
    resetDrag(): void;
    previewUrl(file: File): string | null;
    update(options: Partial<DropzoneOptions>): void;
    destroy(): void;
}
