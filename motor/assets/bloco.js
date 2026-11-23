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
//   tela-jogo: monitor em close ("tela": true) com o mundo de cubos, avatares e o chat; estados jogando / chat / erro.
//   moeda-bloco: moedinha quadrada nossa (dourada, com estrela) que gira.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { MOVEIS } from '../cenarios/comodoDiagonal.js';
import { iso } from './praca.js';

const K = '#14121c', W = 26, H = 44;

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

// f: { braco: 'baixo' | 'alto' | 'aceno', passo: -1 | 0 | 1, pulo, rosto: 'normal' | 'liso' | 'sorriso' }
function avatar(c, f = {}) {
  // desenha com 4 px de folga em cima (rabo de cavalo, topete e braço levantado não cortam)
  const p0 = new Pix(W, H + 4), p = { set: (x, y, cor) => p0.set(x, y + 4, cor), ret: (x, y, w, h, cor) => p0.ret(x, y + 4, w, h, cor) };
  const passo = f.passo || 0, pulo = f.pulo ? -1 : 0;
  // pernas (uma sobe e a outra desce ao andar) e sapatos
  for (const [x, lado] of [[7, -1], [13, 1]]) {
    const d = passo === lado ? -2 : passo === -lado ? 1 : 0, y0 = 28 + pulo;
    bloco(p, x, y0, 6, 13 + d, c.calca); p.ret(x, y0 + 11 + d, 6, 2, c.sapato);
  }
  // tronco
  bloco(p, 6, 14 + pulo, 14, 14, c.camisa);
  const e = c.estampa, cx = 13, cy = 20 + pulo;
  if (e === 'listra') p.ret(6, cy, 13, 2, '#f4f4f4');
  if (e === 'coracao') for (const [x, y] of [[11, 0], [12, 0], [14, 0], [15, 0], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1], [12, 2], [13, 2], [14, 2], [13, 3]]) p.set(x, cy - 2 + y, '#f8a0c8');
  if (e === 'raio') for (const [x, y] of [[14, 0], [13, 1], [12, 2], [13, 2], [14, 2], [13, 3], [12, 4]]) p.set(x, cy - 2 + y, '#f8e060');
  if (e === 'estrela') for (const [x, y] of [[13, 0], [12, 1], [13, 1], [14, 1], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2], [12, 3], [14, 3]]) p.set(x, cy - 2 + y, '#f8f4e0');
  if (e === 'botoes') { for (const y of [16, 20, 24]) p.set(cx, y + pulo, '#8a6a20'); p.ret(cx, 14 + pulo, 1, 14, escuro(c.camisa, 0.2)); }
  if (e === 'emblema') { p.ret(11, cy - 1, 4, 3, '#f8d040'); p.ret(12, cy - 1, 2, 3, '#7a3ad0'); }
  if (e === 'cachecol') { p.ret(6, 14 + pulo, 14, 3, c.chapeuCor); p.ret(15, 17 + pulo, 3, 5, c.chapeuCor); }
  // braços
  const braco = (x, modo) => {
    if (modo === 'alto' || modo === 'aceno') { const dy = modo === 'aceno' ? -1 : 0; bloco(p, x, 3 + pulo + dy, 4, 12, c.camisa); p.ret(x, 2 + pulo + dy, 4, 3, c.pele); return; }
    const d = typeof modo === 'number' ? modo : 0;
    bloco(p, x, 14 + pulo + d, 4, 11, c.camisa); p.ret(x, 25 + pulo + d, 4, 3, c.pele);
  };
  braco(2, f.bracoE ?? 0);
  braco(20, f.braco ?? 0);
  // cabeça cúbica (com topo mais claro e lado mais escuro)
  const hy = 1 + pulo;
  bloco(p, 7, hy, 12, 12, c.pele); p.ret(7, hy + 11, 12, 1, escuro(c.pele, 0.15));
  // cabelo / chapéu
  const ch = c.chapeu, cor2 = c.chapeuCor;
  if (ch === 'bone') { p.ret(7, hy, 12, 3, cor2); p.ret(6, hy + 3, 9, 1, escuro(cor2, 0.2)); p.ret(15, hy + 3, 4, 1, c.cabelo); }
  if (ch === 'franja') { p.ret(7, hy, 12, 3, c.cabelo); p.ret(7, hy + 3, 4, 2, c.cabelo); p.ret(6, hy + 1, 1, 10, c.cabelo); p.ret(19, hy + 1, 1, 10, c.cabelo); }
  if (ch === 'fone') { p.ret(7, hy, 12, 2, c.cabelo); p.ret(7, hy - 1, 12, 1, cor2); p.ret(5, hy + 4, 2, 5, cor2); p.ret(19, hy + 4, 2, 5, cor2); }
  if (ch === 'liso') { p.ret(7, hy, 12, 3, c.cabelo); p.ret(7, hy + 3, 2, 3, c.cabelo); p.ret(17, hy + 3, 2, 3, c.cabelo); }
  if (ch === 'capuz-capa') { p.ret(6, hy - 1, 14, 3, cor2); p.ret(6, hy + 2, 2, 9, cor2); p.ret(18, hy + 2, 2, 9, cor2); p.ret(8, hy + 2, 10, 1, c.cabelo); p.ret(6, hy - 1, 14, 1, claro(cor2, 0.4)); }
  if (ch === 'rabo') { p.ret(7, hy, 12, 3, c.cabelo); p.ret(10, hy - 3, 6, 3, c.cabelo); p.ret(12, hy - 4, 2, 1, cor2); p.ret(15, hy - 2, 5, 2, c.cabelo); }
  if (ch === 'topete') { p.ret(7, hy, 12, 3, c.cabelo); p.ret(9, hy - 2, 7, 2, c.cabelo); p.ret(13, hy - 3, 3, 1, '#fff4e0'); }
  if (c.capuz) { p.ret(6, hy - 1, 14, 14, c.camisa); p.ret(6, hy - 1, 14, 1, '#3a3a46'); p.ret(8, hy + 3, 10, 8, '#08060c'); }   // capuz com o rosto no escuro
  // rosto pintado
  const rosto = f.rosto || 'normal';
  if (c.capuz) { if (rosto !== 'liso') { p.set(10, hy + 6, '#ff3a2a'); p.set(15, hy + 6, '#ff3a2a'); } }
  else if (rosto === 'normal') {
    for (const x of [10, 15]) { p.set(x, hy + 5, K); p.set(x, hy + 6, K); }
    for (const [x, y] of [[10, 8], [11, 9], [12, 9], [13, 9], [14, 9], [15, 8]]) p.set(x, hy + y, K);
  } else if (rosto === 'sorriso') {   // o sorriso pintado estica até as bordas, com dentinhos
    for (const x of [10, 15]) { p.set(x, hy + 4, K); p.set(x, hy + 5, K); }
    for (let x = 8; x <= 17; x++) { p.set(x, hy + 8 + (x === 8 || x === 17 ? -1 : 0), K); p.set(x, hy + 9, x % 2 ? '#f4f4f0' : K); }
    p.set(8, hy + 10, K); p.set(17, hy + 10, K); for (let x = 9; x <= 16; x++) p.set(x, hy + 10, K);
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
  const andar = (f0 = {}) => [-1, 0, 1, 0].map((s) => add({ ...f0, passo: s, bracoE: s, braco: -s }));
  const P = add({}), A = [add({ braco: 'alto' }), add({ braco: 'aceno' })], J = add({ pulo: true, braco: 'alto', bracoE: 'alto' });
  const L = add({ rosto: 'liso' }), S = add({ rosto: 'sorriso' });
  const AN = andar(), AL = andar({ rosto: 'liso' }), AS = andar({ rosto: 'sorriso' });
  const B = [0, 1, 2, 3].map((k) => { quadros.push(bugar(avatar(c, {}), k)); return quadros.length - 1; });
  const BA = [0, 1, 2, 3].map((k) => { quadros.push(bugar(avatar(c, { passo: [-1, 0, 1, 0][k] }), k)); return quadros.length - 1; });
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
const cubo = (topo, lado, frente, { brilho = false, xadrez = false, borda = null } = {}) => ({ di: 1, dj: 1, f(L, m) {
  const { i0, i1, j0, j1 } = m, cor = (c) => (brilho ? [c, 2] : c);
  L.caixa(i0, i1, j0, j1, 0, 16, {
    frente: (u, t) => (borda && t > 11 ? borda : (Math.floor(u * 4) + Math.floor(t / 4)) % 5 === 0 ? escuro(frente, 0.12) : t === 0 ? escuro(frente, 0.3) : cor(frente)),
    lado: (u, t) => (borda && t > 11 ? escuro(borda, 0.15) : (Math.floor(u * 4) + Math.floor(t / 4)) % 4 === 0 ? escuro(lado, 0.12) : cor(lado)),
    topo: (a, b, d) => (d < 0.06 ? escuro(topo, 0.25) : xadrez ? ((Math.floor(a * 4) + Math.floor(b * 4)) % 2 ? '#14121c' : '#f4f4f4') : (Math.floor(a * 4) * 3 + Math.floor(b * 4)) % 7 === 0 ? claro(topo, 0.15) : cor(topo)),
  });
} });
Object.assign(MOVEIS, {
  'cubo-grama': cubo('#5ac84a', '#8a5a34', '#a86a3e', { borda: '#4aa83a' }),
  'cubo-terra': cubo('#a86a3e', '#7a4a2a', '#8a5a34'),
  'cubo-pedra': cubo('#a8a8b0', '#7a7a84', '#8e8e98'),
  'cubo-madeira': cubo('#d8a060', '#9a6a3a', '#b07a48'),
  'cubo-lava': cubo('#ff8a2a', '#d84a1a', '#ff6a2a', { brilho: true }),
  'cubo-xadrez': cubo('#f4f4f4', '#3a3a44', '#5a5a64', { xadrez: true }),
  'plataforma-spawn': { di: 1.6, dj: 1.6, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 3, { frente: '#5a5a6a', lado: '#4a4a58', topo: (a, b, d) => (d < 0.12 ? '#8a8a9a' : Math.hypot(a - 0.8, b - 0.8) < 0.35 ? ['#7af0ff', 2] : Math.hypot(a - 0.8, b - 0.8) < 0.5 ? '#3a3a48' : '#6a6a7a') });
  } },
});

// ------------------------------------------------------------------ tela do jogo (close) e moeda
function telaJogo(modo) {
  const p = new Pix(96, 64);
  p.ret(0, 0, 96, 60, '#2a2a36'); p.ret(40, 60, 16, 3, '#3a3a46'); p.ret(30, 62, 36, 2, '#2a2a36');   // monitor e pé
  const tela = (x, y, c) => { if (x >= 3 && x < 93 && y >= 3 && y < 56) p.set(x, y, c); };
  for (let y = 3; y < 56; y++) for (let x = 3; x < 93; x++) tela(x, y, y < 30 ? (y < 16 ? '#7ac8f8' : '#a8dcfa') : ((Math.floor(x / 6) + Math.floor(y / 6)) % 2 ? '#5ac84a' : '#4ab83a'));
  for (const [bx, by, w, h, c] of [[10, 24, 12, 8, '#a8a8b0'], [26, 20, 8, 12, '#d8a060'], [60, 22, 14, 10, '#a8a8b0'], [78, 26, 8, 6, '#ff8a2a']]) { p.ret(bx, by, w, h, c); p.ret(bx, by, w, 1, '#ffffff'); }
  for (const [ax, c] of [[40, '#d83a3a'], [50, '#f8c82c'], [58, '#8a4ac8']]) { p.ret(ax, 30, 4, 4, '#f4d0a8'); p.ret(ax - 1, 34, 6, 5, c); p.ret(ax, 39, 4, 4, '#2a2a36'); }
  p.ret(3, 3, 90, 4, '#1a1a26'); for (let x = 5; x < 30; x += 3) p.set(x, 5, '#f4f4f4');               // barra de cima
  if (modo === 'chat' || modo === 'erro') {
    p.ret(5, 40, 40, 14, '#14121c'); for (const [y, w] of [[42, 30], [46, 22], [50, 34]]) for (let x = 7; x < 7 + w; x++) if (x % 4) p.set(x, y, y === 50 ? '#ff6a6a' : '#f4f4f4');
  }
  if (modo === 'erro') {   // janela de erro no meio da tela
    p.ret(28, 14, 40, 22, '#f4f4f4'); p.ret(28, 14, 40, 4, '#d83a3a'); p.ret(46, 21, 4, 8, '#d83a3a'); p.ret(46, 31, 4, 2, '#d83a3a');
    for (let x = 30; x < 66; x += 2) p.set(x, 34, '#8a8a9a');
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

registrarSprites({
  ...Object.fromEntries(Object.entries(AVATARES).map(([k, c]) => [k, () => spriteAvatar(c)])),
  'cubo-grama': () => iso({ parado: { tipo: 'cubo-grama' } }), 'cubo-terra': () => iso({ parado: { tipo: 'cubo-terra' } }),
  'cubo-pedra': () => iso({ parado: { tipo: 'cubo-pedra' } }), 'cubo-madeira': () => iso({ parado: { tipo: 'cubo-madeira' } }),
  'cubo-lava': () => iso({ parado: { tipo: 'cubo-lava' } }), 'cubo-xadrez': () => iso({ parado: { tipo: 'cubo-xadrez' } }),
  'plataforma-spawn': () => iso({ parado: { tipo: 'plataforma-spawn' } }),
  'tela-jogo': () => ({ quadros: [telaJogo('jogando'), telaJogo('chat'), telaJogo('erro')], anims: { parado: { q: [0] }, jogando: { q: [0] }, chat: { q: [1] }, erro: { q: [2] } }, sombra: false }),
  'moeda-bloco': () => ({ quadros: [0, 1, 2, 3].map(moeda), anims: { parado: { q: [0, 1, 2, 3], fps: 8 } }, sombra: true, flutua: true }),
}, { grupo: 'Jogo de blocos (vídeos sobre Roblox)', status: 'protótipo' });
