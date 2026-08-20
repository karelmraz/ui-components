import { useEffect, useRef } from 'react';

/**
 * Apple-style "liquid glass" rendered in WebGL.
 *
 * Two passes, one canvas:
 *
 *  1. SCENE pass — renders the animated mesh-gradient background plus the
 *     procedural orb into an offscreen RGBA texture. This is the "world"
 *     that lives behind the glass.
 *
 *  2. GLASS pass — draws the scene to the screen. Inside the login card's
 *     rounded rectangle it does NOT blur — it *refracts*: the rounded-rect
 *     signed-distance field gives an outward normal, and the background is
 *     re-sampled along that normal with strength concentrated at the edges
 *     (that's the lensing you see on real frosted glass / Apple's material).
 *     Chromatic aberration splits R/G/B at the rim, a few extra taps add a
 *     light frost, and an SDF-driven specular gives the top-left hairline +
 *     a pointer-tracked hotspot.
 *
 * Perf: everything is two full-screen GPU passes. Outside the card the glass
 * shader is a single texture fetch; the expensive multi-tap work only runs
 * for pixels actually under the card. DPR is capped at 2 to bound fill-rate.
 */

type Props = {
  className?: string;
};

const VERT = /* glsl */ `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// ---------------------------------------------------------------------------
// SCENE PASS — mesh gradient + orb (orb math ported from Orb.tsx, hue baked).
// ---------------------------------------------------------------------------
const SCENE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform float uOrbSize; // orb diameter in device pixels

  vec3 rgb2yiq(vec3 c){
    return vec3(dot(c,vec3(0.299,0.587,0.114)),
                dot(c,vec3(0.596,-0.274,-0.322)),
                dot(c,vec3(0.211,-0.523,0.312)));
  }
  vec3 yiq2rgb(vec3 c){
    return vec3(c.x+0.956*c.y+0.621*c.z,
                c.x-0.272*c.y-0.647*c.z,
                c.x-1.106*c.y+1.703*c.z);
  }
  vec3 adjustHue(vec3 color, float hueDeg){
    float a = hueDeg * 3.14159265 / 180.0;
    vec3 yiq = rgb2yiq(color);
    float ca = cos(a), sa = sin(a);
    float i = yiq.y*ca - yiq.z*sa;
    float q = yiq.y*sa + yiq.z*ca;
    yiq.y = i; yiq.z = q;
    return yiq2rgb(yiq);
  }
  vec3 hash33(vec3 p3){
    p3 = fract(p3 * vec3(0.1031,0.11369,0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(p3.x+p3.y, p3.x+p3.z, p3.y+p3.z) * p3.zyx);
  }
  float snoise3(vec3 p){
    const float K1 = 0.333333333, K2 = 0.166666667;
    vec3 i = floor(p + (p.x+p.y+p.z)*K1);
    vec3 d0 = p - (i - (i.x+i.y+i.z)*K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e*(1.0-e.zxy);
    vec3 i2 = 1.0 - e.zxy*(1.0-e);
    vec3 d1 = d0 - (i1-K2);
    vec3 d2 = d0 - (i2-K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(dot(d0,d0),dot(d1,d1),dot(d2,d2),dot(d3,d3)), 0.0);
    vec4 n = h*h*h*h*vec4(dot(d0,hash33(i)),dot(d1,hash33(i+i1)),
                          dot(d2,hash33(i+i2)),dot(d3,hash33(i+1.0)));
    return dot(vec4(31.316), n);
  }
  vec4 extractAlpha(vec3 c){
    float a = max(max(c.r,c.g),c.b);
    return vec4(c/(a+1e-5), a);
  }
  float light1(float i,float a,float d){ return i/(1.0+d*a); }
  float light2(float i,float a,float d){ return i/(1.0+d*d*a); }

  const vec3 baseColor1 = vec3(0.611765,0.262745,0.996078);
  const vec3 baseColor2 = vec3(0.298039,0.760784,0.913725);
  const vec3 baseColor3 = vec3(0.062745,0.078431,0.600000);
  const float innerRadius = 0.6;
  const float noiseScale = 0.65;
  const float HUE = 20.0;
  const vec3 BG = vec3(0.027451,0.023529,0.050980); // #07060d

  vec4 drawOrb(vec2 uv){
    vec3 c1 = adjustHue(baseColor1, HUE);
    vec3 c2 = adjustHue(baseColor2, HUE);
    vec3 c3 = adjustHue(baseColor3, HUE);
    float ang = atan(uv.y, uv.x);
    float len = length(uv);
    float invLen = len > 0.0 ? 1.0/len : 0.0;
    float bgLum = dot(BG, vec3(0.299,0.587,0.114));
    float n0 = snoise3(vec3(uv*noiseScale, iTime*0.5))*0.5+0.5;
    float petalCycle = sin(iTime*0.8)*0.5+0.5;
    float petals = sin(ang*6.0 + iTime*0.4)*0.09*petalCycle;
    float r0 = mix(mix(innerRadius,1.0,0.4), mix(innerRadius,1.0,0.6), n0) + petals;
    float d0 = distance(uv, (r0*invLen)*uv);
    float v0 = light1(1.0,10.0,d0);
    v0 *= smoothstep(r0*1.05, r0, len);
    float innerFade = smoothstep(r0*0.8, r0*0.95, len);
    v0 *= mix(innerFade, 1.0, bgLum*0.7);
    float cl = cos(ang + iTime*2.0)*0.5+0.5;
    float a = iTime*-1.0;
    vec2 pos = vec2(cos(a),sin(a))*r0;
    float d = distance(uv,pos);
    float v1 = light2(1.5,5.0,d);
    v1 *= light1(1.0,50.0,d0);
    float v2 = smoothstep(1.0, mix(innerRadius,1.0,n0*0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius,1.0,0.5), len);
    vec3 colBase = mix(c1,c2,cl);
    float fadeAmount = mix(1.0,0.1,bgLum);
    vec3 darkCol = mix(c3,colBase,v0);
    darkCol = (darkCol+v1)*v2*v3;
    darkCol = clamp(darkCol,0.0,1.0);
    vec3 lightCol = (colBase+v1)*mix(1.0,v2*v3,fadeAmount);
    lightCol = mix(BG,lightCol,v0);
    lightCol = clamp(lightCol,0.0,1.0);
    vec3 finalCol = mix(darkCol,lightCol,bgLum);
    return extractAlpha(finalCol);
  }

  // Soft drifting color wash (replaces the CSS radial-gradient orbs).
  vec3 wash(vec2 p, vec2 c, vec3 color, float radius, float intensity, vec2 asp){
    float d = length((p-c)*asp);
    return color * smoothstep(radius, 0.0, d) * intensity;
  }

  void main(){
    vec2 frag = gl_FragCoord.xy;
    vec2 p = frag / iResolution;                 // 0..1, y-up
    vec2 asp = vec2(iResolution.x/iResolution.y, 1.0);
    float t = iTime;

    vec3 col = BG;
    // Sunset palette washes — gold / coral / lavender / hot-pink, slow drift.
    col += wash(p, vec2(0.12,0.92) + 0.12*vec2(sin(t*0.16),     cos(t*0.13)),     vec3(1.00,0.82,0.40), 0.62, 0.55, asp);
    col += wash(p, vec2(0.72,0.95) + 0.10*vec2(cos(t*0.12),     sin(t*0.15)),     vec3(1.00,0.42,0.42), 0.60, 0.55, asp);
    col += wash(p, vec2(0.06,0.36) + 0.12*vec2(sin(t*0.10+1.0), cos(t*0.14)),     vec3(0.61,0.53,1.00), 0.58, 0.60, asp);
    col += wash(p, vec2(0.74,0.34) + 0.10*vec2(cos(t*0.11+2.0), sin(t*0.12)),     vec3(0.90,0.29,0.55), 0.58, 0.55, asp);

    // Orb, centered, sized to uOrbSize device px (matches the old 700px element).
    vec2 center = iResolution * 0.5;
    vec2 uv = (frag - center) / (uOrbSize * 0.5);
    float rot = t * 0.04;
    float s = sin(rot), cR = cos(rot);
    uv = vec2(cR*uv.x - s*uv.y, s*uv.x + cR*uv.y);
    vec4 orb = drawOrb(uv);
    col = orb.rgb*orb.a + col*(1.0-orb.a);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// GLASS PASS — refract the scene through one or more rounded-rect panels
// (the login card + each social button). Every [data-glass] element becomes a
// refracting panel; the nearest one that contains the fragment wins.
// ---------------------------------------------------------------------------
const MAX_PANELS = 16;
const GLASS_FRAG = /* glsl */ `
  precision highp float;
  #define MAX_PANELS ${MAX_PANELS}
  uniform vec2 iResolution;
  uniform sampler2D uScene;
  uniform int   uCount;
  uniform vec2  uCenter[MAX_PANELS]; // panel center, device px, y-DOWN
  uniform vec2  uHalf[MAX_PANELS];   // panel half-size, device px
  uniform float uRadius[MAX_PANELS]; // corner radius, device px
  uniform float uEdge;     // max refraction edge band width, device px
  uniform float uRefract;  // max refraction displacement, device px
  uniform float uFrost;    // 0..1 frost mix
  uniform float uFrostR;   // frost tap radius, device px
  uniform vec2  uMouse;    // pointer, device px, y-DOWN (offscreen when idle)
  uniform float uMouseSig; // pointer hotspot sigma, device px

  float sdRoundRect(vec2 p, vec2 b, float r){
    vec2 q = abs(p) - b + r;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r;
  }
  vec3 scene(vec2 uv){ return texture2D(uScene, uv).rgb; }
  // Two-ring 13-tap blur — wide enough to actually frost the glass (diffuse the
  // background) instead of just nudging it.
  vec3 frostTap(vec2 uv, vec2 r){
    vec3 s = scene(uv);
    // inner ring @ r
    s += scene(uv + vec2( r.x, 0.0));
    s += scene(uv + vec2(-r.x, 0.0));
    s += scene(uv + vec2(0.0,  r.y));
    s += scene(uv + vec2(0.0, -r.y));
    s += scene(uv + r * 0.7);
    s += scene(uv - r * 0.7);
    s += scene(uv + vec2( r.x, -r.y) * 0.7);
    s += scene(uv + vec2(-r.x,  r.y) * 0.7);
    // outer ring @ 1.7r for a softer, wider falloff
    s += scene(uv + vec2( r.x * 1.7, 0.0));
    s += scene(uv + vec2(-r.x * 1.7, 0.0));
    s += scene(uv + vec2(0.0,  r.y * 1.7));
    s += scene(uv + vec2(0.0, -r.y * 1.7));
    return s / 13.0;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / iResolution;                       // y-up (texture space)
    vec2 fc = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y); // y-down (layout space)
    vec3 base = scene(uv);

    // Pick the active panel: among panels the fragment is inside (or within the
    // 1.5px AA band), the one whose own edge is nearest — so a small button
    // nested in the big card wins over the card.
    float bestD = -1e9;
    vec2 rel = vec2(0.0), hsz = vec2(1.0);
    float rad = 0.0;
    bool hit = false;
    for(int i = 0; i < MAX_PANELS; i++){
      if(i >= uCount) break;
      vec2 r = fc - uCenter[i];
      float d = sdRoundRect(r, uHalf[i], uRadius[i]);
      if(d < 1.5 && d > bestD){ bestD = d; rel = r; hsz = uHalf[i]; rad = uRadius[i]; hit = true; }
    }
    if(!hit){ gl_FragColor = vec4(base, 1.0); return; }

    float minHalf = min(hsz.x, hsz.y);
    float edgeW = min(uEdge, minHalf * 1.1);
    float refr  = min(uRefract, minHalf * 0.8);

    // Glass "height" profile: 1 in the flat interior, ramping to 0 at the rim
    // over edgeW. Because it's FLAT in the middle, its gradient vanishes there —
    // so the outward normal (gradient of the height) has no discontinuity along
    // the center axes (the old sign()-based normal jumped there) nor along the
    // corner diagonals (the raw SDF normal flipped there). H is sampled from the
    // true rounded-rect SDF, so corners stay round.
    #define H(P) smoothstep(0.0, edgeW, -sdRoundRect(P, hsz, rad))
    float e = 1.5;
    vec2 g = vec2(H(rel + vec2(e,0.0)) - H(rel - vec2(e,0.0)),
                  H(rel + vec2(0.0,e)) - H(rel - vec2(0.0,e)));
    float gl_ = length(g);
    vec2 n = gl_ > 1e-4 ? -g / gl_ : vec2(0.0); // outward unit normal
    float edge = 1.0 - H(rel);                  // 0 in the middle → 1 at the rim

    // Refraction: bend the background inward along the normal, strongest at the
    // rim. Flip n.y back to texture space, scale px → uv.
    vec2 nUV  = vec2(n.x, -n.y);
    vec2 disp = -nUV * edge * refr / iResolution;

    // Chromatic aberration at the rim.
    vec3 col;
    col.r = scene(uv + disp * 1.12).r;
    col.g = scene(uv + disp).g;
    col.b = scene(uv + disp * 0.88).b;

    // Frost the whole panel (the refracted/displaced sample is blurred), so the
    // glass diffuses the background. Roughly uniform, easing off slightly at the
    // very rim so the edge lensing of the background light stays legible.
    vec2 fr = vec2(uFrostR) / iResolution;
    vec3 frost = frostTap(uv + disp, fr);
    col = mix(col, frost, clamp(uFrost * (1.0 - 0.25 * edge), 0.0, 1.0));

    // Frosted fill — a milky white wash so the glass reads as a surface rather
    // than clear glass. Brighter at the top, fades toward the bottom, and a
    // touch stronger at the rim so the edges feel thicker.
    float ty = clamp(rel.y / hsz.y * 0.5 + 0.5, 0.0, 1.0);
    float fillA = mix(0.58, 0.40, ty) + edge * 0.10;
    col = mix(col, vec3(1.0), clamp(fillA, 0.0, 1.0));

    // Specular: top-left light. Edges whose normal faces the light catch a rim.
    vec2 toL = normalize(vec2(-1.0, -1.0)); // toward light, y-down
    float facing = max(dot(n, toL), 0.0);
    col += pow(facing, 1.5) * edge * 0.55;

    // Crisp hairline right at the boundary.
    float rim = 1.0 - smoothstep(0.0, 2.0, abs(bestD));
    col += rim * facing * 0.5;

    // Inner shadow along the bottom edge for weight.
    float bottom = max(dot(n, vec2(0.0, 1.0)), 0.0) * edge;
    col *= 1.0 - bottom * 0.16;

    // Pointer-tracked specular hotspot.
    float md = length(fc - uMouse);
    col += exp(-(md*md) / (2.0 * uMouseSig * uMouseSig)) * 0.10;

    // Anti-aliased coverage across the outer boundary (smooth rounded corners).
    float cover = smoothstep(1.5, -1.5, bestD);
    gl_FragColor = vec4(mix(base, col, cover), 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('shader compile error:', gl.getShaderInfoLog(sh));
  }
  return sh;
}

function makeProgram(gl: WebGLRenderingContext, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  return p;
}

export function LiquidGlass({ className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create the canvas imperatively (fresh per mount). Reusing a single JSX
    // canvas across React 18 StrictMode's mount→unmount→remount would hand the
    // remount a context already killed by loseContext() in cleanup, and every
    // shader compile then fails with a null info-log.
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    const sceneProg = makeProgram(gl, SCENE_FRAG);
    const glassProg = makeProgram(gl, GLASS_FRAG);

    // Full-screen triangle, shared by both passes.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const bindPosition = (prog: WebGLProgram) => {
      const loc = gl.getAttribLocation(prog, 'position');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    // Offscreen scene target.
    const sceneTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();

    // Uniform locations.
    const sU = {
      res: gl.getUniformLocation(sceneProg, 'iResolution'),
      time: gl.getUniformLocation(sceneProg, 'iTime'),
      orb: gl.getUniformLocation(sceneProg, 'uOrbSize'),
    };
    const gU = {
      res: gl.getUniformLocation(glassProg, 'iResolution'),
      scene: gl.getUniformLocation(glassProg, 'uScene'),
      count: gl.getUniformLocation(glassProg, 'uCount'),
      center: gl.getUniformLocation(glassProg, 'uCenter'),
      half: gl.getUniformLocation(glassProg, 'uHalf'),
      radius: gl.getUniformLocation(glassProg, 'uRadius'),
      edge: gl.getUniformLocation(glassProg, 'uEdge'),
      refract: gl.getUniformLocation(glassProg, 'uRefract'),
      frost: gl.getUniformLocation(glassProg, 'uFrost'),
      frostR: gl.getUniformLocation(glassProg, 'uFrostR'),
      mouse: gl.getUniformLocation(glassProg, 'uMouse'),
      mouseSig: gl.getUniformLocation(glassProg, 'uMouseSig'),
    };

    // Reusable buffers for the [data-glass] panel uniforms.
    const centerArr = new Float32Array(MAX_PANELS * 2);
    const halfArr = new Float32Array(MAX_PANELS * 2);
    const radiusArr = new Float32Array(MAX_PANELS);

    let dpr = 1;
    let W = 0;
    let H = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.floor(window.innerWidth * dpr);
      H = Math.floor(window.innerHeight * dpr);
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.bindTexture(gl.TEXTURE_2D, sceneTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    };
    window.addEventListener('resize', resize);
    resize();

    // Pointer (device px, y-down). Off-screen until the pointer moves.
    const mouse = { x: -1e4, y: -1e4 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
    };
    window.addEventListener('pointermove', onMove);

    let raf = 0;
    const render = (t: number) => {
      raf = requestAnimationFrame(render);
      const sec = t * 0.001;

      // --- Pass 1: scene → texture ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
      gl.viewport(0, 0, W, H);
      gl.useProgram(sceneProg);
      bindPosition(sceneProg);
      gl.uniform2f(sU.res, W, H);
      gl.uniform1f(sU.time, sec);
      gl.uniform1f(sU.orb, 700 * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // --- Pass 2: glass → screen ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(glassProg);
      bindPosition(glassProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sceneTex);
      gl.uniform1i(gU.scene, 0);
      gl.uniform2f(gU.res, W, H);

      // Gather every [data-glass] element as a refracting panel.
      const els = document.querySelectorAll<HTMLElement>('[data-glass]');
      let count = 0;
      for (let i = 0; i < els.length && count < MAX_PANELS; i++) {
        const r = els[i].getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        centerArr[count * 2] = (r.left + r.width / 2) * dpr;
        centerArr[count * 2 + 1] = (r.top + r.height / 2) * dpr;
        halfArr[count * 2] = (r.width / 2) * dpr;
        halfArr[count * 2 + 1] = (r.height / 2) * dpr;
        radiusArr[count] = (parseFloat(els[i].dataset.glassRadius || '24') || 24) * dpr;
        count++;
      }
      gl.uniform1i(gU.count, count);
      gl.uniform2fv(gU.center, centerArr);
      gl.uniform2fv(gU.half, halfArr);
      gl.uniform1fv(gU.radius, radiusArr);
      gl.uniform1f(gU.edge, 110 * dpr);
      gl.uniform1f(gU.refract, 52 * dpr);
      gl.uniform1f(gU.frost, 0.92);
      gl.uniform1f(gU.frostR, 11 * dpr);
      gl.uniform2f(gU.mouse, mouse.x, mouse.y);
      gl.uniform1f(gU.mouseSig, 110 * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 ${className ?? ''}`}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
