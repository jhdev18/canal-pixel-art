// Estabelecimentos para a vista LATERAL (escola, delegacia, padaria, mercado, farmácia) + objetos de rua.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { desenharTexto, larguraTexto } from '../fonte.js';
import { rng } from '../compartilhado/util.js';

const K = '#1a1c2c';

// Converte Pix -> canvas e escreve texto em pixel art por cima. Retorna {cor, brilho} (canvas).
function finalizar(p, brilho, textos = []) {
  const cv = p.paraCanvas(), g = cv.getContext('2d');
  const cb = brilho.paraCanvas(), gb = cb.getContext('2d');
  for (const t of textos) {
    desenharTexto(g, t.texto, t.x, t.y, t.cor);
    if (t.brilha) desenharTexto(gb, t.texto, t.x, t.y, t.cor);
  }
  return { cor: { paraCanvas: () => cv }, brilho: { paraCanvas: () => cb } };
}
const centro = (texto, x0, larg) => Math.round(x0 + (larg - larguraTexto(texto)) / 2);

// paredes com textura
function parede(p, x, y, w, h, cores, tipo, r) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let c = cores[0];
    if (tipo === 'tijolo') c = (j % 4 === 0 || (i + (Math.floor(j / 4) % 2) * 4) % 8 === 0) ? cores[1] : cores[0];
    else if (tipo === 'azulejo') c = (i % 6 === 0 || j % 6 === 0) ? cores[1] : cores[0];
    else if (r() < 0.04) c = cores[1];
    p.set(x + i, y + j, c);
  }
}
function janela(p, br, x, y, w, h, { acesa = false, grade = false, cor = '#2a3a5e' } = {}) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const borda = i === 0 || j === 0 || i === w - 1 || j === h - 1;
    let c = borda ? '#2a2638' : acesa ? (j < h / 2 ? '#fff0b8' : '#ffd468') : (j < 3 && i < w / 2 ? '#6a8ab0' : cor);
    if (grade && !borda && i % 3 === 0) c = '#3a3a4a';
    p.set(x + i, y + j, c);
    if (acesa && !borda && !(grade && i % 3 === 0)) br.set(x + i, y + j, c);
  }
  for (let i = -1; i <= w; i++) p.set(x + i, y + h, '#d8d0c0');   // peitoril
}
function porta(p, x, y, w, h, cor = '#5a3a2a', vidro = false) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const borda = i === 0 || j === 0 || i === w - 1;
    p.set(x + i, y + j, borda ? '#2a2638' : vidro ? (j < h * 0.45 ? '#8ab0d0' : '#5a7aa0') : ((i + j) % 6 ? cor : '#4a2e22'));
  }
  if (!vidro) p.set(x + w - 3, y + Math.floor(h / 2), '#f0c840');
}
function toldo(p, x, y, w, c1, c2) {
  for (let i = 0; i < w; i++) for (let j = 0; j < 6; j++) p.set(x + i, y + j, j === 5 ? '#2a2026' : (Math.floor(i / 6) % 2 ? c1 : c2));
  for (let i = 0; i < w; i += 6) p.set(x + i + 3, y + 6, Math.floor(i / 6) % 2 ? c1 : c2);   // franja recortada
}
function letreiro(p, x, y, w, h, fundo, borda) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.set(x + i, y + j, i === 0 || j === 0 || i === w - 1 || j === h - 1 ? borda : fundo); }
function cornija(p, x, y, w, cor) { for (let i = -2; i < w + 2; i++) { p.set(x + i, y, cor); p.set(x + i, y + 1, cor); p.set(x + i, y + 2, '#2a2638'); } }

function escola() {
  const W = 150, H = 104, p = new Pix(W, H), br = new Pix(W, H), r = rng(11);
  parede(p, 4, 26, 142, 78, ['#e8d8b0', '#d8c498'], 'reboco', r);
  parede(p, 4, 88, 142, 16, ['#a85a44', '#8a4636'], 'tijolo', r);
  // frontão central com relógio
  for (let y = 4; y < 26; y++) { const m = Math.round((y - 4) * 1.6); for (let x = 75 - m; x <= 75 + m; x++) p.set(x, y, y % 5 === 0 ? '#c8b088' : '#e8d8b0'); }
  p.circulo(75, 16, 6, '#f4f0e0'); p.circulo(75, 16, 6, (x, y, dx, dy) => (dx * dx + dy * dy > 0.7 ? '#2a2638' : null));
  p.ret(75, 12, 1, 4, '#2a2638'); p.ret(75, 16, 3, 1, '#2a2638');
  cornija(p, 4, 24, 142, '#c8b088');
  letreiro(p, 48, 30, 54, 11, '#2a5aa8', '#1a3a78');
  for (const x of [10, 30, 110, 130]) { janela(p, br, x, 46, 12, 14); janela(p, br, x, 68, 12, 14); }
  for (const x of [52, 88]) janela(p, br, x, 46, 12, 14);
  porta(p, 62, 74, 13, 30, '#3a6ac8', true); porta(p, 75, 74, 13, 30, '#3a6ac8', true);
  p.ret(58, 70, 34, 3, '#c8b088');
  for (let x = 54; x < 96; x++) p.set(x, 103, '#9a9aa8');             // degrau
  p.contorno(K);
  return finalizar(p, br, [{ texto: 'ESCOLA', x: centro('ESCOLA', 48, 54), y: 29, cor: '#ffffff' }]);
}

function delegacia() {
  const W = 128, H = 92, p = new Pix(W, H), br = new Pix(W, H), r = rng(12);
  parede(p, 2, 14, 124, 78, ['#e8ecf4', '#d0d6e4'], 'reboco', r);
  parede(p, 2, 14, 124, 10, ['#2a3a6a', '#22305a'], 'reboco', r);
  parede(p, 2, 78, 124, 14, ['#3a4a7a', '#2e3c66'], 'azulejo', r);
  cornija(p, 2, 12, 124, '#b8c0d0');
  // sirene no telhado
  p.ret(58, 6, 12, 5, '#2a2a3a'); p.ret(59, 7, 5, 3, '#3a6aff'); p.ret(64, 7, 5, 3, '#ff3a3a');
  for (let i = 59; i < 69; i++) for (let j = 7; j < 10; j++) br.set(i, j, i < 64 ? '#3a6aff' : '#ff3a3a');
  letreiro(p, 30, 28, 68, 12, '#1e2a58', '#0e1630');
  // brasão
  p.circulo(18, 34, 6, '#f0c840'); p.circulo(18, 34, 4, '#2a3a6a'); p.ret(17, 31, 2, 6, '#f0c840'); p.ret(15, 33, 6, 2, '#f0c840');
  p.circulo(110, 34, 6, '#f0c840'); p.circulo(110, 34, 4, '#2a3a6a'); p.ret(109, 31, 2, 6, '#f0c840'); p.ret(107, 33, 6, 2, '#f0c840');
  for (const x of [10, 28, 86, 104]) janela(p, br, x, 50, 14, 16, { grade: true });
  porta(p, 50, 60, 14, 32, '#5a7aa0', true); porta(p, 64, 60, 14, 32, '#5a7aa0', true);
  p.ret(46, 56, 36, 3, '#b8c0d0');
  p.contorno(K);
  return finalizar(p, br, [{ texto: 'POLÍCIA', x: centro('POLÍCIA', 30, 68), y: 28, cor: '#ffffff', brilha: true }]);
}

function padaria() {
  const W = 112, H = 84, p = new Pix(W, H), br = new Pix(W, H), r = rng(13);
  parede(p, 2, 10, 108, 74, ['#f0e0c0', '#e0ccaa'], 'reboco', r);
  parede(p, 2, 70, 108, 14, ['#8a5a3a', '#74482e'], 'tijolo', r);
  cornija(p, 2, 8, 108, '#c8a878');
  letreiro(p, 20, 14, 72, 13, '#6a3a1e', '#3a1e0e');
  // pão no letreiro
  p.elipse(28, 20, 4, 2.5, '#e0a050'); p.set(26, 19, '#a86a30'); p.set(28, 19, '#a86a30'); p.set(30, 19, '#a86a30');
  p.elipse(84, 20, 4, 2.5, '#e0a050'); p.set(82, 19, '#a86a30'); p.set(84, 19, '#a86a30'); p.set(86, 19, '#a86a30');
  for (const x of [10, 88]) janela(p, br, x, 32, 14, 14);
  toldo(p, 4, 50, 104, '#f4f0e8', '#c83c4c');
  // vitrine com pães
  for (let j = 0; j < 20; j++) for (let i = 0; i < 50; i++) {
    const borda = i === 0 || j === 0 || i === 49 || j === 19;
    const c = borda ? '#3a2416' : (j < 10 ? '#fff2d0' : '#ffd890');
    p.set(8 + i, 60 + j, c); if (!borda) br.set(8 + i, 60 + j, c);
  }
  for (const [x, y, w] of [[13, 70, 5], [22, 71, 6], [32, 70, 5], [41, 71, 6], [16, 76, 6], [27, 76, 5], [38, 76, 6], [48, 75, 5]]) {
    p.elipse(8 + x - 6, y - 2, w / 2 + 0.5, 1.8, '#d08a40'); p.set(8 + x - 6, y - 3, '#a86a30');
  }
  porta(p, 72, 58, 16, 26, '#7a4a2a');
  p.ret(66, 62, 1, 1, '#2a2638');
  p.contorno(K);
  return finalizar(p, br, [{ texto: 'PADARIA', x: centro('PADARIA', 20, 72), y: 15, cor: '#ffe8a0', brilha: true }]);
}

function mercado() {
  const W = 160, H = 80, p = new Pix(W, H), br = new Pix(W, H), r = rng(14);
  parede(p, 2, 8, 156, 72, ['#e8f0e0', '#d4e0c8'], 'reboco', r);
  parede(p, 2, 8, 156, 18, ['#2e8a4a', '#26763e'], 'reboco', r);
  cornija(p, 2, 6, 156, '#a8c8a0');
  // cartazes "OFERTA"
  for (const x of [6, 124]) { letreiro(p, x, 34, 30, 12, '#f0d040', '#c8a020'); }
  // portas de vidro automáticas + vitrines
  for (const x of [8, 40, 104, 126]) for (let j = 0; j < 30; j++) for (let i = 0; i < 26; i++) {
    const borda = i === 0 || i === 25 || j === 0;
    const c = borda ? '#3a4a3a' : (j < 12 ? '#c8e8f0' : '#9ac8d8');
    if (j + 50 < 80) { p.set(x + i, 50 + j, c); if (!borda) br.set(x + i, 50 + j, '#d8f0f8'); }
  }
  porta(p, 66, 48, 14, 32, '#5a7aa0', true); porta(p, 80, 48, 14, 32, '#5a7aa0', true);
  // caixotes de frutas na frente
  const frutas = ['#e83a3a', '#f0a030', '#f0e040', '#5ac84a', '#a83ac8'];
  for (let k = 0; k < 5; k++) {
    const x = 6 + k * 13 + (k > 2 ? 70 : 0);
    p.ret(x, 70, 12, 10, '#a0702a'); p.ret(x, 74, 12, 1, '#6a4a1a');
    for (let i = 1; i < 11; i += 2) for (let j = 0; j < 3; j++) p.set(x + i + (j % 2), 67 + j, frutas[k]);
  }
  p.contorno(K);
  return finalizar(p, br, [
    { texto: 'MERCADO', x: centro('MERCADO', 2, 156), y: 12, cor: '#ffffff', brilha: true },
    { texto: 'OFERTA', x: 8, y: 35, cor: '#c83030' }, { texto: 'OFERTA', x: 126, y: 35, cor: '#c83030' },
  ]);
}

function farmacia() {
  const W = 96, H = 80, p = new Pix(W, H), br = new Pix(W, H), r = rng(15);
  parede(p, 2, 8, 92, 72, ['#f4f4f4', '#e0e4e8'], 'azulejo', r);
  cornija(p, 2, 6, 92, '#c8ccd4');
  letreiro(p, 8, 12, 80, 12, '#2a9a5a', '#1a6a3a');
  // cruz verde iluminada (placa lateral)
  for (const [x, y, w, h] of [[42, 28, 12, 4], [46, 24, 4, 12]]) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { p.set(x + i, y + j + 2, '#3ae070'); br.set(x + i, y + j + 2, '#3ae070'); }
  janela(p, br, 8, 46, 26, 30, { acesa: true }); janela(p, br, 62, 46, 26, 30, { acesa: true });
  porta(p, 40, 48, 16, 32, '#5a7aa0', true);
  p.contorno(K);
  return finalizar(p, br, [{ texto: 'FARMÁCIA', x: centro('FARMÁCIA', 8, 80), y: 12, cor: '#ffffff', brilha: true }]);
}

// ---------------- objetos de rua ----------------
function carroPolicia() {
  const p = new Pix(56, 24), br = new Pix(56, 24);
  p.ret(4, 10, 48, 9, '#f0f0f4'); p.ret(4, 14, 48, 3, '#2a3a6a');
  p.ret(14, 3, 26, 8, '#f0f0f4'); p.ret(16, 4, 10, 6, '#7aaae0'); p.ret(28, 4, 10, 6, '#7aaae0');
  p.ret(22, 0, 5, 3, '#3a6aff'); p.ret(27, 0, 5, 3, '#ff3a3a'); for (let i = 22; i < 32; i++) for (let j = 0; j < 3; j++) br.set(i, j, i < 27 ? '#3a6aff' : '#ff3a3a');
  p.ret(50, 11, 2, 3, '#fff4b0'); br.ret(50, 11, 2, 3, '#fff4b0');
  p.ret(4, 11, 2, 3, '#ff3030');
  for (const cx of [14, 42]) { p.circulo(cx, 19, 4.5, '#1a1a22'); p.circulo(cx, 19, 2, '#9a9aa8'); }
  p.contorno(K);
  return finalizar(p, br, [{ texto: 'POLÍCIA', x: 15, y: 11, cor: '#ffffff' }]);
}
function bancoPraca() { const p = new Pix(30, 14); p.ret(1, 4, 28, 2, '#a0702a'); p.ret(1, 7, 28, 2, '#8a5a24'); p.ret(1, 1, 28, 2, '#a0702a'); for (const x of [3, 25]) p.ret(x, 9, 2, 5, '#3a3a4a'); p.contorno(K); return { cor: p, brilho: new Pix(30, 14) }; }
function pontoOnibus() {
  const p = new Pix(40, 44), br = new Pix(40, 44);
  p.ret(2, 2, 36, 3, '#3a6ac8'); p.ret(3, 5, 1, 39, '#5a5a6a'); p.ret(36, 5, 1, 39, '#5a5a6a');
  for (let j = 6; j < 30; j++) for (let i = 5; i < 35; i++) p.set(i, j, j < 12 ? '#c8e0f0' : '#a8c8e0');
  p.ret(6, 30, 28, 2, '#a0702a'); p.ret(8, 32, 2, 12, '#3a3a4a'); p.ret(30, 32, 2, 12, '#3a3a4a');
  p.contorno(K);
  return finalizar(p, br, [{ texto: 'BUS', x: 13, y: 0, cor: '#ffffff' }]);
}
function hidrante() { const p = new Pix(10, 14); p.ret(2, 3, 6, 11, '#d83a3a'); p.ret(1, 6, 8, 2, '#d83a3a'); p.ret(3, 1, 4, 2, '#a82a2a'); p.ret(3, 4, 1, 8, '#f07a6a'); p.contorno(K); return { cor: p, brilho: new Pix(10, 14) }; }

function comoSprite(fab) {
  return () => { const r = fab(); return { quadros: [r.cor], brilho: [r.brilho], anims: { parado: { q: [0] } }, sombra: false }; };
}
registrarSprites({
  escola: comoSprite(escola), delegacia: comoSprite(delegacia), padaria: comoSprite(padaria), mercado: comoSprite(mercado), farmacia: comoSprite(farmacia),
  'carro-policia': comoSprite(carroPolicia), 'banco-praca': comoSprite(bancoPraca), 'ponto-onibus': comoSprite(pontoOnibus), hidrante: comoSprite(hidrante),
}, { grupo: 'Cidade (vista lateral)' });

