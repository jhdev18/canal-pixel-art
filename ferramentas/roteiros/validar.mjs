import { lerRoteiro, caminhoProjeto } from '../../src/projeto.js';
import { carregarBiblioteca, aplicarBiblioteca } from '../../src/biblioteca.js';
import { resolverRoteiro } from '../../motor/compartilhado/linhaDoTempo.js';
import fs from 'node:fs';
const cat = fs.readFileSync(new URL('../../biblioteca/CATALOGO.md', import.meta.url), 'utf8');
const sprites = new Set([...cat.matchAll(/^\| `([^`]+)` \|/mg)].map((m) => m[1]));
for (const nome of process.argv.slice(2)) {
  const dir = caminhoProjeto(nome);
  const bruto = lerRoteiro(dir);
  const lib = carregarBiblioteca(dir);
  const r0 = aplicarBiblioteca(bruto, lib);
  const r = resolverRoteiro(r0, new Map(), { fps: 30 });
  const prob = [];
  r.cenas.forEach((c, i) => {
    if (c.cenario && !lib.cenarios[c.cenario] && !bruto.cenas[i].vista) prob.push(`cena ${i + 1}: cenário ${c.cenario}?`);
    for (const e of bruto.cenas[i].elementos) {
      if (e.personagem && !lib.personagens[e.personagem]) prob.push(`cena ${i + 1}: personagem ${e.personagem}?`);
      if (e.sprite && !sprites.has(e.sprite)) prob.push(`cena ${i + 1}: sprite ${e.sprite}?`);
    }
    const ids = new Set(c.elementos.map((e) => e.id));
    for (const a of c.acoes) if (a.alvo && !ids.has(a.alvo)) prob.push(`cena ${i + 1}: alvo ${a.alvo} não existe`);
    if (!c.narracaoTexto) return; const fimFala = c.narracaoInicio + c.narracaoTexto.length * 0.065;
    const fimAc = c.acoes.reduce((m, a) => Math.max(m, a.inicio + a.duracao), 0);
    if (fimAc > fimFala + 0.05) prob.push(`cena ${i + 1}: ações até ${fimAc.toFixed(2)}s > fala ${fimFala.toFixed(2)}s`);
  });
  const fala = r.cenas.reduce((s, c) => s + (c.narracaoTexto || '').length * 0.065, 0);
  console.log(`${nome}: ${r.cenas.length} cenas, total sem áudio ${r.duracaoTotal.toFixed(0)} s, fala ~${fala.toFixed(0)} s`);
  prob.forEach((p) => console.log('   ⚠', p));
}
