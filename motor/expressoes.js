// PROTÓTIPO — expressões faciais dos personagens detalhados (moradores, Bia e todos que usam o gerador de pessoas).
// Desenha por cima do rosto pronto: apaga olhos e boca (cor da pele) e pinta a expressão. 2 quadros (respiração).
// No roteiro:
//   - automático: o ícone de emoção muda o rosto enquanto aparece ("!" surpreso, "?" pensativo, "coracao" feliz,
//     "gota" chorando, "raiva" bravo, "..." envergonhado). Desligar numa ação: { "tipo": "emocao", ..., "rosto": false }.
//   - por um tempo: { "tipo": "expressao", "alvo": "bia", "rosto": "feliz", "inicio": 1, "duracao": 2 }
//   - a cena toda: "pose": "rosto-feliz" no elemento (ou ação "trocar" com "estado": "rosto-triste").
export const EXPRESSOES = ['feliz', 'rindo', 'triste', 'chorando', 'bravo', 'surpreso', 'assustado', 'envergonhado', 'pensativo'];
export const ROSTO_DA_EMOCAO = { '!': 'surpreso', '?': 'pensativo', coracao: 'feliz', gota: 'chorando', raiva: 'bravo', '...': 'envergonhado', lampada: 'surpreso' };

const BRANCO = '#ffffff', BOCA = '#5a2020', BOCA2 = '#3a1414', LINGUA = '#c84a5a', LAGRIMA = '#9ad8ff', LAGRIMA2 = '#5aa8e8', SUOR = '#a8e0ff', CORADO = '#f06a6a';

// L: { olhos: [[x, y], [x, y]] (canto de cima/esquerda), w (largura do olho: 2 ou 1), h (altura: 2),
//      boca: [x, y] (centro, linha da boca), sobr: y | null (linha das sobrancelhas), sobrCor, bochechas: [[x, y], ...],
//      pele, sombra, olho (cor), oculos (não pintar acima do olho), sobrPorCima (sobrancelha pintada por cima da franja, sem apagar), semOlhos (óculos escuros), semBoca (cachorro) }
export function aplicarRosto(pix, L, expr) {
  const q = new pix.constructor(pix.w, pix.h); q.d.set(pix.d);
  const set = (x, y, c) => q.set(Math.round(x), Math.round(y), c);
  const [mx, my] = L.boca, w = L.w ?? 2, h = L.h ?? 2;
  // limpa olhos e boca
  if (!L.semOlhos) for (const [ex, ey] of L.olhos) for (let y = ey; y < ey + h; y++) for (let x = ex - (w === 1 ? 1 : 0); x < ex + w + (w === 1 ? 1 : 0); x++) set(x, y, L.pele);
  if (!L.semBoca) for (let x = mx - 2; x <= mx + 2; x++) for (const y of [my, my + 1]) set(x, y, L.pele);
  // expressões que redesenham a sobrancelha: apaga a original ANTES de pintar os olhos (senão apagava o topo do olho)
  if (L.sobr != null && !L.sobrPorCima && ['triste', 'chorando', 'bravo', 'surpreso', 'assustado', 'pensativo'].includes(expr)) {
    const top = Math.min(...L.olhos.map(([, ey]) => ey));
    for (const [ax] of L.olhos) for (let k = -1; k < 3; k++) for (const dy of [-1, 0, 1]) { const yy = L.sobr + dy, xx = ax + k; if (yy < top && q.d[(yy * q.w + xx) * 4 + 3]) set(xx, yy, L.pele); }
  }
  const olho = L.olho;
  const olhos = {
    normal: (ex, ey) => { for (let x = ex; x < ex + w; x++) { set(x, ey, olho); set(x, ey + 1, olho); } if (w === 2) set(ex + 1, ey, BRANCO); },
    arco: (ex, ey) => { if (w === 2) { set(ex - 1, ey + 1, olho); set(ex, ey, olho); set(ex + 1, ey, olho); set(ex + 2, ey + 1, olho); } else { set(ex - 1, ey + 1, olho); set(ex, ey, olho); set(ex + 1, ey + 1, olho); } },
    bravo: (ex, ey, lado) => { for (let x = ex; x < ex + w; x++) { set(x, ey + 1, olho); set(x, ey, L.sombra); } set(lado < 0 ? ex + w - 1 : ex, ey, olho); },
    arregalado: (ex, ey) => { const t = (L.oculos || L.sobr != null) ? 0 : 1; for (let x = ex; x < ex + w; x++) for (let y = ey - t; y < ey + 2; y++) set(x, y, olho); set(ex, ey - t, BRANCO); },   // sem sobrancelha: olho cresce para cima
    susto: (ex, ey, lado) => { const t = L.oculos ? 0 : 1; for (let x = ex - (w === 1 ? 1 : 0); x < ex + w; x++) for (let y = ey - t; y < ey + 2; y++) set(x, y, BRANCO); const px = w === 2 ? (lado < 0 ? ex + 1 : ex) : ex; set(px, ey, olho); set(px, ey + 1, olho); },   // branco grande, pupila pequena no meio
    baixo: (ex, ey) => { for (let x = ex; x < ex + w; x++) { set(x, ey + 1, olho); set(x, ey, L.sombra); } },
    // triste: olho aberto, pálpebra caída por fora e brilho embaixo (olho molhado)
    triste: (ex, ey, lado) => { for (let x = ex; x < ex + w; x++) { set(x, ey, olho); set(x, ey + 1, olho); } set(lado < 0 ? ex : ex + w - 1, ey, L.sombra); if (w === 2) set(lado < 0 ? ex + 1 : ex, ey + 1, LAGRIMA); },
    // chorando: olho apertado (linha com o canto de fora levantado)
    apertado: (ex, ey, lado) => { for (let x = ex - (w === 1 ? 1 : 0); x < ex + w + (w === 1 ? 1 : 0); x++) set(x, ey + 1, olho); set(lado < 0 ? ex - 1 : ex + w, ey, olho); },
    cima: (ex, ey) => { if (w === 2) { set(ex, ey, BRANCO); set(ex, ey + 1, BRANCO); set(ex + 1, ey, olho); set(ex + 1, ey + 1, olho); if (!L.oculos) set(ex + 1, ey - 1, olho); } else { set(ex, ey, olho); set(ex + 1, ey, olho); } },   // olhar de lado e para cima (pensando)
  };
  const bocas = {
    sorriso: () => { set(mx - 2, my, BOCA); for (let x = mx - 1; x <= mx + 1; x++) set(x, my + 1, BOCA); set(mx + 2, my, BOCA); },
    aberta: () => { for (let x = mx - 2; x <= mx + 2; x++) set(x, my, BOCA); for (let x = mx - 1; x <= mx + 1; x++) set(x, my + 1, LINGUA); set(mx - 2, my + 1, BOCA); set(mx + 2, my + 1, BOCA); },
    triste: () => { set(mx - 2, my + 1, BOCA); for (let x = mx - 1; x <= mx + 1; x++) set(x, my, BOCA); set(mx + 2, my + 1, BOCA); },
    reta: () => { for (let x = mx - 2; x <= mx + 2; x++) set(x, my, BOCA); },
    o: () => { for (const x of [mx - 1, mx]) for (const y of [my, my + 1]) set(x, y, BOCA2); set(mx - 1, my, BOCA); },
    berro: () => { for (let x = mx - 1; x <= mx + 1; x++) set(x, my, BOCA2); for (let x = mx - 2; x <= mx + 2; x++) set(x, my + 1, BOCA2); set(mx, my + 1, LINGUA); },
    tremida: () => { [[mx - 2, my + 1], [mx - 1, my], [mx, my + 1], [mx + 1, my], [mx + 2, my + 1]].forEach(([x, y]) => set(x, y, BOCA)); },
    pequena: () => { set(mx, my, BOCA); set(mx + 1, my, BOCA); },
    lado: () => { set(mx + 1, my, BOCA); set(mx + 2, my, BOCA); set(mx + 2, my - 1, BOCA); },
  };
  if (L.semBoca) for (const k in bocas) bocas[k] = () => {};   // cachorro: o focinho fica como está, a expressão vem dos olhos
  const sobr = (forma) => {   // forma: 'triste' (sobe no meio), 'bravo' (desce no meio), 'alta', 'uma' (uma só levantada)
    if (L.sobr == null) return;
    const [[ax], [bx]] = L.olhos, y = L.sobr, c = L.sobrCor;
    const par = (x0, dir, ys) => ys.forEach((dy, k) => set(x0 + k * dir, y + dy, c));
    if (forma === 'triste') { par(ax - 1, 1, [1, 0, -1]); par(bx + w, -1, [1, 0, -1]); }
    else if (forma === 'bravo') { par(ax - 1, 1, [-1, 0, 1]); par(bx + w, -1, [-1, 0, 1]); }
    else if (forma === 'alta') { par(ax - 1, 1, [-1, -1, -1]); par(bx + w, -1, [-1, -1, -1]); }   // levantadas, com 1 px de pele até o olho
    else if (forma === 'uma') { par(ax - 1, 1, [0, 0, 0]); par(bx + w, -1, [-1, -2, -1]); }
  };
  const lados = [-1, 1];
  const cada = (fn) => { if (!L.semOlhos) L.olhos.forEach(([ex, ey], k) => fn(ex, ey, lados[k])); };
  const corar = (forte) => (L.bochechas || []).forEach(([x, y]) => { set(x, y, CORADO); if (forte) { set(x + (x < mx ? 1 : -1), y, CORADO); set(x, y - 1, CORADO); } });
  switch (expr) {
    case 'feliz': cada(olhos.arco); bocas.sorriso(); corar(false); break;
    case 'rindo': cada(olhos.arco); bocas.aberta(); corar(true); break;
    case 'triste': cada(olhos.triste); bocas.triste(); sobr('triste'); break;
    case 'chorando': {   // olhos apertados, duas lágrimas escorrendo pela bochecha (claro em cima, escuro embaixo), boca aberta
      cada(olhos.apertado); bocas.berro(); sobr('triste');
      if (!L.semOlhos) L.olhos.forEach(([ex, ey], k) => { const x = k === 0 ? ex : ex + w - 1; set(x, ey + 2, LAGRIMA); set(x, ey + 3, LAGRIMA); set(x, ey + 4, LAGRIMA2); });
      break;
    }
    case 'bravo': cada(olhos.bravo); bocas.reta(); sobr('bravo'); corar(false); break;
    case 'surpreso': cada(olhos.arregalado); bocas.o(); sobr('alta'); break;
    case 'assustado': cada(olhos.susto); bocas.tremida(); sobr('triste'); { const [bx, by] = L.olhos[1]; set(bx + w + 2, by - 2, SUOR); set(bx + w + 2, by - 1, SUOR); set(bx + w + 1, by - 1, SUOR); } break;
    case 'envergonhado': cada(olhos.baixo); bocas.tremida(); corar(true); break;
    case 'pensativo': cada(olhos.cima); bocas.lado(); sobr('uma'); break;
    default: cada(olhos.normal); bocas.pequena();
  }
  return q;
}

// Acrescenta as animações "rosto-<expressão>" (2 quadros cada) a um sprite. quadros(expr) → [quadro, quadroRespirando]
export function adicionarExpressoes(sprite, quadros) {
  for (const e of EXPRESSOES) {
    const n = sprite.quadros.length, [a, b] = quadros(e);
    sprite.quadros.push(a, b);
    sprite.anims['rosto-' + e] = { q: [n, n, n + 1, n + 1], fps: 2 };
  }
  return sprite;
}

// Sprites sem rosto desenhado (guardiões, fantasmas, RPG): "rosto-x" usa o estado parecido que o sprite tiver.
const EQUIVALENTES = {
  feliz: ['feliz', 'acenar', 'rindo'], rindo: ['rindo', 'feliz'], triste: ['timido', 'dormindo'], chorando: ['timido', 'tremendo'],
  bravo: ['assustar', 'alerta', 'agarrar'], surpreso: ['alerta', 'olho-aberto', 'olhos'], assustado: ['tremendo', 'timido', 'alerta'],
  envergonhado: ['timido'], pensativo: ['olhando-lado'],
};
export function rostoEquivalente(anims, nome) {
  if (!nome || !nome.startsWith('rosto-')) return null;
  return (EQUIVALENTES[nome.slice(6)] || []).find((k) => anims[k]) || null;
}
