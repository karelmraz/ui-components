import { motion } from 'framer-motion';
import { MILESTONES } from './data';
import { useTheme } from './hooks/useTheme';
import { useStreakData } from './hooks/useStreakData';
import { useMilestoneCelebration } from './hooks/useMilestoneCelebration';
import { ThemeToggle } from './components/ThemeToggle';
import { StreakCounter } from './components/StreakCounter';
import { CalendarHeatmap } from './components/CalendarHeatmap';
import { WeeklyProgress } from './components/WeeklyProgress';
import { MilestoneTrack } from './components/MilestoneTrack';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { StatsRow, type Stat } from './components/StatsRow';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.05, 0.64, 1] as [number, number, number, number] },
  },
};

function App() {
  const { isDark, themeVars, toggleTheme } = useTheme();
  const { entries, currentStreak, longestStreak, totalDays, cycleIntensity } = useStreakData();
  const { celebration, showMilestone, celebrateDayChange, dismiss } = useMilestoneCelebration();

  const isActive = currentStreak > 0;

  const handleCycleDay = (date: string) => {
    const change = cycleIntensity(date);
    if (change) celebrateDayChange(change);
  };

  const stats: Stat[] = [
    { label: 'Current', value: currentStreak, icon: 'fire' },
    { label: 'Longest', value: longestStreak, icon: 'trophy' },
    { label: 'Total Days', value: totalDays, icon: 'calendar' },
  ];

  return (
    <main
      className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-[var(--page-bg)]"
      style={themeVars}
    >
      <motion.div
        className="theme-transition rounded-3xl w-full max-w-[540px] p-5 sm:p-8 relative bg-[var(--card-bg)] shadow-[var(--card-shadow)]"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-2" variants={fadeUp}>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Streak Tracker</h1>
            <p className="text-xs text-[var(--text-muted)]">Keep the fire alive!</p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </motion.div>

        <motion.div variants={scaleIn}>
          <StreakCounter count={currentStreak} isActive={isActive} />
        </motion.div>

        <motion.div className="h-px my-4 bg-[var(--divider)]" variants={fadeIn} />

        <motion.div variants={fadeUp}>
          <StatsRow stats={stats} delay={0.3} />
        </motion.div>

        <motion.div className="h-px my-4 bg-[var(--divider)]" variants={fadeIn} />

        <motion.div variants={fadeUp}>
          <WeeklyProgress entries={entries} onCycleDay={handleCycleDay} delay={0.6} />
        </motion.div>

        <motion.div className="h-px my-4 bg-[var(--divider)]" variants={fadeIn} />

        <motion.div variants={fadeUp}>
          <span className="text-sm font-semibold block mb-3 text-[var(--text-primary)]">
            Activity
          </span>
          <CalendarHeatmap entries={entries} onCycleDay={handleCycleDay} delay={1.0} />
        </motion.div>

        <motion.div className="h-px my-4 bg-[var(--divider)]" variants={fadeIn} />

        <motion.div variants={fadeUp}>
          <MilestoneTrack
            milestones={MILESTONES}
            currentStreak={currentStreak}
            onMilestoneClick={showMilestone}
            delay={1.6}
          />
        </motion.div>

        <motion.div className="mt-5 text-center" variants={fadeIn}>
          <p className="text-xs text-[var(--text-muted)]">
            Click a square to cycle through intensity levels
          </p>
        </motion.div>
      </motion.div>

      {celebration && (
        <CelebrationOverlay
          milestone={celebration.milestone}
          streakCount={currentStreak}
          onDismiss={dismiss}
          type={celebration.type}
        />
      )}
    </main>
  );
}

export default App;
