import { layoutGraph } from '../graph/layout';

/** Ghost graph shown while the first fetch is in flight, laid out like a typical result */
const GHOST_IDS = ['root', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const GHOST_POSITIONS = [...layoutGraph(GHOST_IDS).values()];

export function GraphSkeleton({ label }: { label: string }) {
  return (
    <div className="absolute inset-0" role="status" aria-label={label}>
      {GHOST_POSITIONS.map((pos, i) => (
        <div
          key={i}
          className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-[1.5px] border-[var(--border-subtle)] bg-[var(--node-default-bg)] animate-pulse"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, animationDelay: `${i * 120}ms` }}
        />
      ))}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-4 text-[11px] text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  );
}
