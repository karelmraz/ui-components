import { motion } from 'framer-motion';
import type { IconName } from '../icons';
import { Icon } from './Icon';

export interface Stat {
  label: string;
  value: number | string;
  icon: IconName;
}

interface StatsRowProps {
  stats: Stat[];
  delay?: number;
}

export function StatsRow({ stats, delay = 0 }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="flex flex-col items-center gap-1 py-3 rounded-xl border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--streak-accent) 10%, var(--page-bg))',
            borderColor: 'color-mix(in srgb, var(--streak-accent) 18%, var(--page-bg))',
          }}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: delay + i * 0.1 }}
        >
          <Icon name={stat.icon} size={22} color="var(--streak-accent)" />
          <span className="text-xl font-bold tabular-nums text-[var(--text-primary)]">
            {stat.value}
          </span>
          <span className="text-xs font-medium text-[var(--text-muted)]">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
