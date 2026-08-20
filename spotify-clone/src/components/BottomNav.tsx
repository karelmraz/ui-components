import type { Tab } from '../types.ts'
import { Icons } from '../Icons.tsx'

const TABS: { key: Tab; label: string; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
  { key: 'home', label: 'Home', icon: Icons.homeOutline, activeIcon: Icons.home },
  { key: 'search', label: 'Search', icon: Icons.search, activeIcon: Icons.searchActive },
  { key: 'library', label: 'Library', icon: Icons.library, activeIcon: Icons.libraryFilled },
]

export function BottomNav({
  activeTab,
  onChangeTab,
}: {
  activeTab: Tab
  onChangeTab: (tab: Tab) => void
}) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[47] flex items-center justify-around py-2 pb-4"
      style={{
        background:
          'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0))',
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChangeTab(tab.key)}
          className={`flex flex-col items-center gap-0.5 px-6 py-1 cursor-pointer ${activeTab === tab.key ? 'text-white' : 'text-white/40'}`}
        >
          {activeTab === tab.key ? tab.activeIcon : tab.icon}
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[120px] h-[4px] rounded-full bg-white/20" />
    </div>
  )
}
