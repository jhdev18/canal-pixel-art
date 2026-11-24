// PROTÓTIPO (teste, pedido do usuário): MAPA NO ESTILO DIORAMA CLÁSSICO — uma vila inteira em maquete, na mesma diagonal
// 2:1 da rua: estrada principal + estrada que cruza (da ponte do rio até a trilha de baixo), praça de pedras com fonte,
// escola atrás da praça, padaria/mercado/pousada e casas (caixas com telhado de duas águas), horta, caminhos das portas,
// e a "fatia" de terra nas bordas da frente (como uma maquete de verdade). Árvores, postes e fonte são os sprites do
// diorama (elementos do cenário "mapa-vila"). Mesmas texturas de chão do diorama (grama, trilha, pedras da praça).
// Coordenadas dos elementos (iguais às da rua): x cresce para a direita/cima, z cresce para o fundo (esquerda/cima).
// Devolve o mesmo formato do gerarRuaDiagonal (a vista do diorama usa igual) + "pecas" (casas, ordenadas com os personagens).
import { bayer, hexParaRgb } from '../pixel.js';
import { rng } from '../compartilhado/util.js';
import { desenharTexto, larguraTexto } from '../fonte.js';

const CF = 6.25;                       // FAIXA.calcadaFrente (z = CF - i, x = -j)
const iDe = (z) => CF - z, jDe = (x) => -x;

// regiões do mapa (em x, z): [x0, x1, z0, z1]
export const MAPA_VILA = {
  estrada: [-24, 24, 0.8, 3.2], cruzada: [-1.2, 1.2, -12, 17.2], trilhaBaixo: [-24, 24, -11.2, -9.6],
  praca: [-6.5, 6.5, 3.2, 11], rio: [-24, 24, 17.2, 20.2], ponte: [-1.6, 1.6, 16.6, 20.8], horta: [-11, -3.5, -8.6, -3.8],
};

export function gerarMapaDiorama(opc = {}) {
  const r = rng(opc.semente ?? 21);
  const X0 = -24, X1 = 24, Z0 = -12, Z1 = 22;                 // tamanho do mapa
  const I0 = iDe(Z1), I1 = iDe(Z0), J0 = jDe(X1), J1 = jDe(X0), HMAX = 140, FATIA = 22;
  const OX = -(I0 - J1) * 16 + 4, OY = -(I0 + J0) * 8 + HMAX;
  const W = Math.ceil((I1 - J0) * 16 + OX + 8), H = Math.ceil((I1 + J1) * 8 + OY + 8 + FATIA);
  const proj = (i, j, h = 0) => ({ x: (i - j) * 16 + OX, y: (i + j) * 8 + OY - h });
  const N = W * H, saida = new Uint8ClampedArray(N * 4), pi = new Float32Array(N), pj = new Float32Array(N), ph = new Float32Array(N), tipo = new Uint8Array(N);
  const put = (img, w, x, y, hex, f = 1) => { const [rr, gg, bb] = hexParaRgb(hex), k = (y * w + x) * 4; img[k] = Math.min(255, rr * f); img[k + 1] = Math.min(255, gg * f); img[k + 2] = Math.min(255, bb * f); img[k + 3] = 255; };
  const dentro = (x, z, [a, b, c, d]) => x >= a && x <= b && z >= c && z <= d;
  const M = MAPA_VILA;
  const caminhos = [];                                          // caminhos das portas (x, z0, z1)
  const terraEm = (x, z) => dentro(x, z, M.estrada) || dentro(x, z, M.cruzada) || dentro(x, z, M.trilhaBaixo) || caminhos.some(([cx, a, b]) => Math.abs(x - cx) < 0.55 && z >= a && z <= b);

  // ---------- casas (antes do chão, para marcar os caminhos das portas)
  const TELHA = [['#d86a4a', '#b8543a', '#8a3a28'], ['#6a6e84', '#565a6e', '#3e4254'], ['#b87a3a', '#9a622c', '#6a4220'], ['#5a8ac8', '#4670a8', '#32507a'], ['#7a9a4a', '#62803a', '#46602a']];
  const PAREDE = [['#f8d8a0', '#e8c488', '#b8945a'], ['#b8d8f0', '#a0c4e0', '#7898b8'], ['#d8f0c0', '#c0dca8', '#90b078'], ['#f0e0c0', '#e0ccaa', '#b09a78']];
  const casas = [];
  function casa(x0, x1, z0, z1, o = {}) {
    const hw = o.alto ? 56 : o.nome ? 52 : 40, hr = o.alto ? 30 : 24, ov = 0.25;   // lojas com letreiro: parede mais alta (cabe toldo + placa)          // altura da parede e do telhado (px)
    const i0 = iDe(z1), i1 = iDe(z0), j0 = jDe(x1), j1 = jDe(x0), im = (i0 + i1) / 2, hd = (i1 - i0) / 2 + ov;
    const tel = o.telha || TELHA[Math.floor(r() * 3)], [par, parS, parE] = o.pal || PAREDE[Math.floor(r() * 4)];
    // caixa do desenho (px)
    const cs = [[i0 - ov, j0 - ov, 0], [i1 + ov, j1 + ov, 0], [i0 - ov, j1 + ov, 0], [i1 + ov, j0 - ov, 0], [i0, j0, hw + hr], [i1, j1, hw + hr]].map(([a, b, h]) => proj(a, b, h));
    const bx0 = Math.floor(Math.min(...cs.map((p) => p.x))) - 2, bx1 = Math.ceil(Math.max(...cs.map((p) => p.x))) + 2;
    const by0 = Math.floor(Math.min(...cs.map((p) => p.y))) - hr - 4, by1 = Math.ceil(Math.max(...cs.map((p) => p.y))) + 2;
    const cw = bx1 - bx0, ch = by1 - by0, img = new Uint8ClampedArray(cw * ch * 4), prof = new Float32Array(cw * ch).fill(-1e9);
    const ponto = (i, j, h, hex, f = 1) => {
      const p = proj(i, j, h), x = Math.round(p.x) - bx0, y = Math.round(p.y) - by0;
      if (x < 0 || y < 0 || x >= cw || y >= ch) return;
      const d = i + j + h * 1e-4;
      if (d < prof[y * cw + x]) return;
      prof[y * cw + x] = d; put(img, cw, x, y, hex, f);
    };
    const S = 1 / 32, larg = (j1 - j0) * 16, meio = larg / 2;
    const pw = o.portaLarga ? 18 : 11, ph = o.alto ? 30 : 24;
    const masc = o.nome ? (() => { const c = document.createElement('canvas'), w = larguraTexto(o.nome) + 2; c.width = w; c.height = 10; const g = c.getContext('2d'); desenharTexto(g, o.nome, 1, 0, '#fff'); const dd = g.getImageData(0, 0, w, 10).data; return { w, tem: (x, y) => x >= 0 && y >= 0 && x < w && y < 10 && dd[(y * w + x) * 4 + 3] > 0 }; })() : null;
    // fachada da frente (i = i1, de frente para a câmera, com a porta, janelas, toldo e letreiro). u cresce para a direita na tela.
    for (let j = j0; j <= j1 + 1e-6; j += S) for (let t = 0; t <= hw; t += 0.5) {
      const u = (j1 - j) * 16, tt = Math.floor(t);
      let c = (u < 2 || u > larg - 2) ? parS : (tt > hw - 5 && bayer(Math.floor(u), tt) < (tt - hw + 6) / 6) ? parE : par;
      if (o.base && tt < 9) c = (tt % 4 === 0 || (Math.floor(u) + (Math.floor(tt / 4) % 2) * 4) % 8 === 0) ? '#6a3a2e' : o.base;
      else if (tt < 3) c = parE;
      const portaX = meio + (o.portaDx ?? 0) - pw / 2;
      if (u >= portaX - 1 && u <= portaX + pw + 1 && tt <= ph + 1) c = (u < portaX || u > portaX + pw || tt > ph) ? '#2a2638' : o.portaVidro ? (Math.abs(u - portaX - pw / 2) < 0.6 ? '#2a2638' : tt > ph * 0.5 ? '#6a8aa8' : '#a8c8e0') : (tt % 6 === 0 ? '#7a4a26' : (Math.abs(u - portaX - pw + 3) < 1 && Math.abs(tt - ph / 2) < 1 ? '#f0d060' : '#9a6232'));
      for (const lado of [-1, 1]) {   // janelas / vitrines
        const jw = o.vitrine ? Math.min(26, meio - pw / 2 - 8) : 11, jx = lado < 0 ? portaX - 6 - jw : portaX + pw + 6, jy0 = o.vitrine ? 8 : 12, jy1 = jy0 + (o.vitrine ? 16 : 12);
        if (jx < 3 || jx + jw > larg - 3) continue;
        if (u >= jx - 1 && u <= jx + jw + 1 && tt >= jy0 - 1 && tt <= jy1 + 1) {
          const borda = u < jx || u > jx + jw || tt < jy0 || tt > jy1;
          c = borda ? '#2a2638' : o.vitrine === 'paes' ? (tt < jy0 + 5 ? '#fff2d0' : (Math.floor(u) % 6 < 4 && tt < jy0 + 9 && tt > jy0 + 5 ? '#d08a40' : '#ffd890'))
            : o.vitrine === 'frutas' ? (tt < jy0 + 6 && Math.floor(u) % 4 < 3 ? ['#e83a3a', '#f8c030', '#3aa838'][Math.floor(u / 4) % 3] : '#e0f0d8')
            : (Math.abs(u - jx - jw / 2) < 0.6 ? '#2a2638' : tt > jy1 - 4 ? '#e0f0f8' : tt > (jy0 + jy1) / 2 ? '#a8c8e0' : '#6a8aa8');
        }
      }
      if (o.toldo && tt >= ph + 4 && tt <= ph + 10) c = tt === ph + 4 ? '#3a2a2a' : Math.floor(u / 6) % 2 ? o.toldo[1] : o.toldo[0];
      if (masc) {   // letreiro
        const lw = masc.w + 6, lx = meio - lw / 2, ly = ph + (o.toldo ? 12 : 5), lh = 12;
        if (u >= lx && u < lx + lw && tt >= ly && tt < ly + lh) { const b = u < lx + 1 || u >= lx + lw - 1 || tt < ly + 1 || tt >= ly + lh - 1; c = b ? '#2a2638' : masc.tem(Math.floor(u - lx - 2), Math.floor(ly + lh - 2 - tt)) ? o.placa[1] : o.placa[0]; }
      }
      ponto(i1, j, t, c, 1);
    }
    // parede do lado (j = j1, na sombra) com uma janela
    for (let i = i0; i <= i1 + 1e-6; i += S) for (let t = 0; t <= hw; t += 0.5) {
      const u = (i - i0) * 16, tt = Math.floor(t), lw = (i1 - i0) * 16;
      let c = (tt > hw - 5 && bayer(Math.floor(u), tt) < (tt - hw + 6) / 6) ? parE : tt < 3 ? parE : (u < 2 || u > lw - 2) ? parS : par;
      if (o.base && tt < 9) c = (tt % 4 === 0 || (Math.floor(u) + (Math.floor(tt / 4) % 2) * 4) % 8 === 0) ? '#6a3a2e' : o.base;
      if (Math.abs(u - lw / 2) < 6.5 && tt >= 13 && tt <= 25) c = Math.abs(u - lw / 2) > 5.5 || tt < 14 || tt > 24 ? '#2a2638' : tt > 21 ? '#e0f0f8' : '#6a8aa8';
      ponto(i, j1, t, c, 0.75);
    }
    // oitão (o triângulo da parede embaixo do telhado, no lado)
    for (let i = i0; i <= i1 + 1e-6; i += S) { const top = hw + hr * (1 - Math.abs(i - im) / hd); for (let t = hw; t <= top; t += 0.5) ponto(i, j1, t, parS, 0.75); }
    // telhado de duas águas (cumeeira ao longo de x): água da frente na luz, a de trás na sombra; telhas em fileiras
    for (let i = i0 - ov; i <= i1 + ov + 1e-6; i += S) for (let j = j0 - ov; j <= j1 + ov + 1e-6; j += S) {
      const dist = Math.abs(i - im) / hd, h = hw + hr * (1 - dist), frente = i >= im;
      const fila = Math.floor(dist * hd * 16 / 4), col = Math.floor((j - j0) * 16 / 4 + (fila % 2) * 0.5);
      let c = frente ? (dist < 0.12 ? tel[0] : tel[1]) : tel[2];
      if (frente && (Math.floor(dist * hd * 16) % 4 === 0 || (Math.floor((j - j0) * 16) + (fila % 2) * 2) % 8 === 0)) c = tel[2];
      if (dist > 0.97) c = '#3a2420';
      if (Math.abs(j - j0 + ov) < S || Math.abs(j - j1 - ov) < S) c = tel[2];
      ponto(i, j, h, c, frente ? 1.05 : 0.85);
      if (col < -99) break;
    }
    if (o.chamine !== false) { const ci = im - 0.35, cj = j0 + (j1 - j0) * 0.7; for (let a = 0; a <= 0.5; a += S) for (let b = 0; b <= 0.5; b += S) for (let t = 0; t <= 10; t += 0.5) { const hh = hw + hr * (1 - Math.abs(ci + a - im) / hd) + t; if (a === 0 || b === 0 || Math.abs(a - 0.5) < S || Math.abs(b - 0.5) < S || t > 9.5) ponto(ci + a, cj + b, hh, t > 9.5 ? '#5a3a2a' : '#8a5a44', Math.abs(b - 0.5) < S ? 0.75 : 1); } }
    // contorno escuro (como os sprites)
    const marcar = [];
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const k = (y * cw + x) * 4; if (img[k + 3]) continue; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => x + a >= 0 && y + b >= 0 && x + a < cw && y + b < ch && img[((y + b) * cw + x + a) * 4 + 3])) marcar.push(k); }
    for (const k of marcar) { img[k] = 42; img[k + 1] = 30; img[k + 2] = 36; img[k + 3] = 255; }
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; cv.getContext('2d').putImageData(new ImageData(img, cw, ch), 0, 0);
    casas.push({ cv, x0: bx0, y0: by0, i: im, j: (j0 + j1) / 2, x0m: x0, x1m: x1, z0m: z0, z1m: z1 });
    const portaXmundo = x0 + (meio + (o.portaDx ?? 0)) / 16;
    return { porta: portaXmundo, z0 };
  }
  // fileira de trás da estrada (porta virada para a estrada) e a escola atrás da praça
  const padaria = { nome: 'PADARIA', pal: ['#f0e0c0', '#e0ccaa', '#b09a78'], placa: ['#6a3a1e', '#ffe8a0'], toldo: ['#f4f0e8', '#c83c4c'], vitrine: 'paes', base: '#8a5a3a', telha: TELHA[0] };
  const mercado = { nome: 'MERCADO', pal: ['#e8f0e0', '#d4e0c8', '#a8b89c'], placa: ['#2e8a4a', '#ffffff'], toldo: ['#f0f0e0', '#2e8a4a'], vitrine: 'frutas', portaLarga: true, telha: TELHA[4] };
  const tras = [casa(-21, -16, 5, 9, {}), casa(-14, -8, 5, 9, padaria), casa(8, 14, 5, 9, mercado), casa(16, 21, 5, 9, {})];
  const escola = casa(2.5, 10.5, 12, 16, { nome: 'ESCOLA', pal: ['#e8d8b0', '#d8c498', '#a8946c'], placa: ['#2a5aa8', '#ffffff'], base: '#a85a44', alto: true, portaVidro: true, portaLarga: true, chamine: false, telha: TELHA[3] });
  const frente = [casa(-21, -16, -8, -4.5, {}), casa(8, 14, -8, -4.4, { nome: 'POUSADA', pal: ['#e8d8b8', '#d4c098', '#a88e68'], placa: ['#6a3a1e', '#f0d890'], telha: TELHA[2] }), casa(16, 21, -8, -4.5, {})];
  for (const k of tras) caminhos.push([k.porta, M.estrada[3], k.z0]);
  caminhos.push([escola.porta, M.praca[3], escola.z0]);
  for (const k of frente) caminhos.push([k.porta, M.trilhaBaixo[3], k.z0]);

  // ---------- chão (texturas do diorama), pixel a pixel
  const pedra = (i, j) => {
    const fi = i * 2.4, k = Math.floor(fi), fj = j * 2.4 + (k % 2) * 0.5, kj = Math.floor(fj);
    const ri = fi - k, rj = fj - kj, h = ((k * 73856093) ^ (kj * 19349663)) >>> 0;
    if (ri < 0.12 || rj < 0.1) return '#9a8a74';
    if (ri > 0.84) return '#e8dcc8';
    return h % 5 === 0 ? '#b8a890' : h % 3 === 0 ? '#e8dcc8' : '#cfc0a8';
  };
  const hash = (a, b) => (((Math.floor(a) * 92821) ^ (Math.floor(b) * 68917)) >>> 0);
  const chaoEm = (x, z, i, j, px, py) => {
    if (dentro(x, z, M.ponte)) { const k = Math.floor((x - M.ponte[0]) * 4); return Math.abs(x - M.ponte[0]) < 0.12 || Math.abs(x - M.ponte[1]) < 0.12 ? '#5a3a20' : k % 2 ? '#a87a4a' : '#9a6e40'; }
    if (dentro(x, z, M.rio)) { const onda = Math.sin(j * 3 + i * 1.7) > 0.9; return z < M.rio[2] + 0.15 || z > M.rio[3] - 0.15 ? '#5a4a30' : onda ? '#bfe4ff' : bayer(px, py) < 0.08 ? '#5a9ae0' : '#4a86d0'; }
    if (dentro(x, z, M.praca) && !terraEm(x, z) || (dentro(x, z, M.praca) && dentro(x, z, M.cruzada))) return pedra(i, j);
    if (terraEm(x, z)) {
      const h = hash(i * 6, j * 6) % 97, borda = !terraEm(x + 0.12, z) || !terraEm(x - 0.12, z) || !terraEm(x, z + 0.12) || !terraEm(x, z - 0.12);
      return borda && !dentro(x, z, M.praca) ? '#6a8a3a' : h < 6 ? '#8a6a44' : h < 12 ? '#c8a878' : bayer(px, py) < 0.1 ? '#9a7a50' : '#b08a5a';
    }
    if (dentro(x, z, M.horta)) { const fila = Math.floor((z - M.horta[2]) / 0.8), dz = (z - M.horta[2]) - fila * 0.8; return dz < 0.4 ? (bayer(px, py) < 0.15 ? '#6a4628' : '#7a5432') : (hash(x * 3, fila) % 5 === 0 ? '#e06a3a' : Math.floor(x * 2) % 2 ? '#3a8a3a' : '#4e9e44'); }
    const vv = hash(i * 9, j * 9) % 13, fl = hash(i * 6 + 3, j * 6 + 7) % 97;
    return fl === 0 ? '#f8f0f8' : fl === 1 ? '#f8d040' : fl === 2 ? '#f08ab8' : vv === 0 ? '#5aa85a' : vv < 3 ? '#2e6a3a' : bayer(px, py) < 0.08 ? '#4a9a5a' : '#3a7e48';
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = (x - OX) / 16, Y = (y - OY) / 8, i = (Y + X) / 2, j = (Y - X) / 2;
    if (i < I0 || i > I1 || j < J0 || j > J1) continue;
    const xm = -j, zm = CF - i, k = y * W + x;
    put(saida, W, x, y, chaoEm(xm, zm, i, j, x, y));
    pi[k] = i; pj[k] = j; ph[k] = 0; tipo[k] = 1;
  }
  // fatia de terra nas duas bordas da frente (maquete): grama na beira, camadas de terra e pedra
  const fatia = (i, j, f) => { for (let t = 1; t <= FATIA; t++) { const p = proj(i, j, -t), x = Math.round(p.x), y = Math.round(p.y); if (x < 0 || y < 0 || x >= W || y >= H) continue; const c = t <= 2 ? '#2e6a3a' : t < 9 ? (bayer(x, y) < 0.2 ? '#6a4628' : '#7a5432') : t < 16 ? (bayer(x, y) < 0.25 ? '#4e3420' : '#5a3c26') : (bayer(x, y) < 0.3 ? '#3a3a44' : '#4a4a56'); put(saida, W, x, y, c, f); tipo[y * W + x] = 1; } };
  for (let j = J0; j <= J1; j += 1 / 32) fatia(I1, j, 1);
  for (let i = I0; i <= I1; i += 1 / 32) fatia(i, J1, 0.78);
  // sombra de cada casa no chão (pontilhado, para a direita/baixo)
  for (const k of casas) { const i1 = iDe(k.z0m), j0 = jDe(k.x1m), j1 = jDe(k.x0m); for (let j = j0; j <= j1; j += 1 / 32) for (let d = 0; d < 0.5; d += 1 / 32) { const p = proj(i1 + 0.05 + d, j), x = Math.round(p.x), y = Math.round(p.y); if (x >= 0 && y >= 0 && x < W && y < H && bayer(x, y) < 0.5 - d) put(saida, W, x, y, '#1a2a1a', 1); } }

  return { W, H, imagem: saida, brilho: new Uint8ClampedArray(N * 4), proj, postes: [], fumacas: [], J0, J1, noite: false, tarde: false, pi, pj, ph, tipo, VIS: null,
    pecas: casas.map((k) => ({ cv: k.cv, x0: k.x0, y0: k.y0, i: k.i, j: k.j })), mapa: true };
}
