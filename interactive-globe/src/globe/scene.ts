import * as THREE from 'three';
import { createCameraRig } from './camera';
import { AMBIENT_ARC_DELAY, AMBIENT_ARC_JITTER, ARC_BURST, FIRST_ARC_AT } from './constants';
import { createControls, idleSpin } from './controls';
import { createEnv } from './env';
import { HUBS, hubLabel } from './hubs';
import { createArcs } from './layers/arcs';
import { createAtmosphere } from './layers/atmosphere';
import { createCoastlines } from './layers/coastlines';
import { createGraticule } from './layers/graticule';
import { createHubMarkers } from './layers/hub-markers';
import { createLandDots } from './layers/land-dots';
import { createRipples } from './layers/ripples';
import { createSphere } from './layers/sphere';
import { createStarfield } from './layers/starfield';
import { randomIndex } from './math';
import { createRenderer } from './renderer';
import { createTooltip } from './tooltip';
import type { Theme } from '../theme';

export type GlobeScene = {
  applyTheme(theme: Theme): void;
  zoomStep(direction: number): void;
  dispose(): void;
};

type SceneOptions = {
  host: HTMLElement;
  tooltip: HTMLElement;
  theme: Theme;
};

export function createGlobeScene({
  host,
  tooltip: tooltipEl,
  theme,
}: SceneOptions): GlobeScene | null {
  const renderer = createRenderer(host);
  if (!renderer) return null;

  const env = createEnv(theme, renderer.getPixelRatio());
  const scene = new THREE.Scene();
  const rig = createCameraRig(env);
  const tooltip = createTooltip(tooltipEl);
  const clock = new THREE.Clock();

  const globe = new THREE.Group();
  globe.rotation.set(0.26, -0.9, 0);
  scene.add(globe);

  const sphere = createSphere(theme);
  const graticule = createGraticule(theme, env);
  const coastlines = createCoastlines(theme, env);
  const landDots = createLandDots(theme, env);
  const hubs = createHubMarkers(theme, env);
  const arcs = createArcs(theme, env);
  const ripples = createRipples(env);
  globe.add(
    sphere.object,
    graticule.object,
    coastlines.object,
    landDots.object,
    hubs.object,
    arcs.object,
    ripples.object,
  );

  const atmosphere = env.isLight ? null : createAtmosphere(theme);
  const starfield = env.isLight ? null : createStarfield(env);
  if (atmosphere) scene.add(atmosphere.object);
  if (starfield) scene.add(starfield.object);

  let current = theme;

  const burst = (fromHub: number, now: number) => {
    for (let i = 0; i < ARC_BURST; i++) arcs.launch(fromHub, randomIndex(HUBS.length), now);
    ripples.spawn(hubs.positionOf(fromHub), current.ripple, now);
  };

  const controls = createControls({
    canvas: renderer.domElement,
    host,
    globe,
    autoSpin: idleSpin(env.reduceMotion),
    onTap: () => {
      const now = clock.getElapsedTime();
      burst(hubs.hovered >= 0 ? hubs.hovered : randomIndex(HUBS.length), now);
    },
    onZoom: (delta) => rig.zoomBy(delta),
  });

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    rig.resize(width, height);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  let frame = 0;
  let previous = 0;
  let nextArcAt = FIRST_ARC_AT;
  let hovered = -1;

  const tick = () => {
    frame = requestAnimationFrame(tick);

    const time = clock.getElapsedTime();
    const dt = Math.min(time - previous, 0.05);
    previous = time;

    controls.update(dt);
    rig.update(dt);
    landDots.update(time);
    starfield?.update(time, dt);

    if (time > nextArcAt) {
      arcs.launch(randomIndex(HUBS.length), randomIndex(HUBS.length), time);
      nextArcAt = time + AMBIENT_ARC_DELAY + Math.random() * AMBIENT_ARC_JITTER;
    }

    arcs.update(time, (at, color) => ripples.spawn(at, color, time));
    ripples.update(time);

    const width = host.clientWidth;
    const height = host.clientHeight;
    const next = hubs.update({
      time,
      camera: rig.camera,
      width,
      height,
      pointer: controls.pointer,
      interactive: !controls.dragging,
    });

    if (next !== hovered) {
      hovered = next;
      if (hovered >= 0) tooltip.show(hubLabel(hovered));
      else tooltip.hide();
      controls.setHovering(hovered >= 0);
    }
    if (hovered >= 0) {
      const { x, y } = hubs.screenPositionOf(hovered, rig.camera, width, height);
      tooltip.moveTo(x, y);
    }

    renderer.render(scene, rig.camera);
  };
  frame = requestAnimationFrame(tick);

  return {
    applyTheme(next: Theme) {
      current = next;
      sphere.applyTheme(next);
      graticule.applyTheme(next);
      coastlines.applyTheme(next);
      landDots.applyTheme(next);
      hubs.applyTheme(next);
      arcs.applyTheme(next);
      atmosphere?.applyTheme(next);
    },

    zoomStep: rig.zoomStep,

    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      for (const layer of [
        sphere,
        graticule,
        coastlines,
        landDots,
        hubs,
        arcs,
        ripples,
        atmosphere,
        starfield,
      ]) {
        layer?.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
