// PROTÓTIPOS (aguardando aprovação): personagens, objetos e itens de praça para histórias futuras.
// Tudo já no formato do diorama: moradores 28x44 (andam, sentam, costas) e objetos isométricos
// (x/z = canto da frente, como os da praça).
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { pessoaComSentado, MORADORES } from './moradores.js';
import { MOVEIS } from '../cenarios/comodoDiagonal.js';
import { iso } from './praca.js';
import { desenharTexto, larguraTexto } from '../fonte.js';
import { rng } from '../compartilhado/util.js';

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
  // rival da Bia: mesma idade, confiante — rabo de cavalo alto que balança, franja pontuda, presilha de estrela,
  // sobrancelhas de quem quer ganhar, sorriso de canto; jaqueta roxa com estrela, capa roxa (a "anti-capa" da Bia),
  // saia escura, meias listradas e botinhas pink
  rival: { cores: { pele: '#f0c8a8', cabelo: '#2e1a3e', prende: '#f8d040', tronco: '#f4f4f4', casaco: '#7a3ad0', calca: '#2a2448',
    meia: '#f4f4f4', sapato: '#e0407a', capa: '#4a2a8a', emblema: '#f8d040' },
    cabelo: 'rabo-alto', franja: true, presilha: '#f8d040', sobrancelhaBrava: true, sorrisoLado: true,
    casaco: true, capa: true, emblema: true, baixo: 'saia', meias: true, meiasListradas: true, corpo: 'crianca', golaCor: '#f8d040' },
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
  // relógio de praça (v2, mais detalhado): base de pedra em degraus, coluna de ferro com anéis dourados, caixa com
  // DOIS mostradores (frente e lado, marcação das 12 horas, aro dourado), cúpula em degraus com ponta dourada.
  'relogio-praca': { di: 0.7, dj: 0.7, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2, h = ctx.op.hora ?? 3, mi = ctx.op.minuto ?? 0;
    const OURO = '#d8b040', OURO2 = '#a8801e', PEDRA = ['#b4b4c4', '#9494a8', '#6a6a80'];
    const deg = (r, h0, alt, cores) => L.caixa(ci - r, ci + r, cj - r, cj + r, h0, alt, { frente: cores[1], lado: cores[2], topo: cores[0] });
    deg(0.34, 0, 3, PEDRA); deg(0.27, 3, 3, PEDRA); deg(0.2, 6, 2, [OURO, OURO2, OURO2]);
    L.caixa(ci - 0.07, ci + 0.07, cj - 0.07, cj + 0.07, 8, 38, { frente: (u, t) => (t % 12 === 0 ? OURO : FERRO), lado: (u, t) => (t % 12 === 0 ? OURO2 : '#22222c'), topo: FERRO });
    deg(0.17, 46, 2, [OURO, OURO2, OURO2]);
    // caixa do relógio: mostrador redondo em cada face visível (coordenadas da face: u em unidades, t em px)
    const H0 = 48, ALT = 17, R = 6.2;
    const face = (u, t, l) => {
      const dx = (u - l / 2) * 16, dy = t - ALT / 2 + 0.5, r = Math.hypot(dx, dy);
      if (t === 0 || t === ALT - 1) return FERRO;
      if (r > R + 1.2) return '#3a3a4a';
      if (r > R) return OURO;
      const ang = Math.atan2(dx, dy), k = Math.round(ang / (Math.PI / 6));
      if (r > R - 1.6 && Math.abs(ang - k * Math.PI / 6) < 0.16) return k % 3 === 0 ? '#1a1c2c' : '#6a6a80';   // marcas das horas
      return ['#fbf6e2', 2];                                                                                  // mostrador (acende à noite)
    };
    L.caixa(ci - 0.36, ci + 0.36, cj - 0.36, cj + 0.36, H0, ALT, { frente: face, lado: face, topo: FERRO });
    // cúpula
    deg(0.42, H0 + ALT, 2, [OURO, OURO2, OURO2]); deg(0.3, H0 + ALT + 2, 3, ['#4a5aa0', '#3a4a8a', '#2a3468']);
    deg(0.2, H0 + ALT + 5, 3, ['#4a5aa0', '#3a4a8a', '#2a3468']); deg(0.1, H0 + ALT + 8, 3, ['#4a5aa0', '#3a4a8a', '#2a3468']);
    L.caixa(ci - 0.03, ci + 0.03, cj - 0.03, cj + 0.03, H0 + ALT + 11, 4, OURO); deg(0.06, H0 + ALT + 15, 2, [OURO, OURO, OURO2]);
    // ponteiros na face da frente
    const cfx = ci + 0.36, c = L.proj(cfx, cj, H0 + ALT / 2);
    const pont = (ang, comp, cor) => { for (let k = 1; k <= comp; k++) L.pintar(c.x - Math.sin(ang) * k * 0.9, c.y - Math.cos(ang) * k + Math.sin(ang) * k * 0.45, cor, cfx + 0.01, cj, H0 + ALT / 2, 1, 1); };
    pont(((h % 12) + mi / 60) / 12 * Math.PI * 2, 3.4, '#1a1c2c'); pont(mi / 60 * Math.PI * 2, 5.2, '#c83c4c');
    L.pintar(c.x, c.y, OURO, cfx + 0.01, cj, H0 + ALT / 2, 1, 1);
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

// ---- mais itens (2ª leva): ponte, fogueira junina, caixote, cerca de madeira, mato
Object.assign(MOVEIS, {
  // caixote de madeira (empilha com "h0": 12 no beco)
  caixote: { di: 0.7, dj: 0.7, f(L, m) {
    const { i0, i1, j0, j1 } = m, h0 = m.h0 ?? 0;
    L.caixa(i0, i1, j0, j1, h0, 12, { frente: (u, t) => (t === 0 || t === 11 || Math.floor(u * 16) % 11 === 0 ? MAD.esc : t % 4 === 0 ? MAD.base : MAD.claro),
      lado: (u, t) => (t === 0 || t === 11 ? MAD.esc : t % 4 === 0 ? '#6a4224' : MAD.base), topo: (a, b) => (Math.floor(b * 16) % 4 === 0 ? MAD.base : MAD.claro) });
  } },
  // ponte de madeira atravessando a rua/rio (ao longo de z). Quem passa por cima: "y": 0.45
  ponte: { di: 4.8, dj: 1.6, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 4, 3, { frente: MAD.esc, lado: (u) => (Math.floor(u * 16) % 3 === 0 ? MAD.esc : MAD.base), topo: (a) => (Math.floor(a * 16) % 3 === 0 ? MAD.esc : (Math.floor(a * 16) % 7 === 1 ? MAD.base : MAD.claro)) });
    for (const a of [i0 + 0.6, (i0 + i1) / 2, i1 - 0.6]) for (const b of [j0, j1 - 0.12]) L.caixa(a - 0.06, a + 0.06, b, b + 0.12, 0, 4, '#5a3a22');
    for (const b of [j0, j1 - 0.1]) {
      for (let a = i0; a <= i1 - 0.1; a += 0.8) L.caixa(a, a + 0.1, b, b + 0.1, 7, 10, MAD.base);
      L.caixa(i0, i1, b, b + 0.1, 17, 2, { frente: MAD.claro, lado: MAD.base, topo: MAD.claro });
    }
  } },
  // fogueira de festa junina: lenha em pirâmide e chamas (op.chama: 0..2 muda o desenho das chamas)
  fogueira: { di: 1.0, dj: 1.0, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2, k = ctx.op.chama ?? 0;
    for (const [da, db] of [[-0.35, 0], [0.35, 0], [0, -0.35], [0, 0.35]]) L.caixa(ci + da - 0.08, ci + da + 0.08, cj + db - 0.08, cj + db + 0.08, 0, 16, { frente: (u, t) => (t % 5 === 0 ? '#4a2e1a' : '#7a5232'), lado: '#4a2e1a', topo: '#8a6a4a' });
    for (const [a, b] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45], [0, -0.55], [0, 0.55], [-0.55, 0], [0.55, 0]]) L.caixa(ci + a - 0.08, ci + a + 0.08, cj + b - 0.08, cj + b + 0.08, 0, 3, '#8a8a98');
    const p = L.proj(ci, cj, 6);
    for (let y = 0; y < 26; y++) {
      const w = Math.max(0, Math.round((26 - y) * 0.32 + Math.sin(y * 0.7 + k * 2.1) * 1.5));
      for (let x = -w; x <= w; x++) {
        const borda = Math.abs(x) >= w - 1, cor = y > 18 ? '#fff0a0' : borda ? '#e85a2a' : y > 9 ? '#f8c840' : '#f8902a';
        if (((x + y + k) % 7 === 0) && y > 20) continue;
        L.pintar(p.x + x, p.y - y, cor, ci + 0.6, cj + 0.6, 6 + y, 2, 1);
      }
    }
    ctx.luzes.push({ i: ci, j: cj, h: 20, raio: 5, forca: 1.1, cor: '#ffa040' });
  } },
  // cerca de madeira (ao longo de x), para a estrada de terra
  'cerca-madeira': { di: 0.15, dj: 4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (let b = j0; b <= j1 - 0.1; b += 1) L.caixa(i0, i1, b, b + 0.12, 0, 16, { frente: (u, t) => (t === 15 ? MAD.claro : MAD.base), lado: MAD.esc, topo: MAD.claro });
    for (const h of [6, 12]) L.caixa(i0 + 0.03, i1 - 0.03, j0, j1, h, 2, { frente: MAD.claro, lado: MAD.base, topo: MAD.claro });
  } },
  // mato alto (tufos de capim)
  mato: { di: 0.8, dj: 1.2, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, r = rng(ctx.semente + 3);
    for (let k = 0; k < 26; k++) {
      const a = i0 + r() * (i1 - i0), b = j0 + r() * (j1 - j0), p = L.proj(a, b, 0), h = 5 + Math.floor(r() * 8), inc = r() < 0.5 ? -1 : 1;
      for (let t = 0; t < h; t++) L.pintar(p.x + Math.round((t / h) * inc * 2), p.y - t, t > h - 3 ? '#8ad070' : t > h / 2 ? '#5aa84a' : '#3a8040', a, b, t, 1, 1);
    }
  } },
});

// cadeado de número de perto (bom com "tela": true): estados fechado (???), tentando (47?), aberto (472)
function cadeadoNumero(cod, aberto) {
  const p = new Pix(40, 44);
  // argola: fechada desce dos dois lados; aberta sobe e solta o lado esquerdo
  const sobe = aberto ? -2 : 0;
  p.ret(10, 4 + sobe, 20, 3, '#9a9aae'); p.ret(10, 4 + sobe, 3, aberto ? 6 : 16, '#9a9aae'); p.ret(27, 4 + sobe, 3, 16 - sobe, '#9a9aae');
  p.ret(4, 18, 32, 24, '#d8b040'); p.ret(4, 18, 32, 2, '#f0d060'); p.ret(4, 39, 32, 3, '#a8801e');
  for (let k = 0; k < 3; k++) {
    const x = 7 + k * 9;
    p.ret(x, 24, 8, 12, '#f4f0e0'); p.ret(x, 24, 8, 1, '#c8c0b0'); p.ret(x, 35, 8, 1, '#c8c0b0');
    texto(p, cod[k], x + 2, 26, cod[k] === '?' ? '#8a8aa0' : '#1a1c2c');
  }
  p.contorno('#3a3a4a');
  return p;
}

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
  caixote: () => iso({ parado: { tipo: 'caixote' } }),
  'ponte-madeira': () => iso({ parado: { tipo: 'ponte' } }),
  'cerca-madeira': () => iso({ parado: { tipo: 'cerca-madeira' } }),
  mato: () => iso({ parado: { tipo: 'mato' } }),
  'placa-saida': () => iso({ parado: { tipo: 'placa-nome', op: { texto: 'VILA SERENA 1 KM', dj: 6 } } }),
  'fogueira-junina': () => {   // chamas animadas (3 desenhos em sequência)
    const s = iso({ a: { tipo: 'fogueira', op: { chama: 0 } }, b: { tipo: 'fogueira', op: { chama: 1 } }, c: { tipo: 'fogueira', op: { chama: 2 } } }, { luz: { cor: '#ffa040', intensidade: 1.6, alcance: 5, dy: 1 } });
    s.anims = { parado: { q: [0, 1, 2, 1], fps: 8 } };
    return s;
  },
  'cadeado-numero': () => ({ quadros: [cadeadoNumero('???', false), cadeadoNumero('47?', false), cadeadoNumero('472', true)],
    anims: { parado: { q: [0] }, fechado: { q: [0] }, tentando: { q: [1] }, aberto: { q: [2] } }, sombra: false }),
}, { grupo: 'Novos (personagens, objetos, praça)', status: 'protótipo' });
void rng; void estados; void MORADORES;
