// PROTÓTIPO (só para teste, pedido do usuário): MAPA DE RPG — uma vila inteira vista de cima, tudo ligado:
// caminhos de terra, praça de pedra com fonte, rio com ponte, casas com telhado grande (estilo RPG clássico),
// padaria/escola/mercado com letreiro, árvores, cercas, horta, postes e flores. Estilo próprio (nada copiado de jogo).
// Coordenadas: x para a direita, z para CIMA no mapa (1 unidade = 1 tile de 16 px). O chão é uma imagem só; casas,
// árvores, fonte, postes e cercas são "peças" separadas, ordenadas pela linha da base (quem está mais embaixo fica na frente).
import { desenharTexto, larguraTexto } from '../fonte.js';

export const T = 16;                 // px por tile
export const MAPA = { w: 56, h: 36 }; // tiles

function rng(s) { return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export function gerarMapaRPG(opc = {}) {
  const r = rng(opc.semente ?? 11);
  const W = MAPA.w * T, H = MAPA.h * T;
  const chao = canvas(W, H), g = chao.getContext('2d');
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const pecas = [];   // { cv, x0, y0 (px do canto de cima), zBase }
  const peca = (cv, x0, y0, yBase) => pecas.push({ cv, x0: Math.round(x0), y0: Math.round(y0), zBase: (H - yBase) / T });

  // ---------- chão: grama com variação, tufos e flores
  for (let ty = 0; ty < MAPA.h; ty++) for (let tx = 0; tx < MAPA.w; tx++) R(g, tx * T, ty * T, T, T, (tx + ty) % 2 ? '#5aa04a' : '#56994a');
  for (let k = 0; k < 2600; k++) { const x = r() * W, y = r() * H; R(g, x, y, 1, 2, r() < 0.5 ? '#6ab85a' : '#468a3c'); }
  const flores = ['#f8e060', '#f0f0f0', '#f08ab0', '#a0c8f8'];
  for (let k = 0; k < 160; k++) { const x = r() * W, y = r() * H, c = flores[Math.floor(r() * 4)]; R(g, x, y, 2, 2, c); R(g, x + 3, y + 1, 2, 2, c); R(g, x + 1, y + 3, 2, 2, c); }

  // ---------- caminhos de terra (com borda e pedrinhas)
  const terra = (x, y, w, h) => {
    R(g, x * T, y * T, w * T, h * T, '#c8a670');
    for (let k = 0; k < w * h * 6; k++) R(g, (x + r() * w) * T, (y + r() * h) * T, 2, 1, r() < 0.5 ? '#b08e5a' : '#dcc08a');
  };
  const bordaTerra = (x, y, w, h) => { R(g, x * T, y * T - 1, w * T, 2, '#9a7a48'); R(g, x * T, (y + h) * T - 1, w * T, 2, '#e0c890'); };
  terra(0, 18, MAPA.w, 3); bordaTerra(0, 18, MAPA.w, 3);          // estrada principal (horizontal)
  terra(26, 4, 3, 28);                                            // estrada que sobe até a ponte e desce até a horta
  // ---------- praça de pedra no cruzamento
  const pedra = (x, y, w, h) => {
    for (let py = y * T; py < (y + h) * T; py += 8) for (let px = x * T + ((py / 8) % 2) * 4; px < (x + w) * T; px += 8) {
      R(g, px, py, 8, 8, '#a8a8b0'); R(g, px, py, 7, 7, r() < 0.5 ? '#c4c4cc' : '#b8b8c2'); R(g, px + 1, py + 1, 3, 1, '#d8d8e0');
    }
  };
  pedra(20, 13, 15, 13);
  R(g, 20 * T, 13 * T - 2, 15 * T, 2, '#8a8a94'); R(g, 20 * T, 26 * T, 15 * T, 2, '#8a8a94');

  // ---------- rio com ponte (no alto do mapa)
  for (let y = 1 * T; y < 4 * T; y++) for (let x = 0; x < W; x++) {
    const onda = Math.sin(x * 0.18 + y * 0.5) > 0.86;
    R(g, x, y, 1, 1, y < 1 * T + 2 || y > 4 * T - 3 ? '#3a6ab0' : onda ? '#bfe4ff' : (Math.floor(x / 5 + y / 3) % 7 === 0 ? '#5a9ae0' : '#4a86d0'));
  }
  R(g, 0, 1 * T - 2, W, 2, '#8a7050'); R(g, 0, 4 * T, W, 2, '#8a7050');   // barranco
  for (let px = 25 * T; px < 30 * T; px += 4) { R(g, px, 0.6 * T, 4, 3.8 * T, '#a87a4a'); R(g, px, 0.6 * T, 1, 3.8 * T, '#7a5430'); }   // tábuas
  R(g, 25 * T - 2, 0.6 * T, 2, 3.8 * T, '#5a3a20'); R(g, 30 * T, 0.6 * T, 2, 3.8 * T, '#5a3a20');                                   // corrimão

  // ---------- horta cercada (embaixo à esquerda)
  for (let fila = 0; fila < 5; fila++) {
    const y = (27.5 + fila * 1.2) * T;
    R(g, 3 * T, y, 9 * T, 10, '#7a5432');
    for (let px = 3 * T + 4; px < 12 * T - 4; px += 9) { R(g, px, y - 3, 5, 5, fila % 2 ? '#3a9a3a' : '#5ab84a'); R(g, px + 1, y - 4, 3, 2, fila === 2 ? '#e06a3a' : '#7ad06a'); }
  }

  // ---------- casas (telhado grande visto de cima + parede da frente com porta)
  const TELHADOS = [['#d85a4a', '#b8443a', '#8a2e28'], ['#4a7ac8', '#3a62a8', '#2a467a'], ['#6aa84a', '#4e8a3a', '#36622a'], ['#c88a3a', '#a86e2a', '#7a4e1e'], ['#8a6ab8', '#6e529a', '#4e3a72']];
  const PAREDES = ['#f0e0c0', '#e8d0a8', '#f4ead8', '#d8c8b0'];
  function casa(tx, tyBase, w, opcs = {}) {
    const roofH = (opcs.alto ? 4.5 : 3.5) * T, wallH = (opcs.alto ? 2.6 : 2) * T, ov = 4;
    const cv = canvas(w * T + ov * 2, roofH + wallH), c = cv.getContext('2d');
    const tel = opcs.telhado || TELHADOS[Math.floor(r() * TELHADOS.length)], par = opcs.parede || PAREDES[Math.floor(r() * PAREDES.length)];
    const cw = cv.width;
    // parede
    R(c, ov, roofH, w * T, wallH, par);
    R(c, ov, roofH, w * T, 3, '#00000040');
    for (let px = ov; px < ov + w * T; px += 16) R(c, px, roofH + 3, 2, wallH - 3, '#9a7a58');      // vigas de madeira
    R(c, ov, roofH + wallH - 5, w * T, 5, '#8a8a8a'); R(c, ov, roofH + wallH - 5, w * T, 1, '#a8a8a8');   // base de pedra
    // porta
    const pw = opcs.portaLarga ? 18 : 12, px0 = Math.round(cw / 2 - pw / 2 + (opcs.portaDx ?? 0) * T), ph = Math.min(wallH - 6, 24);
    R(c, px0 - 2, roofH + wallH - 5 - ph - 2, pw + 4, ph + 2, '#5a3a22');
    R(c, px0, roofH + wallH - 5 - ph, pw, ph, opcs.portaVidro ? '#8ab8d8' : '#8a5a32');
    if (!opcs.portaVidro) { R(c, px0 + 2, roofH + wallH - 5 - ph + 2, pw - 4, 1, '#a87040'); R(c, px0 + pw - 4, roofH + wallH - 5 - ph / 2, 2, 2, '#f0d060'); }
    else R(c, px0 + pw / 2, roofH + wallH - 5 - ph, 1, ph, '#3a4a5a');
    // janelas
    for (const lado of [-1, 1]) {
      const jx = Math.round(cw / 2 + lado * (w * T / 4 + 4) - 6), jy = roofH + 8;
      if (jx < ov + 2 || jx + 12 > ov + w * T - 2) continue;
      R(c, jx - 1, jy - 1, 14, 12, '#5a3a22'); R(c, jx, jy, 12, 10, opcs.vitrine ? '#ffe8a0' : '#9ad0f0'); R(c, jx, jy, 12, 3, '#c8e8ff');
      R(c, jx + 5, jy, 2, 10, '#5a3a22');
      if (!opcs.vitrine) { R(c, jx - 4, jy - 1, 3, 12, tel[1]); R(c, jx + 13, jy - 1, 3, 12, tel[1]); }
      else for (let k = 0; k < 3; k++) R(c, jx + 1 + k * 4, jy + 6, 3, 3, '#c8803a');   // pães na vitrine
    }
    // toldo listrado
    if (opcs.toldo) for (let px = ov + 2; px < ov + w * T - 2; px += 6) R(c, px, roofH + 4, 6, 5, (px / 6) % 2 < 1 ? opcs.toldo : '#f4f0e8');
    // telhado (de cima): faixas de telha, cumeeira no alto, beiral escuro
    R(c, 0, 0, cw, roofH, tel[1]);
    for (let py = 0; py < roofH; py += 5) { R(c, 0, py, cw, 1, tel[2]); for (let qx = (py / 5) % 2 * 4; qx < cw; qx += 8) R(c, qx, py + 1, 1, 4, tel[2]); }
    R(c, 0, 0, cw, Math.round(roofH * 0.32), tel[0]);
    for (let py = 0; py < roofH * 0.32; py += 5) R(c, 0, py, cw, 1, tel[1]);
    R(c, 0, Math.round(roofH * 0.32), cw, 2, tel[2]);                                             // cumeeira
    R(c, 0, roofH - 3, cw, 3, tel[2]); R(c, 0, roofH, cw, 2, '#00000055');                        // beiral + sombra
    if (opcs.chamine !== false) { const chx = Math.round(cw * (r() < 0.5 ? 0.22 : 0.7)); R(c, chx, 2, 9, 12, '#8a5a44'); R(c, chx, 2, 9, 2, '#5a3a2a'); R(c, chx + 1, 4, 7, 1, '#a87058'); }
    // letreiro
    if (opcs.nome) {
      const lw = larguraTexto(opcs.nome) + 8, lx = Math.round(cw / 2 - lw / 2), ly = roofH - 12;
      R(c, lx - 1, ly - 1, lw + 2, 13, '#3a2416'); R(c, lx, ly, lw, 11, opcs.placa || '#6a3a1e');
      desenharTexto(c, opcs.nome, lx + 4, ly + 1, '#fff0c0');
    }
    const x0 = tx * T - ov, yBase = tyBase * T;
    peca(cv, x0, yBase - cv.height, yBase);
    // sombra no chão à direita e embaixo
    R(g, x0 + cv.width, yBase - cv.height + 8, 6, cv.height - 8, '#00000030'); R(g, x0 + 6, yBase, cv.width, 4, '#00000030');
    return { porta: { x: (x0 + px0 + pw / 2) / T, z: (H - yBase) / T } };
  }
  const caminho = (x, zDe, zAte) => { const ty0 = H / T - Math.max(zDe, zAte), ty1 = H / T - Math.min(zDe, zAte); terra(x - 0.75, ty0, 1.5, ty1 - ty0); };
  // fileira de cima (porta virada para a estrada)
  const casasCima = [
    casa(3, 15.6, 6, { nome: 'PADARIA', toldo: '#d84a4a', vitrine: true, telhado: TELHADOS[0], placa: '#6a3a1e' }),
    casa(11, 15.6, 5, {}), casa(37, 15.6, 6, { nome: 'MERCADO', toldo: '#2e8a4a', telhado: TELHADOS[2], placa: '#2e6a3a', portaLarga: true }),
    casa(45, 15.6, 5, {}),
  ];
  casasCima.push(casa(17.2, 13.2, 2.4, { chamine: false, telhado: TELHADOS[4] }));   // casinha pequena (depósito)
  // escola grande atrás da praça (no alto, perto do rio)
  const escola = casa(30.5, 9.8, 10, { nome: 'ESCOLA', telhado: TELHADOS[1], parede: '#f0e4c8', placa: '#2a5aa8', alto: true, portaVidro: true, portaLarga: true, chamine: false });
  // fileira de baixo
  const casasBaixo = [casa(14, 30.6, 5, {}), casa(37, 30.6, 6, { nome: 'POUSADA', telhado: TELHADOS[3], placa: '#7a4e1e' }), casa(46, 30.6, 5, {})];
  // caminhos das portas até a estrada / praça
  for (const k of casasCima) caminho(k.porta.x, k.porta.z, MAPA.h - 18);      // até a borda de cima da estrada
  caminho(escola.porta.x, escola.porta.z, MAPA.h - 13);
  caminho(escola.porta.x, MAPA.h - 12.9, MAPA.h - 13.1);                       // até a praça
  for (const k of casasBaixo) caminho(k.porta.x, k.porta.z, MAPA.h - 21);     // até a borda de baixo da estrada

  // ---------- árvores (copa redonda vista de cima e de frente + tronco)
  const arvore = (x, yBase, tam = 1) => {
    const rr = Math.round(15 * tam), cv = canvas(rr * 2 + 4, rr * 2 + 10), c = cv.getContext('2d'), cx = cv.width / 2;
    R(g, x * T - rr * 0.8, yBase * T - 3, rr * 1.6, 5, '#00000035');                                  // sombra no chão
    R(c, cx - 3, rr * 2 - 2, 6, 12, '#7a4e2a'); R(c, cx - 3, rr * 2 - 2, 2, 12, '#9a6a3a');
    const bola = (bx, by, br, cor) => { for (let y = -br; y <= br; y++) for (let xx = -br; xx <= br; xx++) if (xx * xx + y * y <= br * br) R(c, cx + bx + xx, rr + 2 + by + y, 1, 1, cor); };
    bola(0, 0, rr, '#2e6a30'); bola(-rr * 0.35, -rr * 0.3, rr * 0.6, '#3e8a3a'); bola(rr * 0.3, -rr * 0.15, rr * 0.55, '#4a9a40'); bola(-rr * 0.2, -rr * 0.55, rr * 0.3, '#6ab84a');
    for (let k = 0; k < 14; k++) { const a = r() * 6.28, d = r() * rr * 0.8; R(c, cx + Math.cos(a) * d, rr + 2 + Math.sin(a) * d, 2, 2, '#245a28'); }
    if (r() < 0.3) for (let k = 0; k < 4; k++) R(c, cx + (r() - 0.5) * rr * 1.4, rr + 2 + (r() - 0.5) * rr * 1.2, 3, 3, '#e83a3a');   // maçãs
    peca(cv, x * T - cx, yBase * T - cv.height, yBase * T);
  };
  const livre = (x, y) => !(y > 17 && y < 22) && !(x > 25 && x < 30) && !(x > 19 && x < 36 && y > 9 && y < 27) && !(y < 5.5) &&
    !(y > 10 && y < 17 && ((x > 2 && x < 17) || (x > 36 && x < 51))) && !(y > 26 && y < 32 && ((x > 2 && x < 20) || (x > 36 && x < 52))) &&
    !(x > 1.5 && x < 13.5 && y > 25.5 && y < 35) && !(x > 29 && x < 42 && y > 2 && y < 11);   // horta e escola livres
  for (let k = 0; k < 70; k++) { const x = 1 + r() * (MAPA.w - 2), y = 6 + r() * (MAPA.h - 6); if (livre(x, y)) arvore(x, y, 0.8 + r() * 0.5); }
  for (let x = 14; x < MAPA.w; x += 2.6) arvore(x + r(), MAPA.h - 0.3, 1.1);   // mata na beira de baixo (a horta fica livre)   // mata na beira de baixo

  // ---------- fonte no meio da praça
  {
    const cv = canvas(64, 50), c = cv.getContext('2d');
    const anel = (rx, ry, cor) => { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) R(c, 32 + x, 32 + y, 1, 1, cor); };
    anel(30, 16, '#8a8a94'); anel(28, 14, '#c4c4cc'); anel(24, 11, '#4a86d0'); anel(18, 7, '#5a9ae0');
    for (let k = 0; k < 10; k++) R(c, 12 + r() * 40, 26 + r() * 12, 3, 1, '#bfe4ff');
    R(c, 29, 10, 6, 22, '#b8b8c2'); R(c, 29, 10, 2, 22, '#d8d8e0'); R(c, 24, 8, 16, 4, '#a8a8b0');
    R(c, 31, 0, 2, 9, '#9ad8ff'); R(c, 27, 2, 2, 7, '#bfe4ff'); R(c, 35, 2, 2, 7, '#bfe4ff');
    peca(cv, 27.5 * T - 32, 19.5 * T - 32, 19.5 * T + 16);
  }
  // ---------- postes em volta da praça e na estrada
  const poste = (x, y) => {
    const cv = canvas(10, 34), c = cv.getContext('2d');
    R(c, 4, 6, 2, 28, '#3a3a4a'); R(c, 1, 0, 8, 7, '#2a2a36'); R(c, 2, 2, 6, 4, '#ffe8a0'); R(c, 3, 32, 4, 2, '#2a2a36');
    peca(cv, x * T - 5, y * T - 34, y * T);
  };
  for (const [x, y] of [[20.5, 13.6], [34.5, 13.6], [20.5, 25.8], [34.5, 25.8], [9, 18.2], [46, 18.2], [9, 21.2], [46, 21.2]]) poste(x, y);
  // ---------- cerca da horta e placa
  const cercaH = (x0, x1, y) => {
    const cv = canvas((x1 - x0) * T, 12), c = cv.getContext('2d');
    R(c, 0, 3, cv.width, 2, '#a87a4a'); R(c, 0, 7, cv.width, 2, '#a87a4a');
    for (let px = 0; px < cv.width; px += 8) { R(c, px, 0, 3, 12, '#8a5a32'); R(c, px, 0, 1, 12, '#b08050'); }
    peca(cv, x0 * T, y * T - 12, y * T);
  };
  cercaH(2.5, 12.5, 26.8); cercaH(2.5, 12.5, 33.6);
  {
    const cv = canvas(30, 26), c = cv.getContext('2d');
    R(c, 13, 12, 4, 14, '#7a4e2a'); R(c, 0, 0, 30, 13, '#5a3a22'); R(c, 1, 1, 28, 11, '#c8a06a');
    desenharTexto(c, 'VILA', 3, 2, '#3a2416');
    peca(cv, 24 * T - 15, 17.6 * T - 26, 17.6 * T);
  }

  return { W, H, chao, pecas, T };
}
