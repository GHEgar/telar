export interface ComboboxLabels {
    noResults: string;
    loading: string;
    error: string;
    clear: string;
    remove: string;
    create(text: string): string;
    typeMore(minChars: number): string;
    results(count: number): string;
}

export const DEFAULT_LABELS: ComboboxLabels = {
    noResults: 'No results',
    loading: 'Searching…',
    error: 'Could not load the list',
    clear: 'Clear',
    remove: 'Remove',
    create: (text) => `Create “${text}”`,
    typeMore: (minChars) => `Type at least ${minChars} ${minChars === 1 ? 'character' : 'characters'}`,
    results: (count) => `${count} ${count === 1 ? 'result' : 'results'}`,
};
