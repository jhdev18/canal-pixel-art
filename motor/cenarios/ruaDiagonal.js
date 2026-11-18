// Rua em diagonal DESENHADA em pixel art (projeção 2:1). A câmera fica sempre de frente;
// a diagonal está no desenho, então cada pixel continua alinhado com a tela.
// Cada pixel guarda sua posição 3D (i, j, altura) e a iluminação é calculada pixel a pixel,
// em faixas com dithering, como numa pixel art pintada à mão.
import { bayer, hexParaRgb } from '../pixel.js';
import { rng } from '../compartilhado/util.js';

// i atravessa a rua (cresce para baixo/direita); j vai ao longo dela (cresce para baixo/esquerda).
// Faixas em i:  [-3.2,0] prédios | 0..1.5 calçada | 1.5..1.8 meio-fio | 1.8..5.2 asfalto
//               5.2..5.5 meio-fio | 5.5..7 calçada | 7..7.4 cerca viva | >7.4 canteiro
export const FAIXA = { predioFundo: -3.2, predioFrente: 0, calcadaFundo: 0.9, meioRua: 3.5, calcadaFrente: 6.25, canteiro: 8.5 };
const PX_POR_UNIDADE_ALTURA = 16;

const PALETAS = {
  tijolo: [['#8a4e46', '#74403c', '#5a302e', '#3a1e20'], ['#7a4a3a', '#663c30', '#4e2c24', '#321a16']],
  reboco: [['#c8b490', '#b09c7a', '#8a7a5e', '#5a4c38'], ['#a8b4c0', '#92a0ae', '#72808e', '#4a5460'], ['#c8a0a0', '#b08888', '#8a6a6a', '#5a4444']],
  painel: [['#5a6a8a', '#4c5a78', '#3a4660', '#262e42'], ['#6a7a6a', '#5a6a5a', '#465446', '#2e382e']],
};
const TOLDOS = [['#e8e0d0', '#c83c4c'], ['#e8e0d0', '#3aa868'], ['#e8e0d0', '#3a6ac8'], ['#f0d040', '#5a3a6a'], ['#e8e0d0', '#e87a3a']];

export function gerarRuaDiagonal(opc = {}) {
  const comp = opc.comprimento ?? 44;
  const noite = (opc.periodo ?? 'noite') === 'noite';
  const semente = opc.semente ?? 7;
  const J0 = -comp / 2, J1 = comp / 2, I0 = -4.5, I1 = 16, HMAX = 150;
  const OX = -(I0 - J1) * 16 + 4, OY = -(I0 + J0) * 8 + HMAX;
  const W = Math.ceil((I1 - J0) * 16 + OX + 8), H = Math.ceil((I1 + J1) * 8 + OY + 8);
  const proj = (i, j, h = 0) => ({ x: (i - j) * 16 + OX, y: (i + j) * 8 + OY - h });

  // buffers: cor base, posição 3D, tipo (0 vazio, 1 superfície, 2 emissivo), fator da face
  const N = W * H;
  const cor = new Float32Array(N * 3), pi = new Float32Array(N), pj = new Float32Array(N), ph = new Float32Array(N);
  const tipo = new Uint8Array(N), face = new Float32Array(N).fill(1);
  const pintar = (x, y, hex, i, j, h, t = 1, f = 1) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const k = y * W + x, [r, g, b] = hexParaRgb(hex);
    cor[k * 3] = r / 255; cor[k * 3 + 1] = g / 255; cor[k * 3 + 2] = b / 255;
    pi[k] = i; pj[k] = j; ph[k] = h; tipo[k] = t; face[k] = f;
  };
  const r = rng(semente);

  // ---------- chão ----------
  const faixaPedestre = opc.faixaPedestre ?? 0;   // posição x (ao longo da rua) da faixa
  const jFaixa = -faixaPedestre;
  const bueiros = [J0 + 6, J0 + 19, J0 + 31].map((j) => j + (r() - 0.5) * 3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = (x - OX) / 16, Y = (y - OY) / 8;
    const i = (Y + X) / 2, j = (Y - X) / 2;
    if (i < I0 || i > I1 || j < J0 || j > J1) continue;
    let c;
    const calcada = (i >= 0 && i < 1.5) || (i > 5.5 && i < 7);
    if (i < 0) c = '#2a2a34';
    else if (calcada) {
      const a = i * 2, b = j * 2, borda = a - Math.floor(a) < 0.07 || b - Math.floor(b) < 0.07;
      c = borda ? '#5c5e70' : (bayer(x, y) < 0.07 ? '#8c8ea0' : '#7a7c8e');
      if (i < 0.35) c = borda ? '#4e5060' : '#6a6c7e';                       // sombra junto à parede
    } else if (i < 1.8 || (i > 5.2 && i <= 5.5)) {
      const topo = i < 1.8 ? i < 1.62 : i < 5.38;
      c = topo ? '#b6b8c6' : '#8a8c9c';
      if (i > 1.74 && i < 1.8) c = '#4a4a58';
    } else if (i <= 5.2) {
      const v = r(); c = v < 0.07 ? '#45475a' : v < 0.13 ? '#2c2c38' : '#37394a';
      if (Math.abs(j - jFaixa) < 1.4 && (Math.floor((i - 1.8) * 4)) % 2 === 0) c = r() < 0.05 ? '#b8b8c4' : '#e2e2ea';
      else if (Math.abs(i - 3.5) < 0.06 && (j - Math.floor(j)) < 0.5) c = '#e0b838';
      for (const jb of bueiros) if (Math.abs(i - 1.95) < 0.12 && Math.abs(j - jb) < 0.35) c = (Math.floor(j * 16) % 2) ? '#1e1e26' : '#4a4a58';
      if (Math.hypot((i - 3.5) * 1.0, (j - (J0 + 12)) * 1.0) < 0.42) c = Math.hypot(i - 3.5, j - (J0 + 12)) < 0.36 ? ((Math.floor(i * 12) + Math.floor(j * 12)) % 2 ? '#4e4e5c' : '#3e3e4a') : '#2a2a34';
    } else if (i < 7.4) c = '#2e5a3a';
    else { const v = r(); c = v < 0.1 ? '#4a9a5a' : v < 0.17 ? '#2c5a3a' : '#3a7a4a'; }
    pintar(x, y, c, i, j, 0);
  }

  // ---------- prisma genérico (prédios, cerca viva, ar-condicionado) ----------
  // faces visíveis: frente (plano i = i1, de frente para a rua), lado (plano j = j1) e topo.
  function prisma(i0, i1, j0, j1, h0, h, pint) {
    for (let x = 0; x < W; x++) {               // frente
      const s = i1 - (x - OX) / 16;
      if (s < j0 || s > j1) continue;
      const base = (i1 + s) * 8 + OY - h0;
      const u = Math.floor((s - j0) * 16), larg = Math.floor((j1 - j0) * 16);
      for (let t = 0; t <= h; t++) pint.frente(x, Math.round(base - t), u, t, larg, s);
    }
    for (let x = 0; x < W; x++) {               // lado
      const s = (x - OX) / 16 + j1;
      if (s < i0 || s > i1) continue;
      const base = (s + j1) * 8 + OY - h0;
      const u = Math.floor((s - i0) * 16);
      for (let t = 0; t <= h; t++) pint.lado(x, Math.round(base - t), u, t, s);
    }
    const yTop0 = Math.floor((i0 + j0) * 8 + OY - h0 - h) - 2, yTop1 = Math.ceil((i1 + j1) * 8 + OY - h0 - h) + 2;
    for (let y = Math.max(0, yTop0); y < Math.min(H, yTop1); y++) for (let x = 0; x < W; x++) {
      const X = (x - OX) / 16, Y = (y + h0 + h - OY) / 8;
      const i = (Y + X) / 2, j = (Y - X) / 2;
      if (i < i0 || i > i1 || j < j0 || j > j1) continue;
      pint.topo(x, y, i, j, Math.min(i - i0, i1 - i, j - j0, j1 - j));
    }
  }

  // cerca viva entre a calçada da frente e o canteiro
  prisma(7.0, 7.45, J0, J1, 0, 9, {
    frente: (x, y, u, t, l, s) => pintar(x, y, t > 7 ? '#4a8a4a' : ((u + t) % 3 ? '#2e6a3a' : '#3a7a44'), 7.45, s, t, 1, 0.92),
    lado: (x, y, u, t, s) => pintar(x, y, '#24502e', s, J1, t, 1, 0.75),
    topo: (x, y, i, j) => pintar(x, y, r() < 0.2 ? '#6aaa5a' : '#58984e', i, j, 9, 1, 1.1),
  });

  // ---------- prédios (da esquerda/fundo para a direita/frente: j crescente) ----------
  const tipos = Object.keys(PALETAS);
  const predios = [];
  for (let j = J0 - 1, n = 0; j < J1; n++) {
    const larg = 3 + Math.floor(r() * 3), alt = 76 + Math.floor(r() * 3) * 24;
    const t = tipos[Math.floor(r() * tipos.length)];
    predios.push({ j0: j, j1: Math.min(J1 + 1, j + larg), h: alt, tipo: t, pal: PALETAS[t][Math.floor(r() * PALETAS[t].length)], toldo: TOLDOS[n % TOLDOS.length], s: Math.floor(r() * 1e6) });
    j += larg;
  }
  const lojas = [];
  for (const P of predios) {
    const rw = rng(P.s), pal = P.pal;
    const acesa = new Map();
    const parede = (u, t, larg) => {
      if (u < 2 || u > larg - 3) return pal[2];                                   // pilastras
      if (P.tipo === 'tijolo') return (t % 4 === 0 || (u + (Math.floor(t / 4) % 2) * 4) % 8 === 0) ? pal[1] : pal[0];
      if (P.tipo === 'painel') return u % 12 === 0 || t % 24 === 0 ? pal[2] : pal[0];
      return rw() < 0.04 ? pal[1] : pal[0];
    };
    prisma(-3.2, 0, P.j0, P.j1, 0, P.h, {
      frente: (x, y, u, t, larg, s) => {
        let c = parede(u, t, larg), tp = 1;
        const meio = Math.floor(larg / 2);
        if (t < 2) c = pal[3];                                                     // rodapé
        if (t >= P.h - 6 && t < P.h - 2) c = pal[0] === c ? '#d8d0c0' : '#c8c0b0';   // cornija
        if (t >= P.h - 2) c = pal[3];
        if (t === P.h - 7) c = pal[3];
        if (t < 27) {                                                              // térreo
          if (u >= 5 && u < 15 && t < 20) {                                        // porta
            c = (u === 5 || u === 14 || t === 19) ? pal[3] : (u === 12 && t === 9 ? '#f0c840' : ((u + t) % 5 ? '#5a3a2a' : '#4a2e22'));
          } else if (u >= 18 && u < larg - 5 && t >= 4 && t < 19) {                // vitrine
            const borda = u === 18 || u === larg - 6 || t === 4 || t === 18;
            if (borda) c = pal[3];
            else if (noite) { c = t > 14 ? '#fff4c8' : '#ffd070'; tp = 2; if ((u - 22) % 9 < 3 && t < 9) c = '#8a5a3a'; }
            else c = t > 12 ? '#a8c8e0' : '#6a8aa8';
          }
          if (t >= 20 && t < 26) {                                                 // toldo listrado
            c = Math.floor(u / 5) % 2 ? P.toldo[0] : P.toldo[1];
            if (t === 20) c = '#2a2026';
            if (t === 25) c = '#ffffff';
          }
        } else if (t >= 28 && t < 35 && u > meio - 11 && u < meio + 11) {          // letreiro
          const borda = u === meio - 10 || u === meio + 10 || t === 28 || t === 34;
          c = borda ? pal[3] : ((t === 31 && (u % 3 !== 0)) ? (noite ? '#ffe890' : '#f0e0b0') : '#2a2a3a');
          if (!borda && t === 31 && u % 3 !== 0 && noite) tp = 2;
        } else if (t >= 38 && t < P.h - 8) {                                      // andares
          const andar = Math.floor((t - 38) / 24), ty = (t - 38) % 24;
          const nJan = Math.max(1, Math.floor((larg - 6) / 16));
          const ini = Math.floor((larg - nJan * 16) / 2) + 3;
          const col = Math.floor((u - ini) / 16), tx = (u - ini) % 16;
          if (u >= ini && col < nJan && tx < 9) {
            if (ty === 5) c = '#d8d0c0';                                           // peitoril
            else if (ty >= 6 && ty < 18) {
              const k = andar * 10 + col;
              if (!acesa.has(k)) acesa.set(k, noite && rw() < 0.5);
              const borda = tx === 0 || tx === 8 || ty === 6 || ty === 17;
              if (borda) c = pal[3];
              else if (acesa.get(k)) { c = ty > 13 ? '#fff0b8' : (tx === 4 ? '#e8b850' : '#ffd468'); tp = 2; }
              else c = ty > 12 ? '#3a4a6e' : (tx < 3 && ty < 10 ? '#6a7aa0' : '#26304e');
            } else if (ty === 18) c = pal[2];                                     // verga
          }
        }
        pintar(x, y, c, 0, s, t, tp, 1);
      },
      lado: (x, y, u, t, s) => {
        let c = P.tipo === 'tijolo' && t % 4 === 0 ? pal[3] : pal[2];
        if (t >= P.h - 6 && t < P.h - 2) c = '#a8a090';
        if (t >= P.h - 2) c = pal[3];
        if (t > 40 && t < P.h - 10 && (t - 38) % 24 > 7 && (t - 38) % 24 < 16 && u > 18 && u < 26) c = '#1e2438';
        pintar(x, y, c, s, P.j1, t, 1, 0.72);
      },
      topo: (x, y, i, j, d) => pintar(x, y, d < 0.12 ? '#7a7a8a' : d < 0.2 ? '#2e2e3a' : (bayer(x, y) < 0.12 ? '#4c4c5a' : '#40404e'), i, j, P.h, 1, 1.15),
    });
    // ar-condicionado no telhado
    const ci = -2.2 + rw() * 0.8, cj = P.j0 + 0.8 + rw() * Math.max(0.2, P.j1 - P.j0 - 2.2);
    prisma(ci, ci + 0.9, cj, cj + 0.7, P.h, 7, {
      frente: (x, y, u, t) => pintar(x, y, t === 7 ? '#b0b0bc' : (u % 3 === 0 && t > 1 && t < 6 ? '#3a3a46' : '#8a8a98'), ci + 0.9, cj, P.h + t, 1, 1),
      lado: (x, y, u, t, s) => pintar(x, y, '#626270', s, cj + 0.7, P.h + t, 1, 0.75),
      topo: (x, y, i, j) => pintar(x, y, (Math.floor(i * 10) + Math.floor(j * 10)) % 2 ? '#a8a8b4' : '#9a9aa8', i, j, P.h + 7, 1, 1.1),
    });
    if (noite) lojas.push({ i: 0.25, j: (P.j0 + P.j1) / 2 + 0.6, h: 10, raio: 1.8, forca: 0.6 });
  }

  // ---------- iluminação pixel a pixel ----------
  const postes = [];
  const passo = opc.distanciaPostes ?? 8;
  for (let j = J0 + 3; j < J1 - 1; j += passo) { postes.push({ i: FAIXA.calcadaFundo, j }); postes.push({ i: FAIXA.calcadaFrente, j: j + passo / 2 }); }
  const luzes = noite ? [...postes.map((p) => ({ ...p, h: 40, raio: 4.2, forca: 1 })), ...lojas] : [];
  const amb = noite ? [0.70, 0.74, 0.94] : [1, 1, 1];
  const corLuz = [1.0, 0.86, 0.6];
  const saida = new Uint8ClampedArray(N * 4), brilho = new Uint8ClampedArray(N * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (!tipo[k]) continue;
    let R = cor[k * 3], G = cor[k * 3 + 1], B = cor[k * 3 + 2];
    if (tipo[k] === 2) {                                                             // emissivo
      brilho.set([R * 255, G * 255, B * 255, 255], k * 4);
    } else {
      let nivel = 0;
      for (const L of luzes) {
        const di = pi[k] - L.i, dj = pj[k] - L.j, dv = (L.h - ph[k]) / PX_POR_UNIDADE_ALTURA;
        const d = Math.sqrt(di * di + dj * dj + dv * dv);
        nivel += Math.max(0, 1 - d / L.raio) * L.forca;
      }
      nivel = Math.min(1, nivel);
      // 3 faixas sólidas; o dithering aparece só numa borda estreita entre elas
      const q = Math.max(0, Math.min(3, Math.floor(nivel * 3 + 0.5 + (bayer(x, y) - 0.5) * 0.35))) / 3;
      const f = face[k];
      R = R * f * (amb[0] + q * corLuz[0] * 0.6);
      G = G * f * (amb[1] + q * corLuz[1] * 0.6);
      B = B * f * (amb[2] + q * corLuz[2] * 0.6);
    }
    saida.set([Math.min(255, R * 255), Math.min(255, G * 255), Math.min(255, B * 255), 255], k * 4);
  }
  return { W, H, imagem: saida, brilho, proj, postes, J0, J1, noite };
}
