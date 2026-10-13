import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createDropzone, type Dropzone, type DropzoneOptions, type DropzoneSnapshot } from '../core/index.js';
import {
    DEFAULT_LABELS, inputProps, pastedFiles, removeProps, rootProps,
    type DropzoneLabels, type InputProps, type RemoveProps, type RootProps,
} from './props.js';

export interface UseDropzoneOptions extends DropzoneOptions {
    labels?: Partial<DropzoneLabels>;
    preventDocumentDrop?: boolean;
    paste?: boolean | 'document';
}

export interface UseDropzone extends DropzoneSnapshot {
    dropzone: Dropzone;
    open(): void;
    getRootProps(): RootProps;
    getInputProps(): InputProps;
    getRemoveProps(file: File): RemoveProps;
    previewUrl(file: File): string | null;
}

export const useDropzone = (options: UseDropzoneOptions = {}): UseDropzone => {
    const [dropzone] = useState(() => createDropzone(options));
    const snapshot = useSyncExternalStore(dropzone.subscribe, dropzone.getSnapshot, dropzone.getSnapshot);
    const input = useRef<HTMLInputElement | null>(null);

    const { onChange, onReject } = options;
    useLayoutEffect(() => {
        dropzone.update({ onChange, onReject } as DropzoneOptions);
    }, [dropzone, onChange, onReject]);

    const { accept, maxSize, minSize, maxFiles, multiple, allowDuplicates, validate, disabled } = options;
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        dropzone.update({ accept, maxSize, minSize, maxFiles, multiple, allowDuplicates, validate, disabled } as DropzoneOptions);
    }, [dropzone, accept, maxSize, minSize, maxFiles, multiple, allowDuplicates, validate, disabled]);

    const { files } = options;
    useEffect(() => {
        if (files) dropzone.setFiles(files);
    }, [dropzone, files]);

    useEffect(() => () => dropzone.destroy(), [dropzone]);

    const root = useRef<HTMLElement | null>(null);
    const { preventDocumentDrop = true, paste = false } = options;
    useEffect(() => {
        if (!preventDocumentDrop) return undefined;
        const carriesFiles = (event: DragEvent): boolean => event.dataTransfer?.types.includes('Files') ?? false;
        const onDragOver = (event: DragEvent): void => {
            if (carriesFiles(event)) event.preventDefault();
        };
        const onDrop = (event: DragEvent): void => {
            if (carriesFiles(event) && !root.current?.contains(event.target as Node)) event.preventDefault();
        };
        document.addEventListener('dragover', onDragOver);
        document.addEventListener('drop', onDrop);
        return () => {
            document.removeEventListener('dragover', onDragOver);
            document.removeEventListener('drop', onDrop);
        };
    }, [preventDocumentDrop]);

    useEffect(() => {
        if (paste !== 'document') return undefined;
        const onPaste = (event: ClipboardEvent): void => {
            const pasted = pastedFiles(event.clipboardData);
            if (!pasted.length) return;
            event.preventDefault();
            dropzone.add(pasted);
        };
        document.addEventListener('paste', onPaste);
        return () => document.removeEventListener('paste', onPaste);
    }, [dropzone, paste]);

    const setRoot = useCallback((element: HTMLElement | null) => {
        root.current = element;
    }, []);

    const open = useCallback(() => {
        if (!dropzone.getSnapshot().disabled) input.current?.click();
    }, [dropzone]);
    const labels = { ...DEFAULT_LABELS, ...options.labels };

    return {
        ...snapshot,
        dropzone,
        open,
        getRootProps: () => rootProps(snapshot, dropzone, open, setRoot, paste === true),
        getInputProps: () => inputProps(snapshot, dropzone, input),
        getRemoveProps: (file) => removeProps(dropzone, file, labels),
        previewUrl: dropzone.previewUrl,
    };
};
