import type { Span } from './geometry.js';
import type { SortableLabels } from './labels.js';

export type SortMode = 'keyboard' | 'pointer';

export interface SortableOptions {
    count: number;
    onReorder?: (from: number, to: number) => void;
    getLabel?: (index: number) => string;
    labels?: Partial<SortableLabels>;
}

export interface SortableSnapshot {
    active: number | null;
    over: number | null;
    mode: SortMode | null;
    offsets: readonly number[];
    announcement: string;
}

export interface Move {
    from: number;
    to: number;
}

export interface Sortable {
    subscribe(listener: () => void): () => void;
    getSnapshot(): SortableSnapshot;
    grab(index: number, mode: SortMode, spans?: readonly Span[]): boolean;
    move(to: number): void;
    moveBy(by: number): void;
    moveToEdge(edge: 'start' | 'end'): void;
    drag(delta: number): void;
    drop(): Move | null;
    cancel(): void;
    update(patch: Partial<SortableOptions>): void;
}
