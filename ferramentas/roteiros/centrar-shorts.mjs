// node ferramentas/roteiros/centrar-shorts.mjs <projeto> [--ver]
// Centraliza a câmera do Shorts (bloco "vertical") de TODAS as cenas do diorama de um roteiro.json já pronto, medindo a cena
// resolvida no tempo — a mesma conta do aviso [centro] do `npm run conferir` (medirCentro em motor/compartilhado/centro.js).
// Em quem centrar: "vertical.centrarEm" da cena, senão todos os personagens com papel (sem figurantes, "sobre" e "tela");
// cena só com figurantes centra neles. --ver só mostra, não grava. Pula vídeos "postado".
// Vídeo novo feito com o nm.mjs já sai centrado (o salvar() faz isto sozinho); use esta ferramenta nos roteiros antigos ou feitos à mão.
import fs from 'node:fs';
import path from 'node:path';
import { caminhoProjeto, lerRoteiro } from '../../src/projeto.js';
import { lerJsonFlexivel } from '../../src/biblioteca.js';
import { resolverRoteiro, estadoElemento } from '../../motor/compartilhado/linhaDoTempo.js';
import { centrarCena } from '../../motor/compartilhado/centro.js';

const [nome, flag] = process.argv.slice(2);
const dir = caminhoProjeto(nome), arq = path.join(dir, 'roteiro.json');
const txt = fs.readFileSync(arq, 'utf8'), bruto = lerJsonFlexivel(arq);
if (bruto.postado) { console.log(`${nome}: já postado — não mexer`); process.exit(0); }
const linhas = txt.split('\n'), nCab = linhas.findIndex((l) => !/^\s*\/\//.test(l));
const comentarioDentro = linhas.slice(nCab).some((l) => /^\s*\/\//.test(l) || /[,{[]\s*\/\/.*$/.test(l));
const r = resolverRoteiro(lerRoteiro(dir), new Map(), { fps: 30 });
let mudou = 0;
r.cenas.forEach((c, i) => {
  const cb = bruto.cenas[i], res = centrarCena(c, cb, estadoElemento);
  if (!res || (Math.abs(res.desvio) <= 4 && !res.centrarEm)) return;
  console.log(`cena ${String(i + 1).padStart(2)}: x ${res.xAntes} → ${res.x} (${Math.round(res.desvio)} px; ${res.nota})`);
  cb.vertical = { ...(cb.vertical || {}), ...(res.centrarEm ? { centrarEm: res.centrarEm } : {}), camera: { ...(cb.vertical?.camera || cb.camera || {}), x: res.x } };
  mudou++;
});
if (flag === '--ver' || !mudou) { console.log(`${nome}: ${mudou} cena(s) a centralizar${flag === '--ver' ? ' (só mostrando)' : ''}`); process.exit(0); }
if (comentarioDentro) { console.log(`${nome}: o roteiro tem comentários no meio do JSON — aplique os valores acima à mão (gravar apagaria os comentários)`); process.exit(1); }
fs.writeFileSync(arq, linhas.slice(0, nCab).join('\n') + (nCab ? '\n' : '') + JSON.stringify(bruto, null, 1) + '\n');
console.log(`${nome}: ${mudou} cena(s) centralizada(s)`);
