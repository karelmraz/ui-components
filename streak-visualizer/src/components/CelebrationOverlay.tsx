import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Milestone } from '../data';
import type { CelebrationType } from '../hooks/useMilestoneCelebration';
import { FireIcon } from './Icons';
import { Icon } from './Icon';
import { CelebrationParticles } from './CelebrationParticles';

interface CelebrationOverlayProps {
  milestone: Milestone | null;
  streakCount: number;
  onDismiss: () => void;
  type: CelebrationType;
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-[var(--badge-bg)] text-[var(--badge-text)]">
      {children}
    </div>
  );
}

function MilestoneContent({ milestone }: { milestone: Milestone }) {
  return (
    <>
      <motion.div
        className="mb-4 relative z-10 flex justify-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
      >
        <Icon name={milestone.icon} size={72} color="var(--streak-accent)" />
      </motion.div>
      <motion.div
        className="relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <Badge>Milestone Unlocked!</Badge>
        <h2 className="text-3xl font-extrabold mb-1 text-[var(--text-primary)]">
          {milestone.title}
        </h2>
        <p className="text-base mb-1 text-[var(--text-secondary)]">{milestone.description}</p>
        <p className="text-sm text-[var(--text-muted)]">{milestone.days} day streak achieved</p>
      </motion.div>
    </>
  );
}

function NewDayContent({ streakCount }: { streakCount: number }) {
  return (
    <>
      <motion.div
        className="mb-4 relative z-10 flex justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <FireIcon size={72} color="var(--streak-accent)" />
      </motion.div>
      <motion.div
        className="relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Badge>Streak Extended!</Badge>
        <h2 className="text-4xl font-extrabold mb-1">
          <span
            className="bg-clip-text"
            style={{
              background:
                'linear-gradient(135deg, var(--fire-from), var(--fire-via), var(--fire-to))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {streakCount} Days!
          </span>
        </h2>
        <p className="text-base text-[var(--text-secondary)]">Keep it going, you're on fire!</p>
      </motion.div>
    </>
  );
}

export function CelebrationOverlay({
  milestone,
  streakCount,
  onDismiss,
  type,
}: CelebrationOverlayProps) {
  const show = type === 'new-day' || milestone !== null;
  const dismissRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onDismiss]);

  // Move focus into the dialog once its entrance animation is under way,
  // and hand it back to where the user was once the overlay closes
  useEffect(() => {
    if (!show) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = setTimeout(() => dismissRef.current?.focus(), 100);
    return () => {
      clearTimeout(timer);
      previous?.focus();
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--overlay-bg)]"
          role="dialog"
          aria-modal="true"
          aria-label={
            type === 'milestone' && milestone
              ? `Milestone unlocked: ${milestone.title}`
              : `Streak extended: ${streakCount} days`
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onDismiss}
        >
          <motion.div
            className="relative rounded-3xl p-8 max-w-sm w-full text-center overflow-hidden bg-[var(--card-bg)]"
            style={{ boxShadow: '0 0 60px var(--streak-glow), var(--card-shadow)' }}
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CelebrationParticles />

            <motion.div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-40 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, var(--streak-glow), transparent)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {type === 'milestone' && milestone ? (
              <MilestoneContent milestone={milestone} />
            ) : (
              <NewDayContent streakCount={streakCount} />
            )}

            <motion.button
              ref={dismissRef}
              type="button"
              className="relative z-10 mt-6 px-8 py-3 rounded-xl text-sm font-bold cursor-pointer border-none bg-[var(--button-bg)] text-[var(--button-text)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
