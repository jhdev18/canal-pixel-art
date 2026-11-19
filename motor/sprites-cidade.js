// Moradores da cidade: gerador de pessoas detalhadas (28x44) + 7 personagens.
// Mesmo sistema de camadas da menina-capa: formas por material -> sombreamento -> contorno colorido.
import { Boneco, passada } from './boneco.js';
import { registrarSprites } from './sprites.js';
import { hexParaRgb } from './pixel.js';

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
function frente(p, { resp = 0, piscar = false } = {}) {
  const b = new Boneco(W, H); const M = materiais(b, p);
  const r = resp;
  const largT = p.corpo === 'largo' ? 1.2 : p.corpo === 'crianca' ? -0.6 : 0;
  const yC = p.corpo === 'crianca' ? 2 : 0;          // crianças: corpo um pouco mais baixo
  // cabelo comprido atrás da cabeça
  if (p.cabelo === 'cacheado') { b.elipse(14, 10 - r + yC, 9, 8.6, M.cabelo); b.elipse(7.2, 17 - r + yC, 3.4, 3.6, M.cabelo); b.elipse(20.8, 17 - r + yC, 3.4, 3.6, M.cabelo); }
  if (p.cabelo === 'longo') b.poli([[7.3, 7 - r + yC], [20.7, 7 - r + yC], [21.4, 20 - r + yC], [6.6, 20 - r + yC]], M.cabelo);
  // mochila (alças aparecem na frente; o corpo da mochila aparece nas laterais)
  if (p.mochila) { b.ret(6, 18 - r + yC, 2, 10, M.mochila); b.ret(20, 18 - r + yC, 2, 10, M.mochila); }
  // pernas e calçados
  const pernaTopo = 30 + yC;
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
  b.poli([[8.6 - largT, 17 - r + yC], [19.4 + largT, 17 - r + yC], [20 + largT, 30 + yC], [8 - largT, 30 + yC]], M.tronco);
  if (p.casaco) { b.poli([[8.4 - largT, 17 - r + yC], [12.6, 17 - r + yC], [12.2, 30 + yC], [7.8 - largT, 30 + yC]], M.casaco); b.poli([[15.4, 17 - r + yC], [19.6 + largT, 17 - r + yC], [20.2 + largT, 30 + yC], [15.8, 30 + yC]], M.casaco); }
  if (p.avental) b.poli([[10, 20 - r + yC], [18, 20 - r + yC], [18.6, 36], [9.4, 36]], M.avental);
  // braços
  const bracoCor = p.casaco ? M.casaco : (p.mangaCurta ? M.pele : M.tronco);
  b.poli([[7.4 - largT, 17.6 - r + yC], [10 - largT, 18 - r + yC], [8.6 - largT, 28.6 - r + yC], [5.2 - largT, 28.6 - r + yC]], M.tronco);
  b.poli([[18 + largT, 18 - r + yC], [20.6 + largT, 17.6 - r + yC], [22.8 + largT, 28.6 - r + yC], [19.4 + largT, 28.6 - r + yC]], M.tronco);
  if (p.mangaCurta) { b.poli([[6.2 - largT, 22 - r + yC], [9.2 - largT, 22 - r + yC], [8.6 - largT, 28.6 - r + yC], [5.2 - largT, 28.6 - r + yC]], M.pele); b.poli([[18.8 + largT, 22 - r + yC], [21.8 + largT, 22 - r + yC], [22.8 + largT, 28.6 - r + yC], [19.4 + largT, 28.6 - r + yC]], M.pele); }
  if (p.casaco) { b.poli([[7.4 - largT, 17.6 - r + yC], [10 - largT, 18 - r + yC], [8.6 - largT, 28.6 - r + yC], [5.2 - largT, 28.6 - r + yC]], bracoCor); b.poli([[18 + largT, 18 - r + yC], [20.6 + largT, 17.6 - r + yC], [22.8 + largT, 28.6 - r + yC], [19.4 + largT, 28.6 - r + yC]], bracoCor); }
  b.elipse(6.8 - largT, 29.6 - r + yC, 1.6, 1.4, M.pele); b.elipse(21.2 + largT, 29.6 - r + yC, 1.6, 1.4, M.pele);
  if (p.livro) b.ret(19 + largT, 25 - r + yC, 4, 5, M.livro);
  if (p.faixa) b.poli([[9 - largT, 17 - r + yC], [12, 17 - r + yC], [20 + largT, 28 + yC], [17 + largT, 30 + yC]], M.faixa);
  if (p.cinto) b.ret(8.2 - largT, 28.5 + yC, 11.6 + 2 * largT, 1.6, M.cinto);
  // pescoço e cabeça
  b.ret(12.5, 14.5 - r + yC, 3, 3, M.pele);
  b.elipse(14, 9.4 - r + yC, 6.2, 6.6, M.pele);
  // cabelo / chapéu
  const yc = -r + yC;
  if (p.cabelo === 'curto') b.poli([[7.6, 9 + yc], [8.4, 4.4 + yc], [11, 2.4 + yc], [17, 2.4 + yc], [19.8, 4.6 + yc], [20.4, 9 + yc], [18.6, 6.4 + yc], [15.6, 7 + yc], [12, 6 + yc], [9.4, 7.4 + yc]], M.cabelo);
  if (p.cabelo === 'bagunçado') b.poli([[7.4, 9.6 + yc], [7.6, 4 + yc], [10, 1.6 + yc], [12, 2.6 + yc], [14, 1 + yc], [16.4, 2.4 + yc], [18.6, 1.8 + yc], [20.6, 5 + yc], [20.6, 9.6 + yc], [19, 6.6 + yc], [16.4, 7.4 + yc], [14.6, 5.6 + yc], [12.4, 7.4 + yc], [9.6, 6.4 + yc]], M.cabelo);
  if (p.cabelo === 'grisalho') { b.poli([[7.6, 11 + yc], [7.8, 6 + yc], [9.4, 4.6 + yc], [10, 9 + yc]], M.cabelo); b.poli([[20.4, 11 + yc], [20.2, 6 + yc], [18.6, 4.6 + yc], [18, 9 + yc]], M.cabelo); b.poli([[10, 4 + yc], [18, 4 + yc], [17, 3 + yc], [11, 3 + yc]], M.cabelo); }
  if (p.cabelo === 'longo' || p.cabelo === 'rabo' || p.cabelo === 'coque' || p.cabelo === 'cacheado') b.poli([[7.4, 11 + yc], [7.8, 4.6 + yc], [10.6, 2.2 + yc], [17.4, 2.2 + yc], [20.2, 4.6 + yc], [20.6, 11 + yc], [19.2, 7 + yc], [16, 5.6 + yc], [13.2, 6.6 + yc], [10, 5.8 + yc], [8.8, 8 + yc]], M.cabelo);
  if (p.cabelo === 'rabo') b.poli([[19.6, 5 + yc], [22.6, 6 + yc], [23.4, 14 + yc], [21.4, 15 + yc], [20.4, 9 + yc]], M.cabelo);
  if (p.cabelo === 'coque') b.elipse(14, 1.8 + yc, 3.2, 2.4, M.cabelo);
  if (p.cabelo === 'cacheado') { for (const [x, y] of [[9, 3.6], [12.4, 2.2], [15.8, 2.2], [19, 3.6]]) b.elipse(x, y + yc, 2.6, 2.2, M.cabelo); b.elipse(7.6, 10 + yc, 1.8, 3.2, M.cabelo); b.elipse(20.4, 10 + yc, 1.8, 3.2, M.cabelo); }
  if (p.cabelo === 'topete') b.poli([[7.2, 10.4], [6.6, 6.4], [3.6, 5.2], [7, 3.4], [7.4, 0.4], [10.6, 1.6], [12.6, -2.2], [14.8, 1], [17.6, -1.8], [18.6, 1.8], [22.4, 0.8], [20.8, 4.2], [24.2, 5.6], [20.8, 7], [21, 10.4], [19.2, 7.2], [16.6, 7.8], [15.2, 6], [13.2, 7.8], [11, 6.4], [9.2, 7.8]].map(([x, y]) => [x, y + yc]), M.cabelo);
  if (p.cachecol) { b.poli([[8.4, 15.2 + yc], [19.6, 15.2 + yc], [20, 18.4 + yc], [8, 18.4 + yc]], M.cachecol); b.ret(15.4, 18 + yc, 3.2, 8, M.cachecol); }
  if (p.chapeu === 'quepe') { b.poli([[7.4, 6.2 + yc], [8.4, 1.2 + yc], [19.6, 1.2 + yc], [20.6, 6.2 + yc]], M.chapeu); b.poli([[7, 6 + yc], [21, 6 + yc], [20.4, 7.6 + yc], [7.6, 7.6 + yc]], M.aba); }
  if (p.chapeu === 'padeiro') { b.poli([[8, 5.6 + yc], [7.2, -0.4 + yc], [10, -2 + yc], [14, -1 + yc], [18, -2 + yc], [20.8, -0.4 + yc], [20, 5.6 + yc]], M.chapeu); b.ret(8, 4.4 + yc, 12, 2, M.aba); }
  if (p.chapeu === 'bone') { b.poli([[7.6, 6.4 + yc], [8.6, 2 + yc], [19.4, 2 + yc], [20.4, 6.4 + yc]], M.chapeu); b.poli([[12, 5.6 + yc], [22.4, 5.6 + yc], [22, 7.2 + yc], [12, 7.2 + yc]], M.aba); }
  // ---- detalhes
  const o = (y) => Math.round(y - r + yC);
  const olho = '#2a1810';
  if (piscar) { for (const x of [11, 12, 16, 17]) b.pinta(x, o(10), p.cores.pele === undefined ? '#a06a58' : tons(p.cores.pele)[2]); }
  else for (const x of [11, 16]) { b.pinta(x, o(9), olho); b.pinta(x, o(10), olho); b.pinta(x + 1, o(9), '#ffffff'); b.pinta(x + 1, o(10), olho); }
  const sobr = tons(p.cores.cabelo)[3];
  if (!p.chapeu || p.chapeu === 'bone') { for (const x of [10, 11, 12]) b.pinta(x, o(7.6), sobr); for (const x of [15, 16, 17]) b.pinta(x, o(7.6), sobr); }
  if (p.oculos) { const f = '#2a2a3a'; for (const [x0] of [[10], [15]]) { for (let x = x0; x < x0 + 4; x++) { b.pinta(x, o(8), f); b.pinta(x, o(11), f); } b.pinta(x0, o(9), f); b.pinta(x0, o(10), f); b.pinta(x0 + 3, o(9), f); b.pinta(x0 + 3, o(10), f); } b.pinta(14, o(9), f); }
  if (p.bigode) { for (const x of [12, 13, 14, 15, 16]) b.pinta(x, o(12.6), tons(p.cores.bigode || p.cores.cabelo)[2]); b.pinta(11, o(13), tons(p.cores.bigode || p.cores.cabelo)[2]); b.pinta(17, o(13), tons(p.cores.bigode || p.cores.cabelo)[2]); }
  else { b.pinta(13, o(13.4), '#9a4a3a'); b.pinta(14, o(13.4), '#9a4a3a'); b.pinta(15, o(13), '#9a4a3a'); }
  b.pinta(9, o(12), '#e8907a'); b.pinta(19, o(12), '#e8907a');
  if (p.mecha) for (const [x, y] of [[13, 1], [13, 2], [14, 2], [14, 3], [15, 4]]) b.pinta(x, o(y), p.mecha);
  if (p.curativo) for (const x of [16, 17, 18, 19]) for (const y of [11.2, 12.2]) b.pinta(x, o(y), x === 17 || x === 18 ? '#e0b888' : '#f6dcae');
  if (p.sardas) for (const [x, y] of [[10, 11.6], [11, 12.4], [12, 11.6]]) b.pinta(x, o(y), '#c8784a');
  if (p.brincos) for (const x of [7, 20]) { b.pinta(x, o(12.4), '#f0c840'); b.pinta(x, o(13.4), '#c89020'); }
  if (p.colar) for (const [x, y] of [[11, 17.4], [12, 18.4], [13, 19], [14, 19.4], [15, 19], [16, 18.4], [17, 17.4]]) b.pinta(x, o(y), p.colar);
  if (p.cachecol) { const c = tons(p.cores.cachecol); for (const y of [20, 23]) for (const x of [16, 17]) b.pinta(x, o(y), c[2]); for (const x of [15, 17]) b.pinta(x, o(26), c[0]); }
  if (p.chapeu === 'quepe') { b.pinta(13, o(3.4), '#f0c840'); b.pinta(14, o(3.4), '#f0c840'); b.pinta(13, o(4.4), '#c89020'); b.pinta(14, o(4.4), '#c89020'); }
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
  const g = passada(t, correr ? { passo: 5.6, levanta: 4, quadril: [14, 30 + yC] } : { passo: 3.4, levanta: 2.2, quadril: [14, 30 + yC] });
  const onda = classico ? Math.sin : Math.cos;
  const incl = correr ? 2.2 : 0, y0 = -Math.round(Math.abs(onda(t * Math.PI * 2)) * (correr ? 1.5 : 1));
  const largT = p.corpo === 'largo' ? 1 : 0;
  const barra = p.baixo === 'saia' ? 34.5 : p.baixo === 'saia-longa' ? 37.4 : 30.5 + yC;   // de onde a perna aparece
  const perna = (pe, mPerna, mSap) => {
    b.traco(14 + incl * 0.2, barra + y0, pe.x, pe.y - 3, 1.3, mPerna);
    b.poli([[pe.x - 2.2, pe.y - 3.6], [pe.x + 1.6, pe.y - 3.6], [pe.x + 3.4, pe.y], [pe.x - 2.2, pe.y]], mSap);
  };
  // braço de trás
  const bt = -g.braco * (correr ? 4 : 2.4);
  b.traco(13.6 + incl, 18.5 + y0 + yC, 13.6 + incl + bt, 27.5 + y0 + yC, 1.2, p.mangaCurta ? M.pele : (p.casaco ? M.casaco : M.tronco));
  // mochila nas costas
  if (p.mochila) b.poli([[7.2 + incl, 17.5 + y0 + yC], [10.4 + incl, 17 + y0 + yC], [10.4 + incl, 28 + y0 + yC], [7.4 + incl, 28 + y0 + yC]], M.mochila);
  // cabelo comprido atrás
  if (p.cabelo === 'cacheado') { b.elipse(11.4 + incl, 9.4 + y0 + yC, 6.4, 7.8, M.cabelo); b.elipse(10 + incl, 16.4 + y0 + yC, 3.6, 3.2, M.cabelo); }
  if (p.cachecol) { const ond = Math.sin(t * Math.PI * 4) * 0.8; b.traco(12 + incl, 17 + y0 + yC, (correr ? 4.6 : 7.2) + incl, (correr ? 19.4 : 23) + ond + y0 + yC, 1.2, M.cachecol); }
  if (p.cabelo === 'longo') b.poli([[9 + incl, 6 + y0 + yC], [15 + incl, 6 + y0 + yC], [13 + incl, 20 + y0 + yC], [9 + incl, 20 + y0 + yC]], M.cabelo);
  perna(g.tras, Mb, Sb);
  // tronco
  b.poli([[10.4 + incl - largT, 17 + y0 + yC], [17.4 + incl + largT, 17 + y0 + yC], [17.8 + largT, 30.5 + y0 + yC], [10.2 - largT, 30.5 + y0 + yC]], p.casaco ? M.casaco : M.tronco);
  if (p.baixo === 'saia' || p.baixo === 'saia-longa') b.poli([[10, 29.5 + y0 + yC], [18, 29.5 + y0 + yC], [19.6, (p.baixo === 'saia' ? 35 : 38) + y0], [8.8, (p.baixo === 'saia' ? 35 : 38) + y0]], M.calca);
  if (p.baixo === 'bermuda') b.poli([[10.2, 29.5 + y0 + yC], [17.8, 29.5 + y0 + yC], [18.4, 34 + y0 + yC], [10, 34 + y0 + yC]], M.calca);
  if (p.avental) b.poli([[15.4 + incl, 20 + y0 + yC], [18.2 + incl, 20 + y0 + yC], [19.4, 35 + y0], [16.4, 35 + y0]], M.avental);
  if (p.faixa) b.poli([[11 + incl, 17 + y0], [13.4 + incl, 17 + y0], [17.6, 28.4 + y0], [15.6, 29.6 + y0]], M.faixa);
  if (p.cinto) b.ret(10.2 - largT, 28.6 + y0 + yC, 7.8 + 2 * largT, 1.6, M.cinto);
  perna(g.frente, p.baixo === 'calca' ? M.calca : M.pele, M.sapato);
  // pescoço e cabeça de perfil
  b.ret(13 + incl, 14.5 + y0 + yC, 3, 3, M.pele);
  b.elipse(14.6 + incl, 9.4 + y0 + yC, 5.8, 6.6, M.pele);
  b.elipse(20.2 + incl, 10.6 + y0 + yC, 1, 1.2, M.pele);             // nariz
  const yc = y0 + yC, x = incl;
  if (['curto', 'longo', 'rabo', 'coque', 'bagunçado', 'cacheado'].includes(p.cabelo)) b.poli([[8.4 + x, 11 + yc], [8.6 + x, 4.4 + yc], [11.6 + x, 2.2 + yc], [17 + x, 2.2 + yc], [20 + x, 4.4 + yc], [20 + x, 6.6 + yc], [16.4 + x, 6 + yc], [13.4 + x, 7.6 + yc], [12.6 + x, 11.6 + yc]], M.cabelo);
  if (p.cabelo === 'bagunçado') b.poli([[8.6 + x, 4 + yc], [10.4 + x, 0.8 + yc], [12.4 + x, 2.4 + yc], [14.6 + x, 0.6 + yc], [16.6 + x, 2.4 + yc]], M.cabelo);
  if (p.cabelo === 'grisalho') b.poli([[8.6 + x, 11 + yc], [8.8 + x, 5 + yc], [11.6 + x, 3.6 + yc], [13 + x, 8 + yc], [12.4 + x, 11 + yc]], M.cabelo);
  if (p.cabelo === 'rabo') b.poli([[8.4 + x, 5 + yc], [5 + x + onda(t * 6.28) * 0.6, 7 + yc], [4.6 + x, 14 + yc], [6.6 + x, 15 + yc], [9 + x, 9 + yc]], M.cabelo);
  if (p.cabelo === 'coque') b.elipse(10 + x, 3.4 + yc, 2.6, 2.4, M.cabelo);
  if (p.cabelo === 'cacheado') { b.elipse(11 + x, 3.4 + yc, 3, 2.4, M.cabelo); b.elipse(15.4 + x, 2.4 + yc, 3, 2, M.cabelo); b.elipse(9 + x, 8 + yc, 2.6, 3, M.cabelo); }
  if (p.cabelo === 'topete') b.poli([[8, 11], [7.4, 7.6], [4.6, 6.4], [7.6, 4.8], [6.6, 1.6], [10.2, 2.4], [11.4, -0.8], [13.6, 1.6], [16.2, -0.6], [16.8, 2.2], [20.6, 2.4], [20.6, 5.6], [17.4, 5.4], [14.6, 6.8], [13.2, 7.8], [12.6, 11.6]].map(([px, py]) => [px + x, py + yc]), M.cabelo);
  if (p.cachecol) b.poli([[11.6 + x, 15 + yc], [18.4 + x, 15 + yc], [18.6 + x, 18.2 + yc], [11.4 + x, 18.2 + yc]], M.cachecol);
  if (p.chapeu === 'quepe') { b.poli([[8.4 + x, 6.4 + yc], [9.4 + x, 1.2 + yc], [19.4 + x, 1.2 + yc], [20 + x, 6.4 + yc]], M.chapeu); b.poli([[14 + x, 5.8 + yc], [23 + x, 6.2 + yc], [22.4 + x, 7.6 + yc], [14 + x, 7.6 + yc]], M.aba); }
  if (p.chapeu === 'padeiro') { b.poli([[8.6 + x, 5.8 + yc], [8 + x, -0.4 + yc], [12 + x, -2 + yc], [17 + x, -1.6 + yc], [20.4 + x, -0.2 + yc], [20 + x, 5.8 + yc]], M.chapeu); b.ret(8.6 + x, 4.4 + yc, 11.6, 2, M.aba); }
  if (p.chapeu === 'bone') { b.poli([[8.4 + x, 6.6 + yc], [9.4 + x, 2 + yc], [19.4 + x, 2 + yc], [20 + x, 6.6 + yc]], M.chapeu); b.poli([[16 + x, 5.8 + yc], [24 + x, 6 + yc], [23.6 + x, 7.4 + yc], [16 + x, 7.4 + yc]], M.aba); }
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
  if (p.bigode) { b.pinta(ex + 1, ey + 3, tons(p.cores.bigode || p.cores.cabelo)[2]); b.pinta(ex + 2, ey + 3, tons(p.cores.bigode || p.cores.cabelo)[2]); }
  else b.pinta(ex + 1, ey + 4, '#9a4a3a');
  b.pinta(ex - 1, ey + 2, '#e8907a');
  if (p.mecha) for (const [mx, my] of [[14, 1.6], [14, 2.6], [15, 3.6]]) b.pinta(Math.round(mx + incl), Math.round(my + y0 + yC), p.mecha);
  if (p.curativo) for (const k of [-2, -1, 0]) b.pinta(ex + k, ey + 2, k === -1 ? '#e0b888' : '#f6dcae');
  if (p.brincos) { b.pinta(Math.round(13.4 + incl), ey + 3, '#f0c840'); b.pinta(Math.round(13.4 + incl), ey + 4, '#c89020'); }
  if (p.distintivo) b.pinta(Math.round(16 + incl), Math.round(21 + y0 + yC), '#f0c840');
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

registrarSprites(Object.fromEntries(Object.entries(MORADORES).map(([k, p]) => [k, () => pessoa(p)])));
