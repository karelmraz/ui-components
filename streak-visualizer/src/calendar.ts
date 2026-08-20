import { toDateKey, type DayEntry } from './data';

export const WEEKS_TO_SHOW = 15;

const INTENSITY_LABELS = ['', 'Light', 'Moderate', 'Strong', 'Intense'];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getStatusLabel(entry: DayEntry, isToday: boolean): string {
  if (isToday && !entry.completed && !entry.freeze) return 'Today — not yet completed';
  if (entry.freeze) return 'Streak freeze';
  if (entry.intensity === 0) return 'No activity';
  return INTENSITY_LABELS[entry.intensity];
}

/** Placeholder for a day that has no entry yet */
export function emptyEntry(date: string): DayEntry {
  return { date, completed: false, freeze: false, intensity: 0 };
}

export interface CalendarGrid {
  /** One column per week, Monday first; days after today are null */
  weeks: (DayEntry | null)[][];
  /** Short month name keyed by the week column in which that month starts */
  monthLabels: Map<number, string>;
  entryByDate: Map<string, DayEntry>;
}

/** Lay out the trailing weeks (ending with the current one) as columns for the heatmap */
export function buildCalendarGrid(entries: DayEntry[], today: Date = new Date()): CalendarGrid {
  const entryByDate = new Map(entries.map((e) => [e.date, e]));

  // Back up to the Monday that starts the first visible week
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (WEEKS_TO_SHOW * 7 - 1) - ((startDate.getDay() + 6) % 7));

  const weeks: (DayEntry | null)[][] = [];
  const monthLabels = new Map<number, string>();
  let lastMonth = -1;
  const cursor = new Date(startDate);

  while (cursor <= today || weeks.length < WEEKS_TO_SHOW) {
    const week: (DayEntry | null)[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const dateStr = toDateKey(cursor);
      week.push(cursor > today ? null : entryByDate.get(dateStr) || emptyEntry(dateStr));
      if (dow === 0 && cursor.getMonth() !== lastMonth && cursor <= today) {
        lastMonth = cursor.getMonth();
        monthLabels.set(weeks.length, cursor.toLocaleDateString('en-US', { month: 'short' }));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (weeks.length > WEEKS_TO_SHOW + 1) break;
  }

  return { weeks, monthLabels, entryByDate };
}
