import type { Track } from '../data/tracks.ts'
import { ArtworkImg } from './ArtworkImg.tsx'

export function AlbumThumb({ track, size = 48 }: { track: Track; size?: number }) {
  return (
    <div className="flex-shrink-0" style={{ width: size, height: size }}>
      <ArtworkImg
        src={track.artwork}
        alt={track.album}
        fallbackGradient={`linear-gradient(135deg, ${track.gradient[2]}, ${track.gradient[1]})`}
        fallbackLetter={track.title[0]}
        className="w-full h-full"
        size={size <= 60 ? 100 : 200}
      />
    </div>
  )
}
