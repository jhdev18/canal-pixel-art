// PROTÓTIPOS (aguardando aprovação): personagens, objetos e itens de praça para histórias futuras.
// Tudo já no formato do diorama: moradores 28x44 (andam, sentam, costas) e objetos isométricos
// (x/z = canto da frente, como os da praça).
import { Pix } from './pixel.js';
import { registrarSprites } from './sprites.js';
import { pessoaComSentado, MORADORES } from './sprites-cidade.js';
import { MOVEIS } from './cenarios/comodoDiagonal.js';
import { iso } from './sprites-praca.js';
import { desenharTexto, larguraTexto } from './fonte.js';
import { rng } from './compartilhado/util.js';

const K = '#1a1c2c';

// ---------------------------------------------------------------- personagens
export const NOVOS_MORADORES = {
  // carteiro apressado: quepe azul, bolsa de couro (alças), bermuda
  carteiro: { cores: { pele: '#d8a070', cabelo: '#3a2618', tronco: '#f0c830', calca: '#2a4a9a', sapato: '#3a2a20', chapeu: '#2a4a9a', aba: '#1e3a7a', mochila: '#8a5a2a', meia: '#f0f0f0' },
    cabelo: 'curto', chapeu: 'quepe', baixo: 'bermuda', meias: true, mangaCurta: true, mochila: true },
  // vovó do banco da praça: coque grisalho, óculos, xale roxo, saia longa
  vovo: { cores: { pele: '#f0c8a8', cabelo: '#d8d8e0', tronco: '#e8dcc8', casaco: '#7a5aa8', calca: '#5a4a6a', sapato: '#4a3a30' },
    cabelo: 'coque', baixo: 'saia-longa', casaco: true, oculos: true },
  // sorveteiro: boné e avental brancos, camisa listrada (azul)
  sorveteiro: { cores: { pele: '#c88a64', cabelo: '#2a1e1a', bigode: '#2a1e1a', tronco: '#5ab8e0', avental: '#fafaf4', calca: '#3a4a6a', sapato: '#2a2a30', chapeu: '#fafaf4', aba: '#e0e0e8' },
    cabelo: 'curto', chapeu: 'bone', baixo: 'calca', avental: true, mangaCurta: true, bigode: true, corpo: 'largo' },
  // rival da Bia: mesma idade, capa azul, rabo de cavalo
  rival: { cores: { pele: '#e0a882', cabelo: '#2a1a12', tronco: '#f4f4f4', calca: '#3a3a5a', sapato: '#c83c4c', capa: '#2a5ad8' },
    cabelo: 'rabo', baixo: 'calca', capa: true, corpo: 'crianca', golaCor: '#2a5ad8' },
  // garoto fantasma em vida? não: menino comum de pijama (para cenas à noite com fantasmas)
  'menino-pijama': { cores: { pele: '#f0c4a0', cabelo: '#6a4a2a', tronco: '#8ad0f0', calca: '#8ad0f0', sapato: '#e8e8f0' },
    cabelo: 'bagunçado', baixo: 'calca', corpo: 'crianca', golaCor: '#f4f4f4' },
};

// ---------------------------------------------------------------- gato de rua com chapéu (de lado, anda)
function gato(f, { andando = false, piscar = false } = {}) {
  const p = new Pix(20, 16), pel = ['#4a4a5a', '#5a5a6e', '#7a7a90'], ch = '#2a2a36';
  p.elipse(8, 10.5, 6, 3.2, (x, y, dx, dy) => Pix.tom([pel[0], pel[1], pel[2]], 0.65 - dy * 0.5, x, y));   // corpo
  p.elipse(15, 7.5, 3.4, 3, (x, y, dx, dy) => Pix.tom([pel[0], pel[1], pel[2]], 0.7 - dy * 0.5, x, y));   // cabeça
  p.set(13, 4, pel[1]); p.set(17, 4, pel[1]);                                                           // orelhas
  const pa = andando ? [[3, f % 2], [6, (f + 1) % 2], [10, f % 2], [12, (f + 1) % 2]] : [[3, 0], [6, 0], [10, 0], [12, 0]];
  for (const [x, d] of pa) p.ret(x, 13 - d, 1, 2 + d, pel[0]);
  const rb = Math.round(Math.sin(f * Math.PI / 2) * 1.5);
  p.ret(1, 6 + rb, 1, 4, pel[1]); p.set(2, 9, pel[1]);                                                   // rabo
  // chapéu-coco
  p.ret(13, 1, 4, 3, ch); p.ret(12, 3, 6, 1, ch); p.set(14, 2, '#c83c4c'); p.set(15, 2, '#c83c4c');
  p.contorno(K);
  if (piscar) { p.set(16, 7, '#3a3a48'); p.set(17, 7, '#3a3a48'); } else { p.set(16, 7, '#f8e040'); p.set(17, 7, '#3a3a10'); }
  p.set(18, 8, '#f0a0b0');
  return p;
}

// ---------------------------------------------------------------- objetos pequenos (de pé ou no chão)
const O = {
  // bilhete misterioso: parado / brilhando (camada que brilha)
  bilhete: [['.kkkkkkk.', 'kwwwwwwwk', 'kwkkkkwwk', 'kwwwwwwwk', 'kwkkkwwwk', 'kwwwwwwwk', '.kkkkkkk.'], { k: '#5a4a3a', w: '#f4ecd0' }],
  'carta-fechada': [['kkkkkkkkkkk', 'kwkwwwwwkwk', 'kwwkwwwkwwk', 'kwwwkrkwwwk', 'kwwwwwwwwwk', 'kkkkkkkkkkk'], { k: '#5a4a3a', w: '#f0e8d8', r: '#c83c4c' }],
  'carta-aberta': [['.kkkkkkkkk.', 'kwwwwwwwwwk', 'kwkkkkkkwwk', 'kwwwwwwwwwk', 'kwkkkkkwwwk', 'kwwwwwwwwwk', 'kwkkkwwwwwk', 'kwwwwwwwwwk', 'kkkkkkkkkkk'], { k: '#5a4a3a', w: '#f8f4e8' }],
  mapa: [['.kkkkkkkkkk.', 'kyyyygyyyyyk', 'kyyggyyybyyk', 'kygyyyybbyyk', 'kyyyrryyyyyk', 'kyyyrxryyyyk', 'kyyyyrryyggk', 'kyyyyyyyygyk', '.kkkkkkkkkk.'], { k: '#6a4a2a', y: '#e8d8a0', g: '#6aa860', b: '#5a9ad8', r: '#c83c4c', x: '#1a1c2c' }],
  'cadeado-fechado': [['..kkkk..', '.k....k.', '.k....k.', 'kkkkkkkk', 'kyyyyyyk', 'kyyxxyyk', 'kyyxxyyk', 'kyyyyyyk', 'kkkkkkkk'], { k: '#3a3a4a', y: '#e8c040', x: '#1a1c2c' }],
  'cadeado-aberto': [['..kkkk..', '.k....k.', '......k.', 'kkkkkkkk', 'kyyyyyyk', 'kyyxxyyk', 'kyyxxyyk', 'kyyyyyyk', 'kkkkkkkk'], { k: '#3a3a4a', y: '#e8c040', x: '#1a1c2c' }],
};
function objeto(m, c) { return Pix.deAscii(m, c); }
// pegadas brilhantes no chão (deitadas na diagonal do diorama): 3 pares
function pegadas(cor) {
  const p = new Pix(40, 14);
  for (let k = 0; k < 4; k++) { const x = 3 + k * 9, y = 9 - k * 2 + (k % 2) * 2; p.elipse(x, y, 2.2, 1.2, cor); p.set(x + 2, y - 1, cor); }
  return p;
}
// cartaz de "procura-se" com rosto em silhueta e "?" (estado "foto" mostra um rosto simples)
function cartaz(foto) {
  const p = new Pix(48, 56);
  p.ret(0, 0, 48, 56, '#e8d8b0'); p.ret(1, 1, 46, 54, '#f4ecd0');
  texto(p, 'PROCURA', 4, 3, '#8a2a2a'); texto(p, '-SE', 15, 12, '#8a2a2a');
  p.ret(10, 22, 28, 26, '#d8c8a0');
  if (foto) {
    p.elipse(24, 36, 8, 9, '#e0a882'); p.ret(15, 26, 18, 5, '#3a2618'); p.ret(19, 45, 10, 3, '#c83c4c');
    p.ret(20, 35, 2, 2, K); p.ret(27, 35, 2, 2, K); p.ret(22, 40, 4, 1, '#9a4a3a');
  } else { p.elipse(24, 36, 8, 9, '#9a8a6a'); p.ret(16, 45, 16, 3, '#9a8a6a'); texto(p, '?', 22, 32, '#f4ecd0'); }
  p.ret(9, 50, 30, 1, '#c8b890'); p.ret(13, 52, 22, 1, '#c8b890');
  for (const [x, y] of [[2, 2], [45, 2]]) p.set(x, y, '#c83c4c');
  p.contorno('#5a4a3a');
  return p;
}
// escreve texto da fonte do motor num Pix (mede pela largura do texto)
function texto(p, t, x, y, cor) {
  const ctx = { fillStyle: cor, fillRect(px, py, w, h) { p.ret(Math.round(px), Math.round(py), w, h, this.fillStyle); } };
  desenharTexto(ctx, t, x, y - 2, cor);
}

// ---------------------------------------------------------------- objetos isométricos de praça (MOVEIS do diorama)
const MAD = { claro: '#c89060', base: '#a8703e', esc: '#7a4e2a' };
const FERRO = '#2e2e3a';
// máscara de texto (para placas): devolve set "x,y" e largura
function mascara(t) {
  const s = new Set(); let maxY = 0;
  const ctx = { fillRect(x, y, w, h) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { s.add(`${x + i},${y + j}`); maxY = Math.max(maxY, y + j); } } };
  desenharTexto(ctx, t, 0, 0, '#000');
  return { s, w: larguraTexto(t), h: maxY + 1 };
}
Object.assign(MOVEIS, {
  // relógio da praça: coluna alta com mostrador. op.hora 0..11 (ponteiro das horas), op.minuto 0..59
  'relogio-praca': { di: 0.5, dj: 0.5, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2, h = ctx.op.hora ?? 3, mi = ctx.op.minuto ?? 0;
    L.caixa(ci - 0.22, ci + 0.22, cj - 0.22, cj + 0.22, 0, 4, '#8a8aa0');
    L.caixa(ci - 0.06, ci + 0.06, cj - 0.06, cj + 0.06, 4, 46, FERRO);
    L.caixa(ci - 0.34, ci + 0.34, cj - 0.34, cj + 0.34, 50, 14, { frente: (u, t) => (t === 0 || t === 13 ? FERRO : '#f4f0e0'), lado: (u, t) => (t === 0 || t === 13 ? FERRO : '#d8d0b8'), topo: FERRO });
    L.caixa(ci - 0.2, ci + 0.2, cj - 0.2, cj + 0.2, 64, 3, FERRO);
    // mostrador (face da frente): ponteiros desenhados a partir do centro
    const cfx = ci + 0.34, c = L.proj(cfx, cj, 57);
    const pont = (ang, comp, cor) => { for (let k = 1; k <= comp; k++) L.pintar(c.x - Math.sin(ang) * k * 0.9, c.y - Math.cos(ang) * k + Math.sin(ang) * k * 0.45, cor, cfx + 0.01, cj, 57, 1, 1); };
    pont(((h % 12) + mi / 60) / 12 * Math.PI * 2, 3, K); pont(mi / 60 * Math.PI * 2, 5, '#c83c4c');
    L.pintar(c.x, c.y, K, cfx + 0.01, cj, 57, 1, 1);
    for (let k = 0; k < 12; k += 3) { const a = k / 12 * Math.PI * 2; L.pintar(c.x - Math.sin(a) * 5.4, c.y - Math.cos(a) * 6 + Math.sin(a) * 2.7, '#6a6a80', cfx + 0.01, cj, 57, 1, 1); }
  } },
  // caixa de correio (azul e amarela) num pé
  'caixa-correio': { di: 0.5, dj: 0.6, f(L, m) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2;
    L.caixa(ci - 0.05, ci + 0.05, cj - 0.05, cj + 0.05, 0, 14, FERRO);
    L.caixa(i0, i1, j0, j1, 14, 14, { frente: (u, t) => (t > 10 && t < 13 && u > 0.15 && u < 0.45 ? K : t === 4 ? '#f0c830' : '#2a5ad8'), lado: (u, t) => (t === 4 ? '#c8a020' : '#1e4aa8'), topo: '#3a6ae8' });
  } },
  // lixeira de praça (verde, com tampa)
  'lixeira-praca': { di: 0.45, dj: 0.45, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 14, { frente: (u, t) => (Math.floor(u * 16) % 3 === 0 ? '#2a6a3a' : '#3a9a5a'), lado: '#2a6a3a', topo: K });
    L.caixa(i0 - 0.03, i1 + 0.03, j0 - 0.03, j1 + 0.03, 14, 2, '#2a5a32');
  } },
  // placa com o nome da praça em dois pés. op.texto (curto, até ~16 letras)
  'placa-nome': { di: 0.2, dj: 2.6, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, txt = (ctx.op.texto || 'PRACA SERENA').toUpperCase(), mk = mascara(txt);
    for (const b of [j0 + 0.2, j1 - 0.28]) L.caixa(ci - 0.04, ci + 0.04, b, b + 0.08, 0, 24, MAD.esc);
    const larg = (j1 - j0) * 16, x0 = Math.floor((larg - mk.w) / 2);
    L.caixa(ci - 0.05, ci + 0.05, j0, j1, 14, mk.h + 4, { frente: (u, t) => {
      const x = Math.floor(larg - 1 - u * 16) - x0, y = mk.h + 1 - t;      // u cresce para a esquerda
      if (t === 0 || t === mk.h + 3) return MAD.esc;
      return mk.s.has(`${x},${y}`) ? '#f8f0d0' : '#2e6a46';
    }, lado: MAD.esc, topo: MAD.esc });
  } },
  // carrinho de sorvete (rodas, guarda-sol listrado)
  'carrinho-sorvete': { di: 0.8, dj: 1.4, f(L, m) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2;
    for (const b of [j0 + 0.15, j1 - 0.3]) L.caixa(i1 - 0.1, i1, b, b + 0.15, 0, 5, K);
    L.caixa(i0, i1, j0, j1, 3, 14, { frente: (u, t) => (t > 11 ? '#f4f4f8' : t > 4 && t < 10 && u > 0.3 && u < 1.1 ? '#f07ab0' : '#5ac8e0'), lado: '#3a90a8', topo: '#e8e8f0' });
    for (let k = 0; k < 3; k++) L.caixa(ci - 0.08, ci + 0.08, j0 + 0.25 + k * 0.4, j0 + 0.41 + k * 0.4, 17, 2, ['#f8c0d8', '#f4f0e0', '#a0e0a0'][k]);
    L.caixa(ci - 0.03, ci + 0.03, cj - 0.03, cj + 0.03, 17, 26, '#c8c8d0');
    L.caixa(ci - 0.6, ci + 0.6, cj - 0.6, cj + 0.6, 43, 3, { frente: (u) => (Math.floor(u * 5) % 2 ? '#f4f4f8' : '#e83a4a'), lado: (u) => (Math.floor(u * 5) % 2 ? '#e0e0e8' : '#b82a3a'), topo: (a, b) => ((Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? '#f4f4f8' : '#e83a4a') });
  } },
});

const estados = (n) => Object.fromEntries(n.map((x) => [x, { q: [0], fps: 1 }]));

registrarSprites({
  ...Object.fromEntries(Object.entries(NOVOS_MORADORES).map(([k, p]) => [k, () => pessoaComSentado(p)])),
  'gato-chapeu': () => {
    const q = [0, 1, 2, 3].map((f) => gato(f)), a = [0, 1, 2, 3].map((f) => gato(f, { andando: true }));
    return { quadros: [...q, gato(0, { piscar: true }), ...a], anims: { parado: { q: [0, 1, 2, 3, 0, 4], fps: 4 }, andando: { q: [5, 6, 7, 8], fps: 8 }, correndo: { q: [5, 6, 7, 8], fps: 14 } }, sombra: true, personagem: true };
  },
  bilhete: () => { const p = objeto(...O.bilhete); const b = new Pix(p.w, p.h); b.d.set(p.d); return { quadros: [p, p], brilho: [new Pix(p.w, p.h), b], anims: { parado: { q: [0] }, brilhando: { q: [1], fps: 1 } }, sombra: true, flutua: false }; },
  carta: () => ({ quadros: [objeto(...O['carta-fechada']), objeto(...O['carta-aberta'])], anims: { parado: { q: [0] }, fechada: { q: [0] }, aberta: { q: [1] } }, sombra: true }),
  mapa: () => ({ quadros: [objeto(...O.mapa)], anims: { parado: { q: [0] } }, sombra: true }),
  cadeado: () => ({ quadros: [objeto(...O['cadeado-fechado']), objeto(...O['cadeado-aberto'])], anims: { parado: { q: [0] }, fechado: { q: [0] }, aberto: { q: [1] } }, sombra: false }),
  'pegadas-brilhantes': () => { const p = pegadas('#9ae8ff'); return { quadros: [p], brilho: [p], anims: { parado: { q: [0] } }, sombra: false }; },
  'cartaz-procura-se': () => ({ quadros: [cartaz(false), cartaz(true)], anims: { parado: { q: [0] }, vazio: { q: [0] }, foto: { q: [1] } }, sombra: false }),
  // isométricos (diorama)
  'relogio-praca': () => iso({ h3: { tipo: 'relogio-praca', op: { hora: 3 } }, h6: { tipo: 'relogio-praca', op: { hora: 6 } }, h9: { tipo: 'relogio-praca', op: { hora: 9 } },
    h12: { tipo: 'relogio-praca', op: { hora: 0 } }, 'h11-55': { tipo: 'relogio-praca', op: { hora: 11, minuto: 55 } } }),
  'caixa-correio': () => iso({ parado: { tipo: 'caixa-correio' } }),
  'lixeira-praca': () => iso({ parado: { tipo: 'lixeira-praca' } }),
  'placa-praca': () => iso({ parado: { tipo: 'placa-nome', op: { texto: 'PRACA SERENA' } } }),
  'carrinho-sorvete': () => iso({ parado: { tipo: 'carrinho-sorvete' } }),
});
void rng; void estados; void MORADORES;
