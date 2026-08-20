import { motion } from 'framer-motion';
import { Orb } from './Orb';

/**
 * Soft animated colored glows behind the glass card.
 *
 * Perf notes:
 * - No `filter: blur()`. The softness comes from radial-gradient stop falloff
 *   (transparent at ~55%), which is a static raster the GPU can cache.
 * - No `mix-blend-mode`. Each glow uses additive-feeling colors over the dark
 *   base instead.
 * - Animated via `x`/`y` (transform), not `left`/`top` (layout). The motion
 *   div gets `will-change: transform` so the browser promotes it to its own
 *   composited layer.
 */
type OrbConfig = {
  size: number;
  color: string;
  /** Initial center as % of viewport */
  origin: { left: string; top: string };
  /** 4-point drift path — gentle loops, no color change */
  path: { x: number[]; y: number[] };
  /** Drift duration (s) */
  duration: number;
};

// Sunset palette — coral, gold, hot pink, deep lavender.
const ORBS: OrbConfig[] = [
  {
    size: 1500,
    color: 'rgba(255,209,102,0.6)', // gold
    origin: { left: '-15%', top: '-20%' },
    path: { x: [0, 360, 180, -140, 0], y: [0, 210, 360, 150, 0] },
    duration: 38,
  },
  {
    size: 1400,
    color: 'rgba(255,107,107,0.65)', // coral
    origin: { left: '45%', top: '-15%' },
    path: { x: [0, -330, -120, 240, 0], y: [0, 180, 390, 120, 0] },
    duration: 44,
  },
  {
    size: 1340,
    color: 'rgba(155,135,255,0.7)', // lavender
    origin: { left: '-5%', top: '45%' },
    path: { x: [0, 270, 450, 180, 0], y: [0, -210, -60, 150, 0] },
    duration: 48,
  },
  {
    size: 1300,
    color: 'rgba(229,74,140,0.65)', // hot pink
    origin: { left: '45%', top: '40%' },
    path: { x: [0, -270, -420, -120, 0], y: [0, -180, 120, 270, 0] },
    duration: 52,
  },
];

export function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep base */}
      <div className="absolute inset-0 bg-[#07060d]" />

      {/* Animated glows.
          Blur is applied as a **static** CSS filter on each orb, *not* animated.
          Combined with `transform: translateZ(0)` + `willChange: transform`,
          each orb becomes its own GPU compositor layer: the browser blurs the
          texture once on layer creation, then just translates that cached
          texture per frame. The expensive blur recompute only happens if the
          layer's bounding box changes (which it doesn't — transforms don't
          resize the layer). */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.origin.left,
            top: orb.origin.top,
            background: `radial-gradient(closest-side, ${orb.color}, transparent 70%)`,
            filter: 'blur(40px)',
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
          animate={{
            x: orb.path.x,
            y: orb.path.y,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* WebGL orb — transparent canvas composites cleanly over the CSS glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Orb
          hue={20}
          hoverIntensity={2.5}
          rotateOnHover={true}
          backgroundColor="#07060d"
          className="w-[700px] h-[700px]"
        />
      </div>

      {/* Subtle dark vignette to anchor the card */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

      {/* Film grain */}
      <div className="noise pointer-events-none absolute inset-0 opacity-[0.06]" />
    </div>
  );
}
