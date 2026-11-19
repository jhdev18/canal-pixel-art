// Cenários procedurais em camadas de profundidade (paralaxe real pela câmera 3D).
import * as THREE from 'three';
import { Pix, bayer } from './pixel.js';
import { rng, PIXELS_POR_UNIDADE } from './compartilhado/util.js';
import { PRESETS_INTERIORES, pintarComodo, corPisoInterno, PISOS_INTERNOS } from './cenarios/interiores.js';

const K = '#1a1c2c';

export const PRESETS = {
  'cidade-dia': {
    ceu: { cores: ['#4a8ad8', '#62a2e4', '#80baee', '#a4d0f4'] },
    sol: { x: 0.82, y: 0.16, r: 10, cor: '#fffbe0', halo: '#fff4c0' },
    camadas: [
      { tipo: 'nuvens', z: -140, acima: 100, cores: ['#ffffff', '#d4e6f6'], quantidade: 6, deriva: 2 },
      { tipo: 'predios', z: -90, acima: 76, cor: '#a8c0dc', janela: '#c8d8ec', densidade: 0.18 },
      { tipo: 'predios', z: -45, acima: 58, cor: '#8aa2c0', janela: '#b0c4dc', densidade: 0.2 },
      { tipo: 'arvores', z: -14, acima: 22, cor: '#4a8a54', clara: '#5a9a62', estilo: 'redonda', iluminada: true },
    ],
    chao: { estilo: 'rua', topo: ['#b0b2c0', '#9496a6', '#6a6c7c'], terra: ['#4a4c5a', '#3e404c', '#32343e'] },
    ambiente: ['#ffffff', 1.0],
  },
  preto: { ceu: { cores: ['#000000'] }, camadas: [], chao: null, ambiente: ['#ffffff', 1.0] },
  'floresta-dia': {
    ceu: { cores: ['#3b7dd8', '#5fa8ea', '#9fd4f5', '#cdeefa'] },
    camadas: [
      { tipo: 'nuvens', z: -140, acima: 105, cores: ['#ffffff', '#d4e6f6'], quantidade: 6, deriva: 2 },
      { tipo: 'montanhas', z: -100, acima: 70, cor: '#8ab0d4', sombra: '#7a9ec4', amp: 34, neve: '#eef4ff' },
      { tipo: 'colinas', z: -55, acima: 38, cor: '#6aa874', sombra: '#5a9866', amp: 14 },
      { tipo: 'arvores', z: -28, acima: 36, cor: '#4c8a58', clara: '#5a9a64', estilo: 'misto' },
      { tipo: 'arvores', z: -12, acima: 24, cor: '#3a7046', clara: '#468050', estilo: 'redonda', iluminada: true },
    ],
    chao: { estilo: 'grama', topo: ['#7ac85a', '#5cb84a', '#3d8a3a'], terra: ['#8a5a32', '#6e4426', '#4a2c1a'] },
    primeiroPlano: { cor: '#1c3a24' },
    ambiente: ['#ffffff', 1.0],
  },
  'floresta-noite': {
    ceu: { cores: ['#070a1e', '#0f1638', '#1c2856', '#2c3c70'] },
    estrelas: 70, lua: { x: 0.78, y: 0.2, r: 9 },
    camadas: [
      { tipo: 'montanhas', z: -100, acima: 66, cor: '#1e2c52', sombra: '#18244a', amp: 34 },
      { tipo: 'colinas', z: -55, acima: 36, cor: '#16223e', sombra: '#131d36', amp: 14 },
      { tipo: 'arvores', z: -28, acima: 34, cor: '#101a30', clara: '#14203a', estilo: 'pinheiro' },
      { tipo: 'arvores', z: -12, acima: 26, cor: '#0c1426', clara: '#121c34', estilo: 'misto', iluminada: true },
    ],
    chao: { estilo: 'grama', topo: ['#3a7050', '#2a5a40', '#1c4030'], terra: ['#3a2c30', '#2c2028', '#1e161e'] },
    primeiroPlano: { cor: '#050810' },
    ambiente: ['#8a98d0', 0.85],
    clima: 'vagalumes',
  },
  'por-do-sol': {
    ceu: { cores: ['#2a1b4a', '#5a2a64', '#a8406a', '#e8704a', '#ffb060'] },
    sol: { x: 0.3, y: 0.62, r: 16, cor: '#ffe0a0', halo: '#ffc070' },
    camadas: [
      { tipo: 'nuvens', z: -140, acima: 100, cores: ['#f8a080', '#c86070'], quantidade: 5, deriva: 1.5 },
      { tipo: 'montanhas', z: -100, acima: 58, cor: '#5a2a5a', sombra: '#4a2250', amp: 30 },
      { tipo: 'colinas', z: -55, acima: 32, cor: '#3a1c40', sombra: '#341838', amp: 12 },
      { tipo: 'arvores', z: -14, acima: 26, cor: '#1e1024', clara: '#24142c', estilo: 'misto', iluminada: true },
    ],
    chao: { estilo: 'grama', topo: ['#6a5040', '#4a3a34', '#33262a'], terra: ['#3a2430', '#2a1a24', '#1e121a'] },
    primeiroPlano: { cor: '#0e0810' },
    ambiente: ['#ffb890', 0.9],
  },
  caverna: {
    ceu: { cores: ['#0c0a10', '#141018', '#1a1620'] },
    camadas: [
      { tipo: 'parede', z: -40, cor: '#1c1822', sombra: '#141018', clara: '#262030' },
      { tipo: 'estalactites', z: -16, cor: '#2c2634', sombra: '#211c28', iluminada: true },
      { tipo: 'rochas', z: -10, acima: 22, cor: '#2a2430', clara: '#363040', iluminada: true },
    ],
    chao: { estilo: 'pedra', topo: ['#8a8090', '#6a6072', '#4e4658'], terra: ['#3a3442', '#2c2634', '#201a26'] },
    primeiroPlano: { cor: '#08060a', estilo: 'pedras' },
    ambiente: ['#b0a0c8', 0.8],
    clima: 'poeira',
  },
  deserto: {
    ceu: { cores: ['#e8884a', '#f0a860', '#f8d090', '#fff0c8'] },
    sol: { x: 0.75, y: 0.22, r: 12, cor: '#fffbe0', halo: '#fff0b0' },
    camadas: [
      { tipo: 'montanhas', z: -100, acima: 44, cor: '#d09870', sombra: '#c08860', amp: 22, suave: true },
      { tipo: 'dunas', z: -50, acima: 28, cor: '#e0a860', sombra: '#c89048' },
      { tipo: 'dunas', z: -20, acima: 18, cor: '#d89850', sombra: '#b87c3c', iluminada: true },
    ],
    chao: { estilo: 'areia', topo: ['#f8d890', '#e8c070', '#d0a050'], terra: ['#d0a050', '#b88a40', '#9a7034'] },
    ambiente: ['#fff0d8', 1.0],
  },
  espaco: {
    ceu: { cores: ['#020208', '#06061a', '#0c0a26'] },
    estrelas: 160, nebulosa: true, planeta: { x: 0.72, y: 0.3, r: 30 },
    camadas: [],
    chao: { estilo: 'metal', topo: ['#9aa4b8', '#6a7488', '#4a5264'], terra: ['#3a4050', '#2e3442', '#22262f'] },
    ambiente: ['#b0b8e0', 0.85],
  },
  'cidade-noite': {
    ceu: { cores: ['#08081c', '#18143a', '#2e1e50', '#4a2a60'] },
    estrelas: 40, lua: { x: 0.2, y: 0.18, r: 8 },
    camadas: [
      { tipo: 'predios', z: -90, acima: 80, cor: '#1e1a3c', janela: '#6a5a8a', densidade: 0.12 },
      { tipo: 'predios', z: -45, acima: 60, cor: '#141230', janela: '#f8d860', densidade: 0.18 },
      { tipo: 'predios', z: -18, acima: 44, cor: '#0c0a20', janela: '#ffe890', densidade: 0.22, iluminada: true },
    ],
    chao: { estilo: 'rua', topo: ['#7a7888', '#5a5868', '#3a3848'], terra: ['#2a2834', '#22202a', '#18161e'] },
    ambiente: ['#9a9ad0', 0.85],
  },
  neve: {
    ceu: { cores: ['#90a8d0', '#b0c4e4', '#d0dcf0', '#e8f0fa'] },
    camadas: [
      { tipo: 'montanhas', z: -100, acima: 76, cor: '#c8d4ec', sombra: '#a8b8d8', amp: 42, neve: '#ffffff', neveLimite: 0.35 },
      { tipo: 'colinas', z: -55, acima: 34, cor: '#e0e8f8', sombra: '#c4d0e8', amp: 12 },
      { tipo: 'arvores', z: -26, acima: 34, cor: '#3a5a6a', clara: '#4a6a7a', estilo: 'pinheiro', neve: true },
      { tipo: 'arvores', z: -12, acima: 28, cor: '#2a4250', clara: '#365260', estilo: 'pinheiro', neve: true, iluminada: true },
    ],
    chao: { estilo: 'neve', topo: ['#ffffff', '#e8f0fc', '#c8d8ec'], terra: ['#c8d8ec', '#a8bcd8', '#8aa0c0'] },
    primeiroPlano: { cor: '#1a2a36' },
    ambiente: ['#e8eeff', 1.0],
    clima: 'neve',
  },
  // interiores (vista lateral): sala-aula, quarto-menino, quarto-menino-noite, sala-estar
  ...PRESETS_INTERIORES,
};

// Ruído periódico (repete a cada P pixels): soma de senos com frequências inteiras.
function periodico(P, semente, termos) {
  const r = rng(semente);
  const t = termos.map(([k, a]) => [k, a, r() * Math.PI * 2]);
  return (x) => t.reduce((s, [k, a, f]) => s + a * Math.sin((2 * Math.PI * k * x) / P + f), 0);
}

function encher(p, x, desde, cor) { for (let y = Math.max(0, Math.floor(desde)); y < p.h; y++) p.set(x, y, cor); }

const GERADORES = {
  comodo: pintarComodo,
  montanhas(p, c, s) {
    const h = periodico(p.w, s, [[1, 0.5], [2, 0.35], [3, 0.25], [5, 0.18], [8, 0.1], [13, 0.05]]);
    const amp = c.amp || 30;
    const topoDe = (x) => {
      let v = h(x);
      if (!c.suave) v = 1 - Math.abs(v); // cristas
      return amp - v * amp * (c.suave ? 0.6 : 0.9);
    };
    for (let x = 0; x < p.w; x++) {
      const topo = topoDe(x) + 4;
      const incl = topoDe(x + 1) - topoDe(x - 1);
      for (let y = Math.floor(topo); y < p.h; y++) {
        const prof = y - topo;
        let cor = incl > 0.15 && prof < 30 && bayer(x, y) > prof / 30 ? c.sombra : c.cor;
        if (c.neve && prof < 4 + (x % 3) && topo < amp * (c.neveLimite ?? 0.25) + 4) cor = c.neve;
        p.set(x, y, cor);
      }
    }
  },
  colinas(p, c, s) {
    const h = periodico(p.w, s, [[1, 0.5], [2, 0.3], [4, 0.2]]);
    const amp = c.amp || 14;
    for (let x = 0; x < p.w; x++) {
      const topo = 2 + amp * (1 - (h(x) * 0.5 + 0.5));
      for (let y = Math.floor(topo); y < p.h; y++) p.set(x, y, y - topo < 2 ? c.sombra : c.cor);
    }
  },
  dunas(p, c, s) {
    const h = periodico(p.w, s, [[1, 0.5], [2, 0.4], [3, 0.2]]);
    for (let x = 0; x < p.w; x++) {
      const topo = 4 + 10 * (1 - (h(x) * 0.5 + 0.5));
      const incl = h(x + 1) - h(x);
      for (let y = Math.floor(topo); y < p.h; y++) p.set(x, y, incl < 0 && y - topo < 8 ? c.sombra : c.cor);
    }
  },
  arvores(p, c, s) {
    const r = rng(s);
    const base = 30;
    for (let x = 0; x < p.w; x++) encher(p, x, base, c.cor);
    const n = Math.floor(p.w / 9);
    for (let i = 0; i < n; i++) {
      const cx = (i / n) * p.w + r() * 6;
      const estilo = c.estilo === 'misto' ? (r() < 0.5 ? 'pinheiro' : 'redonda') : c.estilo;
      const alt = 16 + r() * 14;
      for (let dx = -14; dx <= 14; dx++) {
        const x = Math.floor(cx + dx);
        const xw = ((x % p.w) + p.w) % p.w;
        for (let y = Math.floor(base - alt); y < base + 1; y++) {
          let dentro;
          if (estilo === 'pinheiro') {
            const t = (y - (base - alt)) / alt;
            const larg = t * 7 * (0.75 + 0.25 * ((y % 4) / 3));
            dentro = Math.abs(dx) <= larg;
          } else {
            const cy = base - alt * 0.6, rr = alt * 0.45;
            dentro = (dx * dx) / (rr * rr * 1.1) + ((y - cy) * (y - cy)) / (rr * rr) <= 1 || (Math.abs(dx) <= 1 && y > cy);
          }
          if (!dentro) continue;
          const borda = estilo === 'pinheiro' ? dx < 0 : dx < -2 && y < base - alt * 0.5;
          let cor = borda && bayer(xw, y) > 0.4 ? c.clara : c.cor;
          if (c.neve && estilo === 'pinheiro' && (y - (base - alt)) % 5 === 0) cor = '#e8f0fc';
          p.set(xw, y, cor);
        }
      }
    }
  },
  predios(p, c, s) {
    const r = rng(s);
    let x = 0;
    while (x < p.w) {
      const w = 10 + Math.floor(r() * 18);
      const alt = 20 + Math.floor(r() * (p.h * 0.5));
      const topo = Math.max(2, 80 - alt);
      for (let i = 0; i < w && x + i < p.w; i++) encher(p, x + i, topo, c.cor);
      if (r() < 0.3) p.ret(x + Math.floor(w / 2), topo - 6, 1, 6, c.cor);
      for (let wy = topo + 3; wy < p.h - 2; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) if (r() < c.densidade) p.ret(wx, wy, 2, 2, c.janela);
      x += w + Math.floor(r() * 3);
    }
  },
  parede(p, c, s) {
    const r = rng(s);
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) p.set(x, y, c.cor);
    for (let i = 0; i < p.w * p.h / 90; i++) {
      const cx = r() * p.w, cy = r() * p.h, rx = 2 + r() * 6, ry = 1 + r() * 3;
      p.elipse(cx, cy, rx, ry, (x, y, dx, dy) => (dy < -0.3 ? c.clara : dy > 0.4 ? c.sombra : null));
    }
  },
  estalactites(p, c, s) {
    const r = rng(s);
    for (let x = 0; x < p.w; x++) for (let y = 0; y < 6; y++) p.set(x, y, c.cor);
    for (let i = 0; i < p.w / 7; i++) {
      const cx = r() * p.w, comp = 6 + r() * 26, larg = 2 + r() * 4;
      for (let y = 0; y < comp; y++) {
        const w = larg * (1 - y / comp);
        for (let dx = -w; dx <= w; dx++) p.set(((Math.floor(cx + dx) % p.w) + p.w) % p.w, y + 4, dx > w * 0.3 ? c.sombra : c.cor);
      }
    }
  },
  rochas(p, c, s) {
    const r = rng(s);
    for (let x = 0; x < p.w; x++) encher(p, x, 26, c.cor);
    for (let i = 0; i < p.w / 14; i++) {
      const cx = r() * p.w, rx = 6 + r() * 10, ry = 5 + r() * 9;
      p.elipse(cx, 26, rx, ry, (x, y, dx, dy) => (dx < -0.2 && dy < 0 && bayer(x, y) > 0.5 ? c.clara : c.cor));
    }
  },
  nuvens(p, c, s) {
    const r = rng(s);
    const n = c.quantidade || 5;
    for (let i = 0; i < n; i++) {
      const cx0 = (i / n) * p.w + r() * 30, cy0 = 6 + r() * 30, partes = 3 + Math.floor(r() * 3);
      for (let k = 0; k < partes; k++) {
        const cx = cx0 + k * 7, cy = cy0 - Math.sin((k / Math.max(1, partes - 1)) * Math.PI) * 4, rr = 4 + r() * 3;
        for (let y = Math.floor(cy - rr); y <= cy + rr; y++)
          for (let x = Math.floor(cx - rr); x <= cx + rr; x++) {
            const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
            if (dx * dx + dy * dy > rr * rr || y > cy0 + 3) continue;
            p.set(((x % p.w) + p.w) % p.w, y, dy / rr > 0.3 ? c.cores[1] : c.cores[0]);
          }
      }
    }
  },
};

function texturaDe(pix) {
  const t = new THREE.CanvasTexture(pix.paraCanvas());
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

export function ordemPorZ(z) { return Math.round((z + 500) * 100); }

// Plano em profundidade z cuja textura fica 1 texel = 1 pixel na tela.
function planoCamada(ctx, { z, larguraPeriodo, alturaPx, topoMundo, pix, iluminada }) {
  const ppu = PIXELS_POR_UNIDADE * ctx.D / (ctx.D - z);
  const visivel = ctx.W / ppu / ctx.zoomMin;
  const necessario = (ctx.alcance[1] - ctx.alcance[0]) + visivel * 1.2 + 4;
  const larguraTile = larguraPeriodo / ppu;
  const tiles = Math.ceil(necessario / larguraTile) + 1;
  const tex = texturaDe(pix);
  tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = tiles;
  const geo = new THREE.PlaneGeometry(tiles * larguraTile, alturaPx / ppu);
  const Mat = iluminada ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial;
  const mat = new Mat({ map: tex, transparent: true, alphaTest: 0.5, depthWrite: false });
  const m = new THREE.Mesh(geo, mat);
  const cx = (ctx.alcance[0] + ctx.alcance[1]) / 2;
  m.position.set(Math.round(cx * ppu) / ppu, topoMundo - alturaPx / ppu / 2, z);
  m.renderOrder = ordemPorZ(z);
  m.userData = { tex, larguraPeriodo, ppu };
  return m;
}

// Linha da tela (a partir do topo) onde fica o chão (y=0) com a câmera padrão.
function linhaChao(ctx) { return ctx.H / 2 + (ctx.camY - 0) * PIXELS_POR_UNIDADE; }

function mundoYDeLinha(ctx, linha, z) {
  const ppu = PIXELS_POR_UNIDADE * ctx.D / (ctx.D - z);
  return ctx.camY + (ctx.H / 2 - linha) / ppu;
}

const CHAO_TOPO = 0.25;

function texturaChao(estilo, c, semente) {
  const P = 64, Hh = 260;
  const p = new Pix(P, Hh);
  const r = rng(semente);
  const [t0, t1, t2] = c.topo, [d0, d1, d2] = c.terra;
  const linha = 3;
  for (let x = 0; x < P; x++) {
    for (let y = linha; y < Hh; y++) {
      const prof = y - linha;
      let cor;
      if (PISOS_INTERNOS.includes(estilo)) {
        cor = corPisoInterno(estilo, c, x, y, prof);
      } else if (estilo === 'rua') {
        cor = prof < 1 ? t0 : prof < 6 ? (x % 16 === 0 ? t2 : t1) : prof < 8 ? t2 : prof < 30 ? (prof === 18 && x % 16 < 8 ? '#c8b860' : d0) : d1;
      } else if (estilo === 'metal') {
        cor = prof < 1 ? t0 : prof < 8 ? ((x % 32 === 3 && prof === 4) ? t0 : t1) : prof < 9 ? t2 : (x % 32 === 0 ? d2 : (prof % 12 === 6 && x % 32 === 16 ? t2 : d0));
      } else {
        const camadaTopo = estilo === 'grama' ? 4 : estilo === 'neve' ? 6 : 3;
        if (prof < 1) cor = t0;
        else if (prof < camadaTopo) cor = bayer(x, y) < 0.3 ? t0 : t1;
        else if (prof < camadaTopo + 2) cor = bayer(x, y) < 0.5 ? t1 : t2;
        else {
          const v = Math.min(1, (prof - camadaTopo) / 50);
          cor = Pix.tom([d0, d1, d2], v, x, y);
        }
      }
      p.set(x, y, cor);
    }
  }
  // detalhes
  if (estilo === 'grama' || estilo === 'neve') {
    for (let x = 0; x < P; x++) {
      const h = r();
      if (h < 0.35) p.set(x, linha - 1, t0);
      if (h < 0.1) p.set(x, linha - 2, t0);
      if (estilo === 'grama' && r() < 0.05) { p.set(x, linha - 1, '#f0e060'); }
    }
  }
  const nPedras = estilo === 'metal' || estilo === 'rua' || PISOS_INTERNOS.includes(estilo) ? 0 : 14;
  for (let i = 0; i < nPedras; i++) {
    const cx = Math.floor(r() * P), cy = linha + 10 + Math.floor(r() * 60);
    const w = 2 + Math.floor(r() * 3);
    for (let k = 0; k < w; k++) { p.set((cx + k) % P, cy, d0 === c.terra[0] ? t2 : d0); p.set((cx + k) % P, cy + 1, d2); }
  }
  return p;
}

function primeiroPlanoPix(cfg, semente) {
  const P = 256, Hh = 40, p = new Pix(P, Hh);
  const r = rng(semente);
  const h = periodico(P, semente, [[2, 0.5], [3, 0.3], [7, 0.2]]);
  for (let x = 0; x < P; x++) {
    const v = h(x);
    if (v < 0.05) continue;
    let topo = Hh - v * 28;
    if (cfg.estilo !== 'pedras') topo -= (x % 3 === 0 ? r() * 6 : 0);
    encher(p, x, topo, cfg.cor);
  }
  return p;
}

// Monta o cenário. ctx: { W, H, D, camY, alcance:[xmin,xmax], zoomMin, semente }
export function criarFundo(nome, ctx, extra = {}) {
  const preset = PRESETS[nome] || PRESETS['floresta-dia'];
  const objetos = [];
  let s = ctx.semente || 7;
  const lc = linhaChao(ctx);

  for (const camada of preset.camadas) {
    const c = { ...camada, ...(extra[camada.tipo] || {}) };
    const P = 512;
    let topoLinha, alturaPx;
    if (c.tipo === 'parede') { topoLinha = -40; alturaPx = ctx.H + 120; }
    else if (c.tipo === 'comodo') { c.base = Math.max(c.acima, Math.round(lc) - 4); topoLinha = lc - c.base; alturaPx = c.base + 24; }
    else if (c.tipo === 'estalactites') { topoLinha = -4; alturaPx = 50; }
    else { topoLinha = lc - c.acima - 30; alturaPx = Math.max(80, ctx.H - topoLinha + 60); }
    if (c.tipo === 'arvores' || c.tipo === 'rochas') topoLinha = lc - c.acima - 4;
    if (c.tipo === 'nuvens') { topoLinha = lc - c.acima - 30; alturaPx = 60; }
    if (c.tipo === 'arvores' || c.tipo === 'rochas') alturaPx = Math.max(alturaPx, ctx.H - topoLinha + 60);
    const pix = new Pix(P, Math.ceil(alturaPx));
    GERADORES[c.tipo](pix, c, s++);
    const m = planoCamada(ctx, { z: c.z, larguraPeriodo: P, alturaPx: pix.h, topoMundo: mundoYDeLinha(ctx, topoLinha, c.z), pix, iluminada: c.iluminada });
    if (c.deriva) m.userData.deriva = c.deriva;
    if (c.tipo === 'comodo') {
      // coluna 256 da parede (centro do desenho) fica em x = 0 do mundo: janelas e portas em lugar previsível
      const L = P / m.userData.ppu, esquerda = m.position.x - m.geometry.parameters.width / 2;
      m.userData.tex.offset.x = (((esquerda / L + 0.5) % 1) + 1) % 1;
    }
    objetos.push(m);
  }

  // Chão
  const chaoCfg = preset.chao && { ...preset.chao, ...(extra.chao || {}) };
  const zChao = -0.5;
  if (chaoCfg) {
  const pixChao = texturaChao(chaoCfg.estilo, chaoCfg, s++);
  const ppuChao = PIXELS_POR_UNIDADE * ctx.D / (ctx.D - zChao);
  const chao = planoCamada(ctx, { z: zChao, larguraPeriodo: 64, alturaPx: pixChao.h, topoMundo: CHAO_TOPO + 3 / ppuChao, pix: pixChao, iluminada: true });
  objetos.push(chao);
  }

  if (preset.primeiroPlano && extra.primeiroPlano !== false) {
    const zf = 4;
    const pix = primeiroPlanoPix(preset.primeiroPlano, s++);
    const linhaBase = ctx.H + 4;
    objetos.push(planoCamada(ctx, { z: zf, larguraPeriodo: 256, alturaPx: pix.h, topoMundo: mundoYDeLinha(ctx, linhaBase - pix.h, zf), pix }));
  }

  const ceu = criarCeu(preset, ctx);
  return {
    objetos, ceu,
    ambiente: preset.ambiente,
    clima: preset.clima || null,
    atualizar(t) {
      ceu.atualizar(t);
      for (const o of objetos) {
        const u = o.userData;
        if (u.deriva) u.tex.offset.x = Math.floor(t * u.deriva) / u.larguraPeriodo;
      }
    },
  };
}

function criarCeu(preset, ctx) {
  const { W, H } = ctx;
  const base = new Pix(W, H);
  const cores = preset.ceu.cores;
  const horizonte = linhaChao(ctx) - 10;
  for (let y = 0; y < H; y++) {
    const v = Math.min(1, Math.max(0, y / horizonte));
    const f = v * (cores.length - 1);
    const i = Math.min(cores.length - 1, Math.floor(f));
    const frac = f - i;
    for (let x = 0; x < W; x++) {
      const prox = Math.min(cores.length - 1, i + 1);
      const cor = frac > 0.65 && (frac - 0.65) / 0.35 > bayer(x, y) ? cores[prox] : cores[i];
      base.set(x, y, cor);
    }
  }
  const r = rng(99);
  if (preset.nebulosa) {
    for (let i = 0; i < 6; i++) {
      const cx = r() * W, cy = r() * H * 0.6, rr = 20 + r() * 30;
      const cor = ['#2a1450', '#3a1a5a', '#142a50'][i % 3];
      base.circulo(cx, cy, rr, (x, y, dx, dy) => (1 - Math.sqrt(dx * dx + dy * dy)) * 0.8 > bayer(x, y) + 0.3 ? cor : null);
    }
  }
  const estrelas = [];
  for (let i = 0; i < (preset.estrelas || 0); i++) {
    estrelas.push({ x: Math.floor(r() * W), y: Math.floor(r() * horizonte * 0.85), b: r(), f: r() * 10, v: 1 + r() * 3 });
  }
  const astro = (a, desenho) => a && desenho(Math.round(a.x * W), Math.round(a.y * H), a.r);
  astro(preset.sol, (cx, cy, rr) => {
    base.circulo(cx, cy, rr + 6, (x, y, dx, dy) => (bayer(x, y) > 0.5 ? preset.sol.halo : null));
    base.circulo(cx, cy, rr, preset.sol.cor);
  });
  astro(preset.lua, (cx, cy, rr) => {
    base.circulo(cx, cy, rr + 3, (x, y) => (bayer(x, y) > 0.75 ? '#3a4a80' : null));
    base.circulo(cx, cy, rr, (x, y, dx, dy) => (dx > 0.35 && dy < 0.6 && dx * dx + dy * dy > 0.2 ? '#c8c4a8' : '#f0ecd0'));
    base.set(cx - 3, cy - 2, '#d0ccb0'); base.set(cx - 2, cy + 3, '#d0ccb0'); base.set(cx + 1, cy, '#d0ccb0');
  });
  astro(preset.planeta, (cx, cy, rr) => {
    base.circulo(cx, cy, rr, (x, y, dx, dy) => {
      const faixa = ['#c86a4a', '#e8a060', '#a84a3a', '#e8c080'][Math.floor((dy + 1) * 5) % 4];
      const luz = -dx * 0.6 - dy * 0.3 + 0.4;
      return luz < bayer(x, y) * 0.6 ? '#2a1420' : faixa;
    });
    for (let k = 0; k < 720; k++) {
      const th = (k / 720) * Math.PI * 2;
      const px = Math.round(cx + Math.cos(th) * rr * 1.7), py = Math.round(cy + Math.sin(th) * rr * 0.32);
      const atras = Math.sin(th) < 0 && (px - cx) ** 2 + (py - cy) ** 2 < rr * rr;
      if (atras) continue;
      base.set(px, py, '#e8d0a0'); base.set(px, py + 1, '#a89070');
    }
  });

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const g = canvas.getContext('2d');
  const img = new ImageData(new Uint8ClampedArray(base.d), W, H);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  tex.colorSpace = THREE.NoColorSpace;
  let primeira = true;
  return {
    textura: tex,
    atualizar(t) {
      if (!primeira && !estrelas.length) return;
      primeira = false;
      g.putImageData(img, 0, 0);
      for (const e of estrelas) {
        const brilho = e.b * (0.6 + 0.4 * Math.sin(t * e.v + e.f));
        if (brilho < 0.25) continue;
        g.fillStyle = brilho > 0.75 ? '#ffffff' : brilho > 0.5 ? '#c8d0f0' : '#7880b0';
        g.fillRect(e.x, e.y, 1, 1);
        if (brilho > 0.92) { g.fillStyle = '#8890c0'; g.fillRect(e.x - 1, e.y, 3, 1); g.fillRect(e.x, e.y - 1, 1, 3); g.fillStyle = '#fff'; g.fillRect(e.x, e.y, 1, 1); }
      }
      tex.needsUpdate = true;
    },
  };
}

export const NOMES_FUNDOS = Object.keys(PRESETS);
export { CHAO_TOPO, K };
