import * as THREE from 'three';
import { LIGHT_DIR, R } from '../constants';
import type { GlobeEnv } from '../env';
import dotsRaw from '../land-dots.json';
import { latLngToVec3 } from '../math';
import { dotsFragmentShader, dotsVertexShader } from '../shaders';
import type { Theme } from '../../theme';

function buildAttributes() {
  const count = dotsRaw.length / 2;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const vertex = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    latLngToVec3(dotsRaw[i * 2 + 1], dotsRaw[i * 2], R, vertex);
    positions.set([vertex.x, vertex.y, vertex.z], i * 3);
    seeds[i] = Math.random();
  }
  return { positions, seeds };
}

export function createLandDots(theme: Theme, env: GlobeEnv) {
  const { positions, seeds } = buildAttributes();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aRnd', new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPx: { value: env.pixelRatio },
      uMotion: { value: env.reduceMotion ? 0 : 1 },
      uMode: { value: env.isLight ? 1 : 0 },
      uLightDir: { value: LIGHT_DIR },
      uColorA: { value: new THREE.Color(theme.dotA) },
      uColorB: { value: new THREE.Color(theme.dotB) },
    },
    vertexShader: dotsVertexShader,
    fragmentShader: dotsFragmentShader,
  });

  return {
    object: new THREE.Points(geometry, material),
    update(time: number) {
      material.uniforms.uTime.value = time;
    },
    applyTheme(next: Theme) {
      material.uniforms.uColorA.value.set(next.dotA);
      material.uniforms.uColorB.value.set(next.dotB);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
