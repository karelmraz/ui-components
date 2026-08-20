import * as THREE from 'three';
import { R } from '../constants';
import type { GlobeEnv } from '../env';
import { latLngToVec3 } from '../math';
import type { Theme } from '../../theme';

const MERIDIAN_STEP = 30;
const PARALLEL_STEP = 30;
const SEGMENT_STEP = 3;

function buildPositions() {
  const points: number[] = [];
  const vertex = new THREE.Vector3();
  const push = (lat: number, lng: number) => {
    latLngToVec3(lat, lng, R * 0.999, vertex);
    points.push(vertex.x, vertex.y, vertex.z);
  };

  for (let lng = -180; lng < 180; lng += MERIDIAN_STEP) {
    for (let lat = -90; lat < 90; lat += SEGMENT_STEP) {
      push(lat, lng);
      push(lat + SEGMENT_STEP, lng);
    }
  }
  for (let lat = -60; lat <= 60; lat += PARALLEL_STEP) {
    for (let lng = -180; lng < 180; lng += SEGMENT_STEP) {
      push(lat, lng);
      push(lat, lng + SEGMENT_STEP);
    }
  }
  return new Float32Array(points);
}

export function createGraticule(theme: Theme, env: GlobeEnv) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(buildPositions(), 3));

  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(theme.grid),
    transparent: true,
    opacity: env.isLight ? 0.5 : 0.32,
    depthWrite: false,
    blending: env.lineBlending,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;

  return {
    object: lines,
    applyTheme(next: Theme) {
      material.color.set(next.grid);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
