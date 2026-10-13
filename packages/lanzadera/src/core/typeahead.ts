export interface Typeahead {
    match(key: string, current: number, labels: (index: number) => string, count: number, isDisabled?: (index: number) => boolean): number | null;
    reset(): void;
}

const normalize = (text: string): string => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();

export const createTypeahead = (timeout = 500, now: () => number = () => Date.now()): Typeahead => {
    let query = '';
    let last = 0;
    return {
        match(key, current, labels, count, isDisabled) {
            if (key.length !== 1 || key === ' ') return null;
            const time = now();
            query = time - last > timeout ? key : query + key;
            last = time;
            const needle = normalize(query);
            const repeated = needle.length > 1 && [...needle].every((char) => char === needle[0]);
            const search = repeated ? needle[0] ?? '' : needle;
            const start = repeated || needle.length === 1 ? current + 1 : current;
            for (let offset = 0; offset < count; offset += 1) {
                const index = (start + offset) % count;
                if (!isDisabled?.(index) && normalize(labels(index)).startsWith(search)) return index;
            }
            return null;
        },
        reset() {
            query = '';
            last = 0;
        },
    };
};
