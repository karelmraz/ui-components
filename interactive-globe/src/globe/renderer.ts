import * as THREE from 'three';

const CANVAS_CLASS = [
  'absolute inset-0 h-full w-full cursor-grab touch-none',
  'opacity-0 transition-opacity delay-150 duration-[900ms] ease-out',
  '[mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.35)_13%,#000_36%,#000_90%,transparent_100%)]',
  '[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.35)_13%,#000_36%,#000_90%,transparent_100%)]',
].join(' ');

function supportsWebGL() {
  const probe = document.createElement('canvas');
  return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
}

export function createRenderer(host: HTMLElement) {
  if (!supportsWebGL()) return null;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = CANVAS_CLASS;
  host.appendChild(renderer.domElement);
  requestAnimationFrame(() => renderer.domElement.classList.replace('opacity-0', 'opacity-100'));

  return renderer;
}
