export interface Category {
  name: string
  color: string
  gradient: [string, string]
}

export const CATEGORIES: Category[] = [
  { name: 'Pop', color: '#e858d6', gradient: ['#e858d6', '#7a2070'] },
  { name: 'Hip-Hop', color: '#ba5d07', gradient: ['#ba5d07', '#5c2e03'] },
  { name: 'Rock', color: '#e21b1b', gradient: ['#e21b1b', '#6b0e0e'] },
  { name: 'Indie', color: '#8b5cf6', gradient: ['#8b5cf6', '#3b1f6e'] },
  { name: 'R&B', color: '#4b7bec', gradient: ['#4b7bec', '#1e3060'] },
  { name: 'Electronic', color: '#1db954', gradient: ['#1db954', '#0a5c2a'] },
  { name: 'Chill', color: '#148a8a', gradient: ['#148a8a', '#0a4545'] },
  { name: 'Mood', color: '#d4a843', gradient: ['#d4a843', '#6b5a1e'] },
  { name: 'Workout', color: '#e21b1b', gradient: ['#e21b1b', '#8b1a1a'] },
  { name: 'Focus', color: '#4b7bec', gradient: ['#4b7bec', '#1e3a6b'] },
  { name: 'Party', color: '#f5a623', gradient: ['#f5a623', '#6b4a0e'] },
  { name: 'Sleep', color: '#1a1a2e', gradient: ['#3a3a5e', '#1a1a2e'] },
]
