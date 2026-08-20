import * as THREE from 'three';
import {
  ARC_DURATION,
  ARC_DURATION_JITTER,
  ARC_HEAD_SIZE,
  ARC_POOL,
  ARC_SEGMENTS,
  ARC_TAIL,
  R,
} from '../constants';
import type { GlobeEnv } from '../env';
import { HUBS } from '../hubs';
import { easeInOutCubic, latLngToVec3, randomOf } from '../math';
import { makeHubGlow } from '../textures';
import type { Theme } from '../../theme';

type Arc = {
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  head: THREE.Sprite;
  headMaterial: THREE.SpriteMaterial;
  points: THREE.Vector3[];
  active: boolean;
  start: number;
  duration: number;
  arrival: THREE.Vector3;
};

export type ArcArrival = (at: THREE.Vector3, color: string) => void;

export function createArcs(theme: Theme, env: GlobeEnv) {
  const group = new THREE.Group();
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  );

  let current = theme;
  let headTexture = makeHubGlow(theme);

  const arcs: Arc[] = Array.from({ length: ARC_POOL }, () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3),
    );
    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.9,
      blending: env.lineBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;

    const headMaterial = new THREE.SpriteMaterial({
      map: headTexture,
      transparent: true,
      depthWrite: false,
    });
    const head = new THREE.Sprite(headMaterial);
    head.scale.setScalar(ARC_HEAD_SIZE);
    head.visible = false;

    group.add(line, head);

    return {
      geometry,
      material,
      head,
      headMaterial,
      points: Array.from({ length: ARC_SEGMENTS }, () => new THREE.Vector3()),
      active: false,
      start: 0,
      duration: 0,
      arrival: new THREE.Vector3(),
    };
  });

  return {
    object: group,

    launch(fromHub: number, toHub: number, now: number) {
      const arc = arcs.find((candidate) => !candidate.active);
      if (!arc || fromHub === toHub) return;

      latLngToVec3(HUBS[fromHub].lat, HUBS[fromHub].lng, R * 1.002, from);
      latLngToVec3(HUBS[toHub].lat, HUBS[toHub].lng, R * 1.002, to);

      const lift = 0.16 + 0.45 * (from.angleTo(to) / Math.PI);
      curve.v0.copy(from);
      curve.v1
        .copy(from)
        .lerp(to, 0.35)
        .normalize()
        .multiplyScalar(R * (1 + lift));
      curve.v2
        .copy(from)
        .lerp(to, 0.65)
        .normalize()
        .multiplyScalar(R * (1 + lift));
      curve.v3.copy(to);

      const position = arc.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < ARC_SEGMENTS; i++) {
        curve.getPoint(i / (ARC_SEGMENTS - 1), arc.points[i]);
        position.setXYZ(i, arc.points[i].x, arc.points[i].y, arc.points[i].z);
      }
      position.needsUpdate = true;

      const color = randomOf(current.arcs);
      arc.material.color.set(color);
      arc.headMaterial.color.set(color);
      arc.active = true;
      arc.start = now;
      arc.duration = ARC_DURATION + Math.random() * ARC_DURATION_JITTER;
      arc.arrival.copy(to);
      arc.head.visible = true;
    },

    update(now: number, onArrival: ArcArrival) {
      for (const arc of arcs) {
        if (!arc.active) continue;

        const progress = (now - arc.start) / arc.duration;
        if (progress >= 1) {
          arc.active = false;
          arc.geometry.setDrawRange(0, 0);
          arc.head.visible = false;
          onArrival(arc.arrival, `#${arc.material.color.getHexString()}`);
          continue;
        }

        const head = easeInOutCubic(progress) * (ARC_SEGMENTS - 1);
        const tail = Math.max(0, head - ARC_TAIL);
        arc.geometry.setDrawRange(Math.floor(tail), Math.max(2, Math.ceil(head - tail)));
        arc.head.position.copy(arc.points[Math.min(ARC_SEGMENTS - 1, Math.floor(head))]);
        arc.material.opacity = 0.95 * (1 - Math.max(0, progress - 0.75) * 4);
      }
    },

    applyTheme(next: Theme) {
      current = next;
      const replacement = makeHubGlow(next);
      for (const arc of arcs) {
        arc.headMaterial.map = replacement;
        arc.headMaterial.needsUpdate = true;
      }
      headTexture.dispose();
      headTexture = replacement;
    },

    dispose() {
      headTexture.dispose();
      for (const arc of arcs) {
        arc.geometry.dispose();
        arc.material.dispose();
        arc.headMaterial.dispose();
      }
    },
  };
}
