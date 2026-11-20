// Vista "diorama" (nome antigo: "diagonal").
// Rua em diagonal DESENHADA em pixel art (projeção 2:1). A câmera fica sempre de frente;
// a diagonal está no desenho, então cada pixel continua alinhado com a tela.
// Cada pixel guarda sua posição 3D (i, j, altura) e a iluminação é calculada pixel a pixel,
// em faixas com dithering, como numa pixel art pintada à mão.
import { bayer, hexParaRgb } from '../pixel.js';
import { rng } from '../compartilhado/util.js';
import { desenharTexto, larguraTexto } from '../fonte.js';

// Texto em pixel art como máscara (para escrever letreiros nas fachadas inclinadas).
function mascaraTexto(texto) {
  const w = larguraTexto(texto) + 2, h = 10;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); desenharTexto(g, texto, 1, 0, '#fff');
  const d = g.getImageData(0, 0, w, h).data;
  return { w, h, tem: (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0 };
}

// Estabelecimentos: cores, letreiro e térreo próprios. Padaria, mercado e farmácia são térreos (alt 82: térreo + letreiro + telhado).
const ESTAB = {
  escola: { pal: ['#e8d8b0', '#d8c498', '#a8946c', '#5a4a30'], tipo: 'reboco', placa: ['#2a5aa8', '#ffffff'], texto: 'ESCOLA', toldo: null, alt: 144, porta: 'vidro-dupla', base: '#a85a44' },
  delegacia: { pal: ['#e8ecf4', '#d0d6e4', '#9aa2b8', '#3a4258'], tipo: 'reboco', placa: ['#1e2a58', '#ffffff'], texto: 'POLÍCIA', toldo: null, alt: 112, porta: 'vidro-dupla', base: '#2e3c66', sirene: true, grade: true },
  padaria: { pal: ['#f0e0c0', '#e0ccaa', '#b09a78', '#5a4a30'], tipo: 'reboco', placa: ['#6a3a1e', '#ffe8a0'], texto: 'PADARIA', toldo: ['#f4f0e8', '#c83c4c'], alt: 82, vitrine: 'paes', base: '#8a5a3a' },
  mercado: { pal: ['#e8f0e0', '#d4e0c8', '#a8b89c', '#4a5a40'], tipo: 'reboco', placa: ['#2e8a4a', '#ffffff'], texto: 'MERCADO', toldo: ['#f0f0e0', '#2e8a4a'], alt: 82, vitrine: 'frutas', caixotes: true },
  farmacia: { pal: ['#f4f4f4', '#e0e4e8', '#b8bcc8', '#4a5060'], tipo: 'azulejo', placa: ['#2a9a5a', '#ffffff'], texto: 'FARMÁCIA', toldo: null, alt: 82, cruz: true },
};

// i atravessa a rua (cresce para baixo/direita); j vai ao longo dela (cresce para baixo/esquerda).
// Faixas em i:  [-3.2,0] prédios | 0..1.5 calçada | 1.5..1.8 meio-fio | 1.8..5.2 asfalto
//               5.2..5.5 meio-fio | 5.5..7 calçada | 7..7.4 cerca viva | >7.4 canteiro
export const FAIXA = { predioFundo: -3.2, predioFrente: 0, calcadaFundo: 0.9, meioRua: 3.5, calcadaFrente: 6.25, canteiro: 8.5 };
const PX_POR_UNIDADE_ALTURA = 16;

const PALETAS = {
  tijolo: [['#8a4e46', '#74403c', '#5a302e', '#3a1e20'], ['#7a4a3a', '#663c30', '#4e2c24', '#321a16']],
  reboco: [['#c8b490', '#b09c7a', '#8a7a5e', '#5a4c38'], ['#a8b4c0', '#92a0ae', '#72808e', '#4a5460'], ['#c8a0a0', '#b08888', '#8a6a6a', '#5a4444']],
  painel: [['#5a6a8a', '#4c5a78', '#3a4660', '#262e42'], ['#6a7a6a', '#5a6a5a', '#465446', '#2e382e']],
};
const TOLDOS = [['#e8e0d0', '#c83c4c'], ['#e8e0d0', '#3aa868'], ['#e8e0d0', '#3a6ac8'], ['#f0d040', '#5a3a6a'], ['#e8e0d0', '#e87a3a']];

export function gerarRuaDiagonal(opc = {}) {
  const comp = opc.comprimento ?? 44;
  const noite = (opc.periodo ?? 'noite') === 'noite';
  const semente = opc.semente ?? 7;
  const J0 = -comp / 2, J1 = comp / 2, I0 = -4.5, I1 = 24, HMAX = 200;   // I1 largo: o canteiro vai até a borda
  const OX = -(I0 - J1) * 16 + 4, OY = -(I0 + J0) * 8 + HMAX;
  const W = Math.ceil((I1 - J0) * 16 + OX + 8), H = Math.ceil((I1 + J1) * 8 + OY + 8);
  const proj = (i, j, h = 0) => ({ x: (i - j) * 16 + OX, y: (i + j) * 8 + OY - h });

  // buffers: cor base, posição 3D, tipo (0 vazio, 1 superfície, 2 emissivo), fator da face
  const N = W * H;
  const cor = new Float32Array(N * 3), pi = new Float32Array(N), pj = new Float32Array(N), ph = new Float32Array(N);
  const tipo = new Uint8Array(N), face = new Float32Array(N).fill(1);
  const pintar = (x, y, hex, i, j, h, t = 1, f = 1) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const k = y * W + x, [r, g, b] = hexParaRgb(hex);
    cor[k * 3] = r / 255; cor[k * 3 + 1] = g / 255; cor[k * 3 + 2] = b / 255;
    pi[k] = i; pj[k] = j; ph[k] = h; tipo[k] = t; face[k] = f;
  };
  const r = rng(semente);

  // ---------- chão ----------
  const faixaPedestre = opc.faixaPedestre ?? 0;   // posição x (ao longo da rua) da faixa
  const jFaixa = -faixaPedestre;
  const bueiros = [J0 + 6, J0 + 19, J0 + 31].map((j) => j + (r() - 0.5) * 3);
  // Praça do lado de cá da rua (no lugar do canteiro): "rua": { "praca": { "x": 0, "largura": 16, "profundidade": 12 } }.
  // No roteiro: z = -0.9 (borda perto da rua) até z = -(profundidade - 1) (fundo, perto da câmera).
  const op = opc.praca;
  const PR = op ? { i0: 7.0, i1: 7.0 + (op.profundidade ?? 12), j0: -(op.x ?? 0) - (op.largura ?? 16) / 2, j1: -(op.x ?? 0) + (op.largura ?? 16) / 2 } : null;
  const pedra = (i, j) => {          // pedras bege em fileiras desencontradas (as mesmas da praça do diorama)
    const fi = i * 2.4, k = Math.floor(fi), fj = j * 2.4 + (k % 2) * 0.5, kj = Math.floor(fj);
    const ri = fi - k, rj = fj - kj, h = ((k * 73856093) ^ (kj * 19349663)) >>> 0;
    if (ri < 0.12 || rj < 0.1) return '#9a8a74';
    if (ri > 0.84) return '#e8dcc8';
    return h % 5 === 0 ? '#b8a890' : h % 3 === 0 ? '#e8dcc8' : '#cfc0a8';
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = (x - OX) / 16, Y = (y - OY) / 8;
    const i = (Y + X) / 2, j = (Y - X) / 2;
    if (i < I0 || i > I1 || j < J0 - 2 || j > J1 + 2) continue;
    let c;
    const calcada = (i >= 0 && i < 1.5) || (i > 5.5 && i < 7);
    // PROTÓTIPO: "chao": "terra" (estrada de terra, margens de grama), "rio": true (água na faixa da rua),
    // "semPredios": true (campo no lugar dos prédios), "pocas": true (poças de chuva)
    const terra = opc.chao === 'terra';
    const grama = () => { const v = (((Math.floor(i * 9) * 92821) ^ (Math.floor(j * 9) * 68917)) >>> 0) % 13; return v === 0 ? '#5aa85a' : v < 3 ? '#2e6a3a' : bayer(x, y) < 0.08 ? '#4a9a5a' : '#3a7e48'; };
    if (opc.rio && i > 1.5 && i < 5.5) {
      const borda = i < 1.8 || i > 5.2;
      const onda = Math.sin(j * 4 + i * 2.2 + 1) + Math.sin(j * 1.7 - i * 3.1) * 0.6;
      c = borda ? (terra ? '#7a5a3a' : '#8a8c9c') : onda > 1.2 ? '#c8ecff' : onda > 0.55 ? '#5aa8e0' : bayer(x, y) < 0.15 ? '#2e6ab0' : '#3a7cc4';
      if (noite && !borda) c = onda > 1.2 ? '#8ab8e0' : onda > 0.55 ? '#2e5a98' : '#1e3e6a';
      pintar(x, y, c, i, j, 0); continue;
    }
    if (i < 0 && opc.semPredios) { pintar(x, y, grama(), i, j, 0); continue; }
    if (terra && i >= 0 && i < 7 && !(i > 1.8 && i <= 5.2)) { pintar(x, y, grama(), i, j, 0); continue; }
    if (terra && i > 1.8 && i <= 5.2) {
      const v = r(), sulco = Math.abs(i - 2.6) < 0.18 || Math.abs(i - 4.4) < 0.18;
      c = sulco ? (v < 0.3 ? '#8a6a44' : '#7a5a3a') : v < 0.08 ? '#c8a878' : v < 0.15 ? '#8a6a44' : '#a8845a';
      if (Math.abs(i - 3.5) < 0.12 && v < 0.5) c = '#5aa04a';             // capim no meio da estrada
      pintar(x, y, c, i, j, 0); continue;
    }
    if (opc.pocas && i >= 0 && i < 7) {
      const n = Math.sin(j * 1.3 + i * 0.7) * Math.sin(j * 0.47 - i * 1.9 + 2) + Math.sin(i * 2.9 + j * 0.31) * 0.35;
      if (n > 0.62) { const brilho = n > 0.86 && bayer(x, y) < 0.5; pintar(x, y, noite ? (brilho ? '#5a7ab0' : '#2a3a5e') : (brilho ? '#c8e0f8' : '#6a8ab8'), i, j, 0); continue; }
    }
    if (i < 0) c = '#2a2a34';
    else if (calcada) {
      const a = i * 2, b = j * 2, borda = a - Math.floor(a) < 0.07 || b - Math.floor(b) < 0.07;
      c = borda ? '#5c5e70' : (bayer(x, y) < 0.07 ? '#8c8ea0' : '#7a7c8e');
      if (i < 0.35) c = borda ? '#4e5060' : '#6a6c7e';                       // sombra junto à parede
    } else if (i < 1.8 || (i > 5.2 && i <= 5.5)) {
      const topo = i < 1.8 ? i < 1.62 : i < 5.38;
      c = topo ? '#b6b8c6' : '#8a8c9c';
      if (i > 1.74 && i < 1.8) c = '#4a4a58';
    } else if (i <= 5.2) {
      const v = r(); c = v < 0.07 ? '#45475a' : v < 0.13 ? '#2c2c38' : '#37394a';
      if (opc.alagada) {   // rua alagada: água por cima do asfalto
        const onda = Math.sin(j * 5 + i * 2.2) + Math.sin(j * 2.1 - i * 3.7) * 0.6;
        c = onda > 1.15 ? '#c8ecff' : onda > 0.6 ? '#6ab0e8' : bayer(x, y) < 0.15 ? '#3a78c0' : '#4a8ad0';
        if (noite) c = onda > 1.15 ? '#8ab8e0' : onda > 0.6 ? '#3a6aa8' : '#24487a';
        pintar(x, y, c, i, j, 0); continue;
      }
      if (Math.abs(j - jFaixa) < 1.4 && (Math.floor((i - 1.8) * 4)) % 2 === 0) c = r() < 0.05 ? '#b8b8c4' : '#e2e2ea';
      else if (Math.abs(i - 3.5) < 0.06 && (j - Math.floor(j)) < 0.5) c = '#e0b838';
      for (const jb of bueiros) if (Math.abs(i - 1.95) < 0.12 && Math.abs(j - jb) < 0.35) c = (Math.floor(j * 16) % 2) ? '#1e1e26' : '#4a4a58';
      if (Math.hypot((i - 3.5) * 1.0, (j - (J0 + 12)) * 1.0) < 0.42) c = Math.hypot(i - 3.5, j - (J0 + 12)) < 0.36 ? ((Math.floor(i * 12) + Math.floor(j * 12)) % 2 ? '#4e4e5c' : '#3e3e4a') : '#2a2a34';
    } else if (PR && i >= PR.i0 && i < PR.i1 && j >= PR.j0 && j <= PR.j1) {
      const bi = Math.min(i - PR.i0, PR.i1 - i), bj = Math.min(j - PR.j0, PR.j1 - j);
      c = bi < 0.18 || bj < 0.18 ? (bi < 0.09 || bj < 0.09 ? '#8a8c9c' : '#b6b8c6') : pedra(i, j);     // meio-fio em volta
    } else if (i < 7.4) c = '#2e5a3a';
    else { const v = r(); c = v < 0.1 ? '#4a9a5a' : v < 0.17 ? '#2c5a3a' : '#3a7a4a'; }
    pintar(x, y, c, i, j, 0);
  }

  // ---------- prisma genérico (prédios, cerca viva, ar-condicionado) ----------
  // faces visíveis: frente (plano i = i1, de frente para a rua), lado (plano j = j1) e topo.
  function prisma(i0, i1, j0, j1, h0, h, pint) {
    for (let x = 0; x < W; x++) {               // frente
      const s = i1 - (x - OX) / 16;
      if (s < j0 || s > j1) continue;
      const base = (i1 + s) * 8 + OY - h0;
      const u = Math.floor((s - j0) * 16), larg = Math.floor((j1 - j0) * 16);
      for (let t = 0; t <= h; t++) pint.frente(x, Math.round(base - t), u, t, larg, s);
    }
    for (let x = 0; x < W; x++) {               // lado
      const s = (x - OX) / 16 + j1;
      if (s < i0 || s > i1) continue;
      const base = (s + j1) * 8 + OY - h0;
      const u = Math.floor((s - i0) * 16);
      for (let t = 0; t <= h; t++) pint.lado(x, Math.round(base - t), u, t, s);
    }
    const yTop0 = Math.floor((i0 + j0) * 8 + OY - h0 - h) - 2, yTop1 = Math.ceil((i1 + j1) * 8 + OY - h0 - h) + 2;
    for (let y = Math.max(0, yTop0); y < Math.min(H, yTop1); y++) for (let x = 0; x < W; x++) {
      const X = (x - OX) / 16, Y = (y + h0 + h - OY) / 8;
      const i = (Y + X) / 2, j = (Y - X) / 2;
      if (i < i0 || i > i1 || j < j0 || j > j1) continue;
      pint.topo(x, y, i, j, Math.min(i - i0, i1 - i, j - j0, j1 - j));
    }
  }

  // cerca viva entre a calçada da frente e o canteiro
  const cerca = (ja, jb) => prisma(7.0, 7.45, ja, jb, 0, 9, {
    frente: (x, y, u, t, l, s) => pintar(x, y, t > 7 ? '#4a8a4a' : ((u + t) % 3 ? '#2e6a3a' : '#3a7a44'), 7.45, s, t, 1, 0.92),
    lado: (x, y, u, t, s) => pintar(x, y, '#24502e', s, jb, t, 1, 0.75),
    topo: (x, y, i, j) => pintar(x, y, r() < 0.2 ? '#6aaa5a' : '#58984e', i, j, 9, 1, 1.1),
  });
  if (opc.cerca === false || opc.chao === 'terra');
  else if (PR) { if (PR.j0 > J0) cerca(J0, PR.j0); if (PR.j1 < J1) cerca(PR.j1, J1); }   // a cerca abre para a praça
  else cerca(J0, J1);

  // ---------- prédios (da esquerda/fundo para a direita/frente: j crescente) ----------
  const tipos = Object.keys(PALETAS);
  const predios = [];
  // opc.predios: lista ao longo da rua (da esquerda/fundo para a direita/frente), ex.:
  //   [{ "tipo": "padaria", "largura": 4 }, { "tipo": "comum" }, { "tipo": "escola", "largura": 6 }]
  // Prédios "comuns" preenchem o resto. 'em' (x ao longo da rua) posiciona um prédio específico.
  // a lista do roteiro é lida da esquerda para a direita na tela; a geração anda no sentido contrário
  // A lista do roteiro é lida da esquerda para a direita na tela; a geração anda no sentido contrário (j crescente).
  // Os estabelecimentos ficam sempre na mesma posição (o primeiro gerado começa em j = ancora), qualquer que
  // seja o comprimento da rua; prédios comuns preenchem o resto dos dois lados.
  const pedidos = (opc.predios || []).map((p) => ({ ...p })).reverse();
  const ancora = opc.ancoraPredios ?? -23;
  const largDe = (ped) => ped.largura ?? (ESTAB[ped.tipo] ? (ped.tipo === 'escola' || ped.tipo === 'mercado' ? 6 : 4) : 4);
  const segs = [];
  let j = Math.min(J0 - 1, pedidos.length ? ancora : J0 - 1);
  if (pedidos.length) {
    while (j < ancora - 0.01) { const w = Math.min(3 + Math.floor(r() * 3), ancora - j); segs.push({ j, w, ped: null }); j += w; }
    for (const ped of pedidos) { const w = largDe(ped); segs.push({ j, w, ped }); j += w; }
  }
  while (j < J1 + 1) { const w = 3 + Math.floor(r() * 3); segs.push({ j, w, ped: null }); j += w; }
  segs.forEach(({ j: j0, w, ped }, n) => {
    const e = ped && ESTAB[ped.tipo];
    const t = e ? e.tipo : tipos[Math.floor(r() * tipos.length)];
    const alt = e ? e.alt : 112 + Math.floor(r() * 3) * 32;   // v2: térreo de 58 px + andares de 32 px
    predios.push({ j0, j1: j0 + w, h: alt, tipo: t, estab: e ? ped.tipo : null, e,
      pal: e ? e.pal : PALETAS[t][Math.floor(r() * PALETAS[t].length)], toldo: e ? e.toldo : TOLDOS[n % TOLDOS.length], s: Math.floor(r() * 1e6) });
  });
  const lojas = [];
  if (opc.semPredios) predios.length = 0;
  for (const P of predios) {
    const rw = rng(P.s), pal = P.pal;
    const acesa = new Map();
    const parede = (u, t, larg) => {
      if (u < 2 || u > larg - 3) return pal[2];                                   // pilastras
      if (P.tipo === 'tijolo') return (t % 4 === 0 || (u + (Math.floor(t / 4) % 2) * 4) % 8 === 0) ? pal[1] : pal[0];
      if (P.tipo === 'painel') return u % 12 === 0 || t % 24 === 0 ? pal[2] : pal[0];
      if (P.tipo === 'azulejo') return u % 6 === 0 || t % 6 === 0 ? pal[1] : pal[0];
      return rw() < 0.04 ? pal[1] : pal[0];
    };
    const E = P.e, masc = E ? mascaraTexto(E.texto) : null;
    prisma(-3.2, 0, P.j0, P.j1, 0, P.h, {
      // Proporção (v2): pessoas têm ~40-44 px; porta ~46 px, vitrine 32 px, toldo acima da cabeça, andar de 32 px.
      frente: (x, y, u, t, larg, s) => {
        let c = parede(u, t, larg), tp = 1;
        if (E) {
          const meio = Math.floor(larg / 2);
          if (E.base && t < 16 && t >= 2) c = (t % 4 === 0 || (u + (Math.floor(t / 4) % 2) * 4) % 8 === 0) ? '#6a3a2e' : E.base;
          // letreiro grande com o nome (acima do térreo)
          const lw = masc.w + 6, lx = meio - Math.floor(lw / 2), ly0 = 62, lh = 12;
          if (u >= lx && u < lx + lw && t >= ly0 && t < ly0 + lh) {
            const borda = u === lx || u === lx + lw - 1 || t === ly0 || t === ly0 + lh - 1;
            const mx = (lx + lw - 1 - u) - 2, my = ly0 + lh - 2 - t;   // u cresce para a esquerda na fachada: inverte para ler certo
            c = borda ? E.pal[3] : (masc.tem(mx, my) ? E.placa[1] : E.placa[0]);
            if (!borda && masc.tem(mx, my) && noite) tp = 2;
            pintar(x, y, c, 0, s, t, tp, 1); return;
          }
          if (E.cruz && u >= lx - 14 && u < lx - 4 && t >= 62 && t < 74) {
            const cx = u - (lx - 14), cy = t - 62;
            if ((cx >= 3 && cx < 7) || (cy >= 4 && cy < 8)) { pintar(x, y, '#3ae070', 0, s, t, noite ? 2 : 1, 1); return; }
          }
          if (E.sirene && t >= P.h - 2) { /* sirene fica no telhado */ }
          if (t >= 2 && E.porta === 'vidro-dupla' && Math.abs(u - meio) < 12 && t < 48) {
            const borda = Math.abs(u - meio) === 11 || u === meio || t === 47;
            const puxador = (u === meio - 2 || u === meio + 2) && t >= 20 && t < 26;
            pintar(x, y, borda || puxador ? '#2a2638' : (t > 30 ? '#a8c8e0' : '#6a8aa8'), 0, s, t, 1, 1); return;
          }
          if (E.vitrine === 'paes' && t >= 8 && t < 40 && u >= 22 && u < larg - 5) {
            const borda = u === 22 || u === larg - 6 || t === 8 || t === 39;
            let cc = borda ? '#3a2416' : (t > 26 ? '#fff2d0' : '#ffd890');
            if (!borda && (t === 12 || t === 13 || t === 22 || t === 23) && (u % 7) > 1 && (u % 7) < 6) cc = (u % 7 === 3) ? '#a86a30' : '#d08a40';
            if (!borda && (t === 11 || t === 21)) cc = '#b08a5a';                                  // prateleiras
            pintar(x, y, cc, 0, s, t, !borda && noite ? 2 : 1, 1); return;
          }
          if (E.vitrine === 'frutas' && t >= 8 && t < 40 && u >= 22 && u < larg - 5) {
            const borda = u === 22 || u === larg - 6 || t === 8 || t === 39;
            // 2 prateleiras com frutas redondas (maçã, laranja, banana, limão), com brilho; vidro em cima
            const FR = [['#e83a3a', '#9a2028', '#ff9a8a'], ['#f0a030', '#a8601a', '#ffd08a'], ['#f0e040', '#a89a20', '#fff8b0'], ['#5ac84a', '#2e7a2e', '#b8f098']];
            let cc, emis = false;
            if (borda) cc = '#2a3a2a';
            else if (t === 10 || t === 22) cc = '#8a6a3a';                                   // prateleira
            else if ((t > 10 && t < 18) || (t > 22 && t < 30)) {
              const fila = t < 22 ? 0 : 1, fu = (u - 23) % 5, ft = (t - (fila ? 23 : 11)) % 7, d = (fu - 2) ** 2 + (ft - 3) ** 2;
              const [f0, f1, f2] = FR[(Math.floor((u - 23) / 5) + fila * 2) % 4];
              cc = d <= 4 ? (fu === 1 && ft === 2 ? f2 : (ft >= 5 ? f1 : f0)) : (noite ? '#c8b070' : '#6a8a9a');
              emis = noite && d > 4;
            } else { cc = t > 30 ? '#d8f0f8' : '#a8d0e0'; emis = noite; }
            pintar(x, y, cc, 0, s, t, emis ? 2 : 1, 1); return;
          }
          if (E.grade && t >= 80 && (u % 3 === 0)) { const ty = (t - 80) % 32; if (ty >= 9 && ty < 25) { pintar(x, y, '#3a3a4a', 0, s, t, 1, 1); return; } }
          if (!E.toldo && t >= 46 && t < 56) { pintar(x, y, t === 46 ? E.pal[3] : E.pal[2], 0, s, t, 1, 1); return; }   // marquise lisa
        }
        const meio = Math.floor(larg / 2);
        if (t < 2) c = pal[3];                                                     // rodapé
        if (t >= P.h - 6 && t < P.h - 2) c = pal[0] === c ? '#d8d0c0' : '#c8c0b0';   // cornija
        if (t >= P.h - 2) c = pal[3];
        if (t === P.h - 7) c = pal[3];
        if (t < 58) {                                                              // térreo
          if (u >= 4 && u < 20 && t < 46) {                                        // porta
            c = (u === 4 || u === 19 || t === 45) ? pal[3] : (u === 16 && t === 22 ? '#f0c840' : ((t > 30 && t < 40 && u > 7 && u < 16) ? (noite ? '#ffd070' : '#6a8aa8') : ((u + t) % 5 ? '#5a3a2a' : '#4a2e22')));
            if (noite && t > 30 && t < 40 && u > 7 && u < 16) tp = 2;
          } else if (u >= 22 && u < larg - 5 && t >= 8 && t < 40) {                // vitrine
            const borda = u === 22 || u === larg - 6 || t === 8 || t === 39;
            if (borda) c = pal[3];
            else if (noite) { c = t > 28 ? '#fff4c8' : '#ffd070'; tp = 2; if ((u - 26) % 9 < 3 && t < 16) c = '#8a5a3a'; }
            else c = t > 26 ? '#a8c8e0' : '#6a8aa8';
          }
          if (t >= 46 && t < 56) {                                                 // toldo listrado (acima da cabeça)
            c = Math.floor(u / 6) % 2 ? P.toldo[0] : P.toldo[1];
            if (t === 46) c = '#2a2026';
            if (t === 55) c = '#ffffff';
          }
        } else if (!E && t >= 60 && t < 68 && u > meio - 11 && u < meio + 11) {          // letreiro
          const borda = u === meio - 10 || u === meio + 10 || t === 60 || t === 67;
          c = borda ? pal[3] : ((t === 63 && (u % 3 !== 0)) ? (noite ? '#ffe890' : '#f0e0b0') : '#2a2a3a');
          if (!borda && t === 63 && u % 3 !== 0 && noite) tp = 2;
        } else if (t >= 80 && t < P.h - 8) {                                      // andares (32 px cada)
          const andar = Math.floor((t - 80) / 32), ty = (t - 80) % 32;
          const nJan = Math.max(1, Math.floor((larg - 6) / 18));
          const ini = Math.floor((larg - nJan * 18) / 2) + 3;
          const col = Math.floor((u - ini) / 18), tx = (u - ini) % 18;
          if (u >= ini && col < nJan && tx < 11) {
            if (ty === 7) c = '#d8d0c0';                                           // peitoril
            else if (ty >= 8 && ty < 26) {
              const k = andar * 10 + col;
              if (!acesa.has(k)) acesa.set(k, noite && rw() < 0.5);
              const borda = tx === 0 || tx === 10 || ty === 8 || ty === 25 || (ty === 17 && tx > 0 && tx < 10) || tx === 5;
              if (borda) c = pal[3];
              else if (acesa.get(k)) { c = ty > 20 ? '#fff0b8' : (tx === 4 ? '#e8b850' : '#ffd468'); tp = 2; }
              else c = ty > 18 ? '#3a4a6e' : (tx < 4 && ty < 13 ? '#6a7aa0' : '#26304e');
            } else if (ty === 26) c = pal[2];                                     // verga
          }
        }
        pintar(x, y, c, 0, s, t, tp, 1);
      },
      lado: (x, y, u, t, s) => {
        let c = P.tipo === 'tijolo' && t % 4 === 0 ? pal[3] : pal[2];
        if (t >= P.h - 6 && t < P.h - 2) c = '#a8a090';
        if (t >= P.h - 2) c = pal[3];
        if (t > 82 && t < P.h - 10 && (t - 80) % 32 > 9 && (t - 80) % 32 < 24 && u > 18 && u < 28) c = '#1e2438';
        pintar(x, y, c, s, P.j1, t, 1, 0.72);
      },
      topo: (x, y, i, j, d) => pintar(x, y, d < 0.12 ? '#7a7a8a' : d < 0.2 ? '#2e2e3a' : (bayer(x, y) < 0.12 ? '#4c4c5a' : '#40404e'), i, j, P.h, 1, 1.15),
    });
    if (E?.sirene) {
      const cj = (P.j0 + P.j1) / 2 - 0.4;
      prisma(-0.7, -0.2, cj, cj + 0.8, P.h, 6, {
        frente: (x, y, u, t) => pintar(x, y, u < 6 ? '#3a6aff' : '#ff3a3a', -0.2, cj, P.h + t, noite ? 2 : 1, 1),
        lado: (x, y, u, t, s) => pintar(x, y, '#2a2a3a', s, cj + 0.8, P.h + t, 1, 0.8),
        topo: (x, y, i, j) => pintar(x, y, '#4a4a5a', i, j, P.h + 6, 1, 1),
      });
    }
    if (E?.caixotes) {
      for (let k = 0; k < 2; k++) {   // 2 caixotes no canto direito da fachada (x ≈ 13.2–15.3): o meio (x ~16.2) fica livre para as pessoas
        const cj = P.j1 - 1.05 - k * 1.05, [fr, frE, frC] = [['#e83a3a', '#9a2028', '#ff9a8a'], ['#5ac84a', '#2e7a2e', '#b8f098']][k];   // fruta, sombra, brilho
        prisma(0.15, 0.75, cj, cj + 1.0, 0, 14, {
          frente: (x, y, u, t) => pintar(x, y, t === 7 || u % 8 === 0 ? '#6a4a1a' : '#a0702a', 0.75, cj, t, 1, 1),
          lado: (x, y, u, t, s) => pintar(x, y, '#7a5220', s, cj + 1.0, t, 1, 0.8),
          topo: (x, y, i, j) => {   // borda de madeira + frutas redondas (2 x 3) com brilho
            const di = (i - 0.15) / 0.6, dj = (j - cj) / 1.0;
            let c;
            if (di < 0.1 || di > 0.9 || dj < 0.06 || dj > 0.94) c = '#c08a40';
            else { const fi = ((di - 0.1) / 0.8 * 2) % 1, fj = ((dj - 0.06) / 0.88 * 3) % 1, d = (fi - 0.5) ** 2 + (fj - 0.5) ** 2;
              c = d < 0.16 ? (fi < 0.42 && fj < 0.42 ? frC : fr) : frE; }
            pintar(x, y, c, i, j, 14, 1, 1.1);
          },
        });
      }
    }
    // ar-condicionado no telhado
    const ci = -2.2 + rw() * 0.8, cj = P.j0 + 0.8 + rw() * Math.max(0.2, P.j1 - P.j0 - 2.2);
    prisma(ci, ci + 0.9, cj, cj + 0.7, P.h, 7, {
      frente: (x, y, u, t) => pintar(x, y, t === 7 ? '#b0b0bc' : (u % 3 === 0 && t > 1 && t < 6 ? '#3a3a46' : '#8a8a98'), ci + 0.9, cj, P.h + t, 1, 1),
      lado: (x, y, u, t, s) => pintar(x, y, '#626270', s, cj + 0.7, P.h + t, 1, 0.75),
      topo: (x, y, i, j) => pintar(x, y, (Math.floor(i * 10) + Math.floor(j * 10)) % 2 ? '#a8a8b4' : '#9a9aa8', i, j, P.h + 7, 1, 1.1),
    });
    if (noite) lojas.push({ i: 0.25, j: (P.j0 + P.j1) / 2 + 0.6, h: 22, raio: 2.2, forca: 0.6 });
  }

  // ---------- iluminação pixel a pixel ----------
  // Postes em LUGAR FIXO NO MUNDO (não dependem do comprimento da rua, que muda de cena para cena):
  // calçada dos prédios em x = 6.5 + 8k (entre as fachadas: padaria 0.6, escola 4.6, delegacia 10.4, mercado 16.2)
  // e calçada da frente em x = 2.5 + 8k. (x = -j)
  const postes = [];
  const passo = opc.distanciaPostes ?? 8, fase = opc.fasePostes ?? 6.5;
  for (let k = Math.ceil((-J1 + 1 - fase) / passo); fase + k * passo < -J0 - 3; k++) {
    const xF = fase + k * passo, xT = xF - passo / 2;
    postes.push({ i: FAIXA.calcadaFundo, j: -xF });
    if (xT > -J1 + 1) postes.push({ i: FAIXA.calcadaFrente, j: -xT });
  }
  // luz dos postes da praça (os postes são sprites "poste-iso"; a luz no chão vem daqui)
  const luzPraca = PR && noite ? (op.luzes ? op.luzes.map(([x, z]) => [FAIXA.calcadaFrente - z, -x]) : [[PR.i0 + 1.5, PR.j0 + 2], [PR.i0 + 1.5, PR.j1 - 2], [PR.i1 - 3, PR.j0 + 2], [PR.i1 - 3, PR.j1 - 2]]).map(([i, j]) => ({ i, j, h: 40, raio: 4.6, forca: 1 })) : [];
  const luzes = noite ? [...postes.map((p) => ({ ...p, h: 40, raio: 4.2, forca: 1 })), ...lojas, ...luzPraca] : [];
  const amb = noite ? [0.70, 0.74, 0.94] : [1, 1, 1];
  const corLuz = [1.0, 0.86, 0.6];
  const saida = new Uint8ClampedArray(N * 4), brilho = new Uint8ClampedArray(N * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (!tipo[k]) continue;
    let R = cor[k * 3], G = cor[k * 3 + 1], B = cor[k * 3 + 2];
    if (tipo[k] === 2) {                                                             // emissivo
      brilho.set([R * 255, G * 255, B * 255, 255], k * 4);
    } else {
      let nivel = 0;
      for (const L of luzes) {
        const di = pi[k] - L.i, dj = pj[k] - L.j, dv = (L.h - ph[k]) / PX_POR_UNIDADE_ALTURA;
        const d = Math.sqrt(di * di + dj * dj + dv * dv);
        nivel += Math.max(0, 1 - d / L.raio) * L.forca;
      }
      nivel = Math.min(1, nivel);
      // 3 faixas sólidas; o dithering aparece só numa borda estreita entre elas
      const q = Math.max(0, Math.min(3, Math.floor(nivel * 3 + 0.5 + (bayer(x, y) - 0.5) * 0.35))) / 3;
      const f = face[k];
      R = R * f * (amb[0] + q * corLuz[0] * 0.6);
      G = G * f * (amb[1] + q * corLuz[1] * 0.6);
      B = B * f * (amb[2] + q * corLuz[2] * 0.6);
    }
    saida.set([Math.min(255, R * 255), Math.min(255, G * 255), Math.min(255, B * 255), 255], k * 4);
  }
  return { W, H, imagem: saida, brilho, proj, postes, J0, J1, noite, pi, pj, ph, tipo };
}
