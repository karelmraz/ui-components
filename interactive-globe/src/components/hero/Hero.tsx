import { motion } from 'framer-motion';
import { HeroActions } from './HeroActions';
import { HeroBadge } from './HeroBadge';
import { HeroCopy } from './HeroCopy';
import { HeroHeadline } from './HeroHeadline';
import { HeroStats } from './HeroStats';
import { stagger } from './variants';

export function Hero() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative z-10 flex flex-col items-center gap-4 pt-10 text-center sm:gap-5 sm:pt-14 lg:items-start lg:gap-6 lg:pt-0 lg:text-left"
    >
      <HeroBadge>Anycast edge — 35 regions live</HeroBadge>
      <HeroHeadline />
      <HeroCopy />
      <HeroActions />
      <HeroStats />
    </motion.div>
  );
}
