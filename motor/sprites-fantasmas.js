// PROTÓTIPO (aguardando aprovação): fantasmas para histórias futuras. Funcionam em qualquer vista (diorama incluso).
// Flutuam sozinhos (sobem e descem); a cauda some em dithering (parece translúcida sem perder o pixel nítido).
// Estados ("pose" no elemento ou ação "trocar"): veja ESTADOS em cada fantasma.
import { Pix } from './pixel.js';
import { registrarSprites } from './sprites.js';

const W = 24, H = 32;

// Corpo de lençol/espírito: cabeça redonda, corpo que alarga e cauda ondulada. fase = animação da cauda.
function corpo(p, cores, fase, { cx = 12, topo = 2, raio = 8, base = 26, ondas = 2 } = {}) {
  const [luz, med, esc] = cores;
  const dentro = (x, y) => {
    const dy = y + 0.5 - (topo + raio), dx = x + 0.5 - cx;
    if (dy < 0) return dx * dx + dy * dy <= raio * raio;
    const meia = raio + dy * 0.18;
    if (Math.abs(dx) > meia) return false;
    return y < base + ondas * Math.sin(x * 0.85 + fase);
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!dentro(x, y)) continue;
    const v = 0.7 - (x - cx) / (raio * 2.2) - (y - topo) / 60;
    p.set(x, y, Pix.tom([esc, med, luz], Math.max(0, Math.min(1, v)), x, y));
  }
  return dentro;
}
// Contorno e depois a cauda em dithering (de baixo para cima some metade dos pixels).
function acabar(p, contorno, inicioCauda) {
  p.contorno(contorno);
  for (let y = inicioCauda; y < H; y++) for (let x = 0; x < W; x++) {
    const forte = y >= inicioCauda + 3;
    if ((forte && (x + y) % 2 === 0) || (!forte && (x + y) % 4 === 0)) p.d[(y * W + x) * 4 + 3] = 0;
  }
  return p;
}
const px = (p, lista, cor) => { for (const [x, y] of lista) p.set(x, y, cor); };

// ---------------------------------------------------------------- humanoides
function humanoide(def, estado, f) {
  const p = new Pix(W, H), fase = f * Math.PI / 2;
  const { cores, contorno } = def;
  corpo(p, cores, fase, def.forma);
  const ey = 9, olho = def.olho || '#1a1c2c';
  // braços (bolinhas nos lados), conforme o estado
  const braco = (x, y) => { p.elipse(x, y, 2.6, 2.6, contorno); p.elipse(x, y, 1.8, 1.8, cores[0]); };
  if (estado === 'assustar') { braco(2.5, 7 - (f % 2)); braco(21.5, 7 - ((f + 1) % 2)); }
  else if (estado === 'timido') { braco(9, 12); braco(15, 12); }
  else if (estado === 'acenar') { braco(3, 19); braco(21.5, 6 + (f % 2) * 2); }
  else { braco(3.5, 18 + (f % 2)); braco(20.5, 18 + ((f + 1) % 2)); }
  def.extra?.(p, estado, f);
  // rosto
  if (estado === 'timido') {
    px(p, [[8, ey + 2], [9, ey + 2], [15, ey + 2], [16, ey + 2]], '#f0a0b0');           // bochechas por trás das mãos
    px(p, [[9, ey - 1], [10, ey - 1], [14, ey - 1], [15, ey - 1]], olho);             // olhinhos fechados
  } else if (def.olhos === 'buracos') {
    for (const ox of [8, 14]) p.ret(ox, ey - 1, 3, estado === 'assustar' ? 4 : 3, olho);
  } else {
    for (const ox of [8, 14]) { p.ret(ox, ey - 1, 2, 3, olho); p.set(ox, ey - 1, '#ffffff'); }
  }
  if (estado === 'assustar') { p.ret(10, ey + 4, 4, 4, olho); p.ret(11, ey + 5, 2, 2, '#5a2a3a'); }
  else if (estado === 'rindo') { p.ret(10, ey + 4, 4, 2, olho); p.set(9, ey + 3, olho); p.set(14, ey + 3, olho); }
  else if (estado !== 'timido') { p.set(11, ey + 4, olho); p.set(12, ey + 4, olho); }
  if (def.bochecha && estado !== 'timido') px(p, [[7, ey + 3], [16, ey + 3]], def.bochecha);
  def.depois?.(p, estado, f);
  return acabar(p, contorno, def.cauda ?? 24);
}

const FANTASMAS = {
  // clássico de lençol, olhos de buraco
  'fantasma-lencol': { cores: ['#fafaff', '#dcdcec', '#a8a8c4'], contorno: '#5a5a7a', olhos: 'buracos', estados: ['parado', 'assustar', 'timido'] },
  // criança fantasma tímida: azul-claro, laço no topo
  'fantasma-crianca': { cores: ['#d8f4ff', '#9ad8f4', '#5a9ac8'], contorno: '#2a5a8a', bochecha: '#f0a8c0', olho: '#1a2a4a',
    forma: { raio: 7, topo: 4, base: 25 }, cauda: 23, estados: ['parado', 'timido', 'acenar', 'assustar'],
    extra: (p) => { p.elipse(9, 3.5, 2.4, 1.8, '#f06a9a'); p.elipse(15, 3.5, 2.4, 1.8, '#f06a9a'); p.ret(11, 3, 2, 2, '#c84a7a'); } },
  // vovó fantasma: verde-água, coque e óculos, xale
  'fantasma-vovo': { cores: ['#e0faea', '#a8dcb8', '#6aa880'], contorno: '#2e6a4a', olho: '#1a3a2a', estados: ['parado', 'rindo', 'acenar'],
    extra: (p) => { p.elipse(12, 1.8, 3, 2, '#c8e8d4'); for (let x = 5; x < 20; x++) p.set(x, 17 + (x % 2), '#7a5aa8'); },
    depois: (p, estado) => { if (estado === 'timido') return; const f = '#3a5a4a'; for (const ox of [7, 13]) { for (let x = ox; x < ox + 4; x++) { p.set(x, 7, f); p.set(x, 11, f); } p.set(ox, 8, f); p.set(ox, 9, f); p.set(ox, 10, f); p.set(ox + 3, 8, f); p.set(ox + 3, 9, f); p.set(ox + 3, 10, f); } p.set(11, 8, f); p.set(12, 8, f); } },
  // sombra de olhos brilhantes (para susto): escura, olhos amarelos; "olhos-abertos" arregala
  'fantasma-sombra': { cores: ['#4a3a64', '#2e2446', '#1a1430'], contorno: '#0c0818', olho: '#f8e040', olhos: 'buracos', estados: ['parado', 'assustar'],
    forma: { raio: 9, topo: 1, base: 27, ondas: 3 }, cauda: 23 },
};

function fabricaHumanoide(nome) {
  const def = FANTASMAS[nome];
  return () => {
    const quadros = [], anims = {};
    for (const est of def.estados) {
      const ini = quadros.length;
      for (let f = 0; f < 4; f++) quadros.push(humanoide(def, est, f));
      anims[est] = { q: [ini, ini + 1, ini + 2, ini + 3], fps: est === 'assustar' ? 8 : 5 };
    }
    anims.andando = anims.correndo = anims.parado;
    return { quadros, anims, sombra: false, flutua: true };
  };
}

// ---------------------------------------------------------------- cachorro fantasma (de lado)
function cachorro(f, estado) {
  const p = new Pix(W, 20), fase = f * Math.PI / 2, cores = ['#fff4e0', '#e8d4b0', '#b89a78'];
  // corpo + cabeça
  p.elipse(10, 11, 7, 4.5, (x, y, dx, dy) => Pix.tom([cores[2], cores[1], cores[0]], 0.7 - dx * 0.3 - dy * 0.4, x, y));
  p.elipse(17, 7, 4.5, 4, (x, y, dx, dy) => Pix.tom([cores[2], cores[1], cores[0]], 0.75 - dx * 0.3 - dy * 0.4, x, y));
  p.ret(19, 7, 4, 3, cores[1]);                                    // focinho
  p.elipse(14.5, 3.5, 1.6, 2.6, cores[2]);                         // orelha
  // patinhas que somem (fantasma não tem pés)
  for (const x of [5, 9, 13]) p.ret(x, 14, 2, 2 + ((f + x) % 2), cores[1]);
  // rabo abanando
  const ab = estado === 'feliz' ? Math.round(Math.sin(fase * 2) * 2) : Math.round(Math.sin(fase));
  p.ret(1, 7 + ab, 3, 2, cores[1]); p.set(0, 6 + ab, cores[1]);
  p.contorno('#7a5a3a');
  p.set(18, 6, '#1a1c2c'); p.set(18, 5, '#1a1c2c'); p.set(22, 7, '#1a1c2c');
  if (estado === 'feliz') { p.set(20, 10, '#e86a7a'); p.set(21, 10, '#e86a7a'); p.set(21, 11, '#e86a7a'); }
  for (let y = 13; y < 20; y++) for (let x = 0; x < W; x++) if ((x + y + (y > 15 ? 0 : 1)) % (y > 15 ? 2 : 4) === 0) p.d[(y * W + x) * 4 + 3] = 0;
  return p;
}

// ---------------------------------------------------------------- fogo-fátuo (bolinha de luz que guia)
function fogoFatuo(f, cor) {
  const p = new Pix(12, 16), [a, b, c] = cor;
  const alt = [0, 1, 0, -1][f];
  p.elipse(6, 10, 4, 4, (x, y, dx, dy) => Pix.tom([c, b, a], 0.9 - Math.hypot(dx, dy) * 0.7, x, y));
  for (let y = 1; y < 8; y++) { const w = Math.max(0, Math.round((y - 1) * 0.5)); for (let x = 6 - w; x <= 6 + w; x++) p.set(x + (y < 4 ? alt : 0), y + 1, y < 4 ? a : b); }
  p.set(5, 9, '#ffffff'); p.set(6, 9, '#ffffff');
  return p;
}

registrarSprites({
  ...Object.fromEntries(Object.keys(FANTASMAS).map((n) => [n, fabricaHumanoide(n)])),
  'fantasma-cachorro': () => {
    const quadros = [], anims = {};
    for (const est of ['parado', 'feliz']) { const ini = quadros.length; for (let f = 0; f < 4; f++) quadros.push(cachorro(f, est)); anims[est] = { q: [ini, ini + 1, ini + 2, ini + 3], fps: est === 'feliz' ? 10 : 5 }; }
    anims.andando = anims.correndo = anims.feliz;
    return { quadros, anims, sombra: false, flutua: true };
  },
  // cores: "azul" (padrão), "verde", "roxo" via "pose"
  'fogo-fatuo': () => {
    const CORES = { azul: ['#e8f8ff', '#7ad0ff', '#3a7ad8'], verde: ['#f0ffe0', '#9af07a', '#3aa84a'], roxo: ['#f8e8ff', '#c89af8', '#7a4ad8'] };
    const quadros = [], brilho = [], anims = {};
    for (const [nome, c] of Object.entries(CORES)) { const ini = quadros.length; for (let f = 0; f < 4; f++) { const q = fogoFatuo(f, c); quadros.push(q); brilho.push(q); } anims[nome] = { q: [ini, ini + 1, ini + 2, ini + 3], fps: 8 }; }
    anims.parado = anims.andando = anims.correndo = anims.azul;
    return { quadros, brilho, anims, sombra: false, voa: true, luz: { cor: '#7ad0ff', intensidade: 0.8, alcance: 3 } };
  },
});
