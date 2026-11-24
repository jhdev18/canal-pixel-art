// PROTÓTIPO (só para teste, pedido do usuário): MAPA DE RPG — uma vila inteira vista de cima, tudo ligado.
// v2: NO MESMO ESTILO DO DIORAMA (pedido do usuário: "o estilo mudou"): as mesmas texturas do chão do diorama (grama com
// pontilhado, trilha de terra da floresta, pedras bege da praça), os MESMOS sprites (arvore-iso, poste-iso, fonte-iso), as cores
// dos prédios da rua (padaria, mercado, escola, casas), letreiros com a mesma fonte/placa, contorno escuro e luz com pontilhado.
// Coordenadas: x para a direita, z para CIMA no mapa (1 unidade = 1 tile de 16 px). O chão é uma imagem só; casas,
// árvores, fonte e postes são "peças" separadas, ordenadas pela linha da base (quem está mais embaixo fica na frente).
import { desenharTexto, larguraTexto } from '../fonte.js';
import { obterSprite } from '../sprites.js';
import { hexParaRgb } from '../pixel.js';

export const T = 16;                  // px por tile
export const MAPA = { w: 56, h: 36 }; // tiles
const K = '#2a1e24';                  // contorno (o mesmo tom escuro dos sprites)

function rng(s) { return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const hash = (a, b) => (((Math.floor(a) * 92821) ^ (Math.floor(b) * 68917)) >>> 0);

// contorno de 1 px em volta do que foi desenhado (igual ao Pix.contorno dos sprites)
function contorno(cv, cor = K) {
  const c = cv.getContext('2d'), d = c.getImageData(0, 0, cv.width, cv.height), a = d.data, w = cv.width, h = cv.height;
  const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 0;
  const [r, g, b] = hexParaRgb(cor), marcar = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!op(x, y) && (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1))) marcar.push((y * w + x) * 4);
  for (const k of marcar) { a[k] = r; a[k + 1] = g; a[k + 2] = b; a[k + 3] = 255; }
  c.putImageData(d, 0, 0);
  return cv;
}

export function gerarMapaRPG(opc = {}) {
  const r = rng(opc.semente ?? 11);
  const W = MAPA.w * T, H = MAPA.h * T;
  const chao = canvas(W, H), g = chao.getContext('2d');
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const pecas = [];   // { cv, x0, y0 (px do canto de cima), zBase }
  const peca = (cv, x0, y0, yBase) => pecas.push({ cv, x0: Math.round(x0), y0: Math.round(y0), zBase: (H - yBase) / T });

  // ---------- tipo de chão numa grade fina (1/4 de tile): 0 grama, 1 terra, 2 pedra, 3 água, 4 ponte, 5 horta
  const GW = MAPA.w * 4, GH = MAPA.h * 4, tipoChao = new Uint8Array(GW * GH);
  const G = (u, v) => { const a = Math.floor(u * 4), b = Math.floor(v * 4); return a < 0 || b < 0 || a >= GW || b >= GH ? 0 : tipoChao[b * GW + a]; };
  const marca = (u0, v0, w, h, t) => { for (let v = Math.floor(v0 * 4); v < Math.ceil((v0 + h) * 4); v++) for (let u = Math.floor(u0 * 4); u < Math.ceil((u0 + w) * 4); u++) if (u >= 0 && v >= 0 && u < GW && v < GH) tipoChao[v * GW + u] = t; };
  marca(0, 1, MAPA.w, 3, 3);                    // rio
  marca(25, 0.5, 5, 4, 4);                      // ponte
  marca(0, 18, MAPA.w, 3, 1);                   // estrada principal
  marca(26, 4.5, 3, 27.5, 1);                   // estrada que sobe até a ponte e desce até o fim do mapa
  marca(20, 13, 15, 13, 2);                     // praça de pedras
  marca(3, 27, 9, 6.4, 5);                      // horta
  const caminho = (u, v0, v1) => marca(u - 0.75, Math.min(v0, v1), 1.5, Math.abs(v1 - v0), 1);

  // ---------- casas — cores dos prédios da rua do diorama (casas, padaria, mercado, escola, pousada)
  const TELHA = [['#d86a4a', '#b8543a', '#8a3a28'], ['#6a6e84', '#565a6e', '#3e4254'], ['#b87a3a', '#9a622c', '#6a4220'], ['#5a8ac8', '#4670a8', '#32507a'], ['#7a9a4a', '#62803a', '#46602a']];
  const PAREDE = [['#f8d8a0', '#e8c488', '#b8945a'], ['#b8d8f0', '#a0c4e0', '#7898b8'], ['#d8f0c0', '#c0dca8', '#90b078'], ['#f0e0c0', '#e0ccaa', '#b09a78']];
  const casas = [];
  function casa(tx, tyBase, w, o = {}) {
    const roofH = Math.round((o.alto ? 4.4 : 3.4) * T), wallH = Math.round((o.alto ? 2.8 : 2.2) * T), ov = 3;
    const cv = canvas(w * T + ov * 2, roofH + wallH), c = cv.getContext('2d'), cw = cv.width;
    const tel = o.telha || TELHA[Math.floor(r() * 3)], pal = o.pal || PAREDE[Math.floor(r() * 4)];
    const [par, parS, parE] = pal;
    // parede (com o pontilhado de sombra embaixo do beiral, como as fachadas do diorama)
    for (let y = 0; y < wallH; y++) for (let x = ov; x < ov + w * T; x++) {
      const sombra = y < 3 || (y < 7 && bayer(x, y) < (7 - y) / 6);
      R(c, x, roofH + y, 1, 1, sombra ? parE : (x - ov < 2 || x > ov + w * T - 3) ? parS : par);
    }
    if (o.base) for (let y = wallH - 9; y < wallH; y++) for (let x = ov; x < ov + w * T; x++)
      R(c, x, roofH + y, 1, 1, (y % 4 === 0 || (x + (Math.floor(y / 4) % 2) * 4) % 8 === 0) ? '#6a3a2e' : o.base);   // tijolinho na base
    else R(c, ov, roofH + wallH - 3, w * T, 3, parE);
    // porta (madeira ou vidro, como no diorama)
    const pw = o.portaLarga ? 20 : 12, ph = Math.min(wallH - 6, o.alto ? 30 : 24), px0 = Math.round(cw / 2 - pw / 2), py0 = roofH + wallH - ph;
    R(c, px0 - 1, py0 - 1, pw + 2, ph + 1, '#2a2638');
    for (let y = 0; y < ph; y++) R(c, px0, py0 + y, pw, 1, o.portaVidro ? (y > ph * 0.55 ? '#a8c8e0' : '#6a8aa8') : (y % 6 === 0 ? '#7a4a26' : '#9a6232'));
    if (o.portaVidro) R(c, px0 + pw / 2, py0, 1, ph, '#2a2638'); else { R(c, px0 + pw - 4, py0 + ph / 2, 2, 2, '#f0d060'); R(c, px0 + 2, py0 + 3, pw - 4, 1, '#b07a40'); }
    // janelas / vitrines
    const vitrine = o.vitrine;
    for (const lado of [-1, 1]) {
      const jw = vitrine ? Math.min(28, Math.floor(w * T / 2 - pw / 2 - 10)) : 12, jh = vitrine ? 14 : 11;
      const jx = Math.round(lado < 0 ? px0 - 8 - jw : px0 + pw + 8), jy = roofH + (vitrine ? 10 : 9);
      if (jx < ov + 3 || jx + jw > ov + w * T - 3) continue;
      R(c, jx - 1, jy - 1, jw + 2, jh + 2, '#2a2638');
      for (let y = 0; y < jh; y++) for (let x = 0; x < jw; x++) R(c, jx + x, jy + y, 1, 1, vitrine === 'paes' ? (y > 9 ? '#fff2d0' : '#ffd890') : vitrine === 'frutas' ? '#e0f0d8' : ((x + y) < 6 ? '#e0f0f8' : y > jh * 0.6 ? '#a8c8e0' : '#6a8aa8'));
      if (vitrine === 'paes') for (let k = 2; k < jw - 4; k += 6) { R(c, jx + k, jy + 5, 4, 3, '#d08a40'); R(c, jx + k + 1, jy + 5, 2, 1, '#e8b060'); }
      if (vitrine === 'frutas') for (let k = 2; k < jw - 3; k += 4) R(c, jx + k, jy + 8, 3, 3, ['#e83a3a', '#f8c030', '#3aa838'][(k / 4) % 3 | 0]);
      if (!vitrine) R(c, jx + jw / 2, jy, 1, jh, '#2a2638');
    }
    // toldo listrado (cores dos toldos do diorama)
    if (o.toldo) for (let x = ov; x < ov + w * T; x++) for (let y = 0; y < 7; y++) R(c, x, roofH + 2 + y, 1, 1, y === 6 ? '#3a2a2a' : (Math.floor((x - ov) / 6) % 2 ? o.toldo[1] : o.toldo[0]));
    // telhado visto de cima: telhas em fileiras, cumeeira, transição de luz com pontilhado
    for (let y = 0; y < roofH; y++) for (let x = 0; x < cw; x++) {
      const t = y / roofH;
      let col = t < 0.3 ? (bayer(x, y) < (0.3 - t) * 4 ? tel[0] : tel[1]) : (bayer(x, y) < (t - 0.3) * 1.4 ? tel[2] : tel[1]);
      if (y % 5 === 4 || ((x + (Math.floor(y / 5) % 2) * 4) % 8 === 0 && y % 5 > 0)) col = col === tel[0] ? tel[1] : tel[2];
      if (Math.abs(t - 0.3) < 0.025 || y >= roofH - 3) col = tel[2];
      R(c, x, y, 1, 1, col);
    }
    if (o.chamine !== false) { const chx = Math.round(cw * (r() < 0.5 ? 0.2 : 0.72)); R(c, chx, 3, 9, 13, '#8a5a44'); R(c, chx, 3, 9, 2, '#5a3a2a'); R(c, chx + 1, 6, 1, 9, '#a87058'); }
    // letreiro (mesmo estilo da fachada do diorama: placa com borda escura e letra clara)
    if (o.nome) {
      const lw = larguraTexto(o.nome) + 8, lx = Math.round(cw / 2 - lw / 2), ly = roofH - 14;
      R(c, lx - 1, ly - 1, lw + 2, 14, '#2a2638'); R(c, lx, ly, lw, 12, o.placa[0]);
      desenharTexto(c, o.nome, lx + 4, ly + 1, o.placa[1]);
    }
    contorno(cv);
    const x0 = tx * T - ov, yBase = tyBase * T;
    peca(cv, x0, yBase - cv.height, yBase);
    casas.push({ x0, y0: yBase - cv.height, w: cv.width, h: cv.height, yBase });
    return { porta: { u: (x0 + px0 + pw / 2) / T, v: tyBase } };
  }
  const portasCima = [
    casa(3, 15.6, 6, { nome: 'PADARIA', pal: ['#f0e0c0', '#e0ccaa', '#b09a78'], placa: ['#6a3a1e', '#ffe8a0'], toldo: ['#f4f0e8', '#c83c4c'], vitrine: 'paes', base: '#8a5a3a', telha: TELHA[0] }),
    casa(11, 15.6, 5, {}), casa(17.2, 13.4, 2.4, { chamine: false, telha: TELHA[1] }),
    casa(37, 15.6, 6, { nome: 'MERCADO', pal: ['#e8f0e0', '#d4e0c8', '#a8b89c'], placa: ['#2e8a4a', '#ffffff'], toldo: ['#f0f0e0', '#2e8a4a'], vitrine: 'frutas', portaLarga: true, telha: TELHA[4] }),
    casa(45, 15.6, 5, {}),
  ];
  const escola = casa(30.5, 9.8, 10, { nome: 'ESCOLA', pal: ['#e8d8b0', '#d8c498', '#a8946c'], placa: ['#2a5aa8', '#ffffff'], base: '#a85a44', alto: true, portaVidro: true, portaLarga: true, chamine: false, telha: TELHA[3] });
  const portasBaixo = [casa(14, 30.6, 5, {}), casa(37, 30.6, 6, { nome: 'POUSADA', pal: ['#e8d8b8', '#d4c098', '#a88e68'], placa: ['#6a3a1e', '#f0d890'], telha: TELHA[2] }), casa(46, 30.6, 5, {})];
  for (const k of portasCima) caminho(k.porta.u, k.porta.v, 18);
  caminho(escola.porta.u, escola.porta.v, 13);
  for (const k of portasBaixo) caminho(k.porta.u, k.porta.v, 21);

  // ---------- pinta o chão (texturas do diorama)
  const pedra = (u, v) => {          // pedras bege em fileiras desencontradas (as da praça do diorama)
    const fi = v * 2.4, k = Math.floor(fi), fj = u * 2.4 + (k % 2) * 0.5, kj = Math.floor(fj);
    const ri = fi - k, rj = fj - kj, h = ((k * 73856093) ^ (kj * 19349663)) >>> 0;
    if (ri < 0.12 || rj < 0.1) return '#9a8a74';
    if (ri > 0.84) return '#e8dcc8';
    return h % 5 === 0 ? '#b8a890' : h % 3 === 0 ? '#e8dcc8' : '#cfc0a8';
  };
  const img = g.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / T, v = y / T, t = G(u, v);
    let c;
    if (t === 1) {   // trilha de terra da floresta do diorama (com a borda de grama mais escura)
      const h = hash(u * 6, v * 6) % 97, borda = [[0, -0.25], [0, 0.25], [-0.25, 0], [0.25, 0]].some(([a, b]) => G(u + a, v + b) === 0);
      c = borda ? '#6a8a3a' : h < 6 ? '#8a6a44' : h < 12 ? '#c8a878' : bayer(x, y) < 0.1 ? '#9a7a50' : '#b08a5a';
    } else if (t === 2) c = pedra(u, v);
    else if (t === 3) { const onda = Math.sin(x * 0.2 + y * 0.55) > 0.88; c = y < T + 2 || y > 4 * T - 3 ? '#2a5a9a' : onda ? '#bfe4ff' : bayer(x, y) < 0.08 ? '#5a9ae0' : '#4a86d0'; }
    else if (t === 4) { const dx = x - 25 * T; c = dx < 2 || dx > 5 * T - 3 ? '#5a3a20' : dx % 5 === 0 ? '#6a4626' : Math.floor(dx / 5) % 2 ? '#a87a4a' : '#9a6e40'; }
    else if (t === 5) { const fila = Math.floor((v - 27) / 1.28), dv = (v - 27) - fila * 1.28; c = dv < 0.62 ? (bayer(x, y) < 0.15 ? '#6a4628' : '#7a5432') : (hash(u * 3, fila) % 5 === 0 ? '#e06a3a' : (Math.floor(u * 2) % 2 ? '#3a8a3a' : '#4e9e44')); }
    else {           // grama do diorama (com pontilhado e florzinhas)
      const vv = hash(u * 9, v * 9) % 13, fl = hash(u * 6 + 3, v * 6 + 7) % 97;
      c = fl === 0 ? '#f8f0f8' : fl === 1 ? '#f8d040' : fl === 2 ? '#f08ab8' : vv === 0 ? '#5aa85a' : vv < 3 ? '#2e6a3a' : bayer(x, y) < 0.08 ? '#4a9a5a' : '#3a7e48';
    }
    const [rr, gg, bb] = hexParaRgb(c), k = (y * W + x) * 4;
    d[k] = rr; d[k + 1] = gg; d[k + 2] = bb; d[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  R(g, 0, 4 * T, W, 2, '#5a4a30'); R(g, 0, T - 2, W, 2, '#5a4a30');                    // barranco do rio
  // sombras das casas no chão (pontilhado, como a sombra de contato do diorama)
  for (const k of casas) for (let y = k.yBase; y < k.yBase + 6; y++) for (let x = k.x0 + 4; x < k.x0 + k.w + 4; x++) if (bayer(x, y) < 0.5 - (y - k.yBase) * 0.08) R(g, x, y, 1, 1, '#1a2a1a');

  // ---------- sprites do diorama: árvores, postes, fonte (iguais aos da rua/praça/floresta)
  const sprite = (nome, est, u, v, sombra = true) => {
    const s = obterSprite(nome); if (!s) return;
    const q = s.quadros[(s.anims[est] || s.anims.parado || Object.values(s.anims)[0]).q[0]];
    const yBase = v * T;
    if (sombra) for (let y = yBase - 2; y < yBase + 3; y++) for (let x = Math.round(u * T - q.width * 0.3); x < u * T + q.width * 0.3; x++) if (bayer(x, y) < 0.4) R(g, x, y, 1, 1, '#1a2a1a');
    peca(q, u * T - q.width / 2, yBase - q.height, yBase);
  };
  // árvores: a copa é grande (o mesmo sprite do diorama), então ficam longe dos caminhos, das casas (inclusive da que fica
  // logo acima, que a copa cobriria) e umas das outras
  const arvores = [];
  const livre = (x, y) => {
    for (let a = -2; a <= 2; a += 0.5) for (let b = -5; b <= 0.8; b += 0.5) if (G(x + a, y + b) !== 0 && !(b < -4 && G(x + a, y + b) === 3)) return false;
    if (casas.some((k) => x * T > k.x0 - 40 && x * T < k.x0 + k.w + 40 && y * T > k.y0 - 10 && y * T < k.yBase + 5 * T)) return false;
    return arvores.every(([ax, ay]) => Math.hypot(ax - x, (ay - y) * 1.4) > 4.2);
  };
  for (let k = 0; k < 400 && arvores.length < 26; k++) { const x = 1.5 + r() * (MAPA.w - 3), y = 6.5 + r() * (MAPA.h - 6.8); if (livre(x, y)) { arvores.push([x, y]); sprite(r() < 0.5 ? 'arvore-iso-grande' : 'arvore-iso', 'verde', x, y); } }
  sprite('fonte-iso', 'cheia', 27.5, 20.8);
  for (const [x, y] of [[20.6, 13.4], [34.4, 13.4], [20.6, 26], [34.4, 26], [9, 18], [46, 18], [9, 21.4], [46, 21.4]]) sprite('poste-iso', 'parado', x, y);
  // cerca da horta e placa (madeira com contorno)
  const cercaH = (x0, x1, y) => {
    const cv = canvas((x1 - x0) * T, 12), c = cv.getContext('2d');
    R(c, 0, 3, cv.width, 2, '#a87a4a'); R(c, 0, 7, cv.width, 2, '#8a5a32');
    for (let px = 0; px < cv.width; px += 8) { R(c, px, 0, 3, 12, '#8a5a32'); R(c, px, 0, 1, 12, '#b08050'); }
    peca(contorno(cv), x0 * T, y * T - 12, y * T);
  };
  cercaH(2.5, 12.5, 26.8); cercaH(2.5, 12.5, 33.8);
  {
    const cv = canvas(32, 26), c = cv.getContext('2d');
    R(c, 14, 12, 4, 14, '#7a4e2a'); R(c, 0, 0, 32, 13, '#5a3a22'); R(c, 1, 1, 30, 11, '#c8a06a');
    desenharTexto(c, 'VILA', 4, 2, '#3a2416');
    peca(contorno(cv), 24 * T - 16, 17.4 * T - 26, 17.4 * T);
  }
  return { W, H, chao, pecas, T };
}
