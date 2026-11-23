// Personagens no estilo RPG indie (vista de frente, contorno preto grosso, poucas cores,
// olhos de ponto). Personagens ORIGINAIS — tema cidade.
// Desenho: só a metade esquerda (10 colunas) é escrita; a direita é espelhada.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const K = '#0a0a12';
const LARG = 10;

const espelhar = (metades) => metades.map((h) => { const m = h.padEnd(LARG, '.').slice(0, LARG); return m + [...m].reverse().join(''); });
const inverter = (linhas) => linhas.map((l) => [...l].reverse().join(''));

function aplicar(linhas, extras) {
  const r = linhas.map((l) => [...l]);
  for (const [x, y, c] of extras) if (r[y]) r[y][x] = c;
  return r.map((l) => l.join(''));
}

// topo: metades esquerdas; pernas: { parado: [linhas inteiras], passo: [linhas inteiras] }
// 'e' = olho (some ao piscar, vira a cor `piscar`)
function rpg({ topo, pernas, cores, piscar, extras = [], extrasPasso = null }) {
  const corpo = aplicar(espelhar(topo), extras);
  const c = { k: K, e: K, ...cores };
  const fechado = { ...c, e: c[piscar] };
  const q = (linhas, paleta = c) => Pix.deAscii(linhas, paleta);
  const passo = pernas.passo || pernas.parado;
  const passoB = pernas.passoB || inverter(passo);
  const corpoB = extrasPasso ? aplicar(espelhar(topo), extrasPasso) : corpo;
  return {
    quadros: [q([...corpo, ...pernas.parado]), q([...corpo, ...pernas.parado], fechado), q([...corpo, ...passo]), q([...corpoB, ...passoB])],
    anims: {
      parado: { q: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], fps: 5 },
      andando: { q: [2, 0, 3, 0], fps: 6 },
      correndo: { q: [2, 0, 3, 0], fps: 10 },
      pulando: { q: [2], fps: 1 },
    },
    sombra: true, personagem: true,
  };
}

// ---------- menina da capa de chuva ----------
const meninaCapa = (cores = {}) => rpg({
  cores: { y: '#f8c820', Y: '#c89010', h: '#4a2818', s: '#f8d0a8', b: '#d03838', B: '#8a2020', ...cores },
  piscar: 's',
  topo: [
    '......kkkk', '....kkyyyy', '...kyyyyyy', '..kyyyyyyy', '..kyyhhhhh', '.kyyhhhhhh',
    '.kyyhhssss', '.kyyhsesss', '.kyyhsesss', '.kyyhsssss', '..kyyhssss', '..kkyyssss',
    '.kYkkyyyyy', 'kYyyyyyyyk', 'kYyyyyyyyy', 'kYyyyyyyyk', 'ksYyyyyyyy', 'ksYyyyyyyy',
    '.kYYyyyyyy', '.kkkkkkkkk',
  ],
  pernas: {
    parado: ['....kssk....kssk....', '....kssk....kssk....', '...kbbbBk..kBbbbk...', '...kbbbBk..kBbbbk...', '...kkkkkk..kkkkkk...'],
    passo: ['....kssk....kssk....', '...kbbbBk...kssk....', '...kbbbBk..kBbbbk...', '...kkkkkk..kBbbbk...', '...........kkkkkk...'],
  },
});

// ---------- robô semáforo (a luz acesa é o rosto) ----------
const roboSemaforo = (cores = {}) => rpg({
  cores: { g: '#34343f', G: '#5a5a6a', r: '#4a1818', a: '#4a3e10', v: '#3ee060', V: '#c0ffc0', m: '#22222a', ...cores },
  piscar: 'v',
  topo: [
    '.........k', '........kV', '.........k', '....kkkkkk', '...kGGGGGG', '...kGggggg',
    '...kGggrrr', '...kGgrrrr', '...kGgrrrr', '...kGggrrr', '...kGggggg', '...kGggaaa',
    '...kGgaaaa', '...kGgaaaa', '...kGggaaa', '...kGggggg', '...kGggvvv', '...kGgvVev',
    '...kGgvvvv', '...kGggvvv', '.kkkGggggg', 'kGGkGggggg', 'kGGkkkkkkk', '.kk.......',
  ],
  pernas: {
    parado: ['......kmk..kmk......', '......kmk..kmk......', '.....kGGGkkGGGk.....', '.....kkkkkkkkkk.....'],
    passo: ['......kmk..kmk......', '.....kGGGk.kmk......', '.....kkkkkkGGGk.....', '..........kkkkk.....'],
  },
});

// ---------- pombo fofoqueiro de cachecol ----------
const pomboFofoqueiro = (cores = {}) => rpg({
  cores: { p: '#9a9ab4', P: '#64647e', w: '#e8e8f4', n: '#4a9a8a', o: '#f0a030', s: '#d84848', S: '#902828', ...cores },
  piscar: 'p',
  topo: [
    '......kkkk', '.....kpppp', '....kppppp', '....kpwepp', '....kppppo', '....knnnnn',
    '...kssssss', '...kSsssss', '..kpppSSpw', '.kPpppppww', '.kPppppwww', '.kPPpppwww',
    '..kPPppppw', '...kkPpppp', '.....kkkkk',
  ],
  extras: [[12, 7, 'S'], [12, 8, 'S'], [13, 8, 's'], [13, 9, 's'], [12, 9, 'S']],
  pernas: {
    parado: ['.......kok..kok.....', '......kooo..oook....'],
    passo: ['.......kok..kok.....', '......kooo..........'],
    passoB: ['.......kok..kok.....', '............oook....'],
  },
});

// ---------- lixeira tímida (olha por baixo da tampa) ----------
const lixeiraTimida = (cores = {}) => rpg({
  cores: { m: '#4a8a9a', M: '#2a5a6a', l: '#8acad8', w: '#ffffff', ...cores },
  piscar: 'k',
  topo: [
    '........kk', '...kkkkkkk', '..klllllll', '.kmmmmmmmm', '.kkkkkkkkk', '..........',
    '...kkkkkkk', '...kkwekkk', '...kkkkkkk', '..kkkkkkkk', '..kmlmmlmm', '..kmlmmlmm',
    '..kmlmmlmm', '..kmlmmlmm', '..kMlmmlmm', '..kMMlMMlM', '...kMMMMMM', '...kkkkkkk',
  ],
  extrasPasso: [],
  pernas: { parado: [], passo: [] },
});

// ---------- cão guarda de trânsito ----------
const caoGuarda = (cores = {}) => rpg({
  cores: { c: '#d8a060', C: '#9a6630', w: '#f4ead8', u: '#2a3a6a', U: '#4a64a8', y: '#f8d040', ...cores },
  piscar: 'c',
  topo: [
    '....kkkkkk', '...kuuuuuu', '..kuuuuuuy', '..kkkkkkkk', '.kCkcccccc', '.kCkccectc'.replace('t', 'c'),
    '.kCkccccww', '..kkcccwwk', '...kcccwww', '....kkkkkk', '...kuuuuuu', '..kuuUuuuu',
    '.kcuuUuuuu', '.kcuuUuuuu', '..kuuuuuuu', '..kkkkkkkk',
  ],
  extras: [[12, 11, 'y'], [13, 11, 'y'], [13, 12, 'k']],
  pernas: {
    parado: ['....kuuk....kuuk....', '....kuuk....kuuk....', '...kkkkk....kkkkk...'],
    passo: ['....kuuk....kuuk....', '...kkkkk....kuuk....', '............kkkkk...'],
  },
});

// ---------- fantasma do metrô ----------
const fantasmaMetro = (cores = {}) => rpg({
  cores: { w: '#f0f0fa', W: '#b4b4d0', t: '#f8e080', T: '#c8a840', ...cores },
  piscar: 'w',
  topo: [
    '......kkkk', '....kkwwww', '...kwwwwww', '..kwwwwwww', '..kwwwwwww', '..kwweewww',
    '..kwweewww', '.kwwwwwwww', '.kwwwwwwww', '.kWwwwwwww', '.kWwwwwwww', 'kWwwwwwwww',
    'kWWwwwwwww', 'kWWWwwwWww',
  ],
  extras: [[14, 9, 'k'], [15, 9, 'k'], [16, 9, 'k'], [17, 9, 'k'], [14, 10, 't'], [15, 10, 'T'], [16, 10, 't'], [17, 10, 'k'], [14, 11, 't'], [15, 11, 't'], [16, 11, 'T'], [17, 11, 'k'], [14, 12, 'k'], [15, 12, 'k'], [16, 12, 'k']],
  pernas: {
    parado: ['kWkkWWkkWWWWkkWWkkWk', 'k..kk..kk..kk..kk..k'.replace(/^k/, '.').replace(/k$/, '.')],
    passo: ['kkWWkkWWkkWWkkWWkkWk', '.kk..kk..kk..kk..kk.'],
    passoB: ['kWkkWWkkWWWWkkWWkkWk', '...kk..kk..kk..kk...'],
  },
});

// ---------- coruja da banca de jornal ----------
const corujaBanca = (cores = {}) => rpg({
  cores: { o: '#8a6a4a', O: '#5a4030', w: '#eadcc0', y: '#f8c040', q: '#f09030', b: '#7a3a5a', B: '#5a2a40', p: '#f4ecd8', ...cores },
  piscar: 'y',
  topo: [
    '..kk......', '..kOkkkkkk', '..kOoooooo', '.koooooooo', '.koowwwwww', '.kowkkkwww',
    '.kowyeykww', '.kowkkkwww', '.koowwwwwq', '..kooowwwq', '..kkoooooo', '.kbbkkkkkk',
    '.kbBbbbbbb', '.kbBbpppkp', '.kobBpppkp', '.kobBppppp', '..kbBbbbbb', '..kkkkkkkk',
  ],
  pernas: {
    parado: ['......kqk..kqk......', '.....kqqk..kqqk.....'],
    passo: ['......kqk..kqk......', '.....kqqk...........'],
    passoB: ['......kqk..kqk......', '...........kqqk.....'],
  },
});

// ---------- inimigos de "batalha" (branco sobre preto) ----------
function batalha(metades, nome) {
  const corpo = espelhar(metades);
  const c = { w: '#ffffff', k: '#000000', g: '#808080' };
  const q0 = Pix.deAscii(corpo, c);
  const q1 = Pix.deAscii(['....................', ...corpo.slice(0, -1)], c);
  return { nome, quadros: [q0, q1], anims: { parado: { q: [0, 1], fps: 3 } }, sombra: false };
}

const coneAgressivo = () => batalha([
  '........ww', '.......www', '.......www', '......wwww', '......gggg', '.....wkwww',
  '.....wwkww', '....wwwwww', '....gggggg', '...wwwwwww', '...wwwkkkk', '..wwwwkwkw',
  'wwwwwwwwww', 'wwwwwwwwww', '.ggggggggg',
]);

const bueiroOlhos = () => batalha([
  '...wwwwwww', '.wwkkkkkkk', 'wkkkkkkkkk', 'wkkwwkkkkk', 'wkwkwwkkkk', 'wkkwwkkkkk',
  'wkkkkkkkkk', 'wkwkwkwkwk', '.wwkkkkkkk', '...wwwwwww', '....g.g.g.', '.....g.g.g',
]);

registrarSprites({
  // versões antigas (simples); as detalhadas usam os nomes principais (sprites-detalhados.js)
  'menina-capa-antigo': (o) => meninaCapa(o.cores),
  'robo-semaforo-antigo': (o) => roboSemaforo(o.cores),
  'pombo-fofoqueiro': (o) => pomboFofoqueiro(o.cores),
  'lixeira-timida': (o) => lixeiraTimida(o.cores),
  'cao-guarda': (o) => caoGuarda(o.cores),
  'fantasma-metro': (o) => fantasmaMetro(o.cores),
  'coruja-banca': (o) => corujaBanca(o.cores),
  'cone-agressivo': () => coneAgressivo(),
  'bueiro-olhos': () => bueiroOlhos(),
}, { grupo: 'Personagens RPG (estilo indie)' });
