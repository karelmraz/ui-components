export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

function defaults(props: IconProps) {
  return {
    width: props.size ?? 24,
    height: props.size ?? 24,
    className: props.className,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
  } as const;
}

const S = { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function FireIcon(props: IconProps) {
  const id = `fire-grad-${props.size ?? 24}`;
  const idInner = `fire-inner-${props.size ?? 24}`;
  return (
    <svg {...defaults(props)}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--fire-from, #ff4500)" />
          <stop offset="45%" stopColor="var(--fire-via, #ff8c00)" />
          <stop offset="100%" stopColor="var(--fire-to, #ffcc00)" />
        </linearGradient>
        <linearGradient id={idInner} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--fire-via, #ff8c00)" />
          <stop offset="100%" stopColor="var(--fire-to, #ffcc00)" />
        </linearGradient>
      </defs>
      {/* Outer flame */}
      <path
        d="M12 2C9.5 7.5 6 9.5 6 14a6 6 0 0012 0c0-2.5-1.5-5-3-7 .5 2-1 4-1 4s-1.5-4.5-2-9z"
        fill={`url(#${id})`}
      />
      {/* Inner core flame */}
      <path
        d="M12 20.5c-1.7 0-3-1.4-3-3.2 0-1.5.9-3 1.8-4.1.4-.5.8-.9 1.2-1.2.4.3.8.7 1.2 1.2.9 1.1 1.8 2.6 1.8 4.1 0 1.8-1.3 3.2-3 3.2z"
        fill={`url(#${idInner})`}
      />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M12 3l1.5 6.5L20 12l-6.5 1.5L12 21l-1.5-7.5L4 12l6.5-2.5L12 3z" stroke={c} {...S} />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M13 2L4.5 13H11l-1 9 9.5-11H13V2z" stroke={c} {...S} />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={c} {...S} />
      <path d="M6 6H4a4 4 0 004 4" stroke={c} {...S} />
      <path d="M18 6h2a4 4 0 01-4 4" stroke={c} {...S} />
      <path d="M12 14v4M8 18h8M9 18l-1 3h8l-1-3" stroke={c} {...S} />
    </svg>
  );
}

export function DiamondIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M12 3l8 7-8 11-8-11 8-7z" stroke={c} {...S} />
      <path d="M4 10h16" stroke={c} {...S} />
    </svg>
  );
}

export function CrownIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M3 18l2-10 4.5 4L12 4l2.5 8L19 8l2 10H3z" stroke={c} {...S} />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7l3-7z" stroke={c} {...S} />
    </svg>
  );
}

export function SnowflakeIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M12 2v20M4.93 7l14.14 10M4.93 17l14.14-10" stroke={c} {...S} />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={c} {...S} />
      <path d="M3 10h18M8 2v4M16 2v4" stroke={c} {...S} />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="12" r="4" stroke={c} {...S} />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke={c}
        {...S}
      />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={c} {...S} />
    </svg>
  );
}

export function BurstIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="12" r="2" stroke={c} {...S} />
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke={c}
        {...S}
      />
    </svg>
  );
}

export function PartyIcon(props: IconProps) {
  const c = props.color ?? 'currentColor';
  return (
    <svg {...defaults(props)}>
      <path d="M4 20l4-14 12 10-16 4z" stroke={c} {...S} />
      <path d="M8 6c2-2 6-2 8 0M18 16c2-2 2-6 0-8" stroke={c} {...S} />
    </svg>
  );
}
