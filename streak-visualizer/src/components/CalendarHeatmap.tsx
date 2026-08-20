import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toDateKey, type DayEntry } from '../data';
import { buildCalendarGrid, emptyEntry, formatDate, getStatusLabel } from '../calendar';
import { HeatmapCell, CELL_SIZE } from './HeatmapCell';

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const HEAT_SCALE = [
  'var(--heat-empty)',
  'var(--heat-low)',
  'var(--heat-med)',
  'var(--heat-high)',
  'var(--heat-max)',
];

interface TooltipPosition {
  x: number;
  y: number;
  below: boolean;
}

interface CalendarHeatmapProps {
  entries: DayEntry[];
  onCycleDay: (date: string) => void;
  delay?: number;
}

function HeatmapLegend({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex items-center justify-end gap-1 mt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <span className="text-xs mr-1 text-[var(--text-muted)]">Less</span>
      {HEAT_SCALE.map((color, i) => (
        <div key={i} className="size-3 rounded-[2px]" style={{ backgroundColor: color }} />
      ))}
      <span className="text-xs ml-1 text-[var(--text-muted)]">More</span>
      <div className="w-3" />
      <div className="size-3 rounded-[2px] bg-[var(--freeze-bg)] border border-[var(--freeze-border)]" />
      <span className="text-xs ml-0.5 text-[var(--freeze-text)]">Freeze</span>
    </motion.div>
  );
}

export function CalendarHeatmap({ entries, onCycleDay, delay = 0 }: CalendarHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tappedDate, setTappedDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const activeDate = hoveredDate || tappedDate;
  const containerRef = useRef<HTMLDivElement>(null);

  // Pressing a cell selects it (keeps its tooltip open); pressing anywhere else clears the selection
  useEffect(() => {
    if (!tappedDate) return;
    const handler = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-heatmap-cell]')) return;
      setTappedDate(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [tappedDate]);

  // The three handlers below go to the memoised cells, so they must keep their identity across hovers
  const handleClick = useCallback(
    (date: string) => {
      if (tappedDate === date) {
        setTappedDate(null);
        onCycleDay(date);
      } else {
        setTappedDate(date);
      }
    },
    [tappedDate, onCycleDay],
  );

  const handleMouseEnter = useCallback((date: string, el: HTMLElement, dayIndex: number) => {
    setHoveredDate(date);
    const container = containerRef.current;
    const containerRect = container?.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    if (containerRect && container) {
      const below = dayIndex <= 1;
      setTooltipPos({
        x: rect.left - containerRect.left + container.scrollLeft,
        y: below ? rect.bottom - containerRect.top + 4 : rect.top - containerRect.top - 4,
        below,
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredDate(null);
    setTooltipPos(null);
  }, []);

  const today = new Date();
  const todayStr = toDateKey(today);
  const { weeks, monthLabels, entryByDate } = buildCalendarGrid(entries, today);
  const activeEntry = activeDate ? (entryByDate.get(activeDate) ?? emptyEntry(activeDate)) : null;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full pb-2 overflow-x-auto streak-scroll"
        role="region"
        aria-label="Activity calendar heatmap"
        tabIndex={0}
      >
        <div className="min-w-[420px]">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, wIdx) => (
              <motion.div
                key={wIdx}
                className="text-xs font-medium text-[var(--text-muted)]"
                style={{ width: CELL_SIZE, minWidth: CELL_SIZE, marginRight: 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + wIdx * 0.03 }}
              >
                {monthLabels.get(wIdx) || ''}
              </motion.div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-1 gap-px">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-xs font-medium flex items-center justify-end text-[var(--text-muted)]"
                  style={{ height: CELL_SIZE, width: CELL_SIZE }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-px">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-px">
                  {week.map((entry, dIdx) =>
                    entry ? (
                      <HeatmapCell
                        key={entry.date}
                        entry={entry}
                        isToday={entry.date === todayStr}
                        isActive={activeDate === entry.date}
                        dayIndex={dIdx}
                        delay={delay + wIdx * 0.03 + dIdx * 0.015}
                        onClick={handleClick}
                        onEnter={handleMouseEnter}
                        onLeave={handleMouseLeave}
                      />
                    ) : (
                      <div key={dIdx} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>

          <HeatmapLegend delay={delay + 0.6} />
        </div>
      </div>

      <AnimatePresence>
        {activeDate && activeEntry && tooltipPos && (
          <motion.div
            id={`tooltip-${activeDate}`}
            role="tooltip"
            className="absolute px-3 py-2 rounded-lg pointer-events-none z-50 whitespace-nowrap bg-[var(--card-bg)] border border-[var(--divider)] shadow-lg -translate-x-1/2"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.below ? tooltipPos.y : undefined,
              bottom: !tooltipPos.below ? `calc(100% - ${tooltipPos.y}px)` : undefined,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
          >
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              {formatDate(activeDate)}
            </div>
            <div className="text-xs mt-0.5 text-[var(--text-muted)]">
              {getStatusLabel(activeEntry, activeDate === todayStr)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
