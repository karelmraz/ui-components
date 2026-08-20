import type { ReactNode } from 'react'
import { StatusBar } from './StatusBar.tsx'

/** Page background plus the phone bezel and status bar; screens render inside. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 70%)' }}
    >
      <div
        className="relative w-[375px] h-[812px] rounded-[36px] overflow-hidden flex-shrink-0"
        style={{
          boxShadow:
            '0 0 0 3px #2a2a2a, 0 0 0 6px #1a1a1a, 0 30px 80px rgba(0,0,0,0.6), 0 0 120px rgba(29,185,84,0.06)',
          background: '#121212',
        }}
      >
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 right-0 z-[60]">
            <StatusBar />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
