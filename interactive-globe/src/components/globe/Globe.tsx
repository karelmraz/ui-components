import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { GlobeTooltip } from './GlobeTooltip';
import { createGlobeScene } from '../../globe/scene';
import type { GlobeScene } from '../../globe/scene';
import type { Theme } from '../../theme';

export type GlobeHandle = { zoomIn: () => void; zoomOut: () => void };

export const Globe = forwardRef<GlobeHandle, { theme: Theme }>(function Globe({ theme }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GlobeScene | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => sceneRef.current?.zoomStep(-1),
      zoomOut: () => sceneRef.current?.zoomStep(1),
    }),
    [],
  );

  useEffect(() => {
    const host = hostRef.current;
    const tooltip = tooltipRef.current;
    if (!host || !tooltip) return;

    sceneRef.current = createGlobeScene({ host, tooltip, theme: themeRef.current });
    return () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [theme.mode]);

  useEffect(() => {
    sceneRef.current?.applyTheme(theme);
  }, [theme]);

  return (
    <div ref={hostRef} className="relative h-full w-full select-none">
      <GlobeTooltip ref={tooltipRef} />
    </div>
  );
});
