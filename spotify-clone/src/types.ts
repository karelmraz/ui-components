import type { Track } from './data/tracks.ts'

export type Tab = 'home' | 'search' | 'library'
export type View = Tab | 'playlist' | 'nowPlaying'

/** Props shared by the three bottom-nav screens. */
export interface TabScreenProps {
  trackIndex: number
  playing: boolean
  onPlayTrack: (index: number) => void
  onOpenPlaylist: (playlistId: string) => void
}

/** Everything the player UI needs, as returned by usePlayback(). */
export interface Playback {
  track: Track
  trackIndex: number
  nextTrackIndex: number
  nextNextTrackIndex: number
  playing: boolean
  elapsed: number
  progress: number
  shuffle: boolean
  repeat: boolean
  isLiked: boolean
  togglePlay: () => void
  next: () => void
  prev: () => void
  playTrack: (index: number) => void
  shufflePlay: (trackIndices: number[]) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleLike: () => void
  seek: (pct: number) => void
}
