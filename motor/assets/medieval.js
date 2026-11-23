// PROTÓTIPO — pacote MEDIEVAL (vila, castelo, taverna, salão do trono). Originais, no nosso estilo.
//   Pessoas (gerador de moradores, andam, sentam, têm expressões): rei, rainha, princesa, cavaleiro, campones, camponesa,
//     ferreiro, bruxa, mago.
//   Objetos isométricos (diorama): barril, carroca, poco, feno, tocha (fogo animado, com luz), estandarte (vermelho/azul),
//     barraca-medieval (feira).
//   Interiores (cômodos em diorama): salao-trono (pedra, estandartes, vitrais, tochas na parede, trono num degrau, tapete vermelho)
//     e taverna (madeira, lareira acesa, balcão com barris, mesas com canecas).
//   As fachadas (casa de enxaimel, taverna, ferreiro, muralha do castelo) e o chão de pedras ficam em motor/cenarios/ruaDiagonal.js;
//   cenários prontos em prototipos/cenarios.json: vila-medieval, castelo-medieval, salao-trono-diorama, taverna-diorama.
import { registrarSprites } from '../sprites.js';
import { pessoaComSentado as pessoa } from './moradores.js';
import { MOVEIS, COMODOS_DIAGONAL, DECOR } from '../cenarios/comodoDiagonal.js';
import { PRESETS_INTERIORES } from '../cenarios/interiores.js';
import { iso } from './praca.js';

// ------------------------------------------------------------------ pessoas
const OURO = { chapeu: '#f0c030', aba: '#c8901e' };
export const MEDIEVAIS = {
  rei: { cores: { pele: '#f0c4a0', cabelo: '#d8d4d0', bigode: '#e8e4e0', tronco: '#7a2a8a', calca: '#3a2448', sapato: '#3a2418', capa: '#c8283a', ...OURO, cinto: '#f0c030', emblema: '#f0c030' },
    cabelo: 'grisalho', chapeu: 'coroa', capa: true, cinto: true, emblema: true, bigode: true, corpo: 'largo', baixo: 'calca', golaCor: '#f4f0e8' },
  rainha: { cores: { pele: '#f4d0b0', cabelo: '#7a3a1e', tronco: '#3a6ac8', calca: '#2a4a9a', sapato: '#3a2418', capa: '#5a2a8a', ...OURO },
    cabelo: 'longo', chapeu: 'coroa', capa: true, colar: '#f0c030', baixo: 'saia-longa', golaCor: '#f4f0e8' },
  princesa: { cores: { pele: '#f8d8b8', cabelo: '#f0c860', tronco: '#f08ab8', calca: '#e06a9a', sapato: '#f8f0f8', ...OURO },
    cabelo: 'longo', chapeu: 'coroa', colar: '#f8f0f8', baixo: 'saia-longa', corpo: 'crianca', golaCor: '#ffffff' },
  cavaleiro: { cores: { pele: '#e0a882', cabelo: '#4a3424', tronco: '#a8acb8', calca: '#8a8e9a', sapato: '#4a4a54', chapeu: '#c8ccd8', aba: '#2a2a34', pluma: '#d83a3a', cinto: '#6a4a2a', escudo: '#3a5ac8', emblema: '#f0c840', lanca: '#7a5434', metal: '#d8dce4', capa: '#3a5ac8' },
    cabelo: 'curto', chapeu: 'elmo', escudo: true, lanca: true, cinto: true, capa: true, baixo: 'calca' },
  campones: { cores: { pele: '#d8a070', cabelo: '#6a4a2a', tronco: '#a8845a', calca: '#6a5a44', sapato: '#4a3424', cinto: '#4a3424' },
    cabelo: 'bagunçado', mangaCurta: true, cinto: true, baixo: 'calca' },
  camponesa: { cores: { pele: '#f0c8a8', cabelo: '#8a4a24', tronco: '#c8a87a', calca: '#6a8a5a', sapato: '#4a3424', avental: '#f4ecd8' },
    cabelo: 'coque', avental: true, baixo: 'saia-longa' },
  ferreiro: { cores: { pele: '#c88a64', cabelo: '#2a1e1a', bigode: '#2a1e1a', tronco: '#c8b8a0', avental: '#5a3a22', calca: '#3a3a44', sapato: '#2a2420' },
    cabelo: 'careca', bigode: true, avental: true, mangaCurta: true, corpo: 'largo', baixo: 'calca' },
  bruxa: { cores: { pele: '#c8d8a8', cabelo: '#2a2a3a', tronco: '#4a2a6a', calca: '#3a1e4a', sapato: '#1a1a24', chapeu: '#2a1e3a', aba: '#1e142a', capa: '#2a1e3a' },
    cabelo: 'longo', chapeu: 'bruxa', capa: true, colar: '#7af0a0', baixo: 'saia-longa', sorrisoLado: true },
  mago: { cores: { pele: '#f0c4a0', cabelo: '#e8e8f0', bigode: '#f4f4f8', tronco: '#3a4ab0', calca: '#2a3a8a', sapato: '#2a2a48', chapeu: '#3a4ab0', capa: '#2a3a8a', cinto: '#f0c840' },
    cabelo: 'grisalho', chapeu: 'capuz', capa: true, bigode: true, cinto: true, baixo: 'saia-longa' },
};

// ------------------------------------------------------------------ objetos (móveis isométricos, também usados nos interiores)
const MAD = ['#c8905a', '#9a6a3a', '#6a4424'], FERRO = ['#9aa0ac', '#6a6e7a', '#3a3a44'];
Object.assign(MOVEIS, {
  barril: { di: 0.6, dj: 0.6, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 16, { frente: (u, t, l) => (t === 3 || t === 12 ? FERRO[1] : Math.floor(u * 16) % 3 === 0 ? MAD[2] : MAD[1]), lado: (u, t) => (t === 3 || t === 12 ? FERRO[2] : MAD[2]),
      topo: (a, b, d) => (d < 0.08 ? MAD[2] : Math.floor(b * 16) % 3 === 0 ? MAD[1] : MAD[0]) });
  } },
  feno: { di: 0.8, dj: 1.2, f(L, m) {
    const { i0, i1, j0, j1 } = m, F = ['#f0d878', '#d8b850', '#a8883a'];
    L.caixa(i0, i1, j0, j1, 0, 12, { frente: (u, t) => (t === 5 || t === 6 ? '#8a6a3a' : (Math.floor(u * 16) + t) % 4 === 0 ? F[2] : F[1]), lado: F[2], topo: (a, b) => ((Math.floor(a * 12) + Math.floor(b * 9)) % 5 === 0 ? F[0] : F[1]) });
  } },
  carroca: { di: 1.2, dj: 2.2, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const b of [j0 + 0.3, j1 - 0.6]) L.caixa(i1 - 0.08, i1, b, b + 0.4, 0, 12, { frente: (u, t) => { const r = Math.hypot(u * 16 - 3.2, t - 6); return r > 5.5 ? null : r > 4.3 || Math.abs(u * 16 - 3.2) < 0.7 || Math.abs(t - 6) < 0.7 ? MAD[2] : null; }, lado: MAD[2], topo: MAD[2] });   // rodas
    L.caixa(i0 + 0.1, i1 - 0.1, j0, j1, 7, 8, { frente: (u, t) => (t === 0 || t === 7 ? MAD[2] : Math.floor(u * 4) % 2 ? MAD[0] : MAD[1]), lado: MAD[2], topo: (a, b, d) => (d < 0.08 ? MAD[2] : '#5a3a22') });
    L.caixa(i0 + 0.3, i1 - 0.3, j0 + 0.2, j0 + 0.9, 15, 5, { frente: '#d8b850', lado: '#a8883a', topo: '#f0d878' });   // feno em cima
    L.caixa(i0 + 0.5, i0 + 0.6, j1, j1 + 0.7, 9, 2, MAD[2]);                                                     // varal de puxar
  } },
  poco: { di: 1.2, dj: 1.2, f(L, m) {
    const { i0, i1, j0, j1 } = m, P = ['#b8b4ac', '#8e8a84', '#6a6660'];
    L.caixa(i0, i1, j0, j1, 0, 12, { frente: (u, t) => (t % 4 === 0 || (Math.floor(u * 16) + (Math.floor(t / 4) % 2) * 4) % 8 === 0 ? P[2] : P[1]), lado: P[2], topo: (a, b, d) => (d < 0.2 ? P[0] : '#2a4a6a') });
    for (const [a, b] of [[i0 + 0.05, j0 + 0.05], [i1 - 0.13, j1 - 0.13]]) L.caixa(a, a + 0.08, b, b + 0.08, 12, 22, MAD[2]);
    L.caixa(i0 - 0.1, i1 + 0.1, j0 - 0.1, j1 + 0.1, 34, 3, { frente: '#a84a3a', lado: '#7a3428', topo: '#c85a44' });   // telhadinho
    L.caixa(i0 + 0.5, i0 + 0.7, j0 + 0.45, j0 + 0.75, 18, 5, { frente: MAD[1], lado: MAD[2], topo: MAD[0] });       // balde
  } },
  'tocha-poste': { di: 0.25, dj: 0.25, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, k = ctx.op.chama || 0;
    L.caixa(i0, i1, j0, j1, 0, 30, { frente: MAD[2], lado: '#4a2e18', topo: MAD[1] });
    L.caixa(i0 - 0.05, i1 + 0.05, j0 - 0.05, j1 + 0.05, 30, 4, { frente: FERRO[1], lado: FERRO[2], topo: FERRO[2] });
    const alt = [9, 11, 10][k];
    L.caixa(i0, i1, j0, j1, 34, alt, { frente: (u, t) => (t > alt - 3 ? ['#fff0a0', 2] : (Math.floor(u * 16) + t + k) % 3 ? ['#ff9a2a', 2] : ['#ff5a1a', 2]), lado: ['#ff7a2a', 2], topo: ['#fff0a0', 2] });
  } },
  estandarte: { di: 0.3, dj: 1.0, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, c = ctx.op.cor === 'azul' ? ['#4a7ad8', '#2a4a9a'] : ['#d83a3a', '#9a2028'];
    L.caixa(i0, i1, j0, j0 + 0.1, 0, 52, MAD[2]); L.caixa(i0, i1, j0, j1, 50, 2, MAD[2]);
    L.caixa(i0 + 0.1, i1 - 0.1, j0 + 0.15, j1 - 0.05, 22, 28, { frente: (u, t, l) => { if (t < 4 && Math.abs(u - l / 2) > (t * l) / 8) return null; const g = Math.hypot(u - l / 2, (t - 15) / 16) < 0.18; return g ? '#f0c840' : t > 25 ? c[1] : c[0]; }, lado: c[1], topo: c[1] });
  } },
  'barraca-medieval': { di: 1.2, dj: 2.0, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 14, { frente: (u, t) => (t === 13 ? MAD[2] : MAD[1]), lado: MAD[2], topo: (a, b) => ((Math.floor(b * 5) % 3) === 0 ? '#e83a3a' : (Math.floor(b * 5) % 3) === 1 ? '#f0d040' : '#5ac84a') });   // frutas no balcão
    for (const b of [j0, j1 - 0.08]) L.caixa(i0, i0 + 0.08, b, b + 0.08, 14, 26, MAD[2]);
    L.caixa(i0 - 0.1, i1 + 0.2, j0 - 0.1, j1 + 0.1, 40, 3, { frente: (u) => (Math.floor(u * 4) % 2 ? '#f4ecd8' : '#c8283a'), lado: (u) => (Math.floor(u * 8) % 2 ? '#f4ecd8' : '#c8283a'), topo: (a, b) => (Math.floor(b * 4) % 2 ? '#f4ecd8' : '#c8283a') });
  } },
  // ---- interiores
  trono: { di: 1.0, dj: 1.2, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 4, { frente: '#c8283a', lado: '#9a1e2a', topo: '#d83a3a' });                       // degrau com tapete
    L.caixa(i0 + 0.2, i1 - 0.2, j0 + 0.2, j1 - 0.2, 4, 10, { frente: (u, t) => (t > 7 ? '#d83a3a' : '#f0c030'), lado: '#c8901e', topo: '#d83a3a' });   // assento
    L.caixa(i0 + 0.1, i0 + 0.3, j0 + 0.1, j1 - 0.1, 4, 36, { frente: (u, t, l) => { if (t > 30 && Math.abs(u - l / 2) > (36 - t) * 0.06) return null; return t > 28 ? '#f0c030' : u < 0.12 || u > l - 0.12 ? '#f0c030' : '#c8283a'; }, lado: '#c8901e', topo: '#f0c030' });   // encosto alto
    L.caixa(i0 + 0.12, i0 + 0.28, (j0 + j1) / 2 - 0.08, (j0 + j1) / 2 + 0.08, 40, 3, ['#7af0ff', 2]);                         // pedra no alto
  } },
  lareira: { di: 0.8, dj: 1.8, f(L, m) {
    const { i0, i1, j0, j1 } = m, P = ['#b8a898', '#8e8070', '#5a5048'];
    L.caixa(i0, i1, j0, j1, 0, 40, { frente: (u, t, l) => {
      const dx = u - l / 2;
      if (Math.abs(dx) < 0.5 && t > 2 && t < 18) return t < 6 ? ['#fff0a0', 2] : (Math.floor(u * 16) + t) % 3 ? ['#ff8a2a', 2] : ['#ff4a1a', 2];
      if (Math.abs(dx) < 0.65 && t < 21) return '#1a1414';
      if (t > 22 && t < 25) return MAD[2];
      return t % 5 === 0 || (Math.floor(u * 16) + (Math.floor(t / 5) % 2) * 4) % 8 === 0 ? P[2] : P[1];
    }, lado: P[2], topo: P[0] });
  } },
  'mesa-taverna': { di: 1.2, dj: 1.6, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const [a, b] of [[i0 + 0.1, j0 + 0.1], [i1 - 0.2, j0 + 0.1], [i0 + 0.1, j1 - 0.2], [i1 - 0.2, j1 - 0.2]]) L.caixa(a, a + 0.1, b, b + 0.1, 0, 12, MAD[2]);
    L.caixa(i0, i1, j0, j1, 12, 3, { frente: MAD[1], lado: MAD[2], topo: (a, b) => (Math.floor(b * 8) % 4 === 0 ? MAD[2] : MAD[0]) });
    for (const [a, b] of [[0.3, 0.4], [0.7, 1.1]]) L.caixa(i0 + a, i0 + a + 0.15, j0 + b, j0 + b + 0.15, 15, 5, { frente: (u, t) => (t > 3 ? '#fff4d8' : '#c8a060'), lado: '#a8803a', topo: '#fff8e8' });   // canecas
    L.caixa(i0 + 0.5, i0 + 0.75, j0 + 0.7, j0 + 0.95, 15, 2, { frente: '#c8a060', topo: '#e8c878' });                     // pão
  } },
  'balcao-taverna': { di: 0.8, dj: 3.0, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 18, { frente: (u, t, l) => (t > 15 || t < 2 || Math.floor(u * 3) % 3 === 0 ? MAD[2] : MAD[1]), lado: MAD[2], topo: MAD[0] });
    for (const b of [0.4, 1.2]) L.caixa(i0 + 0.25, i0 + 0.45, j0 + b, j0 + b + 0.2, 18, 6, { frente: (u, t) => (t > 4 ? '#fff4d8' : '#c8a060'), lado: '#a8803a', topo: '#fff8e8' });
  } },
});

// decorações de parede (interiores)
Object.assign(DECOR, {
  'estandarte-parede'(d, u, U, t) {   // estandarte pendurado (pano com coroa dourada, ponta em V embaixo, varão em cima)
    const y0 = d.altura ?? 40, h = d.h ?? 40, tt = t - y0;
    if (tt === h + 1 || tt === h + 2) return '#6a4424';
    if (tt < 0 || tt > h) return null;
    if (tt < 8 - Math.abs(u - U / 2) * (16 / U)) return null;
    const cor = d.cor === 'azul' ? ['#4a7ad8', '#2a4a9a'] : ['#d83a3a', '#9a2028'];
    const cy = h * 0.62, dx = u - U / 2;
    if (Math.abs(dx) < U * 0.25 && tt > cy - 3 && tt < cy + 3 && (tt < cy || Math.abs(dx) % 3 < 1)) return '#f0c840';
    return u < 2 || u > U - 3 ? cor[1] : cor[0];
  },
  vitral(d, u, U, t) {   // janela alta em arco com vidro colorido em losangos
    const y0 = d.peitoril ?? 44, h = d.h ?? 36, tt = t - y0, r = U / 2, dx = u - r;
    const alto = h - r + Math.sqrt(Math.max(0, r * r - dx * dx));
    if (tt < -2 || tt > alto + 1) return null;
    if (tt < 0 || tt >= alto || u < 1 || u > U - 2) return '#8a8a94';
    if ((u + tt) % 6 === 0 || (u - tt + 600) % 6 === 0) return '#3a3a44';
    return ['#e84a5a', '#4a8ae8', '#f8d040', '#5ac86a'][Math.floor((u + tt) / 6 + (u - tt + 600) / 6) % 4];
  },
  'tocha-parede'(d, u, U, t) {   // suporte de ferro com chama (brilha)
    const y0 = d.altura ?? 44, cx = U / 2, tt = t - y0;
    if (Math.abs(u - cx) < 1 && tt >= 0 && tt < 8) return '#3a3a44';
    if (Math.abs(u - cx) < 2 && tt >= 8 && tt < 10) return '#6a6e7a';
    if (Math.abs(u - cx) < 2.5 - (tt - 10) * 0.25 && tt >= 10 && tt < 18) return { c: tt > 14 ? '#fff0a0' : (u + tt) % 2 ? '#ff9a2a' : '#ff5a1a', brilho: true };
    return null;
  },
  'escudos-parede'(d, u, U, t) {   // dois escudos cruzados com espadas (salão)
    const y0 = d.altura ?? 50;
    for (const [cx, cor] of [[U * 0.3, '#3a5ac8'], [U * 0.7, '#d83a3a']]) { const dx = u - cx, dy = t - y0; if (Math.abs(dx) < 5 - Math.max(0, -dy) * 0.4 && dy > -8 && dy < 5) return Math.abs(dx) < 1 || Math.abs(dy + 1) < 1 ? '#f0c840' : cor; }
    if (Math.abs((u - U / 2) - (t - y0 - 4)) < 0.8 || Math.abs((u - U / 2) + (t - y0 - 4)) < 0.8) return (u + t) % 4 ? '#d8dce4' : '#9aa0ac';
    return null;
  },
});
// a decoração pode devolver { c, brilho }: o cômodo aceita objeto com brilho? se não, vira só a cor
for (const k of ['tocha-parede']) { const f = DECOR[k]; DECOR[k] = (...a) => { const r = f(...a); return r && typeof r === 'object' ? r.c : r; }; }

PRESETS_INTERIORES['salao-trono'] = {
  ceu: { cores: ['#d8d0c8'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#c8c0b8', '#aaa29a', '#7e766e'], padrao: 'tijolo', teto: ['#8a7a6a', '#6a5a4a', '#4a3a2a'],
    rodape: ['#6a625a', '#56504a', '#3e3a36'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#c8c4bc', '#a8a49c', '#6a6660'], terra: ['#8a8680', '#6a6660'] },
  ambiente: ['#fff8ee', 0.95],
};
PRESETS_INTERIORES.taverna = {
  ceu: { cores: ['#e8d8c0'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#c8a070', '#a8804e', '#7a5a34'], padrao: 'listras', teto: ['#7a5434', '#5a3a22', '#3a2416'],
    meiaParede: { altura: 30, padrao: 'lambri', cores: ['#9a6a3a', '#7a4e2a', '#4a2e18'] },
    rodape: ['#4a2e18', '#3a2414', '#2a1a0e'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#a8804e', '#8a6438', '#5a3e22'], terra: ['#7a5a34', '#5a4024'] },
  ambiente: ['#fff4e4', 0.95],
};
// SALÃO DO TRONO: trono num degrau no meio do fundo (x 0), tapete vermelho até a frente, estandartes, vitrais, tochas.
// Rei sentado no trono: x 0, z ~3.0, "pose": "sentado", "y": 0.55. Guardas dos lados (x ±2.6, z 2.4); visitantes z 0–1.2.
COMODOS_DIAGONAL['salao-trono'] = {
  estilo: 'salao-trono', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'vitral', x: -6.0, w: 1.6, peitoril: 50, h: 34 }, { tipo: 'vitral', x: 6.0, w: 1.6, peitoril: 50, h: 34 },
    { tipo: 'estandarte-parede', x: -2.4, w: 1.4, altura: 30, h: 48 }, { tipo: 'estandarte-parede', x: 2.4, w: 1.4, altura: 30, h: 48, cor: 'azul' },
    { tipo: 'tocha-parede', x: -4.2, w: 0.6, altura: 44 }, { tipo: 'tocha-parede', x: 4.2, w: 0.6, altura: 44 },
    { tipo: 'escudos-parede', x: 0, w: 2.4, altura: 76 },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#8a5a34', '#6a4424', '#4a2e18'] },
  ],
  moveis: [{ tipo: 'trono', x: 0, i: 0.1 }, { tipo: 'estandarte', x: -7.8, i: 0.2 }, { tipo: 'estandarte', x: 7.8, i: 0.2, cor: 'azul' }],
  piso: [{ x: 0, i0: 1.1, i1: 4.2, dj: 1.6, cor: ['#c8283a', '#9a1e2a', '#f0c030'] }],
};
// TAVERNA: lareira acesa no fundo, balcão com canecas e barris à direita, mesas com canecas e pão, banquetas.
// Pessoas: z 0–1.6 (frente) e atrás do balcão (x ~5.6, z ~2.8). Sentados nas banquetas: "pose": "sentado".
COMODOS_DIAGONAL.taverna = {
  estilo: 'taverna', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'janela', x: -6.6, w: 1.6, peitoril: 44, h: 24 }, { tipo: 'escudos-parede', x: 1.8, w: 2.4, altura: 70 },
    { tipo: 'tocha-parede', x: -4.2, w: 0.6, altura: 46 }, { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#8a5a34', '#6a4424', '#4a2e18'] },
  ],
  moveis: [
    { tipo: 'lareira', x: -2.0, i: 0 }, { tipo: 'balcao-taverna', x: 5.6, i: 1.2 },
    { tipo: 'barril', x: 4.4, i: 0.1 }, { tipo: 'barril', x: 5.2, i: 0.1 }, { tipo: 'barril', x: 7.6, i: 0.2 },
    { tipo: 'mesa-taverna', x: -5.4, i: 1.6 }, { tipo: 'banqueta', x: -6.8, i: 1.9 }, { tipo: 'banqueta', x: -4.0, i: 1.9 },
    { tipo: 'mesa-taverna', x: 0.8, i: 1.9 }, { tipo: 'banqueta', x: -0.6, i: 2.2 }, { tipo: 'banqueta', x: 2.2, i: 2.2 },
  ],
  piso: [],
};

registrarSprites({
  ...Object.fromEntries(Object.entries(MEDIEVAIS).map(([k, p]) => [k, () => pessoa(p)])),
  barril: () => iso({ parado: { tipo: 'barril' } }), feno: () => iso({ parado: { tipo: 'feno' } }),
  carroca: () => iso({ parado: { tipo: 'carroca' } }), poco: () => iso({ parado: { tipo: 'poco' } }),
  'barraca-medieval': () => iso({ parado: { tipo: 'barraca-medieval' } }),
  estandarte: () => iso({ parado: { tipo: 'estandarte' }, vermelho: { tipo: 'estandarte' }, azul: { tipo: 'estandarte', op: { cor: 'azul' } } }),
  tocha: () => {   // fogo animado (3 desenhos) com luz
    const s = iso({ a: { tipo: 'tocha-poste', op: { chama: 0 } }, b: { tipo: 'tocha-poste', op: { chama: 1 } }, c: { tipo: 'tocha-poste', op: { chama: 2 } } }, { luz: { cor: '#ffa040', intensidade: 1.4, alcance: 4.5, dy: 2.6 } });
    s.anims = { parado: { q: [0, 1, 2, 1], fps: 8 } };
    return s;
  },
}, { grupo: 'Medieval (vila, castelo, taverna)', status: 'protótipo' });
