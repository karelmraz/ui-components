import { motion } from 'framer-motion'
import type { Track } from '../data/tracks.ts'
import { ArtworkImg } from './ArtworkImg.tsx'
import { Equalizer } from './Equalizer.tsx'

export function RecentItem({
  track,
  isCurrentTrack,
  playing,
  onPlay,
  priority,
}: {
  track: Track
  isCurrentTrack: boolean
  playing: boolean
  onPlay: () => void
  priority?: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex-shrink-0 w-[120px] cursor-pointer group"
      onClick={onPlay}
    >
      <div className="relative w-[120px] h-[120px] rounded-lg overflow-hidden shadow-lg mb-2">
        <ArtworkImg
          src={track.artwork}
          alt={track.album}
          fallbackGradient={`linear-gradient(135deg, ${track.gradient[2]}, ${track.gradient[1]}, ${track.gradient[0]})`}
          fallbackLetter={track.title[0]}
          className="absolute inset-0 w-full h-full"
          rounded=""
          size={240}
          priority={priority}
        />
        {isCurrentTrack && playing ? (
          <div className="absolute bottom-2 right-2">
            <Equalizer playing={true} color="#1db954" size={20} />
          </div>
        ) : (
          <motion.div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#1db954] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="black">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l12-6.86a1 1 0 0 0 0-1.72l-12-6.86a1 1 0 0 0-1.5.86Z" />
            </svg>
          </motion.div>
        )}
      </div>
      <p className="text-white text-xs font-semibold truncate">{track.title}</p>
      <p className="text-white/70 text-[11px] truncate">{track.artist}</p>
    </motion.div>
  )
}
