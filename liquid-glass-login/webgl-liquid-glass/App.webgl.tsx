import { LiquidGlass } from './components/LiquidGlass';
import { LoginCard } from './components/LoginCard';

export default function App() {
  return (
    <div className="relative h-full w-full">
      {/* WebGL background + refractive liquid glass (replaces backdrop-blur).
          Every [data-glass] element (card + social buttons) refracts the scene. */}
      <LiquidGlass />

      {/* DOM overlays the shader doesn't own: vignette + film grain. */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.55)_100%)]" />
      <div className="noise pointer-events-none fixed inset-0 z-[1] opacity-[0.06]" />

      <main className="relative z-10 flex h-full items-center justify-center px-6">
        <LoginCard />
      </main>

      {/* Top-right marketing chip */}
      <div className="absolute right-6 top-6 z-10 hidden items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10 backdrop-blur-md md:flex">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        All systems normal
      </div>
    </div>
  );
}
