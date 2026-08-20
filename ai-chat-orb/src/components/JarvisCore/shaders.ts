/**
 * GLSL sources for the JarvisCore orb. The vertex stage just stretches one
 * fullscreen triangle; everything visible happens in the fragment shader —
 * see the effect list in ./index.tsx.
 *
 * Uniforms:
 *   iTime        seconds since start
 *   iResolution  canvas size in device pixels (z = aspect)
 *   hue          palette rotation in degrees
 *   listening    0..1, smoothed "awake" level
 *   generating   0..1, smoothed "thinking" level
 */

export const VERT = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const FRAG = /* glsl */ `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float listening;
  uniform float generating;
  varying vec2 vUv;

  #define PI 3.14159265
  #define TAU 6.28318530

  // Base palette — cool cyan/blue (classic JARVIS HUD style)
  const vec3 coreCol  = vec3(0.80, 0.95, 1.00); // cool white-cyan core
  const vec3 ringCol  = vec3(0.16, 0.68, 1.00); // cyan-blue rings
  const vec3 glowCol  = vec3(0.04, 0.32, 0.95); // deep blue aura
  const vec3 sweepCol = vec3(0.45, 0.85, 1.00); // light cyan accents

  // YIQ-based hue rotation — shift the whole palette without re-authoring stops.
  vec3 rgb2yiq(vec3 c) {
    float y = dot(c, vec3(0.299, 0.587, 0.114));
    float i = dot(c, vec3(0.596, -0.274, -0.322));
    float q = dot(c, vec3(0.211, -0.523, 0.312));
    return vec3(y, i, q);
  }
  vec3 yiq2rgb(vec3 c) {
    float r = c.x + 0.956 * c.y + 0.621 * c.z;
    float g = c.x - 0.272 * c.y - 0.647 * c.z;
    float b = c.x - 1.106 * c.y + 1.703 * c.z;
    return vec3(r, g, b);
  }
  vec3 shiftHue(vec3 color, float hueDeg) {
    float hueRad = hueDeg * PI / 180.0;
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    float i = yiq.y * cosA - yiq.z * sinA;
    float q = yiq.y * sinA + yiq.z * cosA;
    yiq.y = i;
    yiq.z = q;
    return yiq2rgb(yiq);
  }

  // Hash for the pseudo-random "data" pattern of the binary ring.
  float hash11(float n) {
    return fract(sin(n * 127.1) * 43758.5453);
  }

  // Rotate a 2D point by 'a' radians.
  vec2 rotate(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  }

  // Shortest angular distance between two angles.
  float angDist(float a, float b) {
    float d = abs(a - b);
    return min(d, TAU - d);
  }

  // A crisp circular line at radius r.
  float ringMask(float len, float r, float thickness) {
    return smoothstep(thickness, 0.0, abs(len - r));
  }

  // A circular line broken into 'count' dashes, rotating at 'spin'.
  // 'duty' is the lit fraction of each cell (0..1).
  float dashedRing(float len, float ang, float r, float thickness,
                   float count, float duty, float spin) {
    float rm = ringMask(len, r, thickness);
    float cell = fract((ang + spin) / TAU * count);
    float dash = smoothstep(0.0, 0.06, cell) - smoothstep(duty, duty + 0.06, cell);
    return rm * clamp(dash, 0.0, 1.0);
  }

  // A bright thick "gauge" arc: a partial ring centred on angle 'c' spanning
  // half-width 'w', with soft angular ends.
  float gaugeArc(float len, float ang, float r, float thickness,
                 float c, float w) {
    float rm = smoothstep(thickness, 0.0, abs(len - r));
    float am = smoothstep(w, w - 0.18, angDist(ang, c));
    return rm * am;
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord - center) / size * 2.0;

    float len = length(uv);
    float ang = atan(uv.y, uv.x);

    vec3 core  = shiftHue(coreCol, hue);
    vec3 ring  = shiftHue(ringCol, hue);
    vec3 glow  = shiftHue(glowCol, hue);
    vec3 sweep = shiftHue(sweepCol, hue);

    vec3 col = vec3(0.0);

    // Overall "activity" — listening gives a clear, visible lift; generating
    // goes wild.
    float activity = listening * 0.7 + generating * 1.0;
    float spinBoost = 1.0 + listening * 0.5 + generating * 3.0; // rings race while thinking
    // Fast strobe/shimmer that makes the generating state feel frantic.
    float frenzy = generating * (0.6 + 0.4 * sin(iTime * 26.0));

    // ── 1. Central core — layered soft glows ────────────────────────────
    float pulse = 0.5 + 0.5 * sin(iTime * (1.8 + generating * 4.0));
    float coreIntensity = 1.0 + pulse * (0.35 + generating * 0.6) + activity * 0.9;
    col += core * exp(-len * 16.0) * coreIntensity * 1.3;
    col += core * exp(-len *  8.0) * coreIntensity * 0.45;
    col += glow * exp(-len *  4.0) * 0.22 * coreIntensity;

    // Soft outer aura, breathing.
    float breath = 0.85 + 0.15 * sin(iTime * 0.9);
    col += glow * exp(-len * 2.4) * (0.30 + generating * 0.35) * breath;

    // Listening cue — a bright breathing halo + bezel highlight that make it
    // obvious the core is paying attention while you type.
    float lpulse = 0.5 + 0.5 * sin(iTime * 3.0);
    col += core * ringMask(len, 0.62, 0.022) * listening * (0.5 + 0.7 * lpulse);
    col += glow * exp(-len * 3.0) * listening * 0.55 * (0.6 + 0.4 * lpulse);

    // ── 2. Concentric instrument rings — crisp full circles. While
    //       generating they vibrate (jitter) for a frantic, energised feel ─
    float jit = generating * 0.013 * sin(iTime * 22.0);
    col += ring * ringMask(len + jit, 0.30, 0.011) * (0.95 + frenzy * 0.3);
    col += ring * ringMask(len - jit, 0.46, 0.007) * 0.60;
    col += core * ringMask(len + jit, 0.62, 0.013) * (1.15 + frenzy * 0.4); // bright inner bezel
    col += ring * ringMask(len - jit, 0.80, 0.007) * 0.60;
    col += core * ringMask(len + jit, 0.95, 0.012) * (1.05 + frenzy * 0.3); // outer rim

    // ── 3. Rotating segmented / dashed data rings ───────────────────────
    col += sweep * dashedRing(len, ang, 0.52, 0.010, 30.0, 0.55,
                              iTime * 0.10 * spinBoost) * (0.85 + activity * 0.5);
    col += sweep * dashedRing(len, ang, 0.86, 0.009, 60.0, 0.45,
                              -iTime * 0.06 * spinBoost) * (0.75 + activity * 0.5);

    // ── 4. Binary ring — alternating long/short marks (1 / 0) that slowly
    //       rotate, evoking a stream of data around the rim ──────────────
    {
      vec2 buv = rotate(uv, -iTime * 0.12 * spinBoost);
      float bang = atan(buv.y, buv.x);
      float r = 0.70;
      float band = ringMask(len, r, 0.05);
      float cells = 46.0;
      float fcell = (bang + PI) / TAU * cells;
      float ci = floor(fcell);
      float fr = fract(fcell);
      float h = hash11(ci);
      float isOne = step(0.5, h);
      float hw = mix(0.13, 0.33, isOne);       // "0" short, "1" long
      float mark = smoothstep(0.5 - hw - 0.04, 0.5 - hw, fr)
                 - smoothstep(0.5 + hw, 0.5 + hw + 0.04, fr);
      float bright = 0.55 + 0.55 * h;
      col += sweep * band * clamp(mark, 0.0, 1.0) * bright * (1.0 + activity * 0.5);
    }

    // ── 5. Radial tick marks — fine instrument graduations near the rim ──
    {
      float tickN = 96.0;
      float tphase = fract((ang + iTime * 0.02) / TAU * tickN);
      float tickLine = smoothstep(0.07, 0.0, min(tphase, 1.0 - tphase));
      float band = ringMask(len, 0.40, 0.035);
      // Every 8th tick is a touch brighter (major graduation).
      float major = step(7.5, mod(floor((ang) / TAU * tickN), 8.0)) * 0.5;
      col += ring * band * tickLine * (0.55 + major);
    }

    // ── 6. Bright gauge arcs — the prominent thick cyan-style sweeps,
    //       a few at different radii rotating at different rates ─────────
    float ga = 0.0;
    ga += gaugeArc(len, ang, 0.95, 0.012,  iTime * 0.25 * spinBoost + 0.6, 0.5);
    ga += gaugeArc(len, ang, 0.95, 0.012,  iTime * 0.25 * spinBoost + 3.7, 0.35);
    ga += gaugeArc(len, ang, 0.62, 0.014, -iTime * 0.18 * spinBoost + 1.8, 0.6);
    col += core * ga * (0.7 + activity * 0.5);

    // ── 7. Radar sweep ray — a soft rotating wedge with a bright leading
    //       edge, most visible while generating ────────────────────────
    {
      float sweepAng = mod(iTime * (0.5 + generating * 0.8), TAU) - PI;
      // Trailing tail: brightness falls off behind the leading edge.
      float behind = mod(sweepAng - ang, TAU);
      float tail = smoothstep(2.2, 0.0, behind);
      float lead = smoothstep(0.12, 0.0, angDist(ang, sweepAng));
      float radial = smoothstep(0.96, 0.1, len) * step(0.1, len);
      col += sweep * radial * (tail * 0.12 + lead * 0.6)
             * (0.35 + generating * 0.9);
      // Second, fast counter-rotating sweep that only appears while generating.
      float s2 = mod(-iTime * 3.4, TAU) - PI;
      float lead2 = smoothstep(0.1, 0.0, angDist(ang, s2));
      col += core * radial * lead2 * generating * 0.8;
    }

    // ── 8. Pulse waves — expanding rings broadcast while generating. More
    //       of them, faster, with a strobing brightness for a wild burst ──
    for (int i = 0; i < 5; i++) {
      float phase = fract(iTime * 0.8 + float(i) * 0.2);
      float falloff = (1.0 - phase) * (1.0 - phase);
      float rng = ringMask(len, phase, 0.022);
      col += sweep * rng * falloff * generating * (1.0 + frenzy);
    }

    // ── 9. Vignette — keep the disc bright out to the rim, then fall to
    //       transparent just past it (and across the corners) ───────────
    col *= smoothstep(1.06, 0.97, len);

    // Alpha derived from brightness — canvas composites cleanly over the page.
    float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.8, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;
