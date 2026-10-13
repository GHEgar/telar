import { parseAccept } from './accept.js';
import { judgeDrag } from './drag.js';
import { createPreviews } from './previews.js';
import type { DragItem, Dropzone, DropzoneOptions, DropzoneSnapshot, FileRejection, ValidationResult } from './types.js';
import { validateFiles } from './validate.js';

const CALLBACKS = new Set(['onChange', 'onReject']);

const sameList = (a: readonly File[], b: readonly File[]): boolean => a.length === b.length && a.every((file, index) => file === b[index]);

const acceptString = (accept: DropzoneOptions['accept']): string | undefined => {
    if (!accept) return undefined;
    return typeof accept === 'string' ? accept : accept.join(',');
};

export const createDropzone = (initial: DropzoneOptions = {}): Dropzone => {
    let options = initial;
    let files: readonly File[] = [...(initial.files ?? [])];
    let rejections: readonly FileRejection[] = [];
    let depth = 0;
    let dragStatus: DropzoneSnapshot['dragStatus'] = null;
    const listeners = new Set<() => void>();
    const previews = createPreviews();

    const build = (): DropzoneSnapshot => {
        const multiple = options.multiple ?? false;
        return {
            files,
            rejections,
            dragging: depth > 0,
            dragStatus,
            disabled: options.disabled ?? false,
            multiple,
            accept: acceptString(options.accept),
            full: multiple && options.maxFiles !== undefined && files.length >= options.maxFiles,
        };
    };
    let snapshot = build();

    const commit = (): void => {
        snapshot = build();
        listeners.forEach((listener) => listener());
    };

    const setList = (next: readonly File[]): void => {
        files = next;
        previews.keep(next);
    };

    const add = (list: Iterable<File> | ArrayLike<File>): ValidationResult | null => {
        if (options.disabled) return null;
        const result = validateFiles(Array.from(list), files, options);
        const changed = !sameList(result.files, files);
        if (changed) setList(result.files);
        rejections = result.rejections;
        commit();
        if (changed) options.onChange?.(result.files);
        if (result.rejections.length) options.onReject?.(result.rejections);
        return result;
    };

    const endDrag = (): void => {
        depth = 0;
        dragStatus = null;
    };

    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSnapshot: () => snapshot,
        add,
        remove(target) {
            const index = typeof target === 'number' ? target : files.indexOf(target);
            if (index < 0 || index >= files.length) return;
            const next = files.filter((_, position) => position !== index);
            setList(next);
            commit();
            options.onChange?.(next);
        },
        clear() {
            if (!files.length && !rejections.length) return;
            const changed = files.length > 0;
            setList([]);
            rejections = [];
            commit();
            if (changed) options.onChange?.([]);
        },
        setFiles(next) {
            if (sameList(next, files)) return;
            setList([...next]);
            commit();
        },
        dismissRejections() {
            if (!rejections.length) return;
            rejections = [];
            commit();
        },
        dragEnter(items: Iterable<DragItem> | ArrayLike<DragItem> = []) {
            if (options.disabled) return;
            depth += 1;
            if (depth > 1) return;
            dragStatus = judgeDrag(Array.from(items), parseAccept(options.accept));
            commit();
        },
        dragLeave() {
            if (depth === 0) return;
            depth -= 1;
            if (depth > 0) return;
            endDrag();
            commit();
        },
        drop(list) {
            const wasDragging = depth > 0;
            endDrag();
            const result = add(list);
            if (!result && wasDragging) commit();
            return result;
        },
        resetDrag() {
            if (depth === 0) return;
            endDrag();
            commit();
        },
        previewUrl: (file) => previews.get(file),
        update(patch) {
            options = { ...options, ...patch };
            if (Object.keys(patch).every((key) => CALLBACKS.has(key))) return;
            if (options.disabled) endDrag();
            commit();
        },
        destroy() {
            if (previews.revokeAll()) commit();
        },
    };
};
