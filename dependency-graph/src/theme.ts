export interface Theme {
  pageBg: string;
  cardBg: string;
  cardShadow: string;
  canvasBg: string;
  gridDot: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentFillFrom: string;
  accentFillTo: string;

  // Node
  nodeDefaultBg: string;
  nodeDefaultBorder: string;
  nodeDefaultShadow: string;
  nodeHoverGlow: string;
  nodeSelectedBg: string;
  nodeSelectedBorder: string;
  nodeSelectedGlow: string;

  // Vulnerability
  vulnCriticalBg: string;
  vulnCriticalBorder: string;
  vulnCriticalText: string;
  vulnHighBg: string;
  vulnHighBorder: string;
  vulnHighText: string;
  vulnModerateBg: string;
  vulnModerateBorder: string;
  vulnModerateText: string;
  vulnNoneBg: string;
  vulnNoneText: string;

  // Category
  catCore: string;
  catFramework: string;
  catStyling: string;
  catTooling: string;
  catTesting: string;
  catUtility: string;

  // Misc
  connectionLine: string;
  connectionHighlight: string;
  particleDim: string;
  borderSubtle: string;
  badgeBg: string;
  badgeText: string;
  outdatedBg: string;
  outdatedText: string;

  // Tooltip / Panel
  tooltipBg: string;
  tooltipBorder: string;
  tooltipShadow: string;
  tooltipDivider: string;
  tooltipShine: string;
}

export type ThemeName = 'dark' | 'light';

export const themes: Record<ThemeName, Theme> = {
  dark: {
    pageBg: '#080a0e',
    cardBg: '#0e1117',
    cardShadow: '0 0 0 1px rgba(140,180,255,0.04)',
    canvasBg: '#0b0d13',
    gridDot: 'rgba(140,180,255,0.03)',
    textPrimary: '#e2e8f0',
    textSecondary: '#a0aec0',
    textMuted: '#7a8ba0',
    accent: '#f59e4e',
    accentFillFrom: '#f0883e',
    accentFillTo: '#e05252',

    nodeDefaultBg: 'rgba(140,180,255,0.025)',
    nodeDefaultBorder: 'rgba(140,180,255,0.08)',
    nodeDefaultShadow: '0 2px 12px rgba(0,0,0,0.4)',
    nodeHoverGlow: '0 0 22px rgba(240,136,62,0.14)',
    nodeSelectedBg: 'rgba(240,136,62,0.08)',
    nodeSelectedBorder: 'rgba(240,136,62,0.45)',
    nodeSelectedGlow: '0 0 28px rgba(240,136,62,0.18), 0 0 0 1px rgba(240,136,62,0.25)',

    vulnCriticalBg: 'rgba(239,68,68,0.12)',
    vulnCriticalBorder: 'rgba(239,68,68,0.4)',
    vulnCriticalText: '#fca5a5',
    vulnHighBg: 'rgba(251,146,60,0.1)',
    vulnHighBorder: 'rgba(251,146,60,0.35)',
    vulnHighText: '#fdba74',
    vulnModerateBg: 'rgba(250,204,21,0.08)',
    vulnModerateBorder: 'rgba(250,204,21,0.25)',
    vulnModerateText: '#fde047',
    vulnNoneBg: 'rgba(74,222,128,0.08)',
    vulnNoneText: '#86efac',

    catCore: '#93c5fd',
    catFramework: '#c084fc',
    catStyling: '#fb7185',
    catTooling: '#5eead4',
    catTesting: '#86efac',
    catUtility: '#fbbf24',

    connectionLine: 'rgba(150,188,255,0.3)',
    connectionHighlight: 'rgba(240,136,62,0.6)',
    particleDim: 'rgba(170,205,255,0.8)',
    borderSubtle: 'rgba(140,180,255,0.05)',
    badgeBg: 'rgba(240,136,62,0.1)',
    badgeText: '#f5a860',
    outdatedBg: 'rgba(250,204,21,0.1)',
    outdatedText: '#fde68a',

    tooltipBg: 'rgba(14,17,23,0.95)',
    tooltipBorder: 'rgba(140,180,255,0.08)',
    tooltipShadow: '0 24px 64px rgba(0,0,0,0.6)',
    tooltipDivider: 'rgba(140,180,255,0.05)',
    tooltipShine: 'rgba(240,136,62,0.03)',
  },
  light: {
    pageBg: '#f4f5f7',
    cardBg: '#ffffff',
    cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
    canvasBg: '#f9fafb',
    gridDot: 'rgba(0,0,0,0.05)',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    accent: '#5956ed',
    accentFillFrom: '#605dff',
    accentFillTo: '#8b5cf6',

    nodeDefaultBg: '#ffffff',
    nodeDefaultBorder: '#d1d5db',
    nodeDefaultShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
    nodeHoverGlow: '0 0 16px rgba(96,93,255,0.14)',
    nodeSelectedBg: '#eeecff',
    nodeSelectedBorder: '#605dff',
    nodeSelectedGlow: '0 0 20px rgba(96,93,255,0.18), 0 0 0 1.5px #605dff',

    vulnCriticalBg: 'rgba(185,28,28,0.06)',
    vulnCriticalBorder: 'rgba(185,28,28,0.28)',
    vulnCriticalText: '#991b1b',
    vulnHighBg: 'rgba(154,52,18,0.06)',
    vulnHighBorder: 'rgba(154,52,18,0.26)',
    vulnHighText: '#9a3412',
    vulnModerateBg: 'rgba(133,77,14,0.06)',
    vulnModerateBorder: 'rgba(133,77,14,0.22)',
    vulnModerateText: '#854d0e',
    vulnNoneBg: 'rgba(21,128,61,0.06)',
    vulnNoneText: '#166534',

    catCore: '#1d4ed8',
    catFramework: '#7c3aed',
    catStyling: '#be123c',
    catTooling: '#0369a1',
    catTesting: '#047857',
    catUtility: '#b45309',

    connectionLine: '#9aa3b2',
    connectionHighlight: '#605dff',
    particleDim: '#5a6b85',
    borderSubtle: '#e5e7eb',
    badgeBg: 'rgba(96,93,255,0.08)',
    badgeText: '#4240b3',
    outdatedBg: 'rgba(180,83,9,0.08)',
    outdatedText: '#78350f',

    tooltipBg: 'rgba(255,255,255,0.98)',
    tooltipBorder: '#d1d5db',
    tooltipShadow: '0 16px 40px rgba(0,0,0,0.08)',
    tooltipDivider: '#e5e7eb',
    tooltipShine: 'rgba(67,56,202,0.02)',
  },
};

/** Theme tokens as CSS custom properties: `nodeSelectedGlow` → `--node-selected-glow` */
export type ThemeVars = Record<`--${string}`, string>;

export function themeToVars(t: Theme): ThemeVars {
  return Object.fromEntries(
    Object.entries(t).map(([k, v]) => [
      '--' + k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()),
      v,
    ]),
  );
}

/** Mirror the vars onto <html> so portaled content (tooltips) outside the themed root resolves them too */
export function applyThemeVars(vars: ThemeVars): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
