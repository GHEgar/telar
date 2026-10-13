import { useCallback, useEffect, useState, type CSSProperties, type RefCallback, type UIEvent } from 'react';

export interface VirtualOptions {
    itemHeight: number;
    overscan?: number;
    height?: number;
}

export interface VirtualItem {
    index: number;
    style: CSSProperties;
}

export interface Virtual {
    items: VirtualItem[];
    totalHeight: number;
    scrollerRef: RefCallback<HTMLElement>;
    onScroll: (event: UIEvent<HTMLElement>) => void;
    sizerStyle: CSSProperties;
}

export const virtualRange = (count: number, itemHeight: number, height: number, scrollTop: number, overscan: number): [number, number] => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(count, Math.ceil((scrollTop + height) / itemHeight) + overscan);
    return [start, Math.max(start, end)];
};

export const useVirtual = (options: VirtualOptions | undefined, count: number, activeIndex: number): Virtual | null => {
    const [scroller, setScroller] = useState<HTMLElement | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [measured, setMeasured] = useState(0);
    const itemHeight = options?.itemHeight ?? 1;

    const scrollerRef = useCallback((element: HTMLElement | null) => {
        setScroller(element);
        if (element) setMeasured(element.clientHeight);
    }, []);

    useEffect(() => {
        if (!scroller || activeIndex < 0) return;
        const top = activeIndex * itemHeight;
        const view = scroller.clientHeight || options?.height || 0;
        if (top < scroller.scrollTop) scroller.scrollTo({ top });
        else if (top + itemHeight > scroller.scrollTop + view) scroller.scrollTo({ top: top + itemHeight - view });
    }, [scroller, activeIndex, itemHeight, options?.height]);

    if (!options) return null;
    const height = measured || options.height || 300;
    const [start, end] = virtualRange(count, itemHeight, height, scrollTop, options.overscan ?? 4);
    const items: VirtualItem[] = [];
    for (let index = start; index < end; index += 1) {
        items.push({ index, style: { position: 'absolute', top: index * itemHeight, left: 0, right: 0, height: itemHeight } });
    }
    return {
        items,
        totalHeight: count * itemHeight,
        scrollerRef,
        onScroll: (event) => setScrollTop(event.currentTarget.scrollTop),
        sizerStyle: { height: count * itemHeight },
    };
};
