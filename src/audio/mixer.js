// Mixagem estéreo: narração + efeitos (com pan) + ambiente, com ducking e limitador.
import fs from 'node:fs';
import { SR } from './sintetizador.js';

export function escreverWav(arquivo, L, R) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0, o = 44; i < n; i++, o += 4) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), o);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), o + 2);
  }
  fs.writeFileSync(arquivo, buf);
}

export function escreverWavMono(arquivo, dados) { escreverWav(arquivo, dados, dados); }

function somar(destino, fonte, inicio, ganho, taxa = 1, limite = Infinity) {
  const o = Math.round(inicio * SR);
  const n = Math.min(Math.floor(fonte.length / taxa), limite);
  for (let i = 0; i < n; i++) {
    const j = o + i;
    if (j < 0) continue;
    if (j >= destino.length) break;
    let v;
    if (taxa === 1) v = fonte[i];
    else { const p = i * taxa, k = Math.floor(p), f = p - k; v = fonte[k] * (1 - f) + (fonte[k + 1] ?? 0) * f; }
    if (Number.isFinite(v)) destino[j] += v * ganho;   // amostra inválida de um som nunca apaga a narração
  }
}

// opcoes: { duracao, narracoes:[{dados,inicio}], eventos:[{dados,tempo,volume,pan,taxa}], ambientes:[{dados,inicio,fim,volume}], cfg }
export function mixar({ duracao, narracoes = [], eventos = [], ambientes = [], cfg = {} }) {
  const n = Math.ceil(duracao * SR);
  const narr = new Float32Array(n), fxL = new Float32Array(n), fxR = new Float32Array(n), amb = new Float32Array(n);

  for (const nr of narracoes) somar(narr, nr.dados, nr.inicio, nr.volume ?? 1);

  for (const e of eventos) {
    const pan = Math.max(-1, Math.min(1, e.pan || 0));
    const ang = ((pan + 1) * Math.PI) / 4;
    const g = (e.volume ?? 1) * Math.SQRT2;
    somar(fxL, e.dados, e.tempo, g * Math.cos(ang), e.taxa || 1);
    somar(fxR, e.dados, e.tempo, g * Math.sin(ang), e.taxa || 1);
  }

  const FADE = 0.5 * SR;
  for (const a of ambientes) {
    const i0 = Math.max(0, Math.round(a.inicio * SR)), i1 = Math.min(n, Math.round(a.fim * SR));
    const L = a.dados.length;
    const off = a.entrada != null ? 0 : Math.round(a.inicio * SR * 0.37) % L; // fases diferentes entre cenas (a trilha começa do início)
    const fIn = a.entrada != null ? Math.max(1, a.entrada * SR) : FADE;
    for (let j = i0; j < i1; j++) {
      const env = Math.min(1, (j - i0) / fIn, (i1 - j) / FADE);
      amb[j] += a.dados[(j - i0 + off) % L] * a.volume * env;
    }
  }

  // Ducking: abaixa efeitos/ambiente enquanto há narração.
  const vN = cfg.volumeNarracao ?? 1, vE = cfg.volumeEfeitos ?? 0.7, vA = cfg.volumeAmbiente ?? 0.35;
  const k = cfg.abaixarEfeitosNaNarracao ?? 0.45;
  const atq = Math.exp(-1 / (0.01 * SR)), rel = Math.exp(-1 / (0.35 * SR));
  let env = 0;
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = Math.abs(narr[i]);
    env = x > env ? atq * env + (1 - atq) * x : rel * env + (1 - rel) * x;
    const duck = 1 - k * Math.min(1, env / 0.08);
    const base = narr[i] * vN + amb[i] * vA * duck;
    L[i] = base + fxL[i] * vE * duck;
    R[i] = base + fxR[i] * vE * duck;
  }
  limitar(L, R);
  return { L, R };
}

// Limitador de pico com lookahead de 5 ms.
function limitar(L, R, teto = 0.94) {
  const n = L.length, la = Math.round(0.005 * SR);
  const rel = Math.exp(-1 / (0.08 * SR));
  const alvo = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    alvo[i] = p > teto ? teto / p : 1;
  }
  // mínimo na janela à frente (lookahead), depois suaviza a liberação
  const ganho = new Float32Array(n);
  let g = 1;
  for (let i = n - 1; i >= 0; i--) {
    let m = alvo[i];
    if (i + la < n) m = Math.min(m, alvo[i + la]);
    ganho[i] = m;
  }
  for (let i = 0; i < n; i++) {
    let m = ganho[i];
    for (let j = 1; j <= la && i + j < n; j += 8) m = Math.min(m, ganho[i + j]);
    g = m < g ? m : rel * g + (1 - rel) * m;
    L[i] *= g; R[i] *= g;
  }
}
