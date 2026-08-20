import { createPortal } from 'react-dom';
import { CATEGORY_META, VULN_LABELS } from '../data/categories';
import type { PackageNode } from '../graph/types';
import type { TooltipPlacement } from '../hooks/useAnchoredTooltip';
import { Icon } from './Icons';

export interface NodeTooltipProps {
  pkg: PackageNode;
  placement: TooltipPlacement;
}

/** Package details card, portaled to <body> so it escapes the canvas' overflow clipping */
export function NodeTooltip({ pkg, placement }: NodeTooltipProps) {
  const catMeta = CATEGORY_META[pkg.category];

  return createPortal(
    <div
      className="node-tooltip-enter"
      style={{
        position: 'fixed',
        ...placement,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div className="rounded-2xl px-5 py-4 min-w-[220px] max-w-[280px] relative overflow-hidden bg-[var(--tooltip-bg)] border border-[var(--tooltip-border)] shadow-[var(--tooltip-shadow)]">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ background: `var(--cat-${pkg.category})`, color: '#fff' }}
            >
              <Icon name={catMeta.icon} size={11} />
            </div>
            <span className="text-[14px] font-bold tracking-tight text-[var(--text-primary)] truncate">
              {pkg.name}
            </span>
          </div>

          <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] mb-3">
            {pkg.description}
          </p>

          <div className="h-px w-full mb-2.5 bg-[var(--tooltip-divider)]" />

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
            <span className="text-[var(--text-muted)]">Version</span>
            <span className="text-[var(--text-primary)] font-mono font-medium">{pkg.version}</span>
            <span className="text-[var(--text-muted)]">License</span>
            <span className="text-[var(--text-primary)] font-medium">{pkg.license}</span>
            {pkg.size && (
              <>
                <span className="text-[var(--text-muted)]">Size</span>
                <span className="text-[var(--text-primary)] font-medium">{pkg.size}</span>
              </>
            )}
            <span className="text-[var(--text-muted)]">Category</span>
            <span className="font-medium" style={{ color: `var(--cat-${pkg.category})` }}>
              {catMeta.label}
            </span>
          </div>

          {pkg.vulnerability !== 'none' && (
            <div
              className="mt-2.5 flex items-center gap-1.5 text-[12px] font-bold"
              style={{ color: `var(--vuln-${pkg.vulnerability}-text)` }}
            >
              <Icon
                name="alert-triangle"
                size={12}
                style={{ color: `var(--vuln-${pkg.vulnerability}-text)` }}
              />
              {pkg.vulnCount} {VULN_LABELS[pkg.vulnerability]}
            </div>
          )}

          {pkg.outdated && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--outdated-text)]">
              <Icon name="clock" size={12} />
              Outdated — update available
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
