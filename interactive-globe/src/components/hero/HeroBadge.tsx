import { motion } from 'framer-motion';
import { item } from './variants';

export function HeroBadge({ children }: { children: string }) {
  return (
    <motion.div
      variants={item}
      className="pill flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      {children}
    </motion.div>
  );
}
