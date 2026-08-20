export type VulnSeverity = 'critical' | 'high' | 'moderate' | 'none';
export type PackageCategory = 'core' | 'framework' | 'styling' | 'tooling' | 'testing' | 'utility';

export interface PackageNode {
  id: string;
  name: string;
  version: string;
  description: string;
  category: PackageCategory;
  x: number;
  y: number;
  dependencies: string[];
  vulnerability: VulnSeverity;
  vulnCount?: number;
  outdated?: boolean;
  license: string;
  size?: string;
  downloads?: number;
  /** Radius in px, sized by weekly downloads (base 24) */
  r: number;
  colorDark?: string;
  colorLight?: string;
}

/** A node before the graph model derives its radius */
export type PackageSeed = Omit<PackageNode, 'r'>;

export interface Dependency {
  from: string;
  to: string;
}
