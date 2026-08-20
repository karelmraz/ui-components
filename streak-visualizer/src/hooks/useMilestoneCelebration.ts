import { useState, useEffect, useRef } from 'react';
import { findCrossedMilestone, getTodayKey, type Milestone } from '../data';
import type { DayChange } from './useStreakData';

export type CelebrationType = 'milestone' | 'new-day';

export interface Celebration {
  type: CelebrationType;
  milestone: Milestone | null;
}

/** Delay before the overlay appears after a day is cycled */
const CELEBRATION_DELAY_MS = 300;

export function useMilestoneCelebration() {
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showMilestone = (milestone: Milestone) => {
    setCelebration({ type: 'milestone', milestone });
  };

  const dismiss = () => {
    setCelebration(null);
  };

  /** Celebrate a newly crossed milestone, or the first activity logged for today */
  const celebrateDayChange = ({ entry, previousStreak, streak }: DayChange) => {
    if (!entry.completed) return;

    let next: Celebration | null = null;
    const milestone = findCrossedMilestone(previousStreak, streak);
    if (milestone) {
      next = { type: 'milestone', milestone };
    } else if (entry.date === getTodayKey() && entry.intensity === 1) {
      next = { type: 'new-day', milestone: null };
    }

    if (next) {
      timerRef.current = setTimeout(() => setCelebration(next), CELEBRATION_DELAY_MS);
    }
  };

  return { celebration, showMilestone, celebrateDayChange, dismiss };
}
