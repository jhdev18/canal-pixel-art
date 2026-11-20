// Moradores da cidade: gerador de pessoas detalhadas (28x44) + 7 personagens.
// Mesmo sistema de camadas da menina-capa: formas por material -> sombreamento -> contorno colorido.
import { Boneco, passada } from '../boneco.js';
import { registrarSprites } from '../sprites.js';
import { hexParaRgb } from '../pixel.js';
import { adicionarSentado, adicionarCostas } from '../sentado.js';
import { adicionarEspirro, gotinhas } from '../espirro.js';
import { aplicarRosto, adicionarExpressoes } from '../expressoes.js';

const W = 28, H = 44;

// 4 tons (luz, base, sombra, contorno) a partir de uma cor base.
function tons(hex) {
  const [r, g, b] = hexParaRgb(hex);
  const mix = (t, alvo) => '#' + [r, g, b].map((c, i) => Math.round(c + (alvo[i] - c) * t).toString(16).padStart(2, '0')).join('');
  const escuro = [Math.round(r * 0.18), Math.round(g * 0.16), Math.round(b * 0.24)];
  return [mix(0.28, [255, 250, 235]), hex, mix(0.3, [Math.round(r * 0.45), Math.round(g * 0.42), Math.round(b * 0.55)]), mix(0.85, escuro)];
}

function materiais(b, p) {
  const M = {};
  for (const [k, cor] of Object.entries(p.cores)) M[k] = b.material(tons(cor), { sombraLarga: k === 'tronco' || k === 'casaco' });
  return M;
}

// ------------------------------------------------------------------ FRENTE
// espirro: 'antes' (inspira: cabeça sobe, olhos semicerrados, boca em "o") | 'atchim' (curva para a frente, olhos
// apertados, boca aberta e gotinhas). PROTÓTIPO.
function frente(p, { resp = 0, piscar = false, espirro = null } = {}) {
  const b = new Boneco(W, H); const M = materiais(b, p);
  const r = espirro === 'antes' ? 1 : espirro === 'atchim' ? -1 : resp;
  const largT = p.corpo === 'largo' ? 1.2 : p.corpo === 'crianca' ? -0.6 : 0;
  const yC = p.corpo === 'crianca' ? 2 : 0;          // crianças: corpo um pouco mais baixo
  const yP = p.pernasLongas ? 0 : yC;                 // pernasLongas: o tronco encurta e as pernas ficam do tamanho normal
  // cabelo comprido atrás da cabeça
  if (p.cabelo === 'cacheado') { b.elipse(14, 10 - r + yC, 9, 8.6, M.cabelo); b.elipse(7.2, 17 - r + yC, 3.4, 3.6, M.cabelo); b.elipse(20.8, 17 - r + yC, 3.4, 3.6, M.cabelo); }
  if (p.cabelo === 'longo') b.poli([[7.3, 7 - r + yC], [20.7, 7 - r + yC], [21.4, 20 - r + yC], [6.6, 20 - r + yC]], M.cabelo);
  // capa (atrás do corpo)
  if (p.capa) b.poli([[7.6 - largT, 16.6 - r + yC], [20.4 + largT, 16.6 - r + yC], [22.4 + largT, 37], [5.6 - largT, 37]], M.capa);
  // mochila (alças aparecem na frente; o corpo da mochila aparece nas laterais)
  if (p.mochila) { b.ret(6, 18 - r + yC, 2, 10, M.mochila); b.ret(20, 18 - r + yC, 2, 10, M.mochila); }
  // pernas e calçados
  const pernaTopo = 30 + yP;
  if (p.baixo === 'saia' || p.baixo === 'saia-longa' || p.baixo === 'bermuda') {
    b.ret(10, pernaTopo, 3, 10 - yC, M.pele); b.ret(15, pernaTopo, 3, 10 - yC, M.pele);
    if (p.meias) { b.ret(10, 36, 3, 4, M.meia); b.ret(15, 36, 3, 4, M.meia); }
  } else { b.ret(9.5, pernaTopo, 3.6, 10 - yC, M.calca); b.ret(14.9, pernaTopo, 3.6, 10 - yC, M.calca); }
  b.poli([[8.6, 38.5], [13.2, 38.5], [13.6, 42], [8.2, 42]], M.sapato);
  b.poli([[14.8, 38.5], [19.4, 38.5], [19.8, 42], [14.4, 42]], M.sapato);
  if (p.baixo === 'bermuda') b.poli([[9, pernaTopo - 1], [19, pernaTopo - 1], [19.2, pernaTopo + 4], [14.4, pernaTopo + 4], [14, pernaTopo + 1], [13.6, pernaTopo + 4], [8.8, pernaTopo + 4]], M.calca);
  if (p.baixo === 'saia') b.poli([[9, pernaTopo - 1], [19, pernaTopo - 1], [20.4, pernaTopo + 5], [7.6, pernaTopo + 5]], M.calca);
  if (p.baixo === 'saia-longa') b.poli([[9, pernaTopo - 1], [19, pernaTopo - 1], [20.6, 38], [7.4, 38]], M.calca);
  // tronco
  b.poli([[8.6 - largT, 17 - r + yC], [19.4 + largT, 17 - r + yC], [20 + largT, 30 + yP], [8 - largT, 30 + yP]], M.tronco);
  if (p.casaco) { b.poli([[8.4 - largT, 17 - r + yC], [12.6, 17 - r + yC], [12.2, 30 + yP], [7.8 - largT, 30 + yP]], M.casaco); b.poli([[15.4, 17 - r + yC], [19.6 + largT, 17 - r + yC], [20.2 + largT, 30 + yP], [15.8, 30 + yP]], M.casaco); }
  if (p.avental) b.poli([[10, 20 - r + yC], [18, 20 - r + yC], [18.6, 36], [9.4, 36]], M.avental);
  // braços
  const bracoCor = p.casaco ? M.casaco : (p.mangaCurta ? M.pele : M.tronco);
  b.poli([[7.4 - largT, 17.6 - r + yC], [10 - largT, 18 - r + yC], [8.6 - largT, 28.6 - r + yC], [5.2 - largT, 28.6 - r + yC]], M.tronco);
  b.poli([[18 + largT, 18 - r + yC], [20.6 + largT, 17.6 - r + yC], [22.8 + largT, 28.6 - r + yC], [19.4 + largT, 28.6 - r + yC]], M.tronco);
  if (p.mangaCurta) { b.poli([[6.2 - largT, 22 - r + yC], [9.2 - largT, 22 - r + yC], [8.6 - largT, 28.6 - r + yC], [5.2 - largT, 28.6 - r + yC]], M.pele); b.poli([[18.8 + largT, 22 - r + yC], [21.8 + largT, 22 - r + yC], [22.8 + largT, 28.6 - r + yC], [19.4 + largT, 28.6 - r + yC]], M.pele); }
  if (p.casaco) { b.poli([[7.4 - largT, 17.6 - r + yC], [10 - largT, 18 - r + yC], [8.6 - largT, 28.6 - r + yC], [5.2 - largT, 28.6 - r + yC]], bracoCor); b.poli([[18 + largT, 18 - r + yC], [20.6 + largT, 17.6 - r + yC], [22.8 + largT, 28.6 - r + yC], [19.4 + largT, 28.6 - r + yC]], bracoCor); }
  // lança na mão direita (a mão é desenhada por cima, segurando)
  if (p.lanca) { const lx = Math.round(21.6 + largT); b.ret(lx, 6 + yC, 1, 35 - yC, M.lanca); b.poli([[lx - 1.4, 6.4 + yC], [lx + 0.5, 1.2 + yC], [lx + 2.4, 6.4 + yC]], M.metal); }
  b.elipse(6.8 - largT, 29.6 - r + yC, 1.6, 1.4, M.pele); b.elipse(21.2 + largT, 29.6 - r + yC, 1.6, 1.4, M.pele);
  // escudo no braço esquerdo
  if (p.escudo) b.elipse(6.4 - largT, 25.6 - r + yC, 3.4, 4, M.escudo);
  if (p.livro) b.ret(19 + largT, 25 - r + yC, 4, 5, M.livro);
  if (p.faixa) b.poli([[9 - largT, 17 - r + yC], [12, 17 - r + yC], [20 + largT, 28 + yC], [17 + largT, 30 + yC]], M.faixa);
  if (p.cinto) b.ret(8.2 - largT, 28.5 + yP, 11.6 + 2 * largT, 1.6, M.cinto);
  // pescoço e cabeça
  b.ret(12.5, 14.5 - r + yC, 3, 3, M.pele);
  b.elipse(14, 9.4 - r + yC, 6.2, 6.6, M.pele);
  // cachorro: orelhas caídas dos lados e focinho claro
  if (p.cao) {   // v2: rabo atrás, orelhas compridas com a parte de dentro, bochechas e focinho maior
    b.poli([[19, 27 - r + yC], [23.4, 22 - r + yC], [25.2, 18.6 - r + yC], [24.6, 22.6 - r + yC], [21.4, 28.4 - r + yC]], M.orelha);
    b.elipse(14, 10.2 - r + yC, 7, 6.2, M.pele);
    b.poli([[8.4, 4.8 - r + yC], [4.6, 7.2 - r + yC], [4, 16.4 - r + yC], [6.4, 18.4 - r + yC], [9.2, 11 - r + yC]], M.orelha);
    b.poli([[19.6, 4.8 - r + yC], [23.4, 7.2 - r + yC], [24, 16.4 - r + yC], [21.6, 18.4 - r + yC], [18.8, 11 - r + yC]], M.orelha);
    b.elipse(14, 13 - r + yC, 4.4, 3.1, M.focinho);
  }
  // cabelo / chapéu
  const yc = -r + yC;
  if (p.cabelo === 'curto') b.poli([[7.6, 9 + yc], [8.4, 4.4 + yc], [11, 2.4 + yc], [17, 2.4 + yc], [19.8, 4.6 + yc], [20.4, 9 + yc], [18.6, 6.4 + yc], [15.6, 7 + yc], [12, 6 + yc], [9.4, 7.4 + yc]], M.cabelo);
  if (p.cabelo === 'bagunçado') b.poli([[7.4, 9.6 + yc], [7.6, 4 + yc], [10, 1.6 + yc], [12, 2.6 + yc], [14, 1 + yc], [16.4, 2.4 + yc], [18.6, 1.8 + yc], [20.6, 5 + yc], [20.6, 9.6 + yc], [19, 6.6 + yc], [16.4, 7.4 + yc], [14.6, 5.6 + yc], [12.4, 7.4 + yc], [9.6, 6.4 + yc]], M.cabelo);
  if (p.cabelo === 'grisalho' || p.cabelo === 'careca') { b.poli([[7.6, 11 + yc], [7.8, 6 + yc], [9.4, 4.6 + yc], [10, 9 + yc]], M.cabelo); b.poli([[20.4, 11 + yc], [20.2, 6 + yc], [18.6, 4.6 + yc], [18, 9 + yc]], M.cabelo); if (p.cabelo === 'grisalho') b.poli([[10, 4 + yc], [18, 4 + yc], [17, 3 + yc], [11, 3 + yc]], M.cabelo); }
  if (p.cabelo === 'longo' || p.cabelo === 'rabo' || p.cabelo === 'coque' || p.cabelo === 'cacheado' || p.cabelo === 'rabo-alto') b.poli([[7.4, 11 + yc], [7.8, 4.6 + yc], [10.6, 2.2 + yc], [17.4, 2.2 + yc], [20.2, 4.6 + yc], [20.6, 11 + yc], [19.2, 7 + yc], [16, 5.6 + yc], [13.2, 6.6 + yc], [10, 5.8 + yc], [8.8, 8 + yc]], M.cabelo);
  if (p.cabelo === 'rabo') b.poli([[19.6, 5 + yc], [22.6, 6 + yc], [23.4, 14 + yc], [21.4, 15 + yc], [20.4, 9 + yc]], M.cabelo);
  if (p.cabelo === 'rabo-alto') { b.poli([[16.6, 2.4 + yc], [20.6, -0.2 + yc], [24.4, 2.4 + yc], [25.4, 9 + yc], [23.6, 15.6 + yc], [22.4, 10 + yc], [19.6, 5.2 + yc]], M.cabelo); b.elipse(19.4, 2.4 + yc, 1.6, 1.4, M.prende || M.cabelo); }
  if (p.franja) b.poli([[8.4, 5.6 + yc], [10.2, 9.6 + yc], [11.6, 6.4 + yc], [13.2, 9 + yc], [14.6, 6.2 + yc], [16.2, 9.4 + yc], [17.6, 6.4 + yc], [19.6, 8.6 + yc], [19.8, 5.2 + yc]], M.cabelo);
  if (p.cabelo === 'coque') b.elipse(14, 1.8 + yc, 3.2, 2.4, M.cabelo);
  if (p.cabelo === 'cacheado') { for (const [x, y] of [[9, 3.6], [12.4, 2.2], [15.8, 2.2], [19, 3.6]]) b.elipse(x, y + yc, 2.6, 2.2, M.cabelo); b.elipse(7.6, 10 + yc, 1.8, 3.2, M.cabelo); b.elipse(20.4, 10 + yc, 1.8, 3.2, M.cabelo); }
  if (p.cabelo === 'topete') b.poli([[7.2, 10.4], [6.6, 6.4], [3.6, 5.2], [7, 3.4], [7.4, 0.4], [10.6, 1.6], [12.6, -2.2], [14.8, 1], [17.6, -1.8], [18.6, 1.8], [22.4, 0.8], [20.8, 4.2], [24.2, 5.6], [20.8, 7], [21, 10.4], [19.2, 7.2], [16.6, 7.8], [15.2, 6], [13.2, 7.8], [11, 6.4], [9.2, 7.8]].map(([x, y]) => [x, y + yc]), M.cabelo);
  if (p.cachecol) { b.poli([[8.4, 15.2 + yc], [19.6, 15.2 + yc], [20, 18.4 + yc], [8, 18.4 + yc]], M.cachecol); b.ret(15.4, 18 + yc, 3.2, 8, M.cachecol); }
  // coroa (PROTÓTIPO): aro dourado com 3 pontas, assentado no alto da cabeça
  if (p.chapeu === 'coroa') { b.poli([[8.8, 5.4 + yc], [8.4, 0.6 + yc], [10.8, 2.6 + yc], [12.4, -1 + yc], [14, 2.2 + yc], [15.6, -1 + yc], [17.2, 2.6 + yc], [19.6, 0.6 + yc], [19.2, 5.4 + yc]], M.chapeu); b.ret(8.8, 4 + yc, 10.4, 1.4, M.aba); }
  if (p.chapeu === 'quepe') { b.poli([[7.4, 6.2 + yc], [8.4, 1.2 + yc], [19.6, 1.2 + yc], [20.6, 6.2 + yc]], M.chapeu); b.poli([[7, 6 + yc], [21, 6 + yc], [20.4, 7.6 + yc], [7.6, 7.6 + yc]], M.aba); }
  if (p.chapeu === 'padeiro') { b.poli([[8, 5.6 + yc], [7.2, -0.4 + yc], [10, -2 + yc], [14, -1 + yc], [18, -2 + yc], [20.8, -0.4 + yc], [20, 5.6 + yc]], M.chapeu); b.ret(8, 4.4 + yc, 12, 2, M.aba); }
  if (p.chapeu === 'bone') { b.poli([[7.6, 6.4 + yc], [8.6, 2 + yc], [19.4, 2 + yc], [20.4, 6.4 + yc]], M.chapeu); b.poli([[12, 5.6 + yc], [22.4, 5.6 + yc], [22, 7.2 + yc], [12, 7.2 + yc]], M.aba); }
  if (p.chapeu === 'elmo') {
    b.poli([[7.2, 8.6 + yc], [7.4, 4.4 + yc], [9.6, 1.8 + yc], [18.4, 1.8 + yc], [20.6, 4.4 + yc], [20.8, 8.6 + yc], [19.2, 8.6 + yc], [19, 7.2 + yc], [9, 7.2 + yc], [8.8, 8.6 + yc]], M.chapeu);
    b.ret(8, 6 + yc, 12, 1, M.aba);
    if (p.cores.pluma) b.poli([[12.4, 2.2 + yc], [12.8, -1.6 + yc], [15.2, -1.6 + yc], [15.6, 2.2 + yc]], M.pluma);
  }
  // ---- detalhes
  const o = (y) => Math.round(y - r + yC);
  const olho = '#2a1810';
  if (espirro === 'antes') { for (const x of [11, 12, 16, 17]) { b.pinta(x, o(9), tons(p.cores.pele)[2]); b.pinta(x, o(10), olho); } }
  else if (espirro === 'atchim') { for (const [x, y] of [[11, 9], [12, 10], [11, 11], [17, 9], [16, 10], [17, 11]]) b.pinta(x, o(y), olho); }
  else if (piscar) { for (const x of [11, 12, 16, 17]) b.pinta(x, o(10), p.cores.pele === undefined ? '#a06a58' : tons(p.cores.pele)[2]); }
  else for (const x of [11, 16]) { b.pinta(x, o(9), olho); b.pinta(x, o(10), olho); b.pinta(x + 1, o(9), '#ffffff'); b.pinta(x + 1, o(10), olho); }
  const sobr = tons(p.cores.cabelo)[3];
  if (p.sobrancelhaBrava || espirro === 'atchim') { for (const [x, y] of [[10, 7.2], [11, 7.6], [12, 8.2], [15, 8.2], [16, 7.6], [17, 7.2]]) b.pinta(x, o(y), sobr); }
  else if (!p.chapeu || p.chapeu === 'bone' || p.chapeu === 'coroa') { for (const x of [10, 11, 12]) b.pinta(x, o(7.6), sobr); for (const x of [15, 16, 17]) b.pinta(x, o(7.6), sobr); }
  if (p.presilha) for (const [x, y] of [[9, 4], [8, 5], [9, 5], [10, 5], [9, 6]]) b.pinta(x, o(y), (x === 9 && y === 5) ? '#fff8d0' : p.presilha);
  if (p.oculos) { const f = '#2a2a3a'; for (const [x0] of [[10], [15]]) { for (let x = x0; x < x0 + 4; x++) { b.pinta(x, o(8), f); b.pinta(x, o(11), f); } b.pinta(x0, o(9), f); b.pinta(x0, o(10), f); b.pinta(x0 + 3, o(9), f); b.pinta(x0 + 3, o(10), f); } b.pinta(14, o(9), f); }
  if (p.oculosEscuros) { const f = '#14141e', l = '#3a3a52'; for (const x0 of [10, 15]) for (let x = x0; x < x0 + 4; x++) for (let y = 8; y <= 10; y++) b.pinta(x, o(y), y === 8 && x === x0 + 1 ? l : f); b.pinta(14, o(8), f); }
  if (p.bigode) { for (const x of [12, 13, 14, 15, 16]) b.pinta(x, o(12.6), tons(p.cores.bigode || p.cores.cabelo)[2]); b.pinta(11, o(13), tons(p.cores.bigode || p.cores.cabelo)[2]); b.pinta(17, o(13), tons(p.cores.bigode || p.cores.cabelo)[2]); }
  else if (espirro) { /* boca do espirro: desenhada abaixo */ }
  else if (p.sorrisoLado) { b.pinta(12, o(13.2), '#9a4a3a'); b.pinta(13, o(13.6), '#9a4a3a'); b.pinta(14, o(13.6), '#9a4a3a'); b.pinta(15, o(13.2), '#9a4a3a'); b.pinta(16, o(12.6), '#9a4a3a'); }
  else if (!p.cao) { b.pinta(13, o(13.4), '#9a4a3a'); b.pinta(14, o(13.4), '#9a4a3a'); b.pinta(15, o(13), '#9a4a3a'); }
  if (espirro && !p.cao) {
    const my = p.bigode ? 14 : 13;
    if (espirro === 'antes') { for (const x of [13, 14]) { b.pinta(x, o(my), '#5a2020'); b.pinta(x, o(my + 1), '#7a3030'); } }
    else { for (let x = 12; x <= 16; x++) b.pinta(x, o(my), '#4a1414'); for (const x of [13, 14, 15]) b.pinta(x, o(my + 1), '#c84a5a'); }
  }
  if (espirro === 'atchim') gotinhas(b, 14, o(p.bigode ? 14 : 13));
  if (p.meiasListradas) for (const x of [10, 11, 12, 15, 16, 17]) for (const y of [36, 38]) b.tom(x, y, 'sombra');
  if (!p.cao) { const bc = espirro ? '#f07a6a' : '#e8907a'; b.pinta(9, o(12), bc); b.pinta(19, o(12), bc); if (espirro) { b.pinta(14, o(11.4), '#e8907a'); } }
  else {   // nariz (com brilho), boca em "w", língua, manchas acima dos olhos, dentro das orelhas e dedinhos das patas
    const nariz = '#1a1014';
    for (const x of [12, 13, 14, 15, 16]) b.pinta(x, o(11.2), nariz);
    for (const x of [13, 14, 15]) b.pinta(x, o(12.2), nariz);
    b.pinta(13, o(10.4), nariz); b.pinta(14, o(10.4), nariz); b.pinta(15, o(10.4), nariz); b.pinta(13, o(10.4), '#8a7a84');
    b.pinta(14, o(13.2), '#3a2420');
    for (const [x, y] of [[12, 14], [13, 14.6], [15, 14.6], [16, 14]]) b.pinta(x, o(y), '#3a2420');
    b.pinta(14, o(14.4), '#e8708a'); b.pinta(14, o(15.4), '#c84a68'); b.pinta(13, o(15.2), '#e8708a');
    const sobr = tons(p.cores.focinho || '#f0dcc0')[1];
    for (const x of [11, 16]) { b.pinta(x, o(7.4), sobr); b.pinta(x + 1, o(7.4), sobr); }
    const dentro = tons(p.cores.orelha || p.cores.cabelo)[2];
    for (const y of [9, 10, 11, 12, 13]) { b.pinta(6, o(y), dentro); b.pinta(22, o(y), dentro); }
    for (const [x, y] of [[6, 30.4], [7, 30.4], [21, 30.4], [22, 30.4]]) b.pinta(Math.round(x - largT * (x < 14 ? 1 : -1)), o(y), tons(p.cores.pele)[3]);
  }
  if (p.pregador) { for (const y of [9, 10, 11, 12]) { b.pinta(13, o(y), y === 9 ? '#8a5226' : '#c8823e'); b.pinta(15, o(y), y === 9 ? '#8a5226' : '#c8823e'); } for (const x of [13, 14, 15]) b.pinta(x, o(11), '#4a4a5a'); b.pinta(14, o(10), '#f0b898'); }   // PROTÓTIPO: pregador no nariz
  if (p.mecha) for (const [x, y] of [[13, 1], [13, 2], [14, 2], [14, 3], [15, 4]]) b.pinta(x, o(y), p.mecha);
  if (p.curativo) for (const x of [16, 17, 18, 19]) for (const y of [11.2, 12.2]) b.pinta(x, o(y), x === 17 || x === 18 ? '#e0b888' : '#f6dcae');
  if (p.sardas) for (const [x, y] of [[10, 11.6], [11, 12.4], [12, 11.6]]) b.pinta(x, o(y), '#c8784a');
  if (p.brincos) for (const x of [7, 20]) { b.pinta(x, o(12.4), '#f0c840'); b.pinta(x, o(13.4), '#c89020'); }
  if (p.colar) for (const [x, y] of [[11, 17.4], [12, 18.4], [13, 19], [14, 19.4], [15, 19], [16, 18.4], [17, 17.4]]) b.pinta(x, o(y), p.colar);
  if (p.cachecol) { const c = tons(p.cores.cachecol); for (const y of [20, 23]) for (const x of [16, 17]) b.pinta(x, o(y), c[2]); for (const x of [15, 17]) b.pinta(x, o(26), c[0]); }
  if (p.chapeu === 'coroa') { b.pinta(14, o(3.2), '#e83a5a'); b.pinta(14, o(2.2), '#ff8aa0'); b.pinta(11, o(3.6), '#3a8ae8'); b.pinta(17, o(3.6), '#3ad870'); for (const x of [12, 15]) b.pinta(x, o(-0.2), '#fff4b0'); }
  if (p.chapeu === 'quepe') { b.pinta(13, o(3.4), '#f0c840'); b.pinta(14, o(3.4), '#f0c840'); b.pinta(13, o(4.4), '#c89020'); b.pinta(14, o(4.4), '#c89020'); }
  if (p.emblema) { const ce = p.cores.emblema || '#f0c840'; for (const [x, y] of [[13, 21], [14, 21], [13, 22], [14, 22]]) b.pinta(x, o(y), ce); b.pinta(13, o(20), ce); b.pinta(14, o(23), ce); }
  if (p.escudo) { const ce = p.cores.emblema || '#f0c840'; for (const [x, y] of [[6, 25], [6, 26], [5, 25.5], [7, 25.5]]) b.pinta(Math.round(x - largT), o(y), ce); }
  if (p.distintivo) { b.pinta(17, o(20.6), '#f0c840'); b.pinta(17, o(21.6), '#c89020'); b.pinta(18, o(21), '#f0c840'); }
  if (p.radio) { b.ret(9, o(18.4), 2, 3, M.cinto); b.pinta(10, o(17.4), '#3a3a3a'); }
  if (p.gravata) { b.pinta(14, o(17.4), '#f4f4f4'); b.pinta(13, o(17.4), '#f4f4f4'); b.pinta(15, o(17.4), '#f4f4f4'); for (let y = 18; y < 26; y++) { b.pinta(14, o(y), y === 18 ? '#a82020' : '#c83030'); if (y > 19 && y < 25) b.pinta(13, o(y), '#a82020'); } }
  if (p.casaco) for (let y = 19; y < 29; y += 3) b.pinta(12, o(y), tons(p.cores.casaco)[3]);
  if (p.mochila) { b.ret(9, o(17), 1, 12, M.mochila); b.ret(18, o(17), 1, 12, M.mochila); }
  if (p.golaCor) for (const x of [11, 12, 13, 14, 15, 16]) b.pinta(x, o(17), p.golaCor);
  if (p.avental) { for (let x = 11; x < 17; x++) b.tom(x, o(27), 'sombra'); b.tom(10, o(21), 'contorno'); b.tom(17, o(21), 'contorno'); }
  if (p.cinto) { b.pinta(13, 29 + yC, '#d8b040'); b.pinta(14, 29 + yC, '#d8b040'); }
  if (p.faixa) for (let k = 0; k < 6; k++) b.pinta(Math.round(12 + k * 1.3), o(19 + k * 1.6), '#f0d040');
  if (p.livro) { for (let y = 26; y < 30; y++) b.pinta(Math.round(20 + largT), o(y), '#f0ead8'); }
  if (p.baixo === 'calca' && !p.avental) for (let y = pernaTopo + 1; y < 38; y += 2) b.tom(14, y, 'contorno');
  return b.render();
}

// ------------------------------------------------------------------ LADO (direita)
function lado(p, t, { correr = false, classico = false } = {}) {
  const b = new Boneco(W, H); const M = materiais(b, p);
  const Mb = b.material(tons(p.baixo === 'calca' ? p.cores.calca : p.cores.pele).map((c, i) => tons(c)[i === 3 ? 3 : 2]));
  const Sb = b.material(tons(p.cores.sapato).map((c) => tons(c)[2]));
  const yC = p.corpo === 'crianca' ? 2 : 0;
  const yP = p.pernasLongas ? 0 : yC;
  const g = passada(t, correr ? { passo: 5.6, levanta: 4, quadril: [14, 30 + yP] } : { passo: 3.4, levanta: 2.2, quadril: [14, 30 + yP] });
  const onda = classico ? Math.sin : Math.cos;
  const incl = correr ? 2.2 : 0, y0 = -Math.round(Math.abs(onda(t * Math.PI * 2)) * (correr ? 1.5 : 1));
  const largT = p.corpo === 'largo' ? 1 : 0;
  const barra = p.baixo === 'saia' ? 34.5 : p.baixo === 'saia-longa' ? 37.4 : 30.5 + yP;   // de onde a perna aparece
  const perna = (pe, mPerna, mSap) => {
    b.traco(14 + incl * 0.2, barra + y0, pe.x, pe.y - 3, 1.3, mPerna);
    b.poli([[pe.x - 2.2, pe.y - 3.6], [pe.x + 1.6, pe.y - 3.6], [pe.x + 3.4, pe.y], [pe.x - 2.2, pe.y]], mSap);
  };
  // capa balançando atrás
  if (p.capa) { const ond = onda(t * Math.PI * 2) * (correr ? 1.4 : 0.6), voo = correr ? 3 : 0; b.poli([[10.6 + incl, 16.8 + y0 + yC], [14 + incl, 16.8 + y0 + yC], [9.8 - ond - voo * 0.6, 36 + y0], [6 - ond - voo, 35 + y0 - voo * 0.6]], M.capa); }
  // braço de trás (segura a lança, que passa atrás do corpo)
  const bt = -g.braco * (correr ? 4 : 2.4);
  if (p.lanca) { const lx = Math.round(13.6 + incl + bt); b.ret(lx, 4 + y0 + yC, 1, 37 - yC, M.lanca); b.poli([[lx - 1.4, 4.4 + y0 + yC], [lx + 0.5, -0.6 + y0 + yC], [lx + 2.4, 4.4 + y0 + yC]], M.metal); }
  b.traco(13.6 + incl, 18.5 + y0 + yC, 13.6 + incl + bt, 27.5 + y0 + yC, 1.2, p.mangaCurta ? M.pele : (p.casaco ? M.casaco : M.tronco));
  if (p.lanca) b.elipse(13.6 + incl + bt, 28.4 + y0 + yC, 1.4, 1.2, M.pele);
  // escudo nas costas
  if (p.escudo) b.elipse(9.4 + incl, 23 + y0 + yC, 2.2, 3.8, M.escudo);
  // mochila nas costas
  if (p.mochila) b.poli([[7.2 + incl, 17.5 + y0 + yC], [10.4 + incl, 17 + y0 + yC], [10.4 + incl, 28 + y0 + yC], [7.4 + incl, 28 + y0 + yC]], M.mochila);
  // cabelo comprido atrás
  if (p.cabelo === 'cacheado') { b.elipse(11.4 + incl, 9.4 + y0 + yC, 6.4, 7.8, M.cabelo); b.elipse(10 + incl, 16.4 + y0 + yC, 3.6, 3.2, M.cabelo); }
  if (p.cachecol) { const ond = Math.sin(t * Math.PI * 4) * 0.8; b.traco(12 + incl, 17 + y0 + yC, (correr ? 4.6 : 7.2) + incl, (correr ? 19.4 : 23) + ond + y0 + yC, 1.2, M.cachecol); }
  if (p.cabelo === 'longo') b.poli([[9 + incl, 6 + y0 + yC], [15 + incl, 6 + y0 + yC], [13 + incl, 20 + y0 + yC], [9 + incl, 20 + y0 + yC]], M.cabelo);
  perna(g.tras, Mb, Sb);
  // tronco
  b.poli([[10.4 + incl - largT, 17 + y0 + yC], [17.4 + incl + largT, 17 + y0 + yC], [17.8 + largT, 30.5 + y0 + yP], [10.2 - largT, 30.5 + y0 + yP]], p.casaco ? M.casaco : M.tronco);
  if (p.baixo === 'saia' || p.baixo === 'saia-longa') b.poli([[10, 29.5 + y0 + yC], [18, 29.5 + y0 + yC], [19.6, (p.baixo === 'saia' ? 35 : 38) + y0], [8.8, (p.baixo === 'saia' ? 35 : 38) + y0]], M.calca);
  if (p.baixo === 'bermuda') b.poli([[10.2, 29.5 + y0 + yC], [17.8, 29.5 + y0 + yC], [18.4, 34 + y0 + yC], [10, 34 + y0 + yC]], M.calca);
  if (p.avental) b.poli([[15.4 + incl, 20 + y0 + yC], [18.2 + incl, 20 + y0 + yC], [19.4, 35 + y0], [16.4, 35 + y0]], M.avental);
  if (p.faixa) b.poli([[11 + incl, 17 + y0], [13.4 + incl, 17 + y0], [17.6, 28.4 + y0], [15.6, 29.6 + y0]], M.faixa);
  if (p.cinto) b.ret(10.2 - largT, 28.6 + y0 + yP, 7.8 + 2 * largT, 1.6, M.cinto);
  perna(g.frente, p.baixo === 'calca' ? M.calca : M.pele, M.sapato);
  // pescoço e cabeça de perfil
  b.ret(13 + incl, 14.5 + y0 + yC, 3, 3, M.pele);
  b.elipse(14.6 + incl, 9.4 + y0 + yC, 5.8, 6.6, M.pele);
  if (p.cao) {                                                        // focinho comprido para a frente, orelha caída e rabo abanando
    const abana = Math.sin(t * Math.PI * 4) * 1.4;
    b.poli([[10.4 + incl, 26 + y0 + yP], [6.4 + incl, 22 + abana + y0 + yP], [4.8 + incl, 18.4 + abana + y0 + yP], [5.6 + incl, 22.6 + abana + y0 + yP], [9.4 + incl, 28.4 + y0 + yP]], M.orelha);
    b.elipse(21 + incl, 12.2 + y0 + yC, 4.2, 2.6, M.focinho);
    b.poli([[11.6 + incl, 4.6 + y0 + yC], [8.6 + incl, 6.6 + y0 + yC], [8.4 + incl, 14 + y0 + yC], [10.6 + incl, 15.6 + y0 + yC], [12.8 + incl, 9 + y0 + yC]], M.orelha);
  } else b.elipse(20.2 + incl, 10.6 + y0 + yC, 1, 1.2, M.pele);       // nariz
  const yc = y0 + yC, x = incl;
  if (['curto', 'longo', 'rabo', 'coque', 'bagunçado', 'cacheado', 'rabo-alto'].includes(p.cabelo)) b.poli([[8.4 + x, 11 + yc], [8.6 + x, 4.4 + yc], [11.6 + x, 2.2 + yc], [17 + x, 2.2 + yc], [20 + x, 4.4 + yc], [20 + x, 6.6 + yc], [16.4 + x, 6 + yc], [13.4 + x, 7.6 + yc], [12.6 + x, 11.6 + yc]], M.cabelo);
  if (p.cabelo === 'bagunçado') b.poli([[8.6 + x, 4 + yc], [10.4 + x, 0.8 + yc], [12.4 + x, 2.4 + yc], [14.6 + x, 0.6 + yc], [16.6 + x, 2.4 + yc]], M.cabelo);
  if (p.cabelo === 'grisalho') b.poli([[8.6 + x, 11 + yc], [8.8 + x, 5 + yc], [11.6 + x, 3.6 + yc], [13 + x, 8 + yc], [12.4 + x, 11 + yc]], M.cabelo);
  if (p.cabelo === 'careca') b.poli([[8.6 + x, 11 + yc], [8.8 + x, 7 + yc], [11 + x, 6.4 + yc], [12.4 + x, 11 + yc]], M.cabelo);
  if (p.cabelo === 'rabo') b.poli([[8.4 + x, 5 + yc], [5 + x + onda(t * 6.28) * 0.6, 7 + yc], [4.6 + x, 14 + yc], [6.6 + x, 15 + yc], [9 + x, 9 + yc]], M.cabelo);
  if (p.cabelo === 'rabo-alto') { const bal = onda(t * 6.28) * (correr ? 1.6 : 0.8); b.poli([[11 + x, 2 + yc], [7 + x, -0.4 + yc], [3 + x + bal, 2.6 + yc], [2 + x + bal, 9 + yc], [3.6 + x + bal, 14 + yc], [5 + x, 8 + yc], [8.6 + x, 5.4 + yc]], M.cabelo); b.elipse(10.6 + x, 2.6 + yc, 1.4, 1.4, M.prende || M.cabelo); }
  if (p.franja) b.poli([[14 + x, 5 + yc], [15.6 + x, 8.6 + yc], [17 + x, 6 + yc], [18.6 + x, 8.4 + yc], [20.2 + x, 5.6 + yc], [19.6 + x, 3.6 + yc]], M.cabelo);
  if (p.presilha) for (const [px, py] of [[13, 3], [12, 4], [13, 4], [14, 4], [13, 5]]) b.pinta(Math.round(px + x), Math.round(py + yc), p.presilha);
  if (p.cabelo === 'coque') b.elipse(10 + x, 3.4 + yc, 2.6, 2.4, M.cabelo);
  if (p.cabelo === 'cacheado') { b.elipse(11 + x, 3.4 + yc, 3, 2.4, M.cabelo); b.elipse(15.4 + x, 2.4 + yc, 3, 2, M.cabelo); b.elipse(9 + x, 8 + yc, 2.6, 3, M.cabelo); }
  if (p.cabelo === 'topete') b.poli([[8, 11], [7.4, 7.6], [4.6, 6.4], [7.6, 4.8], [6.6, 1.6], [10.2, 2.4], [11.4, -0.8], [13.6, 1.6], [16.2, -0.6], [16.8, 2.2], [20.6, 2.4], [20.6, 5.6], [17.4, 5.4], [14.6, 6.8], [13.2, 7.8], [12.6, 11.6]].map(([px, py]) => [px + x, py + yc]), M.cabelo);
  if (p.cachecol) b.poli([[11.6 + x, 15 + yc], [18.4 + x, 15 + yc], [18.6 + x, 18.2 + yc], [11.4 + x, 18.2 + yc]], M.cachecol);
  if (p.chapeu === 'coroa') { b.poli([[9.2 + x, 5.4 + yc], [9 + x, 0.8 + yc], [11.4 + x, 2.6 + yc], [13.4 + x, -0.8 + yc], [15.4 + x, 2.6 + yc], [17.6 + x, 0.4 + yc], [19.6 + x, 2.8 + yc], [19.8 + x, 5.4 + yc]], M.chapeu); b.ret(Math.round(9.2 + x), Math.round(4 + yc), 11, 1, M.aba); b.pinta(Math.round(14.6 + x), Math.round(3.2 + yc), '#e83a5a'); }
  if (p.chapeu === 'quepe') { b.poli([[8.4 + x, 6.4 + yc], [9.4 + x, 1.2 + yc], [19.4 + x, 1.2 + yc], [20 + x, 6.4 + yc]], M.chapeu); b.poli([[14 + x, 5.8 + yc], [23 + x, 6.2 + yc], [22.4 + x, 7.6 + yc], [14 + x, 7.6 + yc]], M.aba); }
  if (p.chapeu === 'padeiro') { b.poli([[8.6 + x, 5.8 + yc], [8 + x, -0.4 + yc], [12 + x, -2 + yc], [17 + x, -1.6 + yc], [20.4 + x, -0.2 + yc], [20 + x, 5.8 + yc]], M.chapeu); b.ret(8.6 + x, 4.4 + yc, 11.6, 2, M.aba); }
  if (p.chapeu === 'bone') { b.poli([[8.4 + x, 6.6 + yc], [9.4 + x, 2 + yc], [19.4 + x, 2 + yc], [20 + x, 6.6 + yc]], M.chapeu); b.poli([[16 + x, 5.8 + yc], [24 + x, 6 + yc], [23.6 + x, 7.4 + yc], [16 + x, 7.4 + yc]], M.aba); }
  if (p.chapeu === 'elmo') {
    b.poli([[8.2 + x, 9 + yc], [8.6 + x, 4 + yc], [11.4 + x, 1.6 + yc], [17.4 + x, 1.6 + yc], [20.2 + x, 4 + yc], [20.6 + x, 7.2 + yc], [16 + x, 7.2 + yc], [13.4 + x, 9.6 + yc], [12.6 + x, 9.6 + yc]], M.chapeu);
    b.ret(Math.round(14 + x), Math.round(6 + yc), 6, 1, M.aba);
    if (p.cores.pluma) { b.poli([[11 + x, 2 + yc], [12 + x, -1.4 + yc], [15.6 + x, -1.4 + yc], [15 + x, 2 + yc]], M.pluma); b.poli([[8.6 + x, 4.8 + yc], [10.8 + x, -0.6 + yc], [12.6 + x, -0.2 + yc], [11.4 + x, 2.6 + yc]], M.pluma); }
  }
  // braço da frente
  const bf = g.braco * (correr ? 4 : 2.4);
  b.traco(14.4 + incl, 18.5 + y0 + yC, 14.8 + incl + bf, 27.6 + y0 + yC, 1.3, p.mangaCurta ? M.pele : (p.casaco ? M.casaco : M.tronco));
  if (p.mangaCurta) b.traco(14.4 + incl, 18.5 + y0 + yC, 14.5 + incl + bf * 0.4, 22 + y0 + yC, 1.35, M.tronco);
  b.elipse(15 + incl + bf, 29 + y0 + yC, 1.5, 1.3, M.pele);
  if (p.livro) b.ret(Math.round(14 + incl + bf), Math.round(26 + y0 + yC), 3, 4, M.livro);
  // detalhes do rosto
  const ex = Math.round(18 + incl), ey = Math.round(9 + y0 + yC);
  b.pinta(ex, ey, '#2a1810'); b.pinta(ex, ey + 1, '#2a1810');
  if (p.oculos) { const f = '#2a2a3a'; for (let k = -1; k <= 2; k++) { b.pinta(ex + k, ey - 1, f); b.pinta(ex + k, ey + 2, f); } b.pinta(ex + 2, ey, f); b.pinta(ex + 2, ey + 1, f); b.pinta(ex - 2, ey, f); }
  if (p.oculosEscuros) { const f = '#14141e'; for (let k = -1; k <= 2; k++) for (let j = -1; j <= 1; j++) b.pinta(ex + k, ey + j, f); b.pinta(ex, ey - 1, '#3a3a52'); b.pinta(ex - 2, ey - 1, f); b.pinta(ex - 3, ey - 1, f); }
  if (p.cao) {
    for (const [dx, dy] of [[5, 0], [6, 0], [6, 1], [7, 1], [6, 2], [7, 2]]) b.pinta(ex + dx, ey + dy, '#1a1014'); b.pinta(ex + 6, ey, '#8a7a84');
    b.pinta(ex - 1, ey - 2, tons(p.cores.focinho || '#f0dcc0')[1]); b.pinta(ex, ey - 2, tons(p.cores.focinho || '#f0dcc0')[1]);
    for (const k of [2, 3, 4]) b.pinta(ex + k, ey + 4, '#3a2420');
    b.pinta(ex + 3, ey + 5, '#e8708a');
  } else {
    if (p.bigode) { b.pinta(ex + 1, ey + 3, tons(p.cores.bigode || p.cores.cabelo)[2]); b.pinta(ex + 2, ey + 3, tons(p.cores.bigode || p.cores.cabelo)[2]); }
    else if (p.sorrisoLado) { b.pinta(ex, ey + 4, '#9a4a3a'); b.pinta(ex + 1, ey + 4, '#9a4a3a'); b.pinta(ex + 2, ey + 3, '#9a4a3a'); }
    else b.pinta(ex + 1, ey + 4, '#9a4a3a');
    b.pinta(ex - 1, ey + 2, '#e8907a');
    if (p.sobrancelhaBrava) { const sb = tons(p.cores.cabelo)[3]; b.pinta(ex - 1, ey - 2, sb); b.pinta(ex, ey - 2, sb); b.pinta(ex + 1, ey - 1, sb); }
  }
  if (p.mecha) for (const [mx, my] of [[14, 1.6], [14, 2.6], [15, 3.6]]) b.pinta(Math.round(mx + incl), Math.round(my + y0 + yC), p.mecha);
  if (p.curativo) for (const k of [-2, -1, 0]) b.pinta(ex + k, ey + 2, k === -1 ? '#e0b888' : '#f6dcae');
  if (p.brincos) { b.pinta(Math.round(13.4 + incl), ey + 3, '#f0c840'); b.pinta(Math.round(13.4 + incl), ey + 4, '#c89020'); }
  if (p.distintivo) b.pinta(Math.round(16 + incl), Math.round(21 + y0 + yC), '#f0c840');
  if (p.emblema) { const ce = p.cores.emblema || '#f0c840'; b.pinta(Math.round(16 + incl), Math.round(21 + y0 + yC), ce); b.pinta(Math.round(16 + incl), Math.round(22 + y0 + yC), ce); }
  if (p.gravata) for (let y = 18; y < 24; y++) b.pinta(Math.round(17.2 + incl), Math.round(y + y0), '#c83030');
  return b.render();
}

export function pessoa(p) {
  const fr = [frente(p), frente(p, { piscar: true }), frente(p, { resp: 1 })];
  const andar = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => lado(p, i / 8));
  const correr = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => lado(p, i / 8, { correr: true }));
  const andarC = [0, 0.25, 0.5, 0.75].map((t) => lado(p, t, { classico: true }));
  const correrC = [0, 1, 2, 3, 4, 5].map((i) => lado(p, i / 6, { correr: true, classico: true }));
  const seq = (a, n) => [...Array(n).keys()].map((i) => a + i);
  return {
    quadros: [...fr, ...andar, ...correr, ...andarC, ...correrC],
    anims: {
      parado: { q: [0, 0, 2, 2, 0, 0, 2, 2, 1, 2], fps: 4 },
      andando: { q: seq(3, 8), fps: 14, passada: 14 },
      correndo: { q: seq(11, 8), fps: 18, passada: 24 },
      pulando: { q: [13], fps: 1 },
    },
    animsClassicas: { andando: { q: seq(19, 4), fps: 7 }, correndo: { q: seq(23, 6), fps: 13 }, pulando: { q: [25], fps: 1 } },
    sombra: true, personagem: true,
  };
}
// de costas: rosto vira cabelo, frente da roupa vira costas lisas e a mochila aparece
function opCostas(p) {
  const yC = p.corpo === 'crianca' ? 2 : 0, cab = tons(p.cores.cabelo), pele = tons(p.cores.pele);
  const roupa = tons(p.casaco ? p.cores.casaco : p.cores.tronco), largT = p.corpo === 'largo' ? 1 : 0;
  const det = ['#2a1810', '#ffffff', '#9a4a3a', '#e8907a', '#2a2a3a', pele[2], tons(p.cores.bigode || p.cores.cabelo)[2]];
  return {
    cabeca: { cx: 14, cy: 9.6 + yC, rx: 6.6, ry: 7 }, de: pele, para: [cab[0], cab[1], cab[2], cab[3]], detalhes: det,
    tronco: { x0: 10 - largT, x1: 18 + largT, y0: 18 + yC, y1: 29 + yC, tons: roupa },
    mochila: p.mochila ? tons(p.cores.mochila) : null,
  };
}
// layout do rosto (para as expressões de motor/expressoes.js); r = respiração (0 ou 1)
function rostoDe(p, r) {
  const yC = p.corpo === 'crianca' ? 2 : 0, o = (y) => Math.round(y - r + yC), pele = tons(p.cores.pele);
  const temSobr = p.sobrancelhaBrava || !p.chapeu || p.chapeu === 'bone' || p.chapeu === 'coroa';
  return { olhos: [[11, o(9)], [16, o(9)]], w: 2, h: 2, boca: [14, o(p.bigode ? 14 : 13.4)], semBoca: !!p.cao, sobr: temSobr ? o(7.6) : null,
    sobrCor: tons(p.cores.cabelo)[3], bochechas: p.cao ? [] : [[9, o(12)], [19, o(12)]], pele: pele[1], sombra: pele[2], olho: '#2a1810',
    oculos: !!p.oculos, semOlhos: !!p.oculosEscuros };
}
export const pessoaComSentado = (p) => {
  const q = p.corpo === 'crianca' ? 32 : 30;
  const s = adicionarEspirro(adicionarCostas(adicionarSentado(pessoa(p), { q }), opCostas(p), { q }), [frente(p, { espirro: 'antes' }), frente(p, { espirro: 'atchim' })]);
  return adicionarExpressoes(s, (e) => [aplicarRosto(frente(p), rostoDe(p, 0), e), aplicarRosto(frente(p, { resp: 1 }), rostoDe(p, 1), e)]);
};

export const MORADORES = {
  policial: { cores: { pele: '#c88a64', cabelo: '#2a1e1a', tronco: '#3a5aa0', calca: '#222a48', sapato: '#2a2a30', chapeu: '#222a48', aba: '#1a1a24', cinto: '#2a2a2a' },
    cabelo: 'curto', chapeu: 'quepe', baixo: 'calca', cinto: true, distintivo: true, radio: true, mangaCurta: true },
  prefeito: { cores: { pele: '#f0c4a0', cabelo: '#b8b8c0', bigode: '#c8c8d0', tronco: '#f0f0f0', casaco: '#4a4a5a', calca: '#3a3a48', sapato: '#2a2420', faixa: '#2a9a4a' },
    cabelo: 'grisalho', baixo: 'calca', casaco: true, gravata: true, faixa: true, bigode: true, corpo: 'largo' },
  aluno: { cores: { pele: '#e0a882', cabelo: '#5a3a24', tronco: '#f4f4f4', calca: '#2a4a9a', sapato: '#e8e8f0', meia: '#f0f0f0', mochila: '#c83c4c' },
    cabelo: 'bagunçado', baixo: 'bermuda', mangaCurta: true, mochila: true, corpo: 'crianca', golaCor: '#2a4a9a' },
  aluna: { cores: { pele: '#8a5a40', cabelo: '#1e1410', tronco: '#f4f4f4', calca: '#2a4a9a', sapato: '#e8e8f0', meia: '#f4f4f4', mochila: '#f0b830' },
    cabelo: 'rabo', baixo: 'saia', meias: true, mangaCurta: true, mochila: true, corpo: 'crianca', golaCor: '#2a4a9a' },
  professora: { cores: { pele: '#f2c8a8', cabelo: '#b8542a', tronco: '#f0e6d0', casaco: '#3a8a5a', calca: '#7a4a2a', sapato: '#4a2e20', livro: '#a83a3a' },
    cabelo: 'coque', baixo: 'saia-longa', casaco: true, oculos: true, livro: true },
  padeiro: { cores: { pele: '#f0b898', cabelo: '#6a4a3a', bigode: '#5a3a2a', tronco: '#d8d0c0', avental: '#fafaf4', calca: '#5a5a6a', sapato: '#3a2a20', chapeu: '#fafaf4', aba: '#eae6dc' },
    cabelo: 'curto', chapeu: 'padeiro', baixo: 'calca', avental: true, bigode: true, corpo: 'largo' },
  caixa: { cores: { pele: '#d8a070', cabelo: '#3a2618', tronco: '#f0c830', avental: '#3a9a5a', calca: '#3a5a8a', sapato: '#6a4a30', chapeu: '#2e7a46', aba: '#246a3a' },
    cabelo: 'curto', chapeu: 'bone', baixo: 'calca', avental: true, mangaCurta: true },
};

registrarSprites(Object.fromEntries(Object.entries(MORADORES).map(([k, p]) => [k, () => pessoaComSentado(p)])), { grupo: 'Moradores da cidade' });

// Nesse Mundo (aprovadas): variações dos moradores
export const VARIACOES = {
  'policial-oculos': { ...MORADORES.policial, oculosEscuros: true },   // policial Ronaldo, óculos escuros
  'prefeito-careca': { ...MORADORES.prefeito, cabelo: 'careca' },      // prefeito depois que a peruca voa
  // PROTÓTIPO: cão policial detalhado (versão nova do "cao-guarda" do estilo RPG)
  'padeiro-pregador': { ...MORADORES.padeiro, pregador: true },   // PROTÓTIPO: seu Tonho com pregador no nariz
  'cao-policial': { ...MORADORES.policial, cao: true, cabelo: 'nenhum',
    cores: { ...MORADORES.policial.cores, pele: '#c8884a', cabelo: '#7a4a24', orelha: '#6a3a1c', focinho: '#f0dcc0' } },
};
registrarSprites(Object.fromEntries(Object.entries(VARIACOES).map(([k, p]) => [k, () => pessoaComSentado(p)])), { grupo: 'Moradores da cidade', prototipos: ['cao-policial', 'padeiro-pregador'] });
