import { Logo } from './Logo';
import { MainNav } from './MainNav';
import { ThemePicker } from '../theme-picker/ThemePicker';
import { THEMES } from '../../theme';
import type { Theme } from '../../theme';

type SiteHeaderProps = {
  theme: Theme;
  onThemeChange: (id: string) => void;
};

export function SiteHeader({ theme, onThemeChange }: SiteHeaderProps) {
  return (
    <header className="relative z-30 mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 pt-7 lg:px-10">
      <div className="flex items-center gap-8">
        <Logo />
        <MainNav />
      </div>
      <div className="flex items-center gap-5">
        <span className="pill hidden cursor-pointer rounded-xl px-4 py-2 text-[15px] font-medium md:inline-flex">
          Sign in
        </span>
        <ThemePicker themes={THEMES} theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}
