// Móveis e objetos de interiores (vista lateral): escola, quarto de menino e sala de estar.
// Apoiados pela base (y = 0 no chão). Objetos de parede usam "y" no roteiro (ex.: lousa y 1.3).
// Cores trocáveis com "cores": { "tecido": "#3a6ac8" } (cama, sofá, poltrona) ou { "madeira": ... }.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { desenharTexto } from '../fonte.js';
import { rng } from '../compartilhado/util.js';

const K = '#1a1c2c';

// 3 tons (luz, base, sombra) a partir de uma cor.
function tons(hex) {
  const n = parseInt(hex.replace('#', ''), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const f = (m, a) => '#' + c.map((v, i) => Math.max(0, Math.min(255, Math.round(v * m + a[i])))).map((v) => v.toString(16).padStart(2, '0')).join('');
  return [f(0.8, [56, 52, 44]), hex, f(0.66, [0, 0, 12])];
}
// Caixa com luz em cima/esquerda e sombra embaixo/direita.
function caixa(p, x, y, w, h, [l, b, s]) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.set(x + i, y + j, j === 0 || i === 0 ? l : (j === h - 1 || i === w - 1) ? s : b);
}
const MADEIRA = ['#c89060', '#a8703e', '#7a4e2a'];

function fim(p, br, extra = {}) {
  p.contorno(K);
  return { quadros: [p], brilho: br ? [br] : undefined, anims: { parado: { q: [0] } }, sombra: false, ...extra };
}
const mad = (cores) => (cores?.madeira ? tons(cores.madeira) : MADEIRA);

// ================================================================== ESCOLA
function lousa({ cores } = {}) {
  const W = 96, H = 50, p = new Pix(W, H), r = rng(5);
  caixa(p, 0, 0, W, H - 4, mad(cores));
  for (let j = 3; j < H - 7; j++) for (let i = 3; i < W - 3; i++) p.set(i, j, r() < 0.04 ? '#3a6a4a' : '#2e5a3e');
  // giz: contas e rabiscos
  const cv = p.paraCanvas(), g = cv.getContext('2d');
  desenharTexto(g, '2+2=4', 8, 6, '#eef4ee');
  desenharTexto(g, 'ABC', 60, 6, '#f4e8a0');
  const d = g.getImageData(0, 0, W, H).data;
  for (let k = 0; k < W * H; k++) if (d[k * 4 + 3] > 0) p.set(k % W, Math.floor(k / W), `#${[0, 1, 2].map((c) => d[k * 4 + c].toString(16).padStart(2, '0')).join('')}`);
  for (let i = 0; i < 30; i++) p.set(10 + i, 30 + Math.round(Math.sin(i / 3) * 2), '#dce8dc');
  for (let i = 0; i < 18; i++) p.set(60 + i, 32 - Math.round(i / 3), '#c8dcf0');
  // calha do giz + apagador
  p.ret(2, H - 5, W - 4, 2, '#a8703e'); p.ret(2, H - 3, W - 4, 1, '#7a4e2a');
  p.ret(70, H - 8, 10, 3, '#3a3a5a'); p.ret(70, H - 8, 10, 1, '#f4f0e8');
  for (const x of [20, 24, 30]) p.ret(x, H - 6, 3, 1, ['#ffffff', '#f4d040', '#e87a8a'][x % 3]);
  return fim(p);
}
function carteira({ cores } = {}) {      // mesa + cadeira do aluno (de perfil, aluno senta virado à direita)
  const W = 36, H = 28, p = new Pix(W, H), m = mad(cores), metal = ['#9aa0b0', '#6a7080', '#4a5060'];
  // cadeira (esquerda)
  caixa(p, 2, 2, 3, 15, m); caixa(p, 2, 14, 12, 3, m);
  p.ret(3, 17, 2, 11, metal[1]); p.ret(11, 17, 2, 11, metal[1]);
  // mesa (direita)
  caixa(p, 14, 10, 20, 3, m); p.ret(30, 13, 2, 15, metal[1]); p.ret(16, 13, 2, 15, metal[1]);
  p.ret(16, 14, 16, 4, metal[2]);                                  // porta-livros
  p.ret(20, 8, 7, 2, '#f4f0e8'); p.ret(20, 9, 7, 1, '#c83c4c');    // caderno
  p.set(28, 8, '#f0c840'); p.set(29, 7, '#f0c840');                // lápis
  return fim(p);
}
function mesaProfessor({ cores } = {}) {
  const W = 56, H = 30, p = new Pix(W, H), m = mad(cores);
  caixa(p, 0, 10, W, 4, m);
  caixa(p, 2, 14, 18, 16, m); caixa(p, 36, 14, 18, 16, m);
  for (const y of [18, 24]) { p.ret(4, y, 14, 1, m[2]); p.ret(38, y, 14, 1, m[2]); p.ret(10, y + 2, 2, 1, '#e8c040'); p.ret(44, y + 2, 2, 1, '#e8c040'); }
  p.ret(20, 14, 16, 3, m[2]);
  // livros, maçã e caneca
  caixa(p, 6, 4, 12, 3, tons('#3a6ac8')); caixa(p, 7, 1, 10, 3, tons('#c83c4c')); caixa(p, 6, 7, 12, 3, tons('#3aa860'));
  p.circulo(28, 7, 3, (x, y, dx, dy) => (dx < -0.2 && dy < -0.1 ? '#ff8a8a' : '#d83a3a')); p.set(28, 3, '#5a3a24'); p.set(29, 3, '#3aa860');
  caixa(p, 42, 4, 6, 6, tons('#f4f0e8')); p.ret(43, 3, 4, 1, '#7a4e2a'); p.set(48, 6, '#e0dacc'); p.set(48, 7, '#e0dacc');
  return fim(p);
}
function estanteLivros({ cores, semente = 1 } = {}) {
  const W = 38, H = 60, p = new Pix(W, H), m = mad(cores), r = rng(semente + 20);
  caixa(p, 0, 0, W, H, m);
  const cl = ['#c83c4c', '#3a6ac8', '#3aa860', '#f0b830', '#8a4ac8', '#e87a3a', '#4a4a5a'];
  for (const y0 of [3, 17, 31, 45]) {
    p.ret(2, y0, W - 4, 12, m[2]);
    let x = 3;
    while (x < W - 5) {
      const w = 2 + Math.floor(r() * 3), h = 8 + Math.floor(r() * 4), c = tons(cl[Math.floor(r() * cl.length)]);
      if (r() < 0.12) { x += 3; continue; }
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.set(x + i, y0 + 12 - h + j, i === 0 ? c[0] : c[1]);
      p.ret(x, y0 + 12 - h + 2, w, 1, c[2]);
      x += w + (r() < 0.2 ? 1 : 0);
    }
    p.ret(1, y0 + 12, W - 2, 2, m[0]);
  }
  return fim(p);
}
function relogioParede() {
  const p = new Pix(16, 16);
  p.circulo(8, 8, 7.5, '#3a3a4a'); p.circulo(8, 8, 6, '#f8f4ec');
  for (const [x, y] of [[8, 3], [13, 8], [8, 13], [3, 8]]) p.set(x, y, '#3a3a4a');
  p.ret(8, 4, 1, 4, '#1a1c2c'); p.ret(8, 8, 4, 1, '#1a1c2c'); p.set(8, 8, '#c83c4c');
  return fim(p);
}
function globo() {
  const W = 18, H = 24, p = new Pix(W, H);
  p.circulo(9, 9, 7, (x, y, dx, dy) => {
    const terra = Math.sin(x * 0.9) + Math.cos(y * 0.7 + x * 0.3) > 0.6;
    const c = terra ? (dx < -0.2 ? '#7ac87a' : '#4a9a4a') : (dx < -0.2 ? '#7ab0ec' : '#3a7ac8');
    return dx > 0.5 && dy > -0.2 ? (terra ? '#357a3a' : '#2a5a9a') : c;
  });
  for (let k = 0; k < 9; k++) p.set(16 - Math.round(Math.sin(k / 3) * 1), 3 + k * 1.4, '#c8a050');
  p.ret(8, 17, 2, 4, '#8a6a2a'); p.ret(4, 21, 10, 3, '#a8703e'); p.ret(4, 21, 10, 1, '#c89060');
  return fim(p);
}
function cartazAlfabeto() {
  const W = 70, H = 14, p = new Pix(W, H);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const letras = 'ABCDEFGHIJ', cl = ['#c83c4c', '#3a6ac8', '#3aa860', '#e8a020', '#8a4ac8'];
  for (let k = 0; k < letras.length; k++) { caixa(p, k * 7, 0, 7, 13, tons(['#f8f0d8', '#e8f0f8'][k % 2])); desenharTexto(g, letras[k], k * 7 + 1, 2, cl[k % cl.length]); }
  const d = g.getImageData(0, 0, W, H).data;
  for (let k = 0; k < W * H; k++) if (d[k * 4 + 3] > 0) p.set(k % W, Math.floor(k / W), `#${[0, 1, 2].map((c) => d[k * 4 + c].toString(16).padStart(2, '0')).join('')}`);
  return fim(p);
}

// ================================================================== QUARTO
function cama({ cores } = {}) {
  const W = 68, H = 34, p = new Pix(W, H), m = mad(cores), tec = tons(cores?.tecido || '#3a6ac8');
  caixa(p, 0, 0, 6, H, m);                                         // cabeceira
  p.ret(1, 4, 4, 2, m[2]); p.ret(1, 10, 4, 2, m[2]);
  caixa(p, 62, 12, 5, H - 12, m);                                  // peseira
  caixa(p, 6, 22, 56, 7, m); p.ret(8, 29, 3, 5, m[2]); p.ret(57, 29, 3, 5, m[2]);
  // colchão + lençol
  p.ret(6, 15, 56, 7, '#f4f4f4'); p.ret(6, 21, 56, 1, '#d0d4dc');
  // travesseiro
  p.elipse(14, 13, 7, 3.5, (x, y, dx, dy) => (dy < -0.3 ? '#ffffff' : dy > 0.5 ? '#c8ccd8' : '#eef0f4'));
  // cobertor com estampa de foguetes/listras
  for (let j = 12; j < 24; j++) for (let i = 22; i < 62; i++) {
    const borda = j === 12; let c = borda ? tec[0] : ((i + 2) % 10 < 2 ? tec[2] : tec[1]);
    if (j === 23) c = tec[2];
    p.set(i, j, c);
  }
  for (let j = 12; j < 26; j++) p.set(61, j, tec[2]);              // cai do lado
  for (const x of [30, 44]) { p.ret(x, 16, 2, 4, '#f4f4f4'); p.set(x, 15, '#f4f4f4'); p.set(x - 1, 19, '#e8a040'); p.set(x + 2, 19, '#e8a040'); }
  return fim(p);
}
function escrivaninha({ cores, ligado = true } = {}) {
  const W = 48, H = 44, p = new Pix(W, H), br = new Pix(W, H), m = mad(cores);
  caixa(p, 0, 24, W, 3, m); caixa(p, 32, 27, 14, 17, m); p.ret(2, 27, 2, 17, m[2]);
  p.ret(34, 33, 10, 1, m[2]); p.ret(38, 30, 2, 1, '#e8c040'); p.ret(38, 37, 2, 1, '#e8c040');
  // computador
  caixa(p, 8, 4, 24, 17, tons('#4a4a5a'));
  for (let j = 6; j < 19; j++) for (let i = 10; i < 30; i++) {
    const c = ligado ? (j < 9 ? '#5ad0f0' : (i + j) % 7 === 0 ? '#a8f0ff' : '#3a9ad8') : '#1e2430';
    p.set(i, j, c); if (ligado) br.set(i, j, c);
  }
  if (ligado) { for (let i = 12; i < 22; i++) { p.set(i, 12, '#f4f4f4'); br.set(i, 12, '#f4f4f4'); } for (let i = 12; i < 18; i++) { p.set(i, 15, '#f8e060'); br.set(i, 15, '#f8e060'); } }
  p.ret(18, 21, 4, 2, '#3a3a4a'); p.ret(14, 23, 12, 1, '#3a3a4a');
  // teclado e lápis no pote
  p.ret(6, 22, 16, 2, '#d0d4dc'); for (let i = 7; i < 21; i += 2) p.set(i, 22, '#9aa0b0');
  caixa(p, 38, 17, 5, 7, tons('#c83c4c')); p.ret(39, 13, 1, 4, '#f0c840'); p.ret(41, 14, 1, 3, '#3aa860');
  return fim(p, br, ligado ? { luz: { cor: '#80d0ff', intensidade: 0.6, alcance: 3, dy: 1.6, dz: 0.5 } } : {});
}
function cadeiraGamer({ cores } = {}) {
  const W = 20, H = 34, p = new Pix(W, H), tec = tons(cores?.tecido || '#c83c4c');
  caixa(p, 2, 0, 10, 18, tec); p.ret(4, 2, 6, 3, '#1e1e2a');
  caixa(p, 2, 17, 16, 4, tec);
  p.ret(9, 21, 2, 8, '#3a3a4a'); p.ret(3, 29, 14, 2, '#3a3a4a');
  for (const x of [3, 9, 16]) p.ret(x, 31, 2, 2, '#1e1e2a');
  return fim(p);
}
function guardaRoupa({ cores } = {}) {
  const W = 44, H = 72, p = new Pix(W, H), m = mad(cores);
  caixa(p, 0, 0, W, H - 3, m); p.ret(2, H - 3, 3, 3, m[2]); p.ret(W - 5, H - 3, 3, 3, m[2]);
  p.ret(21, 2, 2, H - 8, m[2]);
  for (const x of [4, 25]) { caixa(p, x, 5, 15, 24, m); caixa(p, x, 33, 15, 30, m); }
  p.ret(18, 34, 2, 6, '#e8c040'); p.ret(24, 34, 2, 6, '#e8c040');
  // adesivos de criança
  p.circulo(10, 15, 3, '#f8e060'); p.ret(30, 44, 6, 4, '#3aa860'); p.set(33, 43, '#3aa860');
  return fim(p);
}
function bauBrinquedos() {
  const W = 34, H = 26, p = new Pix(W, H);
  // brinquedos para fora
  caixa(p, 4, 2, 6, 8, tons('#3aa860')); p.ret(5, 4, 4, 2, '#f8e060');               // robozinho
  p.circulo(19, 6, 4, (x, y, dx, dy) => ((dx + dy) > 0 ? '#e83a3a' : '#f4f4f4'));      // bola
  p.ret(25, 0, 2, 10, '#c8a050'); p.ret(23, 0, 6, 2, '#e8a040');                        // espada de brinquedo
  caixa(p, 0, 9, W, 17, tons('#e8a040'));
  p.ret(0, 9, W, 3, '#c07820'); p.ret(15, 14, 4, 3, '#f8e060');
  for (let i = 3; i < W - 3; i += 6) p.ret(i, 19, 3, 3, ['#3a6ac8', '#c83c4c', '#3aa860', '#8a4ac8', '#f8e060'][(i / 6) | 0]);
  return fim(p);
}
function bola({ cores } = {}) {
  const p = new Pix(10, 10), c = tons(cores?.cor || '#e83a3a');
  p.circulo(5, 5, 4.5, (x, y, dx, dy) => (Math.abs(dx - dy) < 0.3 ? '#f4f4f4' : dx < -0.2 && dy < -0.2 ? c[0] : dx > 0.4 || dy > 0.5 ? c[2] : c[1]));
  return { ...fim(p), sombra: true };
}
function abajur({ cores, aceso = true } = {}) {
  const W = 16, H = 30, p = new Pix(W, H), br = new Pix(W, H), cup = tons(cores?.cupula || '#f0d890');
  // mesinha de cabeceira embaixo? não: só o abajur (ponha sobre um móvel com "y")
  for (let j = 0; j < 10; j++) { const w = 3 + j * 0.5; for (let i = Math.round(8 - w); i < Math.round(8 + w); i++) { const c = aceso ? (j > 7 ? '#fff4c0' : cup[i < 8 - w + 2 ? 0 : 1]) : cup[2]; p.set(i, j, c); if (aceso) br.set(i, j, c); } }
  p.ret(7, 10, 2, 14, '#8a6a2a'); caixa(p, 3, 24, 10, 6, tons('#a8703e'));
  return fim(p, br, aceso ? { luz: { cor: '#ffd890', intensidade: 1.4, alcance: 5, dy: 1.2, dz: 0.6 } } : {});
}
function criadoMudo({ cores } = {}) {
  const W = 20, H = 22, p = new Pix(W, H), m = mad(cores);
  caixa(p, 0, 0, W, 3, m); caixa(p, 1, 3, 18, 17, m); p.ret(1, 11, 18, 1, m[2]); p.ret(9, 6, 2, 1, '#e8c040'); p.ret(9, 15, 2, 1, '#e8c040');
  p.ret(2, 20, 2, 2, m[2]); p.ret(16, 20, 2, 2, m[2]);
  return fim(p);
}

// ================================================================== SALA DE ESTAR
function sofa({ cores } = {}) {
  const W = 78, H = 34, p = new Pix(W, H), tec = tons(cores?.tecido || '#3a8a8a');
  caixa(p, 4, 0, 70, 18, tec);                                      // encosto
  for (const x of [6, 29, 52]) caixa(p, x, 3, 21, 14, tec);          // almofadas do encosto
  caixa(p, 4, 17, 70, 10, tec);                                     // assento
  p.ret(27, 18, 1, 8, tec[2]); p.ret(50, 18, 1, 8, tec[2]);
  caixa(p, 0, 8, 8, 21, tec); caixa(p, 70, 8, 8, 21, tec);          // braços
  p.ret(4, 29, 3, 5, '#5a3a20'); p.ret(71, 29, 3, 5, '#5a3a20');
  // almofada decorativa
  caixa(p, 10, 9, 12, 9, tons('#f0b830')); p.set(15, 13, '#c88a20'); p.set(16, 13, '#c88a20');
  return fim(p);
}
function poltrona({ cores } = {}) {
  const W = 32, H = 32, p = new Pix(W, H), tec = tons(cores?.tecido || '#a83a3a');
  caixa(p, 4, 0, 24, 20, tec); caixa(p, 4, 17, 24, 9, tec);
  caixa(p, 0, 10, 6, 18, tec); caixa(p, 26, 10, 6, 18, tec);
  p.ret(3, 28, 2, 4, '#5a3a20'); p.ret(27, 28, 2, 4, '#5a3a20');
  return fim(p);
}
function tvRack({ cores, ligada = true } = {}) {
  const W = 64, H = 44, p = new Pix(W, H), br = new Pix(W, H), m = mad(cores);
  // TV
  caixa(p, 10, 0, 44, 26, tons('#2a2a36'));
  for (let j = 2; j < 24; j++) for (let i = 12; i < 52; i++) {
    let c = '#141820';
    if (ligada) { const v = j / 22; c = v < 0.45 ? '#6ab8f0' : v < 0.7 ? '#8ad070' : '#5aa04a'; if ((i - 40) ** 2 + (j - 8) ** 2 < 14) c = '#fff4a0'; if (j === 15 && i % 6 < 3) c = '#f4f4f4'; }
    else if (i - j > 22 && i - j < 26) c = '#2a3040';
    p.set(i, j, c); if (ligada) br.set(i, j, c);
  }
  p.ret(29, 26, 6, 2, '#2a2a36');
  // rack
  caixa(p, 0, 28, W, 13, m); p.ret(2, 31, 28, 8, m[2]); p.ret(34, 31, 28, 8, m[2]);
  caixa(p, 6, 34, 12, 4, tons('#3a3a4a')); p.set(16, 35, '#3ae070');                   // videogame
  for (let k = 0; k < 5; k++) caixa(p, 38 + k * 4, 32, 3, 7, tons(['#c83c4c', '#3a6ac8', '#3aa860', '#f0b830', '#8a4ac8'][k]));   // jogos/dvds
  p.ret(2, 41, 3, 3, m[2]); p.ret(W - 5, 41, 3, 3, m[2]);
  return fim(p, br, ligada ? { luz: { cor: '#a0d0ff', intensidade: 0.8, alcance: 4, dy: 2, dz: 0.6 } } : {});
}
function mesaCentro({ cores } = {}) {
  const W = 44, H = 16, p = new Pix(W, H), m = mad(cores);
  caixa(p, 0, 4, W, 3, m); p.ret(3, 7, 3, 9, m[2]); p.ret(W - 6, 7, 3, 9, m[2]); p.ret(5, 11, W - 10, 2, m[1]);
  p.ret(8, 2, 10, 2, '#e8e0d0'); p.ret(8, 3, 10, 1, '#c83c4c');                       // revista
  p.ret(28, 1, 5, 3, '#f4f4f4'); p.ret(33, 2, 1, 1, '#f4f4f4'); p.ret(29, 1, 3, 1, '#7a4e2a');   // xícara
  // controle remoto
  p.ret(20, 3, 6, 1, '#2a2a36');
  return fim(p);
}
function tapete({ cores } = {}) {
  const W = 88, H = 6, p = new Pix(W, H), c = tons(cores?.cor || '#b84a4a');
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let cor = j === 0 || j === H - 1 ? c[2] : (j === 2 || j === 3) && (i % 8 < 4) ? '#f0d090' : c[1];
    if (i < 2 || i > W - 3) cor = j % 2 ? '#f0e0c0' : null;           // franjas
    if (cor) p.set(i, j, cor);
  }
  return { quadros: [p], anims: { parado: { q: [0] } }, sombra: false };
}
function plantaVaso({ semente = 1 } = {}) {
  const W = 22, H = 38, p = new Pix(W, H), r = rng(semente + 40);
  for (let k = 0; k < 9; k++) {                                       // folhas
    const a = -Math.PI / 2 + (k - 4) * 0.36 + (r() - 0.5) * 0.2, comp = 12 + r() * 10;
    for (let t = 0; t < comp; t++) {
      const x = 11 + Math.cos(a) * t, y = 24 + Math.sin(a) * t + (t * t) / (comp * 2.2) * Math.abs(Math.cos(a));
      const larg = Math.sin((t / comp) * Math.PI) * 2;
      for (let d = -larg; d <= larg; d++) p.set(x + d * Math.sin(a) * -1, y + d * Math.cos(a) * 0.4, d < 0 ? '#5ab85a' : '#3a8a44');
    }
  }
  caixa(p, 5, 26, 12, 12, tons('#c8643a')); p.ret(4, 26, 14, 2, '#e8845a');
  return fim(p);
}
function luminariaPe({ acesa = true } = {}) {
  const W = 18, H = 56, p = new Pix(W, H), br = new Pix(W, H);
  for (let j = 0; j < 12; j++) { const w = 4 + j * 0.4; for (let i = Math.round(9 - w); i < Math.round(9 + w); i++) { const c = acesa ? (j > 9 ? '#fff4c0' : i < 9 - w + 2 ? '#fff0d0' : '#f4e0b0') : '#c8b890'; p.set(i, j, c); if (acesa) br.set(i, j, c); } }
  p.ret(8, 12, 2, 40, '#4a4a5a'); p.ret(4, 52, 10, 4, '#3a3a4a'); p.ret(4, 52, 10, 1, '#6a6a7a');
  return fim(p, br, acesa ? { luz: { cor: '#ffd890', intensidade: 1.3, alcance: 5, dy: 3, dz: 0.6 } } : {});
}
function estanteSala({ cores } = {}) {     // estante baixa com porta-retratos, vaso e livros
  const W = 40, H = 46, p = new Pix(W, H), m = mad(cores);
  caixa(p, 0, 0, W, H, m);
  for (const y0 of [3, 18, 33]) p.ret(2, y0, W - 4, 11, m[2]);
  caixa(p, 4, 6, 9, 8, tons('#c8a050')); p.ret(6, 8, 5, 4, '#f4e8d0'); p.circulo(8.5, 10, 1.5, '#f0c4a0');
  caixa(p, 24, 7, 6, 7, tons('#3a6ac8')); p.set(26, 5, '#e85a8a'); p.set(27, 4, '#e85a8a'); p.set(26, 6, '#3aa860');
  for (let k = 0; k < 7; k++) caixa(p, 4 + k * 4, 21 + (k % 3), 3, 11 - (k % 3), tons(['#c83c4c', '#3a6ac8', '#3aa860', '#f0b830', '#8a4ac8', '#e87a3a', '#4a4a5a'][k]));
  p.ret(4, 36, 32, 6, '#b8a888'); p.ret(4, 36, 32, 1, '#d8c8a8');                     // caixas organizadoras
  return fim(p);
}

const sp = (fab, extra) => (op) => fab({ ...(extra || {}), ...(op || {}) });
registrarSprites({
  // escola
  lousa: sp(lousa), carteira: sp(carteira), 'mesa-professor': sp(mesaProfessor), 'estante-livros': sp(estanteLivros),
  'relogio-parede': sp(relogioParede), globo: sp(globo), 'cartaz-alfabeto': sp(cartazAlfabeto),
  // quarto
  cama: sp(cama), escrivaninha: sp(escrivaninha), 'escrivaninha-desligada': sp(escrivaninha, { ligado: false }),
  'cadeira-gamer': sp(cadeiraGamer), 'guarda-roupa': sp(guardaRoupa), 'bau-brinquedos': sp(bauBrinquedos), bola: sp(bola),
  abajur: sp(abajur), 'abajur-apagado': sp(abajur, { aceso: false }), 'criado-mudo': sp(criadoMudo),
  // sala
  sofa: sp(sofa), poltrona: sp(poltrona), 'tv-rack': sp(tvRack), 'tv-rack-desligada': sp(tvRack, { ligada: false }),
  'mesa-centro': sp(mesaCentro), tapete: sp(tapete), 'planta-vaso': sp(plantaVaso), 'luminaria-pe': sp(luminariaPe),
  'luminaria-pe-apagada': sp(luminariaPe, { acesa: false }), 'estante-sala': sp(estanteSala),
}, { grupo: 'Interiores (móveis e cômodos)', prototipos: ['penteadeira', 'pufe', 'cavalete'] });
