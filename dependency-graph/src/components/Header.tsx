import type { ReactNode } from 'react';
import { Icon } from './Icons';

export interface HeaderProps {
  totalPackages: number;
  vulnCount: number;
  depCount: number;
  /** Controls composed into the right-hand slot (theme toggle) */
  children?: ReactNode;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function Header({ totalPackages, vulnCount, depCount, children }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <Icon name="package" size={16} style={{ color: 'var(--page-bg)' }} />
        </div>
        <div>
          <h1 className="text-[15px] font-bold tracking-tight m-0 leading-tight text-[var(--text-primary)]">
            npm dependencies
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[var(--text-muted)]">
              {plural(totalPackages, 'package')}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">·</span>
            <span className="text-[11px] text-[var(--text-muted)]">{plural(depCount, 'dep')}</span>
            {vulnCount > 0 && (
              <>
                <span className="text-[11px] text-[var(--text-muted)]">·</span>
                <span className="flex items-center gap-0.5 text-[11px] text-[var(--vuln-high-text)] font-semibold">
                  <Icon name="alert-triangle" size={10} />
                  {vulnCount}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
