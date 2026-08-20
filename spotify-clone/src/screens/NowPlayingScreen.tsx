import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Playback } from '../types.ts'
import { Icons } from '../Icons.tsx'
import { Equalizer } from '../components/Equalizer.tsx'
import { AlbumCarousel, type AlbumCarouselHandle } from '../components/AlbumCarousel.tsx'
import { ProgressBar } from '../components/ProgressBar.tsx'
import { ControlBtn } from '../components/ControlBtn.tsx'
import { VolumeSlider } from '../components/VolumeSlider.tsx'

// "Previous" restarts the current track once it has played past this point.
const RESTART_THRESHOLD_SECONDS = 3

interface NowPlayingScreenProps {
  playback: Playback
  onClose: () => void
}

export function NowPlayingScreen({ playback, onClose }: NowPlayingScreenProps) {
  const {
    track,
    trackIndex,
    nextTrackIndex,
    nextNextTrackIndex,
    playing,
    elapsed,
    progress,
    shuffle,
    repeat,
    isLiked,
    togglePlay,
    next,
    prev,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    seek,
  } = playback
  const carouselRef = useRef<AlbumCarouselHandle>(null)
  const handleNextClick = () => carouselRef.current?.next()
  const handlePrevClick = () => {
    if (elapsed > RESTART_THRESHOLD_SECONDS) {
      seek(0)
      return
    }
    carouselRef.current?.prev()
  }
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-50 flex flex-col"
    >
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: `linear-gradient(160deg, ${track.gradient[0]} 0%, ${track.gradient[1]} 50%, ${track.gradient[0]} 100%)`,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div className="relative z-10 flex-1 flex flex-col w-full px-6 pt-10 pb-8">
        <div className="flex items-center justify-between mb-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 cursor-pointer"
            aria-label="Close"
          >
            {Icons.chevronDown}
          </motion.button>
          <span className="text-white/70 text-[11px] font-semibold uppercase tracking-[2px]">
            Now Playing
          </span>
          <div className="flex items-center gap-1">
            <Equalizer playing={playing} color={track.color} size={22} />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-0">
          <AlbumCarousel
            ref={carouselRef}
            trackIndex={trackIndex}
            nextTrackIndex={nextTrackIndex}
            nextNextTrackIndex={nextNextTrackIndex}
            playing={playing}
            onNext={next}
            onPrev={prev}
          />
        </div>

        <div className="flex items-center justify-between mt-6 mb-1">
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.h2
                key={track.title}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-white text-lg font-bold truncate"
              >
                {track.title}
              </motion.h2>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={track.artist}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="text-white/50 text-sm truncate"
              >
                {track.artist}
              </motion.p>
            </AnimatePresence>
          </div>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleLike}
            aria-label="Like"
            className="ml-3 flex-shrink-0 cursor-pointer"
          >
            <motion.span
              animate={{
                color: isLiked ? '#1db954' : 'rgba(255,255,255,0.4)',
                scale: isLiked ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className="block"
            >
              {isLiked ? Icons.heartFilled : Icons.heart}
            </motion.span>
          </motion.button>
        </div>

        <div className="mt-4">
          <ProgressBar
            progress={progress}
            elapsed={elapsed}
            duration={track.duration}
            onSeek={seek}
          />
        </div>

        <div className="flex items-center justify-between mt-4 px-2">
          <ControlBtn onClick={toggleShuffle} active={shuffle} size="sm" label="Shuffle">
            {Icons.shuffle}
          </ControlBtn>
          <ControlBtn onClick={handlePrevClick} label="Previous" size="md">
            {Icons.prev}
          </ControlBtn>
          <ControlBtn onClick={togglePlay} label={playing ? 'Pause' : 'Play'} size="lg">
            {playing ? Icons.pause : Icons.play}
          </ControlBtn>
          <ControlBtn onClick={handleNextClick} label="Next" size="md">
            {Icons.next}
          </ControlBtn>
          <ControlBtn onClick={toggleRepeat} active={repeat} size="sm" label="Repeat">
            {Icons.repeat}
          </ControlBtn>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <button
            className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            aria-label="Devices"
          >
            {Icons.devices}
          </button>
          <VolumeSlider />
          <button
            className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            aria-label="Queue"
          >
            {Icons.queue}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
