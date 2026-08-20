import { FRAG, VERT } from './shaders';

/**
 * Plain WebGL renderer for the orb — no React in here. `createJarvisRenderer`
 * mounts a canvas into the given container, compiles the shaders, runs the
 * requestAnimationFrame loop and returns a `dispose` function that tears
 * everything down (listeners, rAF, canvas, GL context).
 */

export type CoreState = 'idle' | 'listening' | 'generating';

export interface JarvisRendererOptions {
  /** Hue rotation in degrees applied on top of the base cyan palette. */
  hue: number;
  /**
   * Read once per frame, so the loop always sees the latest state without
   * the caller having to restart the renderer.
   */
  getState: () => CoreState;
}

// Typing in the composer drives a *subtle* listening level — the orb perks up
// but doesn't go full intensity. Hovering still wakes it up fully so the
// visual remains explorable.
const TYPING_LISTENING_LEVEL = 0.7;
// Per-frame easing toward the target levels. Snappy enough that the orb
// visibly reacts the moment you type / send.
const SMOOTHING = 0.12;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function createJarvisRenderer(
  container: HTMLElement,
  { hue, getState }: JarvisRendererOptions,
): (() => void) | null {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
  });
  if (!gl) return null;
  container.appendChild(canvas);

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Fullscreen triangle
  const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'iTime');
  const uRes = gl.getUniformLocation(program, 'iResolution');
  const uHue = gl.getUniformLocation(program, 'hue');
  const uListening = gl.getUniformLocation(program, 'listening');
  const uGenerating = gl.getUniformLocation(program, 'generating');

  // Hue is fixed for the lifetime of the renderer; resolution only changes on
  // resize. Neither needs re-uploading every frame.
  gl.uniform1f(uHue, hue);

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * dpr;
    canvas.height = container.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform3f(uRes, canvas.width, canvas.height, canvas.width / canvas.height);
  };
  window.addEventListener('resize', resize);
  resize();

  let hoverListening = 0;
  let currentListening = 0;
  let currentGenerating = 0;

  const handleMouseEnter = () => {
    hoverListening = 1;
  };
  const handleMouseLeave = () => {
    hoverListening = 0;
  };
  container.addEventListener('mouseenter', handleMouseEnter);
  container.addEventListener('mouseleave', handleMouseLeave);

  // Under prefers-reduced-motion the orb goes nearly still: state changes still
  // ease in, but the ambient spin/pulse advances at a twentieth of real time.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let rafId = 0;
  let simTime = 0;
  let lastT: number | null = null;
  const render = (t: number) => {
    rafId = requestAnimationFrame(render);
    simTime += lastT === null ? 0 : (t - lastT) * (reducedMotion.matches ? 0.05 : 1);
    lastT = t;

    // Map the declarative state into two target floats, then smooth.
    const state = getState();
    const targetListening = Math.max(
      hoverListening,
      state === 'listening' ? TYPING_LISTENING_LEVEL : 0,
    );
    const targetGenerating = state === 'generating' ? 1 : 0;
    currentListening += (targetListening - currentListening) * SMOOTHING;
    currentGenerating += (targetGenerating - currentGenerating) * SMOOTHING;

    gl.uniform1f(uTime, simTime * 0.001);
    gl.uniform1f(uListening, currentListening);
    gl.uniform1f(uGenerating, currentGenerating);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  rafId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    container.removeEventListener('mouseenter', handleMouseEnter);
    container.removeEventListener('mouseleave', handleMouseLeave);
    if (canvas.parentNode === container) container.removeChild(canvas);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
