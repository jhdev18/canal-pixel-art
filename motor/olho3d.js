// Olho "realista" feito em 3D (Three.js) e reduzido para pixel art: globo ocular iluminado (veias, íris com fibras,
// pupila, brilho molhado), pálpebras de carne em volta. Usado pelas estrelas que viram olhos.
import * as THREE from 'three';
import { Pix, bayer } from './pixel.js';

const VERT = /* glsl */ `
varying vec3 vObj; varying vec3 vNv;
void main() { vObj = normalize(position); vNv = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = /* glsl */ `
uniform vec3 uFrente; uniform float uPupila; uniform float uSem;
varying vec3 vObj; varying vec3 vNv;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSem) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
void main() {
  vec3 o = normalize(vObj);
  float d = acos(clamp(dot(o, uFrente), -1.0, 1.0));
  vec3 t = normalize(cross(uFrente, vec3(0.0, 1.0, 0.0)) + vec3(1e-4)); vec3 b = cross(t, uFrente);
  float ang = atan(dot(o, b), dot(o, t));
  float irisR = 0.5, pupR = irisR * uPupila;
  vec3 c;
  if (d < pupR) {
    c = vec3(0.015, 0.0, 0.005) + vec3(0.18, 0.0, 0.02) * smoothstep(pupR * 0.4, pupR, d);
  } else if (d < irisR) {
    float r = (d - pupR) / (irisR - pupR);
    float fib = n(vec2(ang * 9.0, r * 3.0)) * 0.6 + n(vec2(ang * 23.0, r * 7.0)) * 0.4;
    c = mix(vec3(1.0, 0.8, 0.18), vec3(0.6, 0.04, 0.02), smoothstep(0.0, 0.85, r)) * (0.5 + 0.7 * fib);
    c *= 1.0 - 0.8 * smoothstep(0.75, 1.0, r);
  } else {
    float e = smoothstep(irisR, 1.6, d);
    c = mix(vec3(0.93, 0.87, 0.76), vec3(0.8, 0.42, 0.36), e * 0.85);
    float veia = 0.0;
    for (int k = 0; k < 3; k++) { float fk = float(k);
      veia = max(veia, pow(1.0 - abs(sin(ang * (5.0 + fk * 3.0) + n(vec2(d * 6.0 + fk * 7.0, fk)) * 4.0)), 16.0)); }
    c = mix(c, vec3(0.65, 0.03, 0.03), veia * smoothstep(irisR + 0.05, 1.25, d));
  }
  vec3 N = normalize(vNv), L = normalize(vec3(-0.45, 0.6, 0.7));
  float dif = 0.3 + 0.7 * max(dot(N, L), 0.0);
  float esp = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 60.0) * 1.4;
  c = c * dif + vec3(esp);
  c *= mix(0.4, 1.0, smoothstep(-0.2, 0.6, N.z));
  gl_FragColor = vec4(c, 1.0);
}`;

let R = null, cena, cam, mat;
function preparar() {
  if (R) return;
  R = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: false, alpha: true });
  R.setPixelRatio(1);
  cena = new THREE.Scene();
  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG,
    uniforms: { uFrente: { value: new THREE.Vector3(0, 0, 1) }, uPupila: { value: 0.35 }, uSem: { value: 1 } } });
  cena.add(new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), mat));
}

const CARNE = ['#6a2a2e', '#4a161c', '#2e0a10', '#1a0408'];

// W x H pixels. abertura 0..1 (0 = fechado), olhar [x, y] (y < 0 = para baixo), pupila 0..1 (tamanho).
export function renderOlho(W, H, { abertura = 1, olhar = [0, -0.5], pupila = 0.35, semente = 1, S = 4 } = {}) {
  preparar();
  const Wr = W * S, Hr = H * S, rt = new THREE.WebGLRenderTarget(Wr, Hr);
  // a esfera é maior que a abertura das pálpebras (as bordas ficam escondidas)
  const raio = 0.62, asp = Hr / Wr;
  cam.left = -raio; cam.right = raio; cam.top = raio * asp; cam.bottom = -raio * asp; cam.updateProjectionMatrix();
  mat.uniforms.uFrente.value.set(olhar[0], olhar[1], 1).normalize();
  mat.uniforms.uPupila.value = pupila; mat.uniforms.uSem.value = semente;
  R.setRenderTarget(rt); R.setClearColor(0x000000, 0); R.clear(); R.render(cena, cam);
  const buf = new Uint8Array(Wr * Hr * 4);
  R.readRenderTargetPixels(rt, 0, 0, Wr, Hr, buf);
  R.setRenderTarget(null); rt.dispose();
  const p = new Pix(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    // média do bloco S x S (a leitura vem de baixo para cima)
    let r = 0, g = 0, b = 0;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const k = (((H - 1 - y) * S + j) * Wr + x * S + i) * 4; r += buf[k]; g += buf[k + 1]; b += buf[k + 2]; }
    const q = (v) => { const t = v / (S * S) / 255, n = 7; return Math.round(Math.min(n, Math.max(0, Math.floor(t * n + bayer(x, y) * 0.9 - 0.2))) / n * 255); };
    // pálpebras: abertura em forma de amêndoa; em volta, carne
    const u = (x + 0.5 - W / 2) / (W / 2), v = (y + 0.5 - H / 2) / (H / 2), larg = Math.pow(Math.max(0, 1 - u * u), 0.75);
    const topo = -abertura * 0.92 * larg, base = abertura * 0.72 * larg;
    const dentro = abertura > 0.05 && v > topo && v < base;
    const borda = u * u + v * v * 0.9 < 1.05;
    if (dentro) {
      const sombra = v < topo + 0.28 ? 0.55 : 1;      // sombra da pálpebra de cima
      p.set(x, y, '#' + [r, g, b].map((c) => q(c * sombra).toString(16).padStart(2, '0')).join(''));
    } else if (borda) {
      let c = v < 0 ? (v < topo - 0.5 ? CARNE[1] : CARNE[2]) : (v > base + 0.4 ? CARNE[1] : CARNE[0]);
      if (abertura > 0.05 && v < 0 && v > topo - 0.22) c = CARNE[3];                 // cílios / dobra
      if (abertura > 0.05 && v > 0 && v < base + 0.18) c = '#a84a48';               // borda molhada de baixo
      if (abertura <= 0.05 && Math.abs(v) < 0.14) c = CARNE[3];                     // fechado: fenda
      if ((x * 7 + y * 13) % 11 === 0 && c === CARNE[1]) c = '#5a1e26';
      p.set(x, y, c);
    }
  }
  p.contorno('#0a0204');
  return p;
}
