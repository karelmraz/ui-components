import { motion } from 'framer-motion';
import { item } from './variants';

export function HeroCopy() {
  return (
    <motion.p
      variants={item}
      className="max-w-[44ch] text-[0.9375rem] leading-relaxed text-muted lg:text-base"
    >
      Proxima runs your app in all 35 regions and answers every request from the one nearest your
      user — no traffic managers, no failover runbooks, no 3 a.m. reroutes.
    </motion.p>
  );
}
