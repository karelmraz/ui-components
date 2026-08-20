import { useState } from 'react';
import {
  generateStreakData,
  cycleDayIntensity,
  computeCurrentStreak,
  computeLongestStreak,
  computeTotalDays,
  type DayEntry,
} from '../data';

/** What changed after a day was cycled; lets callers react (e.g. celebrate) without re-deriving it */
export interface DayChange {
  entry: DayEntry;
  previousStreak: number;
  streak: number;
}

export function useStreakData(numDays = 120) {
  const [entries, setEntries] = useState<DayEntry[]>(() => generateStreakData(numDays));

  // Derived on every render; a single pass over ~120 entries is cheaper than tracking it in state
  const currentStreak = computeCurrentStreak(entries);
  const longestStreak = computeLongestStreak(entries);
  const totalDays = computeTotalDays(entries);

  const cycleIntensity = (date: string): DayChange | null => {
    const next = cycleDayIntensity(entries, date);
    if (next === entries) return null; // unknown date or a locked freeze day
    const entry = next.find((e) => e.date === date);
    if (!entry) return null;

    setEntries(next);
    return { entry, previousStreak: currentStreak, streak: computeCurrentStreak(next) };
  };

  return { entries, currentStreak, longestStreak, totalDays, cycleIntensity };
}
