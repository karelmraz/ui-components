import { forwardRef } from 'react';

export const GlobeTooltip = forwardRef<HTMLDivElement>(function GlobeTooltip(_props, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-0 top-0 z-20 whitespace-nowrap rounded-lg border border-hairline bg-tooltip px-2.5 py-1 font-mono text-xs text-ink opacity-0 backdrop-blur-md transition-opacity duration-150"
    />
  );
});
