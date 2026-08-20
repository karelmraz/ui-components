import * as THREE from 'three';
import type { Theme } from '../theme';

export type GlobeEnv = {
  isLight: boolean;
  reduceMotion: boolean;
  pixelRatio: number;
  lineBlending: THREE.Blending;
};

export function createEnv(theme: Theme, pixelRatio: number): GlobeEnv {
  const isLight = theme.mode === 'light';
  return {
    isLight,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    pixelRatio,
    lineBlending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
  };
}
