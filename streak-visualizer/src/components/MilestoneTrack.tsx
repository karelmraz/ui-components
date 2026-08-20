import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Milestone } from '../data';
import { Icon } from './Icon';

const SHAKE_DURATION_MS = 500;

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  currentStreak: number;
  isNextUp: boolean;
  delay: number;
  onSelect: (milestone: Milestone) => void;
}

function MilestoneCard({
  milestone: m,
  index: i,
  currentStreak,
  isNextUp,
  delay,
  onSelect,
}: MilestoneCardProps) {
  const [isShaking, setIsShaking] = useState(false);
  const unlocked = currentStreak >= m.days;
  const progress = unlocked ? 100 : Math.min(100, (currentStreak / m.days) * 100);

  const handleClick = () => {
    if (unlocked) {
      onSelect(m);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), SHAKE_DURATION_MS);
    }
  };

  return (
    <motion.button
      type="button"
      className="flex flex-col items-center gap-1 p-3 rounded-xl min-w-[80px] cursor-pointer relative border"
      style={{
        backgroundColor: unlocked
          ? 'var(--milestone-unlocked-bg)'
          : 'color-mix(in srgb, var(--streak-accent) 8%, var(--page-bg))',
        borderColor: unlocked
          ? 'var(--milestone-unlocked-border)'
          : 'color-mix(in srgb, var(--streak-accent) 16%, var(--page-bg))',
        boxShadow: unlocked ? 'var(--milestone-glow)' : 'none',
      }}
      initial={{ opacity: 0, y: 12, scale: 0.85 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: isShaking ? [0, -4, 4, -3, 3, -1, 1, 0] : 0,
      }}
      transition={
        isShaking
          ? { x: { duration: 0.4 } }
          : { type: 'spring', stiffness: 350, damping: 18, delay: delay + 0.05 + i * 0.07 }
      }
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      {/* Clipped overlay for progress/shimmer */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        {!unlocked && (
          <motion.div
            className="absolute bottom-0 inset-x-0 opacity-20 bg-gradient-to-t from-[var(--streak-accent)] to-transparent"
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.3 + i * 0.07 }}
          />
        )}
        {unlocked && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-full -left-full w-[60%] h-[300%] origin-center rotate-[25deg]"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
              }}
              animate={{ x: ['-20%', '500%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeInOut',
                delay: i * 0.25,
              }}
            />
          </div>
        )}
      </div>

      <motion.div
        className={`relative z-10 ${unlocked ? '' : 'opacity-35 grayscale-[0.6]'}`}
        animate={unlocked ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Icon
          name={m.icon}
          size={28}
          color={unlocked ? 'var(--streak-accent)' : 'var(--text-muted)'}
        />
      </motion.div>
      <span
        className={`text-xs font-bold relative z-10 ${unlocked ? 'text-[var(--streak-accent)]' : 'text-[var(--text-muted)]'}`}
      >
        {m.days}d
      </span>
      <span
        className={`text-xs font-medium relative z-10 ${unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
      >
        {m.title}
      </span>
      <span className="sr-only">
        {unlocked ? 'milestone unlocked' : `milestone locked, ${Math.round(progress)}% progress`}
        {isNextUp ? ', next goal' : ''}
      </span>

      {isNextUp && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 rounded-bl-lg rounded-tr-xl text-[10px] font-bold bg-[var(--streak-accent)] text-[var(--button-text)]"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          NEXT
        </motion.div>
      )}
    </motion.button>
  );
}

interface MilestoneTrackProps {
  milestones: Milestone[];
  currentStreak: number;
  onMilestoneClick: (milestone: Milestone) => void;
  delay?: number;
}

export function MilestoneTrack({
  milestones,
  currentStreak,
  onMilestoneClick,
  delay = 0,
}: MilestoneTrackProps) {
  // The first milestone still ahead of the streak gets the "NEXT" tag
  const nextUp = milestones.find((m) => m.days > currentStreak);

  return (
    <div>
      <motion.span
        className="text-sm font-semibold block mb-3 text-[var(--text-primary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        Milestones
      </motion.span>
      <ul
        className="flex gap-2 overflow-x-auto pb-2 pt-2 -mt-2 px-1 -mx-1 streak-scroll list-none m-0 p-0"
        aria-label="Milestone list"
        tabIndex={0}
      >
        {milestones.map((m, i) => (
          <li key={m.id} className="list-none">
            <MilestoneCard
              milestone={m}
              index={i}
              currentStreak={currentStreak}
              isNextUp={m === nextUp}
              delay={delay}
              onSelect={onMilestoneClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
