import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TabScreenProps } from '../types.ts'
import { TRACKS } from '../data/tracks.ts'
import { PLAYLISTS } from '../data/playlists.ts'
import { ARTISTS } from '../data/artists.ts'
import { Icons } from '../Icons.tsx'
import { Equalizer } from '../components/Equalizer.tsx'
import { ArtworkImg } from '../components/ArtworkImg.tsx'
import { PlaylistMosaic } from '../components/PlaylistMosaic.tsx'

type LibraryFilter = 'playlists' | 'artists' | 'albums'

const FILTERS: { key: LibraryFilter; label: string }[] = [
  { key: 'playlists', label: 'Playlists' },
  { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' },
]

// One entry per distinct album, pointing at its first track.
const ALBUMS = [
  ...new Map(
    TRACKS.map((t, i) => [t.album, { name: t.album, artist: t.artist, track: t, index: i }]),
  ).values(),
]
const USER_PLAYLISTS = PLAYLISTS.filter((p) => p.id !== 'liked')

// Data order stands in for recency; A-Z re-sorts a copy so toggling back is lossless.
const byName = <T,>(items: T[], name: (item: T) => string) =>
  [...items].sort((a, b) => name(a).localeCompare(name(b)))

export function LibraryScreen({
  trackIndex,
  playing,
  onPlayTrack,
  onOpenPlaylist,
}: TabScreenProps) {
  const [filter, setFilter] = useState<LibraryFilter>('playlists')
  const [sortRecent, setSortRecent] = useState(true)

  const playlists = sortRecent ? USER_PLAYLISTS : byName(USER_PLAYLISTS, (p) => p.name)
  const artists = sortRecent ? ARTISTS : byName(ARTISTS, (a) => a.name)
  const albums = sortRecent ? ALBUMS : byName(ALBUMS, (a) => a.name)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-[140px] pt-2 px-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black font-bold text-sm">
            K
          </div>
          <h1 className="text-white text-[24px] font-bold">Your Library</h1>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="text-white/60 cursor-pointer">
          {Icons.addCircle}
        </motion.button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {FILTERS.map((f) => (
          <motion.button
            key={f.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${filter === f.key ? 'bg-[#1db954] text-black' : 'bg-white/10 text-white'}`}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortRecent(!sortRecent)}
          className="flex items-center gap-1.5 text-white/50 text-xs font-medium cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h12M3 18h6" />
          </svg>
          {sortRecent ? 'Recents' : 'A-Z'}
        </motion.button>
        <span className="text-white/30 text-xs">
          {filter === 'playlists'
            ? PLAYLISTS.length
            : filter === 'artists'
              ? ARTISTS.length
              : ALBUMS.length}{' '}
          items
        </span>
      </div>

      {filter === 'playlists' && (
        <div className="flex flex-col gap-0.5">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenPlaylist('liked')}
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
          >
            <div
              className="w-[52px] h-[52px] rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #450af5, #c4b5fd)' }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="white"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">Liked Songs</p>
              <div className="flex items-center gap-1.5">
                {Icons.pin}
                <p className="text-white/70 text-xs">Playlist · {TRACKS.length} songs</p>
              </div>
            </div>
          </motion.div>
          {playlists.map((pl) => (
            <motion.div
              key={pl.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenPlaylist(pl.id)}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
            >
              <div
                className="w-[52px] h-[52px] rounded-md flex-shrink-0 relative overflow-hidden grid grid-cols-2 grid-rows-2"
                style={{
                  background: `linear-gradient(135deg, ${pl.gradient[0]}, ${pl.gradient[1]})`,
                }}
              >
                <PlaylistMosaic playlist={pl} size={100} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{pl.name}</p>
                <p className="text-white/70 text-xs truncate">
                  Playlist · {pl.trackIndices.length} songs
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filter === 'artists' && (
        <div className="flex flex-col gap-0.5">
          {artists.map((artist) => (
            <motion.div
              key={artist.name}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
            >
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${artist.color}, ${artist.color}88)`,
                }}
              >
                <span className="text-white/60 font-bold text-lg">{artist.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{artist.name}</p>
                <p className="text-white/70 text-xs">Artist · {artist.followers} followers</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filter === 'albums' && (
        <div className="flex flex-col gap-0.5">
          {albums.map((album) => (
            <motion.div
              key={album.name}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPlayTrack(album.index)}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
            >
              <div className="w-[52px] h-[52px] rounded-md flex-shrink-0 overflow-hidden">
                <ArtworkImg
                  src={album.track.artwork}
                  alt={album.name}
                  fallbackGradient={`linear-gradient(135deg, ${album.track.gradient[2]}, ${album.track.gradient[1]})`}
                  fallbackLetter={album.name[0]}
                  className="w-full h-full"
                  rounded=""
                  size={100}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${album.index === trackIndex ? 'text-[#1db954]' : 'text-white'}`}
                >
                  {album.name}
                </p>
                <p className="text-white/70 text-xs truncate">Album · {album.artist}</p>
              </div>
              {album.index === trackIndex && playing && (
                <Equalizer playing={true} color="#1db954" size={16} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
