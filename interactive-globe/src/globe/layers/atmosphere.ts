import * as THREE from 'three';
import { LIGHT_DIR, R } from '../constants';
import { atmosphereFragmentShader, atmosphereVertexShader } from '../shaders';
import type { Theme } from '../../theme';

export function createAtmosphere(theme: Theme) {
  const geometry = new THREE.SphereGeometry(R * 1.11, 64, 64);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(theme.atmo) },
      uRim: { value: new THREE.Color(theme.rim) },
      uLightDir: { value: LIGHT_DIR },
    },
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
  });

  return {
    object: new THREE.Mesh(geometry, material),
    applyTheme(next: Theme) {
      material.uniforms.uColor.value.set(next.atmo);
      material.uniforms.uRim.value.set(next.rim);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
