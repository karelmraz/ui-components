import * as THREE from 'three';
import { R, RIPPLE_DURATION, RIPPLE_POOL, RIPPLE_SEGMENTS } from '../constants';
import type { GlobeEnv } from '../env';

const RIPPLE_RADIUS = R * 1.003;

type Ripple = {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshBasicMaterial;
  active: boolean;
  start: number;
  axis: THREE.Vector3;
  u: THREE.Vector3;
  v: THREE.Vector3;
};

export function createRipples(env: GlobeEnv) {
  const group = new THREE.Group();

  const ripples: Ripple[] = Array.from({ length: RIPPLE_POOL }, () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(2 * (RIPPLE_SEGMENTS + 1) * 3), 3),
    );

    const indices: number[] = [];
    for (let j = 0; j < RIPPLE_SEGMENTS; j++) {
      const a = 2 * j;
      indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
    geometry.setIndex(indices);

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: env.lineBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    group.add(mesh);

    return {
      mesh,
      geometry,
      material,
      active: false,
      start: 0,
      axis: new THREE.Vector3(),
      u: new THREE.Vector3(),
      v: new THREE.Vector3(),
    };
  });

  return {
    object: group,

    spawn(at: THREE.Vector3, color: string, now: number) {
      const ripple = ripples.find((candidate) => !candidate.active);
      if (!ripple) return;

      ripple.active = true;
      ripple.start = now;
      ripple.material.color.set(color);

      ripple.axis.copy(at).normalize();
      const polar = Math.abs(ripple.axis.y) > 0.9;
      ripple.u.set(polar ? 1 : 0, polar ? 0 : 1, 0);
      ripple.u.crossVectors(ripple.u, ripple.axis).normalize();
      ripple.v.crossVectors(ripple.axis, ripple.u).normalize();
      ripple.mesh.visible = true;
    },

    update(now: number) {
      for (const ripple of ripples) {
        if (!ripple.active) continue;

        const progress = (now - ripple.start) / RIPPLE_DURATION;
        if (progress >= 1) {
          ripple.active = false;
          ripple.mesh.visible = false;
          continue;
        }

        const alpha = 0.015 + progress * 0.16;
        const halfWidth = 0.02 * (1 - 0.4 * progress);
        const innerCos = Math.cos(alpha - halfWidth);
        const innerSin = Math.sin(alpha - halfWidth);
        const outerCos = Math.cos(alpha + halfWidth);
        const outerSin = Math.sin(alpha + halfWidth);

        const { axis, u, v } = ripple;
        const position = ripple.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let j = 0; j <= RIPPLE_SEGMENTS; j++) {
          const angle = (j / RIPPLE_SEGMENTS) * Math.PI * 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const dx = cos * u.x + sin * v.x;
          const dy = cos * u.y + sin * v.y;
          const dz = cos * u.z + sin * v.z;

          position.setXYZ(
            2 * j,
            (innerCos * axis.x + innerSin * dx) * RIPPLE_RADIUS,
            (innerCos * axis.y + innerSin * dy) * RIPPLE_RADIUS,
            (innerCos * axis.z + innerSin * dz) * RIPPLE_RADIUS,
          );
          position.setXYZ(
            2 * j + 1,
            (outerCos * axis.x + outerSin * dx) * RIPPLE_RADIUS,
            (outerCos * axis.y + outerSin * dy) * RIPPLE_RADIUS,
            (outerCos * axis.z + outerSin * dz) * RIPPLE_RADIUS,
          );
        }
        position.needsUpdate = true;
        ripple.material.opacity = 0.85 * (1 - progress);
      }
    },

    dispose() {
      for (const ripple of ripples) {
        ripple.geometry.dispose();
        ripple.material.dispose();
      }
    },
  };
}
