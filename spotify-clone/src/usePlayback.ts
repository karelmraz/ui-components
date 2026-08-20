import { useState, useEffect, useEffectEvent } from 'react'
import type { Playback } from './types.ts'
import { TRACKS } from './data/tracks.ts'
import { advanceQueue, buildQueue, rewindQueue } from './playbackQueue.ts'

const INITIAL_TRACK_INDEX = 1
const TICK_SECONDS = 0.25

/**
 * Playback engine: current/next/next-next queue, play state, elapsed time
 * (advanced on a 250 ms interval), shuffle, repeat and likes.
 * The queue arithmetic lives in playbackQueue.ts, where it has tests.
 */
export function usePlayback(): Playback {
  const [queue, setQueue] = useState(() => buildQueue(INITIAL_TRACK_INDEX, TRACKS.length, false))
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [likedIndices, setLikedIndices] = useState(() => new Set([INITIAL_TRACK_INDEX]))

  const { trackIndex, nextTrackIndex, nextNextTrackIndex } = queue
  const track = TRACKS[trackIndex]

  const next = () => {
    if (!repeat) setQueue(advanceQueue(queue, TRACKS.length, shuffle))
    setElapsed(0)
  }

  const prev = () => {
    setQueue(rewindQueue(queue, TRACKS.length))
    setElapsed(0)
  }

  // Effect event: always sees the latest elapsed/next, so toggling shuffle or
  // repeat mid-track is honoured when the track ends.
  const tick = useEffectEvent(() => {
    if (elapsed >= track.duration) next()
    else setElapsed(elapsed + TICK_SECONDS)
  })

  useEffect(() => {
    if (!playing) return
    const id = setInterval(tick, TICK_SECONDS * 1000)
    return () => clearInterval(id)
  }, [playing])

  const startTrack = (index: number, shuffleOn: boolean) => {
    setQueue(buildQueue(index, TRACKS.length, shuffleOn))
    setElapsed(0)
    setPlaying(true)
  }

  const playTrack = (index: number) => startTrack(index, shuffle)

  const shufflePlay = (trackIndices: number[]) => {
    setShuffle(true)
    startTrack(trackIndices[Math.floor(Math.random() * trackIndices.length)], true)
  }

  const toggleShuffle = () => {
    const nextShuffle = !shuffle
    setShuffle(nextShuffle)
    setQueue(buildQueue(trackIndex, TRACKS.length, nextShuffle))
  }

  const toggleLike = () => {
    setLikedIndices((prev) => {
      const updated = new Set(prev)
      if (updated.has(trackIndex)) updated.delete(trackIndex)
      else updated.add(trackIndex)
      return updated
    })
  }

  return {
    track,
    trackIndex,
    nextTrackIndex,
    nextNextTrackIndex,
    playing,
    elapsed,
    progress: elapsed / track.duration,
    shuffle,
    repeat,
    isLiked: likedIndices.has(trackIndex),
    togglePlay: () => setPlaying((p) => !p),
    next,
    prev,
    playTrack,
    shufflePlay,
    toggleShuffle,
    toggleRepeat: () => setRepeat((r) => !r),
    toggleLike,
    seek: (pct) => setElapsed(pct * track.duration),
  }
}
