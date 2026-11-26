// Ajuda a achar o MOMENTO do corte de zoom / reação (pedido do usuário, 26/11/2026): a "palavra forte" de cada fala do narrador e
// em que fração da fala ela cai (o f do cortesZoom/rostos do nm.mjs). Heurística: palavras de choque/virada > o que vem depois de ":" >
// número > a última palavra da última frase (no português a ênfase costuma cair no fim: "Sem TCHAU.", "Elas LEVAVAM.").
const FORTES = /^(nunca|sempre|todos?|todas?|ningu[eé]m|nada|s[oó]|sozinh[oa]s?|sumi[ua]|sumiram|desaparec\w*|congel\w*|parou|pararam|primeir[oa]|[uú]ltim[oa]|mil|cem|dez|doze|vinte|morto|morreu|sorrindo|sorriu|olhou|gritou|chorou|tremia|levavam?|for[cç]a|pausa|socorro|sem|fechar|apagar|apagou|gigante|metade|nenhum[a]?)$/i;
const norm = (w) => w.replace(/[.,!?:;…"“”'()]/g, '');
export function palavraForte(texto = '') {
  const t = texto.trim(); if (!t) return null;
  const palavras = []; const re = /\S+/g; let m;
  while ((m = re.exec(t))) palavras.push({ w: norm(m[0]), i: m.index, fim: m.index + m[0].length, bruto: m[0] });
  if (!palavras.length) return null;
  const f = (p) => +Math.min(0.9, Math.max(0.05, p.i / t.length)).toFixed(2);
  const forte = [...palavras].reverse().find((p) => FORTES.test(p.w));
  if (forte) return { palavra: forte.w, f: f(forte) };
  const dois = t.indexOf(':'); if (dois > 0) { const p = palavras.find((q) => q.i > dois && q.w.length > 2); if (p) return { palavra: p.w, f: f(p) }; }
  const num = [...palavras].reverse().find((p) => /^\d+$/.test(p.w)); if (num) return { palavra: num.w, f: f(num) };
  const ult = [...palavras].reverse().find((p) => p.w.length > 2) || palavras[palavras.length - 1];
  return { palavra: ult.w, f: f(ult) };
}
// tipos de ação que contam como "algo se mexendo" de verdade (gente/objeto mudando de lugar ou de forma)
export const MOVIMENTO = new Set(['andar', 'correr', 'mover', 'pular', 'sentar', 'levantar', 'esporos', 'crescer', 'golpe', 'espirrar', 'desaparecer', 'aparecer', 'sumir', 'magia', 'explosao', 'fogos', 'sombra']);
// quebras de padrão (o que "acorda" quem está assistindo): corte de zoom, flash, tremor, ícone/rosto de reação
export const QUEBRA = (a) => a.corte || ['flash', 'tremer', 'emocao', 'expressao', 'fogos', 'explosao'].includes(a.tipo);
// fração da cena com movimento (união dos intervalos das ações de movimento)
export function coberturaMovimento(c) {
  const iv = (c.acoes || []).filter((a) => MOVIMENTO.has(a.tipo)).map((a) => [a.inicio, a.inicio + Math.max(a.duracao || 0, 0.4)]).sort((p, q) => p[0] - q[0]);
  let tot = 0, ini = -1, fim = -1;
  for (const [a, b] of iv) { if (a > fim) { if (fim > ini) tot += fim - ini; ini = a; fim = b; } else fim = Math.max(fim, b); }
  if (fim > ini) tot += fim - ini;
  return Math.min(1, tot / Math.max(0.1, c.duracao));
}
