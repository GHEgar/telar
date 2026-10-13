import { matchesMime, type AcceptRules } from './accept.js';
import type { DragItem, DragStatus } from './types.js';

const judgeItem = (item: DragItem, rules: AcceptRules): DragStatus => {
    if (!item.type) return 'unknown';
    if (matchesMime(item.type, rules)) return 'accept';
    return rules.extensions.length ? 'unknown' : 'reject';
};

export const judgeDrag = (items: readonly DragItem[], rules: AcceptRules | null): DragStatus => {
    if (!items.length) return 'unknown';
    const files = items.filter((item) => item.kind === 'file');
    if (!files.length) return 'reject';
    if (!rules) return 'accept';
    const verdicts = files.map((item) => judgeItem(item, rules));
    if (verdicts.every((verdict) => verdict === 'accept')) return 'accept';
    if (verdicts.every((verdict) => verdict === 'reject')) return 'reject';
    return 'unknown';
};
