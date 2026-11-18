// Biblioteca de sprites: personagens em ASCII + objetos procedurais.
import { Pix, misturar } from './pixel.js';
import { rng } from './compartilhado/util.js';

const K = '#1a1c2c';

// ---------- Personagens ----------
const PESSOA_TOPO = [
  '................',
  '....kkkkkk......',
  '...khhhhhhk.....',
  '..khhhhHhhhk....',
  '..khhhhsssssk...',
  '..khhhssssesk...',
  '..khhsssssssk...',
  '...kSssssssk....',
  '....kkkkkkk.....',
  '...krrrrrrRk....',
  '..krrrrrrrrRk...',
  '..ksrrrrrrRsk...',
];
const PESSOA_PERNAS = {
  parado: ['..kkbbbbbbBkk...', '...kbbkkbbk.....', '...kmmkkmmk.....', '...kkkkkkkk.....'],
  passoA: ['..kkbbbbbbBkk...', '..kbbk..kbbk....', '..kmmk..kmmk....', '..kkkk..kkkk....'],
  passoB: ['..kkbbbbbbBkk...', '...kbbkbbk......', '..kmmk.kmmk.....', '..kkkk.kkkk.....'],
  pulo: ['..kkbbbbbbBkk...', '..kbbbbbbbbk....', '...kmmkkmmk.....', '....kkkkkk......'],
};

const PESSOA_CORES = {
  heroi: { h: '#6b3e26', H: '#8a5434', r: '#c83c4c', R: '#8e2a3c', b: '#3a5ab8', B: '#26387a' },
  amiga: { h: '#e8b030', H: '#f8d870', r: '#3aa860', R: '#267a44', b: '#6a4a9a', B: '#4a3270' },
  velho: { h: '#c8c8d0', H: '#ececf4', r: '#7a5a3a', R: '#5a3e26', b: '#4a4a5a', B: '#33333f' },
  guarda: { h: '#2a2a2a', H: '#4a4a4a', r: '#5a6a7a', R: '#3e4a56', b: '#2a3a5a', B: '#1c2840' },
  crianca: { h: '#3a2418', H: '#5a3a28', r: '#f0a030', R: '#c07818', b: '#3a7ac8', B: '#285890' },
};

function pessoa(cores) {
  const c = { k: K, s: '#f2c4a0', S: '#d49a78', e: K, m: '#5a3a2a', ...cores };
  const q = (pernas) => Pix.deAscii([...PESSOA_TOPO, ...pernas], c);
  return {
    quadros: [q(PESSOA_PERNAS.parado), q(PESSOA_PERNAS.passoA), q(PESSOA_PERNAS.passoB), q(PESSOA_PERNAS.pulo)],
    anims: { parado: { q: [0], fps: 1 }, andando: { q: [1, 0, 2, 0], fps: 8 }, correndo: { q: [1, 0, 2, 0], fps: 13 }, pulando: { q: [3], fps: 1 } },
    sombra: true, personagem: true,
  };
}

const MAGO = [
  '........k.......',
  '.......kpk......',
  '......kppk......',
  '......kpppk.....',
  '.....kppyppk....',
  '.....kpppppk....',
  '...kkkkkkkkkkk..',
  '....kssssseskk..',
  '....kwssssssk...',
  '....kwwwwwwwk...',
  '...kpwwwwwwwpk..',
  '..kppkwwwwwkppk.',
  '..kspppkwkppppsk',
  '...kpppppppppk..',
  '...kpppppppppk..',
  '..kppppppppppPk.',
  '..kPPPPPPPPPPPk.',
  '..kkkkkkkkkkkkk.',
];
function mago(cores = {}) {
  const c = { k: K, s: '#f2c4a0', e: K, w: '#e8e8f0', p: '#5a3aa0', P: '#3a2470', y: '#f8d040', ...cores };
  const base = Pix.deAscii(MAGO, c);
  const passo = Pix.deAscii([...MAGO.slice(0, 16), '...kPPPPPPPPPPk.', '...kkkkkkkkkkk..'], c);
  return {
    quadros: [base, passo],
    anims: { parado: { q: [0], fps: 1 }, andando: { q: [0, 1], fps: 6 }, correndo: { q: [0, 1], fps: 10 }, pulando: { q: [1], fps: 1 } },
    sombra: true, personagem: true,
  };
}

const SLIME = [
  '................',
  '.....kkkkkk.....',
  '...kkgglggggkk..',
  '..kgglllgggggk..',
  '.kgggllgggggggk.',
  '.kgggggwkggwkggk',
  '.kgggggwkggwkggk',
  '.kgggggggggggGGk',
  '.kGgggggggggGGGk',
  '..kGGGGGGGGGGGk.',
  '...kkkkkkkkkkk..',
];
const SLIME_ACHATADO = [
  '................',
  '................',
  '....kkkkkkkk....',
  '..kkgglllggggkk.',
  '.kgggllgggggggk.',
  '.kgggggwkggwkggk',
  '.kgggggwkggwkggk',
  'kggggggggggggGGk',
  'kGggggggggggGGGk',
  '.kGGGGGGGGGGGGk.',
  '..kkkkkkkkkkkkk.',
];
function slime(cores = {}) {
  const c = { k: K, g: '#5ac84a', l: '#a8f088', G: '#2e8a3a', w: '#ffffff', ...cores };
  return {
    quadros: [Pix.deAscii(SLIME, c), Pix.deAscii(SLIME_ACHATADO, c)],
    anims: { parado: { q: [0, 1], fps: 3 }, andando: { q: [0, 1], fps: 6 }, correndo: { q: [0, 1], fps: 10 }, pulando: { q: [0], fps: 1 } },
    sombra: true, personagem: true,
  };
}

const MORCEGO = [
  ['k.....k.k.....k', 'kk...kkkkk...kk', 'kpk.kpwpwpk.kpk', 'kpppkpppppkpppk', '..kpppppppppk..', '....kkpppkk....', '......kkk......'],
  ['......k.k......', '.....kkkkk.....', '....kpwpwpk....', '..kkkpppppkkk..', '.kpppkpppkpppk.', 'kppk.kkkkk.kppk', 'kkk.........kkk'],
];
function morcego(cores = {}) {
  const c = { k: K, p: '#5a3a6a', w: '#ff4060', ...cores };
  return {
    quadros: MORCEGO.map((m) => Pix.deAscii(m, c)),
    anims: { parado: { q: [0, 1], fps: 8 }, andando: { q: [0, 1], fps: 10 }, correndo: { q: [0, 1], fps: 14 }, pulando: { q: [0, 1], fps: 10 } },
    sombra: false, voa: true,
  };
}

// ---------- Itens ----------
const MOEDA = [
  ['..kkkk..', '.kyyyyk.', 'kyYyyoyk', 'kyYyyoyk', 'kyYyyoyk', 'kyyyyoyk', '.kyooyk.', '..kkkk..'],
  ['...kk...', '..kyyk..', '.kyYoyk.', '.kyYoyk.', '.kyYoyk.', '.kyyoyk.', '..kyok..', '...kk...'],
  ['...kk...', '...kk...', '...yk...', '...yk...', '...yk...', '...yk...', '...kk...', '...kk...'],
];
const ITENS = {
  moeda: { m: MOEDA, c: { k: K, y: '#f8d040', Y: '#fff4a0', o: '#c88a20' }, anim: [0, 1, 2, 1], fps: 8 },
  coracao: { m: [['.kk...kk.', 'krrk.krrk', 'krwrkrrrk', 'krrrrrrrk', '.krrrrrk.', '..krrrk..', '...krk...', '....k....']], c: { k: K, r: '#e83a4a', w: '#ffd0d8' } },
  estrela: { m: [['....k....', '...kyk...', 'kkkyYykkk', 'kyyyYyyyk', '.kyyyyyk.', '..kyyyk..', '.kyykyyk.', '.kyk.kyk.', '.kk...kk.']], c: { k: K, y: '#f8d040', Y: '#ffffff' } },
  gema: { m: [['..kkk..', '.kCcck.', 'kCcccdk', 'kcccddk', '.kcddk.', '..kdk..', '...k...']], c: { k: K, c: '#4ad0e8', C: '#c0f8ff', d: '#2a80b0' } },
  bau: { m: [['..kkkkkkkkkk..', '.kmmmmmmmmmmk.', 'kmmmmmmmmmmmmk', 'kMMMMMyyMMMMMk', 'kkkkkkYykkkkkk', 'kmmmmmyymmmmmk', 'kmmmmmkkmmmmmk', 'kmmmmmmmmmmmmk', 'kMMMMMMMMMMMMk', 'kkkkkkkkkkkkkk']], c: { k: K, m: '#a0622a', M: '#6e3e1a', y: '#f8d040', Y: '#fff4a0' } },
  chave: { m: [['.kkk.......', 'kyYyk......', 'ky.ykkkkkkk', 'kyyyyyyyyyk', '.kkk..kyk.k', '......k.k..']], c: { k: K, y: '#f8d040', Y: '#ffffff' } },
};

function item(nome) {
  const d = ITENS[nome];
  return {
    quadros: d.m.map((m) => Pix.deAscii(m, d.c)),
    anims: { parado: { q: d.anim || [0], fps: d.fps || 1 } },
    sombra: nome !== 'bau', flutua: nome !== 'bau',
  };
}

// ---------- Procedurais ----------
function arvore(semente = 1, cores = {}) {
  const c = { folha: ['#1f5a32', '#2e7a3e', '#4aa04a', '#7ac85a'], tronco: '#6a4024', troncoEsc: '#4a2a18', ...cores };
  const r = rng(semente);
  const W = 34, H = 44, p = new Pix(W, H);
  p.ret(14, 26, 6, 18, c.tronco); p.ret(18, 26, 2, 18, c.troncoEsc); p.ret(13, 41, 8, 3, c.tronco);
  const bolas = [[17, 16, 11], [10, 20, 7], [24, 20, 7], [12, 11, 6], [22, 10, 7], [17, 6, 6]];
  for (const [bx, by, br] of bolas) {
    const rr = br + (r() - 0.5) * 2;
    p.circulo(bx, by, rr, (x, y, dx, dy) => {
      const luz = 0.55 - dx * 0.35 - dy * 0.45 + (17 - y) * 0.02;
      return Pix.tom(c.folha, Math.min(1, Math.max(0, luz)), x, y);
    });
  }
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } }, sombra: false };
}

function pinheiro(semente = 1, cores = {}) {
  const c = { folha: ['#163e2e', '#215a3a', '#2f7a46', '#58a05a'], tronco: '#5a3420', neve: false, ...cores };
  const W = 26, H = 46, p = new Pix(W, H);
  p.ret(11, 36, 4, 10, c.tronco);
  const camadas = [[4, 14, 5], [10, 24, 8], [18, 36, 11]];
  for (const [y0, y1, meia] of camadas) {
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / (y1 - y0);
      const w = Math.round(2 + t * meia);
      for (let x = 13 - w; x < 13 + w; x++) {
        const lado = (x - 13) / w;
        let v = 0.65 - lado * 0.4 - t * 0.35;
        if (c.neve && t < 0.25 + 0.1 * Math.sin(x)) { p.set(x, y, '#f0f4ff'); continue; }
        p.set(x, y, Pix.tom(c.folha, Math.min(1, Math.max(0, v)), x, y));
      }
    }
  }
  for (let y = 0; y < 4; y++) for (let x = 13 - Math.ceil(y / 2); x <= 12 + Math.ceil(y / 2); x++) p.set(x, y + 1, c.neve ? '#f0f4ff' : c.folha[2]);
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } } };
}

function arbusto(semente = 1, cores = {}) {
  const c = { folha: ['#1f5a32', '#2e7a3e', '#4aa04a', '#7ac85a'], ...cores };
  const W = 22, H = 13, p = new Pix(W, H);
  for (const [bx, by, br] of [[6, 8, 5], [11, 6, 6], [16, 8, 5]]) {
    p.circulo(bx, by, br, (x, y, dx, dy) => Pix.tom(c.folha, Math.max(0, Math.min(1, 0.6 - dx * 0.3 - dy * 0.5)), x, y));
  }
  for (let x = 0; x < W; x++) for (let y = 11; y < H; y++) p.d[(y * W + x) * 4 + 3] = 0;
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } } };
}

function pedra(semente = 1, cores = {}) {
  const c = { tons: ['#3a3848', '#5a5868', '#8a8898', '#b8b8c4'], ...cores };
  const p = new Pix(16, 10);
  p.elipse(8, 7, 7, 6, (x, y, dx, dy) => (y > 8 ? null : Pix.tom(c.tons, Math.max(0, Math.min(1, 0.6 - dx * 0.4 - dy * 0.5)), x, y)));
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } } };
}

function casa(semente = 1, cores = {}) {
  const c = { parede: '#e8d0a0', paredeEsc: '#c0a478', telhado: ['#7a2a2a', '#a83a3a', '#c85a4a'], porta: '#6a4024', janela: '#9ad0f0', luz: false, ...cores };
  const W = 50, H = 44, p = new Pix(W, H);
  p.ret(6, 20, 38, 24, c.parede);
  for (let y = 20; y < 44; y += 4) for (let x = 6; x < 44; x++) if ((x + (y / 4) * 3) % 9 === 0) p.set(x, y, c.paredeEsc);
  p.ret(6, 20, 38, 1, c.paredeEsc);
  // telhado
  for (let y = 0; y < 21; y++) {
    const meia = 4 + y * 1.15;
    for (let x = Math.round(25 - meia); x < Math.round(25 + meia); x++) {
      const v = 0.8 - y / 30 - (x > 25 ? 0.25 : 0);
      p.set(x, y, Pix.tom(c.telhado, Math.max(0, Math.min(1, v)), x, y));
      if (y % 4 === 3) p.set(x, y, c.telhado[0]);
    }
  }
  p.ret(34, 2, 5, 10, '#7a6a6a'); p.ret(33, 1, 7, 2, '#5a4a4a');
  // porta e janelas
  p.ret(20, 30, 9, 14, c.porta); p.set(27, 37, '#f8d040');
  const jan = c.luz ? '#f8d860' : c.janela;
  for (const jx of [10, 34]) { p.ret(jx, 26, 7, 7, jan); p.ret(jx + 3, 26, 1, 7, K); p.ret(jx, 29, 7, 1, K); }
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } }, luz: c.luz ? { cor: '#ffc860', intensidade: 1.5, alcance: 5, dy: 1.6, dz: 0.8 } : null };
}

function nuvem(semente = 1) {
  const r = rng(semente);
  const p = new Pix(34, 14);
  const n = 4 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const cx = 7 + (i / (n - 1)) * 20, cy = 9 - Math.sin((i / (n - 1)) * Math.PI) * 3, rr = 4 + r() * 2.5;
    p.circulo(cx, cy, rr, (x, y, dx, dy) => (y > 11 ? null : dy > 0.35 ? '#c8dcf0' : '#ffffff'));
  }
  return { quadros: [p], anims: { parado: { q: [0] } } };
}

function cacto(semente = 1) {
  const c = ['#1e5a30', '#2e8040', '#4aa858'];
  const p = new Pix(16, 26);
  const pint = (x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.set(x + i, y + j, Pix.tom(c, 1 - i / (w - 1 || 1), x + i, y + j)); };
  pint(6, 2, 5, 24); pint(1, 9, 4, 4); pint(1, 6, 3, 5); pint(11, 13, 4, 3); pint(12, 9, 3, 5);
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } } };
}

function poste() {
  const p = new Pix(12, 44);
  p.ret(5, 8, 2, 36, '#3a3a4a'); p.ret(4, 40, 4, 4, '#3a3a4a'); p.ret(6, 8, 1, 36, '#5a5a6a');
  p.ret(2, 3, 8, 5, '#2a2a38'); p.ret(3, 4, 6, 3, '#fff0b0'); p.ret(4, 1, 4, 2, '#2a2a38');
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } }, luz: { cor: '#ffe0a0', intensidade: 2.5, alcance: 7, dy: 2.4, dz: 1 } };
}

function placa() {
  const p = new Pix(16, 16);
  p.ret(7, 8, 2, 8, '#6a4024');
  p.ret(1, 1, 14, 8, '#a0702a'); p.ret(1, 8, 14, 1, '#6a4024');
  for (const y of [3, 5]) p.ret(3, y, 10, 1, '#6a4024');
  return { quadros: [p.contorno(K)], anims: { parado: { q: [0] } } };
}

function chama(p, cx, base, altura, largura, fase, r) {
  const cores = ['#c83018', '#f07020', '#f8c040', '#fff4c0'];
  for (let y = 0; y < altura; y++) {
    const t = y / altura;
    const w = largura * (1 - t) * (0.8 + 0.3 * Math.sin(fase + y * 0.9));
    const desl = Math.sin(fase * 1.3 + y * 0.5) * t * 1.5;
    for (let x = Math.floor(cx - w + desl); x <= cx + w + desl; x++) {
      const dist = Math.abs(x - cx - desl) / Math.max(w, 0.5);
      const v = (1 - dist) * 0.9 + (1 - t) * 0.4 - 0.25 + r() * 0.15;
      p.set(x, base - y, Pix.tom(cores, Math.max(0, Math.min(1, v)), x, base - y));
    }
  }
}

function fogueira() {
  const quadros = [];
  for (let f = 0; f < 4; f++) {
    const r = rng(100 + f);
    const p = new Pix(18, 18);
    chama(p, 9, 13, 12 + (f % 2) * 2, 4.5, f * 1.7, r);
    p.ret(2, 14, 14, 2, '#6a4024'); p.ret(3, 15, 12, 2, '#4a2a18'); p.ret(1, 16, 5, 2, '#5a5a68'); p.ret(12, 16, 5, 2, '#5a5a68');
    quadros.push(p.contorno(K));
  }
  return { quadros, anims: { parado: { q: [0, 1, 2, 3], fps: 9 } }, luz: { cor: '#ff9a40', intensidade: 4.5, alcance: 10, dy: 0.7, dz: 1.2, cintila: true }, brasas: true };
}

function tocha() {
  const quadros = [];
  for (let f = 0; f < 4; f++) {
    const r = rng(200 + f);
    const p = new Pix(8, 18);
    chama(p, 4, 7, 7 + (f % 2), 2.2, f * 1.9, r);
    p.ret(3, 8, 2, 10, '#6a4024'); p.ret(2, 8, 4, 2, '#5a5a68');
    quadros.push(p.contorno(K));
  }
  return { quadros, anims: { parado: { q: [0, 1, 2, 3], fps: 10 } }, luz: { cor: '#ffa050', intensidade: 3, alcance: 7, dy: 0.9, dz: 0.8, cintila: true } };
}

const FABRICAS = {
  heroi: () => pessoa(PESSOA_CORES.heroi),
  amiga: () => pessoa(PESSOA_CORES.amiga),
  velho: () => pessoa(PESSOA_CORES.velho),
  guarda: () => pessoa(PESSOA_CORES.guarda),
  crianca: () => pessoa(PESSOA_CORES.crianca),
  pessoa: (o) => pessoa({ ...PESSOA_CORES.heroi, ...(o.cores || {}) }),
  mago: (o) => mago(o.cores),
  slime: (o) => slime(o.cores),
  morcego: (o) => morcego(o.cores),
  moeda: () => item('moeda'), coracao: () => item('coracao'), estrela: () => item('estrela'),
  gema: () => item('gema'), bau: () => item('bau'), chave: () => item('chave'),
  arvore: (o) => arvore(o.semente, o.cores), pinheiro: (o) => pinheiro(o.semente, o.cores),
  'pinheiro-neve': (o) => pinheiro(o.semente, { neve: true, ...(o.cores || {}) }),
  arbusto: (o) => arbusto(o.semente, o.cores), pedra: (o) => pedra(o.semente, o.cores),
  casa: (o) => casa(o.semente, o.cores), 'casa-noite': (o) => casa(o.semente, { luz: true, ...(o.cores || {}) }),
  nuvem: (o) => nuvem(o.semente), cacto: (o) => cacto(o.semente), poste: () => poste(), placa: () => placa(),
  fogueira: () => fogueira(), tocha: () => tocha(),
};

export const NOMES_SPRITES = Object.keys(FABRICAS);

// Permite que outros módulos (ex.: sprites-rpg.js) adicionem sprites ao catálogo.
export function registrarSprites(fabricas) {
  Object.assign(FABRICAS, fabricas);
  for (const n of Object.keys(fabricas)) if (!NOMES_SPRITES.includes(n)) NOMES_SPRITES.push(n);
}

// Recolore pixels de cores específicas (para variações de 'cores' em sprites prontos).
export function obterSprite(nome, opcoes = {}) {
  const fab = FABRICAS[nome];
  if (!fab) return null;
  const s = fab({ semente: opcoes.semente ?? 1, cores: opcoes.cores });
  s.nome = nome;
  s.quadros = s.quadros.map((q) => q.paraCanvas());
  if (s.brilho) s.brilho = s.brilho.map((q) => (q.paraCanvas ? q.paraCanvas() : q)); // camada que brilha sem depender da luz
  return s;
}

// Sprite a partir de PNG do usuário (folha horizontal com N quadros).
export async function spriteDeArquivo(url, opcoes = {}) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const n = opcoes.quadros || 1;
  const w = Math.floor(img.width / n), h = img.height;
  const quadros = [];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, i * w, 0, w, h, 0, 0, w, h);
    quadros.push(c);
  }
  const todos = [...Array(n).keys()];
  return {
    nome: url, quadros,
    anims: opcoes.animacoes
      ? Object.fromEntries(Object.entries(opcoes.animacoes).map(([k, v]) => [k, Array.isArray(v) ? { q: v, fps: opcoes.fps || 8 } : v]))
      : { parado: { q: todos, fps: opcoes.fps || 8 } },
    sombra: opcoes.sombra ?? false,
    personagem: !!opcoes.animacoes,
  };
}

export { misturar };
