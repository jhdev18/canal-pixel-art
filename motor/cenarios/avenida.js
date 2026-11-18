// Avenida em PERSPECTIVA, desenhada pixel a pixel na GPU (shaders do Three.js).
// Não usamos texturas esticadas: cada pixel da tela calcula o que vê (asfalto, faixa, calçada,
// tijolo, janela...). Assim as linhas têm sempre 1 pixel, perto ou longe, e o detalhe menor que
// um pixel vira cor lisa em vez de "chuviscar". Iluminação em faixas, como na rua diagonal.
import * as THREE from 'three';
import { rng } from '../compartilhado/util.js';
import { hexParaRgb } from '../pixel.js';

const MAX_LUZES = 40;
const v3 = (hex) => new THREE.Vector3(...hexParaRgb(hex).map((c) => c / 255));

const GLSL_COMUM = /* glsl */ `
uniform vec4 uLuzes[${MAX_LUZES}];
uniform int uNumLuzes;
uniform vec3 uAmb, uCorLuz, uNeblina;
uniform vec2 uNeblinaDist;
varying vec3 vMundo;
float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[y * 4 + x]) + 0.5) / 16.0;
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// linha de exatamente ~1 pixel sobre uma grade de passo 'passo' (px = mundo por pixel)
float linha(float coord, float passo, float px) {
  float d = abs(fract(coord / passo + 0.5) - 0.5) * passo;
  return step(d, px * 0.5);
}
// neblina em faixas (pixel art), dithering só na borda
vec3 neblina(vec3 c) {
  float d = length(vMundo - cameraPosition);
  float f = clamp((d - uNeblinaDist.x) / (uNeblinaDist.y - uNeblinaDist.x), 0.0, 1.0);
  f = clamp(floor(f * 4.0 + 0.5 + (bayer4(gl_FragCoord.xy) - 0.5) * 0.35), 0.0, 4.0) / 4.0;
  return mix(c, uNeblina, f);
}
vec3 iluminar(vec3 cor, float fator) {
  float nivel = 0.0;
  for (int i = 0; i < ${MAX_LUZES}; i++) {
    if (i >= uNumLuzes) break;
    float d = distance(vMundo, uLuzes[i].xyz);
    nivel += max(0.0, 1.0 - d / 4.0) * uLuzes[i].w;
  }
  nivel = min(nivel, 1.0);
  float q = clamp(floor(nivel * 3.0 + 0.5 + (bayer4(gl_FragCoord.xy) - 0.5) * 0.35), 0.0, 3.0) / 3.0;
  return neblina(cor * fator * (uAmb + q * uCorLuz * 0.6));
}`;

const VERT = /* glsl */ `
varying vec3 vMundo; varying vec2 vUV;
void main() { vUV = uv; vec4 w = modelMatrix * vec4(position, 1.0); vMundo = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

const FRAG_CHAO = /* glsl */ `
${GLSL_COMUM}
uniform vec2 uFaixa; // z inicial/final da faixa de pedestre
void main() {
  vec2 p = vMundo.xz;
  float px = max(fwidth(p.x), fwidth(p.y));          // tamanho de 1 pixel em unidades do mundo
  float ax = abs(p.x);
  vec3 c;
  if (ax < 3.0) {
    c = vec3(0.216, 0.224, 0.29);
    float s = exp2(ceil(log2(max(px, 1.0 / 32.0))));   // grão do asfalto ~1 pixel em qualquer distância
    float n = hash(floor(p / s));
    if (n < 0.08) c = vec3(0.27, 0.275, 0.35); else if (n < 0.14) c = vec3(0.165, 0.165, 0.215);
    if (ax < 0.07 + px * 0.5 && fract(p.y / 2.0) < 0.55) c = vec3(0.9, 0.74, 0.24);            // faixa central
    if (p.y > uFaixa.x && p.y < uFaixa.y && fract((p.x + 3.0) * 1.0) < 0.5) c = vec3(0.88, 0.88, 0.92);
  } else if (ax < 3.3) {
    c = ax < 3.15 ? vec3(0.71, 0.72, 0.77) : vec3(0.6, 0.61, 0.67);
    if (abs(ax - 3.15) < px * 0.5) c = vec3(0.29, 0.29, 0.35);
  } else {
    c = vec3(0.478, 0.486, 0.565);
    if (0.5 / px > 4.0 && (linha(p.x, 0.5, px) > 0.0 || linha(p.y, 0.5, px) > 0.0)) c = vec3(0.37, 0.376, 0.455);
    if (ax > 5.6) c *= 0.82;                             // sombra junto às fachadas
  }
  gl_FragColor = vec4(iluminar(c, 1.0), 1.0);
}`;

const FRAG_FACHADA = /* glsl */ `
${GLSL_COMUM}
varying vec2 vUV;
uniform vec2 uTam;            // largura (ao longo da rua) e altura, em unidades
uniform vec3 uCor0, uCor1, uCor2, uToldo0, uToldo1;
uniform float uSemente, uNoite, uTijolo;
void main() {
  vec2 q = vUV * uTam;
  float px = max(fwidth(q.x), fwidth(q.y));
  vec3 c = uCor0;
  bool emissivo = false;
  if (uTijolo > 0.5 && 0.25 / px > 3.0 && linha(q.y, 0.25, px) > 0.0) c = uCor1;   // fiadas
  if (q.x < 0.12 || q.x > uTam.x - 0.12) c = uCor2;                                // pilastras
  if (q.y < 0.1) c = uCor2;
  if (q.y < 1.45) {                                                                 // térreo
    float u = q.x;
    if (q.y > 1.12 && q.y < 1.42) {                                                 // toldo
      c = mod(floor(u / 0.32), 2.0) < 1.0 ? uToldo0 : uToldo1;
      if (q.y < 1.12 + px) c = vec3(0.16, 0.12, 0.15);
    } else if (u > 0.3 && u < 0.95 && q.y < 1.05) {                                 // porta
      c = vec3(0.35, 0.23, 0.16);
      if (abs(u - 0.3) < px || abs(u - 0.95) < px || abs(q.y - 1.05) < px) c = vec3(0.16, 0.15, 0.22);
    } else if (u > 1.2 && u < uTam.x - 0.35 && q.y > 0.25 && q.y < 1.0) {           // vitrine
      bool borda = abs(u - 1.2) < px || abs(u - (uTam.x - 0.35)) < px || abs(q.y - 0.25) < px || abs(q.y - 1.0) < px;
      if (borda) c = vec3(0.16, 0.15, 0.22);
      else if (uNoite > 0.5) { c = q.y > 0.72 ? vec3(1.0, 0.94, 0.75) : vec3(1.0, 0.8, 0.4); emissivo = true; }
      else c = q.y > 0.6 ? vec3(0.66, 0.78, 0.88) : vec3(0.42, 0.54, 0.66);
    }
  } else if (q.y > uTam.y - 0.4) {                                                  // cornija
    c = q.y > uTam.y - 0.14 ? uCor2 : vec3(0.85, 0.82, 0.75);
    if (abs(q.y - (uTam.y - 0.4)) < px) c = uCor2;
  } else {                                                                          // andares
    vec2 celula = vec2(1.0, 1.5);
    vec2 g = (q - vec2(0.0, 1.55)) / celula;
    vec2 id = floor(g), l = fract(g) * celula;
    float tamPx = celula.x / px;                       // largura da célula em pixels
    bool acesa = uNoite > 0.5 && hash(id + uSemente) < 0.5;
    vec3 vidro = acesa ? vec3(1.0, 0.83, 0.42) : vec3(0.16, 0.2, 0.32);
    if (q.x > 0.15 && q.x < uTam.x - 0.15) {
      if (tamPx > 5.0) {
        if (l.x > 0.25 && l.x < 0.78 && l.y > 0.32 && l.y < 1.16) {
          bool borda = abs(l.x - 0.25) < px || abs(l.x - 0.78) < px || abs(l.y - 0.32) < px || abs(l.y - 1.16) < px;
          c = borda ? vec3(0.16, 0.15, 0.22) : vidro;
          if (!borda && acesa) emissivo = true;
          if (!borda && !acesa && l.x < 0.42 && l.y > 0.85) c = vec3(0.35, 0.42, 0.6);   // reflexo
        } else if (l.x > 0.22 && l.x < 0.81 && abs(l.y - 0.28) < max(px, 0.04)) c = vec3(0.85, 0.82, 0.75); // peitoril
      } else if (tamPx > 2.0) {
        if (l.x > 0.25 && l.x < 0.78 && l.y > 0.32 && l.y < 1.16) { c = vidro; emissivo = acesa; }  // janela simples
      } else {
        c = mix(c, vidro, 0.22);                         // bem longe: cor média estável (sem acender)
      }
    }
  }
  vec3 corFinal = emissivo ? neblina(c) : iluminar(c, 1.0);
  gl_FragColor = vec4(corFinal, 1.0);
}`;

const PALETAS = [
  { c: ['#7a4a46', '#663c3a', '#3e2226'], tijolo: 1 }, { c: ['#4a5a7a', '#3e4c6a', '#242c44'], tijolo: 0 },
  { c: ['#8a7a5a', '#7a6a4c', '#4a3e2c'], tijolo: 0 }, { c: ['#5a4a6a', '#4c3e5c', '#2a2234'], tijolo: 1 },
  { c: ['#6a6a5a', '#5a5a4c', '#34342c'], tijolo: 0 }, { c: ['#8a5a3a', '#74482e', '#3e2614'], tijolo: 1 },
];
const TOLDOS = [['#e8e0d0', '#c83c4c'], ['#e8e0d0', '#3aa868'], ['#e8e0d0', '#3a6ac8'], ['#f0d040', '#5a3a6a'], ['#e8e0d0', '#e87a3a']];

function carro(corHex) {
  const g = new THREE.Group();
  const c = (hex) => new THREE.MeshLambertMaterial({ color: hex });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.55, 1.2), c(corHex)); corpo.position.y = 0.45; g.add(corpo);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.05), [c(0x5a8ac8), c(0x5a8ac8), c(corHex), c(0), c(0x7aaae0), c(0x7aaae0)]); cab.position.set(-0.2, 0.95, 0); g.add(cab);
  for (const [dx, dz] of [[-0.85, 0.6], [0.85, 0.6], [-0.85, -0.6], [0.85, -0.6]]) { const rd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.15), c(0x1a1a22)); rd.position.set(dx, 0.2, dz); g.add(rd); }
  for (const z of [0.35, -0.35]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff0b0 })); f.position.set(1.31, 0.5, z); g.add(f); const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: 0xff3030 })); l.position.set(-1.31, 0.5, z); g.add(l); }
  return g;
}

// opc: { periodo, comprimento, carros, distanciaPostes, faixaPedestre (z), semente }
export function gerarAvenida(opc = {}) {
  const noite = (opc.periodo ?? 'noite') === 'noite';
  const comp = opc.comprimento ?? 80, ZI = 14, ZF = ZI - comp;
  const r = rng(opc.semente ?? 4);
  const grupo = new THREE.Group();
  const ceu = noite ? '#0c0c22' : '#8ac4f0';
  const neblina = noite ? ['#0c0c22', 22, 70] : ['#a8d4f4', 35, 90];
  const ambiente = noite ? ['#8a90c8', 0.55] : ['#ffffff', 1.0];

  // luzes pintadas (postes e vitrines) — as mesmas posições ganham PointLights para os sprites
  const postes = [];
  const passo = opc.distanciaPostes ?? 9;
  for (const lado of [-1, 1]) for (let z = ZI - 8; z > ZF; z -= passo) postes.push({ x: lado * 3.8, z });
  const luzes = [];
  if (noite) for (const p of postes) luzes.push(new THREE.Vector4(p.x, 2.5, p.z, 1));

  const comuns = () => ({
    uLuzes: { value: Array.from({ length: MAX_LUZES }, () => new THREE.Vector4()) },
    uNumLuzes: { value: 0 },
    uAmb: { value: v3(ambiente[0]).multiplyScalar(ambiente[1] * (noite ? 1.25 : 1)) },
    uCorLuz: { value: new THREE.Vector3(1.0, 0.86, 0.6) },
    uNeblina: { value: v3(neblina[0]) },
    uNeblinaDist: { value: new THREE.Vector2(neblina[1], neblina[2]) },
  });
  const materiais = [];
  const shader = (frag, extra) => {
    const m = new THREE.ShaderMaterial({ uniforms: { ...comuns(), ...extra }, vertexShader: VERT, fragmentShader: frag });
    materiais.push(m); return m;
  };

  // chão
  const zf = opc.faixaPedestre ?? -12;
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(12, comp), shader(FRAG_CHAO, { uFaixa: { value: new THREE.Vector2(zf - 1.25, zf + 1.25) } }));
  chao.rotation.x = -Math.PI / 2; chao.position.set(0, 0, ZI - comp / 2);
  grupo.add(chao);

  // fachadas (planos voltados para a avenida)
  let n = 0;
  for (const lado of [-1, 1]) {
    let z = ZI + 4;
    while (z > ZF + 4) {
      const w = 3 + Math.floor(r() * 4), andares = 1 + Math.floor(r() * 3), h = 1.55 + andares * 1.5 + 0.4;
      const pal = PALETAS[n % PALETAS.length], toldo = TOLDOS[n % TOLDOS.length];
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), shader(FRAG_FACHADA, {
        uTam: { value: new THREE.Vector2(w, h) }, uCor0: { value: v3(pal.c[0]) }, uCor1: { value: v3(pal.c[1]) }, uCor2: { value: v3(pal.c[2]) },
        uToldo0: { value: v3(toldo[0]) }, uToldo1: { value: v3(toldo[1]) }, uSemente: { value: n * 17.3 }, uNoite: { value: noite ? 1 : 0 }, uTijolo: { value: pal.tijolo },
      }));
      m.rotation.y = lado < 0 ? Math.PI / 2 : -Math.PI / 2;
      m.position.set(lado * 6, h / 2, z - w / 2);
      grupo.add(m);
      if (noite) luzes.push(new THREE.Vector4(lado * 5.7, 0.7, z - w / 2 - 0.2, 0.55)); // luz da vitrine na calçada
      z -= w; n++;
    }
  }
  const nl = Math.min(MAX_LUZES, luzes.length);
  for (const m of materiais) { m.uniforms.uNumLuzes.value = nl; for (let i = 0; i < nl; i++) m.uniforms.uLuzes.value[i].copy(luzes[i]); }

  // carros (movimento determinístico)
  const carros = [];
  if (opc.carros !== false) {
    const c1 = carro(0xc83c4c); c1.rotation.y = Math.PI / 2; grupo.add(c1); carros.push({ g: c1, x: 1.5, z0: -6, v: -3.2 });
    const c2 = carro(0x3a6ac8); c2.rotation.y = -Math.PI / 2; grupo.add(c2); carros.push({ g: c2, x: -1.5, z0: ZF + 10, v: 4.0 });
  }
  const ciclo = comp - 10;
  return {
    grupo, postes, noite, ceu, neblina, ambiente,
    atualizar(t) {
      for (const c of carros) {
        const z = ZF + 5 + ((((c.z0 + c.v * t - (ZF + 5)) % ciclo) + ciclo) % ciclo);
        c.g.position.set(c.x, 0, z);
      }
    },
    liberar() { for (const m of materiais) m.dispose(); },
  };
}
