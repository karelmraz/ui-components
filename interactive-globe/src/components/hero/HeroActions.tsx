import { motion } from 'framer-motion';
import { item } from './variants';

export function HeroActions() {
  return (
    <motion.div
      variants={item}
      className="mt-1 flex flex-wrap items-center justify-center gap-3 sm:mt-0 lg:justify-start"
    >
      <button
        type="button"
        className="group pointer-events-auto relative overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-[var(--btn-text)] transition active:scale-[0.98]"
      >
        <span className="absolute inset-0 bg-cta" />
        <span className="absolute inset-0 bg-cta-hover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute inset-x-0 top-0 h-px bg-white/40" />
        <span className="relative">Deploy free</span>
      </button>
      <button
        type="button"
        className="pill pointer-events-auto rounded-xl px-6 py-3 text-sm font-semibold active:scale-[0.98]"
      >
        See the network
      </button>
    </motion.div>
  );
}
