import { JarvisCore, type CoreState } from './JarvisCore';

// Decorative SVG tick ring just outside the WebGL canvas — like an instrument
// face, gives the rim a sense of precision. It's static, so the 72 lines are
// computed once at module level rather than on every render.
const TICK_COUNT = 72;
const ringTicks = (
  <svg
    className="pointer-events-none absolute -inset-4 text-cyan-300/30"
    viewBox="0 0 100 100"
    aria-hidden
  >
    <g transform="translate(50 50)" stroke="currentColor">
      {Array.from({ length: TICK_COUNT }, (_, i) => {
        const long = i % 6 === 0;
        const a = (i / TICK_COUNT) * Math.PI * 2;
        const r1 = 47;
        const r2 = long ? 44 : 45.7;
        return (
          <line
            key={i}
            x1={Math.cos(a) * r1}
            y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2}
            y2={Math.sin(a) * r2}
            strokeWidth={long ? 0.3 : 0.12}
          />
        );
      })}
    </g>
  </svg>
);

/**
 * The prominent free-floating WebGL orb plus its instrument-face decorations
 * (tick ring + compass marks) and the current-state label.
 */
export function CoreSpotlight({
  state,
  hasChat,
}: {
  state: CoreState;
  /** Whether a conversation is open — only changes the idle sub-label. */
  hasChat: boolean;
}) {
  const stateText = {
    idle: 'standing by',
    listening: 'listening',
    generating: 'thinking',
  }[state];

  const sub = {
    idle: hasChat ? 'ready when you are' : 'awaiting new session',
    listening: 'compose your message',
    generating: 'streaming response',
  }[state];

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden vert:flex-none vert:shrink-0 vert:overflow-visible vert:py-8">
      {/* The orb itself — large and unframed, vertically centred. On desktop it
          is fluid: capped at 520px but shrinking to fit the orb column (the
          viewport minus the 68px rail and 540px chat panel, with margin for the
          compass marks) so it never clips on narrower / near-square windows. In
          vertical frames it shrinks to a viewport-relative hero size instead. */}
      <div className="flex flex-col items-center gap-8 vert:gap-5">
        <div className="relative size-[min(520px,100vw_-_680px,82vh)] vert:size-[min(64vw,330px)]">
          {/* Decorative tick ring just outside the canvas */}
          {ringTicks}
          <JarvisCore state={state} className="h-full w-full" />

          {/* Compass marks at the four cardinal points */}
          <CompassMark dir="N" className="left-1/2 -top-7 -translate-x-1/2" />
          <CompassMark dir="E" className="right-[-26px] top-1/2 -translate-y-1/2" />
          <CompassMark dir="S" className="left-1/2 -bottom-7 -translate-x-1/2" />
          <CompassMark dir="W" className="left-[-26px] top-1/2 -translate-y-1/2" />
        </div>

        {/* State label */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span
            className={`text-[12px] uppercase tracking-[0.6em] transition-colors ${
              state === 'idle' ? 'text-cyan-200/75' : 'text-cyan-100'
            }`}
          >
            {stateText}
          </span>
          <span className="text-[12px] text-cyan-200/60">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function CompassMark({ dir, className }: { dir: string; className: string }) {
  return (
    <span
      className={`pointer-events-none absolute text-[10px] uppercase tracking-[0.3em] text-cyan-200/55 ${className}`}
    >
      {dir}
    </span>
  );
}
