import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createDropzone, type Dropzone, type DropzoneOptions, type DropzoneSnapshot } from '../core/index.js';
import {
    DEFAULT_LABELS, inputProps, removeProps, rootProps,
    type DropzoneLabels, type InputProps, type RemoveProps, type RootProps,
} from './props.js';

export interface UseDropzoneOptions extends DropzoneOptions {
    labels?: Partial<DropzoneLabels>;
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

    const open = useCallback(() => {
        if (!dropzone.getSnapshot().disabled) input.current?.click();
    }, [dropzone]);
    const labels = { ...DEFAULT_LABELS, ...options.labels };

    return {
        ...snapshot,
        dropzone,
        open,
        getRootProps: () => rootProps(snapshot, dropzone, open),
        getInputProps: () => inputProps(snapshot, dropzone, input),
        getRemoveProps: (file) => removeProps(dropzone, file, labels),
        previewUrl: dropzone.previewUrl,
    };
};
