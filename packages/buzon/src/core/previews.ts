export interface Previews {
    get(file: File): string | null;
    revoke(file: File): void;
    keep(files: readonly File[]): void;
    revokeAll(): boolean;
}

export const createPreviews = (): Previews => {
    const urls = new Map<File, string>();
    const supported = (): boolean => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    const revoke = (file: File): void => {
        const url = urls.get(file);
        if (url === undefined) return;
        URL.revokeObjectURL(url);
        urls.delete(file);
    };
    return {
        get(file) {
            const existing = urls.get(file);
            if (existing !== undefined) return existing;
            if (!supported()) return null;
            const url = URL.createObjectURL(file);
            urls.set(file, url);
            return url;
        },
        revoke,
        keep(files) {
            [...urls.keys()].filter((file) => !files.includes(file)).forEach(revoke);
        },
        revokeAll() {
            const had = urls.size > 0;
            [...urls.keys()].forEach(revoke);
            return had;
        },
    };
};
