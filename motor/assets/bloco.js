// PROTÓTIPO — assets "jogo de blocos" (para vídeos que falam de Roblox e jogos parecidos), no NOSSO estilo de pixel art.
// Não copia nada do Roblox: sem logo, sem o avatar padrão amarelo/azul/verde, sem a moeda oficial. É o gênero (bonecos de
// bloco, mundo de cubos, chat, bugs) desenhado do nosso jeito.
//   Avatares (personagens, de frente, 26x48, andam travados, pulam): avatar-bloco-vermelho, -roxo, -verde, -azul,
//     avatar-bloco-capuz (capuz preto, rosto escondido: o "estranho" do servidor), e as versões em bloco do elenco:
//     avatar-bia, avatar-nina, avatar-topete.
//     Estados: parado, acenar, bug (pisca em fatias e cores, como se o jogo travasse), sem-rosto (rosto liso), sorriso
//     (o sorriso pintado cresce até as bordas), andando/correndo/pulando e bug-andando, sem-rosto-andando, sorriso-andando.
//   Cubos isométricos (objetos do mapa, diorama): cubo-grama, cubo-terra, cubo-pedra, cubo-madeira, cubo-lava (brilha),
//     cubo-xadrez (bandeira de chegada), plataforma-spawn (ponto de nascimento, brilha).
//   tela-jogo: monitor em close ("tela": true) com o mundo de cubos, avatares e o chat; estados jogando / chat / erro /
//     socorro (avatar batendo no vidro) / chat-nao-sai / chat-banho / pausado. icone-pausa: o símbolo de pausa (use "sobre").
//   moeda-bloco: moedinha quadrada nossa (dourada, com estrela) que gira.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { MOVEIS } from '../cenarios/comodoDiagonal.js';
import { iso } from './praca.js';
import { desenharTexto, larguraTexto } from '../fonte.js';

const K = '#14121c', W = 30, H = 44;

// ------------------------------------------------------------------ avatares
// cfg: { pele, camisa, calca, sapato, cabelo, chapeu, estampa, capuz }
const AVATARES = {
  'avatar-bloco-vermelho': { pele: '#f4d0a8', camisa: '#d83a3a', calca: '#2a2a36', sapato: '#f4f4f4', cabelo: '#5a3424', chapeu: 'bone', chapeuCor: '#3a6ac8', estampa: 'listra' },
  'avatar-bloco-roxo': { pele: '#f0c8b0', camisa: '#8a4ac8', calca: '#6a6a78', sapato: '#2a2a36', cabelo: '#f080b0', chapeu: 'franja', estampa: 'coracao' },
  'avatar-bloco-verde': { pele: '#a8704a', camisa: '#3ab060', calca: '#6a4a2a', sapato: '#2a2a36', cabelo: '#2a1a14', chapeu: 'fone', chapeuCor: '#2a2a36', estampa: 'raio' },
  'avatar-bloco-azul': { pele: '#f8dcc0', camisa: '#3a8ad8', calca: '#f4f4f4', sapato: '#3a5ac8', cabelo: '#f8d860', chapeu: 'liso', estampa: 'estrela' },
  'avatar-bloco-capuz': { pele: '#f0c8a8', camisa: '#22222c', calca: '#22222c', sapato: '#14121c', cabelo: '#22222c', capuz: true, estampa: null },
  // o elenco em bloco (quando "entram no jogo")
  'avatar-bia': { pele: '#f8d8b8', camisa: '#f8c82c', calca: '#4a6ab0', sapato: '#d83a3a', cabelo: '#9a5a36', chapeu: 'capuz-capa', chapeuCor: '#f8c82c', estampa: 'botoes' },
  'avatar-nina': { pele: '#f0c8a8', camisa: '#7a3ad0', calca: '#2a2448', sapato: '#e0407a', cabelo: '#2e1a3e', chapeu: 'rabo', chapeuCor: '#f8d040', estampa: 'emblema' },
  'avatar-topete': { pele: '#f0c4a0', camisa: '#2a8a7a', calca: '#3a4a7a', sapato: '#d83a3a', cabelo: '#e0602a', chapeu: 'topete', chapeuCor: '#3a7ad8', estampa: 'cachecol' },
};

const claro = (hex, t = 0.3) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t)); return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''); };
const escuro = (hex, t = 0.3) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - t))); return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''); };
const bloco = (p, x, y, w, h, cor) => { p.ret(x, y, w, h, cor); p.ret(x, y, w, 1, claro(cor, 0.35)); p.ret(x + w - 1, y + 1, 1, h - 1, escuro(cor, 0.25)); };

// Proporção de avatar de bloco "clássico": cabeça arredondada de 10x10, tronco largo de 16x16, braços de 6x16 e pernas de 8x16
// (as duas pernas juntas têm a largura do tronco). Plástico: faixa de brilho à esquerda, sombra à direita, um ponto de reflexo.
// f: { braco, bracoE: número (encurta = vem para a frente) | 'alto' | 'aceno', perna: -1 | 0 | 1, pulo, rosto }
const WA = 30;
function avatar(c, f = {}) {
  const p0 = new Pix(WA, H + 6), p = { set: (x, y, cor) => p0.set(x, y + 4, cor), ret: (x, y, w, h, cor) => p0.ret(x, y + 4, w, h, cor) };
  const pulo = f.pulo ? -2 : 0, bob = f.perna ? 1 : 0, y0 = pulo + bob;
  const plastico = (x, y, w, h, cor, reflexo = true) => {
    p.ret(x, y, w, h, cor); p.ret(x, y, 1, h, claro(cor, 0.3)); p.ret(x + w - 1, y, 1, h, escuro(cor, 0.22)); p.ret(x, y + h - 1, w, 1, escuro(cor, 0.3));
    p.ret(x, y, w, 1, claro(cor, 0.4)); if (reflexo && w > 4) p.set(x + 1, y + 1, '#ffffff');
  };
  // pernas: a que vem para a frente fica mais curta (escorço) e mais clara
  for (const [x, lado] of [[8, -1], [16, 1]]) {
    const frente = f.perna === lado, alt = frente ? 13 : 16, yy = 30 + y0;
    plastico(x, yy, 7, alt, frente ? claro(c.calca, 0.1) : c.calca, false); p.ret(x, yy + alt - 3, 7, 3, c.sapato);
  }
  // tronco
  plastico(7, 14 + y0, 16, 16, c.camisa);
  const e = c.estampa, cx = 15, cy = 21 + y0;
  if (e === 'listra') p.ret(8, cy, 14, 2, '#f4f4f4');
  if (e === 'coracao') for (const [x, y] of [[-2, 0], [-1, 0], [1, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [-1, 2], [0, 2], [1, 2], [0, 3]]) p.set(cx + x, cy - 2 + y, '#f8a0c8');
  if (e === 'raio') for (const [x, y] of [[1, 0], [0, 1], [-1, 2], [0, 2], [1, 2], [0, 3], [-1, 4]]) p.set(cx + x, cy - 2 + y, '#f8e060');
  if (e === 'estrela') for (const [x, y] of [[0, 0], [-1, 1], [0, 1], [1, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2], [-1, 3], [1, 3]]) p.set(cx + x, cy - 2 + y, '#f8f4e0');
  if (e === 'botoes') { p.ret(cx, 14 + y0, 1, 16, escuro(c.camisa, 0.2)); for (const y of [17, 21, 25]) p.set(cx + 1, y + y0, '#8a6a20'); }
  if (e === 'emblema') { p.ret(cx - 2, cy - 1, 5, 4, '#f8d040'); p.ret(cx - 1, cy, 3, 2, '#7a3ad0'); }
  if (e === 'cachecol') { p.ret(7, 14 + y0, 16, 3, c.chapeuCor); p.ret(17, 17 + y0, 3, 6, c.chapeuCor); }
  // braços (manga da camisa em cima, pele embaixo)
  const braco = (x, modo) => {
    if (modo === 'alto' || modo === 'aceno') { const dy = modo === 'aceno' ? -1 : 0; plastico(x, -2 + y0 + dy, 6, 9, c.camisa, false); p.ret(x, -4 + y0 + dy, 6, 3, c.pele); p.ret(x, 7 + y0, 6, 8, c.camisa); return; }
    const enc = typeof modo === 'number' ? Math.max(0, modo) * 3 : 0;   // >0: o braço vem para a frente (mais curto)
    plastico(x, 14 + y0, 6, 9 - enc / 2, enc ? claro(c.camisa, 0.1) : c.camisa, false);
    plastico(x, 23 + y0 - enc / 2, 6, 7 - enc / 2, c.pele, false);
  };
  braco(1, f.bracoE ?? 0); braco(23, f.braco ?? 0);
  // cabeça arredondada (sem os 4 cantos), plástico
  const hy = 4 + y0;
  plastico(10, hy, 10, 10, c.pele);
  for (const [x, y] of [[10, 0], [19, 0], [10, 9], [19, 9]]) p0.d[((hy + y + 4) * WA + x) * 4 + 3] = 0;   // cantos arredondados
  // cabelo / chapéu (encaixados na cabeça 10x10)
  const ch = c.chapeu, c2 = c.chapeuCor;
  if (ch === 'bone') { plastico(10, hy - 1, 10, 4, c2, false); p.ret(8, hy + 2, 8, 1, escuro(c2, 0.2)); p.ret(18, hy + 3, 2, 3, c.cabelo); }
  if (ch === 'franja') { plastico(9, hy - 1, 12, 4, c.cabelo, false); p.ret(10, hy + 3, 4, 2, c.cabelo); p.ret(9, hy + 2, 1, 9, c.cabelo); p.ret(20, hy + 2, 1, 9, c.cabelo); }
  if (ch === 'fone') { plastico(10, hy - 1, 10, 3, c.cabelo, false); p.ret(9, hy - 2, 12, 1, c2); p.ret(8, hy + 3, 2, 5, c2); p.ret(20, hy + 3, 2, 5, c2); }
  if (ch === 'liso') { plastico(9, hy - 1, 12, 4, c.cabelo, false); p.ret(9, hy + 3, 2, 4, c.cabelo); p.ret(19, hy + 3, 2, 4, c.cabelo); }
  if (ch === 'capuz-capa') { plastico(8, hy - 2, 14, 4, c2, false); p.ret(8, hy + 2, 2, 9, c2); p.ret(20, hy + 2, 2, 9, c2); p.ret(10, hy + 2, 10, 1, c.cabelo); }
  if (ch === 'rabo') { plastico(10, hy - 1, 10, 4, c.cabelo, false); p.ret(12, hy - 4, 6, 3, c.cabelo); p.ret(14, hy - 5, 2, 1, c2); p.ret(19, hy, 4, 6, c.cabelo); }
  if (ch === 'topete') { plastico(10, hy - 1, 10, 4, c.cabelo, false); p.ret(11, hy - 4, 7, 3, c.cabelo); p.ret(15, hy - 5, 3, 1, '#fff4e0'); }
  if (c.capuz) { plastico(8, hy - 2, 14, 15, c.camisa, false); p.ret(10, hy + 2, 10, 8, '#08060c'); }
  // rosto (nosso desenho): olhos ovais com brilho, sorriso largo; sem-rosto = liso; sorriso = estica até as bordas
  const rosto = f.rosto || 'normal';
  if (c.capuz) { if (rosto !== 'liso') { p.set(12, hy + 5, '#ff3a2a'); p.set(17, hy + 5, '#ff3a2a'); } }
  else if (rosto === 'normal') {
    for (const x of [12, 17]) { p.ret(x, hy + 3, 1, 3, K); p.set(x + 1, hy + 3, K); p.set(x + 1, hy + 4, K); p.set(x, hy + 3, '#ffffff'); }
    for (const [x, y] of [[11, 7], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 7]]) p.set(x, hy + y, K);
  } else if (rosto === 'sorriso') {
    for (const x of [12, 17]) { p.ret(x, hy + 2, 2, 3, K); }
    for (let x = 10; x <= 19; x++) { p.set(x, hy + 6, K); p.set(x, hy + 7, x % 2 ? '#f4f4f0' : K); p.set(x, hy + 8, K); }
  }
  return p0.contorno(K);
}
// bug: corta o desenho em fatias deslocadas, apaga linhas e pinta faixas de cor (o jogo travando)
function bugar(p, k) {
  const q = new Pix(p.w, p.h);
  for (let y = 0; y < p.h; y++) {
    const fat = Math.floor((y + k * 5) / 6), dx = [0, 3, -2, 0, 4, -3, 1][(fat + k) % 7];
    if ((y + k * 3) % 11 === 0) continue;
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4; if (!p.d[i + 3]) continue;
      let cor = '#' + [0, 1, 2].map((c) => p.d[i + c].toString(16).padStart(2, '0')).join('');
      if ((fat + k) % 5 === 0) cor = (x + y) % 2 ? '#ff3aa8' : '#3af0ff';
      q.set(x + dx, y, cor);
    }
  }
  return q;
}
function spriteAvatar(c) {
  const quadros = [], anims = {};
  const add = (f) => { quadros.push(avatar(c, f)); return quadros.length - 1; };
  const andar = (f0 = {}) => [-1, 0, 1, 0].map((s) => add({ ...f0, perna: s, bracoE: s > 0 ? 1 : 0, braco: s < 0 ? 1 : 0 }));
  const P = add({}), A = [add({ braco: 'alto' }), add({ braco: 'aceno' })], J = add({ pulo: true, braco: 'alto', bracoE: 'alto' });
  const L = add({ rosto: 'liso' }), S = add({ rosto: 'sorriso' });
  const AN = andar(), AL = andar({ rosto: 'liso' }), AS = andar({ rosto: 'sorriso' });
  const B = [0, 1, 2, 3].map((k) => { quadros.push(bugar(avatar(c, {}), k)); return quadros.length - 1; });
  const BA = [0, 1, 2, 3].map((k) => { quadros.push(bugar(avatar(c, { perna: [-1, 0, 1, 0][k] }), k)); return quadros.length - 1; });
  Object.assign(anims, {
    parado: { q: [P], fps: 1 }, acenar: { q: A, fps: 4 }, pulando: { q: [J], fps: 1 },
    andando: { q: AN, fps: 6 }, correndo: { q: AN, fps: 10 },
    bug: { q: [B[0], P, B[1], B[2], P, B[3]], fps: 12 }, 'bug-andando': { q: BA, fps: 10 }, 'bug-correndo': { q: BA, fps: 14 },
    'sem-rosto': { q: [L], fps: 1 }, 'sem-rosto-andando': { q: AL, fps: 6 }, 'sem-rosto-correndo': { q: AL, fps: 10 },
    sorriso: { q: [S], fps: 1 }, 'sorriso-andando': { q: AS, fps: 6 }, 'sorriso-correndo': { q: AS, fps: 10 },
  });
  return { quadros, anims, sombra: true, personagem: true };
}

// ------------------------------------------------------------------ cubos do mapa (isométricos)
// peça de plástico com PINOS em cima (4x4 por cubo) e brilho; xadrez = bandeira de chegada; brilho = neon (bloco que "mata")
const cubo = (topo, lado, frente, { brilho = false, xadrez = false, borda = null, pinos = true, h = 16, di = 1, dj = 1 } = {}) => ({ di, dj, f(L, m) {
  const { i0, i1, j0, j1 } = m, cor = (c) => (brilho ? [c, 2] : c);
  L.caixa(i0, i1, j0, j1, 0, h, {
    frente: (u, t) => (borda && t > h - 5 ? borda : t === 0 ? escuro(frente, 0.3) : t === h - 1 ? claro(frente, 0.25) : u < 0.08 ? claro(frente, 0.15) : cor(frente)),
    lado: (u, t) => (borda && t > h - 5 ? escuro(borda, 0.15) : t === h - 1 ? claro(lado, 0.2) : cor(lado)),
    topo: (a, b, d) => {
      if (d < 0.05) return escuro(topo, 0.2);
      if (xadrez) return (Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? '#14121c' : '#f4f4f4';
      if (pinos) { const fa = (a * 4) % 1, fb = (b * 4) % 1, r = Math.hypot(fa - 0.5, fb - 0.5); if (r < 0.22) return fa + fb < 0.95 ? claro(topo, 0.35) : escuro(topo, 0.12); }
      return cor(topo);
    },
  });
} });
Object.assign(MOVEIS, {
  'cubo-grama': cubo('#5ac84a', '#8a5a34', '#a86a3e', { borda: '#4aa83a', pinos: false }),
  'cubo-terra': cubo('#a86a3e', '#7a4a2a', '#8a5a34', { pinos: false }),
  'cubo-pedra': cubo('#a8a8b0', '#7a7a84', '#8e8e98'),
  'cubo-madeira': cubo('#d8a060', '#9a6a3a', '#b07a48', { pinos: false }),
  'cubo-lava': cubo('#ff8a2a', '#d84a1a', '#ff6a2a', { brilho: true, pinos: false }),
  'cubo-xadrez': cubo('#f4f4f4', '#3a3a44', '#5a5a64', { xadrez: true }),
  // peças de plástico coloridas (com pinos) e placas finas, para montar o percurso
  'peca-vermelha': cubo('#e84a4a', '#a82a2a', '#c83a3a'), 'peca-azul': cubo('#4a8ae8', '#2a5aa8', '#3a6ac8'),
  'peca-amarela': cubo('#f8d84a', '#c8a82a', '#e0c03a'), 'peca-verde': cubo('#5ad06a', '#2e8a3e', '#46b056'),
  'placa-azul': cubo('#4a8ae8', '#2a5aa8', '#3a6ac8', { h: 4, di: 2, dj: 2 }), 'placa-amarela': cubo('#f8d84a', '#c8a82a', '#e0c03a', { h: 4, di: 2, dj: 2 }),
  'bloco-neon': cubo('#ff4a5a', '#d82a3a', '#ff3a4a', { brilho: true, pinos: false, h: 6, di: 1, dj: 2 }),   // o bloco vermelho que "mata"
  'trelica': { di: 0.5, dj: 0.5, f(L, m) {   // escada de treliça (torre cinza de grade)
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 64, { frente: (u, t, l) => (u < 0.07 || u > l - 0.07 || t % 8 < 1 || Math.abs((u / l) * 8 - (t % 8)) < 0.8 ? '#8a8e9c' : null), lado: (u, t) => (u < 1.2 / 16 || t % 8 < 1 ? '#6a6e7a' : null), topo: '#a8acb8' });
  } },
  'plataforma-spawn': { di: 1.6, dj: 1.6, f(L, m) {   // ponto de nascer: placa cinza com um círculo claro no meio
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 3, { frente: '#7a7a84', lado: '#6a6a74', topo: (a, b, d) => { const r = Math.hypot(a - 0.8, b - 0.8); return d < 0.1 ? '#b8b8c0' : r < 0.32 ? ['#e8f4ff', 2] : r < 0.42 ? '#6a6a74' : r < 0.5 ? ['#cfe8ff', 2] : '#9a9aa4'; } });
  } },
});

// ------------------------------------------------------------------ tela do jogo (close) e moeda
function telaJogo(modo) {
  const p = new Pix(96, 64);
  p.ret(0, 0, 96, 60, '#2a2a36'); p.ret(40, 60, 16, 3, '#3a3a46'); p.ret(30, 62, 36, 2, '#2a2a36');   // monitor e pé
  const t = (x, y, c) => { if (x >= 3 && x < 93 && y >= 3 && y < 56) p.set(x, y, c); };
  for (let y = 3; y < 56; y++) for (let x = 3; x < 93; x++) {
    const chao = y >= 32, r = Math.hypot(((x / 3) % 1) - 0.5, ((y / 3) % 1) - 0.5);
    t(x, y, !chao ? (y < 18 ? '#6ab8f0' : '#9ad4f8') : (x % 12 === 0 || y % 8 === 0) ? '#8e8e96' : r < 0.2 ? '#c0c0c6' : '#a8a8ae');   // céu e baseplate
  }
  for (const [bx, by, w, h, c] of [[8, 26, 10, 6, '#e84a4a'], [18, 20, 8, 12, '#4a8ae8'], [62, 24, 12, 8, '#f8d84a'], [76, 28, 10, 4, '#ff4a5a']]) { p.ret(bx, by, w, h, c); p.ret(bx, by, w, 1, '#ffffff'); p.ret(bx + w - 1, by, 1, h, '#00000040'.slice(0, 7)); }
  for (const [ax, c, ca] of [[38, '#d83a3a', '#2a2a36'], [48, '#f8c82c', '#4a6ab0'], [57, '#8a4ac8', '#6a6a78']]) {   // avatares de bloco na tela
    p.ret(ax + 1, 30, 4, 4, '#f4d0a8'); p.ret(ax, 34, 6, 5, c); p.ret(ax - 1, 34, 1, 5, c); p.ret(ax + 6, 34, 1, 5, c); p.ret(ax, 39, 6, 4, ca);
    p.set(ax + 2, 31, K); p.set(ax + 3, 31, K); p.ret(ax + 2, 33, 2, 1, K);
  }
  p.ret(3, 3, 90, 4, '#1a1a26'); for (const x of [5, 9, 13]) p.ret(x, 4, 2, 2, '#f4f4f4');                  // barra de cima com botões
  const caixa = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if ((x + y) % 2 === 0 || y === y0 || y === y0 + h - 1) t(x, y, '#1a1a26'); };
  caixa(5, 9, 34, modo === 'jogando' ? 10 : 16);                                                              // chat (canto esquerdo)
  const linhas = modo === 'jogando' ? [[11, 20, '#f4f4f4'], [15, 14, '#f8e060']] : [[11, 20, '#f4f4f4'], [15, 14, '#f8e060'], [19, 26, '#f4f4f4'], [23, 30, '#ff6a6a']];
  for (const [y, w, c] of linhas) { for (let x = 7; x < 11; x++) t(x, y, '#7ad0ff'); for (let x = 12; x < 12 + w; x++) if (x % 4) t(x, y, c); }
  caixa(68, 9, 23, 22);                                                                                       // lista de jogadores (direita)
  for (let k = 0; k < 4; k++) { t(70, 12 + k * 5, ['#d83a3a', '#f8c82c', '#8a4ac8', '#22222c'][k]); for (let x = 73; x < 86 - k * 2; x++) if (x % 3) t(x, 12 + k * 5, '#f4f4f4'); }
  if (modo === 'erro') {   // janela de erro no meio
    p.ret(28, 18, 40, 22, '#f4f4f4'); p.ret(28, 18, 40, 4, '#d83a3a'); p.ret(46, 25, 4, 8, '#d83a3a'); p.ret(46, 35, 4, 2, '#d83a3a');
    for (let x = 30; x < 66; x += 2) p.set(x, 38, '#8a8a9a');
  }
  return p.contorno(K);
}
function moeda(k) {
  const p = new Pix(10, 10), larg = [8, 6, 2, 6][k];
  const x0 = Math.round(5 - larg / 2);
  p.ret(x0, 1, larg, 8, '#f8c82c'); p.ret(x0, 1, larg, 1, '#fff0a0'); p.ret(x0 + larg - 1, 2, 1, 7, '#c8961a');
  if (larg >= 6) for (const [x, y] of [[5, 3], [4, 4], [5, 4], [6, 4], [5, 5], [4, 6], [6, 6]]) p.set(x, y, '#fff8d0');
  return p.contorno(K);
}

// PROTÓTIPO — estados novos da tela (vídeos de Roblox):
//   socorro (2 quadros, batendo): um avatar em close, com as mãos espalmadas no vidro, chorando; marcas de mão e o vidro rachando.
//   chat-nao-sai: o chat aberto no meio, quatro jogadores mandando NÃO SAI (em vermelho). chat-banho: VAI TOMAR / BANHO!
//   pausado: a imagem do jogo apagada, cinza, com o símbolo de pausa grande no meio.
const escreve = (p, t, x, y, cor) => desenharTexto({ fillStyle: cor, fillRect(px, py, w, h) { p.ret(Math.round(px), Math.round(py), w, h, this.fillStyle); } }, t, x, y, cor);
function telaSocorro(k) {
  const p = telaJogo('jogando');
  const t = (x, y, c) => { if (x >= 3 && x < 93 && y >= 3 && y < 56) p.set(x, y, c); };
  for (let y = 7; y < 56; y++) for (let x = 3; x < 93; x++) if ((x + y) % 3 === 0) t(x, y, '#3a3a4a');   // escurece o fundo
  const dy = k ? 1 : 0, cx = 48;
  // cabeça grande do avatar (rosto colado no vidro)
  const pele = '#ecc8b0', pele2 = '#d0a890', cab = '#e0602a';
  for (let y = 14; y < 46; y++) for (let x = cx - 16; x < cx + 16; x++) { const cant = (y < 17 || y > 42) && (x < cx - 13 || x > cx + 12); if (!cant) t(x, y + dy, x > cx + 12 ? pele2 : pele); }
  for (let y = 10; y < 19; y++) for (let x = cx - 16; x < cx + 16; x++) if (y < 14 || x < cx - 10 || x > cx + 8) t(x, y + dy, cab);   // topete
  for (let x = cx - 16; x < cx + 16; x++) t(x, 10 + dy, '#f08a4a');
  // olhos arregalados com lágrimas escorrendo
  for (const ox of [cx - 9, cx + 4]) {
    for (let x = ox - 1; x < ox + 7; x++) { t(x, 21 + dy, '#a87868'); t(x, 29 + dy, '#b88878'); }   // olheiras
    for (let y = 22; y < 29; y++) for (let x = ox; x < ox + 6; x++) t(x, y + dy, '#ffffff');
    for (let y = 24; y < 28; y++) for (let x = ox + 2; x < ox + 4; x++) t(x, y + dy, K);
    for (let y = 29; y < 36 + k * 3; y++) t(ox + (ox < cx ? 0 : 5), y + dy, y % 2 ? '#9ad8ff' : '#5aa8e8');
  }
  // boca aberta gritando
  for (let y = 34; y < 42; y++) for (let x = cx - 5; x < cx + 5; x++) t(x, y + dy, y < 35 || y > 40 || x === cx - 5 || x === cx + 4 ? '#5a2020' : '#2a0c10');
  for (let x = cx - 3; x < cx + 3; x++) t(x, 40 + dy, '#c84a5a');
  // braços de bloco saindo de baixo e mãos grandes espalmadas no vidro (batendo: uma sobe enquanto a outra desce)
  for (const [hx, lado] of [[cx - 37, -1], [cx + 22, 1]]) {
    const hy = 12 + (k ? (lado < 0 ? -2 : 3) : (lado < 0 ? 3 : -2)), camisa = '#2a8a7a';
    for (let y = hy + 16; y < 56; y++) for (let x = hx + 2; x < hx + 13; x++) t(x, y, x === hx + 12 ? '#1e6a5e' : camisa);   // braço
    for (let y = hy; y < hy + 17; y++) for (let x = hx; x < hx + 15; x++) t(x, y, (x === hx || x === hx + 14 || y === hy) ? '#b8886a' : '#f8d8b8');
    for (const fx of [3, 7, 11]) for (let y = hy; y < hy + 7; y++) t(hx + fx, y, '#b8886a');   // vãos entre os dedos
    for (let y = hy + 9; y < hy + 15; y++) for (let x = hx + 3; x < hx + 12; x++) if ((x + y) % 2) t(x, y, '#ffffff');   // palma amassada no vidro (clarão)
  }
  // marcas de mão de batidas antigas (embaçadas) e rachaduras grossas saindo das mãos (maiores no 2º quadro)
  for (const [mx0, my0] of [[cx - 22, 44], [cx + 14, 6], [cx - 40, 40]]) for (let y = my0; y < my0 + 8; y++) for (let x = mx0; x < mx0 + 7; x++) if ((x * 3 + y) % 4 === 0) t(x, y, '#e8f0ff');
  const rach = [[cx - 30, 10, -1, -1], [cx - 38, 26, -1, 1], [cx + 36, 8, 1, -1], [cx + 37, 30, 1, 1], [cx, 8, 1, -1], [cx - 4, 50, -1, 1]];
  rach.forEach(([x, y, ddx, ddy], n) => { const L = (k ? 16 : 9) - (n > 3 ? 4 : 0); let X = x, Y = y;
    for (let i = 0; i < L; i++) { t(X, Y, '#ffffff'); t(X + 1, Y, '#b8d8f0'); if (i === 5) { let X2 = X, Y2 = Y; for (let j = 0; j < 5; j++) { X2 -= ddx || 1; Y2 += ddy; t(X2, Y2, '#e8f4ff'); } } X += ddx || (i % 2 ? 1 : -1); Y += i % 2 ? ddy : 0; } });
  for (let i = 0; i < 6; i++) t(10 + i * 14 + k * 3, 50 - (i % 2) * 2, '#f4f4f4a0'.slice(0, 7));
  return p;
}
function telaChat(linhas) {
  const p = telaJogo('chat');
  const t = (x, y, c) => { if (x >= 3 && x < 93 && y >= 3 && y < 56) p.set(x, y, c); };
  for (let y = 9; y < 53; y++) for (let x = 5; x < 91; x++) t(x, y, (x + y) % 2 || y === 9 || y === 52 ? '#14121c' : '#24222e');
  linhas.forEach(([cor, txt, corTxt], n) => {
    const y = 12 + n * 10;
    for (let yy = y; yy < y + 7; yy++) for (let xx = 8; xx < 13; xx++) t(xx, yy, cor);       // quadradinho do jogador
    t(9, y + 1, '#ffffff');
    escreve(p, txt, 16, y, corTxt);
  });
  return p;
}
function telaPausada() {
  const p = telaJogo('jogando');
  for (let y = 3; y < 56; y++) for (let x = 3; x < 93; x++) {
    const i = (y * p.w + x) * 4, v = Math.round((p.d[i] * 0.3 + p.d[i + 1] * 0.59 + p.d[i + 2] * 0.11) * 0.55);
    p.d[i] = p.d[i + 1] = p.d[i + 2] = v;
  }
  for (const x of [38, 52]) { p.ret(x - 1, 15, 8, 26, '#14121c'); p.ret(x, 16, 6, 24, '#f4f4f4'); p.ret(x, 16, 6, 1, '#ffffff'); }
  return p;
}
// ícone de pausa (flutua em cima de quem congelou; use "sobre")
function iconePausa(k) {
  const p = new Pix(12, 12);
  p.ret(1, 1, 10, 10, k ? '#2a2a36' : '#14121c');
  for (const x of [3, 7]) p.ret(x, 3, 2, 6, '#f4f4f4');
  return p.contorno('#f4f4f4');
}
const texJogo = () => {
  const fr = [telaJogo('jogando'), telaJogo('chat'), telaJogo('erro'), telaSocorro(0), telaSocorro(1),
    telaChat([['#d83a3a', 'NÃO SAI', '#ff4a5a'], ['#f8c82c', 'NÃO SAI', '#ff4a5a'], ['#8a4ac8', 'NÃO SAI', '#ff4a5a'], ['#2a8a7a', 'NÃO SAI', '#ff4a5a']]),
    telaChat([['#2a8a7a', 'GG', '#f4f4f4'], ['#8a4ac8', 'VAI TOMAR', '#f8e060'], ['#8a4ac8', 'BANHO!', '#f8e060']]),
    telaPausada().contorno(K)];
  return { quadros: fr, anims: { parado: { q: [0] }, jogando: { q: [0] }, chat: { q: [1] }, erro: { q: [2] }, socorro: { q: [3, 4], fps: 6 },
    'chat-nao-sai': { q: [5] }, 'chat-banho': { q: [6] }, pausado: { q: [7] } }, sombra: false };
};

registrarSprites({
  ...Object.fromEntries(Object.entries(AVATARES).map(([k, c]) => [k, () => spriteAvatar(c)])),
  'cubo-grama': () => iso({ parado: { tipo: 'cubo-grama' } }), 'cubo-terra': () => iso({ parado: { tipo: 'cubo-terra' } }),
  'cubo-pedra': () => iso({ parado: { tipo: 'cubo-pedra' } }), 'cubo-madeira': () => iso({ parado: { tipo: 'cubo-madeira' } }),
  'cubo-lava': () => iso({ parado: { tipo: 'cubo-lava' } }), 'cubo-xadrez': () => iso({ parado: { tipo: 'cubo-xadrez' } }),
  'plataforma-spawn': () => iso({ parado: { tipo: 'plataforma-spawn' } }),
  'peca-vermelha': () => iso({ parado: { tipo: 'peca-vermelha' } }),
  'peca-azul': () => iso({ parado: { tipo: 'peca-azul' } }),
  'peca-amarela': () => iso({ parado: { tipo: 'peca-amarela' } }),
  'peca-verde': () => iso({ parado: { tipo: 'peca-verde' } }),
  'placa-azul': () => iso({ parado: { tipo: 'placa-azul' } }),
  'placa-amarela': () => iso({ parado: { tipo: 'placa-amarela' } }),
  'bloco-neon': () => iso({ parado: { tipo: 'bloco-neon' } }),
  'trelica': () => iso({ parado: { tipo: 'trelica' } }),
  'tela-jogo': texJogo,
  'icone-pausa': () => ({ quadros: [iconePausa(0), iconePausa(1)], anims: { parado: { q: [0, 1], fps: 2 } }, sombra: false, flutua: true }),
  'moeda-bloco': () => ({ quadros: [0, 1, 2, 3].map(moeda), anims: { parado: { q: [0, 1, 2, 3], fps: 8 } }, sombra: true, flutua: true }),
}, { grupo: 'Jogo de blocos (vídeos sobre Roblox)', status: 'protótipo' });
