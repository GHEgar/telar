import { describe, expect, it } from 'vitest';
import { validateFiles } from '@npmegar/buzon';
import { makeFile } from './helpers.js';

describe('validateFiles', () => {
    it('rejects by type and size with every reason', () => {
        const big = makeFile('big.txt', 'text/plain', 50);
        const result = validateFiles([makeFile('a.png', 'image/png'), big], [], { accept: 'image/*', maxSize: 20, multiple: true });
        expect(result.accepted.map((file) => file.name)).toEqual(['a.png']);
        expect(result.rejections).toEqual([{ file: big, codes: ['type', 'size'] }]);
        expect(validateFiles([makeFile('tiny.png', 'image/png', 1)], [], { minSize: 5 }).rejections[0]?.codes).toEqual(['size']);
    });

    it('accumulates up to maxFiles in arrival order', () => {
        const current = [makeFile('1.png', 'image/png', 10, 1)];
        const incoming = ['2', '3', '4'].map((name, index) => makeFile(`${name}.png`, 'image/png', 10, index + 2));
        const result = validateFiles(incoming, current, { multiple: true, maxFiles: 3 });
        expect(result.files.map((file) => file.name)).toEqual(['1.png', '2.png', '3.png']);
        expect(result.rejections.map((rejection) => [rejection.file.name, rejection.codes])).toEqual([['4.png', ['count']]]);
    });

    it('replaces without multiple and keeps the old file when nothing passes', () => {
        const old = makeFile('old.pdf', 'application/pdf');
        expect(validateFiles([makeFile('new.pdf', 'application/pdf', 5), makeFile('extra.pdf', 'application/pdf', 6)], [old]).files.map((file) => file.name))
            .toEqual(['new.pdf']);
        expect(validateFiles([makeFile('x.exe', 'application/octet-stream')], [old], { accept: '.pdf' }).files).toEqual([old]);
    });

    it('rejects duplicates unless allowed', () => {
        const file = makeFile('a.png', 'image/png');
        const copy = makeFile('a.png', 'image/png');
        expect(validateFiles([copy], [file], { multiple: true }).rejections[0]?.codes).toEqual(['duplicate']);
        expect(validateFiles([file, copy], [], { multiple: true }).accepted).toHaveLength(1);
        expect(validateFiles([copy], [file], { multiple: true, allowDuplicates: true }).accepted).toHaveLength(1);
    });

    it('runs the custom validator last', () => {
        const validate = (file: File): string | null => (file.name.startsWith('tmp') ? 'Sin temporales' : null);
        const result = validateFiles([makeFile('tmp.png', 'image/png'), makeFile('ok.png', 'image/png')], [], { multiple: true, validate });
        expect(result.rejections[0]).toMatchObject({ codes: ['custom'], message: 'Sin temporales' });
        expect(result.accepted.map((file) => file.name)).toEqual(['ok.png']);
    });
});
