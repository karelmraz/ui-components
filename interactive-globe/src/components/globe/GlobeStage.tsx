import { lazy, Suspense } from 'react';
import type { RefObject } from 'react';
import type { GlobeHandle } from './Globe';
import type { Theme } from '../../theme';

const Globe = lazy(() => import('./Globe').then((m) => ({ default: m.Globe })));

export function GlobeStage({
  theme,
  globeRef,
}: {
  theme: Theme;
  globeRef: RefObject<GlobeHandle>;
}) {
  return (
    <div className="absolute inset-0 z-[1]">
      <Suspense fallback={null}>
        <Globe ref={globeRef} theme={theme} />
      </Suspense>
    </div>
  );
}
