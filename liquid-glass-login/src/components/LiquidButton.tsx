type Props = {
  submitting: boolean;
};

/**
 * Primary submit button. The "liquid" motion is pure CSS — layered gradients,
 * a keyframed transform on the blurred blobs, and a background-position sweep
 * on hover — so no JS runs per frame.
 */
export function LiquidButton({ submitting }: Props) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-semibold tracking-wide text-white transition active:scale-[0.98] disabled:opacity-90"
    >
      {/* Opaque base color — guarantees the button never reads as transparent
          against the glass card behind it. */}
      <span className="absolute inset-0 bg-[#a855f7]" />
      {/* Vibrant sunset gradient. Sized at 150% so the full purple→orange
          spectrum is visible at rest, with a moderate sweep on hover. */}
      <span
        className="absolute inset-0 bg-[length:150%_100%] bg-[position:0%_50%] transition-[background-position] duration-[1200ms] ease-out group-hover:bg-[position:100%_50%]"
        style={{
          backgroundImage: 'linear-gradient(110deg, #a855f7 0%, #ff6b35 55%, #ff9416 100%)',
        }}
      />
      {/* Slow-drifting liquid blobs — vivid violet on the cool side, glowing
          amber on the warm side. They amplify the underlying gradient and
          give the surface its sense of motion. */}
      <span
        className="pointer-events-none absolute -inset-10 animate-[liquid-drift_9s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(38% 70% at 12% 40%, rgba(190,130,255,0.4), transparent 60%), radial-gradient(36% 66% at 88% 60%, rgba(255,170,80,0.4), transparent 60%)',
          filter: 'blur(16px)',
          willChange: 'transform',
        }}
      />
      {/* Bottom inset shadow for grounding */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.18), transparent 100%)',
        }}
      />
      <span className="absolute inset-x-0 top-0 h-px bg-white/80" />
      <span className="absolute inset-x-6 bottom-0 h-px bg-white/15" />
      {/* Hover sheen — a brighter highlight near the top edge */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.25), transparent 60%)',
        }}
      />
      {/* Inner ring for crispness */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      />
      <span className="relative flex items-center gap-2">
        {submitting ? (
          <>
            <Spinner />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <span className="inline-flex transition-transform duration-300 ease-out group-hover:translate-x-1.5">
              <Arrow />
            </span>
          </>
        )}
      </span>
    </button>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7h8M7 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
