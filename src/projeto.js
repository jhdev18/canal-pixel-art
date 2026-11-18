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
export async function encontrarNarracoes(dir, roteiro, ff) {
  const pasta = path.join(dir, PASTA_NARRACAO);
  const mapa = new Map();
  const arquivos = fs.existsSync(pasta) ? fs.readdirSync(pasta).filter((f) => EXT_AUDIO.includes(path.extname(f).toLowerCase())) : [];
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
