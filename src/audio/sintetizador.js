// Efeitos sonoros estilo 8/16-bit gerados por síntese (sem licença, sem música).
// Todos os sons: Float32Array mono a 48 kHz.
import { rng } from '../../motor/compartilhado/util.js';

export const SR = 48000;
const TAU = Math.PI * 2;

const amostras = (dur) => new Float32Array(Math.max(1, Math.ceil(dur * SR)));

function onda(tipo, fase, duty) {
  const f = fase - Math.floor(fase);
  switch (tipo) {
    case 'quadrada': return f < duty ? 1 : -1;
    case 'triangulo': return 4 * Math.abs(f - 0.5) - 1;
    case 'serra': return 2 * f - 1;
    default: return Math.sin(TAU * f);
  }
}

// Tom com varredura de frequência e envelope.
function tom({ tipo = 'quadrada', f0, f1 = f0, dur, vol = 0.4, ataque = 0.002, curva = 1, duty = 0.5, vibrato = 0, vibratoHz = 0 }) {
  const out = amostras(dur);
  let fase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, p = t / dur;
    let f = f0 * Math.pow(f1 / f0, p);
    if (vibrato) f *= 1 + vibrato * Math.sin(TAU * vibratoHz * t);
    fase += f / SR;
    const env = (t < ataque ? t / ataque : 1) * Math.pow(Math.max(0, 1 - p), curva);
    out[i] = onda(tipo, fase, duty) * env * vol;
  }
  return out;
}

// Ruído filtrado (SVF) com corte variável.
function ruido({ dur, vol = 0.4, f0 = 2000, f1 = f0, filtro = 'passa-baixa', q = 0.7, ataque = 0.002, curva = 1, semente = 1, envFn = null, corteFn = null }) {
  const out = amostras(dur);
  const r = rng(semente);
  let low = 0, band = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR, p = t / dur;
    const fc = Math.min(SR / 6.5, corteFn ? corteFn(t, p) : f0 * Math.pow(f1 / f0, p));
    const fk = 2 * Math.sin((Math.PI * fc) / SR);
    const x = r() * 2 - 1;
    low += fk * band;
    const high = x - low - q * band;
    band += fk * high;
    const s = filtro === 'passa-baixa' ? low : filtro === 'passa-banda' ? band : high;
    const env = envFn ? envFn(t, p) : (t < ataque ? t / ataque : 1) * Math.pow(Math.max(0, 1 - p), curva);
    out[i] = s * env * vol;
  }
  return out;
}

function misturar(partes, dur = null) {
  const total = dur ?? Math.max(...partes.map(([b, off = 0]) => off + b.length / SR));
  const out = amostras(total);
  for (const [b, off = 0, g = 1] of partes) {
    const o = Math.round(off * SR);
    for (let i = 0; i < b.length && o + i < out.length; i++) out[o + i] += b[i] * g;
  }
  return out;
}

function sequencia(notas, { tipo = 'quadrada', passo = 0.06, vol = 0.3, duty = 0.5, ultimaDur = null, curva = 0.8 }) {
  return misturar(notas.map((f, i) => [tom({ tipo, f0: f, dur: i === notas.length - 1 && ultimaDur ? ultimaDur : passo * 1.6, vol, duty, curva }), i * passo]));
}

function esmagar(b, bits = 6) {
  const n = Math.pow(2, bits - 1);
  for (let i = 0; i < b.length; i++) b[i] = Math.round(b[i] * n) / n;
  return b;
}

// Gera L segundos que repetem sem emenda (crossfade do excesso no início).
function emLoop(gerar, L, fade = 1) {
  const b = gerar(L + fade);
  const out = b.slice(0, Math.round(L * SR));
  const n = Math.round(fade * SR);
  for (let i = 0; i < n; i++) {
    const a = i / n;
    out[i] = out[i] * Math.sqrt(a) + b[out.length + i] * Math.sqrt(1 - a);
  }
  return out;
}

function eventosAleatorios(L, mediaIntervalo, semente, criar) {
  const r = rng(semente);
  const partes = [];
  for (let t = r() * mediaIntervalo; t < L - 0.5; t += mediaIntervalo * (0.4 + r() * 1.2)) partes.push([criar(r), t]);
  return partes;
}

const SONS = {
  passo: () => misturar([[ruido({ dur: 0.05, vol: 0.5, f0: 1800, f1: 500, curva: 2 })], [tom({ tipo: 'triangulo', f0: 120, f1: 70, dur: 0.05, vol: 0.4, curva: 2 })]]),
  pulo: () => tom({ f0: 200, f1: 640, dur: 0.17, vol: 0.28, duty: 0.25, curva: 0.6 }),
  aterrissar: () => misturar([[ruido({ dur: 0.09, vol: 0.55, f0: 1000, f1: 200, curva: 2 })], [tom({ tipo: 'triangulo', f0: 100, f1: 50, dur: 0.09, vol: 0.5, curva: 1.5 })]]),
  moeda: () => misturar([[tom({ f0: 988, dur: 0.07, vol: 0.25, curva: 0.2 })], [tom({ f0: 1319, dur: 0.35, vol: 0.25, curva: 1.4 }), 0.07]]),
  item: () => misturar([[tom({ f0: 660, f1: 990, dur: 0.09, vol: 0.25, duty: 0.25 })], [tom({ f0: 1320, dur: 0.16, vol: 0.25, duty: 0.25, curva: 1.5 }), 0.08]]),
  vida: () => sequencia([523, 784, 1047], { tipo: 'triangulo', passo: 0.08, vol: 0.45, ultimaDur: 0.3 }),
  powerup: () => sequencia([392, 494, 587, 784, 988, 1175, 1568], { passo: 0.045, vol: 0.2, duty: 0.25, ultimaDur: 0.25 }),
  puf: () => ruido({ dur: 0.3, vol: 0.6, f0: 3000, f1: 500, filtro: 'passa-banda', q: 0.5, curva: 1.6 }),
  explosao: () => esmagar(misturar([
    [ruido({ dur: 1.2, vol: 1.0, f0: 5000, f1: 120, curva: 2.2, semente: 3 })],
    [tom({ tipo: 'seno', f0: 80, f1: 28, dur: 0.7, vol: 0.8, curva: 1.5 })],
    [ruido({ dur: 0.6, vol: 0.5, f0: 900, f1: 200, curva: 1.4, semente: 9 }), 0.12],
  ]), 7),
  tremor: () => misturar([[ruido({ dur: 0.8, vol: 0.9, f0: 220, f1: 70, ataque: 0.05, curva: 1.3 })], [tom({ tipo: 'seno', f0: 48, f1: 38, dur: 0.8, vol: 0.6, curva: 1.2 })]]),
  blip: () => tom({ f0: 620, dur: 0.035, vol: 0.2, duty: 0.5, curva: 0.5 }),
  surpresa: () => misturar([[tom({ f0: 520, f1: 1040, dur: 0.07, vol: 0.25, duty: 0.25 })], [tom({ f0: 1040, dur: 0.12, vol: 0.25, duty: 0.25, curva: 1.2 }), 0.08]]),
  duvida: () => misturar([[tom({ f0: 620, f1: 420, dur: 0.1, vol: 0.25 })], [tom({ f0: 480, f1: 720, dur: 0.14, vol: 0.25, curva: 1.2 }), 0.12]]),
  amor: () => misturar([[tom({ tipo: 'triangulo', f0: 660, f1: 880, dur: 0.12, vol: 0.4 })], [tom({ tipo: 'triangulo', f0: 990, f1: 1320, dur: 0.25, vol: 0.4, curva: 1.3 }), 0.12]]),
  dano: () => misturar([[tom({ f0: 700, f1: 110, dur: 0.32, vol: 0.3, vibrato: 0.15, vibratoHz: 30 })], [ruido({ dur: 0.1, vol: 0.35, f0: 3000, f1: 800 })]]),
  magia: () => misturar([
    [sequencia([523, 659, 784, 1047, 1319, 1568, 2093, 2637], { tipo: 'seno', passo: 0.05, vol: 0.22, ultimaDur: 0.4, curva: 1.5 })],
    [ruido({ dur: 0.8, vol: 0.12, f0: 6000, filtro: 'passa-alta', ataque: 0.2, curva: 1.5 })],
  ]),
  revelar: () => misturar([
    [ruido({ dur: 0.7, vol: 0.4, f0: 300, f1: 4000, filtro: 'passa-banda', q: 0.4, envFn: (t, p) => Math.sin(Math.PI * p) ** 2 })],
    [tom({ tipo: 'triangulo', f0: 110, dur: 0.9, vol: 0.35, ataque: 0.3, curva: 1.5 }), 0.25],
  ]),
  transicao: () => ruido({ dur: 0.5, vol: 0.4, filtro: 'passa-banda', q: 0.5, corteFn: (t, p) => 400 + 3200 * Math.sin(Math.PI * p), envFn: (t, p) => Math.sin(Math.PI * p) ** 1.5 }),
  porta: () => misturar([
    [ruido({ dur: 0.35, vol: 0.5, f0: 380, filtro: 'passa-banda', q: 0.2, envFn: (t, p) => (0.5 + 0.5 * Math.sin(TAU * 28 * t)) * (1 - p) })],
    [tom({ tipo: 'triangulo', f0: 90, f1: 55, dur: 0.15, vol: 0.6, curva: 2 }), 0.33],
  ]),
  clique: () => tom({ f0: 1800, dur: 0.015, vol: 0.3 }),
  sucesso: () => sequencia([523, 659, 784, 1047], { passo: 0.07, vol: 0.22, duty: 0.25, ultimaDur: 0.35 }),
  erro: () => misturar([[tom({ f0: 220, f1: 160, dur: 0.14, vol: 0.3 })], [tom({ f0: 200, f1: 140, dur: 0.2, vol: 0.3, curva: 1.5 }), 0.17]]),
  soco: () => misturar([[ruido({ dur: 0.12, vol: 0.8, f0: 2500, f1: 300, curva: 2 })], [tom({ tipo: 'seno', f0: 160, f1: 60, dur: 0.12, vol: 0.7, curva: 2 })]]),
  espada: () => ruido({ dur: 0.22, vol: 0.5, filtro: 'passa-banda', q: 0.3, corteFn: (t, p) => 1500 + 5000 * p, envFn: (t, p) => Math.sin(Math.PI * p) }),
  // monstros de sombra: grave que cresce + sussurro de ruído (surge) / sopro que se desfaz (some)
  'sombra-surge': () => misturar([
    [tom({ tipo: 'seno', f0: 38, f1: 52, dur: 2.2, vol: 0.7, ataque: 0.9, curva: 1.4 })],
    [ruido({ dur: 2.0, vol: 0.45, filtro: 'passa-banda', q: 0.35, corteFn: (t, p) => 250 + 900 * p, envFn: (t, p) => Math.sin(Math.PI * p) ** 2 * (0.6 + 0.4 * Math.sin(TAU * 7 * t)), semente: 13 })],
    [ruido({ dur: 1.6, vol: 0.18, f0: 3500, filtro: 'passa-alta', envFn: (t, p) => Math.sin(Math.PI * p) ** 3 * (0.5 + 0.5 * Math.sin(TAU * 11 * t)), semente: 17 }), 0.3],
  ]),
  'sombra-some': () => misturar([
    [ruido({ dur: 1.3, vol: 0.5, f0: 2200, f1: 140, filtro: 'passa-banda', q: 0.4, ataque: 0.05, curva: 1.6, semente: 19 })],
    [tom({ tipo: 'seno', f0: 60, f1: 30, dur: 1.2, vol: 0.5, curva: 1.5 })],
  ]),
  sino: () => misturar([[tom({ tipo: 'seno', f0: 1760, dur: 1.2, vol: 0.25, curva: 3 })], [tom({ tipo: 'seno', f0: 2637, dur: 0.8, vol: 0.12, curva: 3 })]]),
  // ---- protótipos (aguardando aprovação)
  'sino-relogio': () => misturar([0, 1.1, 2.2].flatMap((t0) => [[tom({ tipo: 'seno', f0: 196, dur: 1.6, vol: 0.4, curva: 2.2 }), t0], [tom({ tipo: 'seno', f0: 392, dur: 1.2, vol: 0.18, curva: 2.5 }), t0], [tom({ tipo: 'seno', f0: 523, dur: 0.8, vol: 0.08, curva: 3 }), t0]])),
  cadeado: () => misturar([[tom({ f0: 2400, dur: 0.02, vol: 0.3 })], [ruido({ dur: 0.08, vol: 0.45, f0: 3500, filtro: 'passa-banda', q: 2, curva: 2 }), 0.05], [tom({ tipo: 'triangulo', f0: 1400, f1: 1200, dur: 0.12, vol: 0.25, curva: 2 }), 0.06]]),
  papel: () => misturar([0, 0.07, 0.15, 0.21, 0.3].map((t0, k) => [ruido({ dur: 0.06 + (k % 2) * 0.03, vol: 0.35, f0: 2500 + k * 400, filtro: 'passa-banda', q: 0.6, curva: 1.5, semente: 7 + k }), t0])),
  sininho: () => misturar([0, 0.16, 0.32].map((t0) => [tom({ tipo: 'seno', f0: 2093, dur: 0.35, vol: 0.18, curva: 2.4 }), t0]).concat([0, 0.16, 0.32].map((t0) => [tom({ tipo: 'seno', f0: 3136, dur: 0.2, vol: 0.08, curva: 3 }), t0]))),
  sombra: () => misturar([[ruido({ dur: 3.2, vol: 0.7, f0: 120, f1: 380, filtro: 'passa-baixa', ataque: 0.6, curva: 1.2, semente: 21 })], [tom({ tipo: 'seno', f0: 55, f1: 42, dur: 3.2, vol: 0.5, ataque: 0.5, curva: 1.4 })], [ruido({ dur: 2.4, vol: 0.18, filtro: 'passa-banda', q: 0.6, corteFn: (t, p) => 600 + 1800 * p, envFn: (t, p) => Math.sin(Math.PI * p) }), 0.4]]),
  // espirro: "ah... ah..." (inspira subindo) e "TCHIM!" (estouro de ar agudo + tom curto)
  'espirro-inspira': () => misturar([
    [ruido({ dur: 0.5, vol: 0.22, filtro: 'passa-banda', q: 0.7, corteFn: (t, p) => 700 + 1400 * p, envFn: (t, p) => Math.min(1, p * 3) * (1 - p * 0.3), semente: 31 })],
    [tom({ tipo: 'triangulo', f0: 330, f1: 520, dur: 0.18, vol: 0.18, ataque: 0.03, curva: 1 })],
    [tom({ tipo: 'triangulo', f0: 380, f1: 640, dur: 0.22, vol: 0.2, ataque: 0.03, curva: 1 }), 0.26],
  ]),
  espirro: () => misturar([
    [ruido({ dur: 0.06, vol: 0.5, f0: 1800, filtro: 'passa-banda', q: 0.8, curva: 1.2, semente: 41 })],
    [ruido({ dur: 0.38, vol: 0.75, f0: 6500, f1: 3000, filtro: 'passa-alta', ataque: 0.004, curva: 1.8, semente: 43 }), 0.05],
    [tom({ tipo: 'quadrada', f0: 760, f1: 520, dur: 0.12, vol: 0.14, duty: 0.25, curva: 1.4 }), 0.05],
  ]),
  // fogos de artifício: assobio subindo e estouro com estalinhos
  'fogos-sobe': () => tom({ tipo: 'seno', f0: 900, f1: 2400, dur: 0.5, vol: 0.12, ataque: 0.05, curva: 0.6 }),
  fogos: () => misturar([
    [ruido({ dur: 0.5, vol: 0.8, f0: 2500, f1: 200, curva: 2, semente: 51 })],
    [tom({ tipo: 'seno', f0: 120, f1: 50, dur: 0.3, vol: 0.5, curva: 1.6 })],
    ...[0.25, 0.33, 0.4, 0.5, 0.56, 0.7, 0.8].map((t0, k) => [ruido({ dur: 0.02, vol: 0.25, f0: 4000 + k * 500, filtro: 'passa-banda', q: 0.5, curva: 2, semente: 60 + k }), t0]),
  ]),
  // guardião se assustando (PROTÓTIPO): "iiip!" agudo que sobe + batidas rápidas de asinha
  'guardiao-susto': () => misturar([
    [tom({ tipo: 'quadrada', f0: 900, f1: 2200, dur: 0.12, vol: 0.16, duty: 0.25, curva: 0.6 })],
    [tom({ tipo: 'triangulo', f0: 2000, f1: 2600, dur: 0.1, vol: 0.14, curva: 1.4 }), 0.1],
    ...[0.08, 0.13, 0.18, 0.23, 0.28].map((t0, k) => [ruido({ dur: 0.03, vol: 0.18, f0: 2600 + k * 200, filtro: 'passa-banda', q: 0.6, curva: 2, semente: 70 + k }), t0]),
  ]),
  miau: () => tom({ tipo: 'triangulo', f0: 700, f1: 520, dur: 0.45, vol: 0.35, ataque: 0.05, curva: 1.2, vibrato: 0.04, vibratoHz: 7 }),
  trovao: () => misturar([[ruido({ dur: 0.25, vol: 0.7, f0: 1800, f1: 300, curva: 1.5 })], [ruido({ dur: 2.6, vol: 0.9, f0: 160, f1: 60, ataque: 0.1, curva: 1.6, semente: 9, envFn: (t, p) => (1 - p) * (0.6 + 0.4 * Math.sin(t * 9) * Math.sin(t * 3.3)) }), 0.1]]),
  suspense: () => misturar([[tom({ tipo: 'seno', f0: 70, f1: 50, dur: 0.35, vol: 0.9, curva: 2 })], [tom({ tipo: 'seno', f0: 70, f1: 50, dur: 0.5, vol: 0.9, curva: 2 }), 0.42], [ruido({ dur: 0.1, vol: 0.25, f0: 400, curva: 2 }), 0.42]]),
  fantasma: () => misturar([[tom({ tipo: 'seno', f0: 420, f1: 640, dur: 1.1, vol: 0.28, ataque: 0.25, curva: 1.4, vibrato: 0.06, vibratoHz: 5 })], [tom({ tipo: 'seno', f0: 630, f1: 960, dur: 0.9, vol: 0.12, ataque: 0.3, curva: 1.6, vibrato: 0.05, vibratoHz: 6 }), 0.15], [ruido({ dur: 1.2, vol: 0.12, f0: 900, filtro: 'passa-banda', q: 0.5, ataque: 0.3 })]]),
  // ---- Ambientes (loops) ----
  chuva: () => emLoop((L) => misturar([
    [ruido({ dur: L, vol: 0.28, f0: 5000, envFn: () => 1, semente: 21 })],
    [ruido({ dur: L, vol: 0.12, f0: 1200, envFn: () => 1, semente: 22 })],
    ...eventosAleatorios(L, 0.05, 23, (r) => ruido({ dur: 0.02, vol: 0.15 + r() * 0.2, f0: 2000 + r() * 5000, filtro: 'passa-banda', q: 0.3, curva: 3, semente: Math.floor(r() * 1e6) })),
  ], L), 10),
  vento: () => emLoop((L) => ruido({ dur: L, vol: 0.55, envFn: (t) => 0.55 + 0.45 * Math.sin(t * 0.7) * Math.sin(t * 0.23 + 1), corteFn: (t) => 350 + 300 * Math.sin(t * 0.5) + 150 * Math.sin(t * 1.3), filtro: 'passa-banda', q: 0.6, semente: 31 }), 12),
  grilos: () => emLoop((L) => misturar(eventosAleatorios(L, 0.9, 41, (r) => {
    const f = r() < 0.5 ? 4300 : 4700;
    return misturar([0, 1, 2, 3].map((k) => [tom({ tipo: 'seno', f0: f, dur: 0.016, vol: 0.05 + r() * 0.03, curva: 0.5 }), k * 0.03]));
  }), L), 10),
  passaros: () => emLoop((L) => misturar(eventosAleatorios(L, 2.2, 51, (r) => {
    const f = 2400 + r() * 1800, n = 1 + Math.floor(r() * 3);
    return misturar([...Array(n).keys()].map((k) => [tom({ tipo: 'seno', f0: f, f1: f * (1.2 + r() * 0.4), dur: 0.06 + r() * 0.06, vol: 0.05, curva: 0.8 }), k * 0.13]));
  }), L), 14),
  fogo: () => emLoop((L) => misturar([
    [ruido({ dur: L, vol: 0.35, f0: 600, envFn: (t) => 0.7 + 0.3 * Math.sin(t * 3.1) * Math.sin(t * 1.7), semente: 61 })],
    ...eventosAleatorios(L, 0.12, 62, (r) => ruido({ dur: 0.006 + r() * 0.01, vol: 0.2 + r() * 0.4, f0: 2000 + r() * 3000, filtro: 'passa-banda', q: 0.4, curva: 2, semente: Math.floor(r() * 1e6) })),
  ], L), 10),
  caverna: () => emLoop((L) => misturar([
    [ruido({ dur: L, vol: 0.45, f0: 110, envFn: () => 1, semente: 71 })],
    ...eventosAleatorios(L, 2.5, 72, (r) => {
      const gota = tom({ tipo: 'seno', f0: 1400 + r() * 600, f1: 600, dur: 0.05, vol: 0.12, curva: 1.5 });
      return misturar([[gota], [gota, 0.22, 0.35], [gota, 0.45, 0.12]]);
    }),
  ], L), 12),
  espaco: () => emLoop((L) => misturar([
    [tom({ tipo: 'seno', f0: 55, dur: L, vol: 0.12, curva: 0, ataque: 0.001 })],
    [tom({ tipo: 'seno', f0: 55.6, dur: L, vol: 0.1, curva: 0, ataque: 0.001 })],
    [ruido({ dur: L, vol: 0.15, f0: 380, envFn: (t) => 0.6 + 0.4 * Math.sin(t * 0.4), semente: 81 })],
  ], L), 12),
  cidade: () => emLoop((L) => misturar([
    [ruido({ dur: L, vol: 0.4, f0: 250, envFn: () => 1, semente: 91 })],
    ...eventosAleatorios(L, 4, 92, (r) => ruido({ dur: 2.5, vol: 0.12, f0: 500 + r() * 400, filtro: 'passa-banda', q: 0.5, envFn: (t, p) => Math.sin(Math.PI * p) ** 2, semente: Math.floor(r() * 1e6) })),
  ], L), 16),
};

export const NOMES_SONS = Object.keys(SONS);
export const AMBIENTES = ['chuva', 'vento', 'grilos', 'passaros', 'fogo', 'caverna', 'espaco', 'cidade'];

const cache = new Map();
export function gerarSom(nome) {
  if (!SONS[nome]) return null;
  if (!cache.has(nome)) cache.set(nome, SONS[nome]());
  return cache.get(nome);
}
