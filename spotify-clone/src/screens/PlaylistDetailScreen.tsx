import { motion } from 'framer-motion'
import type { Playlist } from '../data/playlists.ts'
import { TRACKS } from '../data/tracks.ts'
import { formatTime } from '../utils.ts'
import { Icons } from '../Icons.tsx'
import { Equalizer } from '../components/Equalizer.tsx'
import { AlbumThumb } from '../components/AlbumThumb.tsx'
import { PlaylistMosaic } from '../components/PlaylistMosaic.tsx'

export function PlaylistDetailScreen({
  playlist,
  currentTrackIndex,
  playing,
  onPlayTrack,
  onShufflePlay,
  onBack,
}: {
  playlist: Playlist
  currentTrackIndex: number
  playing: boolean
  onPlayTrack: (index: number) => void
  onShufflePlay: () => void
  onBack: () => void
}) {
  const totalDuration = playlist.trackIndices.reduce((sum, ti) => sum + TRACKS[ti].duration, 0)
  const totalMin = Math.floor(totalDuration / 60)

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-45 bg-[#121212] overflow-y-auto scrollbar-hide"
    >
      <div
        className="relative pt-[48px] pb-4 px-4"
        style={{
          background: `linear-gradient(180deg, ${playlist.gradient[0]}88 0%, ${playlist.gradient[1]}44 60%, #121212 100%)`,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="text-white mb-4 p-1 -ml-1 cursor-pointer"
          aria-label="Back"
        >
          {Icons.back}
        </motion.button>

        <div className="flex justify-center mb-4">
          <div
            className="w-[180px] h-[180px] rounded-lg shadow-2xl relative overflow-hidden"
            style={{
              background:
                playlist.id === 'liked'
                  ? 'linear-gradient(135deg, #450af5, #c4b5fd)'
                  : `linear-gradient(135deg, ${playlist.gradient[0]}, ${playlist.gradient[1]})`,
            }}
          >
            {playlist.id === 'liked' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
              </div>
            ) : (
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <PlaylistMosaic playlist={playlist} size={180} />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-white text-2xl font-bold">{playlist.name}</h1>
        <p className="text-white/50 text-sm mt-1">{playlist.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white/70 text-xs">{playlist.followers}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/70 text-xs">
            {playlist.trackIndices.length} songs, {totalMin} min
          </span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="text-[#1db954] cursor-pointer">
              {Icons.heartFilled}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="text-white/40 cursor-pointer">
              {Icons.dots}
            </motion.button>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onShufflePlay}
              className="text-[#1db954] cursor-pointer [&_svg]:w-7 [&_svg]:h-7"
            >
              {Icons.shuffle}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={onShufflePlay}
              className="w-12 h-12 rounded-full bg-[#1db954] flex items-center justify-center shadow-xl cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l12-6.86a1 1 0 0 0 0-1.72l-12-6.86a1 1 0 0 0-1.5.86Z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-[140px]">
        {playlist.trackIndices.map((ti, idx) => {
          const track = TRACKS[ti]
          const isPlaying = ti === currentTrackIndex && playing
          const isCurrent = ti === currentTrackIndex
          return (
            <motion.div
              key={`${playlist.id}-${idx}`}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPlayTrack(ti)}
              className="flex items-center gap-3 py-3 cursor-pointer group"
            >
              <div className="w-5 flex justify-center">
                {isPlaying ? (
                  <Equalizer playing={true} color="#1db954" size={12} />
                ) : (
                  <span className="text-white/30 text-sm font-medium">{idx + 1}</span>
                )}
              </div>
              <AlbumThumb track={track} size={44} />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}
                >
                  {track.title}
                </p>
                <p className="text-white/70 text-xs truncate">{track.artist}</p>
              </div>
              <span className="text-white/30 text-xs tabular-nums">
                {formatTime(track.duration)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
