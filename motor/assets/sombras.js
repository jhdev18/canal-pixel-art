// PROTÓTIPO — monstros de SOMBRA em PIXEL ART 2D (substituem os monstros 3D, que o usuário achou esquisitos).
// v2 (o usuário não gostou da textura da v1): simples como o "vulto" — preto chapado, luz fraca na borda, pés sumindo em
// pontilhado e olhos brancos que brilham; o movimento vem da forma (braços, tentáculos, passos). Use "escala": 2 para dar presença (regra 10 das cenas).
//   sombra-alta        vulto alto e magro de braços compridos. parado, olhos, sorriso (boca de dentes brancos), agarrar
//                      (braços para a frente), andando (balança, os pés viram fumaça)
//   sombra-tentaculos  poça escura no chão com tentáculos que balançam. parado (baixos), subindo (altos), agarrar (curvados para a frente)
//   sombra-olhos       massa de sombra com muitos olhos que piscam em tempos diferentes. parado, olhando (todos olham para o lado)
//   sombra-rastejante  pessoa de sombra andando de quatro (joelhos e cotovelos para cima, cabeça baixa). parado (cabeça aos trancos),
//                      andando/correndo (passada), olhos
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const BASE = '#0c0a14', MEIO = '#16121f', BORDA = '#1e1a2c', OLHO = '#f4f0ff', K = '#05040a';
const hash = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// pinta uma máscara (função dentro(x, y)) como sombra SIMPLES, no estilo do "vulto": preto chapado, uma luz fraca só na
// borda da esquerda e de cima, e a base sumindo em pontilhado (sem manchas, sem borda fervendo — pedido do usuário).
function pintarSombra(W, H, dentro, f, { base = H } = {}) {
  const p = new Pix(W, H), b = new Pix(W, H);
  const em = (x, y) => x >= 0 && y >= 0 && x < W && y < H && dentro(x, y);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!em(x, y)) continue;
    p.set(x, y, (!em(x - 1, y) || !em(x, y - 1)) ? BORDA : BASE);
  }
  for (let y = base - 5; y < base; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (p.d[i + 3] && ((x + y) % 2 === 0 || y >= base - 2) && (y - (base - 6)) / 5 > ((x * 7 + y * 3) % 5) / 5) p.d[i + 3] = 0; }
  void f;
  return { p, b };
}
const olho = (p, b, x, y, cor = OLHO, w = 1) => { for (let k = 0; k < w; k++) { p.set(x + k, y, cor); b.set(x + k, y, cor); } };

// ------------------------------------------------------------------ sombra-alta
function sombraAlta(f, { olhos = false, sorriso = false, agarrar = false, andar = false } = {}) {
  const passo = andar ? [-1, 0, 1, 0][f % 4] : 0;
  const W = 34, H = 66, cx = 17 + Math.round(Math.sin(f * 0.8) * 0.6) + passo;
  const dentro = (x, y) => {
    const dx = x - cx;
    if (y < 12) return (dx * dx) / 14 + ((y - 6.5) ** 2) / 30 < 1;                             // cabeça pequena e comprida
    if (y < 15) return Math.abs(dx) < 2;                                                       // pescoço fino
    if (y < 40) { const m = y < 19 ? 3 + (y - 15) * 1.4 : 8.6 - (y - 19) * 0.16; if (Math.abs(dx) < m) return true; }   // ombros largos → cintura
    // braços compridos até os joelhos (ou levantados para a frente/cima no "agarrar")
    for (const s of [-1, 1]) {
      if (agarrar) { const ax = cx + s * (9 + (19 - y) * 0.15); if (y >= 2 && y < 22 && Math.abs(x - ax) < 1.6) return true; if (y < 4 && Math.abs(x - ax) < 2.6 && (x + y + f) % 2) return true; }
      else { const ax = cx + s * (8 + (y - 17) * 0.09) + Math.round(Math.sin(f * 0.9 + s) * 0.7); if (y >= 17 && y < 52 && Math.abs(x - ax) < 1.5) return true; if (y >= 50 && y < 56 && Math.abs(x - ax - s * ((y - 50) % 2)) < 0.9) return true; }   // dedos compridos
    }
    if (y >= 40) { for (const s of [-1, 1]) if (Math.abs(x - (cx + s * 3.2) - s * (passo && s === Math.sign(passo) ? 1 : 0)) < 1.6) return true; }   // pernas finas
    return false;
  };
  const { p, b } = pintarSombra(W, H, dentro, f);
  const pisca = !olhos && f % 12 === 11;
  if (!pisca) { olho(p, b, cx - 2, 6, olhos ? '#ff3a4a' : OLHO); olho(p, b, cx + 1, 6, olhos ? '#ff3a4a' : OLHO); if (olhos) { olho(p, b, cx - 2, 5, '#ffb0b8'); olho(p, b, cx + 1, 5, '#ffb0b8'); } }
  if (sorriso) { for (let x = cx - 3; x <= cx + 3; x++) { olho(p, b, x, 9 + (Math.abs(x - cx) === 3 ? -1 : 0), (x + f) % 2 ? OLHO : '#c8c4d8'); } for (let x = cx - 2; x <= cx + 2; x += 2) olho(p, b, x, 10, OLHO); }
  return { p, b };
}
// ------------------------------------------------------------------ sombra-tentaculos
function sombraTentaculos(f, { alto = false, agarrar = false } = {}) {
  const W = 56, H = alto ? 60 : 44, cy = H - 5;
  const tent = [-18, -9, 0, 9, 18].map((dx, k) => ({ x0: 28 + dx, alt: (alto ? 44 : 28) - Math.abs(dx) * 0.6 + hash(k, 5) * 6, fase: hash(k, 9) * 6, lado: dx < 0 ? -1 : 1 }));
  const dentro = (x, y) => {
    if (((x - 28) ** 2) / 600 + ((y - cy) ** 2) / 14 < 1) return true;                       // poça no chão
    for (const T of tent) {
      const sobe = cy - y; if (sobe < 0 || sobe > T.alt) continue;
      const t = sobe / T.alt, larg = 3.2 * (1 - t) + 0.6;
      let desvio = Math.sin(t * 4 + f * 0.7 + T.fase) * 4 * t;
      if (agarrar) desvio += T.lado * -1 * t * t * 10;                                          // as pontas se curvam para o meio
      if (Math.abs(x - (T.x0 + desvio)) < larg) return true;
    }
    return false;
  };
  const r = pintarSombra(W, H, dentro, f, { base: H + 4 });
  for (const [x, y] of [[24, cy - 1], [32, cy - 1]]) olho(r.p, r.b, x, y, f % 16 < 14 ? OLHO : MEIO);    // dois olhinhos na poça
  return r;
}
// ------------------------------------------------------------------ sombra-olhos
function sombraOlhos(f, { olhando = false } = {}) {
  const W = 44, H = 38;
  const dentro = (x, y) => { const dx = x - 22, dy = y - 21 - Math.sin(x * 0.4 + f * 0.6) * 1.2; return (dx * dx) / 400 + (dy * dy) / 260 < 1 || (y > 30 && Math.abs(dx) < 20 && hash(x, 3) > 0.2); };
  const { p, b } = pintarSombra(W, H, dentro, f, { base: H });
  const OLHOS = [[10, 14, 2], [18, 9, 3], [27, 12, 2], [33, 18, 2], [14, 22, 3], [24, 20, 3], [30, 26, 2], [8, 27, 2]];
  OLHOS.forEach(([x, y, w], k) => {
    if ((f + k * 5) % 22 < 2) { olho(p, b, x, y + 1, BORDA, w); return; }                    // pisca (cada um num tempo)
    for (let i = 0; i < w; i++) { p.set(x + i, y, '#d8d4e8'); p.set(x + i, y + 1, '#d8d4e8'); }
    const px = olhando ? x + w - 1 : x + Math.floor(w / 2) + (Math.floor((f + k) / 6) % 2 ? 0 : -1 + (w > 2 ? 1 : 0));
    olho(p, b, Math.max(x, Math.min(x + w - 1, px)), y + 1, K); olho(p, b, x, y, OLHO, w);
  });
  return { p, b };
}
// ------------------------------------------------------------------ sombra-rastejante (de lado, anda para a direita)
function sombraRastejante(f, { andando = false, olhos = false } = {}) {
  const W = 50, H = 30, ch = 24;   // ch = linha do chão
  const ciclo = andando ? f % 4 : 0, sobe = [0, 1, 0, 1][ciclo];
  const tron = (x, y) => { const t = (x - 12) / 22; return t >= 0 && t <= 1 && Math.abs(y - (11 + t * 2 + sobe * 0.5)) < 3 - t * 0.8; };   // tronco horizontal
  const membro = (x, y, ox, oy, jx, jy, px, py) => {   // ombro/quadril (ox,oy) → joelho/cotovelo para cima (jx,jy) → mão/pé no chão (px,py)
    const seg = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay), t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (L * L))); return Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))) < 1.2; };
    return seg(ox, oy, jx, jy) || seg(jx, jy, px, py);
  };
  const passos = [[0, 3], [3, 0], [0, 3], [3, 0]][ciclo];
  const dentro = (x, y) => tron(x, y)
    || ((x - 38) ** 2) / 12 + ((y - 15 - (andando ? 0 : (f % 9 === 0 ? 2 : 0))) ** 2) / 9 < 1   // cabeça baixa na frente (aos trancos)
    || membro(x, y, 33, 12, 36 + passos[0], 4, 40 + passos[0] * 1.5, ch) || membro(x, y, 31, 12, 30 - passos[1], 5, 34 - passos[1], ch)   // braços (cotovelos para cima)
    || membro(x, y, 14, 12, 10 + passos[1], 3, 16 + passos[1] * 1.5, ch) || membro(x, y, 13, 12, 6 - passos[0], 5, 9 - passos[0], ch);    // pernas (joelhos para cima)
  const { p, b } = pintarSombra(W, H, dentro, f, { base: H + 4 });
  if (olhos || f % 10 < 9) { olho(p, b, 39, 14, olhos ? '#ff3a4a' : OLHO); olho(p, b, 41, 14, olhos ? '#ff3a4a' : OLHO); }
  return { p, b };
}

function sprite(fn, estados) {
  const quadros = [], brilho = [], anims = {};
  for (const [nome, op, n, fps] of estados) { anims[nome] = { q: [], fps }; for (let f = 0; f < n; f++) { const { p, b } = fn(f, op); anims[nome].q.push(quadros.length); quadros.push(p.contorno(K)); brilho.push(b); } }
  // todos os quadros do mesmo tamanho (alinha pela base) — alguns estados são mais altos
  const Wm = Math.max(...quadros.map((q) => q.w)), Hm = Math.max(...quadros.map((q) => q.h));
  const alinhar = (q) => { if (q.w === Wm && q.h === Hm) return q; const n = new Pix(Wm, Hm), dx = (Wm - q.w) >> 1, dy = Hm - q.h; for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) { const i = (y * q.w + x) * 4; if (q.d[i + 3]) n.d.set(q.d.subarray(i, i + 4), ((y + dy) * Wm + x + dx) * 4); } return n; };
  return { quadros: quadros.map(alinhar), brilho: brilho.map(alinhar), anims, sombra: true, personagem: true };
}

registrarSprites({
  'sombra-alta': () => sprite(sombraAlta, [['parado', {}, 12, 8], ['olhos', { olhos: true }, 8, 8], ['sorriso', { sorriso: true }, 8, 8], ['agarrar', { agarrar: true }, 8, 8],
    ['andando', { andar: true }, 8, 6], ['correndo', { andar: true }, 8, 12], ['olhos-andando', { andar: true, olhos: true }, 8, 6], ['sorriso-andando', { andar: true, sorriso: true }, 8, 6]]),
  'sombra-tentaculos': () => sprite(sombraTentaculos, [['parado', {}, 12, 6], ['subindo', { alto: true }, 12, 6], ['agarrar', { alto: true, agarrar: true }, 8, 6]]),
  'sombra-olhos': () => sprite(sombraOlhos, [['parado', {}, 22, 8], ['olhando', { olhando: true }, 8, 6]]),
  'sombra-rastejante': () => sprite(sombraRastejante, [['parado', {}, 9, 6], ['andando', { andando: true }, 4, 6], ['correndo', { andando: true }, 4, 10], ['olhos', { olhos: true }, 9, 6], ['olhos-andando', { andando: true, olhos: true }, 4, 6]]),
}, { grupo: 'Monstros de sombra (pixel art)', status: 'protótipo' });
