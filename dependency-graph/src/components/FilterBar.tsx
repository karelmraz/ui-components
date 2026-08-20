import type { PackageCategory } from '../graph/types';
import { CATEGORY_META } from '../data/categories';
import type { GraphFilter } from '../hooks/useGraphSelection';
import { Icon } from './Icons';

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as PackageCategory[];

export const CHIP =
  'text-[11px] font-semibold px-3 py-1 rounded-full border cursor-pointer transition-colors';
const CHIP_IDLE = 'bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)]';

export interface FilterBarProps {
  /** null shows every package */
  filter: GraphFilter | null;
  /** Categories present in the current graph — chips with no members are not rendered */
  available: ReadonlySet<PackageCategory>;
  onFilterChange: (filter: GraphFilter | null) => void;
}

export function FilterBar({ filter, available, onFilterChange }: FilterBarProps) {
  const issuesActive = filter === 'issues';

  return (
    <div
      className="flex flex-wrap items-center gap-1 mb-3"
      role="toolbar"
      aria-label="Filter packages"
    >
      <button
        type="button"
        aria-pressed={filter === null}
        title="Show every package"
        className={`${CHIP} ${
          filter === null
            ? 'bg-[var(--accent)] text-[var(--page-bg)] border-transparent'
            : `${CHIP_IDLE} hover:text-[var(--text-secondary)]`
        }`}
        onClick={() => onFilterChange(null)}
      >
        All
      </button>

      {ALL_CATEGORIES.filter((cat) => available.has(cat)).map((cat) => {
        const meta = CATEGORY_META[cat];
        const active = filter === cat;
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={active}
            title={meta.hint}
            className={`flex items-center gap-1 ${CHIP} ${
              active
                ? 'border-transparent text-[var(--page-bg)]'
                : `${CHIP_IDLE} hover:text-[var(--text-secondary)]`
            }`}
            // Only the background stays inline: the var *name* is data (--cat-core, --cat-testing, …)
            style={active ? { background: `var(--cat-${cat})` } : undefined}
            onClick={() => onFilterChange(active ? null : cat)}
          >
            <Icon name={meta.icon} size={11} />
            {meta.label}
          </button>
        );
      })}

      <button
        type="button"
        aria-pressed={issuesActive}
        title="Vulnerabilities or outdated versions"
        className={`flex items-center gap-1 ${CHIP} ${
          issuesActive
            ? 'bg-[var(--vuln-high-bg)] text-[var(--vuln-high-text)] border-[var(--vuln-high-border)]'
            : `${CHIP_IDLE} hover:text-[var(--vuln-high-text)]`
        }`}
        onClick={() => onFilterChange(issuesActive ? null : 'issues')}
      >
        <Icon name="alert-triangle" size={11} />
        Issues
      </button>
    </div>
  );
}
