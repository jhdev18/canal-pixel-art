// Casa em DIORAMA (pixel art isométrica 2:1): cômodos "recortados" sobre uma base de madeira,
// com duas paredes ao fundo. Cada cômodo é um sprite grande; os personagens andam na linha do meio do piso.
//   u = ao longo da parede ESQUERDA (0 = canto do fundo, N = ponta da frente)
//   v = ao longo da parede DIREITA
//   h = altura
// Personagens da casa: mae, mae-avental, menino-topete (gerador de pessoas de moradores.js).
import { Pix, hexParaRgb, bayer } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { pessoaComSentado as pessoa } from './moradores.js';

const K = '#1a1c2c';
export const N = 48, HW = 56, T = 4, BASE = 10;
export const W = 4 * N + 4 * T + 4, H = 2 * N + BASE + 2 * T + HW + 4;
const CX = W / 2, YB = 2 + 2 * T + HW;
// linha do meio do piso (onde ficam os pés) medida a partir da base do sprite, em pixels
export const PISO_DA_BASE = H - (YB + N);

const proj = (u, v, h) => [CX - 2 * u + 2 * v, YB + u + v - h];
const paraHex = (rgb) => '#' + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hexParaRgb(a), B = hexParaRgb(b); return paraHex(A.map((c, i) => c + (B[i] - c) * t)); };
const claro = (c, t = 0.25) => mix(c, '#fff8ec', t);
const escuro = (c, t = 0.3) => mix(c, '#1e1630', t);
const tonsDe = (c) => ({ topo: claro(c, 0.2), esq: c, dir: escuro(c, 0.18), aresta: escuro(c, 0.55) });
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

class Diorama {
  constructor(noite) { this.p = new Pix(W, H); this.br = new Pix(W, H); this.noite = noite; this.luzes = []; }
  pinta(x, y, c, brilho) {
    if (c == null) return;
    const cor = typeof c === 'object' ? c.c : c;
    this.p.set(x, y, cor);
    if (brilho || (typeof c === 'object' && c.brilho)) this.br.set(x, y, cor);
  }
  varrer(pts, fn) {
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const x0 = Math.max(0, Math.floor(Math.min(...xs)) - 1), x1 = Math.min(W - 1, Math.ceil(Math.max(...xs)) + 1);
    const y0 = Math.max(0, Math.floor(Math.min(...ys)) - 1), y1 = Math.min(H - 1, Math.ceil(Math.max(...ys)) + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) fn(x, y, x + 0.5, y + 0.5);
  }
  // decalque numa parede ('esq': s = u, 'dir': s = v)
  parede(lado, s0, s1, h0, h1, cor, brilho = false) {
    const P = (s, h) => (lado === 'esq' ? proj(s, 0, h) : proj(0, s, h));
    this.varrer([P(s0, h0), P(s1, h0), P(s0, h1), P(s1, h1)], (x, y, px, py) => {
      const s = lado === 'esq' ? (CX - px) / 2 : (px - CX) / 2, h = YB + s - py;
      if (s < s0 || s >= s1 || h < h0 || h >= h1) return;
      this.pinta(x, y, typeof cor === 'function' ? cor(s - s0, h - h0, x, y) : cor, brilho);
    });
  }
  // decalque no chão (ou num plano horizontal na altura h)
  chao(u0, u1, v0, v1, cor, h = 0, brilho = false) {
    this.varrer([proj(u0, v0, h), proj(u1, v0, h), proj(u0, v1, h), proj(u1, v1, h)], (x, y, px, py) => {
      const dx = px - CX, dy = py - YB + h, v = (dy + dx / 2) / 2, u = (dy - dx / 2) / 2;
      if (u < u0 || u >= u1 || v < v0 || v >= v1) return;
      this.pinta(x, y, typeof cor === 'function' ? cor(u - u0, v - v0, x, y) : cor, brilho);
    });
  }
  // caixa: topo (h1), face esquerda (u = u1, vira para baixo-esquerda) e face direita (v = v1)
  caixa(u0, u1, v0, v1, h0, h1, cores, { aresta = true, brilho = false } = {}) {
    const C = typeof cores === 'string' ? tonsDe(cores) : { ...tonsDe(cores.base || '#888888'), ...cores };
    const mapa = new Map();
    this.varrer([proj(u0, v0, h1), proj(u1, v0, h1), proj(u0, v1, h1), proj(u1, v1, h1), proj(u1, v0, h0), proj(u0, v1, h0), proj(u1, v1, h0)], (x, y, px, py) => {
      const dx = px - CX;
      let face = 0, a = 0, b = 0;
      let dy = py - YB + h1, v = (dy + dx / 2) / 2, u = (dy - dx / 2) / 2;
      if (u >= u0 && u < u1 && v >= v0 && v < v1) { face = 1; a = u - u0; b = v - v0; }
      else {
        v = (dx + 2 * u1) / 2; let h = YB + u1 + v - py;
        if (v >= v0 && v < v1 && h >= h0 && h < h1) { face = 2; a = v - v0; b = h - h0; }
        else {
          u = (2 * v1 - dx) / 2; h = YB + u + v1 - py;
          if (u >= u0 && u < u1 && h >= h0 && h < h1) { face = 3; a = u - u0; b = h - h0; }
        }
      }
      if (!face) return;
      const f = face === 1 ? C.topo : face === 2 ? C.esq : C.dir;
      const c = typeof f === 'function' ? f(a, b, x, y) : f;
      if (c == null) return;
      this.pinta(x, y, c, brilho);
      mapa.set(y * W + x, face);
    });
    if (!aresta) return;
    const realce = typeof C.topo === 'string' ? claro(C.topo, 0.35) : null;
    for (const [i, face] of mapa) {
      const x = i % W, y = (i / W) | 0;
      const viz = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => mapa.get((y + dy) * W + x + dx));
      if (viz.some((f) => f === undefined)) this.pinta(x, y, C.aresta, brilho);
      else if (face === 1 && viz[2] !== 1 && realce) this.pinta(x, y, realce, brilho);
    }
  }
  luz(u, v, h, alcance = 70) { const [x, y] = proj(u, v, h); this.luzes.push({ x, y, alcance }); }
  // bolha de folhas / frutas em coordenadas de tela
  bolha(u, v, h, r, cores) {
    const [cx, cy] = proj(u, v, h);
    this.p.circulo(cx, cy, r, (x, y, dx, dy) => (dx + dy < -0.5 ? cores[0] : dx + dy > 0.6 ? cores[2] : cores[1]));
  }
  finalizar() {
    if (this.noite) {
      const d = this.p.d, b = this.br.d;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (!d[i + 3] || b[i + 3]) continue;
        let g = 0;
        for (const L of this.luzes) g = Math.max(g, 1 - Math.hypot(x - L.x, (y - L.y) * 1.3) / L.alcance);
        g = Math.max(0, Math.min(1, Math.floor(Math.max(0, g) * 4 + bayer(x, y)) / 4));
        const k = 0.36 + 0.64 * g;
        d[i] = Math.min(255, d[i] * k * (0.82 + 0.26 * g));
        d[i + 1] = Math.min(255, d[i + 1] * k * (0.88 + 0.1 * g));
        d[i + 2] = Math.min(255, d[i + 2] * k * (1.22 - 0.3 * g));
      }
    }
    this.p.contorno(K);
    return { cor: this.p, brilho: this.br };
  }
}

// ---------------------------------------------------------------- peças comuns
function estrutura(d, { piso, paredeE, paredeD, rodape = '#7a4a32', moldura = '#f4ecdc', laje = '#6a4632' }) {
  // base de madeira (laje) com o piso por cima
  const lado = (esc) => (a, h) => (h >= BASE - 2 ? escuro(rodape, esc) : h >= BASE - 4 ? claro(laje, 0.25 - esc) : (h < 1 ? escuro(laje, 0.35 + esc) : escuro(laje, esc)));
  d.caixa(-T, N, -T, N, -BASE, 0, { topo: (a, b, x, y) => piso(a - T, b - T, x, y), esq: lado(0), dir: lado(0.18), aresta: '#2a1a22' });
  // paredes (a direita primeiro: o canto fica nela)
  const corte = { topo: moldura, esq: escuro(moldura, 0.12), dir: escuro(moldura, 0.22), aresta: '#4a3a44' };
  d.caixa(-T, 0, -T, N, 0, HW, { ...corte, esq: (a, h, x, y) => paredeD(a - T, h, x, y) });
  d.caixa(0, N, -T, 0, 0, HW, { ...corte, dir: (a, h, x, y) => escuro(paredeE(a, h, x, y), 0.08) });
  // rodapé e friso no alto
  for (const l of ['esq', 'dir']) {
    d.parede(l, 0, N, 0, 3, (a, h) => (h >= 2 ? claro(rodape, 0.2) : rodape));
    d.parede(l, 0, N, HW - 4, HW - 2, moldura);
  }
}

function janela(d, lado, s0, s1, h0, h1, { cortina = '#c84a5a', vista = 'arvores' } = {}) {
  const noite = d.noite, L = s1 - s0, A = h1 - h0;
  d.parede(lado, s0 - 1, s1 + 1, h0 - 2, h1 + 2, '#f4ecdc');
  d.parede(lado, s0, s1, h0, h1, (a, b, x, y) => {
    if (Math.abs(a - L / 2) < 0.5 || Math.abs(b - A / 2) < 0.8) return '#e8dcc8';
    if (noite) {
      if (hash(x, y) > 0.965) return '#f0f0ff';
      return b > A * 0.55 ? '#141a40' : '#1e2a5a';
    }
    if (vista === 'arvores' && b < 5 + Math.round(Math.sin(a * 1.3) * 1.6)) return b < 2 ? '#3a7a46' : '#5aa05a';
    if ((Math.round(a * 2) + Math.round(b)) % 13 < 2) return '#f2fbff';
    return b > A * 0.6 ? '#a8d8f4' : '#c8ecfa';
  });
  if (cortina) {
    const dobra = (a) => (Math.floor(a * 2) % 3 === 0 ? escuro(cortina, 0.25) : Math.floor(a * 2) % 3 === 1 ? cortina : claro(cortina, 0.15));
    d.parede(lado, s0 - 4, s0, h0 - 6, h1 + 3, dobra);
    d.parede(lado, s1, s1 + 4, h0 - 6, h1 + 3, dobra);
    d.parede(lado, s0 - 5, s1 + 5, h1 + 3, h1 + 4, '#5a3a2a');
  }
  if (lado === 'esq') d.caixa(s0 - 1, s1 + 1, 0, 2, h0 - 4, h0 - 2, '#f0e6d4', { aresta: false });
  else d.caixa(0, 2, s0 - 1, s1 + 1, h0 - 4, h0 - 2, '#f0e6d4', { aresta: false });
}

function quadro(d, lado, s0, s1, h0, h1, desenho) {
  const L = s1 - s0, A = h1 - h0;
  d.parede(lado, s0, s1, h0, h1, (a, b, x, y) => (a < 0.75 || a > L - 0.75 || b < 1.5 || b > A - 1.5 ? '#8a5a2a' : desenho(a, b, L, A, x, y)));
}

const tabuas = (c1, c2, linha) => (u, v) => {
  const fila = Math.floor(u / 4), off = (fila * 7) % 16;
  if (u - fila * 4 < 0.5 || ((v + off) % 16 + 16) % 16 < 0.5) return linha;
  const t = hash(fila, Math.floor((v + off) / 16));
  return t < 0.33 ? c1 : t < 0.66 ? c2 : mix(c1, c2, 0.5);
};
const papelListrado = (c1, c2) => (s, h) => (Math.floor(s / 3) % 2 ? c1 : (h % 8 < 1 && Math.floor(s) % 6 === 4 ? c1 : c2));
const azulejo = (c, linha, tam = 4) => (s, h) => ((s % tam) < 0.5 || (h % tam) < 1 ? linha : c);

// ---------------------------------------------------------------- SALA DE ESTAR
function sala(noite) {
  const d = new Diorama(noite);
  const parede = papelListrado('#e8c89a', '#dcb684');
  estrutura(d, { piso: tabuas('#b07848', '#a06a3e', '#7a4a2a'), paredeE: parede, paredeD: parede });
  // tapete
  d.chao(16, 42, 14, 40, (a, b) => {
    if (a < 1.5 || b < 1.5 || a > 24.5 || b > 24.5) return '#e8c860';
    if (a < 2.5 || b < 2.5 || a > 23.5 || b > 23.5) return '#a83a3a';
    return (Math.abs(a - 13) + Math.abs(b - 13)) % 8 < 1.2 ? '#e8c860' : '#3a5a9a';
  });
  // parede esquerda: janela, sofá, quadro
  janela(d, 'esq', 18, 32, 24, 44, { cortina: '#3a8a8a' });
  quadro(d, 'esq', 39, 46, 26, 40, (a, b, L, A) => (b < A * 0.4 ? '#5a9a4a' : b < A * 0.55 + (a % 3) ? '#8aa8c8' : '#d8e8f4'));
  const sofa = '#c8584a';
  d.caixa(14, 36, 0, 4, 7, 18, sofa);
  d.caixa(12, 15, 0, 11, 0, 12, escuro(sofa, 0.06));
  d.caixa(14, 36, 0, 11, 0, 7, { base: sofa, topo: (a) => (a % 7.3 < 0.6 ? escuro(sofa, 0.1) : claro(sofa, 0.2)) });
  d.caixa(17, 21, 4, 6, 7, 12, '#e8c050');
  d.caixa(29, 33, 4, 6, 7, 12, '#e8c050');
  d.caixa(35, 38, 0, 11, 0, 12, escuro(sofa, 0.06));
  // abajur no canto
  d.caixa(3, 4, 3, 4, 0, 26, '#3a3a44', { aresta: false });
  d.caixa(1, 6, 1, 6, 26, 33, { base: '#f0d890', topo: '#fff0b0' }, { brilho: noite });
  d.luz(3.5, 3.5, 30, 80);
  // parede direita: relógio, rack com TV, planta
  d.parede('dir', 6, 12, 36, 46, (a, b) => {
    const r = ((a - 3) / 3) ** 2 + ((b - 5) / 5) ** 2;
    if (r > 1) return null;
    if (r > 0.6) return '#7a4a2a';
    if ((Math.abs(a - 3) < 0.5 && b > 5 && b < 9) || (Math.abs(b - 5) < 0.8 && a > 3 && a < 5)) return '#2a2a36';
    return '#f4f0e0';
  });
  d.caixa(0, 9, 14, 34, 0, 9, { base: '#8a5a3a', esq: (a, b) => (a % 10 < 0.5 || b < 1 ? '#5a3a24' : (Math.abs(a % 10 - 5) < 0.6 && Math.abs(b - 5) < 1 ? '#e8c860' : '#8a5a3a')) });
  d.caixa(1, 3, 16, 32, 9, 23, {
    base: '#2a2a36', topo: '#3a3a48',
    esq: (a, b) => (a > 1 && a < 15 && b > 1.5 && b < 12.5 ? (noite ? { c: (Math.round(a * 2) + Math.round(b)) % 9 < 2 ? '#a8d0ff' : '#6a9ae0', brilho: true } : ((Math.round(a * 2) + Math.round(b)) % 11 < 2 ? '#6a7a9a' : '#3a4a6a')) : '#2a2a36'),
  });
  if (noite) d.luz(3, 24, 16, 34);
  d.caixa(1, 6, 38, 43, 0, 7, '#c86a3a');
  d.bolha(3.5, 40.5, 13, 5, ['#7ac85a', '#4a9a4a', '#2e6a3a']);
  d.bolha(2, 42.5, 17, 3.6, ['#8ad86a', '#5aa85a', '#2e6a3a']);
  return d.finalizar();
}

// ---------------------------------------------------------------- COZINHA
function cozinha(noite) {
  const d = new Diorama(noite);
  const parede = (s, h) => (h < 22 ? azulejo('#e4eef4', '#b8ccd8')(s, h) : h < 24 ? '#5a8aa8' : (hash(Math.floor(s * 2), Math.floor(h)) < 0.04 ? '#e8dcbc' : '#f2e6c8'));
  estrutura(d, { piso: (u, v) => ((Math.floor(u / 6) + Math.floor(v / 6)) % 2 ? '#e8e2d4' : '#4a6a8a'), paredeE: parede, paredeD: parede, rodape: '#4a6a8a' });
  // parede esquerda: janela, mesa, geladeira
  janela(d, 'esq', 12, 26, 28, 44, { cortina: '#e8a040' });
  d.chao(10, 30, 2, 20, (a, b) => ((Math.floor(a / 2) + Math.floor(b / 2)) % 2 ? '#d84a4a' : '#f4f0e8'), 0);
  const madeira = '#b07a4a';
  for (const [u, v] of [[12, 7], [25, 7], [12, 15], [25, 15]]) d.caixa(u, u + 1, v, v + 1, 0, 11, escuro(madeira, 0.2), { aresta: false });
  d.caixa(11, 27, 6, 17, 11, 13, madeira);
  d.bolha(18, 11, 15, 2.4, ['#ff6a5a', '#e83a3a', '#a82a2a']);
  d.bolha(20, 13, 15, 2.2, ['#f8e070', '#f0c030', '#b88a20']);
  d.caixa(17, 22, 18, 22, 0, 7, '#c84a3a');
  d.caixa(21, 22, 18, 22, 7, 16, '#c84a3a');
  const branco = '#e8eef2';
  d.caixa(34, 44, 0, 11, 0, 46, {
    base: branco, topo: '#f4f8fa',
    dir: (a, b) => {
      if (Math.abs(b - 30) < 0.8) return '#a8b4c0';
      if (a > 1 && a < 2 && ((b > 20 && b < 27) || (b > 33 && b < 39))) return '#8a96a4';
      if ((a > 5 && a < 6.5 && b > 34 && b < 37)) return '#e84a4a';
      if ((a > 7 && a < 8.5 && b > 36 && b < 39)) return '#4a8ae8';
      return branco;
    },
  });
  // parede direita: armários, pia, fogão, coifa
  const arm = '#5a9a7a';
  d.caixa(0, 6, 4, 30, 30, 46, { base: arm, esq: (a, b) => (a % 6.5 < 0.5 ? escuro(arm, 0.35) : Math.abs(a % 6.5 - 5.5) < 0.6 && b > 2 && b < 6 ? '#e8e0c8' : arm) });
  d.caixa(0, 10, 4, 34, 0, 16, { base: arm, esq: (a, b) => (a % 7.5 < 0.5 || b < 1.2 ? escuro(arm, 0.35) : Math.abs(a % 7.5 - 6.5) < 0.6 && b > 10 && b < 14 ? '#e8e0c8' : arm) });
  d.caixa(0, 11, 3, 35, 16, 18, { base: '#e8e0d0', topo: (a, b) => (a > 2 && a < 8 && b > 15 && b < 24 ? (a > 2.8 && a < 7.2 && b > 16 && b < 23 ? '#7a8898' : '#b8c4d0') : '#f2ece0') });
  d.caixa(0, 2, 19.5, 21, 18, 24, '#b8c0cc', { aresta: false });
  d.caixa(0, 10, 35, 45, 0, 17, {
    base: '#f0f0f4', topo: (a, b) => { for (const [cu, cv] of [[3, 3], [3, 7], [7, 3], [7, 7]]) if ((a - cu) ** 2 + (b - cv) ** 2 < 2.6) return (a - cu) ** 2 + (b - cv) ** 2 < 1 ? '#3a3a40' : '#6a6a74'; return '#2a2a30'; },
    esq: (a, b) => (a > 1.5 && a < 8.5 && b > 3 && b < 11 ? (noite ? '#3a3a44' : '#4a4a56') : Math.abs(b - 12.5) < 0.6 && a > 2 && a < 8 ? '#a8a8b4' : '#f0f0f4'),
  });
  d.caixa(5, 9, 37, 41, 17, 20, '#7a7a88');
  d.caixa(0, 7, 35, 45, 40, 49, { base: '#c8ccd4', topo: '#dde0e6' });
  d.chao(1, 7, 36, 44, (a, b) => (noite ? { c: '#fff0b0', brilho: true } : '#a8acb8'), 39.9, noite);
  d.luz(4, 40, 30, 70);
  // panelas penduradas na parede esquerda
  for (const [s, cor] of [[3, '#b8c0cc'], [6.5, '#c86a3a']]) {
    d.parede('esq', s, s + 0.5, 34, 40, '#5a5a64');
    d.parede('esq', s - 1.8, s + 2.3, 28, 34, (a, b) => (((a - 2) / 2) ** 2 + ((b - 3) / 3.2) ** 2 < 1 ? cor : null));
  }
  return d.finalizar();
}

// ---------------------------------------------------------------- QUARTO (do protagonista)
function quarto(noite) {
  const d = new Diorama(noite);
  const parede = (s, h) => (hash(Math.floor(s), Math.floor(h / 3)) > 0.93 ? '#c8dcf4' : (Math.floor(s / 4) + Math.floor(h / 8)) % 2 ? '#8aaad8' : '#7e9ed0');
  estrutura(d, { piso: tabuas('#c89a68', '#b88a5a', '#8a5a3a'), paredeE: parede, paredeD: parede, rodape: '#f0e6d4', moldura: '#f4ecdc' });
  d.chao(18, 40, 18, 40, (a, b) => { const r = ((a - 11) / 11) ** 2 + ((b - 11) / 11) ** 2; return r > 1 ? null : r > 0.7 ? '#f0c040' : r > 0.35 ? '#e86a3a' : '#f0c040'; });
  // parede esquerda: janela, cama, pôster
  janela(d, 'esq', 16, 30, 28, 44, { cortina: '#f0c040' });
  quadro(d, 'esq', 37, 46, 16, 40, (a, b, L, A) => {
    const cx = L / 2, cy = A / 2 + 2;
    if (Math.abs(a - cx) + Math.abs(b - cy) / 2 < 2.2) return '#f8e060';
    return b < 5 ? '#e83a5a' : '#2a2a5a';
  });
  const cama = '#8a5a3a';
  d.caixa(8, 10, 0, 14, 0, 18, cama);
  d.caixa(10, 34, 0, 14, 0, 5, cama);
  d.caixa(10, 34, 0, 13, 5, 10, { base: '#3a7ac8', topo: (a, b) => (Math.floor(a / 4) % 2 ? '#5a9ae0' : '#4a8ad8'), esq: (a, b) => (b < 1 ? '#2a5a9a' : '#3a7ac8'), dir: (a, b) => (b < 1 ? '#22508a' : '#3270b8') });
  d.caixa(11, 16, 1, 12, 10, 13, '#f4f0e8');
  // parede direita: prateleira com livros, mesa com computador, cadeira, baú
  d.caixa(0, 4, 6, 16, 30, 31.5, '#8a5a3a');
  let v = 6.5;
  for (const [larg, alt, cor] of [[1, 6, '#c83a3a'], [1, 7, '#3a8ac8'], [1.5, 5, '#e8c040'], [1, 6.5, '#4aa85a'], [1, 5.5, '#8a4ac8']]) { d.caixa(0.5, 3, v, v + larg, 31.5, 31.5 + alt, cor, { aresta: false }); v += larg + 0.2; }
  const mesa = '#c89a5a';
  for (const vv of [18, 33]) d.caixa(8, 9, vv, vv + 1, 0, 12, escuro(mesa, 0.2), { aresta: false });
  d.caixa(0, 9, 28, 34, 6, 12, escuro(mesa, 0.06));
  d.caixa(0, 10, 18, 34, 12, 14, mesa);
  d.caixa(1, 3, 21, 30, 14, 23, {
    base: '#2a2a36', topo: '#3a3a48',
    esq: (a, b) => (a > 0.8 && a < 8.2 && b > 1.5 && b < 8 ? (noite ? { c: b > 6 ? '#a8e0ff' : '#5aa0e8', brilho: true } : (b > 6 ? '#6a8ab0' : '#3a5a8a')) : '#2a2a36'),
  });
  d.caixa(3, 5, 24, 27, 14, 15, '#3a3a48', { aresta: false });
  d.caixa(1, 3, 31, 33, 14, 19, '#3a3a44', { aresta: false });
  d.caixa(1, 4.5, 30.5, 33.5, 19, 22, { base: '#f0c040', topo: '#ffe080' }, { brilho: noite });
  d.luz(2.5, 32, 18, 60);
  if (noite) d.luz(2, 25.5, 18, 36);
  d.caixa(11, 12, 25, 27, 0, 6, '#3a3a44', { aresta: false });
  d.caixa(9, 14, 23, 29, 6, 8, '#d84a4a');
  d.caixa(13, 14.5, 23, 29, 8, 17, '#d84a4a');
  d.caixa(0, 6, 38, 46, 0, 8, { base: '#e0a040', esq: (a, b) => (Math.abs(b - 5) < 0.7 ? '#8a5a2a' : '#e0a040'), dir: (a, b) => (Math.abs(b - 5) < 0.7 ? '#6a4a22' : '#c08830') });
  d.bolha(8, 42, 2.5, 2.5, ['#ffffff', '#e8e8f0', '#3a3a48']);
  quadro(d, 'dir', 38, 46, 20, 38, (a, b, L, A) => (b > A - 7 ? '#f8f0e0' : (Math.floor(a) + Math.floor(b / 2)) % 2 ? '#4ac0a0' : '#3aa088'));
  return d.finalizar();
}

// ---------------------------------------------------------------- BANHEIRO
function banheiro(noite) {
  const d = new Diorama(noite);
  const parede = (s, h) => (h < 34 ? azulejo('#d8eef0', '#9ac0c8')(s, h) : h < 36 ? '#3a8aa0' : '#eaf4f4');
  estrutura(d, { piso: (u, v) => ((u % 3) < 0.5 || (v % 3) < 0.5 ? '#a8b8c0' : '#e8eef0'), paredeE: parede, paredeD: parede, rodape: '#3a8aa0' });
  d.chao(16, 28, 15, 22, (a, b) => (a < 0.8 || b < 0.8 || a > 11.2 || b > 6.2 ? '#3a8aa8' : '#5ab0d0'));
  // parede esquerda: chuveiro, banheira, janelinha
  d.parede('esq', 8, 8.5, 18, 44, '#a8b0bc');
  d.caixa(6, 11, 0, 3, 42, 44, '#b8c0cc');
  const louca = '#f4f4f6';
  d.caixa(5, 32, 0, 13, 0, 12, {
    base: louca, topo: (a, b) => (a > 1.5 && a < 25.5 && b > 1.5 && b < 11.5 ? ((Math.round(a * 2) + Math.round(b * 2)) % 9 < 1 ? '#c8eaf8' : '#8acce8') : '#ffffff'),
  });
  d.bolha(20, 7, 13.5, 1.8, ['#fff080', '#f0d020', '#c09010']);
  d.parede('esq', 34, 44, 34, 46, (a, b) => (a < 0.75 || a > 9.25 || b < 1.5 || b > 10.5 ? '#f4ecdc' : (Math.round(a * 2) + Math.round(b)) % 3 === 0 ? (noite ? '#3a4a70' : '#e8f6fa') : (noite ? '#2a3458' : '#c8e4ec')));
  // parede direita: toalha, espelho, pia, vaso
  d.parede('dir', 8, 18, 30, 31, '#a8b0bc');
  d.parede('dir', 9, 17, 18, 30, (a, b) => (Math.abs(b - 3) < 1 ? '#f4f0e8' : '#e06a5a'));
  d.parede('dir', 20, 30, 24, 42, (a, b) => (a < 0.75 || a > 9.25 || b < 1.5 || b > 16.5 ? '#c8a050' : (Math.round(a * 2) - Math.round(b * 0.5) + 40) % 9 < 1 ? '#f0fcff' : '#bfe6ee'));
  d.caixa(0, 2, 23, 27, 42, 44, { base: '#fff0b0', topo: '#fff8d0' }, { brilho: noite });
  d.luz(1, 25, 43, 70);
  d.caixa(0, 5, 22, 28, 0, 14, louca);
  d.caixa(0, 9, 20, 30, 14, 18, { base: louca, topo: (a, b) => (a > 2.5 && a < 7.5 && b > 2 && b < 8 ? '#b8d8e4' : '#ffffff') });
  d.caixa(0, 2, 24, 25.5, 18, 22, '#b8c0cc', { aresta: false });
  d.caixa(0, 3, 34, 42, 8, 20, louca);
  d.caixa(2, 10, 35, 41, 0, 9, { base: louca, topo: (a, b) => (a > 1.5 && a < 6.5 && b > 1 && b < 5 ? '#c8dce4' : '#ffffff') });
  return d.finalizar();
}

function comoSprite(fab, noite) {
  return () => { const r = fab(noite); return { quadros: [r.cor], brilho: [r.brilho], anims: { parado: { q: [0] } }, sombra: false, semLuz: true }; };
}

export const COMODOS = { sala, cozinha, quarto, banheiro };

export const MORADORES_CASA = {
  mae: { cores: { pele: '#b07450', cabelo: '#2a1a14', tronco: '#b8405a', calca: '#2e4a7a', sapato: '#5a3424' },
    cabelo: 'cacheado', baixo: 'saia-longa', brincos: true, colar: '#f0d070' },
  'mae-avental': { cores: { pele: '#b07450', cabelo: '#2a1a14', tronco: '#b8405a', calca: '#2e4a7a', sapato: '#5a3424', avental: '#f4ecd8' },
    cabelo: 'cacheado', baixo: 'saia-longa', brincos: true, colar: '#f0d070', avental: true },
  'menino-topete': { cores: { pele: '#f0c4a0', cabelo: '#e0602a', tronco: '#2a2a3a', casaco: '#2a8a7a', calca: '#3a4a7a', sapato: '#d83a3a', cachecol: '#f0b830' },
    cabelo: 'topete', mecha: '#fff4e0', casaco: true, cachecol: true, curativo: true, sardas: true, baixo: 'calca', corpo: 'crianca' },
};

registrarSprites({
  ...Object.fromEntries(Object.entries(COMODOS).flatMap(([k, f]) => [[`casa-${k}`, comoSprite(f, false)], [`casa-${k}-noite`, comoSprite(f, true)]])),
  ...Object.fromEntries(Object.entries(MORADORES_CASA).map(([k, p]) => [k, () => pessoa(p)])),
}, { grupo: 'Casa (cômodos em diorama) e família', status: 'protótipo' });
