import { useEffect, useRef } from 'react';
import { createJarvisRenderer, type CoreState } from './renderer';

export type { CoreState } from './renderer';

/**
 * JarvisCore — a holographic AI-core visual rendered in WebGL.
 *
 * Stacks its effects in a single fragment shader (see ./shaders.ts):
 *   1. A pulsing central glow ("the core") inside a soft outer aura
 *   2. Crisp instrument rings, plus rotating dashed and binary data rings
 *   3. Fine radial tick graduations and bright gauge arcs
 *   4. Radar sweep rays with trailing tails
 *   5. Pulse waves broadcast outward while generating
 *
 * Hovering the canvas drives a `listening` uniform from 0 → 1 (smoothed),
 * which boosts core brightness and ring energy — the orb "wakes up"
 * when you point at it.
 *
 * This component is only the React shell: it owns the container element and
 * the renderer's lifecycle; the WebGL work lives in ./renderer.ts.
 */

interface JarvisCoreProps {
  /** Hue rotation in degrees applied on top of the base cyan palette. */
  hue?: number;
  /**
   * Drives the orb's visual energy:
   *   - 'idle'        gentle ambient pulse
   *   - 'listening'   wakes up, halo and ring energy rise
   *   - 'generating'  fully active — fast sweep, bright core, max amplitude
   */
  state?: CoreState;
  className?: string;
}

export function JarvisCore({ hue = 0, state = 'idle', className }: JarvisCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the latest state in a ref so the render loop can read it without
  // restarting the WebGL context every time the parent re-renders.
  const stateRef = useRef<CoreState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const dispose = createJarvisRenderer(container, {
      hue,
      getState: () => stateRef.current,
    });
    return dispose ?? undefined;
  }, [hue]);

  return <div ref={containerRef} className={`relative z-0 ${className ?? ''}`} />;
}
