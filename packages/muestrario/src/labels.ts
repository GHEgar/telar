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
    noResults: 'Sin resultados',
    loading: 'Buscando…',
    error: 'No se pudo cargar la lista',
    clear: 'Limpiar',
    remove: 'Quitar',
    create: (text) => `Crear «${text}»`,
    typeMore: (minChars) => `Escribe al menos ${minChars} ${minChars === 1 ? 'letra' : 'letras'}`,
    results: (count) => `${count} ${count === 1 ? 'resultado' : 'resultados'}`,
};
