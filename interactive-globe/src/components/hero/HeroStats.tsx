import { motion } from 'framer-motion';
import { item } from './variants';

const STATS = [
  { value: '35', label: 'regions' },
  { value: '99.99%', label: 'uptime' },
  { value: '28 ms', label: 'p50 latency' },
];

export function HeroStats() {
  return (
    <motion.dl
      variants={item}
      className="mt-2 flex items-center justify-center gap-8 lg:justify-start"
    >
      {STATS.map((stat) => (
        <div key={stat.label}>
          <dt className="sr-only">{stat.label}</dt>
          <dd className="text-xl font-semibold tracking-tight">{stat.value}</dd>
          <dd className="mt-0.5 text-xs text-muted">{stat.label}</dd>
        </div>
      ))}
    </motion.dl>
  );
}
