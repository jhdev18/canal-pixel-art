// Fonte bitmap 5x7 com acentos (PT-BR). Desenha em canvas 2D, pixel a pixel.

const G = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  ',': ['..', '..', '..', '..', '..', '.#', '.#', '#.'],
  '!': ['#', '#', '#', '#', '#', '.', '#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  ':': ['.', '#', '.', '.', '.', '#', '.'],
  ';': ['..', '.#', '..', '..', '..', '.#', '.#', '#.'],
  '-': ['....', '....', '....', '####', '....', '....', '....'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  "'": ['#', '#', '.', '.', '.', '.', '.'],
  '"': ['#.#', '#.#', '...', '...', '...', '...', '...'],
  '(': ['.#', '#.', '#.', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '.#.##', '#..##'],
  '*': ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....'],
  '=': ['....', '....', '####', '....', '####', '....', '....'],
  '#': ['.#.#.', '#####', '.#.#.', '.#.#.', '.#.#.', '#####', '.#.#.'],
  '♥': ['.#.#.', '#####', '#####', '#####', '.###.', '..#..', '.....'],
};

const ACENTOS = {
  agudo: ['...#.', '..#..'],
  grave: ['.#...', '..#..'],
  circ: ['..#..', '.#.#.'],
  til: ['.##.#', '#..#.'],
  trema: ['.#.#.', '.....'],
};
const COMPOSTOS = {
  'Á': ['A', 'agudo'], 'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ã': ['A', 'til'], 'Ä': ['A', 'trema'],
  'É': ['E', 'agudo'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'],
  'Í': ['I', 'agudo'], 'Ì': ['I', 'grave'], 'Î': ['I', 'circ'],
  'Ó': ['O', 'agudo'], 'Ò': ['O', 'grave'], 'Ô': ['O', 'circ'], 'Õ': ['O', 'til'], 'Ö': ['O', 'trema'],
  'Ú': ['U', 'agudo'], 'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ü': ['U', 'trema'],
  'Ñ': ['N', 'til'], 'Ç': ['C', 'cedilha'],
};

export const ALTURA_LINHA = 11; // 2 acento + 7 letra + 1 descendente + 1 espaço
const TOPO = 2; // linhas reservadas para acentos

// Retorna matriz de pixels (array de [x,y]) e largura do glifo.
const cache = new Map();
function glifo(ch) {
  if (cache.has(ch)) return cache.get(ch);
  let res;
  if (ch === ' ') res = { largura: 3, pixels: [] };
  else {
    let base = G[ch], acento = null;
    if (!base && COMPOSTOS[ch]) { base = G[COMPOSTOS[ch][0]]; acento = COMPOSTOS[ch][1]; }
    if (!base) base = G['?'];
    const largura = base[0].length;
    const pixels = [];
    base.forEach((linha, y) => [...linha].forEach((c, x) => { if (c === '#') pixels.push([x, y + TOPO]); }));
    if (acento === 'cedilha') { pixels.push([2, 7 + TOPO], [1, 8 + TOPO]); }
    else if (acento) {
      const off = Math.floor((largura - 5) / 2);
      ACENTOS[acento].forEach((linha, y) => [...linha].forEach((c, x) => { if (c === '#') pixels.push([x + off, y]); }));
    }
    res = { largura, pixels };
  }
  cache.set(ch, res);
  return res;
}

export function normalizar(texto) {
  return String(texto).toUpperCase();
}

export function larguraTexto(texto, escala = 1) {
  const t = normalizar(texto);
  let w = 0;
  for (const ch of t) w += glifo(ch).largura + 1;
  return Math.max(0, w - 1) * escala;
}

// Quebra texto em linhas que cabem em maxLargura (px).
export function quebrarLinhas(texto, maxLargura, escala = 1) {
  const linhas = [];
  for (const par of normalizar(texto).split('\n')) {
    let atual = '';
    for (const palavra of par.split(/\s+/).filter(Boolean)) {
      const tentativa = atual ? atual + ' ' + palavra : palavra;
      if (larguraTexto(tentativa, escala) <= maxLargura || !atual) atual = tentativa;
      else { linhas.push(atual); atual = palavra; }
    }
    linhas.push(atual);
  }
  return linhas;
}

// Desenha texto no contexto 2D. (x,y) = canto superior esquerdo da célula.
export function desenharTexto(ctx, texto, x, y, cor, escala = 1, limite = Infinity) {
  ctx.fillStyle = cor;
  let cx = Math.round(x), n = 0;
  for (const ch of normalizar(texto)) {
    if (n++ >= limite) break;
    const g = glifo(ch);
    for (const [px, py] of g.pixels) ctx.fillRect(cx + px * escala, Math.round(y) + py * escala, escala, escala);
    cx += (g.largura + 1) * escala;
  }
}

// Texto com contorno de 1px (legível sobre qualquer fundo).
export function desenharTextoContorno(ctx, texto, x, y, cor, corContorno, escala = 1, limite = Infinity) {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    desenharTexto(ctx, texto, x + dx, y + dy, corContorno, escala, limite);
  }
  desenharTexto(ctx, texto, x, y, cor, escala, limite);
}
