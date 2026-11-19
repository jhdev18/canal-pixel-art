// Interiores para a vista LATERAL: parede do cômodo (camada 'comodo') + pisos internos.
// A parede repete a cada 512 px; janelas, portas e quadros ficam pintados nela.
// Os móveis são sprites (motor/assets/interiores.js), posicionados no roteiro/cenário.
import { bayer } from '../pixel.js';
import { rng } from '../compartilhado/util.js';

const K = '#1a1c2c';

// ------------------------------------------------------------------ parede
// p: Pix (512 x h). base = linha do encontro parede/chão (pés dos personagens).
export function pintarComodo(p, c, s) {
  const r = rng(s), base = c.base, W = p.w;
  const [cl, cb, cs] = c.cor;
  // parede (padrão)
  for (let y = 0; y < p.h; y++) for (let x = 0; x < W; x++) {
    let cor = cb;
    if (c.padrao === 'listras') cor = (x % 16) < 8 ? cb : cl;
    else if (c.padrao === 'papel') cor = (x % 12 === 0) ? cs : ((x + 6) % 12 === 0 && (y % 8 === 0)) ? cl : cb;
    else if (c.padrao === 'estrelas') { const e = (x * 7 + y * 13) % 97 === 0 || ((x % 40 === 20) && (y % 36 === 18)); cor = e ? cl : cb; }
    else if (r() < 0.02) cor = cl;
    p.set(x, y, cor);
  }
  // estrelinhas em cruz no padrão 'estrelas'
  if (c.padrao === 'estrelas') for (let x = 20; x < W; x += 40) for (let y = 18; y < base; y += 36) {
    const dx = ((y / 36) % 2) * 20, cx = (x + dx) % W;
    for (const [i, j] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) p.set(cx + i, y + j, cl);
  }
  // teto: sanca no alto
  const topo = 0;
  for (let x = 0; x < W; x++) { for (let y = topo; y < topo + 4; y++) p.set(x, y, c.teto[y - topo < 2 ? 0 : 1]); p.set(x, topo + 4, c.teto[2]); }
  // meia-parede (barra inferior)
  if (c.meiaParede) {
    const m = c.meiaParede, y0 = base - m.altura;
    for (let y = y0; y < p.h; y++) for (let x = 0; x < W; x++) {
      let cor = m.cores[1];
      if (m.padrao === 'azulejo') cor = (x % 8 === 0 || (y - y0) % 8 === 0) ? m.cores[2] : m.cores[1];
      else if (m.padrao === 'lambri') cor = x % 10 === 0 ? m.cores[2] : x % 10 === 1 ? m.cores[0] : m.cores[1];
      p.set(x, y, cor);
    }
    for (let x = 0; x < W; x++) { p.set(x, y0 - 2, m.cores[0]); p.set(x, y0 - 1, m.cores[2]); p.set(x, y0, m.cores[2]); }
  }
  // rodapé
  for (let x = 0; x < W; x++) for (let y = base - 12; y < p.h; y++) p.set(x, y, y === base - 12 ? c.rodape[0] : y === base - 11 ? c.rodape[1] : (y > base - 6 ? c.rodape[2] : c.rodape[1]));
  for (const j of c.janelas || []) janela(p, j, base, c);
  for (const d of c.portas || []) porta(p, d, base);
  for (const q of c.quadros || []) quadro(p, q, base);
}

function janela(p, j, base, c) {
  const { x, w = 44, h = 40 } = j, y = base - (j.alturaPeitoril ?? 58) - h;
  const noite = !!c.noite;
  const ceu = noite ? ['#141a3a', '#1e2650', '#2a3266'] : ['#7ab8ec', '#9acef4', '#c4e4fa'];
  for (let jj = 0; jj < h; jj++) for (let i = 0; i < w; i++) {
    const v = jj / h;
    let cor = v < 0.4 ? ceu[0] : v < 0.75 ? ceu[1] : ceu[2];
    if (v > 0.33 && v < 0.75 && bayer(i, jj) > 0.5 && (v < 0.4 || v > 0.7)) cor = ceu[1];
    // paisagem: copa de árvore / telhado lá fora
    if (!noite && jj > h - 10 && (Math.sin(i * 0.5 + x) * 2 + (h - jj)) < 7) cor = '#5a9a5a';
    if (noite && jj > h - 8 && (i % 9) < 6) cor = jj === h - 8 && i % 9 === 2 ? '#f8d860' : '#0c1028';
    p.set(x + i, y + jj, cor);
  }
  if (noite) { const lx = x + Math.round(w * 0.7), ly = y + 9; p.circulo(lx, ly, 4, '#f0ecd0'); p.circulo(lx + 2, ly - 1, 3, ceu[0]); }
  else { for (let k = 0; k < 6; k++) { p.set(x + 4 + k, y + 3 + k, '#e4f2fc'); p.set(x + 5 + k, y + 3 + k, '#e4f2fc'); } }
  // caixilho
  const cx = j.caixilho || '#f4f0e8', cxs = '#b8b0a0';
  for (let i = -2; i < w + 2; i++) { p.set(x + i, y - 2, cx); p.set(x + i, y - 1, cxs); p.set(x + i, y + h, cx); p.set(x + i, y + h + 1, cx); p.set(x + i, y + h + 2, cxs); }
  for (let jj = -2; jj < h; jj++) { p.set(x - 2, y + jj, cx); p.set(x - 1, y + jj, cxs); p.set(x + w, y + jj, cx); p.set(x + w + 1, y + jj, cxs); }
  for (let jj = 0; jj < h; jj++) p.set(x + Math.floor(w / 2), y + jj, cx);
  for (let i = 0; i < w; i++) p.set(x + i, y + Math.floor(h / 2), cx);
  for (let i = -4; i < w + 4; i++) { p.set(x + i, y + h + 3, '#d8d0c0'); p.set(x + i, y + h + 4, '#a89a88'); }   // peitoril
  // cortinas
  if (j.cortina) {
    const [c1, c2] = j.cortina, larg = Math.round(w * 0.28);
    for (let i = -6; i < w + 6; i++) for (let k = 0; k < 4; k++) p.set(x + i, y - 7 + k, k === 3 ? c2 : '#6a5040');   // varão + bandô
    for (const lado of [0, 1]) for (let jj = -3; jj < h + 8; jj++) {
      const onda = Math.round(Math.sin(jj * 0.25) * 1);
      for (let i = 0; i < larg; i++) {
        const xx = lado ? x + w + 5 - i + onda : x - 5 + i + onda;
        p.set(xx, y + jj, (i % 5 === 0) ? c2 : c1);
      }
      if (jj === 18) for (let i = 0; i < larg; i++) p.set(lado ? x + w + 5 - i : x - 5 + i, y + jj, '#e8c860');   // prendedor
    }
  }
}

function porta(p, d, base) {
  const { x, w = 30, h = 76, cor = ['#a8724a', '#8a5a38', '#5e3a24'] } = d, y = base - h;
  for (let jj = -3; jj < h; jj++) for (let i = -3; i < w + 3; i++) {
    const batente = i < 0 || i >= w || jj < 0;
    let c = batente ? (i === -3 || i === w + 2 || jj === -3 ? '#5a4a3a' : '#e8e0d0') : cor[1];
    if (!batente) {
      const painel = (i > 4 && i < w - 5) && ((jj > 6 && jj < 32) || (jj > 40 && jj < h - 8));
      if (painel) c = (i === 5 || jj === 7 || jj === 41) ? cor[2] : (i === w - 6 || jj === 31 || jj === h - 9) ? cor[0] : cor[1];
    }
    p.set(x + i, y + jj, c);
  }
  p.ret(x + w - 6, y + 40, 4, 2, '#e8c040'); p.set(x + w - 6, y + 42, '#a88020');
}

function quadro(p, q, base) {
  const { x, w = 24, h = 18, tipo = 'paisagem' } = q, y = base - (q.altura ?? 92) - h;
  for (let jj = -2; jj < h + 2; jj++) for (let i = -2; i < w + 2; i++) {
    const moldura = i < 0 || jj < 0 || i >= w || jj >= h;
    let c = moldura ? (i === -2 || jj === -2 ? '#c8a050' : '#8a6a2a') : '#c4e0f4';
    if (!moldura && tipo === 'paisagem') c = jj > h * 0.6 + Math.sin(i * 0.4) * 2 ? '#5a9a5a' : jj > h * 0.45 + Math.sin(i * 0.25 + 1) * 3 ? '#8ab0d4' : '#c4e0f4';
    if (!moldura && tipo === 'familia') c = jj > h * 0.7 ? '#e8d8b0' : '#f4e8d0';
    if (!moldura && tipo === 'poster') c = q.cores?.[(Math.floor(jj / 4)) % 2] ?? '#c83c4c';
    p.set(x + i, y + jj, c);
  }
  if (tipo === 'paisagem') p.circulo(x + w - 6, y + 5, 2.5, '#fff0a0');
  if (tipo === 'familia') for (const [k, cab] of [[0.25, '#5a3a24'], [0.5, '#2a1e1a'], [0.75, '#c8a040']]) {
    const cx = x + Math.round(w * k), cy = y + Math.round(h * 0.45);
    p.circulo(cx, cy, 2.5, '#f0c4a0'); p.ret(cx - 2, cy - 3, 5, 2, cab); p.ret(cx - 3, cy + 3, 6, 5, ['#c83c4c', '#3a6ac8', '#3aa860'][Math.round(k * 4) - 1]);
  }
  if (tipo === 'poster' && q.estrela) { const cx = x + w / 2, cy = y + h / 2; for (let k = -3; k <= 3; k++) { p.set(cx + k, cy, '#f8e060'); p.set(cx, cy + k, '#f8e060'); } p.set(cx - 1, cy - 1, '#f8e060'); p.set(cx + 1, cy + 1, '#f8e060'); p.set(cx + 1, cy - 1, '#f8e060'); p.set(cx - 1, cy + 1, '#f8e060'); }
}

// ------------------------------------------------------------------ pisos (textura 64 px de período)
// Retorna a cor do piso para (x, prof) — prof = linhas a partir do topo do chão.
export function corPisoInterno(estilo, c, x, y, prof) {
  const [t0, t1, t2] = c.topo, [d0, d1] = c.terra;
  if (prof < 1) return t0;                              // brilho na borda (encontro com o rodapé)
  if (estilo === 'taco') {                               // tábuas de madeira
    const linha = Math.floor((prof - 1) / 5), dentro = (prof - 1) % 5;
    if (dentro === 4) return t2;
    const junta = (x + linha * 23) % 32 === 0;
    if (junta) return t2;
    return dentro === 0 ? t0 : (linha % 2 ? t1 : (bayer(x, y) < 0.15 ? t2 : t1));
  }
  if (estilo === 'piso') {                               // lajotas em xadrez
    const lin = Math.floor((prof - 1) / 8), col = Math.floor((x + (lin % 2) * 8) / 16);
    if ((prof - 1) % 8 === 7 || (x + (lin % 2) * 8) % 16 === 0) return t2;
    return (lin + col) % 2 ? t1 : d0;
  }
  if (estilo === 'neon') {                               // placas escuras com linha brilhante na borda
    if (prof < 2) return prof < 1.5 ? t0 : t1;
    const lin = Math.floor((prof - 2) / 9), col = Math.floor((x + (lin % 2) * 16) / 32);
    if ((prof - 2) % 9 === 8 || (x + (lin % 2) * 16) % 32 === 0) return d1;
    return (lin + col) % 2 ? t2 : (bayer(x, y) < 0.1 ? t2 : d0);
  }
  if (estilo === 'carpete') return bayer(x, y) < 0.25 ? d1 : bayer(x, y) > 0.85 ? t1 : d0;
  return t1;
}
export const PISOS_INTERNOS = ['taco', 'piso', 'carpete', 'neon'];

// ------------------------------------------------------------------ presets (fundos)
const tetoClaro = ['#f4f0e8', '#e0dacc', '#a8a090'];
export const PRESETS_INTERIORES = {
  'sala-aula': {
    ceu: { cores: ['#e8e2d4'] },
    camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
      cor: ['#f4ecd0', '#ece2c0', '#c8bc98'], padrao: 'liso', teto: tetoClaro,
      meiaParede: { altura: 44, padrao: 'liso', cores: ['#7ac090', '#5aa070', '#3a7a52'] },
      rodape: ['#3a7a52', '#2e5e40', '#24483a'],
      janelas: [{ x: 104, w: 52, h: 38 }, { x: 352, w: 52, h: 38 }],
      portas: [{ x: 446, w: 30, h: 78, cor: ['#c89a5a', '#a87a42', '#6a4a24'] }],
      quadros: [{ x: 176, w: 20, h: 26, altura: 70, tipo: 'poster', cores: ['#f0d040', '#e8b030'], estrela: true },
                { x: 318, w: 18, h: 24, altura: 72, tipo: 'poster', cores: ['#7ac0f0', '#5aa0e0'] }] }],
    chao: { estilo: 'piso', topo: ['#f0ece4', '#d8d4cc', '#a8a49c'], terra: ['#b8c4d0', '#a0acb8', '#8a96a2'] },
    ambiente: ['#ffffff', 1.0],
  },
  'quarto-menino': {
    ceu: { cores: ['#c8d8ec'] },
    camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
      cor: ['#c4daf4', '#8ab4e4', '#6a94c8'], padrao: 'estrelas', teto: ['#eef4fc', '#d4e0f0', '#9aaac4'],
      rodape: ['#f4f4f4', '#e0e0e0', '#b8b8c4'],
      janelas: [{ x: 128, w: 44, h: 40, cortina: ['#e8a040', '#c07820'] }],
      portas: [{ x: 404, w: 30, h: 76 }],
      quadros: [{ x: 228, w: 22, h: 30, altura: 66, tipo: 'poster', cores: ['#c83c4c', '#a82a3c'], estrela: true },
                { x: 290, w: 30, h: 20, altura: 72, tipo: 'paisagem' }] }],
    chao: { estilo: 'taco', topo: ['#d8a060', '#b8803e', '#7a4e24'], terra: ['#a87038', '#8a5a2e'] },
    ambiente: ['#ffffff', 1.0],
  },
  'quarto-menino-noite': {
    ceu: { cores: ['#2a3050'] },
    camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true, noite: true,
      cor: ['#c4daf4', '#8ab4e4', '#6a94c8'], padrao: 'estrelas', teto: ['#eef4fc', '#d4e0f0', '#9aaac4'],
      rodape: ['#f4f4f4', '#e0e0e0', '#b8b8c4'],
      janelas: [{ x: 128, w: 44, h: 40, cortina: ['#e8a040', '#c07820'] }],
      portas: [{ x: 404, w: 30, h: 76 }],
      quadros: [{ x: 228, w: 22, h: 30, altura: 66, tipo: 'poster', cores: ['#c83c4c', '#a82a3c'], estrela: true },
                { x: 290, w: 30, h: 20, altura: 72, tipo: 'paisagem' }] }],
    chao: { estilo: 'taco', topo: ['#d8a060', '#b8803e', '#7a4e24'], terra: ['#a87038', '#8a5a2e'] },
    ambiente: ['#7a84c0', 0.62],
  },
  'sala-estar': {
    ceu: { cores: ['#f0e4d0'] },
    camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
      cor: ['#f4dcb4', '#e8c898', '#c8a474'], padrao: 'listras', teto: ['#faf4e8', '#e8dcc8', '#b0a088'],
      meiaParede: { altura: 30, padrao: 'lambri', cores: ['#c08a5a', '#a06e44', '#6e4a2a'] },
      rodape: ['#6e4a2a', '#5a3a20', '#40281a'],
      janelas: [{ x: 84, w: 56, h: 44, cortina: ['#b83a4a', '#8a2a3a'] }],
      portas: [{ x: 404, w: 30, h: 78, cor: ['#f4f0e8', '#e0d8c8', '#a8a090'] }],
      quadros: [{ x: 238, w: 34, h: 22, altura: 74, tipo: 'paisagem' }, { x: 282, w: 22, h: 16, altura: 78, tipo: 'familia' }] }],
    chao: { estilo: 'taco', topo: ['#c08a52', '#a0703e', '#6a4424'], terra: ['#8a5a30', '#704826'] },
    ambiente: ['#fff6e8', 1.0],
  },
  // PROTÓTIPO (não aprovado): quarto de menina — parede lilás listrada, meia-parede branca, cortina rosa
  'quarto-menina': {
    ceu: { cores: ['#f0dcec'] },
    camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
      cor: ['#f4dcf0', '#e4bce0', '#c498c0'], padrao: 'listras', teto: ['#fcf4fa', '#ecdcea', '#b8a0b8'],
      meiaParede: { altura: 28, padrao: 'lambri', cores: ['#ffffff', '#ece8f0', '#c0b8c8'] },
      rodape: ['#ffffff', '#ece8f0', '#b8b0c0'],
      janelas: [{ x: 128, w: 44, h: 40, cortina: ['#f8a8cc', '#d87aa8'] }],
      portas: [{ x: 404, w: 30, h: 76, cor: ['#f4f0e8', '#e0d8c8', '#a8a090'] }],
      quadros: [{ x: 228, w: 22, h: 30, altura: 66, tipo: 'poster', cores: ['#8a5ad8', '#6a3ab8'], estrela: true },
                { x: 290, w: 30, h: 20, altura: 72, tipo: 'paisagem' }] }],
    chao: { estilo: 'taco', topo: ['#e8c090', '#c89a68', '#8a6440'], terra: ['#b88a58', '#9a7044'] },
    ambiente: ['#ffffff', 1.0],
  },
};
PRESETS_INTERIORES['quarto-menina-noite'] = {
  ...PRESETS_INTERIORES['quarto-menina'], ceu: { cores: ['#2a2848'] },
  camadas: [{ ...PRESETS_INTERIORES['quarto-menina'].camadas[0], noite: true }],
  ambiente: ['#7a84c0', 0.62],
};
export { K };
