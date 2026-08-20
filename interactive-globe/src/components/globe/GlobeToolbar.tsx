import type { RefObject } from 'react';
import type { GlobeHandle } from './Globe';
import { ZoomControls } from './ZoomControls';

export function GlobeToolbar({ globeRef }: { globeRef: RefObject<GlobeHandle> }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex flex-wrap items-center justify-center gap-2 px-4">
      <span className="pill hidden rounded-full px-3 py-1.5 font-mono text-[11px] tracking-wide text-muted sm:block">
        drag to spin · scroll to zoom · click to route
      </span>
      <ZoomControls
        onZoomIn={() => globeRef.current?.zoomIn()}
        onZoomOut={() => globeRef.current?.zoomOut()}
      />
    </div>
  );
}
