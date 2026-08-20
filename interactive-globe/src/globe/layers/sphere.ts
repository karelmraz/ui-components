import * as THREE from 'three';
import { LIGHT_DIR, R } from '../constants';
import { sphereFragmentShader, sphereVertexShader } from '../shaders';
import type { Theme } from '../../theme';

export function createSphere(theme: Theme) {
  const geometry = new THREE.SphereGeometry(R * 0.996, 64, 64);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uLightDir: { value: LIGHT_DIR },
      uNight: { value: new THREE.Color(theme.sphereShade) },
      uDay: { value: new THREE.Color(theme.sphere) },
    },
    vertexShader: sphereVertexShader,
    fragmentShader: sphereFragmentShader,
  });

  return {
    object: new THREE.Mesh(geometry, material),
    applyTheme(next: Theme) {
      material.uniforms.uNight.value.set(next.sphereShade);
      material.uniforms.uDay.value.set(next.sphere);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
