import type { Playlist } from '../data/playlists.ts'
import { TRACKS } from '../data/tracks.ts'
import { FallbackImg } from './ArtworkImg.tsx'

/** The four artwork tiles of a playlist cover. The caller supplies the 2×2 grid container. */
export function PlaylistMosaic({
  playlist,
  size,
  priority,
}: {
  playlist: Playlist
  size: number
  priority?: boolean
}) {
  return (
    <>
      {playlist.trackIndices.slice(0, 4).map((ti, i) => {
        const track = TRACKS[ti]
        return (
          <FallbackImg
            key={i}
            src={track.artwork}
            alt={track.album}
            gradient={`linear-gradient(135deg, ${track.gradient[2]}, ${track.gradient[1]})`}
            letter={track.title[0]}
            className="w-full h-full"
            size={size}
            priority={priority}
          />
        )
      })}
    </>
  )
}
