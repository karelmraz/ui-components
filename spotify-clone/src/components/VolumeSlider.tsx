import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icons } from '../Icons.tsx'
import { fractionAcross } from '../utils.ts'

export function VolumeSlider() {
  const [volume, setVolume] = useState(0.7)

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50">{Icons.volume}</span>
      <div
        className="w-[90px] h-[4px] rounded-full bg-white/10 relative cursor-pointer group"
        onClick={(e) => setVolume(Math.max(0, Math.min(1, fractionAcross(e))))}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-white/70 group-hover:bg-[#1db954]"
          style={{ width: `${volume * 100}%` }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100"
          style={{ left: `${volume * 100}%`, x: '-50%' }}
        />
      </div>
    </div>
  )
}
