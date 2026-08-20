import type { CSSProperties } from 'react';

export interface Theme {
  pageBg: string;
  cardBg: string;
  cardShadow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  streakAccent: string;
  streakGlow: string;
  fireFrom: string;
  fireTo: string;
  fireVia: string;
  heatEmpty: string;
  heatLow: string;
  heatMed: string;
  heatHigh: string;
  heatMax: string;
  todayRing: string;
  milestoneLockedBg: string;
  milestoneLockedBorder: string;
  milestoneUnlockedBg: string;
  milestoneUnlockedBorder: string;
  milestoneGlow: string;
  divider: string;
  freezeBg: string;
  freezeBorder: string;
  freezeText: string;
  overlayBg: string;
  buttonBg: string;
  buttonText: string;
  badgeBg: string;
  badgeText: string;
  weekDotDone: string;
  weekDotEmpty: string;
}

export type ThemeName = 'dark' | 'light';

export const themes: Record<ThemeName, Theme> = {
  dark: {
    pageBg: '#110c08',
    cardBg: '#1c1510',
    cardShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,165,0,0.08)',
    textPrimary: '#faf5ef',
    textSecondary: '#c4b5a3',
    textMuted: '#9a8e7f',
    streakAccent: '#ff9500',
    streakGlow: 'rgba(255,149,0,0.4)',
    fireFrom: '#ff4500',
    fireTo: '#ffcc00',
    fireVia: '#ff8c00',
    heatEmpty: 'rgba(255,149,0,0.13)',
    heatLow: 'rgba(255,149,0,0.25)',
    heatMed: 'rgba(255,149,0,0.45)',
    heatHigh: 'rgba(255,149,0,0.7)',
    heatMax: 'rgba(255,149,0,0.95)',
    todayRing: '#ff9500',
    milestoneLockedBg: 'rgba(255,149,0,0.06)',
    milestoneLockedBorder: 'rgba(255,149,0,0.14)',
    milestoneUnlockedBg: 'rgba(255,149,0,0.14)',
    milestoneUnlockedBorder: 'rgba(255,149,0,0.5)',
    milestoneGlow: '0 0 20px rgba(255,149,0,0.3)',
    divider: 'rgba(255,149,0,0.1)',
    freezeBg: 'rgba(56,189,248,0.1)',
    freezeBorder: 'rgba(56,189,248,0.3)',
    freezeText: '#7dd3fc',
    overlayBg: 'rgba(17,12,8,0.9)',
    buttonBg: '#ff9500',
    buttonText: '#1c1510',
    badgeBg: 'rgba(255,149,0,0.15)',
    badgeText: '#ffb84d',
    weekDotDone: '#ff9500',
    weekDotEmpty: 'rgba(255,149,0,0.14)',
  },
  light: {
    pageBg: '#fff4e6',
    cardBg: '#fffbf5',
    cardShadow:
      '0 20px 60px rgba(180,90,0,0.08), 0 4px 16px rgba(180,90,0,0.06), 0 0 0 1px rgba(255,149,0,0.15)',
    textPrimary: '#2d1a00',
    textSecondary: '#6b4400',
    textMuted: '#9a7040',
    streakAccent: '#e07800',
    streakGlow: 'rgba(224,120,0,0.35)',
    fireFrom: '#e83e00',
    fireTo: '#ffb800',
    fireVia: '#f07800',
    heatEmpty: 'rgba(224,120,0,0.1)',
    heatLow: 'rgba(224,120,0,0.22)',
    heatMed: 'rgba(224,120,0,0.42)',
    heatHigh: 'rgba(224,120,0,0.65)',
    heatMax: 'rgba(224,120,0,0.9)',
    todayRing: '#c86800',
    milestoneLockedBg: 'rgba(224,120,0,0.06)',
    milestoneLockedBorder: 'rgba(224,120,0,0.14)',
    milestoneUnlockedBg: 'rgba(255,149,0,0.14)',
    milestoneUnlockedBorder: 'rgba(224,120,0,0.5)',
    milestoneGlow: '0 0 18px rgba(224,120,0,0.2)',
    divider: 'rgba(224,120,0,0.12)',
    freezeBg: 'rgba(14,140,210,0.07)',
    freezeBorder: 'rgba(14,140,210,0.22)',
    freezeText: '#0270a8',
    overlayBg: 'rgba(255,244,230,0.94)',
    buttonBg: '#d06a00',
    buttonText: '#ffffff',
    badgeBg: 'rgba(224,120,0,0.14)',
    badgeText: '#8a4e00',
    weekDotDone: '#e07800',
    weekDotEmpty: 'rgba(224,120,0,0.12)',
  },
};

const UPPERCASE = /[A-Z]/g;

/** Map theme keys to CSS custom properties: `pageBg` → `--page-bg` */
export function themeToCssVars(theme: Theme): CSSProperties {
  return Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [
      '--' + key.replace(UPPERCASE, (c) => '-' + c.toLowerCase()),
      value,
    ]),
  ) as CSSProperties;
}
