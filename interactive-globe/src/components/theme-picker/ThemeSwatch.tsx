import type { CssColor } from '../../theme';

export function ThemeSwatch({ grad }: { grad: [CssColor, CssColor, CssColor] }) {
  return (
    <span
      className="inline-block size-4 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]"
      style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]}, ${grad[2]})` }}
    />
  );
}
