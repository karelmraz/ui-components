import { motion } from 'framer-motion';
import { toDateKey, type DayEntry } from '../data';
import { SnowflakeIcon } from './Icons';

interface WeeklyProgressProps {
  entries: DayEntry[];
  onCycleDay: (date: string) => void;
  delay?: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyProgress({ entries, onCycleDay, delay = 0 }: WeeklyProgressProps) {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7; // Monday = 0
  const entryByDate = new Map(entries.map((e) => [e.date, e]));

  const weekEntries: (DayEntry | null)[] = [];
  for (let dow = 0; dow < 7; dow++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (todayDow - dow));
    weekEntries.push(entryByDate.get(toDateKey(d)) || null);
  }

  const completedThisWeek = weekEntries.filter((e) => e?.completed).length;

  return (
    <div>
      <motion.div
        className="flex items-center justify-between mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        <span className="text-sm font-semibold text-[var(--text-primary)]">This Week</span>
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {completedThisWeek}/7 days
        </span>
      </motion.div>
      <div className="flex justify-between">
        {DAYS.map((day, i) => {
          const entry = weekEntries[i];
          const done = entry?.completed || false;
          const freeze = entry?.freeze || false;
          const isToday = i === todayDow;
          const showPulse = isToday && !done && !freeze;

          const bg = done
            ? 'var(--week-dot-done)'
            : freeze
              ? 'var(--freeze-bg)'
              : 'var(--week-dot-empty)';
          const border = isToday
            ? '2px solid var(--today-ring)'
            : freeze
              ? '1px solid var(--freeze-border)'
              : 'none';

          return (
            <motion.div
              key={day}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
                delay: delay + 0.05 + i * 0.06,
              }}
            >
              <span
                className={`text-xs font-medium ${isToday ? 'text-[var(--streak-accent)]' : 'text-[var(--text-muted)]'}`}
              >
                {day}
              </span>
              <motion.button
                type="button"
                className="relative size-9 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                style={{ backgroundColor: bg, border }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => entry && onCycleDay(entry.date)}
                aria-label={`${day}${isToday ? ' (today)' : ''}: ${freeze ? 'streak freeze' : done ? 'completed' : 'not completed'}`}
                animate={showPulse ? { scale: [1, 1.06, 1] } : undefined}
                transition={
                  showPulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined
                }
              >
                {showPulse && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, var(--streak-accent) 0%, transparent 70%)',
                    }}
                    animate={{ opacity: [0, 0.25, 0], scale: [1, 1.06, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {done && (
                  <motion.svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.2, 1.2, 0.4, 1],
                      delay: delay + 0.25 + i * 0.12,
                    }}
                  >
                    <motion.path
                      d="M4.5 12.75L10 17.5L19.5 6.5"
                      stroke="var(--button-text)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                        delay: delay + 0.35 + i * 0.12,
                      }}
                    />
                  </motion.svg>
                )}
                {freeze && !done && <SnowflakeIcon size={14} color="var(--freeze-text)" />}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
