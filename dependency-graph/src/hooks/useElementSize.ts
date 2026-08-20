import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/** Rendered size of an element: measured synchronously on mount, then kept in sync by a ResizeObserver */
export function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, ElementSize] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (width: number, height: number) => {
      // Bail out on identical dimensions so observer ticks don't re-render the tree
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };
    // Get initial size synchronously
    const rect = el.getBoundingClientRect();
    update(rect.width, rect.height);
    // Then observe for changes
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      update(width, height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}
