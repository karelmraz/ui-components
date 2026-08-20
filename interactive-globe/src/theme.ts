export type Hex = string;
export type CssColor = string;

export type Theme = {
  id: string;
  name: string;
  mode: 'light' | 'dark';

  bg: CssColor;
  bg2: CssColor;
  text: CssColor;
  textMuted: CssColor;
  textStrong: CssColor;
  surface: CssColor;
  surfaceHover: CssColor;
  border: CssColor;
  popover: CssColor;
  tooltip: CssColor;
  noise: number;

  dotA: Hex;
  dotB: Hex;
  sphere: Hex;
  sphereShade: Hex;
  grid: Hex;
  coast: Hex;
  atmo: Hex;
  rim: Hex;
  hubGlow: [CssColor, CssColor];
  arcs: Hex[];
  ripple: Hex;

  grad: [CssColor, CssColor, CssColor];
  btn: [CssColor, CssColor];
  btnText: CssColor;
  accent: CssColor;
  glows: [CssColor, CssColor, CssColor];
};

function rgb(hex: Hex): [number, number, number] {
  const s = hex.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function scale(hex: Hex, f: number): Hex {
  const [r, g, b] = rgb(hex);
  const h = (x: number) =>
    Math.round(Math.min(255, x * f))
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mixHex(a: Hex, b: Hex, t: number): Hex {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const h = (x: number) => Math.round(x).toString(16).padStart(2, '0');
  return `#${h(r1 + (r2 - r1) * t)}${h(g1 + (g2 - g1) * t)}${h(b1 + (b2 - b1) * t)}`;
}

function rgba(hex: Hex, a: number): CssColor {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function lum(hex: Hex): number {
  const [r, g, b] = rgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function light(id: string, name: string, bright: Hex, mid: Hex, deep: Hex): Theme {
  const paper = mixHex('#f7f5f2', bright, 0.05);
  return {
    id,
    name,
    mode: 'light',
    bg: paper,
    bg2: rgba(mid, 0.1),
    text: '#1c1917',
    textMuted: 'rgba(28, 25, 23, 0.55)',
    textStrong: 'rgba(28, 25, 23, 0.82)',
    surface: 'rgba(28, 25, 23, 0.05)',
    surfaceHover: 'rgba(28, 25, 23, 0.09)',
    border: 'rgba(28, 25, 23, 0.1)',
    popover: 'rgba(255, 255, 255, 0.97)',
    tooltip: 'rgba(255, 255, 255, 0.85)',
    noise: 0.025,
    dotA: deep,
    dotB: mid,
    sphere: mixHex(paper, '#ffffff', 0.7),
    sphereShade: mixHex(paper, mid, 0.12),
    grid: mid,
    coast: deep,
    atmo: mid,
    rim: bright,
    hubGlow: [rgba(deep, 1), rgba(bright, 0.35)],
    arcs: [deep, bright, mid, deep],
    ripple: deep,
    grad: [deep, mid, bright],
    btn: [mid, deep],
    btnText: '#ffffff',
    accent: deep,
    glows: [rgba(mid, 0.12), rgba(bright, 0.08), rgba(deep, 0.06)],
  };
}

function dark(id: string, name: string, c1: Hex, c2: Hex, c3: Hex): Theme {
  return {
    id,
    name,
    mode: 'dark',
    bg: '#0a0908',
    bg2: rgba(c2, 0.16),
    text: '#f5f3ee',
    textMuted: 'rgba(245, 243, 238, 0.58)',
    textStrong: 'rgba(245, 243, 238, 0.72)',
    surface: 'rgba(255, 255, 255, 0.06)',
    surfaceHover: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.1)',
    popover: 'rgba(12, 15, 22, 0.97)',
    tooltip: 'rgba(255, 255, 255, 0.1)',
    noise: 0.05,
    dotA: c1,
    dotB: c2,
    sphere: scale(c2, 0.16),
    sphereShade: scale(c2, 0.07),
    grid: c1,
    coast: c1,
    atmo: c2,
    rim: c1,
    hubGlow: ['rgba(255, 255, 255, 0.95)', 'rgba(205, 225, 255, 0.42)'],
    arcs: [c1, c3, c2, c1],
    ripple: c1,
    grad: [c1, c2, c3],
    btn: [c1, c3],
    btnText: (lum(c1) + lum(c3)) / 2 > 0.5 ? '#08120d' : '#f8fafc',
    accent: c1,
    glows: [rgba(c2, 0.2), rgba(c1, 0.1), rgba(c3, 0.1)],
  };
}

export const THEMES: Theme[] = [
  light('coral', 'Light', '#fb923c', '#f97316', '#ea580c'),
  dark('gold', 'Dark', '#fdba74', '#fb923c', '#f97316'),
];

export const themeById = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0];
