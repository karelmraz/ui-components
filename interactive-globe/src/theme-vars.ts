import type { CSSProperties } from 'react';
import type { Theme } from './theme';

export function themeVars(theme: Theme): CSSProperties {
  return {
    '--bg': theme.bg,
    '--text': theme.text,
    '--muted': theme.textMuted,
    '--strong': theme.textStrong,
    '--surface': theme.surface,
    '--surface-hover': theme.surfaceHover,
    '--border': theme.border,
    '--popover': theme.popover,
    '--tooltip': theme.tooltip,
    '--noise-opacity': theme.noise,
    '--accent': theme.accent,
    '--btn-1': theme.btn[0],
    '--btn-2': theme.btn[1],
    '--btn-text': theme.btnText,
    '--grad-1': theme.grad[0],
    '--grad-2': theme.grad[1],
    '--grad-3': theme.grad[2],
    '--glow-1': theme.glows[0],
    '--glow-2': theme.glows[1],
    '--glow-3': theme.glows[2],
  } as CSSProperties;
}
