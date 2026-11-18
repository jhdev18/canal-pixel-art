// Biblioteca de assets reutilizáveis entre projetos:
//   biblioteca/sprites/          PNGs usados por qualquer projeto
//   biblioteca/personagens.json  personagens definidos uma vez  -> { "personagem": "joao" }
//   biblioteca/cenarios.json     cenários prontos              -> { "cenario": "vila-noite" }
// Cada projeto pode ter seus próprios personagens.json / cenarios.json, que têm prioridade.
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './config.js';

export const PASTA_BIBLIOTECA = path.join(RAIZ, 'biblioteca');

// JSON com comentários // e vírgulas sobrando permitidos.
export function lerJsonFlexivel(arq) {
  const texto = fs.readFileSync(arq, 'utf8').replace(/^﻿/, '');
  const limpo = texto.split('\n').map((l) => {
    let dentro = false;
    for (let i = 0; i < l.length; i++) {
      if (l[i] === '"' && l[i - 1] !== '\\') dentro = !dentro;
      if (!dentro && l[i] === '/' && l[i + 1] === '/') return l.slice(0, i);
    }
    return l;
  }).join('\n');
  try {
    return JSON.parse(limpo.replace(/,(\s*[\]}])/g, '$1'));
  } catch (e) {
    const m = /position (\d+)/.exec(e.message);
    const onde = m ? ` (perto da linha ${limpo.slice(0, Number(m[1])).split('\n').length})` : '';
    throw new Error(`Erro em ${arq}${onde}: ${e.message}`);
  }
}

function lerOpcional(arq) {
  return fs.existsSync(arq) ? lerJsonFlexivel(arq) : {};
}

export function carregarBiblioteca(projetoDir = null) {
  const lib = {
    personagens: lerOpcional(path.join(PASTA_BIBLIOTECA, 'personagens.json')),
    cenarios: lerOpcional(path.join(PASTA_BIBLIOTECA, 'cenarios.json')),
  };
  if (projetoDir) {
    Object.assign(lib.personagens, lerOpcional(path.join(projetoDir, 'personagens.json')));
    Object.assign(lib.cenarios, lerOpcional(path.join(projetoDir, 'cenarios.json')));
  }
  for (const tipo of ['personagens', 'cenarios']) {
    for (const k of Object.keys(lib[tipo])) if (k.startsWith('_')) delete lib[tipo][k]; // "_comentario"
  }
  return lib;
}

function mesclarElemento(base, el) {
  const r = { ...base, ...el };
  if (base.cores || el.cores) r.cores = { ...(base.cores || {}), ...(el.cores || {}) };
  if (base.luz && el.luz && typeof el.luz === 'object') r.luz = { ...base.luz, ...el.luz };
  return r;
}

function expandirPersonagem(el, lib, onde) {
  if (!el.personagem) return el;
  const base = lib.personagens[el.personagem];
  if (!base) {
    const nomes = Object.keys(lib.personagens);
    throw new Error(`${onde}: personagem "${el.personagem}" não existe na biblioteca.` +
      (nomes.length ? ` Disponíveis: ${nomes.join(', ')}` : ' (biblioteca/personagens.json está vazio ou não existe)'));
  }
  const { personagem, ...resto } = el;
  const r = mesclarElemento(base, resto);
  r.id = r.id || personagem;
  return r;
}

function expandirCenario(cena, lib, onde) {
  if (!cena.cenario) return cena;
  const base = lib.cenarios[cena.cenario];
  if (!base) {
    const nomes = Object.keys(lib.cenarios);
    throw new Error(`${onde}: cenário "${cena.cenario}" não existe na biblioteca.` +
      (nomes.length ? ` Disponíveis: ${nomes.join(', ')}` : ' (biblioteca/cenarios.json está vazio ou não existe)'));
  }
  const { cenario, remover = [], ...resto } = cena;
  const r = { ...base, ...resto };
  // Elementos: os do cenário + os da cena (mesmo id = a cena ajusta o do cenário).
  const elementos = (base.elementos || []).filter((e) => !remover.includes(e.id)).map((e) => ({ ...e }));
  for (const e of cena.elementos || []) {
    const i = e.id ? elementos.findIndex((b) => b.id === e.id) : -1;
    if (i >= 0) elementos[i] = mesclarElemento(elementos[i], e);
    else elementos.push(e);
  }
  r.elementos = elementos;
  r.acoes = [...(base.acoes || []), ...(cena.acoes || [])];
  r.sons = [...(base.sons || []), ...(cena.sons || [])];
  for (const k of ['camera', 'fundoOpcoes', 'luzAmbiente']) {
    if (base[k] && cena[k]) r[k] = { ...base[k], ...cena[k] };
  }
  return r;
}

// Troca "cenario" e "personagem" pelas definições completas da biblioteca.
export function aplicarBiblioteca(roteiro, lib) {
  const cenas = (roteiro.cenas || []).map((c, i) => {
    const onde = `Cena ${i + 1}`;
    const cena = expandirCenario(c, lib, onde);
    cena.elementos = (cena.elementos || []).map((e, j) => expandirPersonagem(e, lib, `${onde}, elemento ${e.id || j + 1}`));
    return cena;
  });
  return { ...roteiro, cenas };
}

export function listarSpritesBiblioteca() {
  const d = path.join(PASTA_BIBLIOTECA, 'sprites');
  return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => /\.png$/i.test(f)) : [];
}
