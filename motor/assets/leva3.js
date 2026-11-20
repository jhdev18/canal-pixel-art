// PROTÓTIPOS (aguardando aprovação) — leva 3 dos vídeos "Nesse Mundo":
//   cachorros de estimação (6 variações, de frente, andam), vulto (silhueta em pé para terror),
//   pão e saquinho de pimenta.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const K = '#0a0a12';

// ---------------------------------------------------------------- cachorros de estimação
// Mesmo estilo RPG do cao-guarda (contorno preto, poucas cores), mas sem uniforme: orelhas caídas, focinho claro,
// coleira com plaquinha. Só a metade esquerda é desenhada; a direita é espelhada.
const espelhar = (linhas) => linhas.map((h) => { const m = h.padEnd(10, '.').slice(0, 10); return m + [...m].reverse().join(''); });
const TOPO_CAO = [
  '..kk......', '.kCCk.....', '.kCCCkkkkk', '.kCCkccccc', '.kCkcccccc', '..kccceccc',
  '..kcccccww', '...kccwwnn', '...kcwwwww', '....kkwwwp', '.....kkkkk', '....kLLLLL',
  '...kcccccc', '..kccccccc', '..kccwwwww', '..kccwwwww', '..kkcccccc',
];
const PERNAS_CAO = {
  parado: ['...kcck......kcck...', '...kkkk......kkkk...'],
  passoA: ['....kcck.....kcck...', '....kkkk......kkk...'],
  passoB: ['...kcck.....kcck....', '...kkk......kkkk....'],
};
function cachorro(cores, { mancha = false, coleira = true } = {}) {
  const pal = { k: K, e: K, p: '#e8708a', y: '#f8d040', ...cores };
  if (!coleira) pal.L = pal.c;
  const corpo = espelhar(TOPO_CAO).map((l) => [...l]);
  if (coleira) { corpo[11][9] = 'y'; corpo[11][10] = 'y'; }
  if (mancha) for (const [x, y] of [[4, 13], [5, 13], [4, 14], [14, 4], [15, 4], [15, 5]]) corpo[y][x] = 'C';
  const linhas = corpo.map((l) => l.join(''));
  const q = (pernas, fechado = false) => Pix.deAscii([...linhas, ...pernas], fechado ? { ...pal, e: pal.c } : pal);
  return {
    quadros: [q(PERNAS_CAO.parado), q(PERNAS_CAO.parado, true), q(PERNAS_CAO.passoA), q(PERNAS_CAO.passoB)],
    anims: { parado: { q: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], fps: 5 }, andando: { q: [2, 0, 3, 0], fps: 6 }, correndo: { q: [2, 0, 3, 0], fps: 10 }, pulando: { q: [2], fps: 1 } },
    sombra: true, personagem: true,
  };
}
export const CACHORROS = {
  'cachorro-caramelo': [{ c: '#d89a50', C: '#9a5a24', w: '#f4e4c8', n: K, L: '#d83a3a' }],
  'cachorro-preto': [{ c: '#3e3846', C: '#24202c', w: '#8a8090', n: '#14101a', L: '#3a8ad8', e: '#f8f0d0' }],
  'cachorro-branco': [{ c: '#f0ece4', C: '#c8a070', w: '#ffffff', n: K, L: '#40b060' }, { mancha: true }],
  'cachorro-cinza': [{ c: '#9aa0ac', C: '#5a606c', w: '#d8dce4', n: K, L: '#f0c030' }],
  'cachorro-chique': [{ c: '#f4d0e4', C: '#d890b8', w: '#fff0f8', n: K, L: '#a040c0' }],   // o cão do prefeito
  'vira-lata': [{ c: '#b08a5a', C: '#6a4a2a', w: '#d8c8a8', n: K }, { mancha: true, coleira: false }],  // sem dono
};

// ---------------------------------------------------------------- vulto (terror)
// Silhueta alta e magra, em pé, quase preta; braços compridos; os pés somem em pontilhado.
// Estados: parado (sem rosto) e olhos (dois pontinhos pálidos).
function vulto(olhos) {
  const W = 24, H = 56, p = new Pix(W, H);
  const base = '#0c0a14', borda = '#1e1a2c';
  p.elipse(12, 7, 3.8, 4.8, base);
  p.ret(11, 11, 3, 3, base);
  for (let y = 13; y < 38; y++) {                       // tronco: ombros largos que afinam até a cintura
    const meia = y < 16 ? 3 + (y - 13) * 1.4 : 7.2 - (y - 16) * 0.12;
    for (let x = Math.round(12 - meia); x <= Math.round(11 + meia); x++) p.set(x, y, base);
  }
  for (let y = 16; y < 44; y++) {                       // braços compridos, um pouco abertos
    const a = (y - 16) * 0.06;
    p.set(Math.round(4 - a), y, base); p.set(Math.round(5 - a), y, base);
    p.set(Math.round(19 + a), y, base); p.set(Math.round(20 + a), y, base);
  }
  for (let y = 38; y < H; y++) { p.ret(8, y, 3, 1, base); p.ret(13, y, 3, 1, base); }   // pernas
  for (let y = 0; y < H; y++) for (let x = 1; x < W; x++) if (p.opaco(x, y) && !p.opaco(x - 1, y)) p.set(x, y, borda);   // luz fraca na borda
  if (olhos) { p.set(10, 7, '#cfd4f0'); p.set(14, 7, '#cfd4f0'); }
  for (let y = 48; y < H; y++) for (let x = 0; x < W; x++) if ((x + y) % (y > 52 ? 2 : 3) === 0) p.d[(y * W + x) * 4 + 3] = 0;
  return p;
}

// ---------------------------------------------------------------- objetos
function pao() {   // pão francês
  const p = new Pix(14, 7);
  p.elipse(7, 3.5, 6.5, 3, (x, y, dx, dy) => Pix.tom(['#a8602a', '#d8903e', '#f0b860'], 0.75 - dy * 0.6 - dx * 0.15, x, y));
  for (const x of [4, 7, 10]) { p.set(x, 2, '#f8e0a8'); p.set(x + 1, 3, '#f8e0a8'); }
  return p.contorno('#4a2a10');
}
function saquinho(aberto) {   // saquinho de papel com pimenta
  const p = new Pix(10, 12);
  p.ret(2, 4, 6, 7, '#d8b888'); p.ret(2, 10, 6, 1, '#b8946a'); p.ret(7, 4, 1, 7, '#b8946a');
  p.ret(3, 6, 4, 3, '#d83a2a'); p.set(4, 7, '#f8e0d0'); p.set(5, 7, '#f8e0d0');   // rótulo vermelho
  if (aberto) { p.ret(2, 3, 6, 1, '#b8946a'); for (const [x, y] of [[4, 1], [6, 0], [3, 0], [5, 2], [7, 1]]) p.set(x, y, (x + y) % 2 ? '#5a2a1a' : '#2a1a14'); }
  else { p.ret(3, 2, 4, 2, '#d8b888'); p.ret(4, 1, 2, 1, '#c83030'); }   // boca amarrada com fitinha
  return p.contorno('#4a3220');
}

// banco de praça VISTO DE FRENTE (mesmo ângulo dos personagens sentados "de frente"): encosto de 2 ripas, assento a
// 12 px do chão (como as poses sentadas), pés e braços de ferro. 48 px = 3 lugares. Use "z" um pouco atrás de quem senta.
function bancoFrente() {
  const W = 50, H = 28, p = new Pix(W, H), M = ['#d8a068', '#b07a44', '#7a4e2a'], F = '#2e2e3a', F2 = '#4a4a5a';
  for (const y0 of [3, 9]) { p.ret(3, y0, 44, 4, M[1]); p.ret(3, y0, 44, 1, M[0]); p.ret(3, y0 + 3, 44, 1, M[2]); }   // ripas do encosto
  for (const x of [6, 43]) p.ret(x, 2, 2, 13, F);                                                                    // suportes do encosto
  p.ret(2, 15, 46, 2, M[0]); p.ret(2, 17, 46, 2, M[1]); p.ret(2, 19, 46, 1, M[2]);                                    // assento: topo a 12 px do chão
  for (let x = 2; x < 48; x += 6) p.set(x, 17, M[2]);
  for (const x of [4, 44]) { p.ret(x, 20, 2, 8, F); p.set(x, 20, F2); }                                              // pés
  for (const x of [1, 47]) { p.ret(x, 11, 2, 9, F); p.ret(x - 1, 11, 4, 1, F2); }                                     // braços
  return p.contorno('#3a2416');
}

// alma (espirro: as almas trocam de corpo): bolinha luminosa com rostinho e cauda ondulada. Estados azul e rosa.
function alma(cores) {
  const p = new Pix(12, 15), [cl, cb, cs] = cores;
  for (let y = 8; y < 15; y++) { const w = Math.max(0, 3 - (y - 8) * 0.45), cx = 6 + Math.round(Math.sin(y * 0.9) * 1.2); for (let x = Math.round(cx - w); x <= cx + w; x++) p.set(x, y, y > 11 ? cs : cb); }
  p.elipse(6, 5, 4.4, 4.4, (x, y, dx, dy) => Pix.tom([cs, cb, cl], 0.8 - dx * 0.25 - dy * 0.4, x, y));
  p.set(4, 5, '#2a2a4a'); p.set(8, 5, '#2a2a4a'); p.set(4, 4, '#ffffff'); p.set(8, 4, '#ffffff'); p.set(6, 7, '#5a5a8a');
  for (let y = 13; y < 15; y++) for (let x = 0; x < 12; x++) if ((x + y) % 2) p.d[(y * 12 + x) * 4 + 3] = 0;
  return p.contorno(cs);
}

const est = (pares) => {   // { estado: Pix } → sprite com estados (anims)
  const quadros = [], anims = {};
  for (const [k, q] of Object.entries(pares)) { anims[k] = { q: [quadros.length], fps: 1 }; quadros.push(q); }
  return { quadros, anims };
};

registrarSprites(Object.fromEntries(Object.entries(CACHORROS).map(([k, [c, op]]) => [k, () => cachorro(c, op)])), { grupo: 'Cachorros (leva 3)', status: 'protótipo' });
registrarSprites({
  vulto: () => ({ ...est({ parado: vulto(false), olhos: vulto(true) }), sombra: false }),
  pao: () => est({ parado: pao() }),
  alma: () => ({ ...est({ azul: alma(['#e8f6ff', '#a8d8ff', '#5a9ae0']), rosa: alma(['#fff0f8', '#ffb8dc', '#e070a8']) }), sombra: false, flutua: true, brilho: null }),
  'banco-frente': () => ({ ...est({ parado: bancoFrente() }), sombra: true }),
  'saquinho-pimenta': () => est({ parado: saquinho(false), fechado: saquinho(false), aberto: saquinho(true) }),
}, { grupo: 'Terror e objetos (leva 3)', status: 'protótipo' });
