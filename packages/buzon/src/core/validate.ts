import { matchesAccept, parseAccept } from './accept.js';
import type { FileRejection, RejectionCode, ValidationOptions, ValidationResult } from './types.js';

export const isSameFile = (a: File, b: File): boolean => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

export const validateFiles = (
    incoming: readonly File[],
    current: readonly File[],
    options: ValidationOptions = {},
): ValidationResult => {
    const rules = parseAccept(options.accept);
    const multiple = options.multiple ?? false;
    const base = multiple ? [...current] : [];
    const limit = multiple ? options.maxFiles ?? Number.POSITIVE_INFINITY : 1;
    const accepted: File[] = [];
    const rejections: FileRejection[] = [];
    for (const file of incoming) {
        const codes: RejectionCode[] = [];
        let message: string | undefined;
        if (!matchesAccept(file, rules)) codes.push('type');
        if ((options.maxSize !== undefined && file.size > options.maxSize) || (options.minSize !== undefined && file.size < options.minSize)) {
            codes.push('size');
        }
        if (!options.allowDuplicates && [...base, ...accepted].some((other) => isSameFile(other, file))) codes.push('duplicate');
        if (!codes.length && options.validate) {
            const result = options.validate(file, [...base, ...accepted]);
            if (result) {
                codes.push('custom');
                message = result;
            }
        }
        if (!codes.length && base.length + accepted.length >= limit) codes.push('count');
        if (codes.length) rejections.push(message === undefined ? { file, codes } : { file, codes, message });
        else accepted.push(file);
    }
    const files = accepted.length || multiple ? [...base, ...accepted] : [...current];
    return { files, accepted, rejections };
};
