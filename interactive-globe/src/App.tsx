import { useRef, useState } from 'react';
import type { GlobeHandle } from './components/globe/Globe';
import { GlobeStage } from './components/globe/GlobeStage';
import { GlobeToolbar } from './components/globe/GlobeToolbar';
import { Hero } from './components/hero/Hero';
import { AuroraGlows } from './components/layout/AuroraGlows';
import { NoiseOverlay } from './components/layout/NoiseOverlay';
import { ReadabilityScrim } from './components/layout/ReadabilityScrim';
import { SiteHeader } from './components/layout/SiteHeader';
import { THEMES, themeById } from './theme';
import { themeVars } from './theme-vars';

export default function App() {
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const theme = themeById(themeId);
  const globeRef = useRef<GlobeHandle>(null);

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-page text-ink ${theme.mode === 'dark' ? 'dark' : ''}`}
      style={themeVars(theme)}
    >
      <AuroraGlows />
      <GlobeStage theme={theme} globeRef={globeRef} />
      <ReadabilityScrim />
      <NoiseOverlay />

      <SiteHeader theme={theme} onThemeChange={setThemeId} />

      <main className="pointer-events-none relative z-20 mx-auto flex w-full max-w-[1200px] items-center px-6 lg:min-h-[calc(100vh-84px)] lg:px-10">
        <div className="w-full lg:max-w-[54%]">
          <Hero />
        </div>
      </main>

      <GlobeToolbar globeRef={globeRef} />
    </div>
  );
}
