import { useState } from 'react';
import { PackageNotFoundError } from './graph/fetchGraph';
import { useTheme } from './hooks/useTheme';
import { DEFAULT_PACKAGE, useDependencyGraph } from './hooks/useDependencyGraph';
import { SAMPLE_MODEL } from './data/sample';
import { useGraphSelection, getNodeState } from './hooks/useGraphSelection';
import { useElementSize } from './hooks/useElementSize';
import { PackageNodeComponent } from './components/PackageNode';
import { Connections } from './components/Connections';
import { Header } from './components/Header';
import { FilterBar, CHIP } from './components/FilterBar';
import { DetailPanel } from './components/DetailPanel';
import { PackageSearch } from './components/PackageSearch';
import { GraphSkeleton } from './components/GraphSkeleton';
import { ThemeToggle } from './components/ThemeToggle';

const ACTION_BUTTON = `${CHIP} border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]`;

function App() {
  const { isDark, themeVars, toggleTheme } = useTheme();
  const [pkgName, setPkgName] = useState(DEFAULT_PACKAGE);
  const [useSample, setUseSample] = useState(false);
  const query = useDependencyGraph(pkgName, { enabled: !useSample });
  const model = useSample ? SAMPLE_MODEL : (query.data ?? null);
  const graph = useGraphSelection(model);
  const [containerRef, containerSize] = useElementSize<HTMLDivElement>();

  // In sample mode the query is disabled, so isFetching is already false
  const busy = query.isFetching;
  const notFound = query.error instanceof PackageNotFoundError;

  // Narrow canvases render every node a fifth smaller so four-per-row keeps breathing room
  const radiusScale = containerSize.width > 0 && containerSize.width < 460 ? 0.8 : 1;

  const search = (name: string) => {
    setUseSample(false);
    setPkgName(name);
  };

  return (
    <main
      className="flex items-center justify-center min-h-screen p-3 sm:p-5 bg-[var(--page-bg)]"
      style={themeVars}
    >
      <div className="theme-transition w-full max-w-[520px] lg:max-w-[720px] xl:max-w-[800px] mx-auto">
        <div className="card-enter rounded-xl p-3 sm:p-4 lg:p-5 relative bg-[var(--card-bg)] shadow-[var(--card-shadow)] border border-[var(--border-subtle)]">
          <Header
            totalPackages={model?.packages.length ?? 0}
            vulnCount={model?.vulnCount ?? 0}
            depCount={model?.dependencies.length ?? 0}
          >
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </Header>

          <PackageSearch defaultValue={pkgName} busy={busy} onSubmit={search} />

          {query.error && model?.source === 'live' && (
            <div
              role="alert"
              className="mb-3 text-[11px] px-3 py-2 rounded-lg border border-[var(--vuln-high-border)] bg-[var(--vuln-high-bg)] text-[var(--vuln-high-text)]"
            >
              {notFound
                ? query.error.message
                : 'The npm registry did not answer — showing the previous graph.'}
            </div>
          )}

          <FilterBar
            filter={graph.filter}
            available={model?.categories ?? new Set()}
            onFilterChange={graph.setFilter}
          />

          <div
            className="dot-grid rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-bg)] relative overflow-hidden"
            aria-label="Dependency graph"
          >
            {/* Small screens: the canvas is taller than its window (roomier gaps) and scrolls
                inside it; desktop cards show the whole graph at a viewport-bounded height */}
            <div className="max-h-[70vh] overflow-y-auto overscroll-contain lg:max-h-none lg:overflow-visible">
              <div
                ref={containerRef}
                className="relative w-full aspect-[9/14] min-h-[780px] lg:min-h-0 lg:aspect-auto lg:h-[min(680px,72vh)]"
              >
                {model ? (
                  <>
                    <Connections
                      nodes={model.packages}
                      connections={model.dependencies}
                      selection={graph}
                      radiusScale={radiusScale}
                      containerWidth={containerSize.width}
                      containerHeight={containerSize.height}
                    />
                    {model.packages.map((pkg, i) => {
                      const { emphasis, dimmed } = getNodeState(pkg.id, graph);
                      return (
                        <PackageNodeComponent
                          key={pkg.id}
                          pkg={pkg}
                          emphasis={emphasis}
                          dimmed={dimmed}
                          delay={100 + i * 30}
                          r={Math.round(pkg.r * radiusScale)}
                          isDark={isDark}
                          onSelect={graph.toggleSelect}
                        />
                      );
                    })}
                    {model.source === 'live' && model.packages.length === 1 && (
                      <span className="absolute left-1/2 -translate-x-1/2 top-[34%] text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                        {model.packages[0].name} has no runtime dependencies
                      </span>
                    )}
                  </>
                ) : query.error ? (
                  <div
                    role="alert"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
                  >
                    <span className="text-[12px] text-[var(--text-secondary)]">
                      {notFound ? query.error.message : 'Could not reach the npm registry.'}
                    </span>
                    <div className="flex gap-2">
                      {!notFound && (
                        <button
                          type="button"
                          className={ACTION_BUTTON}
                          onClick={() => query.refetch()}
                        >
                          Try again
                        </button>
                      )}
                      <button
                        type="button"
                        className={ACTION_BUTTON}
                        onClick={() => setUseSample(true)}
                      >
                        Use sample data
                      </button>
                    </div>
                  </div>
                ) : (
                  <GraphSkeleton label={`Fetching ${pkgName} from the npm registry`} />
                )}
              </div>
            </div>

            {graph.selectedPkg && model && (
              <div className="absolute bottom-0 left-0 right-0 z-40">
                <DetailPanel pkg={graph.selectedPkg} model={model} onClose={graph.clearSelection} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)] shrink-0">
                {model?.source === 'sample' ? 'sample data' : 'registry.npmjs.org'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] truncate">
                {busy
                  ? `fetching ${pkgName}…`
                  : model
                    ? `${model.packages.length} package${model.packages.length === 1 ? '' : 's'} · ${model.dependencies.length} edge${model.dependencies.length === 1 ? '' : 's'}${
                        model.overflow > 0 ? ` · +${model.overflow} more deps` : ''
                      }`
                    : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {model?.source === 'sample' && (
                <button
                  type="button"
                  onClick={() => setUseSample(false)}
                  className="text-[10px] font-semibold text-[var(--accent)] cursor-pointer hover:underline"
                >
                  Go live
                </button>
              )}
              {(model?.vulnCount ?? 0) > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--vuln-high-bg)] text-[var(--vuln-high-text)] border border-[var(--vuln-high-border)]">
                  {model?.vulnCount} advisories
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
