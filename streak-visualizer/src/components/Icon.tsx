import { ICON_MAP, type IconName } from '../icons';
import type { IconProps } from './Icons';

interface NamedIconProps extends IconProps {
  name: IconName;
}

/** Renders an icon from the registry by name, so data can reference icons as plain strings */
export function Icon({ name, ...props }: NamedIconProps) {
  const Comp = ICON_MAP[name];
  return <Comp {...props} />;
}
