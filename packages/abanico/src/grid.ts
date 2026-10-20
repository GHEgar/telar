export interface Box {
    left: number;
    top: number;
    width: number;
    height: number;
}

const TOLERANCE = 1;

export const verticalNeighbor = (
    boxes: ReadonlyArray<Box | undefined>,
    from: number,
    direction: 1 | -1,
    isDisabled?: (index: number) => boolean,
): number | null => {
    const origin = boxes[from];
    if (!origin || (origin.width === 0 && origin.height === 0)) return null;
    const x = origin.left + origin.width / 2;
    const y = origin.top + origin.height / 2;
    let best: number | null = null;
    let bestRow = Number.POSITIVE_INFINITY;
    let bestColumn = Number.POSITIVE_INFINITY;
    boxes.forEach((box, index) => {
        if (!box || index === from || isDisabled?.(index)) return;
        const row = (box.top + box.height / 2 - y) * direction;
        if (row < Math.min(origin.height, box.height) / 2) return;
        const column = Math.abs(box.left + box.width / 2 - x);
        const closerRow = row < bestRow - TOLERANCE;
        const sameRow = Math.abs(row - bestRow) <= TOLERANCE;
        if (closerRow || (sameRow && column < bestColumn)) {
            best = index;
            bestRow = closerRow ? row : Math.min(row, bestRow);
            bestColumn = column;
        }
    });
    return best;
};
