import { motion, AnimatePresence } from 'framer-motion';
import { FireIcon } from './Icons';

interface StreakCounterProps {
  count: number;
  isActive: boolean;
}

export function StreakCounter({ count, isActive }: StreakCounterProps) {
  return (
    <div
      className="flex flex-col items-center gap-2 py-4"
      role="status"
      aria-live="polite"
      aria-label={`Current streak: ${count} days`}
    >
      {/* Fire icon */}
      <div className="relative">
        {isActive && (
          <motion.div
            className="absolute -inset-4 rounded-full blur-2xl"
            style={{
              background:
                'radial-gradient(circle, var(--fire-from) 0%, var(--fire-via) 40%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.4, 1.1, 1.5, 1], opacity: [0.2, 0.4, 0.25, 0.45, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {isActive && (
          <motion.div
            className="absolute -inset-2 rounded-full blur-xl"
            style={{ background: 'radial-gradient(circle, var(--fire-to) 0%, transparent 60%)' }}
            animate={{ scale: [1.1, 1, 1.2, 0.95, 1.1], opacity: [0.3, 0.5, 0.2, 0.5, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        )}

        <motion.div
          className="relative leading-none select-none"
          animate={
            isActive
              ? {
                  scale: [1, 1.04, 0.98, 1.05, 1],
                  rotate: [0, -1, 1.5, -1.5, 0],
                  y: [0, -1, 0.5, -1.5, 0],
                }
              : { scale: 1, opacity: 0.35 }
          }
          transition={
            isActive ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }
          }
        >
          <FireIcon size={64} color={isActive ? 'var(--streak-accent)' : 'var(--text-muted)'} />
        </motion.div>

        {isActive &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full size-1 bg-[var(--fire-to)] left-1/2 top-[30%]"
              animate={{
                x: [0, (i - 1) * 18],
                y: [0, -30 - i * 10],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0],
              }}
              transition={{
                duration: 1 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
      </div>

      {/* Counter */}
      <div className="flex items-baseline gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            className="text-5xl font-extrabold tabular-nums bg-clip-text"
            style={{
              background: isActive
                ? 'linear-gradient(135deg, var(--fire-from), var(--fire-via), var(--fire-to))'
                : 'var(--text-muted)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className={`text-sm font-semibold uppercase tracking-widest ${isActive ? 'text-[var(--streak-accent)]' : 'text-[var(--text-muted)]'}`}
      >
        day streak
      </span>
    </div>
  );
}
