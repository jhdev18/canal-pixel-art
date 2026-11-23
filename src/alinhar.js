// Alinhamento da narração pelo que é FALADO (reconhecimento de fala Whisper, roda no PC, sem internet depois da
// primeira vez): o áudio vira palavras com o tempo de cada uma; as palavras são alinhadas com o texto do roteiro
// e cada cena começa exatamente onde começa a sua primeira palavra. Não depende de pausas, respiração ou emoção.
// Resultado guardado em narracao/.alinhamento.json (só recalcula se o áudio ou o texto mudar).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { RAIZ } from './config.js';

const MODELO = 'onnx-community/whisper-base_timestamped';   // ~75 MB, baixado na primeira vez
const SR_W = 16000;

// minúsculas, sem acento, só letras e números
const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

function lev(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const parecido = (a, b) => { if (a === b) return 1; const mx = Math.max(a.length, b.length); if (!mx) return 0; const s = 1 - lev(a, b) / mx; return s >= 0.5 ? s : 0; };

// Needleman-Wunsch: texto do roteiro (S) × palavras ouvidas (R). Devolve, para cada palavra do roteiro, o índice da
// palavra ouvida correspondente (ou -1).
function alinharSequencias(S, R) {
  const m = S.length, n = R.length, GAP = -0.5;
  const sc = Array.from({ length: m + 1 }, () => new Float32Array(n + 1));
  const bt = Array.from({ length: m + 1 }, () => new Uint8Array(n + 1));   // 1 diag, 2 cima (pula S), 3 esquerda (pula R)
  for (let i = 1; i <= m; i++) { sc[i][0] = i * GAP; bt[i][0] = 2; }
  for (let j = 1; j <= n; j++) { sc[0][j] = j * GAP; bt[0][j] = 3; }
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const p = parecido(S[i - 1], R[j - 1]);
    const d = sc[i - 1][j - 1] + (p > 0 ? p * 2 : -1), c = sc[i - 1][j] + GAP, e = sc[i][j - 1] + GAP;
    if (d >= c && d >= e) { sc[i][j] = d; bt[i][j] = 1; } else if (c >= e) { sc[i][j] = c; bt[i][j] = 2; } else { sc[i][j] = e; bt[i][j] = 3; }
  }
  const mapa = new Int32Array(m).fill(-1);
  for (let i = m, j = n; i > 0 || j > 0;) {
    const b = bt[i][j];
    if (b === 1) { if (parecido(S[i - 1], R[j - 1]) > 0) mapa[i - 1] = j - 1; i--; j--; } else if (b === 2) i--; else j--;
  }
  return mapa;
}

let asrCache = null;
async function reconhecedor() {
  if (asrCache) return asrCache;
  const { pipeline, env } = await import('@huggingface/transformers');
  env.cacheDir = path.join(RAIZ, '.modelos');
  const local = path.join(env.cacheDir, MODELO, 'onnx', 'decoder_model_merged_quantized.onnx');
  if (!fs.existsSync(local)) console.log('  (primeira vez: baixando o reconhecimento de fala, ~75 MB — depois funciona offline)');
  asrCache = await pipeline('automatic-speech-recognition', MODELO, { dtype: 'q8' });
  return asrCache;
}

// Transcreve em janelas de 20 s com sobreposição (janelas longas fazem o Whisper se perder).
async function transcrever(d16) {
  const asr = await reconhecedor();
  const JAN = 20, PASSO = 16, total = d16.length / SR_W, palavras = [];
  for (let ini = 0; ini < total; ini += PASSO) {
    const fim = Math.min(total, ini + JAN);
    const out = await asr(d16.subarray(Math.floor(ini * SR_W), Math.floor(fim * SR_W)), { language: 'portuguese', task: 'transcribe', return_timestamps: 'word' });
    const de = ini === 0 ? -1 : ini + (JAN - PASSO) / 2, ate = fim >= total ? Infinity : ini + JAN - (JAN - PASSO) / 2;
    for (const c of out.chunks || []) {
      const t = ini + (c.timestamp[0] ?? 0), f = ini + (c.timestamp[1] ?? c.timestamp[0] ?? 0);
      if (t >= de && t < ate) for (const w of c.text.split(/\s+/)) if (norm(w)) palavras.push({ t, f, w: norm(w) });
    }
    if (fim >= total) break;
  }
  return palavras;
}

// dados: áudio mono em SR (48 kHz). textos: fala de cada cena.
// Devolve { cortes: K-1 cortes (segundos), palavras: por cena, [{ t, f }] de cada palavra do texto (split por espaço;
// null = não reconhecida) } — ou null. As palavras servem para a legenda palavra por palavra.
export async function cortesPelaFala(dados, SR, textos, pastaNarracao, arquivo) {
  const est = fs.statSync(arquivo);
  const chave = crypto.createHash('sha1').update(JSON.stringify([est.size, est.mtimeMs, textos, MODELO])).digest('hex');
  const arqCache = path.join(pastaNarracao, '.alinhamento.json');
  let R = null;
  try { const c = JSON.parse(fs.readFileSync(arqCache, 'utf8')); if (c.chave === chave && Array.isArray(c.palavras)) R = c.palavras; } catch { /* sem cache */ }
  if (!R) {
    // 48 kHz -> 16 kHz (média de 3 amostras)
    const passo = SR / SR_W, d16 = new Float32Array(Math.floor(dados.length / passo));
    for (let i = 0; i < d16.length; i++) { let s = 0; for (let k = 0; k < passo; k++) s += dados[i * passo + k] || 0; d16[i] = s / passo; }
    R = await transcrever(d16);
  }
  const S = [], cenaDe = [], tokenDe = [];
  const tokens = textos.map((t) => t.split(/\s+/).filter(Boolean));
  tokens.forEach((tk, k) => tk.forEach((w, j) => { if (norm(w)) { S.push(norm(w)); cenaDe.push(k); tokenDe.push(j); } }));
  const mapa = alinharSequencias(S, R.map((p) => p.w));
  const K = textos.length, cortes = [];
  for (let k = 1; k < K; k++) {
    // última palavra reconhecida da cena anterior e primeira da cena k
    let fimAnt = null, iniProx = null;
    for (let s = 0; s < S.length; s++) {
      if (mapa[s] < 0) continue;
      if (cenaDe[s] === k - 1) fimAnt = R[mapa[s]].f;
      if (cenaDe[s] === k && iniProx == null) iniProx = R[mapa[s]].t;
    }
    if (fimAnt == null || iniProx == null || iniProx < fimAnt) return null;   // não deu para alinhar com segurança
    cortes.push((fimAnt + iniProx) / 2);
  }
  for (let k = 1; k < cortes.length; k++) if (cortes[k] <= cortes[k - 1]) return null;
  const alinhadas = Array.from(mapa).filter((x) => x >= 0).length;
  if (alinhadas < S.length * 0.6) return null;                               // reconhecimento ruim demais
  const palavras = tokens.map((tk) => tk.map(() => null));
  for (let s = 0; s < S.length; s++) if (mapa[s] >= 0) { const r = R[mapa[s]]; palavras[cenaDe[s]][tokenDe[s]] = { t: r.t, f: r.f }; }
  try { fs.writeFileSync(arqCache, JSON.stringify({ chave, cortes, alinhadas, total: S.length, palavras: R })); } catch { /* ok */ }
  return { cortes, palavras };
}
