export interface EscapeLayerLike {
    id: string;
    priority: number;
    onEscape: (event: KeyboardEvent) => unknown;
}

export interface EscapeStackLike {
    push(layer: EscapeLayerLike): () => void;
}

export const MENU_ESCAPE_PRIORITY = 200;
