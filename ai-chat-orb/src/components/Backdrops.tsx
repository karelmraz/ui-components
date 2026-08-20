/** Layered, non-interactive background washes behind the whole surface. */
export function Backdrops() {
  return (
    <>
      {/* Wash centred near the orb — pulls the eye up */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(20,120,230,0.32),transparent_55%)]" />
      {/* Subtle vignette around the edges */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(0,0,0,0.75)_100%)]" />
      {/* Whisper-thin grid */}
      <div className="pointer-events-none absolute inset-0 hex-grid opacity-[0.025]" />
    </>
  );
}
