import { motion } from 'framer-motion'

type ControlSize = 'sm' | 'md' | 'lg'

const SIZE_CLASS: Record<ControlSize, string> = { sm: 'w-9 h-9', md: 'w-10 h-10', lg: 'w-14 h-14' }

export function ControlBtn({
  children,
  onClick,
  active,
  size = 'md',
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  size?: ControlSize
  label: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className={`${SIZE_CLASS[size]} cursor-pointer rounded-full flex items-center justify-center transition-colors ${
        active ? 'text-[#1db954]' : 'text-white/70 hover:text-white'
      } ${size === 'lg' ? 'bg-white text-black! hover:scale-105' : ''}`}
    >
      {children}
    </motion.button>
  )
}
