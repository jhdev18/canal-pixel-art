// PROTÓTIPO (terror dos brinquedos): interiores da LOJA DE BRINQUEDOS e da FÁBRICA DE BRINQUEDOS, no sistema de cômodos em
// diorama (enchem a tela, como a cozinha e o quarto). De dia e bem iluminados (as táticas de retenção pedem dia).
// Cenários (prototipos/cenarios.json): loja-brinquedos-diorama, fabrica-brinquedos-diorama.
// As fachadas ficam na rua (motor/cenarios/ruaDiagonal.js, prédios "brinquedos" e "fabrica"):
//   rua-brinquedos (a rua comercial com a loja no lugar do prédio comum da esquerda) e fabrica-brinquedos (a fábrica no campo).
// Móveis novos: prateleira-brinquedos, balcao-loja, caixa-presentes, esteira, maquina-brinquedos, caixa-pecas.
import { MOVEIS, COMODOS_DIAGONAL } from '../cenarios/comodoDiagonal.js';
import { PRESETS_INTERIORES } from '../cenarios/interiores.js';
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const MAD = ['#d8a070', '#b07a4a', '#7a4e2a'], METAL = ['#c8ccd8', '#9aa0ac', '#5a5e6a'];
const CORES = ['#e83a3a', '#3a8ad8', '#f8d040', '#3ab060', '#d84a8a', '#8a5ac8', '#f08a30'];

// brinquedo pequeno na prateleira (frente de cada nicho): bola, bloco, soldadinho, pião, boneca, robozinho
function brinquedoNicho(k, du, dt, alt) {
  const tipo = k % 6, c = CORES[k % CORES.length];
  if (tipo === 0) return (du - 0.25) ** 2 * 256 + (dt - 3) ** 2 < 10 ? (du < 0.25 ? c : '#ffffff') : null;           // bola
  if (tipo === 1) return du > 0.06 && du < 0.44 && dt < 6 ? (dt === 5 ? '#ffffff' : c) : null;                       // bloco
  if (tipo === 2) return du > 0.16 && du < 0.34 && dt < alt ? (dt > 7 ? '#c83040' : dt > 5 ? '#f4c8a4' : dt > 2 ? '#3a5ac8' : '#ffffff') : null;   // soldadinho
  if (tipo === 3) return Math.abs(du - 0.25) * 16 < 4 - Math.abs(dt - 3) && dt < 7 ? (dt % 2 ? c : '#ffffff') : null;   // pião
  if (tipo === 4) return du > 0.14 && du < 0.36 && dt < alt ? (dt > 7 ? '#e06a2a' : dt > 5 ? '#f8d8bc' : c) : null;   // boneca
  return du > 0.1 && du < 0.4 && dt < 7 ? (dt > 3 ? '#a8b4c4' : '#6a7484') : null;                                   // robozinho
}

Object.assign(MOVEIS, {
  // prateleira alta cheia de brinquedos (4 andares). op.pecas: true = peças soltas (cabeças, braços) na fábrica
  'prateleira-brinquedos': { di: 0.55, dj: 1.8, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, pecas = ctx.op.pecas;
    L.caixa(i0, i1, j0, j1, 0, 54, {
      frente: (u, t, l) => {
        if (u < 0.08 || u > l - 0.08 || t < 2 || t > 51 || t % 13 < 2) return u < 0.08 ? MAD[0] : MAD[1];
        const k = Math.floor(u / 0.5) + Math.floor(t / 13) * 7, du = u % 0.5, dt = (t % 13) - 2;
        if (pecas) {   // cabeças de boneca enfileiradas (olhos pretos) e braços
          if (k % 2 === 0) { const d = (du - 0.25) ** 2 * 256 + (dt - 4) ** 2; return d < 12 ? (dt === 5 && (Math.abs(du - 0.18) < 0.04 || Math.abs(du - 0.32) < 0.04) ? '#14121c' : '#f8d8bc') : '#4a3a30'; }
          return du > 0.06 && du < 0.44 && dt > 1 && dt < 4 ? '#f4c8a4' : '#4a3a30';
        }
        return brinquedoNicho(k, du, dt, 10) || '#6a4a30';
      },
      lado: MAD[2], topo: MAD[0] });
  } },
  // balcão da loja com caixa registradora e um laço de presente
  'balcao-loja': { di: 0.9, dj: 2.4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 16, { frente: (u, t, l) => (t > 13 || t < 2 ? MAD[2] : Math.floor(u * 4) % 2 ? '#f8e060' : '#d84a8a'), lado: MAD[1], topo: MAD[0] });
    L.caixa(i0 + 0.15, i0 + 0.55, j1 - 0.8, j1 - 0.3, 16, 7, { frente: (u, t) => (t > 4 ? '#3a3a4a' : t === 2 && u > 0.1 && u < 0.4 ? ['#5ae070', 2] : '#5a5a6a'), lado: '#2a2a36', topo: '#6a6a7a' });   // caixa registradora
    L.caixa(i0 + 0.25, i0 + 0.6, j0 + 0.3, j0 + 0.65, 16, 6, { frente: (u) => (Math.abs(u - 0.17) < 0.04 ? '#f8e060' : '#3ab060'), lado: '#2a8a4a', topo: (a, b) => (Math.abs(b - 0.17) < 0.04 || Math.abs(a - 0.17) < 0.04 ? '#f8e060' : '#3ab060') });   // presente
  } },
  // pilha de caixas de presente
  'caixa-presentes': { di: 0.8, dj: 0.8, f(L, m) {
    const { i0, j0 } = m;
    const caixa = (a, b, h0, tam, h, c, fita) => L.caixa(a, a + tam, b, b + tam, h0, h, { frente: (u) => (Math.abs(u - tam / 2) < 0.04 ? fita : c), lado: (u) => (Math.abs(u - tam / 2) < 0.04 ? fita : c), topo: (x, y) => (Math.abs(x - tam / 2) < 0.04 || Math.abs(y - tam / 2) < 0.04 ? fita : c) });
    caixa(i0, j0, 0, 0.8, 10, '#3a8ad8', '#f8e060'); caixa(i0 + 0.15, j0 + 0.15, 10, 0.5, 8, '#e83a3a', '#ffffff'); caixa(i0 + 0.25, j0 + 0.25, 18, 0.3, 6, '#f8d040', '#d84a8a');
  } },
  // esteira da fábrica: roletes na frente, faixa escura em cima com brinquedos pela metade (cabeças e corpos)
  esteira: { di: 0.9, dj: 4.2, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const b of [j0 + 0.1, j1 - 0.25]) for (const a of [i0 + 0.05, i1 - 0.2]) L.caixa(a, a + 0.15, b, b + 0.15, 0, 10, METAL[2]);
    L.caixa(i0, i1, j0, j1, 10, 4, { frente: (u, t) => (t === 3 ? '#2a2a36' : Math.floor(u * 6) % 2 ? METAL[1] : METAL[2]), lado: METAL[2],
      topo: (a, b, d) => {
        if (d < 0.06) return METAL[0];
        const k = Math.floor(b / 0.6), db = b % 0.6, da = a - 0.45;
        if (k % 2 === 0 && (db - 0.3) ** 2 + da ** 2 < 0.04) return db > 0.22 && db < 0.38 && Math.abs(da) < 0.04 ? '#14121c' : '#f8d8bc';   // cabeça de boneca
        if (k % 2 === 1 && Math.abs(db - 0.3) < 0.14 && Math.abs(da) < 0.2) return CORES[k % CORES.length];                                  // corpinho
        return Math.floor(b * 8) % 2 ? '#2a2a34' : '#3a3a44';
      } });
  } },
  // máquina grande de montar brinquedos: luzes piscando (acesas), funil em cima, braço com garra
  'maquina-brinquedos': { di: 1.2, dj: 2.0, f(L, m) {
    const { i0, i1, j0, j1 } = m, cj = (j0 + j1) / 2;
    L.caixa(i0, i1, j0, j1, 0, 40, { frente: (u, t, l) => {
      if (t < 3 || u < 0.08 || u > l - 0.08) return METAL[2];
      if (t > 28 && t < 34 && u > 0.3 && u < l - 0.3) return Math.floor(u * 5) % 3 === 0 ? ['#ff4a3a', 2] : Math.floor(u * 5) % 3 === 1 ? ['#f8e060', 2] : ['#5ae070', 2];   // luzes
      if (t > 8 && t < 24 && Math.abs(u - l / 2) < 0.5) return t > 20 ? '#1a1a24' : '#2a2a36';   // boca da máquina
      return t % 10 === 0 ? METAL[2] : '#d8a040';
    }, lado: '#a87820', topo: METAL[1] });
    L.caixa(i0 + 0.3, i1 - 0.3, cj - 0.4, cj + 0.4, 40, 10, { frente: METAL[1], lado: METAL[2], topo: '#2a2a34' });   // funil
    L.caixa(i1 - 0.15, i1, cj - 0.06, cj + 0.06, 18, 14, METAL[0]);                                                     // braço
  } },
  // caixote cheio de peças (cabeças de boneca olhando para cima)
  'caixa-pecas': { di: 0.8, dj: 0.9, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 12, { frente: (u, t) => (t === 6 || Math.floor(u * 8) % 4 === 0 ? MAD[2] : MAD[1]), lado: MAD[2],
      topo: (a, b, d) => {
        if (d < 0.08) return MAD[0];
        const ka = Math.floor(a / 0.26), kb = Math.floor(b / 0.26), da = a % 0.26 - 0.13, db = b % 0.26 - 0.13;
        if (da * da + db * db < 0.012) return Math.abs(da) < 0.03 && Math.abs(db) > 0.03 && Math.abs(db) < 0.07 ? '#14121c' : ((ka + kb) % 3 ? '#f8d8bc' : '#f4c8a4');
        return '#3a2a20';
      } });
  } },
});

PRESETS_INTERIORES['loja-brinquedos'] = {
  ceu: { cores: ['#fff4e0'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#fff0f8', '#f8d8e8', '#d8a8c0'], padrao: 'listras', teto: ['#fffaf0', '#f0e4d0', '#c0ac90'],
    meiaParede: { altura: 26, padrao: 'lambri', cores: ['#a8d8f0', '#7ab8e0', '#4a88b8'] },
    rodape: ['#4a88b8', '#3a6a9a', '#2a4a7a'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#f8f0e0', '#e0d0b8', '#d84a8a'], terra: ['#c8b8a8', '#a89888'] },
  ambiente: ['#ffffff', 1.0],
};
PRESETS_INTERIORES['fabrica-brinquedos'] = {
  ceu: { cores: ['#d8d4d0'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#e0c8d0', '#c8aab8', '#8a7484'], padrao: 'tijolo', teto: ['#d8c0a0', '#a88a6a', '#6a4a34'],   // pedra do castelo, desbotada
    meiaParede: { altura: 22, padrao: 'lambri', cores: ['#9a6a44', '#7a5434', '#4a3020'] },
    rodape: ['#3a3a44', '#2e2e38', '#22222a'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#c8c8c4', '#a8a8a4', '#f8d040'], terra: ['#8a8a88', '#6a6a68'] },
  ambiente: ['#fffaf0', 0.96],
};

// LOJA: prateleiras no fundo, balcão à direita, presentes. Pessoas: z de 0 (frente) a ~2.6; quem atende fica atrás do balcão
// (x ~4.4, z ~2.6). Animatrônicos de brinquedo: em pé entre as prateleiras (x -6.8, -3.4, -0.2, z ~2.4) ou no meio da loja.
COMODOS_DIAGONAL['loja-brinquedos'] = {
  estilo: 'loja-brinquedos', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'janela', x: 6.6, w: 2.2, cortina: ['#f8e060', '#d8b030'], peitoril: 36 },
    { tipo: 'poster', x: -1.8, w: 1.2, altura: 64, h: 20, cores: ['#d84a8a', '#b83a7a'] }, { tipo: 'relogio', x: 1.6, w: 0.9, altura: 66, h: 14 },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#a8d8f0', '#7ab8e0', '#4a88b8'] },
  ],
  moveis: [
    { tipo: 'prateleira-brinquedos', x: -5.1, i: 0 }, { tipo: 'prateleira-brinquedos', x: -1.7, i: 0 },
    { tipo: 'balcao-loja', x: 4.4, i: 1.4 }, { tipo: 'caixa-presentes', x: 1.6, i: 0.2 }, { tipo: 'bau-brinquedos', x: 7.6, i: 0.2 },
  ],
  piso: [{ x: -1.0, i0: 1.2, i1: 2.6, dj: 3.2, cor: ['#f8e060', '#e8c040', '#ffffff'] }],
};
// FÁBRICA: esteira no meio, máquina no fundo à esquerda, prateleira de peças, caixotes. Pessoas: z de 0 a ~1.6 (na frente
// da esteira) ou x > 3 (lado direito livre). Brinquedos "saindo" da máquina: comece em x ~-4.6, z ~1.4 e ande para a direita.
COMODOS_DIAGONAL['fabrica-brinquedos'] = {
  estilo: 'fabrica-brinquedos', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'janela', x: 4.6, w: 2.6, peitoril: 56, h: 22 }, { tipo: 'relogio', x: 0.6, w: 1, altura: 70, h: 14 },
    { tipo: 'poster', x: 7.6, w: 1.2, altura: 46, h: 20, cores: ['#f8e060', '#2a2a36'] },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#9aa0ac', '#7a808c', '#5a5e6a'] },
  ],
  moveis: [
    { tipo: 'maquina-brinquedos', x: -6.4, i: 0 }, { tipo: 'prateleira-brinquedos', x: -2.4, i: 0, pecas: true },
    { tipo: 'esteira', x: -0.2, i: 1.6 }, { tipo: 'caixa-pecas', x: 3.6, i: 0.3 }, { tipo: 'caixa-pecas', x: 6.4, i: 0.4 },
  ],
  piso: [{ x: 5.6, i0: 1.8, i1: 2.6, dj: 3.0, cor: ['#f8d040', '#2a2a36', '#f8d040'] }],
};

// fumaça da chaminé (8 quadros): bolotas que sobem, crescem e somem; levemente lilás (fantasia). A rua da fábrica põe uma em
// cima de cada chaminé sozinha (rua.fumacas); também serve como elemento comum: { "sprite": "fumaca-chamine" }.
function quadroFumaca(f) {
  const W = 28, H = 60, p = new Pix(W, H), N = 6, cores = ['#ffffff', '#ece6f0', '#cfc6d8', '#a89cb4'];
  for (let k = 0; k < N; k++) {
    const fase = ((k + f / 8) / N) % 1, y = H - 4 - fase * (H - 10), r = 3 + fase * 7;
    const x = W / 2 + Math.sin((k * 1.7 + fase * 3.2)) * (2 + fase * 4);
    if (fase > 0.85 && (k + f) % 2) continue;                                            // as de cima vão sumindo
    p.circulo(x, y, r, (xx, yy, dx, dy) => Pix.tom(cores, 0.25 + dy * 0.35 + dx * 0.15 + fase * 0.35, xx, yy));
  }
  return p;
}
registrarSprites({
  'fumaca-chamine': () => { const quadros = [0, 1, 2, 3, 4, 5, 6, 7].map(quadroFumaca); return { quadros, anims: { parado: { q: [0, 1, 2, 3, 4, 5, 6, 7], fps: 6 } }, sombra: false }; },
}, { grupo: 'Loja e fábrica de brinquedos', status: 'protótipo' });
