export interface Playlist {
  id: string
  name: string
  description: string
  color: string
  gradient: [string, string]
  trackIndices: number[]
  followers?: string
  icon?: string
}

export const PLAYLISTS: Playlist[] = [
  {
    id: 'liked',
    name: 'Liked Songs',
    description: 'Your favorite tracks',
    color: '#450af5',
    gradient: ['#450af5', '#8e8ee5'],
    trackIndices: [0, 1, 3, 5, 6],
    followers: '5 songs',
    icon: '♥',
  },
  {
    id: 'daily1',
    name: 'Daily Mix 1',
    description: 'The Weeknd, Post Malone and more',
    color: '#e21b1b',
    gradient: ['#e21b1b', '#6b0e0e'],
    trackIndices: [0, 1, 2, 4, 8],
    followers: 'Made for you',
  },
  {
    id: 'daily2',
    name: 'Daily Mix 2',
    description: 'Billy Joel, Johnny Cash and more',
    color: '#e858d6',
    gradient: ['#e858d6', '#7a2070'],
    trackIndices: [6, 5, 3, 7, 8],
    followers: 'Made for you',
  },
  {
    id: 'chill',
    name: 'Mellow Tones',
    description: 'Relaxing beats to unwind',
    color: '#1db954',
    gradient: ['#1db954', '#0a5c2a'],
    trackIndices: [6, 2, 3, 7, 8],
    followers: '2.4M likes',
  },
  {
    id: 'workout',
    name: 'Pump It Up',
    description: 'High energy bangers',
    color: '#e21b1b',
    gradient: ['#e21b1b', '#6b0e0e'],
    trackIndices: [0, 3, 2, 4, 1],
    followers: '1.8M likes',
  },
  {
    id: 'late',
    name: 'Midnight Drive',
    description: 'Moody after-dark tracks',
    color: '#4b7bec',
    gradient: ['#4b7bec', '#1e3060'],
    trackIndices: [0, 4, 6, 7, 8],
    followers: '3.1M likes',
  },
  {
    id: 'discover',
    name: 'Discover Weekly',
    description: 'Your personal mixtape of fresh music',
    color: '#e858d6',
    gradient: ['#e858d6', '#6b2060'],
    trackIndices: [2, 3, 1, 5, 6, 7],
    followers: 'Made for you',
  },
  {
    id: 'feelgood',
    name: 'Mood Booster',
    description: 'Instant mood boost',
    color: '#f5a623',
    gradient: ['#f5a623', '#6b4a0e'],
    trackIndices: [1, 3, 2, 0, 4],
    followers: '5.6M likes',
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    description: 'Deep concentration beats',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#3b1f6e'],
    trackIndices: [1, 2, 6, 8, 7],
    followers: '4.2M likes',
  },
  {
    id: 'release',
    name: 'Fresh Finds',
    description: 'Catch all the latest music',
    color: '#4b7bec',
    gradient: ['#4b7bec', '#1e3060'],
    trackIndices: [3, 2, 4, 1, 0],
    followers: 'Made for you',
  },
  {
    id: 'repeat',
    name: 'Your Anthems',
    description: "Songs you can't stop playing",
    color: '#1db954',
    gradient: ['#1db954', '#0a5c2a'],
    trackIndices: [0, 2, 3, 1, 4],
    followers: 'Made for you',
  },
  {
    id: 'chillhits',
    name: 'Golden Hour',
    description: 'Kick back to the best chill hits',
    color: '#f5a623',
    gradient: ['#f5a623', '#6b4a0e'],
    trackIndices: [1, 4, 2, 6, 7, 8],
    followers: '7.1M likes',
  },
  {
    id: 'classics',
    name: 'Forever Hits',
    description: 'The greatest songs ever recorded',
    color: '#c45a27',
    gradient: ['#c45a27', '#6b2e14'],
    trackIndices: [5, 6, 7, 8, 0, 2, 3],
    followers: '12.3M likes',
  },
]

export const QUICK_PICK_IDS = ['liked', 'daily1', 'daily2', 'release', 'repeat', 'chillhits']

export function getPlaylistById(id: string) {
  return PLAYLISTS.find((p) => p.id === id)!
}
