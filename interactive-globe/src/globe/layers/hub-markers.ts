import * as THREE from 'three';
import { HOVER_RADIUS, HUB_HOVER_SCALE, HUB_SIZE, R } from '../constants';
import type { GlobeEnv } from '../env';
import { HUBS } from '../hubs';
import { latLngToVec3 } from '../math';
import { makeHubGlow } from '../textures';
import type { Theme } from '../../theme';

const FRONT_FACING_Z = 0.25;

type HubUpdate = {
  time: number;
  camera: THREE.Camera;
  width: number;
  height: number;
  pointer: { x: number; y: number };
  interactive: boolean;
};

export function createHubMarkers(theme: Theme, env: GlobeEnv) {
  const group = new THREE.Group();
  const materials: THREE.SpriteMaterial[] = [];
  const projected = new THREE.Vector3();

  let texture = makeHubGlow(theme);
  let hovered = -1;

  const sprites = HUBS.map((hub) => {
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    latLngToVec3(hub.lat, hub.lng, R * 1.005, sprite.position);
    sprite.scale.setScalar(HUB_SIZE);
    group.add(sprite);
    materials.push(material);
    return sprite;
  });

  const toScreen = (width: number, height: number) => ({
    x: (projected.x * 0.5 + 0.5) * width,
    y: (-projected.y * 0.5 + 0.5) * height,
  });

  return {
    object: group,

    get hovered() {
      return hovered;
    },

    positionOf(index: number) {
      return sprites[index].position;
    },

    screenPositionOf(index: number, camera: THREE.Camera, width: number, height: number) {
      sprites[index].getWorldPosition(projected).project(camera);
      return toScreen(width, height);
    },

    update({ time, camera, width, height, pointer, interactive }: HubUpdate) {
      let nearest = -1;
      let nearestDistance = HOVER_RADIUS;

      for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i];
        const pulse = env.reduceMotion ? 1 : 1 + 0.14 * Math.sin(time * 2.1 + i * 1.7);
        sprite.scale.setScalar(HUB_SIZE * pulse * (hovered === i ? HUB_HOVER_SCALE : 1));

        sprite.getWorldPosition(projected);
        const frontFacing = projected.z > FRONT_FACING_Z;
        materials[i].opacity = frontFacing ? 1 : 0.25;
        if (!interactive || !frontFacing) continue;

        projected.project(camera);
        const { x, y } = toScreen(width, height);
        const distance = Math.hypot(x - pointer.x, y - pointer.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = i;
        }
      }

      hovered = nearest;
      return hovered;
    },

    applyTheme(next: Theme) {
      const replacement = makeHubGlow(next);
      for (const material of materials) {
        material.map = replacement;
        material.needsUpdate = true;
      }
      texture.dispose();
      texture = replacement;
    },

    dispose() {
      texture.dispose();
      for (const material of materials) material.dispose();
    },
  };
}
