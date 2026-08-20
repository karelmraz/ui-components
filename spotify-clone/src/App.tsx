import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Tab, TabScreenProps, View } from './types.ts'
import { getPlaylistById, type Playlist } from './data/playlists.ts'
import { usePlayback } from './usePlayback.ts'
import { PhoneFrame } from './components/PhoneFrame.tsx'
import { MiniPlayer } from './components/MiniPlayer.tsx'
import { BottomNav } from './components/BottomNav.tsx'
import { HomeScreen } from './screens/HomeScreen.tsx'
import { SearchScreen } from './screens/SearchScreen.tsx'
import { LibraryScreen } from './screens/LibraryScreen.tsx'
import { PlaylistDetailScreen } from './screens/PlaylistDetailScreen.tsx'
import { NowPlayingScreen } from './screens/NowPlayingScreen.tsx'

export default function App() {
  const playback = usePlayback()
  const [view, setView] = useState<View>('home')
  // The tab underneath the playlist / now-playing overlays; also where "back" and "close" return to.
  const [baseTab, setBaseTab] = useState<Tab>('home')
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null)

  const openPlaylist = (id: string) => {
    setActivePlaylist(getPlaylistById(id))
    setView('playlist')
  }

  const goToNowPlaying = (index: number) => {
    playback.playTrack(index)
    setView('nowPlaying')
  }

  const changeTab = (tab: Tab) => {
    setBaseTab(tab)
    setActivePlaylist(null)
    setView(tab)
  }

  const tabScreenProps: TabScreenProps = {
    trackIndex: playback.trackIndex,
    playing: playback.playing,
    onPlayTrack: goToNowPlaying,
    onOpenPlaylist: openPlaylist,
  }

  const showMiniPlayer = view !== 'nowPlaying' && playback.playing

  return (
    <PhoneFrame>
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pt-[48px] scrollbar-hide">
        <AnimatePresence mode="wait">
          {view === 'home' && <HomeScreen key="home" {...tabScreenProps} />}
          {view === 'search' && <SearchScreen key="search" {...tabScreenProps} />}
          {view === 'library' && <LibraryScreen key="library" {...tabScreenProps} />}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {view === 'playlist' && activePlaylist && (
          <PlaylistDetailScreen
            playlist={activePlaylist}
            currentTrackIndex={playback.trackIndex}
            playing={playback.playing}
            onPlayTrack={playback.playTrack}
            onShufflePlay={() => playback.shufflePlay(activePlaylist.trackIndices)}
            onBack={() => setView(baseTab)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMiniPlayer && (
          <MiniPlayer
            track={playback.track}
            playing={playback.playing}
            progress={playback.progress}
            onTogglePlay={playback.togglePlay}
            onOpen={() => setView('nowPlaying')}
          />
        )}
      </AnimatePresence>

      {view !== 'nowPlaying' && <BottomNav activeTab={baseTab} onChangeTab={changeTab} />}

      <AnimatePresence>
        {view === 'nowPlaying' && (
          <NowPlayingScreen
            playback={playback}
            onClose={() => setView(activePlaylist ? 'playlist' : baseTab)}
          />
        )}
      </AnimatePresence>
    </PhoneFrame>
  )
}
