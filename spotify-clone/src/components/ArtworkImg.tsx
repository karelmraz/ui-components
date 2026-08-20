import { useState } from 'react'

function sized(url: string, size: number | undefined): string {
  if (!url || !size) return url
  return url.replace(/\/\d+x\d+bb\.(jpg|png)/i, `/${size}x${size}bb.$1`)
}

/** Shimmer-while-loading image that swaps to `fallback` if the source fails. */
function ArtworkFrame({
  src,
  size,
  priority,
  className,
  background,
  fallback,
}: {
  src: string
  size?: number
  priority: boolean
  className: string
  background: string
  fallback: React.ReactNode
}) {
  const [failed, setFailed] = useState(!src)
  const [loaded, setLoaded] = useState(false)
  const showShimmer = !failed && !loaded
  return (
    <div
      className={`relative overflow-hidden ${className} ${showShimmer ? 'shimmer' : ''}`}
      style={{ background }}
    >
      {!failed && (
        <img
          src={sized(src, size)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 select-none"
          style={{ opacity: loaded ? 1 : 0, WebkitUserDrag: 'none' } as React.CSSProperties}
          draggable={false}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {failed && fallback}
    </div>
  )
}

export function ArtworkImg({
  src,
  alt,
  fallbackGradient,
  fallbackLetter,
  className = '',
  rounded = 'rounded-md',
  size,
  priority = false,
}: {
  src: string
  alt: string
  fallbackGradient: string
  fallbackLetter: string
  className?: string
  rounded?: string
  size?: number
  priority?: boolean
}) {
  return (
    <ArtworkFrame
      src={src}
      size={size}
      priority={priority}
      className={`${rounded} ${className}`}
      background={fallbackGradient}
      fallback={
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-label={alt}
        >
          <text
            x="50"
            y="50"
            dominantBaseline="central"
            textAnchor="middle"
            fill="rgba(255,255,255,0.22)"
            fontSize="60"
            fontWeight="800"
            className="select-none"
          >
            {fallbackLetter}
          </text>
        </svg>
      }
    />
  )
}

/** Like ArtworkImg but with an inline-sized letter fallback, used for small mosaic tiles. */
export function FallbackImg({
  src,
  alt,
  gradient,
  letter,
  className = '',
  size,
  priority = false,
}: {
  src: string
  alt: string
  gradient: string
  letter: string
  className?: string
  size?: number
  priority?: boolean
}) {
  return (
    <ArtworkFrame
      src={src}
      size={size}
      priority={priority}
      className={className}
      background={gradient}
      fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-white/20 font-extrabold select-none"
            style={{ fontSize: '1em' }}
            aria-label={alt}
          >
            {letter}
          </span>
        </div>
      }
    />
  )
}
