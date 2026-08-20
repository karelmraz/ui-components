import { useState, useEffect } from 'react'

export function StatusBar() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const hh = time.getHours().toString().padStart(2, '0')
  const mm = time.getMinutes().toString().padStart(2, '0')

  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-white text-[12px] font-semibold relative z-50">
      <span>
        {hh}:{mm}
      </span>
      <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[90px] h-[24px] bg-black rounded-full" />
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="white">
          <rect x="0" y="7" width="3" height="4" rx="0.8" />
          <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.8" />
          <rect x="9" y="2" width="3" height="9" rx="0.8" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.8" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path
            d="M7.5 2C4.5 2 2 3.4 0 5.4l1.4 1.4C3 5.2 5.1 4 7.5 4s4.5 1.2 6.1 2.8L15 5.4C13 3.4 10.5 2 7.5 2Z"
            fill="white"
          />
          <path
            d="M7.5 6c-1.7 0-3.2.7-4.4 1.9l1.4 1.4C5.3 8.5 6.3 8 7.5 8s2.2.5 3 1.3l1.4-1.4C10.7 6.7 9.2 6 7.5 6Z"
            fill="white"
          />
          <circle cx="7.5" cy="10" r="1" fill="white" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="white" strokeOpacity="0.5" />
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="white" />
          <path d="M24 4.5v3a1.5 1.5 0 0 0 0-3Z" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  )
}
