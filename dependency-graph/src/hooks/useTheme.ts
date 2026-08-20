import { useLayoutEffect, useMemo, useState } from 'react';
import { applyThemeVars, themes, themeToVars, type ThemeName, type ThemeVars } from '../theme';

export interface ThemeState {
  themeName: ThemeName;
  isDark: boolean;
  /** Tokens as `--*` custom properties; spread onto the root element's `style` */
  themeVars: ThemeVars;
  toggleTheme: () => void;
}

export function useTheme(initial: ThemeName = 'dark'): ThemeState {
  const [themeName, setThemeName] = useState<ThemeName>(initial);

  // Memoized so the effect below only re-runs when the theme actually changes
  const themeVars = useMemo(() => themeToVars(themes[themeName]), [themeName]);

  useLayoutEffect(() => {
    applyThemeVars(themeVars);
  }, [themeVars]);

  const toggleTheme = () => setThemeName((name) => (name === 'dark' ? 'light' : 'dark'));

  return { themeName, isDark: themeName === 'dark', themeVars, toggleTheme };
}
