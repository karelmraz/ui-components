import { describe, expect, it } from 'vitest';
import {
  computeCurrentStreak,
  computeLongestStreak,
  computeTotalDays,
  cycleDayIntensity,
  findCrossedMilestone,
  generateStreakData,
  toDateKey,
  type DayEntry,
  type Intensity,
} from './data';

function day(date: string, intensity: Intensity, freeze = false): DayEntry {
  return { date, completed: intensity > 0, freeze, intensity };
}

// Oldest first, today last — the same order the app keeps its entries in.
const week: DayEntry[] = [
  day('2026-03-01', 2),
  day('2026-03-02', 0),
  day('2026-03-03', 1),
  day('2026-03-04', 0, true), // streak freeze
  day('2026-03-05', 3),
  day('2026-03-06', 4),
  day('2026-03-07', 0), // today, nothing logged yet
];

describe('computeCurrentStreak', () => {
  it('walks back from yesterday and treats freeze days as part of the streak', () => {
    expect(computeCurrentStreak(week)).toBe(4); // 3rd, 4th (freeze), 5th, 6th
  });

  it('adds today once it is completed', () => {
    const done = [...week.slice(0, -1), day('2026-03-07', 1)];
    expect(computeCurrentStreak(done)).toBe(5);
  });

  it('is zero when yesterday was missed, even if today is not over', () => {
    const missed = [...week.slice(0, -2), day('2026-03-06', 0), day('2026-03-07', 0)];
    expect(computeCurrentStreak(missed)).toBe(0);
  });

  it('handles empty and single-day inputs', () => {
    expect(computeCurrentStreak([])).toBe(0);
    expect(computeCurrentStreak([day('2026-03-07', 2)])).toBe(1);
    expect(computeCurrentStreak([day('2026-03-07', 0)])).toBe(0);
  });
});

describe('computeLongestStreak', () => {
  it('finds the longest run anywhere in the history', () => {
    expect(computeLongestStreak(week)).toBe(4);
  });

  it('does not let an older run hide behind a recent gap', () => {
    const entries = [
      day('2026-03-01', 1),
      day('2026-03-02', 1),
      day('2026-03-03', 0),
      day('2026-03-04', 1),
    ];
    expect(computeLongestStreak(entries)).toBe(2);
  });

  it('is zero with no activity', () => {
    expect(computeLongestStreak([day('2026-03-01', 0), day('2026-03-02', 0)])).toBe(0);
  });
});

describe('computeTotalDays', () => {
  it('counts completed days only — freeze days do not count', () => {
    expect(computeTotalDays(week)).toBe(4);
  });
});

describe('cycleDayIntensity', () => {
  it('advances intensity and marks the day completed', () => {
    const next = cycleDayIntensity(week, '2026-03-07');
    expect(next[6]).toEqual(day('2026-03-07', 1));
  });

  it('wraps from 4 back to 0 and clears completed', () => {
    const next = cycleDayIntensity(week, '2026-03-06');
    expect(next[5]).toEqual(day('2026-03-06', 0));
  });

  it('leaves freeze days and unknown dates untouched, returning the same array', () => {
    expect(cycleDayIntensity(week, '2026-03-04')).toBe(week);
    expect(cycleDayIntensity(week, '1999-01-01')).toBe(week);
  });

  it('does not mutate the input', () => {
    const before = structuredClone(week);
    cycleDayIntensity(week, '2026-03-07');
    expect(week).toEqual(before);
  });
});

describe('findCrossedMilestone', () => {
  it('returns the milestone whose threshold was just reached', () => {
    expect(findCrossedMilestone(6, 7)?.id).toBe('week');
  });

  it('returns the first crossed milestone when several are skipped at once', () => {
    expect(findCrossedMilestone(2, 8)?.id).toBe('spark');
  });

  it('returns nothing when no threshold was crossed', () => {
    expect(findCrossedMilestone(7, 8)).toBeUndefined();
    expect(findCrossedMilestone(7, 7)).toBeUndefined();
    expect(findCrossedMilestone(10, 3)).toBeUndefined();
  });
});

describe('generateStreakData', () => {
  const entries = generateStreakData(105);

  it('produces one entry per day, oldest first, ending today', () => {
    expect(entries).toHaveLength(105);
    expect(entries.at(-1)?.date).toBe(toDateKey(new Date()));
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].date > entries[i - 1].date).toBe(true);
    }
  });

  it('starts the demo on a 49-day streak with today still open', () => {
    expect(entries.at(-1)?.completed).toBe(false);
    expect(computeCurrentStreak(entries)).toBe(49);
  });

  it('is deterministic for a given day', () => {
    expect(generateStreakData(105)).toEqual(entries);
  });
});
