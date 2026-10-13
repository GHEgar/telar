export interface Segment {
    text: string;
    match: boolean;
}

export interface Group<T> {
    label: string;
    options: { item: T; index: number }[];
}

const fold = (char: string): string => char.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();

export const normalize = (text: string): string => fold(text).trim();

export const matches = (label: string, query: string): boolean => normalize(label).includes(normalize(query));

export const filterItems = <T>(items: readonly T[], query: string, getLabel: (item: T) => string): T[] => (normalize(query)
    ? items.filter((item) => matches(getLabel(item), query))
    : [...items]);

export const highlight = (label: string, query: string): Segment[] => {
    const needle = normalize(query);
    if (!needle) return [{ text: label, match: false }];
    const chars = Array.from(label);
    const folded: string[] = [];
    const owner: number[] = [];
    chars.forEach((char, index) => {
        for (const part of fold(char)) {
            folded.push(part);
            owner.push(index);
        }
    });
    const haystack = folded.join('');
    const marked = new Array<boolean>(chars.length).fill(false);
    let from = haystack.indexOf(needle);
    while (from >= 0) {
        for (let index = from; index < from + needle.length; index += 1) marked[owner[index] ?? 0] = true;
        from = haystack.indexOf(needle, from + needle.length);
    }
    const segments: Segment[] = [];
    chars.forEach((char, index) => {
        const match = marked[index] ?? false;
        const last = segments.at(-1);
        if (last && last.match === match) last.text += char;
        else segments.push({ text: char, match });
    });
    return segments;
};

export const groupItems = <T>(items: readonly T[], groupBy: (item: T) => string): Group<T>[] => {
    const groups: Group<T>[] = [];
    for (const item of items) {
        const label = groupBy(item);
        let group = groups.find((candidate) => candidate.label === label);
        if (!group) {
            group = { label, options: [] };
            groups.push(group);
        }
        group.options.push({ item, index: -1 });
    }
    let index = 0;
    for (const group of groups) for (const option of group.options) option.index = index++;
    return groups;
};
