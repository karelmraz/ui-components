import { useEffect, useRef, useState, type RefObject } from 'react';

/** Space between the anchor's edge and the tooltip */
const GAP = 12;
/** Room the tooltip needs below the anchor before it flips above it (≈ tallest tooltip) */
const FLIP_THRESHOLD = 280;

/** `position: fixed` coordinates for a tooltip centered on its anchor */
export interface TooltipPlacement {
  top: number;
  left: number;
  transform: string;
}

export interface AnchoredTooltip<T extends HTMLElement> {
  anchorRef: RefObject<T | null>;
  open: boolean;
  show: () => void;
  hide: () => void;
  /** null while closed or before the first measurement */
  placement: TooltipPlacement | null;
}

function placeTooltip(anchor: DOMRect): TooltipPlacement {
  const flip = anchor.bottom > window.innerHeight - FLIP_THRESHOLD;
  return {
    top: flip ? anchor.top - GAP : anchor.bottom + GAP,
    left: anchor.left + anchor.width / 2,
    transform: flip ? 'translate(-50%, -100%)' : 'translateX(-50%)',
  };
}

/**
 * Hover/focus tooltip state anchored to a DOM element. While open, the anchor is
 * re-measured on scroll and resize so a portaled, fixed-position tooltip stays glued to it.
 */
export function useAnchoredTooltip<T extends HTMLElement>(): AnchoredTooltip<T> {
  const anchorRef = useRef<T>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      if (anchorRef.current) setAnchorRect(anchorRef.current.getBoundingClientRect());
    };
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  return {
    anchorRef,
    open,
    show: () => setOpen(true),
    hide: () => setOpen(false),
    placement: open && anchorRect ? placeTooltip(anchorRect) : null,
  };
}
