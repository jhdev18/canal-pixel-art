// Interior (cômodo) em diagonal DESENHADO em pixel art, na mesma projeção 2:1 da rua diagonal.
// Corte de casa de bonecas: parede do fundo (i = 0) e parede lateral à direita (no fim do cômodo),
// piso com borda cortada na frente. A câmera fica sempre de frente; a diagonal está no desenho.
// Cada móvel é desenhado numa camada própria, para os personagens passarem na frente ou atrás dele.
//
// Coordenadas (como na rua): i = profundidade (0 = parede do fundo, cresce para a frente/baixo-direita),
// j = ao longo do cômodo (j = -x do roteiro). Altura em pixels.
import { bayer, hexParaRgb } from '../pixel.js';
import { rng } from '../compartilhado/util.js';
import { PRESETS_INTERIORES } from './interiores.js';

// i dos personagens com z = 0 (perto da frente) e centro da câmera; P = borda da frente do piso.
export const COMODO = { frente: 4.2, meio: 2.5 };
let ALT = 200;            // altura das paredes (px): passa do alto da tela, para não aparecer o vazio em cima
const PX_ALT = 16;

class Camada {
  constructor(g) { Object.assign(this, g); const N = g.W * g.H; this.cor = new Float32Array(N * 3); this.pi = new Float32Array(N); this.pj = new Float32Array(N); this.ph = new Float32Array(N); this.tipo = new Uint8Array(N); this.face = new Float32Array(N).fill(1); this.prof = new Float32Array(N).fill(-1e9); }
  pintar(x, y, hex, i, j, h, t = 1, f = 1) {
    x = Math.round(x); y = Math.round(y);
    if (hex == null || x < 0 || y < 0 || x >= this.W || y >= this.H) return;
    const k = y * this.W + x;
    // profundidade: ao longo do raio da câmera i, j e h crescem juntos; o ponto mais perto (maior) vence,
    // então a ordem em que as peças de um móvel são pintadas não importa
    const d = i + j + h / 16;
    if (d < this.prof[k] - 0.02) return;
    this.prof[k] = d;
    const [r, g, b] = hexParaRgb(hex);
    this.cor[k * 3] = r / 255; this.cor[k * 3 + 1] = g / 255; this.cor[k * 3 + 2] = b / 255;
    this.pi[k] = i; this.pj[k] = j; this.ph[k] = h; this.tipo[k] = t; this.face[k] = f;
  }
  // Prisma com faces visíveis: frente (plano i = i1), lado (plano j = j1) e topo.
  // Cada função devolve uma cor, [cor, 2] para emissivo, ou null para não pintar.
  prisma(i0, i1, j0, j1, h0, h, pint) {
    const { W, H, OX, OY } = this;
    const put = (x, y, v, i, j, hh, f) => { if (v == null) return; const [c, t] = Array.isArray(v) ? v : [v, 1]; this.pintar(x, y, c, i, j, hh, t, f); };
    const fr = pint.frente, la = pint.lado, to = pint.topo;
    if (fr) for (let x = 0; x < W; x++) {
      const s = i1 - (x - OX) / 16;
      if (s < j0 || s > j1) continue;
      const base = (i1 + s) * 8 + OY - h0, u = (s - j0), larg = (j1 - j0);
      for (let t = 0; t < h; t++) put(x, Math.round(base - t), fr(u, t, larg, s), i1, s, h0 + t, 1);
    }
    if (la) for (let x = 0; x < W; x++) {
      const s = (x - OX) / 16 + j1;
      if (s < i0 || s > i1) continue;
      const base = (s + j1) * 8 + OY - h0, u = (s - i0), larg = (i1 - i0);
      for (let t = 0; t < h; t++) put(x, Math.round(base - t), la(u, t, larg, s), s, j1, h0 + t, 0.8);
    }
    if (to) {
      const yT0 = Math.floor((i0 + j0) * 8 + OY - h0 - h) - 2, yT1 = Math.ceil((i1 + j1) * 8 + OY - h0 - h) + 2;
      for (let y = Math.max(0, yT0); y < Math.min(H, yT1); y++) for (let x = 0; x < W; x++) {
        const X = (x - OX) / 16, Y = (y + h0 + h - OY) / 8, i = (Y + X) / 2, j = (Y - X) / 2;
        if (i < i0 || i > i1 || j < j0 || j > j1) continue;
        put(x, y, to(i - i0, j - j0, Math.min(i - i0, i1 - i, j - j0, j1 - j), x, y), i, j, h0 + h, 1.06);
      }
    }
  }
  // Caixa de cores lisas (lado e topo derivados da frente se não vierem).
  caixa(i0, i1, j0, j1, h0, h, c) {
    const f = typeof c === 'string' ? { frente: c } : c;
    const fn = (v) => (typeof v === 'function' ? v : () => v);
    const fr = fn(f.frente);
    this.prisma(i0, i1, j0, j1, h0, h, { frente: fr, lado: f.lado != null ? fn(f.lado) : fr, topo: f.topo != null ? fn(f.topo) : typeof f.frente === 'function' ? () => null : fr });
  }
}

// Temas de "mundo sombrio": o cômodo vira uma plataforma no escuro, com poucas cores (rampa por
// luminosidade) e contorno brilhante nos móveis. Os personagens continuam com as cores normais.
export const TEMAS = {
  sombrio: { rampa: ['#07040f', '#170c30', '#2c1858', '#4a2c8a', '#7a52c8'], neon: '#4af0e0', acento: '#ff5ad0', contorno: '#9a7ae8', fundo: '#020106', grade: '#0e0820' },
  'sombrio-verde': { rampa: ['#030a08', '#0a2018', '#12382a', '#1e5a40', '#3a8a5a'], neon: '#b0ff60', acento: '#ffe050', contorno: '#5ac888', fundo: '#010403', grade: '#071410' },
  'sombrio-vermelho': { rampa: ['#0c0306', '#280a14', '#481424', '#78203a', '#b03a50'], neon: '#ffb040', acento: '#ff5a5a', contorno: '#e06070', fundo: '#050102', grade: '#1a060c' },
};

const MAD = { claro: '#c89060', base: '#a8703e', esc: '#7a4e2a' };
const LIVROS = ['#c83c4c', '#3a6ac8', '#3aa860', '#f0b830', '#8a4ac8', '#e87a3a', '#4a4a5a'];

// ------------------------------------------------------------------ pintura das paredes
function corParede(cfg, u, t, r) {
  const [cl, cb, cs] = cfg.cor;
  let c = cb;
  if (cfg.padrao === 'listras') c = (u % 16) < 8 ? cb : cl;
  else if (cfg.padrao === 'papel') c = u % 12 === 0 ? cs : ((u + 6) % 12 === 0 && t % 8 === 0) ? cl : cb;
  else if (cfg.padrao === 'estrelas') { const e = ((u % 40) === 20 && (t % 36) === 18) || (((u + 20) % 40) === 0 && (t % 36) === 0) || (u * 7 + t * 13) % 97 === 0; c = e ? cl : cb; }
  else if (r() < 0.02) c = cl;
  const m = cfg.meiaParede;
  if (m && t < m.altura) {
    c = m.cores[1];
    if (m.padrao === 'azulejo') c = (u % 8 === 0 || t % 8 === 0) ? m.cores[2] : m.cores[1];
    if (m.padrao === 'lambri') c = u % 10 === 0 ? m.cores[2] : u % 10 === 1 ? m.cores[0] : m.cores[1];
  }
  if (m && (t === m.altura || t === m.altura + 1)) c = m.cores[2];
  if (m && t === m.altura + 2) c = m.cores[0];
  if (t < 7) c = t === 6 ? cfg.rodape[0] : t < 3 ? cfg.rodape[2] : cfg.rodape[1];
  if (t >= ALT - 4) c = t >= ALT - 2 ? cfg.teto[0] : cfg.teto[1];
  return c;
}

// Decorações pintadas na parede. pos = coordenada ao longo da parede (unidades); t = altura (px).
function corDecor(d, pos, t, noite) {
  const w = d.w, a = pos - (d.x - w / 2);               // a: 0..w da esquerda para a direita
  if (a < 0 || a > w) return null;
  const u = Math.floor(a * 16), U = Math.floor(w * 16);
  if (d.tipo === 'janela') {
    const y0 = d.peitoril ?? 48, h = d.h ?? 36, tt = t - y0;
    const cort = d.cortina && (u < 6 || u > U - 7) && tt > -6 && tt < h + 6;
    if (cort) return (u % 4 === 0) ? d.cortina[1] : d.cortina[0];
    if (d.cortina && tt >= h + 6 && tt < h + 9) return tt === h + 6 ? d.cortina[1] : '#6a5040';
    if (tt < -3 || tt > h + 1) return null;
    if (tt < 0) return tt === -3 ? '#a89a88' : '#e8e0d0';            // peitoril
    if (u < 8 || u > U - 9 || tt > h - 2) return u === 8 || u === U - 9 ? '#b8b0a0' : '#f4f0e8';
    if (Math.abs(u - U / 2) < 1 || Math.abs(tt - h / 2) < 1) return '#f4f0e8';
    const v = tt / h;
    if (noite) { if (tt > h * 0.7 && (u - 9) % 8 === 3) return '#ffe890'; return v > 0.72 ? '#2a3266' : v > 0.4 ? '#1e2650' : '#141a3a'; }
    if (tt < 8 && Math.sin(u * 0.5) * 2 + tt < 6) return '#5a9a5a';
    return v > 0.72 ? '#7ab8ec' : v > 0.4 ? '#9acef4' : '#c4e4fa';
  }
  if (d.tipo === 'porta') {
    const h = d.h ?? 74;
    if (t >= h + 3) return null;
    if (u < 3 || u > U - 4 || t >= h) return '#e8e0d0';
    const c = d.cor || ['#c8a070', '#a87a48', '#6a4a24'];
    if (u === U - 8 && t > 34 && t < 37) return '#f0c840';
    const painel = u > 7 && u < U - 8 && ((t > 8 && t < 32) || (t > 40 && t < h - 8));
    return painel ? ((t === 31 || t === h - 9 || u === U - 9) ? c[2] : c[0]) : c[1];
  }
  if (d.tipo === 'lousa') {
    const y0 = d.altura ?? 28, h = d.h ?? 42, tt = t - y0;
    if (tt < -2 || tt >= h) return null;
    if (tt < 0) return tt === -2 ? MAD.esc : MAD.base;               // calha do giz
    if (u < 3 || u > U - 4 || tt > h - 4) return u === 0 || tt === h - 1 ? MAD.esc : MAD.base;
    const giz = (tt > h - 14 && tt < h - 11 && u > 10 && u < 50 && u % 6 < 4) || (tt > h - 22 && tt < h - 20 && u > 14 && u < 40) ||
      (Math.abs(tt - (12 + Math.sin(u / 4) * 3)) < 0.6 && u > 50 && u < U - 10);
    return giz ? '#e8f0e8' : (bayer(u, tt) < 0.06 ? '#3a6a4a' : '#2e5a3e');
  }
  if (d.tipo === 'quadro' || d.tipo === 'poster' || d.tipo === 'familia' || d.tipo === 'alfabeto' || d.tipo === 'relogio') {
    const y0 = d.altura ?? 64, h = d.h ?? 18, tt = t - y0;
    if (tt < 0 || tt >= h) return null;
    if (d.tipo === 'relogio') { const dx = u - U / 2 + 0.5, dy = tt - h / 2 + 0.5, r2 = dx * dx + dy * dy; if (r2 > (h / 2) ** 2) return null; if (r2 > (h / 2 - 1.5) ** 2) return '#3a3a4a'; return (Math.abs(dx) < 0.6 && dy > 0) || (Math.abs(dy) < 0.6 && dx > 0 && dx < 3) ? '#1a1c2c' : '#f8f4ec'; }
    if (d.tipo === 'alfabeto') { const k = Math.floor(u / 7), cx = u % 7; return cx === 0 ? '#c8c0b0' : (cx > 1 && cx < 5 && tt > 2 && tt < h - 3 && (cx === 2 || tt === 3 || tt === h - 4 || (k % 2 && tt === Math.floor(h / 2)))) ? LIVROS[k % 5] : ['#f8f0d8', '#e8f0f8'][k % 2]; }
    if (u < 2 || u > U - 3 || tt < 2 || tt > h - 3) return u === 0 || tt === h - 1 ? '#c8a050' : '#8a6a2a';
    if (d.tipo === 'poster') { const c = d.cores || ['#c83c4c', '#a82a3c']; const cx = U / 2, cy = h / 2; if ((Math.abs(u - cx) < 1 && Math.abs(tt - cy) < 4) || (Math.abs(tt - cy) < 1 && Math.abs(u - cx) < 4)) return '#f8e060'; return c[Math.floor(tt / 4) % 2]; }
    if (d.tipo === 'familia') { for (const [k, cab] of [[0.25, '#5a3a24'], [0.5, '#2a1e1a'], [0.75, '#c8a040']]) { const cx = U * k, cy = h * 0.55; if ((u - cx) ** 2 + (tt - cy) ** 2 < 5) return '#f0c4a0'; if (Math.abs(u - cx) < 3 && tt > cy + 1 && tt < cy + 4) return cab; if (Math.abs(u - cx) < 3 && tt < cy - 2) return ['#c83c4c', '#3a6ac8', '#3aa860'][Math.round(k * 4) - 1]; } return '#f4e8d0'; }
    if ((u - U + 7) ** 2 + (tt - h + 6) ** 2 < 6) return '#fff0a0';
    return tt < h * 0.35 + Math.sin(u * 0.4) * 2 ? '#5a9a5a' : tt < h * 0.55 + Math.sin(u * 0.25 + 1) * 3 ? '#8ab0d4' : '#c4e0f4';
  }
  return null;
}

// ------------------------------------------------------------------ móveis
// m: { i0, i1, j0, j1 } (pegada no chão). L: camada. luzes: lista para acender (abajur, TV...).
const MOVEIS = {
  'mesa-professor': { di: 1.0, dj: 2.4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 13, { frente: (u, t, l) => (u < 0.1 || u > l - 0.1 || t > 11 ? MAD.esc : ((u > 0.2 && u < 0.8) || (u > l - 0.8 && u < l - 0.2)) && t % 6 === 3 ? '#e8c040' : MAD.base), lado: MAD.esc, topo: MAD.claro });
    L.caixa(i0 + 0.2, i0 + 0.6, j0 + 0.3, j0 + 0.8, 13, 4, { frente: '#3a6ac8', lado: '#2a4a9a', topo: '#f4f0e8' });
    L.caixa(i0 + 0.25, i0 + 0.55, j0 + 0.35, j0 + 0.75, 17, 3, { frente: '#c83c4c', lado: '#8a2a3a', topo: '#f4f0e8' });
    L.caixa(i0 + 0.45, i0 + 0.6, j1 - 0.9, j1 - 0.75, 13, 4, '#d83a3a');                        // maçã
    L.caixa(i0 + 0.3, i0 + 0.45, j1 - 0.5, j1 - 0.35, 13, 5, { frente: '#f4f0e8', topo: '#7a4e2a' });   // caneca
  } },
  carteira: { di: 0.55, dj: 1.1, f(L, m) {                       // mesa do aluno
    const { i0, i1, j0, j1 } = m, cinza = '#6a7080';
    for (const [a, b] of [[i0, j0], [i1 - 0.08, j0], [i0, j1 - 0.08], [i1 - 0.08, j1 - 0.08]]) L.caixa(a, a + 0.08, b, b + 0.08, 0, 10, cinza);
    L.caixa(i0 + 0.05, i1 - 0.05, j0 + 0.05, j1 - 0.05, 5, 3, '#4a5060');
    L.caixa(i0, i1, j0, j1, 10, 2, { frente: MAD.esc, lado: MAD.esc, topo: (a, b) => (a > 0.15 && a < 0.4 && b > 0.3 && b < 0.7 ? '#f4f0e8' : MAD.claro) });
  } },
  cadeira: { di: 0.45, dj: 0.6, f(L, m) {                         // cadeira escolar (encosto na frente: aluno olha para a lousa)
    const { i0, i1, j0, j1 } = m, cinza = '#6a7080';
    for (const [a, b] of [[i0, j0], [i1 - 0.07, j0], [i0, j1 - 0.07], [i1 - 0.07, j1 - 0.07]]) L.caixa(a, a + 0.07, b, b + 0.07, 0, 7, cinza);
    L.caixa(i0, i1, j0, j1, 7, 2, { frente: MAD.esc, topo: MAD.base });
    L.caixa(i1 - 0.08, i1, j0, j1, 9, 11, { frente: (u, t) => (t > 4 ? MAD.base : cinza), topo: MAD.claro });
  } },
  estante: { di: 0.55, dj: 1.7, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, r = rng(ctx.semente + 3), cores = Array.from({ length: 40 }, () => LIVROS[Math.floor(r() * LIVROS.length)]);
    L.caixa(i0, i1, j0, j1, 0, 46, {
      frente: (u, t, l) => { if (u < 0.1 || u > l - 0.1 || t < 2 || t > 43 || t % 11 < 2) return u < 0.1 ? MAD.claro : MAD.base; const k = Math.floor(u * 16 / 3); const alt = 6 + (k * 7) % 4; return (t % 11) - 2 < alt ? (Math.floor(u * 16) % 3 === 0 ? '#2a2030' : cores[(k + Math.floor(t / 11) * 5) % 40]) : '#5a3a20'; },
      lado: MAD.esc, topo: MAD.claro });
  } },
  globo: { di: 0.4, dj: 0.4, f(L, m) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2;
    L.caixa(ci - 0.15, ci + 0.15, cj - 0.15, cj + 0.15, m.h0 ?? 0, 2, MAD.base);
    L.caixa(ci - 0.18, ci + 0.18, cj - 0.18, cj + 0.18, (m.h0 ?? 0) + 3, 9, { frente: (u, t) => (Math.sin(u * 20 + t * 0.6) > 0.3 ? '#4a9a4a' : '#3a7ac8'), lado: (u, t) => (Math.sin(u * 20 + t) > 0.4 ? '#357a3a' : '#2a5a9a'), topo: '#7ab0ec' });
  } },
  cama: { di: 2.4, dj: 1.4, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, tec = ctx.op.tecido || ['#5a8ae0', '#3a6ac8', '#2a4a9a'];
    L.caixa(i0, i1, j0, j1, 0, 6, { frente: MAD.base, lado: MAD.esc, topo: MAD.base });
    L.caixa(i0 + 0.12, i1, j0, j1, 6, 5, { frente: tec[1], lado: (u, t) => (u > 0.75 ? tec[2] : '#d0d4dc'),
      topo: (a, b) => (a > 0.65 ? ((Math.floor(b * 5) % 2) ? tec[1] : tec[0]) : '#f4f4f4') });
    L.caixa(i0 + 0.18, i0 + 0.55, j0 + 0.2, j1 - 0.2, 11, 3, { frente: '#e8eaf0', lado: '#c8ccd8', topo: '#ffffff' });   // travesseiro
    L.caixa(i0, i0 + 0.12, j0, j1, 0, 24, { frente: (u, t) => (t > 20 ? MAD.claro : t % 7 === 0 ? MAD.esc : MAD.base), lado: MAD.esc, topo: MAD.claro });
  } },
  'criado-mudo': { di: 0.6, dj: 0.6, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2, aceso = ctx.op.aceso ?? ctx.noite;
    L.caixa(i0, i1, j0, j1, 0, 13, { frente: (u, t) => (t === 6 ? MAD.esc : t === 9 && Math.abs(u - 0.3) < 0.07 ? '#e8c040' : MAD.base), lado: MAD.esc, topo: MAD.claro });
    L.caixa(ci - 0.05, ci + 0.05, cj - 0.05, cj + 0.05, 13, 6, '#8a6a2a');
    const cup = aceso ? ['#fff0c0', 2] : '#e0c880';
    L.caixa(ci - 0.18, ci + 0.18, cj - 0.18, cj + 0.18, 19, 7, { frente: cup, lado: aceso ? ['#f8e0a0', 2] : '#c0a860', topo: aceso ? ['#fff8e0', 2] : '#f0d890' });
    if (aceso) ctx.luzes.push({ i: ci, j: cj, h: 24, raio: 3.6, forca: 1, cor: '#ffd890' });
  } },
  'bau-brinquedos': { di: 0.6, dj: 1.0, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0 + 0.1, i0 + 0.3, j0 + 0.15, j0 + 0.35, 9, 6, { frente: '#3aa860', topo: '#f8e060' });
    L.caixa(i0 + 0.15, i0 + 0.4, j1 - 0.4, j1 - 0.15, 9, 4, { frente: '#e83a3a', lado: '#f4f4f4', topo: '#f4f4f4' });
    L.caixa(i0, i1, j0, j1, 0, 10, { frente: (u, t, l) => (t > 7 ? '#c07820' : (t > 2 && t < 6 && Math.floor(u * 6) % 2 === 0) ? LIVROS[Math.floor(u * 3) % 5] : '#e8a040'), lado: '#b06a1a', topo: (a, b) => (a < 0.45 ? null : '#d08a30') });
  } },
  escrivaninha: { di: 0.8, dj: 1.8, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ligado = ctx.op.ligado ?? !ctx.noite;
    L.caixa(i0, i1, j0, j0 + 0.6, 0, 11, { frente: (u, t) => (t === 5 ? MAD.esc : (t === 8 || t === 2) && Math.abs(u - 0.3) < 0.07 ? '#e8c040' : MAD.base), lado: MAD.esc, topo: MAD.base });
    L.caixa(i0, i0 + 0.08, j1 - 0.1, j1, 0, 11, MAD.esc); L.caixa(i1 - 0.08, i1, j1 - 0.1, j1, 0, 11, MAD.esc);
    L.caixa(i0, i1, j0, j1, 11, 2, { frente: MAD.esc, lado: MAD.esc, topo: MAD.claro });
    const cj = (j0 + j1) / 2 + 0.15;
    L.caixa(i0 + 0.15, i0 + 0.25, cj - 0.1, cj + 0.1, 13, 3, '#3a3a4a');
    L.caixa(i0 + 0.12, i0 + 0.2, cj - 0.5, cj + 0.5, 16, 12, { frente: (u, t, l) => (u < 0.06 || u > l - 0.06 || t < 1 || t > 10 ? '#3a3a4a' : ligado ? [t > 7 ? '#5ad0f0' : (Math.floor(u * 16) + t) % 7 === 0 ? '#a8f0ff' : '#3a9ad8', 2] : '#1e2430'), lado: '#2a2a36', topo: '#4a4a5a' });
    L.caixa(i0 + 0.42, i0 + 0.6, cj - 0.4, cj + 0.3, 13, 1, { frente: '#9aa0b0', topo: (a, b) => (Math.floor(b * 10) % 2 ? '#d0d4dc' : '#b0b4c0') });
    if (ligado) ctx.luzes.push({ i: i0 + 0.5, j: cj, h: 22, raio: 2.4, forca: 0.6, cor: '#80d0ff' });
  } },
  'cadeira-gamer': { di: 0.5, dj: 0.6, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, c = ctx.op.tecido || ['#e85a5a', '#c83c4c', '#8a2a3a'], ci = (i0 + i1) / 2, cj = (j0 + j1) / 2;
    L.caixa(ci - 0.25, ci + 0.25, cj - 0.25, cj + 0.25, 0, 2, '#2a2a36');
    L.caixa(ci - 0.05, ci + 0.05, cj - 0.05, cj + 0.05, 2, 6, '#3a3a4a');
    L.caixa(i0, i1, j0, j1, 8, 3, { frente: c[1], lado: c[2], topo: c[0] });
    L.caixa(i1 - 0.1, i1, j0, j1, 11, 16, { frente: (u, t, l) => (t > 10 && t < 14 && u > 0.15 && u < l - 0.15 ? '#1e1e2a' : c[1]), lado: c[2], topo: c[0] });
  } },
  'guarda-roupa': { di: 1.8, dj: 0.7, f(L, m) {                  // de frente para +j (encostar na parede lateral)
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 52, { frente: MAD.esc,
      lado: (u, t, l) => (t < 3 || t > 49 || u < 0.08 || u > l - 0.08 ? MAD.esc : Math.abs(u - l / 2) < 0.05 ? MAD.esc : (Math.abs(u - l / 2) < 0.2 && t > 24 && t < 30) ? '#e8c040' : (t % 24 === 12 && Math.abs(u - l / 2) > 0.2) ? MAD.base : MAD.claro),
      topo: MAD.base });
  } },
  sofa: { di: 1.0, dj: 3.0, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, c = ctx.op.tecido || ['#5aaaa8', '#3a8a8a', '#2a6a6a'];
    L.caixa(i0 + 0.05, i1 - 0.05, j0 + 0.1, j1 - 0.1, 0, 2, '#4a2e1a');
    L.caixa(i0, i0 + 0.32, j0, j1, 2, 20, { frente: (u, t, l) => (Math.abs(((u / l) * 3) % 1) < 0.03 ? c[2] : t > 17 ? c[0] : c[1]), lado: c[2], topo: c[0] });
    L.caixa(i0 + 0.32, i1, j0 + 0.25, j1 - 0.25, 2, 8, { frente: (u, t, l) => (Math.abs(((u / l) * 3) % 1) < 0.03 ? c[2] : c[1]), lado: c[2], topo: (a, b) => (Math.abs((((b) / (j1 - j0 - 0.5)) * 3) % 1) < 0.03 ? c[2] : c[0]) });
    for (const b of [j0, j1 - 0.25]) L.caixa(i0 + 0.15, i1, b, b + 0.25, 2, 13, { frente: c[1], lado: c[2], topo: c[0] });
    L.caixa(i0 + 0.32, i0 + 0.45, j1 - 0.85, j1 - 0.35, 10, 7, { frente: '#f0b830', topo: '#f8d060', lado: '#c88a20' });   // almofada
  } },
  poltrona: { di: 1.0, dj: 1.2, f(L, m, ctx) { MOVEIS.sofa.f(L, m, { ...ctx, op: { tecido: ctx.op.tecido || ['#d85a5a', '#a83a3a', '#7a2a2a'] } }); } },
  'mesa-centro': { di: 0.8, dj: 1.6, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const [a, b] of [[i0, j0], [i1 - 0.1, j0], [i0, j1 - 0.1], [i1 - 0.1, j1 - 0.1]]) L.caixa(a, a + 0.1, b, b + 0.1, 0, 6, MAD.esc);
    L.caixa(i0, i1, j0, j1, 6, 2, { frente: MAD.esc, lado: MAD.esc, topo: (a, b) => (a > 0.2 && a < 0.5 && b > 0.3 && b < 0.8 ? (a < 0.25 ? '#c83c4c' : '#e8e0d0') : MAD.claro) });
    L.caixa(i0 + 0.3, i0 + 0.45, j1 - 0.5, j1 - 0.35, 8, 3, { frente: '#f4f4f4', topo: '#7a4e2a' });
  } },
  'tv-rack': { di: 2.2, dj: 0.6, f(L, m, ctx) {                 // de frente para +j (encostar na parede lateral)
    const { i0, i1, j0, j1 } = m, ligada = ctx.op.ligada ?? true, ci = (i0 + i1) / 2;
    L.caixa(i0, i1, j0, j1, 0, 10, { frente: MAD.esc, lado: (u, t, l) => (t < 2 || t > 8 || Math.abs(u - l / 2) < 0.05 ? MAD.esc : (u > 0.2 && u < 0.7 && t > 3 && t < 7) ? '#3a3a4a' : (u > l - 0.9 && u < l - 0.2 && t > 2 && t < 8) ? LIVROS[Math.floor(u * 10) % 5] : MAD.base), topo: MAD.claro });
    L.caixa(ci - 0.15, ci + 0.15, j1 - 0.4, j1 - 0.2, 10, 2, '#2a2a36');
    L.caixa(ci - 0.85, ci + 0.85, j1 - 0.3, j1 - 0.2, 12, 26, { frente: '#2a2a36', topo: '#3a3a46',
      lado: (u, t, l) => { if (u < 0.08 || u > l - 0.08 || t < 2 || t > 23) return '#2a2a36'; if (!ligada) return '#141820'; const v = t / 24; return [v > 0.55 ? '#6ab8f0' : v > 0.3 ? '#8ad070' : '#5aa04a', 2]; } });
    if (ligada) ctx.luzes.push({ i: ci, j: j1 + 0.3, h: 24, raio: 3, forca: 0.7, cor: '#a0d0ff' });
  } },
  luminaria: { di: 0.4, dj: 0.4, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2, acesa = ctx.op.acesa ?? true;
    L.caixa(i0 + 0.05, i1 - 0.05, j0 + 0.05, j1 - 0.05, 0, 2, '#3a3a4a');
    L.caixa(ci - 0.04, ci + 0.04, cj - 0.04, cj + 0.04, 2, 40, '#4a4a5a');
    L.caixa(ci - 0.22, ci + 0.22, cj - 0.22, cj + 0.22, 42, 9, acesa ? { frente: ['#fff0d0', 2], lado: ['#f4e0b0', 2], topo: ['#fff8e8', 2] } : { frente: '#d8c8a0', lado: '#b8a880', topo: '#e8d8b0' });
    if (acesa) ctx.luzes.push({ i: ci, j: cj, h: 44, raio: 4, forca: 0.9, cor: '#ffd890' });
  } },
  planta: { di: 0.5, dj: 0.5, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2, r = rng(ctx.semente + 9);
    L.caixa(i0 + 0.05, i1 - 0.05, j0 + 0.05, j1 - 0.05, 0, 10, { frente: '#c8643a', lado: '#9a4a2a', topo: '#5a3a20' });
    const p = L.proj(ci, cj, 10);
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI / 2 + (k - 4) * 0.36 + (r() - 0.5) * 0.2, comp = 10 + r() * 9;
      for (let t = 0; t < comp; t++) {
        const x = p.x + Math.cos(a) * t, y = p.y + Math.sin(a) * t + (t * t) / (comp * 2.2) * Math.abs(Math.cos(a));
        const larg = Math.sin((t / comp) * Math.PI) * 1.6;
        for (let d = -larg; d <= larg; d += 0.5) L.pintar(x - d * Math.sin(a), y + d * Math.cos(a) * 0.4, d < 0 ? '#5ab85a' : '#3a8a44', ci, cj, 10 + t, 1, 1);
      }
    }
  } },
};

// ------------------------------------------------------------------ cômodos prontos
// moveis: { tipo, x (centro ao longo do cômodo), i (distância da parede do fundo), opções... }
// paredes: decorações na parede do fundo (x) e na lateral (lateral: true, x = distância do fundo).
export const COMODOS_DIAGONAL = {
  'sala-aula': {
    estilo: 'sala-aula', inicio: -9, fim: 9,
    paredes: [
      { tipo: 'janela', x: -6.2, w: 3 }, { tipo: 'janela', x: 6, w: 3 },
      { tipo: 'lousa', x: 0, w: 5.6 }, { tipo: 'alfabeto', x: 0, w: 4.4, altura: 76, h: 12 },
      { tipo: 'relogio', x: 3.6, w: 1, altura: 80, h: 14 }, { tipo: 'poster', x: -3.6, w: 1.2, altura: 62, h: 22, cores: ['#f0d040', '#e8b030'] },
      { tipo: 'porta', lateral: true, x: 3.2, w: 1.8 },
    ],
    moveis: [
      { tipo: 'estante', x: -8.1, i: 0 }, { tipo: 'globo', x: -8.1, i: 0.08, h0: 46 },
      { tipo: 'mesa-professor', x: -3.3, i: 1.0 },
      ...[0.8, 3.4, 6].flatMap((x) => [2.2, 3.5].flatMap((i) => [{ tipo: 'carteira', x, i }, { tipo: 'cadeira', x, i: i + 0.62 }])),
    ],
    piso: [],
  },
  'quarto-menino': {
    estilo: 'quarto-menino', inicio: -9, fim: 9,
    paredes: [
      { tipo: 'janela', x: -3.6, w: 2.8, cortina: ['#e8a040', '#c07820'] },
      { tipo: 'poster', x: 0.6, w: 1.3, altura: 58, h: 26, cores: ['#c83c4c', '#a82a3c'] },
      { tipo: 'quadro', x: 2.8, w: 1.9, altura: 64, h: 18 },
      { tipo: 'porta', lateral: true, x: 3.4, w: 1.8 },
    ],
    moveis: [
      { tipo: 'cama', x: -6.6, i: 0 }, { tipo: 'criado-mudo', x: -5.2, i: 0 },
      { tipo: 'bau-brinquedos', x: -1.4, i: 0 },
      { tipo: 'escrivaninha', x: 2.6, i: 0 }, { tipo: 'cadeira-gamer', x: 2.4, i: 0.95 },
      { tipo: 'guarda-roupa', x: 8.65, i: 0.15 },
    ],
    piso: [{ x: 0, i0: 1.6, i1: 3.8, dj: 4.2, cor: ['#5a8ae0', '#3a6ac8', '#f0d090'] }],
  },
  'sala-estar': {
    estilo: 'sala-estar', inicio: -9, fim: 9,
    paredes: [
      { tipo: 'janela', x: -5.6, w: 3, cortina: ['#b83a4a', '#8a2a3a'] },
      { tipo: 'quadro', x: -0.6, w: 2.2, altura: 62, h: 22 }, { tipo: 'familia', x: 1.4, w: 1.4, altura: 66, h: 16 },
      { tipo: 'porta', x: 6.6, w: 1.8, cor: ['#f4f0e8', '#e0d8c8', '#a8a090'] },
    ],
    moveis: [
      { tipo: 'planta', x: -8.3, i: 0.1 }, { tipo: 'estante', x: -3.4, i: 0, dj: 1.4 },
      { tipo: 'sofa', x: 0.4, i: 0 }, { tipo: 'luminaria', x: 2.4, i: 0.2 },
      { tipo: 'mesa-centro', x: 0.4, i: 1.7 }, { tipo: 'poltrona', x: 4.4, i: 0.1 },
      { tipo: 'tv-rack', x: 8.7, i: 1.3 },
    ],
    piso: [{ x: 0.4, i0: 1.3, i1: 3.6, dj: 4.6, cor: ['#c85a5a', '#a83a3a', '#f0d090'] }],
  },
};
COMODOS_DIAGONAL['quarto-menino-noite'] = { ...COMODOS_DIAGONAL['quarto-menino'], estilo: 'quarto-menino-noite', noite: true };

// ------------------------------------------------------------------ geração
export function gerarComodoDiagonal(opc = {}) {
  const base = COMODOS_DIAGONAL[opc.tipo] || COMODOS_DIAGONAL['quarto-menino'];
  const cfg = { ...base, ...opc };
  if (opc.periodo) cfg.noite = opc.periodo === 'noite';
  const noite = !!cfg.noite;
  const tema = cfg.tema ? (typeof cfg.tema === 'string' ? TEMAS[cfg.tema] || TEMAS.sombrio : { ...TEMAS.sombrio, ...cfg.tema }) : null;
  const lat = PRESETS_INTERIORES[cfg.estilo] || PRESETS_INTERIORES['quarto-menino'];
  const par = lat.camadas[0], chao = lat.chao;
  ALT = cfg.alturaParede ?? 200;
  // O piso continua até perto da câmera (profundidade 11) e o cômodo vai para a esquerda até onde a câmera
  // e os personagens chegam (inicio vem da vista): o enquadramento fica sempre cheio, sem vazio preto.
  const Ja = -cfg.fim, Jb = -cfg.inicio, P = cfg.profundidade ?? 11;   // j cresce para a esquerda: o fim (direita) é Ja
  const I0 = -0.8, I1 = P + 1, J0 = Ja - 1, J1 = Jb + 1, HMAX = ALT + 30;
  const OX = -(I0 - J1) * 16 + 4, OY = -(I0 + J0) * 8 + HMAX;
  const W = Math.ceil((I1 - J0) * 16 + OX + 8), H = Math.ceil((I1 + J1) * 8 + OY + 20);
  const proj = (i, j, h = 0) => ({ x: (i - j) * 16 + OX, y: (i + j) * 8 + OY - h });
  const geo = { W, H, OX, OY, proj };
  const r = rng(cfg.semente ?? 7);

  const B = new Camada(geo);
  // piso (com a borda cortada na frente e na esquerda)
  const [t0, t1, t2] = chao.topo, [d0] = chao.terra;
  const tapetes = (cfg.piso || []).map((t) => ({ ...t, j0: -t.x - t.dj / 2, j1: -t.x + t.dj / 2 }));
  B.prisma(0, P, Ja, Jb, -8, 8, {
    frente: (u, t) => (tema && t === 7 ? [tema.neon, 2] : t > 5 ? t1 : t % 3 === 0 ? '#3a2a22' : '#4e3a2e'),
    lado: (u, t) => (t > 5 ? t2 : '#3a2a22'),
    topo: (a, b, d, x, y) => {
      const i = a, j = b + Ja;
      if (tema && (P - i < 0.07 || Jb - j < 0.05)) return [tema.neon, 2];       // borda da plataforma
      for (const tp of tapetes) if (i > tp.i0 && i < tp.i1 && j > tp.j0 && j < tp.j1) {
        const bi = Math.min(i - tp.i0, tp.i1 - i), bj = Math.min(j - tp.j0, tp.j1 - j);
        if (bi < 0.1 || bj < 0.1) return tp.cor[2];
        return (bi < 0.25 || bj < 0.25) && ((Math.floor(i * 6) + Math.floor(j * 6)) % 2) ? tp.cor[2] : (bayer(x, y) < 0.2 ? tp.cor[0] : tp.cor[1]);
      }
      let c;
      if (chao.estilo === 'taco') { const k = Math.floor(i * 3); const jj = j + k * 0.37; c = (i * 3 - k) < 0.1 || (jj - Math.floor(jj)) < 0.05 ? t2 : (k % 2 ? t1 : (bayer(x, y) < 0.12 ? t2 : t1)); if ((i * 3 - k) > 0.85) c = t0; }
      else if (chao.estilo === 'piso') { const fi = i - Math.floor(i), fj = j - Math.floor(j); c = fi < 0.06 || fj < 0.06 ? t2 : ((Math.floor(i) + Math.floor(j)) % 2 ? t1 : d0); }
      else c = bayer(x, y) < 0.25 ? chao.terra[1] : d0;
      return c;
    },
  });
  // sombra suave junto às paredes
  for (let k = 0; k < W * H; k++) if (B.tipo[k] && B.ph[k] === 0 && (B.pi[k] < 0.35 || B.pj[k] < Ja + 0.35)) B.face[k] = 0.86;
  // parede do fundo (i = 0) e parede lateral (j = Ja, à direita)
  const dFundo = (cfg.paredes || []).filter((d) => !d.lateral), dLat = (cfg.paredes || []).filter((d) => d.lateral);
  const corte = ['#5a4a5a', '#3a2e3a'];
  const topoCorte = () => (tema ? [tema.neon, 2] : corte[0]);
  const pintaDecor = (lista, pos, t, cBase) => { for (const d of lista) { const c = corDecor(d, pos, t, noite); if (c) return c; } return cBase; };
  B.prisma(-0.3, 0, Ja - 0.3, Jb, 0, ALT, {
    frente: (u, t, l, s) => pintaDecor(dFundo, -s, t, corParede(par, Math.floor((Jb - s) * 16), t, r)),
    lado: (u, t) => (t > ALT - 3 ? corte[0] : corte[1]),
    topo: topoCorte,
  });
  B.prisma(-0.3, P, Ja - 0.3, Ja, 0, ALT, {
    frente: (u, t) => (t > ALT - 3 ? corte[0] : corte[1]),
    lado: (u, t, l, s) => (s < 0 ? null : pintaDecor(dLat, s, t, corParede(par, Math.floor(s * 16), t, r))),
    topo: topoCorte,
  });
  // janelas emitem luz de dia (só nos pixels de vidro, que ficam claros)
  // móveis: uma camada cada
  const luzes = [];
  const pecas = [];
  for (const mv of cfg.moveis || []) {
    const def = MOVEIS[mv.tipo];
    if (!def) continue;
    const di = mv.di ?? def.di, dj = mv.dj ?? def.dj;
    const m = { i0: mv.i ?? 0, i1: (mv.i ?? 0) + di, j0: -mv.x - dj / 2, j1: -mv.x + dj / 2, h0: mv.h0 };
    const L = new Camada(geo);
    def.f(L, m, { luzes, noite, op: mv, semente: (cfg.semente ?? 7) + pecas.length * 11 });
    pecas.push({ L, ...m, sobre: mv.h0 != null });
  }
  const amb = noite ? [0.42, 0.46, 0.72] : [1, 1, 1];
  const iluminar = (L) => {
    const out = new Uint8ClampedArray(W * H * 4);
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (!L.tipo[k]) continue;
      let R = L.cor[k * 3], G = L.cor[k * 3 + 1], Bc = L.cor[k * 3 + 2];
      if (L.tipo[k] !== 2) {
        let nivel = 0;
        for (const l of luzes) {
          const di = L.pi[k] - l.i, dj = L.pj[k] - l.j, dv = (l.h - L.ph[k]) / PX_ALT;
          nivel += Math.max(0, 1 - Math.sqrt(di * di + dj * dj + dv * dv) / l.raio) * l.forca;
        }
        nivel = noite ? Math.min(1, nivel) : 0;
        const q = Math.max(0, Math.min(3, Math.floor(nivel * 3 + 0.5 + (bayer(x, y) - 0.5) * 0.35))) / 3;
        const f = L.face[k];
        R *= f * (amb[0] + q * 0.62); G *= f * (amb[1] + q * 0.5); Bc *= f * (amb[2] + q * 0.22);
      }
      if (tema) {
        // poucas cores: rampa escolhida pela luminosidade (emissivos viram acento/neon)
        const hex = L.tipo[k] === 2 ? ((R + G + Bc) > 2.2 ? '#ffffff' : (G > R ? tema.neon : tema.acento)) : null;
        if (hex) { const [a, b2, c2] = hexParaRgb(hex); R = a / 255; G = b2 / 255; Bc = c2 / 255; }
        else {
          const Y = 0.3 * R + 0.59 * G + 0.11 * Bc, n = tema.rampa.length;
          const v = Math.min(n - 1.001, Math.max(0, Math.pow(Y, 1.15) * (n - 0.6)));
          const idx = Math.floor(v) + ((v - Math.floor(v)) > 0.5 + (bayer(x, y) - 0.5) * 0.6 ? 1 : 0);
          const [a, b2, c2] = hexParaRgb(tema.rampa[Math.min(n - 1, idx)]); R = a / 255; G = b2 / 255; Bc = c2 / 255;
        }
      }
      out.set([Math.min(255, R * 255), Math.min(255, G * 255), Math.min(255, Bc * 255), 255], k * 4);
      if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y;
    }
    return { out, x0, y0, x1, y1 };
  };
  const b = iluminar(B);
  const saidaPecas = pecas.map((p) => {
    let { out, x0, y0, x1, y1 } = iluminar(p.L);
    if (x1 < 0) return null;
    if (tema) {                                                     // contorno brilhante (1 px por fora)
      const [cr, cg, cb] = hexParaRgb(tema.contorno), marcar = [];
      for (let y = Math.max(0, y0 - 1); y <= Math.min(H - 1, y1 + 1); y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(W - 1, x1 + 1); x++) {
        const k = y * W + x;
        if (out[k * 4 + 3]) continue;
        const v = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && out[(yy * W + xx) * 4 + 3] === 255;
        if (v(x - 1, y) || v(x + 1, y) || v(x, y - 1) || v(x, y + 1)) marcar.push(k);
      }
      for (const k of marcar) out.set([cr, cg, cb, 254], k * 4);
      x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(W - 1, x1 + 1); y1 = Math.min(H - 1, y1 + 1);
    }
    const w = x1 - x0 + 1, h = y1 - y0 + 1, img = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) img.set(out.subarray(((y0 + y) * W + x0) * 4, ((y0 + y) * W + x1 + 1) * 4), y * w * 4);
    return { imagem: img, x0, y0, w, h, i0: p.i0, i1: p.i1, j0: p.j0, j1: p.j1, sobre: p.sobre };
  }).filter(Boolean);
  return { W, H, imagem: b.out, pecas: saidaPecas, proj, luzes, noite, Ja, Jb, tema };
}
