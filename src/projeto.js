// Leitura do projeto: roteiro.json, narrações (ElevenLabs) e efeitos personalizados.
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './config.js';
import { decodificarAudio } from './ffmpeg.js';
import { SR } from './audio/sintetizador.js';
import { lerJsonFlexivel, aplicarBiblioteca, carregarBiblioteca, PASTA_BIBLIOTECA } from './biblioteca.js';

export const PASTA_NARRACAO = 'narracao';
export const EXT_AUDIO = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.opus', '.webm'];

export function caminhoProjeto(nome) {
  if (!nome) throw new Error('Informe o nome do projeto. Ex.: npm run rascunho -- exemplo');
  const direto = path.resolve(nome);
  if (fs.existsSync(path.join(direto, 'roteiro.json'))) return direto;
  const dir = path.join(RAIZ, 'projetos', nome);
  if (!fs.existsSync(path.join(dir, 'roteiro.json'))) throw new Error(`Projeto não encontrado: ${path.join(dir, 'roteiro.json')}\nCrie um com: npm run novo -- ${nome}`);
  return dir;
}

// Lê o roteiro.json (comentários // permitidos) e expande "cenario"/"personagem" da biblioteca.
export function lerRoteiro(dir) {
  const bruto = lerJsonFlexivel(path.join(dir, 'roteiro.json'));
  return aplicarBiblioteca(bruto, carregarBiblioteca(dir));
}

// Arquivos de narração: narracao/01.mp3, narracao/cena02.mp3, narracao/cena-3.wav ...
// ou explicitamente "narracao": "arquivo.mp3" na cena.
// ---------------------------------------------------------------- narração única
// Um só arquivo (narracao/narracao-completa.mp3) com a narração do vídeo inteiro.
// O áudio é cortado nas pausas: as (N-1) pausas mais longas separam os N trechos,
// um para cada cena que tem "narracaoTexto" no roteiro (ou todas, se nenhuma tiver).
export const NOME_NARRACAO_UNICA = /^(narracao[-_ ]?completa|narracao|completa)$/i;

function dividirPorPausas(dados, partes) {
  const QUADRO = Math.round(SR * 0.01);                           // janelas de 10 ms
  const n = Math.floor(dados.length / QUADRO);
  const rms = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let soma = 0;
    for (let k = 0; k < QUADRO; k++) { const v = dados[i * QUADRO + k]; soma += v * v; }
    rms[i] = Math.sqrt(soma / QUADRO);
  }
  const ordenado = Array.from(rms).sort((a, b) => a - b);
  const p95 = ordenado[Math.floor(n * 0.95)] || 0;
  const limiar = Math.max(0.004, p95 * 0.06);
  const silencio = (i) => rms[i] < limiar;
  // pausas = trechos de silêncio de pelo menos 0,25 s (fora do começo e do fim)
  let ini = 0; while (ini < n && silencio(ini)) ini++;
  let fim = n - 1; while (fim > ini && silencio(fim)) fim--;
  const pausas = [];
  for (let i = ini; i <= fim; i++) {
    if (!silencio(i)) continue;
    let j = i; while (j <= fim && silencio(j)) j++;
    if (j - i >= 25) pausas.push({ a: i, b: j, dur: (j - i) / 100 });
    i = j;
  }
  if (pausas.length < partes - 1) {
    return { erro: `encontrei ${pausas.length + 1} trecho(s) separado(s) por pausas, mas o roteiro tem ${partes} cenas com narração. Deixe uma pausa clara (meio segundo ou mais) entre as falas de cada cena.` };
  }
  const cortes = [...pausas].sort((x, y) => y.dur - x.dur).slice(0, partes - 1).sort((x, y) => x.a - y.a);
  const trechos = [];
  let inicio = ini;
  for (const c of [...cortes, { a: fim + 1, b: fim + 1 }]) {
    const a = Math.max(0, inicio - 5), b = Math.min(n, c.a + 5);       // 50 ms de folga
    trechos.push({ dados: dados.slice(a * QUADRO, b * QUADRO), de: a / 100, ate: b / 100 });
    inicio = c.b;
  }
  return { trechos, pausas: cortes.map((c) => c.dur) };
}

export async function encontrarNarracoes(dir, roteiro, ff) {
  const pasta = path.join(dir, PASTA_NARRACAO);
  const mapa = new Map();
  const arquivos = fs.existsSync(pasta) ? fs.readdirSync(pasta).filter((f) => EXT_AUDIO.includes(path.extname(f).toLowerCase())) : [];
  const unico = arquivos.find((f) => NOME_NARRACAO_UNICA.test(path.parse(f).name));
  if (unico) {
    const cenas = roteiro.cenas || [];
    let alvo = cenas.map((c, i) => (c.narracaoTexto ? i : -1)).filter((i) => i >= 0);
    if (!alvo.length) alvo = cenas.map((c, i) => i).filter((i) => cenas[i].narracao !== false);
    const dados = await decodificarAudio(ff, path.join(pasta, unico));
    const r = dividirPorPausas(dados, alvo.length);
    if (r.erro) throw new Error(`Narração única (${unico}): ${r.erro}`);
    r.trechos.forEach((t, k) => mapa.set(alvo[k], { arquivo: `${unico} [${t.de.toFixed(1)}s–${t.ate.toFixed(1)}s]`, duracao: t.dados.length / SR, dados: t.dados }));
    return { mapa, ignorados: arquivos.filter((f) => f !== unico), pasta, unico, trechos: r.trechos.length };
  }
  const porNumero = new Map();
  for (const f of arquivos) {
    const m = /^(?:cena[\s_-]*)?0*(\d+)(?:\D|$)/i.exec(path.parse(f).name);
    if (m && !porNumero.has(Number(m[1]))) porNumero.set(Number(m[1]), f);
  }
  const ignorados = new Set(arquivos);
  for (const [i, cena] of (roteiro.cenas || []).entries()) {
    let arq = null;
    if (typeof cena.narracao === 'string') {
      arq = path.isAbsolute(cena.narracao) ? cena.narracao : path.join(pasta, cena.narracao);
      if (!fs.existsSync(arq)) throw new Error(`Cena ${i + 1}: narração "${cena.narracao}" não existe em ${pasta}`);
    } else if (cena.narracao !== false && porNumero.has(i + 1)) {
      arq = path.join(pasta, porNumero.get(i + 1));
    }
    if (!arq) continue;
    ignorados.delete(path.basename(arq));
    const dados = await decodificarAudio(ff, arq);
    mapa.set(i, { arquivo: path.basename(arq), duracao: dados.length / SR, dados });
  }
  return { mapa, ignorados: [...ignorados], pasta };
}

// Efeito sonoro personalizado: projeto/sfx/ > biblioteca/sfx/ > sfx/ (raiz).
export function sfxPersonalizado(dir, nome) {
  for (const base of [path.join(dir, 'sfx'), path.join(PASTA_BIBLIOTECA, 'sfx'), path.join(RAIZ, 'sfx')]) {
    for (const ext of EXT_AUDIO) {
      const f = path.join(base, nome + ext);
      if (fs.existsSync(f)) return f;
    }
  }
  return null;
}
