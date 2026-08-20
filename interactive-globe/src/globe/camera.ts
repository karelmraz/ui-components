import * as THREE from 'three';
import { LG_BREAKPOINT, R, ZOOM_MAX, ZOOM_MIN, ZOOM_SMOOTHING, ZOOM_STEP } from './constants';
import type { GlobeEnv } from './env';

const splitLayout = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);

const SETTLED = 1e-4;

export function createCameraRig(env: GlobeEnv) {
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(0, 0, 3.2);

  const framedRadius = R * (env.isLight ? 1.5 : 1.62);
  let fitDistance = camera.position.z;
  let zoom = 1;
  let target = 1;

  const place = () => {
    camera.position.z = fitDistance * zoom;
  };

  const aim = (next: number) => {
    target = THREE.MathUtils.clamp(next, ZOOM_MIN, ZOOM_MAX);
    if (env.reduceMotion) {
      zoom = target;
      place();
    }
  };

  return {
    camera,

    resize(width: number, height: number) {
      camera.aspect = width / height;

      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const fitToHeight = framedRadius / Math.tan(halfFov);
      const fitToWidth = framedRadius / (Math.tan(halfFov) * camera.aspect);
      fitDistance = Math.max(fitToHeight, fitToWidth);

      const split = splitLayout.matches;
      const shiftX = split ? width * 0.16 : 0;
      const shiftY = split ? height * 0.05 : height * 0.37;
      camera.setViewOffset(width, height, -shiftX, -shiftY, width, height);

      place();
      camera.updateProjectionMatrix();
    },

    // Ease the camera toward the zoom target instead of teleporting to it, so a
    // wheel flick or a button press reads as one continuous push rather than a
    // stack of discrete jumps. Exponential decay, so it is framerate-independent.
    update(dt: number) {
      if (zoom === target) return;
      if (Math.abs(target - zoom) < SETTLED) zoom = target;
      else zoom += (target - zoom) * (1 - Math.pow(ZOOM_SMOOTHING, dt));
      place();
    },

    zoomBy(delta: number) {
      aim(target + delta);
    },

    zoomStep(direction: number) {
      aim(target + direction * ZOOM_STEP);
    },
  };
}

export type CameraRig = ReturnType<typeof createCameraRig>;
