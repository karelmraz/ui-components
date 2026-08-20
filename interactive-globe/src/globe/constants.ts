import * as THREE from 'three';

export const R = 1;

export const LG_BREAKPOINT = 1024;

export const ARC_POOL = 7;
export const ARC_SEGMENTS = 64;
export const ARC_TAIL = 26;
export const ARC_BURST = 3;
export const ARC_DURATION = 1.15;
export const ARC_DURATION_JITTER = 0.5;
export const ARC_HEAD_SIZE = 0.045;
export const FIRST_ARC_AT = 0.6;
export const AMBIENT_ARC_DELAY = 0.9;
export const AMBIENT_ARC_JITTER = 1.2;

export const RIPPLE_POOL = 10;
export const RIPPLE_SEGMENTS = 72;
export const RIPPLE_DURATION = 0.9;

export const HUB_SIZE = 0.055;
export const HUB_HOVER_SCALE = 1.7;
export const HOVER_RADIUS = 28;

export const AUTO_SPIN = 0.055;
export const SPIN_DECAY = 0.06;
export const DRAG_THRESHOLD = 6;

export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 1.8;
export const ZOOM_STEP = 0.12;
export const WHEEL_ZOOM = 0.0011;
// Fraction of the remaining zoom distance still left after one second, i.e. the
// camera covers ~99.95% of the gap per second. Small = snappy, large = floaty.
export const ZOOM_SMOOTHING = 0.0005;

export const STAR_COUNT = 650;

export const LIGHT_DIR = new THREE.Vector3(-0.28, 0.22, 0.9).normalize();
