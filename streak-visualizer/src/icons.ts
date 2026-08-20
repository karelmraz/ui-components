import type { ComponentType } from 'react';
import {
  type IconProps,
  FireIcon,
  SparkleIcon,
  BoltIcon,
  TrophyIcon,
  DiamondIcon,
  CrownIcon,
  StarIcon,
  SnowflakeIcon,
  CalendarIcon,
  SunIcon,
  MoonIcon,
  BurstIcon,
  PartyIcon,
} from './components/Icons';

/** Registry of icons addressable by name (used by milestone and stat data) */
export const ICON_MAP = {
  fire: FireIcon,
  sparkle: SparkleIcon,
  bolt: BoltIcon,
  trophy: TrophyIcon,
  diamond: DiamondIcon,
  crown: CrownIcon,
  star: StarIcon,
  snowflake: SnowflakeIcon,
  calendar: CalendarIcon,
  sun: SunIcon,
  moon: MoonIcon,
  burst: BurstIcon,
  party: PartyIcon,
} satisfies Record<string, ComponentType<IconProps>>;

export type IconName = keyof typeof ICON_MAP;
