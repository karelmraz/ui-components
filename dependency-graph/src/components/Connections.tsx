import { useMemo } from 'react';
import type { PackageNode, Dependency } from '../graph/types';
import { clamp } from '../graph/layout';
import { getNodeState, type SelectionSnapshot } from '../hooks/useGraphSelection';

export interface ConnectionsProps {
  nodes: PackageNode[];
  connections: Dependency[];
  selection: SelectionSnapshot;
  /** Matches the scale applied to node radii, so edges keep meeting the rims */
  radiusScale: number;
  containerWidth: number;
  containerHeight: number;
}

/** One decimal is plenty at this canvas size and keeps the path strings short */
const px = (n: number) => n.toFixed(1);

function hashDelay(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 3000) / 1000;
}

export function Connections({
  nodes,
  connections,
  selection,
  radiusScale,
  containerWidth,
  containerHeight,
}: ConnectionsProps) {
  // Bezier geometry for every edge only depends on layout, not on selection — keep it across re-renders
  const paths = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) return [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return connections.flatMap((conn, i) => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      if (!fromNode || !toNode) return [];

      const fromCx = (fromNode.x / 100) * containerWidth;
      const fromCy = (fromNode.y / 100) * containerHeight;
      const toCx = (toNode.x / 100) * containerWidth;
      const toCy = (toNode.y / 100) * containerHeight;

      const fromR = fromNode.r * radiusScale;
      const toR = toNode.r * radiusScale;

      const dy = toCy - fromCy;

      // Fan the departure point across the source's arc toward each target, so a
      // hub's edges leave along its rim instead of bunching through its label.
      const spread = clamp((toCx - fromCx) * 0.2, -fromR * 0.7, fromR * 0.7);
      const startX = fromCx + spread;
      const rimY = Math.sqrt(Math.max(fromR * fromR - spread * spread, 0));

      let startY: number, endY: number;
      if (Math.abs(dy) < fromR + toR) {
        startY = fromCy;
        endY = toCy;
      } else if (dy > 0) {
        startY = fromCy + rimY;
        endY = toCy - toR;
      } else {
        startY = fromCy - rimY;
        endY = toCy + toR;
      }

      const midY = (startY + endY) / 2;
      const key = `${conn.from}-${conn.to}`;

      return [
        {
          key,
          index: i,
          fromId: conn.from,
          toId: conn.to,
          d: `M ${px(startX)} ${px(startY)} C ${px(startX)} ${px(midY)}, ${px(toCx)} ${px(midY)}, ${px(toCx)} ${px(endY)}`,
          delay: hashDelay(key),
        },
      ];
    });
  }, [nodes, connections, radiusScale, containerWidth, containerHeight]);

  if (containerWidth === 0 || containerHeight === 0) return null;

  return (
    <svg
      className="!absolute inset-0 pointer-events-none"
      aria-hidden="true"
      width={containerWidth}
      height={containerHeight}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      // Resting edges run behind the opaque nodes; with a selection active the layer
      // lifts above them, so the chosen package's edges trace visibly to their targets
      style={{ zIndex: selection.selectedId ? 20 : 1 }}
    >
      {paths.map((p) => {
        // An edge takes its state from its endpoints, through the same rules the nodes use
        const from = getNodeState(p.fromId, selection);
        const to = getNodeState(p.toId, selection);
        const isRelated = from.emphasis !== 'none' && to.emphasis !== 'none';
        const isDimmed = from.dimmed || to.dimmed;

        return (
          <g key={p.key} opacity={isDimmed ? 0.3 : 1}>
            <DrawPath
              d={p.d}
              stroke={isRelated ? 'var(--connection-highlight)' : 'var(--connection-line)'}
              strokeWidth={isRelated ? 2.5 : 2}
              delay={0.7 + p.index * 0.03}
            />

            <circle
              r={isRelated ? 3 : 2}
              fill={isRelated ? 'var(--accent)' : 'var(--particle-dim)'}
              className="animate-[orbit_4s_linear_infinite]"
              style={{
                offsetPath: `path("${p.d}")`,
                animationDelay: `${-p.delay}s`,
                animationDuration: isRelated ? '2s' : '4s',
                willChange: 'offset-distance',
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

interface DrawPathProps {
  d: string;
  stroke: string;
  strokeWidth: number;
  delay: number;
}

/** Draw-in via pathLength={1}: the browser normalises the length, so no measuring render */
function DrawPath({ d, stroke, strokeWidth, delay }: DrawPathProps) {
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={1}
      strokeDashoffset={1}
      style={{
        animation: 'draw-line 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        animationDelay: `${delay}s`,
      }}
    />
  );
}
