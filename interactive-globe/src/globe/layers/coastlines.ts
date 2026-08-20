import * as THREE from 'three';
import coastRaw from '../coastlines.json';
import { R } from '../constants';
import type { GlobeEnv } from '../env';
import { latLngToVec3 } from '../math';
import type { Theme } from '../../theme';

function buildPositions() {
  const points: number[] = [];
  const vertex = new THREE.Vector3();

  for (const ring of coastRaw as number[][]) {
    for (let i = 0; i + 3 < ring.length; i += 2) {
      latLngToVec3(ring[i + 1], ring[i], R * 1.001, vertex);
      points.push(vertex.x, vertex.y, vertex.z);
      latLngToVec3(ring[i + 3], ring[i + 2], R * 1.001, vertex);
      points.push(vertex.x, vertex.y, vertex.z);
    }
  }
  return new Float32Array(points);
}

export function createCoastlines(theme: Theme, env: GlobeEnv) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(buildPositions(), 3));

  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(theme.coast),
    transparent: true,
    opacity: env.isLight ? 0.6 : 0.4,
    depthWrite: false,
    blending: env.lineBlending,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;

  return {
    object: lines,
    applyTheme(next: Theme) {
      material.color.set(next.coast);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
