export interface SortableLabels {
    handle(label: string): string;
    instructions: string;
    grabbed(label: string, position: number, count: number): string;
    moved(label: string, position: number, count: number): string;
    dropped(label: string, position: number, count: number): string;
    cancelled(label: string, position: number, count: number): string;
}

export const DEFAULT_LABELS: SortableLabels = {
    handle: (label) => `Reorder ${label}`,
    instructions: 'Press Space to pick up. Use the arrow keys to move, Space to drop and Escape to cancel.',
    grabbed: (label, position, count) => `Picked up ${label}. Position ${position} of ${count}.`,
    moved: (label, position, count) => `${label} moved to position ${position} of ${count}.`,
    dropped: (label, position, count) => `${label} dropped at position ${position} of ${count}.`,
    cancelled: (label, position, count) => `Reorder cancelled. ${label} is back at position ${position} of ${count}.`,
};
