import type { PackageNode } from '../graph/types';
import { CATEGORY_META, VULN_LABELS } from '../data/categories';
import type { GraphModel } from '../graph/model';
import { formatDownloads } from '../graph/npm';
import { Icon } from './Icons';

export interface DetailPanelProps {
  pkg: PackageNode;
  model: GraphModel;
  onClose: () => void;
}

const divider = <span className="w-px h-3 bg-[var(--border-subtle)]" />;

export function DetailPanel({ pkg, model, onClose }: DetailPanelProps) {
  const dependents = model.packages.filter((p) => p.dependencies.includes(pkg.id));

  return (
    <div
      className="panel-enter border-t border-[var(--border-subtle)] bg-[var(--tooltip-bg)] px-4 py-3"
      role="region"
      aria-label={`Details for ${pkg.name}`}
    >
      {/* Top row: name + close */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `var(--cat-${pkg.category})`, color: 'var(--page-bg)' }}
          >
            <Icon name={CATEGORY_META[pkg.category].icon} size={14} />
          </div>
          <div>
            <span className="text-[13px] font-bold text-[var(--text-primary)]">{pkg.name}</span>
            <span className="text-[11px] font-mono ml-2 px-1.5 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)]">
              v{pkg.version}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer p-1"
          aria-label="Close"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap text-[11px]">
        <span className="text-[var(--text-muted)]" style={{ color: `var(--cat-${pkg.category})` }}>
          {CATEGORY_META[pkg.category].label}
        </span>

        {divider}

        <span className="text-[var(--text-secondary)]">{pkg.license}</span>

        {pkg.size && (
          <>
            {divider}
            <span className="text-[var(--text-secondary)]">{pkg.size}</span>
          </>
        )}

        {pkg.downloads !== undefined && (
          <>
            {divider}
            <span className="text-[var(--text-secondary)]">{formatDownloads(pkg.downloads)}</span>
          </>
        )}

        {divider}

        {pkg.vulnerability !== 'none' ? (
          <span
            className="font-bold flex items-center gap-1"
            style={{ color: `var(--vuln-${pkg.vulnerability}-text)` }}
          >
            <Icon
              name="alert-triangle"
              size={12}
              style={{ color: `var(--vuln-${pkg.vulnerability}-text)` }}
            />
            {pkg.vulnCount} {VULN_LABELS[pkg.vulnerability]}
          </span>
        ) : (
          <span className="font-semibold text-[var(--vuln-none-text)] flex items-center gap-1">
            <Icon name="check-circle" size={12} />
            Clean
          </span>
        )}

        {pkg.outdated && (
          <span className="font-bold text-[var(--outdated-text)] flex items-center gap-1">
            <Icon name="clock" size={12} />
            Outdated
          </span>
        )}
      </div>

      {/* Deps row */}
      {(pkg.dependencies.length > 0 || dependents.length > 0 || model.source === 'live') && (
        <div className="flex items-center gap-3 flex-wrap text-[11px] mt-2 pt-2 border-t border-[var(--border-subtle)]">
          {pkg.dependencies.length > 0 && (
            <span className="text-[var(--text-muted)]">
              <span className="text-[var(--text-secondary)] font-semibold">Deps:</span>{' '}
              {pkg.dependencies.map((id) => model.byId.get(id)?.name ?? id).join(', ')}
            </span>
          )}

          {dependents.length > 0 && (
            <span className="text-[var(--text-muted)]">
              <span className="text-[var(--text-secondary)] font-semibold">Used by:</span>{' '}
              {dependents.map((d) => d.name).join(', ')}
            </span>
          )}

          {model.source === 'live' && (
            <a
              href={`https://www.npmjs.com/package/${pkg.name}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-[var(--accent)] hover:underline font-semibold"
            >
              npm ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
