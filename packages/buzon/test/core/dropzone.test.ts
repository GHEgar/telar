import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDropzone } from '@npmegar/buzon';
import { makeFile } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

describe('createDropzone', () => {
    it('adds, removes and reports', () => {
        const onChange = vi.fn();
        const onReject = vi.fn();
        const dropzone = createDropzone({ multiple: true, accept: 'image/*', onChange, onReject });
        const png = makeFile('a.png', 'image/png');
        dropzone.add([png, makeFile('b.txt', 'text/plain')]);
        expect(dropzone.getSnapshot().files).toEqual([png]);
        expect(dropzone.getSnapshot().rejections[0]?.codes).toEqual(['type']);
        expect(onChange).toHaveBeenCalledWith([png]);
        expect(onReject).toHaveBeenCalledTimes(1);
        dropzone.remove(png);
        expect(dropzone.getSnapshot().files).toEqual([]);
        expect(onChange).toHaveBeenLastCalledWith([]);
        dropzone.dismissRejections();
        expect(dropzone.getSnapshot().rejections).toEqual([]);
    });

    it('counts nested drag events so it does not flicker', () => {
        const dropzone = createDropzone({ accept: 'image/*' });
        dropzone.dragEnter([{ kind: 'file', type: 'image/png' }]);
        dropzone.dragEnter([{ kind: 'file', type: 'image/png' }]);
        dropzone.dragLeave();
        expect(dropzone.getSnapshot()).toMatchObject({ dragging: true, dragStatus: 'accept' });
        dropzone.dragLeave();
        expect(dropzone.getSnapshot()).toMatchObject({ dragging: false, dragStatus: null });
        dropzone.dragEnter([{ kind: 'file', type: 'image/png' }]);
        dropzone.drop([makeFile('a.png', 'image/png')]);
        expect(dropzone.getSnapshot()).toMatchObject({ dragging: false, files: [expect.any(File)] });
    });

    it('ignores everything while disabled', () => {
        const dropzone = createDropzone({ disabled: true });
        dropzone.dragEnter();
        expect(dropzone.add([makeFile('a.png', 'image/png')])).toBeNull();
        expect(dropzone.getSnapshot()).toMatchObject({ dragging: false, files: [] });
    });

    it('syncs controlled files without callbacks and keeps the snapshot when equal', () => {
        const onChange = vi.fn();
        const file = makeFile('a.png', 'image/png');
        const dropzone = createDropzone({ files: [file], onChange });
        const before = dropzone.getSnapshot();
        dropzone.setFiles([file]);
        expect(dropzone.getSnapshot()).toBe(before);
        dropzone.setFiles([]);
        expect(dropzone.getSnapshot().files).toEqual([]);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('reports when full', () => {
        const dropzone = createDropzone({ multiple: true, maxFiles: 1 });
        dropzone.add([makeFile('a.png', 'image/png')]);
        expect(dropzone.getSnapshot().full).toBe(true);
    });

    it('creates previews on demand and revokes them', () => {
        const create = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:x');
        const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
        const dropzone = createDropzone({ multiple: true });
        const file = makeFile('a.png', 'image/png');
        dropzone.add([file]);
        expect(dropzone.previewUrl(file)).toBe('blob:x');
        expect(dropzone.previewUrl(file)).toBe('blob:x');
        expect(create).toHaveBeenCalledTimes(1);
        dropzone.remove(0);
        expect(revoke).toHaveBeenCalledWith('blob:x');
        dropzone.add([file]);
        dropzone.previewUrl(file);
        const listener = vi.fn();
        dropzone.subscribe(listener);
        dropzone.destroy();
        expect(revoke).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
