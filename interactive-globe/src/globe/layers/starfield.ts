import * as THREE from 'three';
import { STAR_COUNT } from '../constants';
import type { GlobeEnv } from '../env';
import { starsFragmentShader, starsVertexShader } from '../shaders';

function buildAttributes() {
  const positions = new Float32Array(STAR_COUNT * 3);
  const seeds = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    const height = Math.random() * 2 - 1;
    const angle = Math.random() * Math.PI * 2;
    const ring = Math.sqrt(1 - height * height);
    const radius = 7 + Math.random() * 7;
    positions.set(
      [radius * ring * Math.cos(angle), radius * height, radius * ring * Math.sin(angle) - 3],
      i * 3,
    );
    seeds[i] = Math.random();
  }
  return { positions, seeds };
}

export function createStarfield(env: GlobeEnv) {
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
    },
    vertexShader: starsVertexShader,
    fragmentShader: starsFragmentShader,
  });

  const stars = new THREE.Points(geometry, material);
  stars.rotation.set(0.3, 0.6, 0.1);

  return {
    object: stars,
    update(time: number, dt: number) {
      material.uniforms.uTime.value = time;
      stars.rotation.y += 0.004 * dt;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
