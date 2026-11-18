// Partículas em espaço de tela (pixels internos). Posição = função analítica do tempo,
// então qualquer quadro pode ser renderizado isoladamente (determinístico) e tudo roda na GPU.
import * as THREE from 'three';
import { rng } from './compartilhado/util.js';
import { hexParaRgb } from './pixel.js';

const v3 = (hex) => new THREE.Vector3(...hexParaRgb(hex).map((c) => c / 255));

function sementes(n, semente) {
  const r = rng(semente);
  const a = new Float32Array(n * 4);
  for (let i = 0; i < a.length; i++) a[i] = r();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(a, 4));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
  return g;
}

// ---------- Clima ----------
const CLIMAS = {
  chuva: { n: 260, cor: '#a8c0e8', tam: 4, alpha: 0.7 },
  neve: { n: 180, cor: '#ffffff', tam: 2, alpha: 0.95 },
  vagalumes: { n: 26, cor: '#d8ff70', tam: 1, alpha: 1 },
  brasas: { n: 60, cor: '#ffa040', tam: 1, alpha: 1 },
  poeira: { n: 70, cor: '#c8b8a0', tam: 1, alpha: 0.5 },
  folhas: { n: 30, cor: '#e89040', tam: 2, alpha: 1 },
};
const ID_CLIMA = { chuva: 0, neve: 1, vagalumes: 2, brasas: 3, poeira: 4, folhas: 5 };

const VERT_CLIMA = /* glsl */ `
attribute vec4 aSeed;
uniform float uT; uniform vec2 uRes; uniform vec2 uCam; uniform float uTam; uniform int uTipo;
varying float vBrilho;
void main() {
  float W = uRes.x + 24.0, H = uRes.y + 24.0;
  vec2 p; vBrilho = 1.0;
  if (uTipo == 0) {        // chuva
    float v = 260.0 + aSeed.z * 140.0;
    p = vec2(aSeed.x * W - uT * v * 0.22 - uCam.x * 1.1, aSeed.y * H - uT * v - uCam.y);
  } else if (uTipo == 1) { // neve
    float v = 12.0 + aSeed.z * 22.0;
    p = vec2(aSeed.x * W + sin(uT * (0.6 + aSeed.w) + aSeed.z * 6.28) * 7.0 - uCam.x * (0.6 + aSeed.z * 0.6), aSeed.y * H - uT * v - uCam.y);
    vBrilho = aSeed.z > 0.5 ? 1.0 : 0.75;
  } else if (uTipo == 2) { // vagalumes
    p = vec2(aSeed.x * W + sin(uT * 0.45 * (0.5 + aSeed.z) + aSeed.w * 6.28) * 20.0 - uCam.x * 0.9,
             8.0 + aSeed.y * uRes.y * 0.45 + sin(uT * 0.6 * (0.5 + aSeed.w) + aSeed.z * 6.28) * 10.0 - uCam.y * 0.9);
    vBrilho = smoothstep(0.1, 0.9, sin(uT * (1.2 + aSeed.z * 2.0) + aSeed.w * 20.0));
  } else if (uTipo == 3) { // brasas subindo
    float v = 18.0 + aSeed.z * 30.0;
    p = vec2(aSeed.x * W + sin(uT * 2.0 + aSeed.w * 6.28) * 4.0 - uCam.x, aSeed.y * H + uT * v - uCam.y);
    vBrilho = 0.5 + 0.5 * sin(uT * 6.0 + aSeed.w * 30.0);
  } else if (uTipo == 4) { // poeira
    p = vec2(aSeed.x * W + uT * (3.0 + aSeed.z * 5.0) - uCam.x * 0.8, aSeed.y * H + sin(uT * 0.4 + aSeed.w * 6.28) * 6.0 - uCam.y * 0.8);
    vBrilho = 0.4 + 0.6 * aSeed.w;
  } else {                 // folhas
    float v = 16.0 + aSeed.z * 14.0;
    p = vec2(aSeed.x * W + uT * 12.0 + sin(uT * 1.5 + aSeed.w * 6.28) * 10.0 - uCam.x, aSeed.y * H - uT * v - uCam.y);
  }
  p = mod(p, vec2(W, H)) - 12.0;
  p = floor(p) + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = uTam;
}`;
const FRAG_CLIMA = /* glsl */ `
uniform vec3 uCor; uniform float uAlpha; uniform int uTipo; uniform float uTam;
varying float vBrilho;
void main() {
  if (uTipo == 0) { if (floor(gl_PointCoord.x * uTam) != 1.0) discard; }
  if (vBrilho < 0.02) discard;
  vec3 c = uCor;
  if (uTipo == 2) c = mix(vec3(0.3, 0.5, 0.1), uCor, vBrilho);
  gl_FragColor = vec4(c, uAlpha * max(vBrilho, uTipo == 2 ? vBrilho : 0.6));
}`;

export function criarClima(tipo, W, H) {
  const cfg = CLIMAS[tipo];
  if (!cfg) return null;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uT: { value: 0 }, uRes: { value: new THREE.Vector2(W, H) }, uCam: { value: new THREE.Vector2() },
      uTam: { value: cfg.tam }, uTipo: { value: ID_CLIMA[tipo] }, uCor: { value: v3(cfg.cor) }, uAlpha: { value: cfg.alpha },
    },
    vertexShader: VERT_CLIMA, fragmentShader: FRAG_CLIMA, transparent: true, depthTest: false, depthWrite: false,
  });
  const pts = new THREE.Points(sementes(cfg.n * Math.max(1, Math.round((W * H) / (320 * 180))), 11 + ID_CLIMA[tipo]), mat);
  pts.renderOrder = 10;
  return {
    objeto: pts,
    atualizar(t, camPx) { mat.uniforms.uT.value = t; mat.uniforms.uCam.value.set(camPx.x, camPx.y); },
  };
}

// ---------- Rajadas ----------
export const RAJADAS = {
  explosao: { n: 70, vel: [40, 150], ang: [0, 6.283], grav: -70, arrasto: 3, vida: [0.35, 1.0], tam: 3, cores: ['#fff4c0', '#f8c040', '#e86020', '#5a5058'] },
  puf: { n: 20, vel: [15, 45], ang: [0, 6.283], grav: 12, arrasto: 4, vida: [0.25, 0.55], tam: 2, cores: ['#ffffff', '#e8e8f0', '#b8b8c8', '#8a8a9a'] },
  brilho: { n: 16, vel: [25, 70], ang: [0.6, 2.54], grav: -50, arrasto: 2, vida: [0.4, 0.8], tam: 1, cintila: 1, cores: ['#ffffff', '#fff4a0', '#f8d040', '#f8d040'] },
  magia: { n: 36, vel: [20, 80], ang: [0, 6.283], grav: 18, arrasto: 2, vida: [0.5, 1.2], tam: 1, cintila: 1, cores: ['#ffffff', '#c8a8ff', '#80c8ff', '#ff88e0'] },
  poeira: { n: 12, vel: [18, 40], ang: [0, 6.283], achatar: 0.25, grav: -20, arrasto: 5, vida: [0.25, 0.5], tam: 1, cores: ['#e0d8c8', '#c0b4a0', '#a09480', '#807460'] },
  brasas: { n: 14, vel: [8, 22], ang: [1.2, 1.94], grav: 30, arrasto: 0.5, vida: [0.8, 1.6], tam: 1, loop: 1, cintila: 1, cores: ['#fff4c0', '#ffb040', '#f07020', '#c83018'] },
  coracoes: { n: 8, vel: [15, 35], ang: [1.0, 2.14], grav: 10, arrasto: 1.5, vida: [0.7, 1.2], tam: 2, cores: ['#ff6a80', '#e83a4a', '#e83a4a', '#c82a3a'] },
};

const VERT_RAJADA = /* glsl */ `
attribute vec4 aSeed;
uniform float uDt; uniform vec2 uOrigem; uniform vec2 uVel; uniform vec2 uAng; uniform vec2 uVida;
uniform float uGrav; uniform float uArrasto; uniform float uTam; uniform float uAchatar; uniform float uLoop; uniform float uCintila;
varying float vVida; varying float vIdx;
void main() {
  float vida = mix(uVida.x, uVida.y, aSeed.z);
  float dt = uDt;
  if (uLoop > 0.5) dt = mod(uDt + aSeed.w * vida * 3.0, vida);
  vVida = dt / vida;
  float ang = mix(uAng.x, uAng.y, aSeed.x);
  float v = mix(uVel.x, uVel.y, aSeed.y);
  vec2 dir = vec2(cos(ang), sin(ang) * uAchatar);
  float k = uArrasto > 0.0 ? (1.0 - exp(-uArrasto * dt)) / uArrasto : dt;
  vec2 p = uOrigem + dir * v * k + vec2(0.0, 0.5 * uGrav * dt * dt);
  if (uLoop > 0.5) p.x += sin(dt * 5.0 + aSeed.w * 30.0) * 2.0;
  vIdx = clamp(vVida * 3.2 + aSeed.w * 0.8, 0.0, 3.99);
  if (uCintila > 0.5 && fract(dt * 9.0 + aSeed.w) < 0.3) vVida = 2.0;
  if (dt < 0.0) vVida = 2.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(floor(p) + 0.5, 0.0, 1.0);
  gl_PointSize = max(1.0, floor(uTam * (1.0 - vVida * 0.6) + 0.5));
}`;
const FRAG_RAJADA = /* glsl */ `
uniform vec3 uCores[4];
varying float vVida; varying float vIdx;
void main() {
  if (vVida >= 1.0) discard;
  int i = int(vIdx);
  vec3 c = i == 0 ? uCores[0] : i == 1 ? uCores[1] : i == 2 ? uCores[2] : uCores[3];
  gl_FragColor = vec4(c, 1.0);
}`;

export function criarRajada(tipo, semente = 1, multiplicador = 1) {
  const c = RAJADAS[tipo] || RAJADAS.puf;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uDt: { value: -1 }, uOrigem: { value: new THREE.Vector2() },
      uVel: { value: new THREE.Vector2(...c.vel) }, uAng: { value: new THREE.Vector2(...c.ang) }, uVida: { value: new THREE.Vector2(...c.vida) },
      uGrav: { value: c.grav }, uArrasto: { value: c.arrasto }, uTam: { value: c.tam }, uAchatar: { value: c.achatar ?? 1 },
      uLoop: { value: c.loop ? 1 : 0 }, uCintila: { value: c.cintila ? 1 : 0 },
      uCores: { value: c.cores.map(v3) },
    },
    vertexShader: VERT_RAJADA, fragmentShader: FRAG_RAJADA, depthTest: false, depthWrite: false,
  });
  const pts = new THREE.Points(sementes(Math.round(c.n * multiplicador), semente), mat);
  pts.renderOrder = 5;
  return {
    objeto: pts,
    vidaMax: c.loop ? Infinity : c.vida[1] + 0.05,
    atualizar(dt, origemPx) {
      mat.uniforms.uDt.value = dt;
      mat.uniforms.uOrigem.value.set(origemPx.x, origemPx.y);
      pts.visible = dt >= 0 && dt <= this.vidaMax;
    },
  };
}

export const NOMES_CLIMAS = Object.keys(CLIMAS);
