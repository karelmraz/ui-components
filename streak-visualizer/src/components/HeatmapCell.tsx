import { memo } from 'react';
import { motion } from 'framer-motion';
import type { DayEntry } from '../data';
import { formatDate, getStatusLabel } from '../calendar';

export const CELL_SIZE = 24;
const INNER_SIZE = 16;

function getHeatColor(entry: DayEntry): string {
  if (entry.freeze) return 'var(--freeze-bg)';
  switch (entry.intensity) {
    case 0:
      return 'var(--heat-empty)';
    case 1:
      return 'var(--heat-low)';
    case 2:
      return 'var(--heat-med)';
    case 3:
      return 'var(--heat-high)';
    case 4:
      return 'var(--heat-max)';
  }
}

function getBorderStyle(entry: DayEntry, isToday: boolean): string {
  if (isToday) return '2px solid var(--today-ring)';
  if (entry.freeze) return '1px solid var(--freeze-border)';
  return '1px solid transparent';
}

interface HeatmapCellProps {
  entry: DayEntry;
  isToday: boolean;
  isActive: boolean;
  /** Row within the week column (0 = Monday); used to decide tooltip placement */
  dayIndex: number;
  delay: number;
  onClick: (date: string) => void;
  onEnter: (date: string, el: HTMLElement, dayIndex: number) => void;
  onLeave: () => void;
}

// Memoised on purpose: every hover re-renders the heatmap, and ~100 motion buttons would otherwise render each time
export const HeatmapCell = memo(function HeatmapCell({
  entry,
  isToday,
  isActive,
  dayIndex,
  delay,
  onClick,
  onEnter,
  onLeave,
}: HeatmapCellProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    >
      <motion.button
        data-heatmap-cell
        type="button"
        className="rounded-[3px] cursor-pointer relative flex items-center justify-center border-none bg-transparent p-0"
        style={{ width: CELL_SIZE, height: CELL_SIZE }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut', delay }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onClick(entry.date)}
        onMouseEnter={(e) => onEnter(entry.date, e.currentTarget, dayIndex)}
        onMouseLeave={onLeave}
        onFocus={(e) => onEnter(entry.date, e.currentTarget, dayIndex)}
        onBlur={onLeave}
        aria-label={`${formatDate(entry.date)}: ${getStatusLabel(entry, isToday)}`}
        aria-describedby={isActive ? `tooltip-${entry.date}` : undefined}
      >
        <span
          className="rounded-[3px] block pointer-events-none"
          style={{
            width: INNER_SIZE,
            height: INNER_SIZE,
            backgroundColor: getHeatColor(entry),
            border: getBorderStyle(entry, isToday),
          }}
        />
      </motion.button>
    </div>
  );
});
