import { motion } from 'framer-motion'

export function Equalizer({
  playing,
  color,
  size = 40,
}: {
  playing: boolean
  color: string
  size?: number
}) {
  return (
    <div className="flex items-end gap-[3px]" style={{ height: size }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full origin-bottom"
          style={{ backgroundColor: color, height: size }}
          animate={
            playing
              ? {
                  scaleY: [0.5, 1, 0.6, 0.9, 0.5],
                  transition: {
                    duration: 0.8 + i * 0.15,
                    repeat: Infinity,
                    repeatType: 'mirror' as const,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  },
                }
              : { scaleY: 0.4 }
          }
        />
      ))}
    </div>
  )
}
