// Poses sentadas geradas a partir dos quadros em pé (28x44): mantém tronco, braços e cabeça do desenho
// original e redesenha só as pernas.
//   de frente: coxas vistas de frente (colo) + canelas descendo até o chão (sofá, poltrona, banco)
//   de lado:   coxa na horizontal + canela na vertical (cadeira, carteira) — virado para a direita
// O assento fica a ~13 px do chão (altura do joelho); para assentos mais altos use "y" no elemento.
import { Pix } from './pixel.js';

const cor = (p, x, y) => { if (!p.dentro(x, y)) return null; const i = (y * p.w + x) * 4; return p.d[i + 3] ? '#' + [0, 1, 2].map((k) => p.d[i + k].toString(16).padStart(2, '0')).join('') : null; };
const clarear = (hex, k) => '#' + [1, 3, 5].map((i) => Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - k) + 255 * k * 0.9)).toString(16).padStart(2, '0')).join('');
const escurecer = (hex, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
// primeira cor opaca que não é contorno, procurando numa linha a partir de x
function amostra(p, y, xs) { for (const x of xs) { const c = cor(p, x, y); if (c && !escura(c)) return c; } return cor(p, xs[0], y) || '#888888'; }
const escura = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); return v[0] + v[1] + v[2] < 120; };

// copia linhas [0, ate) de src para dst deslocadas dy
function copiar(src, dst, ate, dy) { for (let y = 0; y < ate; y++) for (let x = 0; x < src.w; x++) { const i = (y * src.w + x) * 4; if (src.d[i + 3]) dst.d.set(src.d.subarray(i, i + 4), ((y + dy) * dst.w + x) * 4); } }
// junta "novo" em dst com contorno próprio (sem engrossar o contorno do que já existe)
function juntar(dst, novo, contorno) {
  const borda = [];
  for (let y = 0; y < novo.h; y++) for (let x = 0; x < novo.w; x++) {
    if (novo.opaco(x, y)) continue;
    if (novo.opaco(x - 1, y) || novo.opaco(x + 1, y) || novo.opaco(x, y - 1) || novo.opaco(x, y + 1)) borda.push([x, y]);
  }
  for (let k = 0; k < novo.d.length; k += 4) if (novo.d[k + 3]) dst.d.set(novo.d.subarray(k, k + 4), k);
  for (const [x, y] of borda) if (!dst.opaco(x, y)) dst.set(x, y, contorno);
}

// q: quadril (linha onde começam as pernas no quadro em pé). frente: quadro de frente em pé.
export function sentadoFrente(frente, { q = 30, desce = 0, coxa } = {}) {
  const W = frente.w, H = frente.h, p = new Pix(W, H), novo = new Pix(W, H);
  const calca = coxa || amostra(frente, q + 2, [11, 16, 12, 15]), canela = amostra(frente, 36, [11, 16, 12, 15]);
  const sapato = amostra(frente, 40, [10, 17, 11, 16]), cont = cor(frente, 9, 38) || escurecer(calca, 0.35);
  copiar(frente, p, q + 1, desce);
  const y0 = q + 1 + desce;                                   // colo: coxas vindo na direção da câmera
  for (let y = y0; y < y0 + 3; y++) for (let x = 8; x <= 19; x++) {
    const meio = x === 13 || x === 14;
    novo.set(x, y, y === y0 + 2 ? clarear(calca, 0.3) : meio && y > y0 ? escurecer(calca, 0.78) : x === 19 ? escurecer(calca, 0.82) : calca);
  }
  for (let y = y0 + 3; y < 40; y++) for (const x0 of [9, 15]) for (let x = x0; x < x0 + 4; x++) novo.set(x, y, x === x0 + 3 ? escurecer(canela, 0.85) : canela);
  for (let y = 40; y < 43; y++) for (const x0 of [8, 14]) for (let x = x0; x < x0 + 6; x++) novo.set(x, y, y === 40 ? clarear(sapato, 0.2) : sapato);
  juntar(p, novo, cont);
  return p;
}

// lado: quadro de lado (virado para a direita) em pé; frente: para pegar as cores das pernas.
export function sentadoLado(lado, frente, { q = 30, desce = 2, coxa } = {}) {
  const W = lado.w, H = lado.h, p = new Pix(W, H), novo = new Pix(W, H);
  const calca = coxa || amostra(frente, q + 2, [11, 16, 12, 15]), canela = amostra(frente, 36, [11, 16, 12, 15]);
  const sapato = amostra(frente, 40, [10, 17, 11, 16]), cont = cor(frente, 9, 38) || escurecer(calca, 0.35);
  copiar(lado, p, q + 1, desce);
  const y0 = q + desce - 1;                                   // coxa na horizontal, para a frente
  for (let y = y0; y < y0 + 4; y++) for (let x = 10; x <= 21; x++) novo.set(x, y, y === y0 ? clarear(calca, 0.22) : y === y0 + 3 ? escurecer(calca, 0.82) : calca);
  for (let y = y0 + 4; y < 40; y++) for (let x = 18; x <= 21; x++) novo.set(x, y, x === 21 ? escurecer(canela, 0.85) : canela);   // canela
  for (let y = 40; y < 43; y++) for (let x = 17; x <= 24; x++) novo.set(x, y, y === 40 ? clarear(sapato, 0.2) : sapato);           // pé para a frente
  juntar(p, novo, cont);
  return p;
}

// Acrescenta as poses a um sprite de personagem: anims "sentado" (de frente, respirando/piscando) e "sentado-lado".
export function adicionarSentado(sprite, { frente = [0, 1, 2], lado = 3, q = 30, coxa } = {}) {
  const Q = sprite.quadros, n = Q.length;
  const f = frente.map((i) => sentadoFrente(Q[i], { q, coxa }));
  const l = sentadoLado(Q[lado], Q[frente[0]], { q, coxa });
  Q.push(...f, l);
  sprite.anims.sentado = { q: [n, n, n + 2, n + 2, n, n, n + 2, n + 2, n + 1, n + 2], fps: 4 };
  sprite.anims['sentado-lado'] = { q: [n + 3], fps: 1 };
  return sprite;
}

// ------------------------------------------------------------------ de costas
// Gera o quadro "de costas" a partir do de frente: rosto vira cabelo (ou capuz), a frente da roupa vira as
// costas lisas e, se tiver, a mochila aparece. op:
//   cabeca: { cx, cy, rx, ry } (elipse do rosto)   de: tons a trocar → para: tons novos (mesma ordem)
//   detalhes: cores do rosto (olhos, boca...) que viram para[1]   tudo: true = troca tudo dentro do rosto
//   tronco: { x0, x1, y0, y1, tons: [luz, base, sombra] }   mochila: tons [luz, base, sombra, contorno]
export function costasDe(frente, op) {
  const p = new Pix(frente.w, frente.h); p.d.set(frente.d);
  const mapa = new Map((op.de || []).map((c, i) => [c.toLowerCase(), op.para[i]]));
  const det = new Set((op.detalhes || []).map((c) => c.toLowerCase()));
  const { cx, cy, rx, ry } = op.cabeca;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const c = cor(p, x, y); if (!c) continue;
    const d2 = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
    if (d2 > 1) continue;
    const lado = x + 0.5 > cx + rx * 0.55 ? op.para[2] : op.para[1];
    if (op.tudo) { p.set(x, y, lado); continue; }                       // capuz: tudo liso
    // miolo da cabeça: some com sobrancelhas, contorno do rosto e da franja (viram cabelo)
    if (d2 < 0.72 && (escura(c) || c === op.para[3] || c === (op.de[3] || '').toLowerCase())) { p.set(x, y, lado); continue; }
    if (mapa.has(c)) p.set(x, y, mapa.get(c)); else if (det.has(c)) p.set(x, y, lado);
  }
  if (op.tronco) {                                    // frente da roupa → costas lisas
    const t = op.tronco;
    for (let y = t.y0; y <= t.y1; y++) for (let x = t.x0; x <= t.x1; x++) {
      const c = cor(p, x, y); if (!c || escura(c)) continue;
      p.set(x, y, x === t.x1 ? t.tons[2] : y === t.y0 ? t.tons[0] : t.tons[1]);
    }
  }
  if (op.mochila) {                                   // mochila nas costas
    const [l, b, s, k] = op.mochila, y0 = op.tronco ? op.tronco.y0 + 1 : 18;
    for (let y = y0; y < y0 + 11; y++) for (let x = 9; x <= 18; x++) {
      const borda = x === 9 || x === 18 || y === y0 || y === y0 + 10;
      p.set(x, y, borda ? k : y === y0 + 4 ? s : x === 10 || y === y0 + 1 ? l : x === 17 ? s : b);
    }
    for (let x = 12; x <= 15; x++) p.set(x, y0 + 7, s);   // bolso
  }
  return p;
}

// Sentado de costas: as pernas vão para a frente (escondidas pelo corpo/carteira); fica o tronco apoiado no
// assento, com o quadril a ~assento px do chão (o encosto da cadeira cobre a parte de baixo das costas).
export function sentadoCostas(costas, { q = 30, assento = 9, coxa } = {}) {
  const W = costas.w, H = costas.h, p = new Pix(W, H), novo = new Pix(W, H);
  const calca = coxa || amostra(costas, q + 2, [11, 16, 12, 15]), cont = cor(costas, 9, 38) || escurecer(calca, 0.35);
  const desce = Math.max(0, H - 1 - assento - (q + 3));
  const fundo = q + 3 + desce;                         // última linha do corpo (apoiada no assento)
  copiar(costas, p, q + 1, desce);
  for (let y = q + 1 + desce; y <= fundo; y++) for (let x = 8; x <= 19; x++)   // quadril/bumbum no assento
    novo.set(x, y, y === fundo ? escurecer(calca, 0.8) : x === 19 ? escurecer(calca, 0.85) : (x === 13 || x === 14) && y === fundo - 1 ? escurecer(calca, 0.85) : calca);
  juntar(p, novo, cont);
  return p;
}

// Acrescenta "costas" (em pé, de costas para a câmera) e "sentado-costas" (sentado de costas: olhando para a
// lousa, para a TV...). opCostas: as opções de costasDe (sem o quadro).
export function adicionarCostas(sprite, opCostas, { q = 30, coxa } = {}) {
  const Q = sprite.quadros, n = Q.length;
  const c0 = costasDe(Q[0], opCostas), c1 = costasDe(Q[2], { ...opCostas, cabeca: { ...opCostas.cabeca, cy: opCostas.cabeca.cy - 1 }, tronco: opCostas.tronco && { ...opCostas.tronco, y0: opCostas.tronco.y0 - 1, y1: opCostas.tronco.y1 - 1 } });
  Q.push(c0, c1, sentadoCostas(c0, { q, coxa }), sentadoCostas(c1, { q, coxa }));
  sprite.anims.costas = { q: [n, n, n + 1, n + 1], fps: 2 };
  sprite.anims['sentado-costas'] = { q: [n + 2, n + 2, n + 3, n + 3], fps: 2 };
  return sprite;
}
