import { motion } from 'framer-motion';
import { FireIcon, StarIcon, SparkleIcon, PartyIcon, BurstIcon, BoltIcon } from './Icons';

const particleIcons = [FireIcon, StarIcon, SparkleIcon, PartyIcon, BurstIcon, BoltIcon, StarIcon];
const particleColors = [
  '#ff9500',
  '#ffcc00',
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#ff6b35',
  '#ffaa00',
];

/** Launch offsets, roughly fanning upwards from the centre of the card */
const particles = [
  { delay: 0, x: -1, y: -1 },
  { delay: 0.1, x: 0.8, y: -1.2 },
  { delay: 0.15, x: -0.5, y: -0.8 },
  { delay: 0.2, x: 1.2, y: -0.6 },
  { delay: 0.25, x: -1.1, y: -1.4 },
  { delay: 0.3, x: 0.3, y: -1.5 },
  { delay: 0.35, x: -0.8, y: -1.1 },
  { delay: 0.4, x: 0.6, y: -0.9 },
  { delay: 0.05, x: 1.0, y: -1.3 },
  { delay: 0.22, x: -0.3, y: -1.6 },
];

function Particle({ delay, x, y, index }: { delay: number; x: number; y: number; index: number }) {
  const IconComp = particleIcons[index % particleIcons.length];
  const color = particleColors[index % particleColors.length];

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${50 + x * 30}%`, top: `${50 + y * 20}%` }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0.5],
        y: [0, y * -120 - 60],
        x: [0, x * 80],
      }}
      transition={{ duration: 1.8, delay, ease: 'easeOut' }}
    >
      <IconComp size={22} color={color} />
    </motion.div>
  );
}

/** One-shot burst of icon particles, positioned relative to the nearest positioned ancestor */
export function CelebrationParticles() {
  return (
    <>
      {particles.map((p, i) => (
        <Particle key={i} index={i} {...p} />
      ))}
    </>
  );
}
