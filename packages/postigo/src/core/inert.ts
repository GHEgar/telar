const counts = new Map<Element, number>();

const siblingsUpToBody = (element: Element): Element[] => {
    const targets: Element[] = [];
    let node: Element | null = element;
    while (node && node !== document.body) {
        const parent: Element | null = node.parentElement;
        if (!parent) break;
        for (const sibling of Array.from(parent.children)) {
            if (sibling !== node && !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(sibling.tagName)) targets.push(sibling);
        }
        node = parent;
    }
    return targets;
};

export const inertOthers = (element: Element): (() => void) => {
    const targets = siblingsUpToBody(element).filter((target) => counts.has(target) || !target.hasAttribute('inert'));
    for (const target of targets) {
        counts.set(target, (counts.get(target) ?? 0) + 1);
        target.setAttribute('inert', '');
    }
    let released = false;
    return () => {
        if (released) return;
        released = true;
        for (const target of targets) {
            const count = (counts.get(target) ?? 1) - 1;
            if (count > 0) {
                counts.set(target, count);
                continue;
            }
            counts.delete(target);
            target.removeAttribute('inert');
        }
    };
};
