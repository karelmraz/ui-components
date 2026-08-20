import { motion } from 'framer-motion'
import type { Playlist } from '../data/playlists.ts'
import { PlaylistMosaic } from './PlaylistMosaic.tsx'

export function PlaylistCard({
  playlist,
  onOpen,
  priority,
}: {
  playlist: Playlist
  onOpen: () => void
  priority?: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex-shrink-0 w-[160px] cursor-pointer group"
      onClick={onOpen}
    >
      <div
        className="w-[160px] h-[160px] rounded-lg mb-3 relative overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${playlist.gradient[0]}, ${playlist.gradient[1]})`,
        }}
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <PlaylistMosaic playlist={playlist} size={160} priority={priority} />
        </div>
        <motion.div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l12-6.86a1 1 0 0 0 0-1.72l-12-6.86a1 1 0 0 0-1.5.86Z" />
          </svg>
        </motion.div>
      </div>
      <h3 className="text-white text-sm font-semibold truncate">{playlist.name}</h3>
      <p className="text-white/70 text-xs truncate mt-0.5">{playlist.description}</p>
    </motion.div>
  )
}
