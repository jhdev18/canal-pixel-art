// Móveis e prédios em 3D (para a vista "3d"): caixas, cilindros e esferas com textura em pixel art
// (16 px por unidade, filtro "nearest"). Objetos chatos/retangulares reaproveitam o desenho do sprite
// na face da frente (lousa, guarda-roupa, estantes, fachadas dos prédios).
// Cada construtor recebe (g, o, ctx): g = grupo THREE, o = { x, z, ... } (centro no chão), ctx = { luzes, noite }.
import * as THREE from 'three';
import { Pix, bayer, hexParaRgb } from '../pixel.js';
import { obterSprite } from '../sprites.js';

const PX = 16;
const MAD = ['#c89060', '#a8703e', '#7a4e2a'];
const METAL = ['#9aa0b0', '#6a7080', '#4a5060'];

function texCanvas(cv) {
  const t = new THREE.CanvasTexture(cv);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.NoColorSpace;
  return t;
}
// Face em pixel art: pintor(p, w, h) ou cor lisa (com borda 1 px mais escura e leve granulado).
function face(wu, hu, pintor, { emissiva = false } = {}) {
  const w = Math.max(2, Math.round(wu * PX)), h = Math.max(2, Math.round(hu * PX)), p = new Pix(w, h);
  if (typeof pintor === 'function') pintor(p, w, h);
  else {
    const [r, g, b] = hexParaRgb(pintor), esc = `rgb(${r * 0.72 | 0},${g * 0.72 | 0},${b * 0.74 | 0})`;
    const cl = '#' + [r, g, b].map((c) => Math.min(255, c * 1.06 + 6 | 0).toString(16).padStart(2, '0')).join('');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) p.set(x, y, x === 0 || y === 0 || x === w - 1 || y === h - 1 ? escHex(esc) : bayer(x, y) < 0.06 ? cl : pintor);
  }
  const t = texCanvas(p.paraCanvas());
  return emissiva ? new THREE.MeshBasicMaterial({ map: t }) : new THREE.MeshLambertMaterial({ map: t });
}
const escHex = (rgb) => '#' + rgb.match(/\d+/g).map((n) => (+n).toString(16).padStart(2, '0')).join('');
const madeira = (base = MAD) => (p, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) p.set(x, y, x === 0 || y === 0 || x === w - 1 || y === h - 1 ? base[2] : (y * 7 + (x >> 3) * 3) % 11 === 0 ? base[2] : (bayer(x, y) < 0.08 ? base[0] : base[1])); };
const tecido = (c, costura = 0) => (p, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) p.set(x, y, x === 0 || y === 0 || x === w - 1 || y === h - 1 || (costura && x % costura === 0) ? c[2] : bayer(x, y) < 0.2 ? c[0] : c[1]); };

// Caixa: faces = { frente, lado, topo, tras } (cor, pintor ou material). Posição: (x, y da base, z do centro).
function caixa(g, x, y, z, w, h, d, f) {
  const m = (v, fw, fh, op) => (v instanceof THREE.Material ? v : face(fw, fh, v ?? f.frente, op));
  const lado = m(f.lado ?? f.frente, d, h), topo = m(f.topo ?? f.frente, w, d);
  const mats = [lado, lado, topo, m(f.base ?? '#2a2030', w, d), m(f.frente, w, h, { emissiva: f.emissiva }), m(f.tras ?? f.lado ?? f.frente, w, h)];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
  mesh.position.set(x, y + h / 2, z); g.add(mesh);
  return mesh;
}
function cilindro(g, x, y, z, r0, r1, h, cor, { seg = 8, emissiva = false } = {}) {
  const M = emissiva ? THREE.MeshBasicMaterial : THREE.MeshLambertMaterial;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), new M({ color: cor }));
  mesh.position.set(x, y + h / 2, z); g.add(mesh); return mesh;
}
function esfera(g, x, y, z, r, cor, det = 1) {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, det), new THREE.MeshLambertMaterial({ color: cor, flatShading: true }));
  mesh.position.set(x, y + r, z); g.add(mesh); return mesh;
}
// Sombra de contato no chão (retângulo escuro suave).
function sombra(g, x, z, w, d, forca = 0.32) {
  const p = new Pix(Math.round(w * 8) + 8, Math.round(d * 8) + 8);
  for (let y = 0; y < p.h; y++) for (let xx = 0; xx < p.w; xx++) {
    const b = Math.min(xx, y, p.w - 1 - xx, p.h - 1 - y);
    if (b >= 4 || bayer(xx, y) < b / 4) p.set(xx, y, '#000000');
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w + 1, d + 1), new THREE.MeshBasicMaterial({ map: texCanvas(p.paraCanvas()), transparent: true, opacity: forca, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.015, z); m.renderOrder = -1; g.add(m);
}
// Frente de um sprite existente (canvas) recortada; devolve { cv, w, h } em unidades.
function frenteSprite(nome, op = {}) {
  const s = obterSprite(nome, op); const cv = s.quadros[0];
  return { cv, w: cv.width / PX, h: cv.height / PX, s };
}
// cor mais comum de uma faixa do sprite (para pintar os lados/topo combinando)
function corDominante(cv, y0 = 0, y1 = cv.height) {
  const d = cv.getContext('2d').getImageData(0, y0, cv.width, Math.max(1, y1 - y0)).data, cont = new Map();
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; if (k !== 0x1a1c2c) cont.set(k, (cont.get(k) || 0) + 1); }
  let melhor = 0x888888, n = 0; for (const [k, v] of cont) if (v > n) { n = v; melhor = k; }
  return '#' + melhor.toString(16).padStart(6, '0');
}
const escurecer = (hex, k) => '#' + hexParaRgb(hex).map((c) => Math.round(c * k).toString(16).padStart(2, '0')).join('');
// Caixa cuja frente é o desenho do sprite (com recorte do que não é parede: "sobra" vira um plano em pé).
function caixaDeSprite(g, nome, o, d, op = {}) {
  const { cv } = frenteSprite(nome, op), esc = o.escala ?? 1, w = cv.width / PX * esc;
  // linha a partir da qual o desenho ocupa quase toda a largura = corpo da caixa
  const ctx2 = cv.getContext('2d'), dd = ctx2.getImageData(0, 0, cv.width, cv.height).data;
  let topo = 0;
  for (let y = 0; y < cv.height; y++) { let n = 0; for (let x = 0; x < cv.width; x++) if (dd[(y * cv.width + x) * 4 + 3] > 0) n++; if (n > cv.width * 0.9) { topo = y; break; } }
  const corpoH = (cv.height - topo) / PX * esc;
  const corpo = document.createElement('canvas'); corpo.width = cv.width; corpo.height = cv.height - topo;
  corpo.getContext('2d').drawImage(cv, 0, -topo);
  const lateral = escurecer(corDominante(cv, topo), 0.82), teto = op.teto || escurecer(corDominante(cv, topo, topo + 4), 0.9);
  const frente = new THREE.MeshLambertMaterial({ map: texCanvas(corpo), transparent: true, alphaTest: 0.5 });
  caixa(g, o.x, o.y ?? 0, o.z, w, corpoH, d, { frente, lado: lateral, topo: teto, tras: lateral });
  if (topo > 0) {                                    // frontão, placas e enfeites acima do corpo
    const sob = document.createElement('canvas'); sob.width = cv.width; sob.height = topo + 1;
    sob.getContext('2d').drawImage(cv, 0, 0);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, (topo + 1) / PX * esc), new THREE.MeshLambertMaterial({ map: texCanvas(sob), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
    m.position.set(o.x, (o.y ?? 0) + corpoH + ((topo + 1) / PX / 2 - 1 / PX) * esc, o.z + d / 2 - 0.02); g.add(m);
  }
  if (!o.y) sombra(g, o.x, o.z, w, d);
  return { w, h: corpoH, d };
}
// Placa fina na parede (lousa, cartaz, relógio): o próprio sprite numa caixinha.
function placaParede(g, nome, o, esp = 0.08) {
  const { cv, w, h } = frenteSprite(nome, o);
  const frente = new THREE.MeshLambertMaterial({ map: texCanvas(cv), transparent: true, alphaTest: 0.5 });
  const lado = escurecer(corDominante(cv), 0.7);
  caixa(g, o.x, o.y ?? 1.5, o.z + esp / 2, w, h, esp, { frente, lado, topo: lado, tras: lado });
}
function luz(ctx, x, y, z, cor, forca = 1.4, alcance = 6) { ctx.luzes.push({ x, y, z, cor, forca, alcance }); }

// ------------------------------------------------------------------ construtores
export const OBJETOS_3D = {
  // ---- quarto
  cama(g, o) {
    const tec = o.cores || ['#5a8ae0', '#3a6ac8', '#2a4a9a'], W = 4.2, D = 2.0, x = o.x, z = o.z;
    caixa(g, x, 0, z, W, 0.45, D, { frente: madeira(), topo: MAD[1] });
    caixa(g, x + 0.1, 0.45, z, W - 0.2, 0.32, D - 0.1, { frente: '#f0f0f4', topo: '#f8f8fa' });
    caixa(g, x + W * 0.18, 0.77, z, W * 0.62, 0.08, D + 0.06, { frente: tecido(tec, 8), lado: tecido(tec), topo: tecido(tec, 8) });
    caixa(g, x - W / 2 + 0.7, 0.77, z, 0.9, 0.22, D * 0.75, { frente: '#e8eaf0', topo: '#ffffff' });
    caixa(g, x - W / 2 + 0.1, 0, z, 0.2, 1.6, D, { frente: madeira(), lado: madeira(), topo: MAD[0] });
    caixa(g, x + W / 2 - 0.1, 0, z, 0.2, 0.9, D, { frente: madeira(), lado: madeira(), topo: MAD[0] });
    sombra(g, x, z, W, D);
  },
  'criado-mudo'(g, o, ctx) {
    caixaDeSprite(g, 'criado-mudo', o, 1.0);
    const y = 22 / PX, aceso = o.aceso ?? ctx.noite;
    cilindro(g, o.x, y, o.z, 0.3, 0.34, 0.12, '#a8703e');
    cilindro(g, o.x, y + 0.12, o.z, 0.05, 0.05, 0.7, '#8a6a2a', { seg: 6 });
    cilindro(g, o.x, y + 0.8, o.z, 0.22, 0.42, 0.5, aceso ? '#fff0c0' : '#e0c880', { emissiva: aceso });
    if (aceso) luz(ctx, o.x, y + 0.9, o.z + 0.4, '#ffd890', 1.6, 6);
  },
  'bau-brinquedos'(g, o) {
    const x = o.x, z = o.z;
    caixa(g, x, 0, z, 2.0, 0.65, 1.1, { frente: (p, w, h) => { for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) p.set(xx, y, y < 3 ? '#c07820' : (y > 4 && y < 8 && (xx >> 2) % 2) ? ['#3a6ac8', '#c83c4c', '#3aa860', '#f8e060'][(xx >> 3) % 4] : xx === 0 || xx === w - 1 || y === h - 1 ? '#a06010' : '#e8a040'); }, lado: '#d08a30', topo: '#b06a1a' });
    caixa(g, x - 0.5, 0.65, z, 0.4, 0.45, 0.4, { frente: '#3aa860', topo: '#f8e060' });
    esfera(g, x + 0.4, 0.65, z, 0.24, '#e83a3a');
    sombra(g, x, z, 2, 1.1);
  },
  escrivaninha(g, o, ctx) {
    const x = o.x, z = o.z, W = 3.0, D = 1.3, ligado = o.ligado ?? !ctx.noite;
    caixa(g, x - W / 2 + 0.5, 0, z, 1.0, 0.78, D - 0.05, { frente: (p, w, h) => { madeira()(p, w, h); for (const yy of [Math.floor(h / 2)]) for (let xx = 1; xx < w - 1; xx++) p.set(xx, yy, MAD[2]); p.ret(w / 2 - 1, 3, 3, 1, '#e8c040'); p.ret(w / 2 - 1, h / 2 + 3, 3, 1, '#e8c040'); }, topo: MAD[1] });
    for (const dx of [W / 2 - 0.1]) for (const dz of [-D / 2 + 0.1, D / 2 - 0.1]) caixa(g, x + dx, 0, z + dz, 0.12, 0.78, 0.12, { frente: MAD[2] });
    caixa(g, x, 0.78, z, W, 0.1, D, { frente: MAD[2], topo: madeira() });
    caixa(g, x + 0.2, 0.88, z - 0.35, 0.3, 0.12, 0.25, { frente: '#3a3a4a' });
    caixa(g, x + 0.2, 1.0, z - 0.4, 1.5, 0.95, 0.1, { frente: ligado ? (p, w, h) => { for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) p.set(xx, y, xx < 1 || y < 1 || xx > w - 2 || y > h - 2 ? '#3a3a4a' : y < 4 ? '#5ad0f0' : (xx + y) % 7 === 0 ? '#a8f0ff' : '#3a9ad8'); p.ret(3, 6, 10, 1, '#f4f4f4'); p.ret(3, 9, 6, 1, '#f8e060'); } : '#1e2430', emissiva: ligado, lado: '#2a2a36', topo: '#4a4a5a', tras: '#2a2a36' });
    caixa(g, x + 0.1, 0.88, z + 0.15, 1.1, 0.04, 0.35, { frente: '#9aa0b0', topo: '#d0d4dc' });
    if (ligado) luz(ctx, x + 0.2, 1.5, z + 0.4, '#80d0ff', 0.8, 3.5);
    sombra(g, x, z, W, D);
  },
  'cadeira-gamer'(g, o) {
    const x = o.x, z = o.z, c = o.cores || ['#e85a5a', '#c83c4c', '#8a2a3a'];
    cilindro(g, x, 0, z, 0.45, 0.45, 0.08, '#2a2a36', { seg: 5 });
    cilindro(g, x, 0.08, z, 0.06, 0.06, 0.45, '#3a3a4a', { seg: 6 });
    caixa(g, x, 0.53, z, 0.95, 0.18, 0.9, { frente: tecido(c), topo: tecido(c) });
    caixa(g, x, 0.71, z + 0.38, 0.95, 1.3, 0.16, { frente: (p, w, h) => { tecido(c)(p, w, h); p.ret(3, 3, w - 6, 3, '#1e1e2a'); }, tras: tecido(c), lado: c[2], topo: c[0] });
    sombra(g, x, z, 1, 1, 0.25);
  },
  'guarda-roupa'(g, o) { caixaDeSprite(g, 'guarda-roupa', o, 1.3); },
  bola(g, o) { esfera(g, o.x, 0, o.z, 0.3, o.cor || '#e83a3a'); sombra(g, o.x, o.z, 0.5, 0.5, 0.25); },
  // ---- escola
  lousa(g, o) { placaParede(g, 'lousa', o); },
  'cartaz-alfabeto'(g, o) { placaParede(g, 'cartaz-alfabeto', o, 0.04); },
  'relogio-parede'(g, o) { placaParede(g, 'relogio-parede', o, 0.1); },
  'estante-livros'(g, o) {
    caixaDeSprite(g, 'estante-livros', o, 1.0);
    if (o.globo !== false) { const y = 60 / PX; cilindro(g, o.x, y, o.z, 0.25, 0.3, 0.1, '#a8703e'); cilindro(g, o.x, y + 0.1, o.z, 0.04, 0.04, 0.3, '#8a6a2a', { seg: 5 }); esfera(g, o.x, y + 0.35, o.z, 0.38, '#3a7ac8', 1); esfera(g, o.x + 0.12, y + 0.5, o.z + 0.1, 0.2, '#4a9a4a', 0); }
  },
  'mesa-professor'(g, o) {
    const x = o.x, z = o.z, W = 3.5, D = 1.4;
    for (const dx of [-W / 2 + 0.6, W / 2 - 0.6]) caixa(g, x + dx, 0, z, 1.1, 0.82, D - 0.1, { frente: (p, w, h) => { madeira()(p, w, h); for (const yy of [Math.floor(h / 3), Math.floor(2 * h / 3)]) { for (let xx = 1; xx < w - 1; xx++) p.set(xx, yy, MAD[2]); p.ret(w / 2 - 1, yy + 2, 3, 1, '#e8c040'); } }, topo: MAD[1] });
    caixa(g, x, 0.25, z - D / 2 + 0.1, W - 2.2, 0.57, 0.08, { frente: madeira() });
    caixa(g, x, 0.82, z, W, 0.12, D, { frente: MAD[2], topo: madeira() });
    caixa(g, x - 1.1, 0.94, z, 0.8, 0.14, 0.6, { frente: '#3a6ac8', topo: '#f4f0e8' });
    caixa(g, x - 1.1, 1.08, z, 0.7, 0.12, 0.5, { frente: '#c83c4c', topo: '#f4f0e8' });
    esfera(g, x, 0.94, z, 0.16, '#d83a3a', 0);
    cilindro(g, x + 1.1, 0.94, z, 0.13, 0.13, 0.3, '#f4f0e8', { seg: 8 });
    sombra(g, x, z, W, D);
  },
  carteira(g, o) {                                   // mesa + cadeira (aluno olha para a lousa, no fundo)
    const x = o.x, z = o.z;
    for (const dx of [-0.55, 0.55]) for (const dz of [-0.3, 0.3]) caixa(g, x + dx, 0, z + dz, 0.07, 0.72, 0.07, { frente: METAL[1] });
    caixa(g, x, 0.35, z, 1.15, 0.2, 0.6, { frente: METAL[2] });
    caixa(g, x, 0.72, z, 1.3, 0.08, 0.8, { frente: MAD[2], topo: (p, w, h) => { madeira()(p, w, h); p.ret(6, 3, 6, 5, '#f4f0e8'); p.ret(6, 3, 6, 1, '#c83c4c'); } });
    const zc = z + 0.85;
    for (const dx of [-0.32, 0.32]) for (const dz of [-0.25, 0.25]) caixa(g, x + dx, 0, zc + dz, 0.06, 0.45, 0.06, { frente: METAL[1] });
    caixa(g, x, 0.45, zc, 0.75, 0.07, 0.65, { frente: MAD[2], topo: MAD[1] });
    caixa(g, x, 0.52, zc + 0.3, 0.75, 0.55, 0.06, { frente: madeira(), tras: madeira() });
    sombra(g, x, z + 0.4, 1.3, 1.6, 0.25);
  },
  // ---- sala de estar
  sofa(g, o) {
    const x = o.x, z = o.z, W = o.largura ?? 4.8, D = 1.6, c = o.cores || ['#5aaaa8', '#3a8a8a', '#2a6a6a'];
    caixa(g, x, 0, z, W - 0.2, 0.15, D - 0.2, { frente: '#4a2e1a' });
    caixa(g, x, 0.15, z, W, 0.38, D, { frente: tecido(c), topo: tecido(c) });
    caixa(g, x, 0.53, z - D / 2 + 0.22, W, 0.95, 0.44, { frente: tecido(c, Math.round((W - 0.8) / 3 * PX)), topo: c[0], lado: tecido(c) });
    const n = W > 3 ? 3 : 1, larg = (W - 0.8) / n;
    for (let k = 0; k < n; k++) caixa(g, x - (W - 0.8) / 2 + larg * (k + 0.5), 0.53, z + 0.18, larg - 0.04, 0.16, D - 0.6, { frente: tecido(c), topo: tecido(c) });
    for (const sx of [-1, 1]) caixa(g, x + sx * (W / 2 - 0.2), 0.53, z, 0.4, 0.42, D, { frente: tecido(c), topo: c[0] });
    if (W > 3) caixa(g, x - W / 2 + 0.9, 0.69, z - 0.2, 0.75, 0.6, 0.18, { frente: tecido(['#f8d060', '#f0b830', '#c88a20']) });
    sombra(g, x, z, W, D);
  },
  poltrona(g, o) { OBJETOS_3D.sofa(g, { ...o, largura: 2.0, cores: o.cores || ['#d85a5a', '#a83a3a', '#7a2a2a'] }); },
  'tv-rack'(g, o, ctx) {
    const x = o.x, z = o.z, ligada = o.ligada ?? true;
    caixa(g, x, 0, z, 3.6, 0.7, 1.0, { frente: (p, w, h) => { madeira()(p, w, h); p.ret(2, 2, w / 2 - 3, h - 4, MAD[2]); p.ret(w / 2 + 1, 2, w / 2 - 3, h - 4, MAD[2]); p.ret(5, 5, 12, 3, '#3a3a4a'); for (let k = 0; k < 5; k++) p.ret(w / 2 + 4 + k * 4, 3, 3, h - 6, ['#c83c4c', '#3a6ac8', '#3aa860', '#f0b830', '#8a4ac8'][k]); }, topo: madeira() });
    caixa(g, x, 0.7, z - 0.1, 0.5, 0.12, 0.35, { frente: '#2a2a36' });
    caixa(g, x, 0.82, z - 0.15, 2.8, 1.65, 0.14, { frente: ligada ? (p, w, h) => { for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { let c = xx < 2 || y < 2 || xx > w - 3 || y > h - 3 ? '#2a2a36' : y < h * 0.5 ? '#6ab8f0' : y < h * 0.7 ? '#8ad070' : '#5aa04a'; if ((xx - w * 0.7) ** 2 + (y - h * 0.3) ** 2 < 10) c = '#fff4a0'; p.set(xx, y, c); } } : '#141820', emissiva: ligada, lado: '#2a2a36', topo: '#3a3a46', tras: '#2a2a36' });
    if (ligada) luz(ctx, x, 1.6, z + 0.8, '#a0d0ff', 1.0, 5);
    sombra(g, x, z, 3.6, 1);
  },
  'mesa-centro'(g, o) {
    const x = o.x, z = o.z;
    for (const dx of [-1.1, 1.1]) for (const dz of [-0.45, 0.45]) caixa(g, x + dx, 0, z + dz, 0.12, 0.45, 0.12, { frente: MAD[2] });
    caixa(g, x, 0.45, z, 2.6, 0.1, 1.2, { frente: MAD[2], topo: madeira() });
    caixa(g, x - 0.6, 0.55, z, 0.7, 0.03, 0.5, { frente: '#c83c4c', topo: '#e8e0d0' });
    cilindro(g, x + 0.6, 0.55, z, 0.12, 0.12, 0.18, '#f4f4f4');
    sombra(g, x, z, 2.6, 1.2, 0.22);
  },
  'luminaria-pe'(g, o, ctx) {
    const acesa = o.acesa ?? true;
    cilindro(g, o.x, 0, o.z, 0.35, 0.4, 0.1, '#3a3a4a');
    cilindro(g, o.x, 0.1, o.z, 0.05, 0.05, 2.7, '#4a4a5a', { seg: 6 });
    cilindro(g, o.x, 2.75, o.z, 0.3, 0.5, 0.6, acesa ? '#fff0d0' : '#d8c8a0', { emissiva: acesa });
    if (acesa) luz(ctx, o.x, 2.9, o.z + 0.4, '#ffd890', 1.5, 7);
    sombra(g, o.x, o.z, 0.6, 0.6, 0.25);
  },
  'planta-vaso'(g, o) {
    cilindro(g, o.x, 0, o.z, 0.42, 0.32, 0.75, '#c8643a');
    cilindro(g, o.x, 0.72, o.z, 0.44, 0.44, 0.06, '#5a3a20');
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2, f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.3, 4), new THREE.MeshLambertMaterial({ color: k % 2 ? '#3a8a44' : '#5ab85a', flatShading: true }));
      f.position.set(o.x + Math.cos(a) * 0.3, 1.25, o.z + Math.sin(a) * 0.3); f.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); g.add(f);
    }
    sombra(g, o.x, o.z, 0.8, 0.8, 0.25);
  },
  'estante-sala'(g, o) { caixaDeSprite(g, 'estante-sala', o, 0.9); },
  // ---- praça
  predio(g, o) { caixaDeSprite(g, o.sprite, o, o.profundidade ?? 5, { teto: o.teto || '#6a5a5a' }); },
  'banco-praca'(g, o) {
    const x = o.x, z = o.z;
    for (const dx of [-0.75, 0.75]) caixa(g, x + dx, 0, z, 0.12, 0.45, 0.6, { frente: '#3a3a4a' });
    for (const dz of [-0.15, 0.1]) caixa(g, x, 0.45, z + dz, 1.9, 0.06, 0.22, { frente: MAD[2], topo: madeira() });
    for (const yy of [0.62, 0.86]) caixa(g, x, yy, z - 0.32, 1.9, 0.16, 0.06, { frente: madeira(), tras: madeira() });
    caixa(g, x - 0.75, 0.45, z - 0.32, 0.08, 0.6, 0.06, { frente: '#3a3a4a' }); caixa(g, x + 0.75, 0.45, z - 0.32, 0.08, 0.6, 0.06, { frente: '#3a3a4a' });
    sombra(g, x, z, 1.9, 0.6, 0.25);
  },
  poste(g, o, ctx) {
    cilindro(g, o.x, 0, o.z, 0.18, 0.22, 0.25, '#2a2a38', { seg: 6 });
    cilindro(g, o.x, 0.25, o.z, 0.07, 0.07, 3.3, '#3a3a4a', { seg: 6 });
    caixa(g, o.x, 3.5, o.z, 0.5, 0.35, 0.5, { frente: ctx.noite ? '#fff0b0' : '#d8d0a0', emissiva: ctx.noite, topo: '#2a2a38', lado: ctx.noite ? '#fff0b0' : '#c8c090' });
    caixa(g, o.x, 3.85, o.z, 0.65, 0.1, 0.65, { frente: '#2a2a38' });
    if (ctx.noite) luz(ctx, o.x, 3.4, o.z + 0.3, '#ffe0a0', 2.2, 8);
  },
  hidrante(g, o) {
    cilindro(g, o.x, 0, o.z, 0.2, 0.22, 0.6, '#d83a3a'); cilindro(g, o.x, 0.6, o.z, 0.14, 0.2, 0.15, '#a82a2a');
    caixa(g, o.x, 0.3, o.z, 0.6, 0.12, 0.12, { frente: '#c83030' });
  },
};

// Constrói a lista de objetos no grupo e devolve as luzes pedidas (o palco cria as PointLights).
export function construirObjetos(g, lista, ctx) {
  for (const o of lista || []) {
    const f = OBJETOS_3D[o.tipo];
    if (f) f(g, o, ctx);
  }
}
