import { memo } from 'react';
import type { PackageNode as PackageNodeData, VulnSeverity } from '../graph/types';
import { CATEGORY_META } from '../data/categories';
import { useAnchoredTooltip } from '../hooks/useAnchoredTooltip';
import type { NodeEmphasis } from '../hooks/useGraphSelection';
import { Icon } from './Icons';
import { NodeTooltip } from './NodeTooltip';

export interface PackageNodeProps {
  pkg: PackageNodeData;
  emphasis: NodeEmphasis;
  /** Faded out: outside the selected neighborhood, or hidden by the active filter */
  dimmed: boolean;
  /** Entrance animation delay in ms — view choreography, staggered by the parent */
  delay: number;
  /** Rendered radius in px — the model's radius, scaled down by the parent on narrow canvases */
  r: number;
  isDark: boolean;
  onSelect: (id: string) => void;
}

/** The tint over an opaque canvas-colour base, so edges passing under a node can't show through it */
const opaque = (tint: string) => `linear-gradient(${tint}, ${tint}), var(--canvas-bg)`;

/** Border / fill / glow of the node button for a given emphasis and vulnerability */
function getNodeSurface(emphasis: NodeEmphasis, vulnerability: VulnSeverity) {
  if (emphasis === 'selected') {
    return {
      borderColor: 'var(--node-selected-border)',
      background: opaque('var(--node-selected-bg)'),
      boxShadow: 'var(--node-selected-glow)',
    };
  }
  const hasVuln = vulnerability !== 'none';
  return {
    borderColor: hasVuln ? `var(--vuln-${vulnerability}-border)` : 'var(--node-default-border)',
    background: opaque(hasVuln ? `var(--vuln-${vulnerability}-bg)` : 'var(--node-default-bg)'),
    boxShadow: emphasis === 'highlighted' ? 'var(--node-hover-glow)' : 'var(--node-default-shadow)',
  };
}

// Memoized: up to 17 instances are re-rendered by every App render (selection, filter, resize);
// with primitive props only the nodes whose state changed do any work.
export const PackageNodeComponent = memo(function PackageNodeComponent({
  pkg,
  emphasis,
  dimmed,
  delay,
  r,
  isDark,
  onSelect,
}: PackageNodeProps) {
  const tooltip = useAnchoredTooltip<HTMLButtonElement>();

  const isSelected = emphasis === 'selected';
  const hasVuln = pkg.vulnerability !== 'none';
  const overrideColor = isDark ? pkg.colorDark : pkg.colorLight;
  const catColor = overrideColor ?? `var(--cat-${pkg.category})`;
  const size = r * 2;

  return (
    <div
      className="absolute flex flex-col items-center node-enter"
      style={{
        left: `${pkg.x}%`,
        top: `${pkg.y}%`,
        width: size,
        marginLeft: -r,
        marginTop: -r,
        zIndex: tooltip.open || isSelected ? 30 : 5,
        opacity: dimmed ? 0.2 : 1,
        transition: 'opacity 0.15s ease',
        animationDelay: `${delay}ms`,
      }}
    >
      {hasVuln && !dimmed && (
        <div
          className="absolute rounded-full pointer-events-none animate-[pulse-ring_3s_ease-in-out_infinite]"
          style={{
            width: size + 12,
            height: size + 12,
            top: -6,
            left: -6,
            border: `2px solid var(--vuln-${pkg.vulnerability}-border)`,
          }}
        />
      )}

      <button
        ref={tooltip.anchorRef}
        type="button"
        className="node-btn relative flex items-center justify-center rounded-full border-[1.5px] select-none cursor-pointer"
        style={{
          width: size,
          height: size,
          ...getNodeSurface(emphasis, pkg.vulnerability),
        }}
        onClick={() => onSelect(pkg.id)}
        onMouseEnter={tooltip.show}
        onMouseLeave={tooltip.hide}
        onFocus={tooltip.show}
        onBlur={tooltip.hide}
        aria-label={`${pkg.name} v${pkg.version}`}
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, ${catColor} 0deg, ${catColor} 90deg, transparent 90deg)`,
            opacity: 0.25,
            maskImage: 'radial-gradient(circle, transparent 60%, black 62%, black 100%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 60%, black 62%, black 100%)',
          }}
        />
        <Icon name={CATEGORY_META[pkg.category].icon} size={r * 0.6} style={{ color: catColor }} />
      </button>

      {/* Halo in the canvas colour keeps labels readable where edges pass behind them */}
      <div className="flex flex-col items-center mt-1 pointer-events-none [text-shadow:0_0_4px_var(--canvas-bg),0_0_8px_var(--canvas-bg)]">
        <span className="text-[10px] font-bold text-[var(--text-primary)] leading-tight text-center max-w-[90px] truncate">
          {pkg.name}
        </span>
        <div className="flex items-center gap-0.5 mt-0.5">
          <span className="text-[9px] font-mono text-[var(--text-muted)]">{pkg.version}</span>
          {hasVuln && (
            <span
              className="w-[5px] h-[5px] rounded-full animate-pulse"
              style={{ background: `var(--vuln-${pkg.vulnerability}-text)` }}
            />
          )}
          {pkg.outdated && (
            <span className="text-[8px] font-bold px-0.5 rounded bg-[var(--outdated-bg)] text-[var(--outdated-text)]">
              OLD
            </span>
          )}
        </div>
      </div>

      {tooltip.placement && <NodeTooltip pkg={pkg} placement={tooltip.placement} />}
    </div>
  );
});
