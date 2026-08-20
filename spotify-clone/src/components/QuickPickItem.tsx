import { motion } from 'framer-motion'
import type { Playlist } from '../data/playlists.ts'
import { TRACKS } from '../data/tracks.ts'
import { ArtworkImg } from './ArtworkImg.tsx'

export function QuickPickItem({ playlist, onClick }: { playlist: Playlist; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.12)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-md overflow-hidden cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-12 h-12 flex-shrink-0 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${playlist.gradient[0]}, ${playlist.gradient[1]})`,
        }}
      >
        {playlist.id === 'liked' ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #450af5, #c4b5fd)' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="white"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
          </div>
        ) : (
          <ArtworkImg
            src={TRACKS[playlist.trackIndices[0]].artwork}
            alt={playlist.name}
            fallbackGradient={`linear-gradient(135deg, ${playlist.gradient[0]}, ${playlist.gradient[1]})`}
            fallbackLetter={playlist.name[0]}
            className="w-full h-full"
            rounded=""
            size={100}
          />
        )}
      </div>
      <span className="text-white text-[13px] font-semibold truncate pr-3">{playlist.name}</span>
    </motion.div>
  )
}
