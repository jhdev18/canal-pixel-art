import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PADRAO = {
  ffmpeg: 'ffmpeg', encoder: 'auto', navegador: 'auto', caminhoNavegador: '', mostrarJanela: false,
  permitirRenderizacaoCPU: false,
  rascunho: { fps: 15, resolucao: 540 },
  final: { fps: 30, resolucao: 1080, qualidade: 18, crt: false },
  audio: { volumeNarracao: 1, volumeEfeitos: 0.7, volumeAmbiente: 0.35, abaixarEfeitosNaNarracao: 0.45, normalizar: true, lufs: -14 },
};

export function carregarConfig() {
  const arq = path.join(RAIZ, 'config.json');
  let usuario = {};
  if (fs.existsSync(arq)) {
    try { usuario = JSON.parse(fs.readFileSync(arq, 'utf8')); }
    catch (e) { throw new Error(`config.json inválido: ${e.message}`); }
  }
  const cfg = { ...PADRAO, ...usuario };
  for (const k of ['rascunho', 'final', 'audio']) cfg[k] = { ...PADRAO[k], ...(usuario[k] || {}) };
  if (process.env.FFMPEG_PATH) cfg.ffmpeg = process.env.FFMPEG_PATH;
  if (process.env.NAVEGADOR_CAMINHO) cfg.caminhoNavegador = process.env.NAVEGADOR_CAMINHO;
  if (process.env.PERMITIR_CPU === '1') cfg.permitirRenderizacaoCPU = true;
  if (process.env.ENCODER) cfg.encoder = process.env.ENCODER;
  return cfg;
}
