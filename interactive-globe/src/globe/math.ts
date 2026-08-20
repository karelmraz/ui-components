import * as THREE from 'three';

export function latLngToVec3(lat: number, lng: number, r: number, out = new THREE.Vector3()) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  out.set(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
  return out;
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const randomIndex = (length: number) => Math.floor(Math.random() * length);

export const randomOf = <T>(items: readonly T[]): T => items[randomIndex(items.length)];
