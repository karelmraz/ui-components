import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import type { TabScreenProps } from '../types.ts'
import { TRACKS } from '../data/tracks.ts'
import { PLAYLISTS } from '../data/playlists.ts'
import { CATEGORIES } from '../data/categories.ts'
import { Icons } from '../Icons.tsx'
import { Equalizer } from '../components/Equalizer.tsx'
import { AlbumThumb } from '../components/AlbumThumb.tsx'
import { PlaylistMosaic } from '../components/PlaylistMosaic.tsx'

export function SearchScreen({ trackIndex, playing, onPlayTrack, onOpenPlaylist }: TabScreenProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasQuery = query.trim().length > 0
  const needle = query.toLowerCase()
  const matches = (text: string) => text.toLowerCase().includes(needle)

  const filteredTracks = hasQuery
    ? TRACKS.flatMap((track, index) =>
        matches(track.title) || matches(track.artist) || matches(track.album)
          ? [{ track, index }]
          : [],
      )
    : []

  const filteredPlaylists = hasQuery
    ? PLAYLISTS.filter((p) => matches(p.name) || matches(p.description))
    : []

  const hasResults = filteredTracks.length > 0 || filteredPlaylists.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-[140px] pt-2 px-4"
    >
      <h1 className="text-white text-[26px] font-bold mb-4">Search</h1>

      <div className="relative mb-6">
        <div
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${focused ? 'bg-white' : 'bg-white/10'}`}
        >
          <span className={focused ? 'text-black/60' : 'text-white/60'}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder-current ${focused ? 'text-black placeholder-black/40' : 'text-white placeholder-white/40'}`}
          />
          {query && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className={`cursor-pointer ${focused ? 'text-black/40' : 'text-white/40'}`}
            >
              {Icons.close}
            </motion.button>
          )}
        </div>
      </div>

      {!hasQuery && (
        <>
          <h2 className="text-white text-lg font-bold mb-3">Browse all</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <motion.div
                key={cat.name}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setQuery(cat.name)}
                className="h-[90px] rounded-lg overflow-hidden relative cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})`,
                }}
              >
                <span className="absolute top-3 left-3 text-white font-bold text-[15px]">
                  {cat.name}
                </span>
                <div className="absolute -bottom-2 -right-2 w-[60px] h-[60px] rounded-md bg-white/10 rotate-[25deg]" />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {hasQuery && !hasResults && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-white text-lg font-bold mb-1">No results found</p>
          <p className="text-white/70 text-sm">Try different keywords</p>
        </div>
      )}

      {filteredTracks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white text-lg font-bold mb-3">Songs</h2>
          <div className="flex flex-col gap-1">
            {filteredTracks.map(({ track, index }) => (
              <motion.div
                key={track.title}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPlayTrack(index)}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
              >
                <AlbumThumb track={track} size={44} />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${index === trackIndex ? 'text-[#1db954]' : 'text-white'}`}
                  >
                    {track.title}
                  </p>
                  <p className="text-white/70 text-xs truncate">Song · {track.artist}</p>
                </div>
                {index === trackIndex && playing && (
                  <Equalizer playing={true} color="#1db954" size={16} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filteredPlaylists.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white text-lg font-bold mb-3">Playlists</h2>
          <div className="flex flex-col gap-1">
            {filteredPlaylists.map((pl) => (
              <motion.div
                key={pl.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenPlaylist(pl.id)}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
              >
                <div
                  className="w-[44px] h-[44px] rounded-md flex-shrink-0 overflow-hidden grid grid-cols-2 grid-rows-2"
                  style={{
                    background: `linear-gradient(135deg, ${pl.gradient[0]}, ${pl.gradient[1]})`,
                  }}
                >
                  <PlaylistMosaic playlist={pl} size={100} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{pl.name}</p>
                  <p className="text-white/70 text-xs truncate">Playlist · {pl.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
