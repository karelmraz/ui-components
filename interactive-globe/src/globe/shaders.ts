export const sphereVertexShader = `
  varying vec3 vWN;
  void main() {
    vWN = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

export const sphereFragmentShader = `
  uniform vec3 uLightDir, uNight, uDay;
  varying vec3 vWN;
  void main() {
    float lit = smoothstep(-0.6, 0.85, dot(normalize(vWN), uLightDir));
    gl_FragColor = vec4(mix(uNight, uDay, lit), 1.0);
  }`;

export const dotsVertexShader = `
  attribute float aRnd;
  uniform float uTime, uPx, uMotion;
  uniform vec3 uLightDir;
  varying float vRnd, vTw, vLight;
  void main() {
    vRnd = aRnd;
    vTw = 1.0 - uMotion * (0.22 + 0.22 * sin(uTime * (0.5 + aRnd) + aRnd * 6.2831));
    vec3 wN = normalize((modelMatrix * vec4(position, 0.0)).xyz);
    vLight = dot(wN, uLightDir);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (2.6 + aRnd * 2.0) * uPx * (3.2 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;

export const dotsFragmentShader = `
  uniform vec3 uColorA, uColorB;
  uniform float uMode;
  varying float vRnd, vTw, vLight;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    vec3 col;
    float a;
    if (uMode > 0.5) {
      float lit = smoothstep(-0.55, 0.9, vLight);
      col = mix(uColorB, uColorA, lit);
      a = smoothstep(0.5, 0.14, d) * vTw * (0.4 + 0.55 * lit);
    } else {
      float lit = smoothstep(-0.7, 0.85, vLight);
      vec3 base = mix(uColorA, uColorB, vRnd);
      col = base * (0.6 + 0.6 * lit) + uColorA * (0.18 * lit * lit);
      a = smoothstep(0.5, 0.14, d) * vTw * (0.58 + 0.42 * lit);
    }
    gl_FragColor = vec4(col, a);
  }`;

export const atmosphereVertexShader = `
  varying vec3 vNormal, vWN;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWN = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

export const atmosphereFragmentShader = `
  uniform vec3 uColor, uRim, uLightDir;
  varying vec3 vNormal, vWN;
  void main() {
    float f = clamp(0.82 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float glow = pow(f, 7.5);
    float rim = pow(f, 15.0);
    float sun = 0.6 + 0.4 * smoothstep(-0.4, 0.95, dot(normalize(vWN), uLightDir));
    gl_FragColor = vec4(uColor * glow * sun * 0.5 + uRim * rim * 0.35, 1.0);
  }`;

export const starsVertexShader = `
  attribute float aRnd;
  uniform float uPx;
  varying float vRnd;
  void main() {
    vRnd = aRnd;
    gl_PointSize = (0.8 + aRnd * 1.7) * uPx;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

export const starsFragmentShader = `
  uniform float uTime, uMotion;
  varying float vRnd;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (length(c) > 0.5) discard;
    float tw = 0.55 + 0.45 * sin(uTime * (0.5 + vRnd * 1.6) + vRnd * 30.0) * uMotion;
    float a = smoothstep(0.5, 0.08, length(c)) * (0.1 + 0.45 * vRnd) * tw;
    gl_FragColor = vec4(vec3(0.78, 0.85, 1.0), a);
  }`;
