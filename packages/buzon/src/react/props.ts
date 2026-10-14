import type { ChangeEvent, ClipboardEvent, DragEvent, KeyboardEvent, MouseEvent, RefCallback, RefObject } from 'react';
import type { Dropzone, DropzoneSnapshot } from '../core/index.js';

export interface DropzoneLabels {
    remove: string;
}

export const DEFAULT_LABELS: DropzoneLabels = { remove: 'Remove' };

export interface RootProps {
    ref: RefCallback<HTMLElement>;
    role: 'button';
    tabIndex: number;
    'aria-disabled'?: true;
    'data-dragging'?: true;
    'data-drag'?: NonNullable<DropzoneSnapshot['dragStatus']>;
    'data-disabled'?: true;
    'data-full'?: true;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
    onDragEnter: (event: DragEvent) => void;
    onDragOver: (event: DragEvent) => void;
    onDragLeave: (event: DragEvent) => void;
    onDrop: (event: DragEvent) => void;
    onPaste?: (event: ClipboardEvent) => void;
}

export interface InputProps {
    ref: RefObject<HTMLInputElement | null>;
    type: 'file';
    hidden: true;
    tabIndex: -1;
    accept?: string;
    multiple: boolean;
    disabled: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClick: (event: MouseEvent) => void;
}

export interface RemoveProps {
    type: 'button';
    'aria-label': string;
    onClick: (event: MouseEvent) => void;
}

const flag = (value: boolean): true | undefined => (value ? true : undefined);

export const pastedFiles = (data: DataTransfer | null | undefined): File[] => Array.from(data?.files ?? []);

export const rootProps = (
    snapshot: DropzoneSnapshot,
    dropzone: Dropzone,
    open: () => void,
    ref: RefCallback<HTMLElement>,
    paste: boolean,
): RootProps => ({
    ref,
    role: 'button',
    tabIndex: snapshot.disabled ? -1 : 0,
    'aria-disabled': flag(snapshot.disabled),
    'data-dragging': flag(snapshot.dragging),
    'data-drag': snapshot.dragStatus ?? undefined,
    'data-disabled': flag(snapshot.disabled),
    'data-full': flag(snapshot.full),
    onClick: open,
    onKeyDown: (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open();
    },
    onDragEnter: (event) => {
        event.preventDefault();
        dropzone.dragEnter(event.dataTransfer?.items ?? []);
    },
    onDragOver: (event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = snapshot.disabled ? 'none' : 'copy';
    },
    onDragLeave: () => dropzone.dragLeave(),
    onDrop: (event) => {
        event.preventDefault();
        dropzone.drop(event.dataTransfer?.files ?? []);
    },
    ...(paste ? {
        onPaste: (event: ClipboardEvent) => {
            const files = pastedFiles(event.clipboardData);
            if (!files.length) return;
            event.preventDefault();
            dropzone.add(files);
        },
    } : {}),
} as RootProps);

export const inputProps = (snapshot: DropzoneSnapshot, dropzone: Dropzone, ref: RefObject<HTMLInputElement | null>): InputProps => ({
    ref,
    type: 'file',
    hidden: true,
    tabIndex: -1,
    accept: snapshot.accept,
    multiple: snapshot.multiple,
    disabled: snapshot.disabled,
    onChange: (event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';
        dropzone.add(files);
    },
    onClick: (event) => event.stopPropagation(),
} as InputProps);

export const removeProps = (dropzone: Dropzone, file: File, labels: DropzoneLabels): RemoveProps => ({
    type: 'button',
    'aria-label': `${labels.remove} ${file.name}`,
    onClick: (event) => {
        event.stopPropagation();
        dropzone.remove(file);
    },
});
