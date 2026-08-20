import type { ReactNode } from 'react';

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-6 items-center justify-center rounded-full transition hover:bg-surface-hover"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="pill pointer-events-auto flex items-center gap-1 rounded-full p-1">
      <ZoomButton label="Zoom out" onClick={onZoomOut}>
        <path d="M5 12h14" />
      </ZoomButton>
      <span className="select-none px-0.5 font-mono text-[11px] tracking-wide text-muted">
        zoom
      </span>
      <ZoomButton label="Zoom in" onClick={onZoomIn}>
        <path d="M12 5v14M5 12h14" />
      </ZoomButton>
    </div>
  );
}
