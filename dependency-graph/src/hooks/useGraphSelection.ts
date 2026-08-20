import { useCallback, useState } from 'react';
import type { PackageCategory, PackageNode } from '../graph/types';
import type { GraphModel } from '../graph/model';

/** Active filter chip: a single category, or everything with a vulnerability / outdated version */
export type GraphFilter = PackageCategory | 'issues';

/** How strongly a node is drawn relative to the current selection */
export type NodeEmphasis = 'none' | 'highlighted' | 'selected';

export interface GraphSelection {
  selectedId: string | null;
  selectedPkg: PackageNode | null;
  /** Selected node plus its direct neighbors; null while nothing is selected */
  highlightedIds: ReadonlySet<string> | null;
  /** Ids passing the active filter; null while no filter is active */
  visiblePkgIds: ReadonlySet<string> | null;
  filter: GraphFilter | null;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setFilter: (filter: GraphFilter | null) => void;
}

/**
 * A category filter can outlive its graph (searching swaps the model); one the
 * current graph doesn't contain resolves to no filter, since its chip isn't
 * rendered. 'issues' always has a chip, so it always survives.
 */
function resolveFilter(filter: GraphFilter | null, model: GraphModel | null): GraphFilter | null {
  if (filter === null || filter === 'issues' || model === null) return filter;
  return model.categories.has(filter) ? filter : null;
}

function matchesFilter(pkg: PackageNode, filter: GraphFilter): boolean {
  if (filter === 'issues') return pkg.vulnerability !== 'none' || Boolean(pkg.outdated);
  return pkg.category === filter;
}

export function useGraphSelection(model: GraphModel | null): GraphSelection {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<GraphFilter | null>(null);

  // Stable: handed to every memoized node
  const toggleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  // A selection can outlive its graph (searching swaps the model);
  // an id the current graph doesn't know resolves to no selection.
  const selectedPkg = (selectedId ? model?.byId.get(selectedId) : null) ?? null;
  const liveSelectedId = selectedPkg ? selectedId : null;

  const liveFilter = resolveFilter(filter, model);

  const visiblePkgIds =
    liveFilter && model
      ? new Set(model.packages.filter((p) => matchesFilter(p, liveFilter)).map((p) => p.id))
      : null;

  return {
    selectedId: liveSelectedId,
    selectedPkg,
    highlightedIds: liveSelectedId ? (model?.relatedMap.get(liveSelectedId) ?? null) : null,
    visiblePkgIds,
    filter: liveFilter,
    toggleSelect,
    clearSelection: () => setSelectedId(null),
    setFilter,
  };
}

/** The slice of the selection that node and edge rendering read */
export type SelectionSnapshot = Pick<
  GraphSelection,
  'selectedId' | 'highlightedIds' | 'visiblePkgIds'
>;

/** Per-node render state under the current selection and filter; kept next to the hook so nodes and edges agree */
export function getNodeState(
  id: string,
  { selectedId, highlightedIds, visiblePkgIds }: SelectionSnapshot,
): { emphasis: NodeEmphasis; dimmed: boolean } {
  const highlighted = highlightedIds?.has(id) ?? false;
  const emphasis: NodeEmphasis =
    selectedId === id ? 'selected' : highlighted ? 'highlighted' : 'none';
  const dimmed =
    (selectedId !== null && !highlighted) || (visiblePkgIds !== null && !visiblePkgIds.has(id));
  return { emphasis, dimmed };
}
