# WebGL "liquid glass" (archived)

This folder preserves the WebGL liquid-glass experiment. It is **not** built or
imported by the app — the app was reverted to the original CSS `backdrop-filter`
version. Keep these here for reference / to revive later.

## What it does

`LiquidGlass.tsx` is a single full-screen WebGL canvas that, in two passes:

1. **Scene pass** — renders the animated mesh-gradient background + the orb into
   an offscreen texture.
2. **Glass pass** — refracts that texture through one or more rounded-rect panels
   (Apple-style edge lensing + chromatic aberration + frost + specular), instead
   of a flat Gaussian blur. Every `[data-glass]` element becomes a panel; a small
   button nested in the card wins over the card.

## How it was wired (to revive)

- `App.webgl.tsx` → `src/App.tsx`: renders `<LiquidGlass />` full-screen behind
  the content, plus DOM vignette + grain overlays. No backdrop-blur.
- `LoginCard.webgl.tsx` → `src/components/LoginCard.tsx`: card is transparent and
  tagged `data-glass data-glass-radius="32"` (the CSS glass stack was removed —
  the shader owns the surface).
- `SocialButtons.webgl.tsx` → `src/components/SocialButtons.tsx`: each button is
  tagged `data-glass data-glass-radius="16"` with its opaque `bg-white/[0.06]`
  removed so the shader refraction shows through.

## Known open issue (why it was shelved)

Opacity tuning was unresolved: the glass still read as too transparent and the
social-button interaction was weak. A debugging session found the **element**
screenshots used for verification weren't compositing the fixed background canvas
reliably (full-page screenshots are needed to measure it), so the on-screen
opacity vs. the shader's `fillA` value couldn't be reconciled before the revert.

Tuning knobs live in `LiquidGlass.tsx`:
- Frost / edge band / refraction: the uniform block in the render loop
  (`uEdge`, `uRefract`, `uFrost`, `uFrostR`).
- Milkiness: the `fillA` line in the glass fragment shader.

## Note

`LiquidGlass.tsx` here requires React 18 StrictMode-safe canvas creation (it
creates the `<canvas>` imperatively per mount) — keep that if reviving.
