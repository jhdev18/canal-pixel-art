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
  calor: { n: 60, cor: '#fff4d0', tam: 1, alpha: 0.45 },   // ar quente subindo (Dia do Sol)
  neblina: { n: 150, cor: '#c8d0e0', tam: 8, alpha: 0.09 },  // PROTÓTIPO: bancos de névoa baixos e lentos (terror)
  polen: { n: 70, cor: '#f8e060', tam: 1, alpha: 0.95 },     // PROTÓTIPO: pólen amarelo flutuando (primavera)
  vento: { n: 55, cor: '#f4f8ff', tam: 5, alpha: 0.6 },      // PROTÓTIPO: rajadas de vento (risquinhos rápidos para a direita)
};
const ID_CLIMA = { chuva: 0, neve: 1, vagalumes: 2, brasas: 3, poeira: 4, folhas: 5, calor: 6, neblina: 7, polen: 8, vento: 9 };

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
  } else if (uTipo == 6) { // calor: ar quente subindo, tremendo de lado
    float v = 10.0 + aSeed.z * 14.0;
    p = vec2(aSeed.x * W + sin(uT * 5.0 + aSeed.w * 6.28) * 1.5 - uCam.x, aSeed.y * H + uT * v - uCam.y);
    vBrilho = 0.35 + 0.65 * abs(sin(uT * 2.0 + aSeed.w * 12.0));
  } else if (uTipo == 7) { // neblina: manchas grandes e transparentes, mais densas na parte de baixo, andando devagar
    p = vec2(aSeed.x * W + uT * (2.0 + aSeed.z * 3.0) - uCam.x * 0.6, uRes.y * (0.25 + 0.75 * pow(aSeed.y, 0.6)) - 12.0 + sin(uT * 0.3 + aSeed.w * 6.28) * 3.0 - uCam.y * 0.6);
    vBrilho = 0.6 + 0.4 * sin(uT * 0.5 + aSeed.w * 6.28);
  } else if (uTipo == 8) { // pólen: pontinhos subindo e descendo devagar, com brilho
    p = vec2(aSeed.x * W + uT * (4.0 + aSeed.z * 4.0) + sin(uT * 1.1 + aSeed.w * 6.28) * 6.0 - uCam.x * 0.9,
             aSeed.y * H + sin(uT * 0.8 + aSeed.z * 6.28) * 8.0 - uT * 2.0 - uCam.y * 0.9);
    vBrilho = 0.5 + 0.5 * sin(uT * 3.0 + aSeed.w * 25.0);
  } else if (uTipo == 9) { // vento: risquinhos rápidos atravessando a tela em ondas
    float v = 120.0 + aSeed.z * 120.0;
    p = vec2(aSeed.x * W + uT * v - uCam.x, aSeed.y * H + sin(uT * 2.0 + aSeed.x * 12.0) * 5.0 - uCam.y);
    vBrilho = smoothstep(0.0, 0.4, sin(uT * (0.8 + aSeed.w) + aSeed.z * 6.28));
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
  if (uTipo == 9) { if (floor(gl_PointCoord.y * uTam) != 2.0) discard; }
  if (vBrilho < 0.02) discard;
  if (uTipo == 7 && length(gl_PointCoord - 0.5) > 0.5) discard;
  vec3 c = uCor;
  if (uTipo == 2) c = mix(vec3(0.3, 0.5, 0.1), uCor, vBrilho);
  if (uTipo == 7) { gl_FragColor = vec4(c, uAlpha * vBrilho); return; }
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
  // PROTÓTIPO: fogos de artifício (rastro subindo + estouro colorido que cai devagar e pisca)
  rastro: { n: 10, vel: [70, 90], ang: [1.5, 1.64], grav: -40, arrasto: 1, vida: [0.35, 0.55], tam: 1, cores: ['#fff8e0', '#f8d890', '#c89a50', '#6a5030'] },
  'fogos-dourado': { n: 60, vel: [35, 75], ang: [0, 6.283], grav: -30, arrasto: 2.2, vida: [0.9, 1.6], tam: 1, cintila: 1, cores: ['#ffffff', '#fff0a0', '#f8c040', '#c87020'] },
  'fogos-rosa': { n: 60, vel: [35, 75], ang: [0, 6.283], grav: -30, arrasto: 2.2, vida: [0.9, 1.6], tam: 1, cintila: 1, cores: ['#ffffff', '#ffc0e0', '#ff60a8', '#a02a70'] },
  'fogos-azul': { n: 60, vel: [35, 75], ang: [0, 6.283], grav: -30, arrasto: 2.2, vida: [0.9, 1.6], tam: 1, cintila: 1, cores: ['#ffffff', '#c0e8ff', '#50a8ff', '#2a4ab0'] },
  'fogos-verde': { n: 60, vel: [35, 75], ang: [0, 6.283], grav: -30, arrasto: 2.2, vida: [0.9, 1.6], tam: 1, cintila: 1, cores: ['#ffffff', '#d0ffc0', '#60e070', '#1e8a3a'] },
  // PROTÓTIPO (isekai): corte da espada — arco branco que abre na frente de quem ataca (golpe-dir / golpe-esq)
  'golpe-dir': { n: 34, vel: [70, 82], ang: [-1.15, 1.15], grav: 0, arrasto: 0, vida: [0.1, 0.18], tam: 2, cores: ['#ffffff', '#ffffff', '#e8f0ff', '#a8c0e8'] },
  'golpe-esq': { n: 34, vel: [70, 82], ang: [1.99, 4.29], grav: 0, arrasto: 0, vida: [0.1, 0.18], tam: 2, cores: ['#ffffff', '#ffffff', '#e8f0ff', '#a8c0e8'] },
  coracoes: { n: 8, vel: [15, 35], ang: [1.0, 2.14], grav: 10, arrasto: 1.5, vida: [0.7, 1.2], tam: 2, cores: ['#ff6a80', '#e83a4a', '#e83a4a', '#c82a3a'] },
};

// PROTÓTIPO (isekai): esporos do cogumelo — cor (azul = sono, amarelo = riso, rosa = amor) × tamanho
// (pequeno = espirrinho; grande = nuvem que enche a tela; flutuando = esporos que ficam boiando em volta, sem parar)
const CORES_ESPOROS = { azul: ['#ffffff', '#c8e8ff', '#7ab8f0', '#3a6ac8'], amarelo: ['#ffffff', '#fff4a0', '#f8d040', '#c8902a'], rosa: ['#ffffff', '#ffd0e8', '#ff8ac0', '#c84a8a'] };
for (const [cor, cores] of Object.entries(CORES_ESPOROS)) {
  RAJADAS[`esporos-${cor}-pequeno`] = { n: 18, vel: [10, 32], ang: [0, 6.283], grav: 6, arrasto: 2, vida: [0.8, 1.4], tam: 2, cintila: 1, cores };
  RAJADAS[`esporos-${cor}-grande`] = { n: 320, vel: [30, 175], ang: [0, 6.283], achatar: 0.7, grav: 3, arrasto: 0.9, vida: [2.8, 4.2], tam: 3, cores };
  RAJADAS[`esporos-${cor}-flutuando`] = { n: 40, vel: [6, 40], ang: [0, 6.283], grav: 5, arrasto: 0.6, vida: [2.5, 3.5], tam: 2, loop: 1, cintila: 1, cores };
}

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
