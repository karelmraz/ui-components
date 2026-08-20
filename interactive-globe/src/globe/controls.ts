import * as THREE from 'three';
import { AUTO_SPIN, DRAG_THRESHOLD, SPIN_DECAY, WHEEL_ZOOM } from './constants';

const CURSORS = ['cursor-grab', 'cursor-grabbing', 'cursor-pointer'] as const;

const OFFSCREEN = -1e4;

type ControlsOptions = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  globe: THREE.Object3D;
  autoSpin: number;
  onTap: () => void;
  onZoom: (delta: number) => void;
};

export function createControls({ canvas, host, globe, autoSpin, onTap, onZoom }: ControlsOptions) {
  const pointer = { x: OFFSCREEN, y: OFFSCREEN };

  let dragging = false;
  let hovering = false;
  let travelled = 0;
  let lastX = 0;
  let lastY = 0;
  let spin = 0;

  const setCursor = (cursor: (typeof CURSORS)[number]) => {
    canvas.classList.remove(...CURSORS);
    canvas.classList.add(cursor);
  };

  const restCursor = () => setCursor(hovering ? 'cursor-pointer' : 'cursor-grab');

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    travelled = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    spin = 0;
    canvas.setPointerCapture(event.pointerId);
    setCursor('cursor-grabbing');
  };

  const onPointerMove = (event: PointerEvent) => {
    const bounds = host.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    if (!dragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    travelled += Math.abs(dx) + Math.abs(dy);

    globe.rotation.y += dx * 0.005;
    globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + dy * 0.0032, -0.7, 0.8);
    spin = dx * 0.0045;
  };

  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    canvas.releasePointerCapture(event.pointerId);
    restCursor();
    if (travelled < DRAG_THRESHOLD) onTap();
  };

  const onPointerLeave = () => {
    pointer.x = OFFSCREEN;
    pointer.y = OFFSCREEN;
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    onZoom(event.deltaY * WHEEL_ZOOM);
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  return {
    pointer,

    get dragging() {
      return dragging;
    },

    setHovering(next: boolean) {
      hovering = next;
      if (!dragging) restCursor();
    },

    update(dt: number) {
      if (dragging) return;
      globe.rotation.y += spin + autoSpin * dt;
      spin *= Math.pow(SPIN_DECAY, dt);
    },

    dispose() {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('wheel', onWheel);
    },
  };
}

export const idleSpin = (reduceMotion: boolean) => (reduceMotion ? 0 : AUTO_SPIN);
