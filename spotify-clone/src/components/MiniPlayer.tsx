import { motion } from 'framer-motion'
import type { Track } from '../data/tracks.ts'
import { Icons } from '../Icons.tsx'
import { AlbumThumb } from './AlbumThumb.tsx'

export function MiniPlayer({
  track,
  playing,
  progress,
  onTogglePlay,
  onOpen,
}: {
  track: Track
  playing: boolean
  progress: number
  onTogglePlay: () => void
  onOpen: () => void
}) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute bottom-[72px] left-2 right-2 z-[46]"
    >
      <div
        className="rounded-lg overflow-hidden cursor-pointer"
        style={{ background: track.gradient[1], boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
      >
        <div className="h-[2px] bg-black/20 relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-white/80"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-3 p-2.5 pr-3" onClick={onOpen}>
          <AlbumThumb track={track} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{track.title}</p>
            <p className="text-white/60 text-xs truncate">{track.artist}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation()
              onTogglePlay()
            }}
            className="w-8 h-8 flex items-center justify-center text-white cursor-pointer"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? Icons.pauseSmall : Icons.playSmall}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
