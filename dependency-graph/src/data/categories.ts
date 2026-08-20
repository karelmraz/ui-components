import type { IconName } from '../components/Icons';
import type { PackageCategory, VulnSeverity } from '../graph/types';

export const CATEGORY_META: Record<
  PackageCategory,
  { label: string; icon: IconName; hint: string }
> = {
  core: { label: 'Core', icon: 'atom', hint: 'The package you searched' },
  framework: { label: 'Frameworks', icon: 'triangle', hint: 'Application frameworks' },
  styling: { label: 'CSS', icon: 'brush', hint: 'CSS and styling tools' },
  tooling: { label: 'Dev Tools', icon: 'container', hint: 'Build and developer tooling' },
  testing: { label: 'Testing', icon: 'flask', hint: 'Test frameworks and helpers' },
  utility: { label: 'Libraries', icon: 'plug', hint: 'General-purpose libraries' },
};

export const VULN_LABELS: Record<Exclude<VulnSeverity, 'none'>, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  moderate: 'MODERATE',
};
