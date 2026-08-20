import { useState, useMemo, useLayoutEffect } from 'react';
import { themes, themeToCssVars, type ThemeName } from '../theme';

export function useTheme(initial: ThemeName = 'dark') {
  const [themeName, setThemeName] = useState<ThemeName>(initial);
  // Memoised because it drives the layout effect below; it must only change with the theme
  const themeVars = useMemo(() => themeToCssVars(themes[themeName]), [themeName]);

  // Mirror the variables on <html> so they are also available outside the themed container
  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(themeVars)) {
      root.style.setProperty(key, value as string);
    }
  }, [themeVars]);

  const toggleTheme = () => setThemeName((n) => (n === 'dark' ? 'light' : 'dark'));

  return { themeName, isDark: themeName === 'dark', themeVars, toggleTheme };
}
