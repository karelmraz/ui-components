import { useImperativeHandle, type Ref } from 'react'
import { flushSync } from 'react-dom'
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionStyle,
  type PanInfo,
} from 'framer-motion'
import { TRACKS } from '../data/tracks.ts'
import type { Track } from '../data/tracks.ts'
import { ArtworkImg } from './ArtworkImg.tsx'

const CARD_SIZE = 260
const SIDE_OFFSET = 200
const DRAG_THRESHOLD = 80
const DRAG_RANGE = 250

function Card({
  track,
  style,
  priority,
}: {
  track: Track
  style: MotionStyle
  priority?: boolean
}) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        marginLeft: -CARD_SIZE / 2,
        marginTop: -CARD_SIZE / 2,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{
          transformStyle: 'preserve-3d' as const,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          ...style,
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${track.gradient[2]}, ${track.gradient[1]})`,
          }}
        >
          <ArtworkImg
            src={track.artwork}
            alt={track.album}
            fallbackGradient="transparent"
            fallbackLetter={track.title[0]}
            className="w-full h-full"
            rounded=""
            size={CARD_SIZE * 2}
            priority={priority}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export interface AlbumCarouselHandle {
  next: () => void
  prev: () => void
}

export function AlbumCarousel({
  ref,
  trackIndex,
  nextTrackIndex,
  nextNextTrackIndex,
  playing,
  onNext,
  onPrev,
}: {
  ref?: Ref<AlbumCarouselHandle>
  trackIndex: number
  nextTrackIndex: number
  nextNextTrackIndex: number
  playing: boolean
  onNext: () => void
  onPrev: () => void
}) {
  const x = useMotionValue(0)

  const prevIndex = (trackIndex - 1 + TRACKS.length) % TRACKS.length
  const prevPrevIndex = (trackIndex - 2 + TRACKS.length) % TRACKS.length

  const prevPrevTrack = TRACKS[prevPrevIndex]
  const prevTrack = TRACKS[prevIndex]
  const currentTrack = TRACKS[trackIndex]
  const nextTrack = TRACKS[nextTrackIndex]
  const nextNextTrack = TRACKS[nextNextTrackIndex]

  const animateNext = () => {
    animate(x, -DRAG_RANGE, {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      onComplete: () => {
        flushSync(() => onNext())
        x.set(0)
      },
    })
  }

  const animatePrev = () => {
    animate(x, DRAG_RANGE, {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      onComplete: () => {
        flushSync(() => onPrev())
        x.set(0)
      },
    })
  }

  useImperativeHandle(ref, () => ({ next: animateNext, prev: animatePrev }))

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x
    const velocity = info.velocity.x

    if (swipe < -DRAG_THRESHOLD || velocity < -400) {
      animateNext()
    } else if (swipe > DRAG_THRESHOLD || velocity > 400) {
      animatePrev()
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 })
    }
  }

  const R = DRAG_RANGE

  // Left (previous): drag right → slides to center
  const leftX = useTransform(x, [-R, 0, R], [-SIDE_OFFSET - 30, -SIDE_OFFSET, 0])
  const leftScale = useTransform(x, [-R, 0, R], [0.5, 0.65, 1])
  const leftRotateY = useTransform(x, [-R, 0, R], [55, 42, 0])
  const leftOpacity = useTransform(x, [-R, 0, R], [0.15, 0.55, 1])
  const leftZ = useTransform(x, [0, R], [1, 25])

  // Right (next): drag left → slides to center
  const rightX = useTransform(x, [-R, 0, R], [0, SIDE_OFFSET, SIDE_OFFSET + 30])
  const rightScale = useTransform(x, [-R, 0, R], [1, 0.65, 0.5])
  const rightRotateY = useTransform(x, [-R, 0, R], [0, -42, -55])
  const rightOpacity = useTransform(x, [-R, 0, R], [1, 0.55, 0.15])
  const rightZ = useTransform(x, [-R, 0], [25, 1])

  // Center: moves with drag, shrinks when pulled away
  const centerX = useTransform(x, [-R, 0, R], [-SIDE_OFFSET, 0, SIDE_OFFSET])
  const centerScale = useTransform(x, [-R, 0, R], [0.65, 1, 0.65])
  const centerRotateY = useTransform(x, [-R, 0, R], [42, 0, -42])
  const centerOpacity = useTransform(x, [-R, 0, R], [0.55, 1, 0.55])

  // Far-right (next-next): at rest sits just off-screen; animates into the "next" slot when dragging left
  const farRightX = useTransform(x, [-R, 0, R], [SIDE_OFFSET, SIDE_OFFSET + 30, SIDE_OFFSET + 60])
  const farRightScale = useTransform(x, [-R, 0, R], [0.65, 0.5, 0.4])
  const farRightRotateY = useTransform(x, [-R, 0, R], [-42, -55, -60])
  const farRightOpacity = useTransform(x, [-R, 0, R], [0.55, 0.15, 0])

  // Far-left (prev-prev): at rest sits just off-screen; animates into the "prev" slot when dragging right
  const farLeftX = useTransform(x, [-R, 0, R], [-SIDE_OFFSET - 60, -SIDE_OFFSET - 30, -SIDE_OFFSET])
  const farLeftScale = useTransform(x, [-R, 0, R], [0.4, 0.5, 0.65])
  const farLeftRotateY = useTransform(x, [-R, 0, R], [60, 55, 42])
  const farLeftOpacity = useTransform(x, [-R, 0, R], [0, 0.15, 0.55])

  return (
    <div className="relative w-full select-none" style={{ height: CARD_SIZE, perspective: 800 }}>
      {/* Glow */}
      <motion.div
        className="absolute rounded-2xl blur-[60px]"
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE,
          left: '50%',
          top: '50%',
          x: '-50%',
          y: '-50%',
          background: currentTrack.color,
        }}
        animate={{ opacity: playing ? 0.45 : 0.15 }}
        transition={{ duration: 1.5 }}
      />

      {/* Invisible drag surface */}
      <motion.div
        className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        style={{ x }}
        onDragEnd={handleDragEnd}
      />

      <Card
        key={prevPrevTrack.title}
        track={prevPrevTrack}
        style={{
          x: farLeftX,
          scale: farLeftScale,
          rotateY: farLeftRotateY,
          opacity: farLeftOpacity,
          zIndex: 0,
        }}
      />
      <Card
        key={prevTrack.title}
        track={prevTrack}
        style={{
          x: leftX,
          scale: leftScale,
          rotateY: leftRotateY,
          opacity: leftOpacity,
          zIndex: leftZ,
        }}
      />
      <Card
        key={currentTrack.title}
        track={currentTrack}
        style={{
          x: centerX,
          scale: centerScale,
          rotateY: centerRotateY,
          opacity: centerOpacity,
          zIndex: 20,
        }}
        priority
      />
      <Card
        key={nextTrack.title}
        track={nextTrack}
        style={{
          x: rightX,
          scale: rightScale,
          rotateY: rightRotateY,
          opacity: rightOpacity,
          zIndex: rightZ,
        }}
      />
      <Card
        key={nextNextTrack.title}
        track={nextNextTrack}
        style={{
          x: farRightX,
          scale: farRightScale,
          rotateY: farRightRotateY,
          opacity: farRightOpacity,
          zIndex: 0,
        }}
      />
    </div>
  )
}
