import { motion } from 'framer-motion';
import { item } from './variants';

export function HeroHeadline() {
  return (
    <motion.h1
      variants={item}
      className="max-w-[20ch] font-display text-[clamp(2.6rem,5.6vw,4.1rem)] font-extrabold leading-[1.03] tracking-[-0.03em]"
    >
      Ship once.
      <br />
      <span className="bg-headline bg-clip-text text-transparent">Serve everywhere.</span>
    </motion.h1>
  );
}
