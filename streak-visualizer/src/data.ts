import type { IconName } from './icons';

/** Activity level of a day: 0 = nothing logged, 4 = most intense */
export type Intensity = 0 | 1 | 2 | 3 | 4;

/** Number of distinct intensity values a day can cycle through */
export const INTENSITY_LEVELS = 5;

export interface DayEntry {
  date: string; // YYYY-MM-DD
  completed: boolean;
  freeze: boolean;
  intensity: Intensity;
}

export interface Milestone {
  id: string;
  days: number;
  icon: IconName;
  title: string;
  description: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'spark', days: 3, icon: 'sparkle', title: 'Spark', description: "You're getting started!" },
  { id: 'week', days: 7, icon: 'fire', title: 'On Fire', description: '1 full week!' },
  { id: 'fortnight', days: 14, icon: 'bolt', title: 'Unstoppable', description: '2 weeks strong!' },
  { id: 'month', days: 30, icon: 'trophy', title: 'Dedicated', description: 'A whole month!' },
  { id: 'quarter', days: 50, icon: 'diamond', title: 'Diamond', description: '50-day legend!' },
  { id: 'hundred', days: 100, icon: 'crown', title: 'Centurion', description: '100-day master!' },
  { id: 'year', days: 365, icon: 'star', title: 'Legendary', description: 'Full year streak!' },
];

/** YYYY-MM-DD key used to identify a day everywhere in the app */
export function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function getTodayKey(): string {
  return toDateKey(new Date());
}

/** Generate mock streak data for the last N days */
export function generateStreakData(numDays: number): DayEntry[] {
  const entries: DayEntry[] = [];
  const today = new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toDateKey(d);

    let completed = false;
    let freeze = false;
    let intensity: Intensity = 0;

    if (i === 0) {
      // Today: not yet completed
      completed = false;
    } else if (i >= 1 && i <= 49) {
      // 49-day active streak (with a couple freeze days)
      if (i === 15 || i === 35) {
        freeze = true;
      } else {
        completed = true;
        const seed = (d.getDate() * 7 + d.getMonth() * 13) % 4;
        intensity = (seed + 1) as Intensity;
      }
    } else if (i > 49 && i <= 58) {
      // Gap before the streak
      completed = false;
    } else {
      // Sporadic older activity
      const seed = (d.getDate() * 11 + d.getMonth() * 23) % 10;
      completed = seed < 3;
      intensity = completed ? (((seed % 4) + 1) as Intensity) : 0;
    }

    entries.push({ date: dateStr, completed, freeze, intensity });
  }

  return entries;
}

/**
 * Advance the intensity of one day (0 → 1 → … → 4 → 0).
 * Freeze days are locked; unknown dates and freeze days return the input array untouched.
 */
export function cycleDayIntensity(entries: DayEntry[], date: string): DayEntry[] {
  const index = entries.findIndex((e) => e.date === date);
  if (index === -1 || entries[index].freeze) return entries;

  const entry = entries[index];
  const intensity = ((entry.intensity + 1) % INTENSITY_LEVELS) as Intensity;
  const next = entries.slice();
  next[index] = { ...entry, intensity, completed: intensity > 0 };
  return next;
}

export function computeCurrentStreak(entries: DayEntry[]): number {
  let streak = 0;
  // Walk backwards from yesterday (today might not be done yet)
  for (let i = entries.length - 2; i >= 0; i--) {
    if (entries[i].completed || entries[i].freeze) {
      streak++;
    } else {
      break;
    }
  }
  // If today is completed, add it
  const today = entries[entries.length - 1];
  if (today && today.completed) streak++;
  return streak;
}

export function computeLongestStreak(entries: DayEntry[]): number {
  let longest = 0;
  let current = 0;
  for (const entry of entries) {
    if (entry.completed || entry.freeze) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }
  return longest;
}

export function computeTotalDays(entries: DayEntry[]): number {
  return entries.filter((e) => e.completed).length;
}

/** The first milestone whose threshold was crossed going from one streak length to another */
export function findCrossedMilestone(
  previousStreak: number,
  streak: number,
): Milestone | undefined {
  return MILESTONES.find((m) => previousStreak < m.days && streak >= m.days);
}
