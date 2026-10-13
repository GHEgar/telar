export type Accept = string | readonly string[];

export interface AcceptRules {
    extensions: string[];
    mimes: string[];
    wildcards: string[];
}

export interface FileLike {
    name: string;
    type: string;
}

const KNOWN: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/svg+xml': 'SVG',
    'application/pdf': 'PDF',
    'text/plain': 'TXT',
    'text/csv': 'CSV',
    'application/zip': 'ZIP',
    'application/json': 'JSON',
    'application/msword': 'DOC',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
};

export const DEFAULT_KINDS: Readonly<Record<string, string>> = {
    image: 'imágenes',
    video: 'videos',
    audio: 'audio',
    text: 'texto',
};

const tokens = (accept: Accept): string[] => (typeof accept === 'string' ? accept.split(',') : [...accept])
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

export const parseAccept = (accept: Accept | null | undefined): AcceptRules | null => {
    if (!accept) return null;
    const rules: AcceptRules = { extensions: [], mimes: [], wildcards: [] };
    for (const token of tokens(accept)) {
        if (token === '*' || token === '*/*') return null;
        if (token.startsWith('.')) rules.extensions.push(token);
        else if (token.endsWith('/*')) rules.wildcards.push(token.slice(0, -1));
        else if (token.includes('/')) rules.mimes.push(token);
    }
    return rules.extensions.length + rules.mimes.length + rules.wildcards.length ? rules : null;
};

export const matchesMime = (type: string, rules: AcceptRules): boolean => {
    const mime = type.toLowerCase();
    return !!mime && (rules.mimes.includes(mime) || rules.wildcards.some((prefix) => mime.startsWith(prefix)));
};

export const matchesAccept = (file: FileLike, rules: AcceptRules | null): boolean => {
    if (!rules) return true;
    const name = file.name.toLowerCase();
    return rules.extensions.some((extension) => name.endsWith(extension)) || matchesMime(file.type, rules);
};

const mimeLabel = (mime: string): string => {
    const known = KNOWN[mime];
    if (known) return known;
    const subtype = mime.split('/')[1] ?? mime;
    return (subtype.split(/[.+-]/).pop() ?? subtype).toUpperCase();
};

export const describeAccept = (
    accept: Accept | null | undefined,
    locale = 'es-MX',
    kinds: Readonly<Record<string, string>> = DEFAULT_KINDS,
): string => {
    if (!accept) return '';
    const labels = tokens(accept).map((token) => {
        if (token.startsWith('.')) return token.slice(1).toUpperCase();
        if (token.endsWith('/*')) {
            const kind = token.slice(0, -2);
            return kinds[kind] ?? token;
        }
        return mimeLabel(token);
    });
    return new Intl.ListFormat(locale, { type: 'disjunction' }).format([...new Set(labels)]);
};
