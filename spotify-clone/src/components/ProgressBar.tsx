import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatTime, fractionAcross } from '../utils.ts'

export function ProgressBar({
  progress,
  elapsed,
  duration,
  onSeek,
}: {
  progress: number
  elapsed: number
  duration: number
  onSeek: (pct: number) => void
}) {
  const [hovering, setHovering] = useState(false)
  const [hoverX, setHoverX] = useState(0)

  return (
    <div className="w-full flex items-center gap-3">
      <span className="text-[11px] text-white/50 font-medium tabular-nums w-[34px] text-right">
        {formatTime(elapsed)}
      </span>
      <div
        className="flex-1 h-[4px] rounded-full bg-white/10 relative cursor-pointer group"
        onClick={(e) => onSeek(Math.max(0, Math.min(1, fractionAcross(e))))}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={(e) => setHoverX(fractionAcross(e) * 100)}
      >
        {hovering && (
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-white/5"
            style={{ width: `${hoverX}%` }}
          />
        )}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-white"
          style={{ width: `${progress * 100}%` }}
          layout
          transition={{ duration: 0.1 }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-white shadow-lg"
          style={{ left: `${progress * 100}%`, x: '-50%' }}
          initial={false}
          animate={{ scale: hovering ? 1 : 0 }}
        />
      </div>
      <span className="text-[11px] text-white/50 font-medium tabular-nums w-[34px]">
        {formatTime(duration)}
      </span>
    </div>
  )
}
