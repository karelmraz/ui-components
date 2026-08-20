import { motion } from 'framer-motion'
import type { TabScreenProps } from '../types.ts'
import { TRACKS } from '../data/tracks.ts'
import { PLAYLISTS, QUICK_PICK_IDS, getPlaylistById } from '../data/playlists.ts'
import { getGreeting, formatTime } from '../utils.ts'
import { useDragScroll } from '../useDragScroll.ts'
import { Equalizer } from '../components/Equalizer.tsx'
import { AlbumThumb } from '../components/AlbumThumb.tsx'
import { PlaylistCard } from '../components/PlaylistCard.tsx'
import { QuickPickItem } from '../components/QuickPickItem.tsx'
import { RecentItem } from '../components/RecentItem.tsx'

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const QUICK_PICKS = QUICK_PICK_IDS.map((id) => getPlaylistById(id))
const MADE_FOR_YOU = PLAYLISTS.filter((p) => p.followers === 'Made for you')
const POPULAR = PLAYLISTS.filter((p) => p.followers !== 'Made for you')

export function HomeScreen({ trackIndex, playing, onPlayTrack, onOpenPlaylist }: TabScreenProps) {
  const jumpBackRef = useDragScroll<HTMLDivElement>()
  const madeForYouRef = useDragScroll<HTMLDivElement>()
  const popularRef = useDragScroll<HTMLDivElement>()
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      className="pb-[140px] pt-2 px-4"
    >
      <motion.div
        variants={sectionVariants}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-white text-[26px] font-bold">{getGreeting()}</h1>
        <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black font-bold text-sm">
          K
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="grid grid-cols-2 gap-2 mb-8"
      >
        {QUICK_PICKS.map((pl) => (
          <QuickPickItem key={pl.id} playlist={pl} onClick={() => onOpenPlaylist(pl.id)} />
        ))}
      </motion.div>

      <motion.div
        variants={sectionVariants}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-8"
      >
        <h2 className="text-white text-xl font-bold mb-4">Jump back in</h2>
        <div
          ref={jumpBackRef}
          className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin cursor-grab select-none"
        >
          {TRACKS.map((track, i) => (
            <RecentItem
              key={track.title}
              track={track}
              isCurrentTrack={i === trackIndex}
              playing={playing}
              onPlay={() => onPlayTrack(i)}
              priority={i < 3}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-8"
      >
        <h2 className="text-white text-xl font-bold mb-4">Made for you</h2>
        <div
          ref={madeForYouRef}
          className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin cursor-grab select-none"
        >
          {MADE_FOR_YOU.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} onOpen={() => onOpenPlaylist(pl.id)} />
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-8"
      >
        <h2 className="text-white text-xl font-bold mb-4">Popular playlists</h2>
        <div
          ref={popularRef}
          className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin cursor-grab select-none"
        >
          {POPULAR.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} onOpen={() => onOpenPlaylist(pl.id)} />
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-4"
      >
        <h2 className="text-white text-xl font-bold mb-4">Top tracks</h2>
        <div className="flex flex-col gap-1">
          {TRACKS.map((track, i) => (
            <motion.div
              key={track.title}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPlayTrack(i)}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
            >
              <span className="text-white/30 text-sm w-5 text-right font-medium">
                {i === trackIndex && playing ? (
                  <Equalizer playing={true} color="#1db954" size={16} />
                ) : (
                  i + 1
                )}
              </span>
              <AlbumThumb track={track} size={44} />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${i === trackIndex ? 'text-[#1db954]' : 'text-white'}`}
                >
                  {track.title}
                </p>
                <p className="text-white/70 text-xs truncate">{track.artist}</p>
              </div>
              <span className="text-white/30 text-xs tabular-nums">
                {formatTime(track.duration)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
