// PROTÓTIPO — melhorias da cidade (Vila Serena) para histórias futuras.
//   Vida na rua: pombo-rua (bica e voa), carro-vermelho/-azul/-amarelo/-branco, onibus, bicicleta, varal (roupas balançando).
//   Rua e praça: ponto-onibus, semaforo (verde/amarelo/vermelho/piscando/apagado), placa-rua (rua/pare/nao-olhe/vazia),
//     relogio-digital (10-00, 12-00, 03-33, 00-00, piscando), cartaz-muda (circo/sorriso/olhos/vazio), janela-cortina (fechada/
//     aberta/balancando/acesa/vulto), mastro-bandeira (tremulando), portao-escola (aberto/fechado), trave, bola, vassoura.
//   Parquinho (praça): escorregador, balanco (parado/balancando/sozinho), gira-gira (parado/girando), gangorra (parado/subindo).
//   Mercado: carrinho-compras. Telas em close ("tela": true): tv-noticia (jornal/urgente/chuvisco/desligada) e celular
//     (inicio/mensagem/notificacao/chamada/camera/rachado/sem-sinal).
//   Moradores: motorista, gari, pipoqueiro, medica.
//   Interiores (cômodos em diorama, em prototipos/cenarios.json): onibus-dentro, mercado-dentro, consultorio, biblioteca.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { desenharTexto } from '../fonte.js';
import { MOVEIS, COMODOS_DIAGONAL, DECOR } from '../cenarios/comodoDiagonal.js';
import { PRESETS_INTERIORES } from '../cenarios/interiores.js';
import { iso } from './praca.js';
import { pessoaComSentado as pessoa } from './moradores.js';

const K = '#14121c';
const texto = (p, t, x, y, cor) => desenharTexto({ fillStyle: cor, fillRect(px, py, w, h) { p.ret(Math.round(px), Math.round(py), w, h, this.fillStyle); } }, t, x, y - 2, cor);
const est = (pares, extra = {}) => { const quadros = [], anims = {}; for (const [k, lista, fps] of pares) anims[k] = { q: lista.map((q) => { quadros.push(q); return quadros.length - 1; }), fps: fps || 1 }; return { quadros, anims, ...extra }; };
const VIDRO = ['#cfe8f8', '#8ab8d8', '#5a88a8'], PNEU = '#22222a', CROMO = '#c8ccd8';

// ------------------------------------------------------------------ objetos isométricos (MOVEIS)
const carro = (cor) => ({ di: 0.9, dj: 1.9, f(L, m) {
  const { i0, i1, j0, j1 } = m, esc = (c) => c;
  for (const b of [j0 + 0.25, j1 - 0.55]) L.caixa(i1 - 0.06, i1 + 0.02, b, b + 0.3, 0, 5, PNEU);             // rodas
  L.caixa(i0, i1, j0, j1, 2, 8, { frente: (u, t, l) => (t === 0 ? '#3a3a44' : t === 7 ? cor[0] : u < 0.08 || u > l - 0.08 ? cor[2] : cor[1]),
    lado: (u, t) => (t > 2 && t < 6 && (u < 0.18 || u > 0.72) ? ['#fff4c0', 2] : t === 1 ? CROMO : cor[2]), topo: cor[0] });          // faróis na ponta
  L.caixa(i0 + 0.08, i1 - 0.08, j0 + 0.45, j1 - 0.4, 10, 6, { frente: (u, t, l) => (Math.abs(u - l / 2) < 0.05 || u < 0.06 || u > l - 0.06 ? cor[2] : t > 3 ? VIDRO[0] : VIDRO[1]),
    lado: (u, t) => (t > 0 ? VIDRO[1] : cor[2]), topo: cor[0] });
  void esc;
} });
Object.assign(MOVEIS, {
  'carro-vermelho': carro(['#f05a5a', '#d83a3a', '#9a2028']), 'carro-azul': carro(['#5a9af0', '#3a7ad8', '#24508a']),
  'carro-amarelo': carro(['#f8e060', '#f0c830', '#b88a1a']), 'carro-branco': carro(['#ffffff', '#e4e6ee', '#a8acb8']),
  onibus: { di: 1.0, dj: 4.6, f(L, m) {
    const { i0, i1, j0, j1 } = m, C = ['#5ad07a', '#3aa858', '#24703a'];
    for (const b of [j0 + 0.4, j1 - 0.9]) L.caixa(i1 - 0.06, i1 + 0.02, b, b + 0.4, 0, 6, PNEU);
    L.caixa(i0, i1, j0, j1, 2, 26, { frente: (u, t, l) => {
      if (t === 0) return '#3a3a44';
      if (t > 12 && t < 22) return Math.floor(u * 4) % 3 === 0 ? C[2] : (t > 18 ? VIDRO[0] : VIDRO[1]);   // janelas
      if (u > l - 0.9 && u < l - 0.5 && t < 22) return t > 12 ? VIDRO[1] : '#2a2a34';                     // porta
      return t > 22 ? '#f4f4f4' : t === 7 || t === 8 ? '#f4f4f4' : C[1];
    }, lado: (u, t) => (t > 12 && t < 23 ? VIDRO[1] : t > 23 ? (u > 0.2 && u < 0.8 ? ['#f8d040', 2] : '#2a2a34') : t > 3 && t < 6 && (u < 0.2 || u > 0.8) ? ['#fff4c0', 2] : C[2]),
      topo: (a, b) => (Math.floor(b * 2) % 3 === 0 ? '#c8ccd8' : '#e4e6ee') });
  } },
  bicicleta: { di: 0.2, dj: 1.1, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 12, { frente: (u, t) => {
      const px = u * 16, r1 = Math.hypot(px - 3.5, t - 4), r2 = Math.hypot(px - 14, t - 4);
      if ((r1 > 2.6 && r1 < 3.7) || (r2 > 2.6 && r2 < 3.7)) return PNEU;
      if (Math.abs((t - 4) - (px - 3.5) * 0.55) < 0.7 && px > 3.5 && px < 10) return '#d83a3a';
      if (Math.abs(t - 8) < 0.7 && px > 6 && px < 12) return '#d83a3a';
      if (Math.abs(px - 12) < 0.8 && t > 4 && t < 11) return '#d83a3a';
      if (t === 9 && px > 4 && px < 7) return '#2a2a34';
      return null;
    }, lado: () => null, topo: () => null });
  } },
  'ponto-onibus': { di: 0.8, dj: 2.4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i0 + 0.06, j0, j1, 0, 34, { frente: (u, t) => (t < 2 || t > 32 || u < 0.06 || u > 2.34 ? '#5a5e6a' : (u * 16 + t) % 11 === 0 ? '#ffffff' : VIDRO[0]), lado: '#5a5e6a', topo: '#5a5e6a' });   // vidro do fundo
    for (const b of [j0, j1 - 0.08]) L.caixa(i1 - 0.08, i1, b, b + 0.08, 0, 34, '#5a5e6a');
    L.caixa(i0 - 0.05, i1 + 0.1, j0 - 0.1, j1 + 0.1, 34, 3, { frente: '#3a6ac8', lado: '#2a4a9a', topo: '#5a8ae8' });   // telhado
    L.caixa(i0 + 0.1, i0 + 0.4, j0 + 0.3, j1 - 0.3, 9, 2, { frente: '#a87a48', lado: '#7a5434', topo: '#c8905a' });  // banco
    L.caixa(i1 - 0.06, i1, j0 + 0.2, j0 + 0.26, 0, 30, '#8a8e9c');                                                  // placa no poste
    L.caixa(i1 - 0.08, i1 + 0.02, j0 + 0.05, j0 + 0.45, 30, 9, { frente: (u, t) => (t > 1 && t < 7 && u > 0.1 && u < 0.3 ? '#ffffff' : '#3a6ac8'), lado: '#2a4a9a', topo: '#2a4a9a' });
  } },
  varal: { di: 0.2, dj: 2.6, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, f = ctx.op.f || 0;
    for (const b of [j0, j1 - 0.1]) L.caixa(i0, i1, b, b + 0.1, 0, 36, '#7a5434');
    L.caixa(i0 + 0.05, i1 - 0.05, j0, j1, 35, 1, '#d8d0c0');
    [['#e83a3a', 0.3, 14], ['#3a8ad8', 0.9, 12], ['#f8d040', 1.5, 10], ['#f4f4f4', 2.0, 13]].forEach(([c, b, h], k) => {
      const sw = Math.round(Math.sin((f + k) * 1.6) * 1.5) * 0.06;
      L.caixa(i0 + 0.05, i1 - 0.05, j0 + b + sw, j0 + b + 0.4 + sw, 35 - h, h, { frente: (u, t) => (t === h - 1 ? '#ffffff' : c), lado: c, topo: c });
    });
  } },
  semaforo: { di: 0.3, dj: 0.3, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, luz = ctx.op.luz;
    L.caixa(i0 + 0.1, i1 - 0.1, j0 + 0.1, j1 - 0.1, 0, 36, '#3a3a44');
    L.caixa(i0, i1, j0, j1, 36, 18, { frente: (u, t) => {
      const k = t < 6 ? 'verde' : t < 12 ? 'amarelo' : 'vermelho', cy = t % 6;
      if (cy < 1 || cy > 4 || u < 0.08 || u > 0.22) return '#22222a';
      const cores = { verde: '#3ae070', amarelo: '#f8d040', vermelho: '#ff3a3a' };
      return luz === k ? [cores[k], 2] : '#4a4a52';
    }, lado: '#22222a', topo: '#3a3a44' });
  } },
  escorregador: { di: 0.7, dj: 2.8, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const b of [j0, j0 + 0.6]) for (const a of [i0, i1 - 0.08]) L.caixa(a, a + 0.08, b, b + 0.08, 0, 32, '#3a8ad8');
    for (let t = 4; t < 32; t += 6) L.caixa(i0, i1, j0, j0 + 0.08, t, 1, '#f8d040');                         // degraus
    L.caixa(i0, i1, j0, j0 + 0.7, 32, 3, { frente: '#e83a3a', lado: '#a82a2a', topo: '#f05a5a' });               // plataforma
    for (let k = 0; k < 14; k++) L.caixa(i0 + 0.05, i1 - 0.05, j0 + 0.7 + k * 0.15, j0 + 0.85 + k * 0.15, 30 - k * 2.2, 3, { frente: '#f8d040', lado: '#c8a020', topo: '#fff080' });   // rampa
  } },
  balanco: { di: 0.6, dj: 2.4, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, a1 = ctx.op.a1 ?? 0, a2 = ctx.op.a2 ?? 0;
    for (const b of [j0, j1 - 0.08]) { L.caixa(i0, i0 + 0.08, b, b + 0.08, 0, 38, '#e83a3a'); L.caixa(i1 - 0.08, i1, b, b + 0.08, 0, 38, '#e83a3a'); }
    L.caixa(ci - 0.04, ci + 0.04, j0, j1, 38, 2, '#c82a2a');
    for (const [b, a] of [[j0 + 0.5, a1], [j1 - 0.95, a2]]) {
      const di = a * 0.35;                                                                                    // o assento vai para a frente e para trás
      L.caixa(ci + di - 0.02, ci + di + 0.02, b + 0.05, b + 0.08, 10 + Math.abs(a) * 3, 28 - Math.abs(a) * 3, '#8a8e9c');
      L.caixa(ci + di - 0.02, ci + di + 0.02, b + 0.37, b + 0.4, 10 + Math.abs(a) * 3, 28 - Math.abs(a) * 3, '#8a8e9c');
      L.caixa(ci + di - 0.12, ci + di + 0.12, b, b + 0.45, 8 + Math.abs(a) * 3, 2, { frente: '#f8d040', lado: '#c8a020', topo: '#fff080' });
    }
  } },
  'gira-gira': { di: 1.6, dj: 1.6, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2, ang = (ctx.op.ang ?? 0) * Math.PI / 8;
    L.caixa(i0 + 0.1, i1 - 0.1, j0 + 0.1, j1 - 0.1, 0, 4, { frente: '#3aa858', lado: '#2a7a3a', topo: (a, b) => (Math.floor(Math.atan2(a - 0.7, b - 0.7) / (Math.PI / 4) + 8 + ang * 4 / Math.PI) % 2 ? '#5ad07a' : '#f8d040') });
    for (let k = 0; k < 4; k++) { const t = ang + k * Math.PI / 2, a = ci + Math.cos(t) * 0.55, b = cj + Math.sin(t) * 0.55; L.caixa(a - 0.04, a + 0.04, b - 0.04, b + 0.04, 4, 12, '#e83a3a'); }
    L.caixa(ci - 0.05, ci + 0.05, cj - 0.05, cj + 0.05, 4, 16, '#c82a2a');
  } },
  gangorra: { di: 0.4, dj: 2.6, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, inc = ctx.op.inc ?? 0, cj = (j0 + j1) / 2;
    L.caixa(i0 + 0.1, i1 - 0.1, cj - 0.15, cj + 0.15, 0, 8, '#3a8ad8');
    for (let k = 0; k < 13; k++) { const b = j0 + k * 0.2, h = 8 + (b - cj) * inc * 4; L.caixa(i0, i1, b, b + 0.2, h, 2, { frente: '#e83a3a', lado: '#a82a2a', topo: '#f05a5a' }); }
  } },
  'carrinho-compras': { di: 0.5, dj: 0.8, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const [a, b] of [[i0, j0], [i1 - 0.06, j0], [i0, j1 - 0.06], [i1 - 0.06, j1 - 0.06]]) L.caixa(a, a + 0.06, b, b + 0.06, 0, 2, PNEU);
    L.caixa(i0, i1, j0, j1, 4, 12, { frente: (u, t) => (Math.floor(u * 16) % 3 === 0 || t % 3 === 0 ? CROMO : null), lado: (u, t) => (Math.floor(u * 16) % 3 === 0 || t % 3 === 0 ? '#9aa0ac' : null), topo: (a, b, d) => (d < 0.04 ? CROMO : null) });
    L.caixa(i0, i0 + 0.06, j0 - 0.15, j1 + 0.05, 16, 2, '#e83a3a');                                                // alça
  } },
  'mastro-bandeira': { di: 0.2, dj: 1.2, f(L, m, ctx) {
    const { i0, i1, j0 } = m, f = ctx.op.f || 0;
    L.caixa(i0, i1, j0, j0 + 0.1, 0, 70, '#c8ccd8');
    L.caixa(i0 + 0.04, i1 - 0.04, j0 + 0.1, j0 + 1.1, 54, 14, { frente: (u, t) => { const onda = Math.round(Math.sin(u * 6 + f * 1.6) * 1.2); if (t + onda < 0 || t + onda > 13) return null; return t + onda > 9 ? '#3a8ad8' : t + onda > 4 ? '#f8f4e0' : '#3ab060'; }, lado: '#3a8ad8', topo: () => null });
  } },
  'portao-escola': { di: 0.15, dj: 3.0, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, aberto = ctx.op.aberto;
    for (const b of [j0, j1 - 0.3]) L.caixa(i0 - 0.1, i1 + 0.1, b, b + 0.3, 0, 40, { frente: '#d8c498', lado: '#a8946c', topo: '#e8d8b0' });   // pilares
    if (!aberto) L.caixa(i0, i1, j0 + 0.3, j1 - 0.3, 0, 34, { frente: (u, t) => (Math.floor(u * 16) % 4 === 0 || t === 2 || t === 32 ? '#2e7a46' : null), lado: '#2e7a46', topo: '#2e7a46' });
    else for (const b of [j0 + 0.3, j1 - 0.45]) L.caixa(i0 - 0.6, i0, b, b + 0.15, 0, 34, { frente: (u, t) => (t % 4 === 0 ? '#2e7a46' : null), lado: (u, t) => (Math.floor(u * 16) % 4 === 0 || t === 2 || t === 32 ? '#2e7a46' : null), topo: '#2e7a46' });
  } },
  // muro baixo da escola (pintado, com grade verde em cima): em trechos de 4 de comprimento, na frente do pátio
  'muro-escola': { di: 0.25, dj: 4.0, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 10, { frente: (u, t) => (t === 9 ? '#f4ecd8' : t < 2 ? '#a8946c' : Math.floor(u * 2) % 2 ? '#e8d8b0' : '#ecdcb6'), lado: '#c8b48c', topo: '#f4ecd8' });
    L.caixa(i0 + 0.08, i1 - 0.08, j0, j1, 10, 12, { frente: (u, t) => (Math.floor(u * 16) % 4 === 0 || t === 11 ? '#2e7a46' : null), lado: (u, t) => (t === 11 ? '#2e7a46' : null), topo: '#2e7a46' });
  } },
  trave: { di: 0.6, dj: 1.8, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const b of [j0, j1 - 0.08]) L.caixa(i1 - 0.08, i1, b, b + 0.08, 0, 22, '#f4f4f4');
    L.caixa(i1 - 0.08, i1, j0, j1, 22, 2, '#f4f4f4');
    L.caixa(i0, i1 - 0.08, j0, j1, 0, 22, { frente: () => null, lado: (u, t) => ((Math.floor(u * 16) + t) % 3 === 0 ? '#d8dce4' : null), topo: (a, b) => ((Math.floor(a * 16) + Math.floor(b * 16)) % 3 === 0 ? '#d8dce4' : null) });
  } },
});

// ------------------------------------------------------------------ sprites de frente (desenhados em Pix)
function pombo(f) {
  const p = new Pix(14, 12), c = ['#a8acb8', '#7a7e8c', '#5a5e6a'];
  if (f.voando) {
    p.elipse(7, 6, 3, 1.8, c[1]); p.ret(3, f.asa ? 2 : 6, 4, 2, c[0]); p.ret(8, f.asa ? 2 : 6, 4, 2, c[0]); p.circulo(10.5, 5, 1.6, c[1]); p.set(12, 5, '#e8a040');
  } else {
    p.elipse(6, 8, 3.6, 2.4, c[1]); p.ret(2, 8, 2, 2, c[2]); p.ret(5, 10, 1, 2, '#e89a8a'); p.ret(7, 10, 1, 2, '#e89a8a');
    const hy = f.bica ? 9 : 5; p.circulo(9.5, hy, 1.7, c[0]); p.set(9, hy + 1, '#7ac8a0'); p.set(10, hy - 1, K); p.set(11, hy, '#e8a040');
  }
  return p.contorno(K);
}
function placaRua(tipo) {
  const p = new Pix(30, 44);
  p.ret(14, 14, 2, 30, '#8a8e9c');
  if (tipo === 'pare') { p.circulo(15, 9, 8.5, '#d83a3a'); texto(p, 'PARE', 6, 7, '#ffffff'); }
  else {
    const cor = tipo === 'nao-olhe' ? '#2a2a34' : '#2e8a4a';
    p.ret(1, 3, 28, 12, cor); p.ret(1, 3, 28, 1, '#ffffff'); p.ret(1, 14, 28, 1, '#ffffff');
    const t = { rua: 'R. SERENA', 'nao-olhe': 'NÃO OLHE', vazia: '' }[tipo] ?? '';
    if (t) texto(p, t, 3, 6, tipo === 'nao-olhe' ? '#ff5a5a' : '#ffffff');
  }
  return p.contorno(K);
}
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g' };
function digito(p, x, y, ch, cor) {
  const s = SEG[ch] || '', on = (k) => s.includes(k);
  if (on('a')) p.ret(x + 1, y, 3, 1, cor); if (on('g')) p.ret(x + 1, y + 4, 3, 1, cor); if (on('d')) p.ret(x + 1, y + 8, 3, 1, cor);
  if (on('f')) p.ret(x, y + 1, 1, 3, cor); if (on('b')) p.ret(x + 4, y + 1, 1, 3, cor); if (on('e')) p.ret(x, y + 5, 1, 3, cor); if (on('c')) p.ret(x + 4, y + 5, 1, 3, cor);
}
function relogioDigital(hora, aceso = true) {
  const p = new Pix(32, 46), b = new Pix(32, 46);
  p.ret(15, 18, 2, 28, '#5a5e6a'); p.ret(1, 2, 30, 16, '#2a2a34'); p.ret(2, 3, 28, 14, '#14121c');
  if (aceso) { const cor = hora === '03:33' ? '#ff3a3a' : '#5af07a'; [...hora].forEach((ch, k) => { if (ch === ':') { p.set(15, 7, cor); p.set(15, 12, cor); b.set(15, 7, cor); b.set(15, 12, cor); } else { const x = 3 + k * 6 + (k > 2 ? 0 : 0); digito(p, x, 5, ch, cor); digito(b, x, 5, ch, cor); } }); }
  p.contorno(K);
  return { p, b };
}
function telaTV(modo, f = 0) {
  const p = new Pix(96, 64);
  p.ret(0, 0, 96, 58, '#2a2a34'); p.ret(38, 58, 20, 3, '#3a3a44'); p.ret(30, 61, 36, 3, '#2a2a34');
  const T = (x, y, c) => { if (x >= 4 && x < 92 && y >= 4 && y < 54) p.set(x, y, c); };
  for (let y = 4; y < 54; y++) for (let x = 4; x < 92; x++) {
    if (modo === 'desligada') T(x, y, (x + y) % 23 === 0 ? '#3a3a48' : '#14141c');
    else if (modo === 'chuvisco') { const v = ((x * 92821 + y * 68917 + f * 1013) >>> 0) % 7; T(x, y, ['#ffffff', '#c8c8d0', '#8a8a94', '#4a4a54', '#22222a', '#e8e8ee', '#6a6a74'][v]); }
    else T(x, y, y < 40 ? (x < 48 ? '#3a5a9a' : '#4a6aaa') : '#2a3a6a');
  }
  if (modo === 'jornal' || modo === 'urgente') {
    p.circulo(30, 22, 6, '#f0c4a0'); p.elipse(30, 16, 6.5, 3, '#3a2418'); p.ret(22, 28, 16, 12, '#3a3a48'); p.ret(28, 28, 4, 6, '#f4f4f4'); p.set(28, 22, K); p.set(32, 22, K); p.ret(29, 25, 3, 1, '#a84a4a');
    p.ret(56, 12, 30, 20, '#2a2a48'); for (let k = 0; k < 4; k++) p.ret(60, 16 + k * 4, 20 - k * 3, 1, '#c8d0e8');
    p.ret(4, 42, 88, 10, modo === 'urgente' ? '#d83a3a' : '#f4f4f4');
    texto(p, modo === 'urgente' ? 'URGENTE' : 'VILA SERENA', 8, 45, modo === 'urgente' ? '#ffffff' : '#2a3a6a');
  }
  return p.contorno(K);
}
function cartaz(modo) {
  const p = new Pix(32, 40);
  p.ret(3, 30, 2, 10, '#6a4424'); p.ret(27, 30, 2, 10, '#6a4424');
  p.ret(0, 0, 32, 30, '#f4ecd8'); p.ret(0, 0, 32, 1, '#c8b898');
  if (modo === 'circo') { for (let x = 1; x < 31; x++) for (let y = 1; y < 12; y++) p.set(x, y, Math.floor(x / 4) % 2 ? '#e83a3a' : '#f4f4f4'); texto(p, 'CIRCO', 3, 15, '#2a5ab0'); p.circulo(16, 25, 3, '#f8d040'); }
  if (modo === 'sorriso') { p.ret(1, 1, 30, 28, '#f8d040'); for (const x of [10, 21]) p.ret(x, 8, 2, 4, K); for (let x = 7; x <= 24; x++) p.set(x, 18 + Math.round(((x - 15.5) ** 2) / 22) * -1 + 3, K); }
  if (modo === 'olhos') { p.ret(1, 1, 30, 28, '#2a2a34'); for (const x of [9, 22]) { p.elipse(x, 14, 4, 3, '#f4f4f0'); p.circulo(x, 14, 1.4, '#d83a3a'); } }
  return p.contorno(K);
}
function janelaCortina(modo, f = 0) {
  const p = new Pix(20, 24), b = new Pix(20, 24);
  p.ret(0, 0, 20, 24, '#e8e0d0'); p.ret(2, 2, 16, 20, modo === 'acesa' || modo === 'vulto' ? '#ffd070' : '#5a7898');
  if (modo === 'acesa' || modo === 'vulto') for (let y = 2; y < 22; y++) for (let x = 2; x < 18; x++) b.set(x, y, '#ffd070');
  if (modo === 'vulto') { p.circulo(10, 9, 3, '#2a2030'); p.ret(6, 12, 8, 10, '#2a2030'); for (let y = 6; y < 22; y++) for (let x = 6; x < 14; x++) if (p.d[(y * 20 + x) * 4] === 0x2a) b.d[(y * 20 + x) * 4 + 3] = 0; }
  const ab = modo === 'aberta' ? 2 : modo === 'balancando' ? 4 + Math.round(Math.sin(f * 1.6) * 2) : 7;
  for (let y = 2; y < 22; y++) { p.ret(2, y, ab, 1, y % 3 ? '#e85a6a' : '#c83a4a'); p.ret(18 - ab, y, ab, 1, y % 3 ? '#e85a6a' : '#c83a4a'); }
  p.ret(9, 2, 2, 20, '#e8e0d0'); p.ret(2, 11, 16, 1, '#e8e0d0');
  p.contorno(K);
  return { p, b };
}
function celular(modo) {
  const W = 48, H = 88, p = new Pix(W, H);
  p.ret(0, 0, W, H, '#1e1e26'); p.ret(1, 1, W - 2, H - 2, '#2a2a34'); p.ret(20, 4, 8, 2, '#14141c');
  const x0 = 4, y0 = 9, w = 40, h = 70;
  const fundo = (c1, c2) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) p.set(x, y, (y - y0) / h > 0.5 ? c2 : c1); };
  if (modo === 'sem-sinal') { fundo('#14141c', '#14141c'); texto(p, 'SEM SINAL', 7, 40, '#ff5a5a'); }
  else if (modo === 'chamada') {
    fundo('#2a3a5a', '#1e2a44'); p.circulo(24, 28, 8, '#5a6a8a'); p.circulo(24, 25, 3.2, '#2a3a5a'); p.elipse(24, 33, 5, 3, '#2a3a5a');
    texto(p, '???', 16, 44, '#ffffff'); p.circulo(13, 66, 5, '#3ae070'); p.circulo(35, 66, 5, '#ff3a3a');
  } else if (modo === 'camera') {
    fundo('#6a8a9a', '#4a6a5a'); for (const x of [17, 30]) p.ret(x, y0, 1, h, '#ffffff'); for (const y of [32, 55]) p.ret(x0, y, w, 1, '#ffffff');
    p.circulo(32, 36, 3, '#14141c'); p.ret(29, 39, 6, 10, '#14141c');   // alguém atrás
    p.circulo(24, 74, 4, '#ffffff');
  } else {
    fundo('#7a5ad8', '#e86a9a'); texto(p, '13:07', 12, 16, '#ffffff');
    for (let k = 0; k < 8; k++) p.ret(8 + (k % 4) * 9, 46 + Math.floor(k / 4) * 10, 6, 6, ['#3ae070', '#3a8ad8', '#f8d040', '#ff5a5a', '#ffffff', '#5ac8e8', '#f08a30', '#c85ad8'][k]);
    if (modo === 'notificacao') { p.ret(6, 24, 36, 12, '#f4f4f4'); p.ret(8, 26, 6, 6, '#3ae070'); p.ret(16, 27, 22, 1, '#2a2a34'); p.ret(16, 31, 16, 1, '#8a8a94'); }
    if (modo === 'mensagem') {
      fundo('#e8e4dc', '#e8e4dc'); p.ret(x0, y0, w, 8, '#3aa868');
      p.ret(7, 22, 24, 8, '#ffffff'); p.ret(17, 34, 24, 8, '#c8f0b8'); p.ret(7, 46, 20, 8, '#ffffff'); p.ret(13, 58, 28, 8, '#c8f0b8');
      for (const [y, x, wl] of [[25, 9, 18], [37, 19, 18], [49, 9, 14], [61, 15, 22]]) p.ret(x, y, wl, 1, '#5a5a64');
    }
  }
  if (modo === 'rachado') for (const [x, y] of [[30, 20], [28, 24], [27, 28], [29, 32], [26, 36], [24, 41], [31, 26], [34, 29], [36, 33], [22, 46], [20, 52]]) { p.set(x, y, '#ffffff'); p.set(x + 1, y + 1, '#c8c8d0'); }
  return p.contorno(K);
}
const vassoura = () => { const p = new Pix(8, 24); p.ret(3, 0, 2, 16, '#a87a48'); p.ret(1, 16, 6, 7, '#e8c860'); for (let x = 1; x < 7; x += 2) p.ret(x, 19, 1, 4, '#c8a040'); return p.contorno(K); };
const bola = () => { const p = new Pix(8, 8); p.circulo(4, 4, 3.4, (x, y) => ((x + y) % 4 < 2 ? '#f4f4f4' : '#2a2a34')); return p.contorno(K); };

// ------------------------------------------------------------------ moradores novos
const NOVOS = {
  motorista: { cores: { pele: '#c88a64', cabelo: '#2a1e1a', bigode: '#2a1e1a', tronco: '#8ab8e0', calca: '#2a3a5a', sapato: '#2a2420', chapeu: '#2a3a5a', aba: '#1e2a44' },
    cabelo: 'curto', chapeu: 'quepe', bigode: true, mangaCurta: true, gravata: true, baixo: 'calca' },
  gari: { cores: { pele: '#a8704a', cabelo: '#1e1410', tronco: '#f08a30', calca: '#f08a30', sapato: '#2a2420', chapeu: '#f08a30', aba: '#c86a1a', cinto: '#f8f4c8' },
    cabelo: 'curto', chapeu: 'bone', cinto: true, baixo: 'calca' },
  pipoqueiro: { cores: { pele: '#f0c4a0', cabelo: '#6a4a3a', bigode: '#5a3a2a', tronco: '#d83a3a', avental: '#f4f4f4', calca: '#3a3a48', sapato: '#2a2420', chapeu: '#d83a3a', aba: '#a82a2a' },
    cabelo: 'curto', chapeu: 'bone', avental: true, bigode: true, corpo: 'largo', baixo: 'calca' },
  medica: { cores: { pele: '#8a5a40', cabelo: '#1e1410', tronco: '#5ab8c8', casaco: '#f8f8fc', calca: '#5ab8c8', sapato: '#f4f4f4' },
    cabelo: 'coque', casaco: true, colar: '#8a8e9c', oculos: true, baixo: 'calca' },
};

// ------------------------------------------------------------------ interiores (cômodos em diorama)
const MAD = ['#c8905a', '#9a6a3a', '#6a4424'], LIVROS = ['#c83c4c', '#3a6ac8', '#3aa860', '#f0b830', '#8a4ac8', '#e87a3a'];
const PROD = ['#e83a3a', '#f8d040', '#3a8ad8', '#3ab060', '#f08a30', '#d84a8a', '#f4f4f4'];
Object.assign(MOVEIS, {
  'banco-onibus': { di: 0.6, dj: 0.8, f(L, m) {   // banco duplo do ônibus (assento + encosto alto)
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 12, { frente: (u, t) => (t > 9 ? '#3a8ad8' : '#5a5e6a'), lado: '#2a5aa8', topo: '#5a9af0' });
    L.caixa(i0, i0 + 0.15, j0, j1, 12, 14, { frente: (u, t) => (t > 11 ? '#5a9af0' : '#3a8ad8'), lado: '#2a5aa8', topo: '#5a9af0' });
  } },
  'barra-onibus': { di: 0.1, dj: 0.1, f(L, m) { L.caixa(m.i0, m.i1, m.j0, m.j1, 0, 60, '#f8d040'); } },
  // prateleira do mercado (gôndola): estrutura de metal, 4 prateleiras com etiqueta de preço na borda e produtos de verdade
  // em fileiras: caixas (com faixa de rótulo), garrafas (com tampa) e latas; cada trecho de prateleira tem um tipo de produto.
  gondola: { di: 0.8, dj: 3.0, f(L, m) {
    const { i0, i1, j0, j1 } = m, ALT = 48, PRAT = 11;
    const produto = (sec, px, py) => {   // px: 0..15 dentro do trecho, py: 0..8 acima da prateleira (null = vazio/fundo)
      const tipo = sec % 3, cor = PROD[(sec * 5) % PROD.length], col = px % 5;
      if (tipo === 0) { if (col > 3 || py > 7) return null; return py === 5 ? '#ffffff' : py === 7 ? '#f4f4f4' : cor; }       // caixas (faixa de rótulo)
      if (tipo === 1) { if (col !== 1 && col !== 2) return null; if (py > 8) return null; return py >= 7 ? '#e4e6ee' : py === 6 ? cor : py < 2 ? cor : '#a8d8f0'; }   // garrafas
      if (col > 3 || py > 4) return null; return py === 4 ? '#c8ccd8' : py === 2 ? '#ffffff' : cor;                                   // latas
    };
    L.caixa(i0, i1, j0, j1, 0, ALT, {
      frente: (u, t, l) => {
        const px = Math.floor(u * 16);
        if (px < 1 || px > Math.floor(l * 16) - 2 || t > ALT - 2) return '#9aa0ac';                                 // laterais e topo de metal
        if (t < 3) return '#5a5e6a';                                                                              // rodapé
        const nivel = Math.floor((t - 3) / PRAT), py = (t - 3) % PRAT;
        if (py < 2) return py === 1 && px % 16 > 5 && px % 16 < 10 ? '#f8d040' : '#c8ccd8';                       // prateleira + etiqueta de preço
        const sec = Math.floor(px / 16) * 7 + nivel * 3;
        return produto(sec, px % 16, py - 2) || '#d8dce4';                                                         // fundo claro da gôndola
      },
      lado: (u, t) => (t > ALT - 2 || t < 3 ? '#5a5e6a' : t > 30 && t < 42 ? (Math.floor(u * 16) % 6 < 3 ? '#d83a3a' : '#f8d040') : '#b8bcc8'),   // cabeceira com faixa de oferta
      topo: (a, b) => (Math.floor(b * 4) % 3 === 0 ? PROD[Math.floor(b * 4) % PROD.length] : '#c8ccd8'),
    });
  } },
  freezer: { di: 0.9, dj: 2.0, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 14, { frente: (u, t) => (t > 11 ? '#c8ccd8' : t === 6 ? '#5ac8e8' : '#f4f6fa'), lado: '#c8ccd8', topo: (a, b, d) => (d < 0.08 ? '#c8ccd8' : (Math.floor(b * 6) + Math.floor(a * 4)) % 3 === 0 ? PROD[Math.floor(b * 6) % PROD.length] : '#a8e0f8') });
  } },
  'caixa-mercado': { di: 0.9, dj: 2.2, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 14, { frente: (u) => (u < 0.1 ? '#2e8a4a' : '#3aa858'), lado: '#2e7a3a', topo: (a, b) => (b < 1.4 ? (Math.floor(b * 10) % 2 ? '#2a2a34' : '#3a3a44') : '#e4e6ee') });   // esteira
    L.caixa(i0 + 0.1, i0 + 0.5, j1 - 0.6, j1 - 0.2, 14, 8, { frente: (u, t) => (t > 3 && t < 7 && u > 0.05 && u < 0.35 ? ['#5ae070', 2] : '#3a3a44'), lado: '#2a2a34', topo: '#4a4a54' });
  } },
  maca: { di: 0.9, dj: 2.2, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const [a, b] of [[i0 + 0.05, j0 + 0.05], [i1 - 0.12, j0 + 0.05], [i0 + 0.05, j1 - 0.12], [i1 - 0.12, j1 - 0.12]]) L.caixa(a, a + 0.07, b, b + 0.07, 0, 12, '#c8ccd8');
    L.caixa(i0, i1, j0, j1, 12, 4, { frente: '#e4e6ee', lado: '#c8ccd8', topo: (a, b) => (b < 0.5 ? '#ffffff' : '#c8e8f0') });
    L.caixa(i0 + 0.1, i1 - 0.1, j0 + 0.05, j0 + 0.45, 16, 3, { frente: '#ffffff', lado: '#e4e6ee', topo: '#ffffff' });   // travesseiro
  } },
  'armario-remedio': { di: 0.5, dj: 1.4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 46, { frente: (u, t, l) => (t % 12 < 1 || u < 0.05 || u > l - 0.05 ? '#c8ccd8' : t % 12 < 7 && Math.floor(u * 16) % 3 < 2 ? ['#f4f4f4', '#5ab8c8', '#f8d040', '#e85a6a'][(Math.floor(u * 4) + Math.floor(t / 12)) % 4] : '#e8f4f8'), lado: '#c8ccd8', topo: '#f4f6fa' });
  } },
  'estante-livros': { di: 0.55, dj: 2.4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 60, { frente: (u, t, l) => { if (u < 0.08 || u > l - 0.08 || t % 12 < 2) return MAD[1]; const k = Math.floor(u * 16 / 2) * 3 + Math.floor(t / 12); return (t % 12) - 2 < 7 + (k % 3) ? (Math.floor(u * 16) % 2 ? LIVROS[k % 6] : '#2a2030') : MAD[2]; }, lado: MAD[2], topo: MAD[0] });
  } },
  'mesa-leitura': { di: 1.0, dj: 2.0, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const [a, b] of [[i0 + 0.1, j0 + 0.1], [i1 - 0.18, j0 + 0.1], [i0 + 0.1, j1 - 0.18], [i1 - 0.18, j1 - 0.18]]) L.caixa(a, a + 0.08, b, b + 0.08, 0, 13, MAD[2]);
    L.caixa(i0, i1, j0, j1, 13, 2, { frente: MAD[1], lado: MAD[2], topo: MAD[0] });
    L.caixa(i0 + 0.3, i0 + 0.6, j0 + 0.4, j0 + 0.9, 15, 2, { frente: '#c83c4c', topo: '#f4f0e8' }); L.caixa(i0 + 0.2, i0 + 0.5, j1 - 0.8, j1 - 0.4, 15, 3, { frente: '#3a6ac8', topo: '#3a6ac8' });
    L.caixa(i0 + 0.1, i0 + 0.2, j1 - 0.3, j1 - 0.2, 15, 12, '#3a3a44'); L.caixa(i0 + 0.05, i0 + 0.35, j1 - 0.4, j1 - 0.1, 27, 4, ['#fff0a0', 2]);   // abajur
  } },
});
DECOR['cartaz-mercado'] = (d, u, U, t) => { const y0 = d.altura ?? 60, tt = t - y0; if (tt < 0 || tt >= 12) return null; if (tt < 2 || tt > 9) return '#d83a3a'; return (u + tt) % 7 === 0 ? '#ffffff' : '#f8d040'; };
DECOR['janela-onibus'] = (d, u, U, t) => { const y0 = d.peitoril ?? 40, tt = t - y0; if (tt < 0 || tt >= 22) return null; if (tt < 2 || tt > 19 || u % 26 < 2) return '#5a5e6a'; return tt > 12 ? '#cfe8f8' : (u % 26 > 18 ? '#a8d8a0' : '#8ab8d8'); };   // a paisagem passando lá fora
DECOR['quadro-saude'] = (d, u, U, t) => { const y0 = d.altura ?? 50, h = d.h ?? 20, tt = t - y0; if (tt < 0 || tt >= h) return null; if (tt < 1 || tt >= h - 1 || u < 1 || u >= U - 1) return '#8a8e9c'; const cx = U / 2, cy = h / 2; if ((Math.abs(u - cx) < 2 && Math.abs(tt - cy) < 6) || (Math.abs(tt - cy) < 2 && Math.abs(u - cx) < 6)) return '#3ab060'; return '#f8fafc'; };

const preset = (cor, meia, chao, ceu = '#f4f0e8') => ({ ceu: { cores: [ceu] }, camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true, cor, padrao: 'liso', teto: ['#f8f8fa', '#e0e0e6', '#a8a8b0'], meiaParede: meia, rodape: meia ? [meia.cores[2], meia.cores[2], '#3a3a44'] : ['#8a8a94', '#6a6a74', '#4a4a54'], janelas: [], portas: [], quadros: [] }], chao, ambiente: ['#ffffff', 1.0] });
PRESETS_INTERIORES['onibus-dentro'] = preset(['#f4f4f4', '#e4e6ee', '#b8bcc8'], { altura: 30, padrao: 'liso', cores: ['#5ad07a', '#3aa858', '#24703a'] }, { estilo: 'piso', topo: ['#8a8e9c', '#6a6e7a', '#4a4e5a'], terra: ['#5a5e6a', '#4a4e5a'] });
PRESETS_INTERIORES['mercado-dentro'] = preset(['#f8f8f4', '#ecece4', '#c8c8c0'], { altura: 16, padrao: 'liso', cores: ['#5ac87a', '#3aa858', '#24703a'] }, { estilo: 'piso', topo: ['#f4f4f0', '#dcdcd4', '#a8a8a0'], terra: ['#c8c8c0', '#a8a8a0'] });
PRESETS_INTERIORES.consultorio = preset(['#eef8fa', '#d8eef4', '#a8c8d4'], { altura: 22, padrao: 'liso', cores: ['#8ad0dc', '#5ab8c8', '#3a8a9a'] }, { estilo: 'piso', topo: ['#f4f8fa', '#dce6ec', '#a8b8c4'], terra: ['#c8d4dc', '#a8b4bc'] });
PRESETS_INTERIORES.biblioteca = preset(['#e8d8b8', '#d4c098', '#a88e68'], { altura: 26, padrao: 'lambri', cores: ['#9a6a3a', '#7a4e2a', '#4a2e18'] }, { estilo: 'piso', topo: ['#a8804e', '#8a6438', '#5a3e22'], terra: ['#7a5a34', '#5a4024'] });
// ÔNIBUS POR DENTRO: janelas com a paisagem, bancos azuis em duas fileiras, barras amarelas. Pessoas em pé no corredor (z 1.2–1.6);
// sentadas nos bancos ("pose": "sentado"): fileira do fundo z ~2.9, x -6, -3, 0, 3, 6.
COMODOS_DIAGONAL['onibus-dentro'] = { estilo: 'onibus-dentro', inicio: -9, fim: 9,
  paredes: [{ tipo: 'janela-onibus', x: 0, w: 18, peitoril: 40 }, { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#cfe8f8', '#8ab8d8', '#5a5e6a'] }],
  moveis: [...[-6, -3, 0, 3, 6].map((x) => ({ tipo: 'banco-onibus', x, i: 0.2 })), ...[-4.5, -1.5, 1.5, 4.5].map((x) => ({ tipo: 'barra-onibus', x, i: 1.9 }))], piso: [] };
// MERCADO POR DENTRO: 2 gôndolas cheias no fundo, freezer, caixa com esteira, cartazes de oferta, um carrinho parado. Corredor livre
// na frente (z 0–2); a caixa atende atrás do balcão (x ~5.6, z ~2.8).
COMODOS_DIAGONAL['mercado-dentro'] = { estilo: 'mercado-dentro', inicio: -9, fim: 9,
  paredes: [{ tipo: 'cartaz-mercado', x: -4, w: 2.4, altura: 64 }, { tipo: 'cartaz-mercado', x: 3, w: 2.4, altura: 64 }, { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#cfe8f8', '#8ab8d8', '#5a5e6a'] }],
  moveis: [{ tipo: 'gondola', x: -6.4, i: 0 }, { tipo: 'gondola', x: -3.0, i: 0 }, { tipo: 'freezer', x: 0.6, i: 0.1 }, { tipo: 'caixa-mercado', x: 5.4, i: 1.4 }, { tipo: 'carrinho-compras', x: 2.6, i: 0.2 }], piso: [{ x: -1.5, i0: 1.6, i1: 3.0, dj: 9, cor: ['#e4e6ee', '#d4d6de', '#c8ccd8'] }] };
// CONSULTÓRIO (posto de saúde): maca, armário de remédios, mesa, quadro com cruz verde. Médica atrás da mesa (x ~4.6, z ~2.6).
COMODOS_DIAGONAL.consultorio = { estilo: 'consultorio', inicio: -9, fim: 9,
  paredes: [{ tipo: 'quadro-saude', x: 0.6, w: 1.4, altura: 52, h: 22 }, { tipo: 'janela', x: -5.4, w: 2, peitoril: 44 }, { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#f4f8fa', '#dce6ec', '#a8b8c4'] }],
  moveis: [{ tipo: 'maca', x: -2.6, i: 0.2 }, { tipo: 'armario-remedio', x: -7.4, i: 0 }, { tipo: 'mesa-escritorio', x: 4.6, i: 1.2 }, { tipo: 'pia-banheiro', x: 1.8, i: 0 }], piso: [] };
// BIBLIOTECA: estantes altas de livros, mesas de leitura com abajur, globo. Pessoas z 0–1.6.
COMODOS_DIAGONAL.biblioteca = { estilo: 'biblioteca', inicio: -9, fim: 9,
  paredes: [{ tipo: 'janela', x: 6.4, w: 2, peitoril: 44, cortina: ['#c83c4c', '#8a2a3a'] }, { tipo: 'relogio', x: 3.6, w: 1, altura: 70, h: 14 }, { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#8a5a34', '#6a4424', '#4a2e18'] }],
  moveis: [{ tipo: 'estante-livros', x: -6.6, i: 0 }, { tipo: 'estante-livros', x: -3.6, i: 0 }, { tipo: 'estante-livros', x: -0.6, i: 0 }, { tipo: 'globo', x: 2.4, i: 0.2 },
    { tipo: 'mesa-leitura', x: -4.2, i: 1.8 }, { tipo: 'mesa-leitura', x: 2.6, i: 1.8 }], piso: [{ x: -1, i0: 1.4, i1: 3.0, dj: 4, cor: ['#a84a4a', '#8a3a3a', '#f0c860'] }] };

// ------------------------------------------------------------------ registro
const ISO = (tipo, op) => ({ tipo, op });
registrarSprites({
  ...Object.fromEntries(['carro-vermelho', 'carro-azul', 'carro-amarelo', 'carro-branco', 'onibus', 'bicicleta', 'ponto-onibus', 'escorregador', 'carrinho-compras', 'trave', 'muro-escola'].map((n) => [n, () => iso({ parado: ISO(n) })])),
  varal: () => { const s = iso({ a: ISO('varal', { f: 0 }), b: ISO('varal', { f: 1 }), c: ISO('varal', { f: 2 }), d: ISO('varal', { f: 3 }) }); s.anims = { parado: { q: [0, 1, 2, 3], fps: 4 } }; return s; },
  'mastro-bandeira': () => { const s = iso({ a: ISO('mastro-bandeira', { f: 0 }), b: ISO('mastro-bandeira', { f: 1 }), c: ISO('mastro-bandeira', { f: 2 }), d: ISO('mastro-bandeira', { f: 3 }) }); s.anims = { parado: { q: [0, 1, 2, 3], fps: 5 } }; return s; },
  semaforo: () => { const s = iso({ verde: ISO('semaforo', { luz: 'verde' }), amarelo: ISO('semaforo', { luz: 'amarelo' }), vermelho: ISO('semaforo', { luz: 'vermelho' }), apagado: ISO('semaforo', { luz: null }) }); s.anims.parado = s.anims.verde; s.anims.piscando = { q: [s.anims.amarelo.q[0], s.anims.apagado.q[0]], fps: 2 }; return s; },
  'portao-escola': () => { const s = iso({ fechado: ISO('portao-escola', { aberto: false }), aberto: ISO('portao-escola', { aberto: true }) }); s.anims.parado = s.anims.fechado; return s; },
  balanco: () => { const s = iso({ a: ISO('balanco', { a1: 0, a2: 0 }), b: ISO('balanco', { a1: 1, a2: -1 }), c: ISO('balanco', { a1: -1, a2: 1 }), d: ISO('balanco', { a1: 1, a2: 0 }), e: ISO('balanco', { a1: -1, a2: 0 }) });
    s.anims = { parado: { q: [0], fps: 1 }, balancando: { q: [1, 0, 2, 0], fps: 4 }, sozinho: { q: [3, 0, 4, 0], fps: 3 } }; return s; },
  'gira-gira': () => { const s = iso({ a: ISO('gira-gira', { ang: 0 }), b: ISO('gira-gira', { ang: 1 }), c: ISO('gira-gira', { ang: 2 }), d: ISO('gira-gira', { ang: 3 }) }); s.anims = { parado: { q: [0], fps: 1 }, girando: { q: [0, 1, 2, 3], fps: 6 } }; return s; },
  gangorra: () => { const s = iso({ a: ISO('gangorra', { inc: 0 }), b: ISO('gangorra', { inc: 1 }), c: ISO('gangorra', { inc: -1 }) }); s.anims = { parado: { q: [0], fps: 1 }, subindo: { q: [1, 0, 2, 0], fps: 3 } }; return s; },
  'pombo-rua': () => ({ ...est([['parado', [pombo({}), pombo({ bica: true }), pombo({}), pombo({})], 3], ['voando', [pombo({ voando: true, asa: true }), pombo({ voando: true })], 10]]), sombra: true }),
  'placa-rua': () => ({ ...est([['parado', [placaRua('rua')]], ['rua', [placaRua('rua')]], ['pare', [placaRua('pare')]], ['nao-olhe', [placaRua('nao-olhe')]], ['vazia', [placaRua('vazia')]]]), sombra: true }),
  'relogio-digital': () => { const quadros = [], brilho = [], anims = {}; const add = (h, a) => { const { p, b } = relogioDigital(h, a); quadros.push(p); brilho.push(b); return quadros.length - 1; };
    for (const h of ['10:00', '12:00', '03:33', '00:00']) anims[h.replace(':', '-')] = { q: [add(h)], fps: 1 };
    anims.parado = anims['10-00']; anims.piscando = { q: [add('--:--'), add('--:--', false)], fps: 2 }; return { quadros, brilho, anims, sombra: true }; },
  'tv-noticia': () => est([['parado', [telaTV('jornal')]], ['jornal', [telaTV('jornal')]], ['urgente', [telaTV('urgente')]], ['chuvisco', [telaTV('chuvisco', 0), telaTV('chuvisco', 1), telaTV('chuvisco', 2)], 12], ['desligada', [telaTV('desligada')]]], { sombra: false }),
  'cartaz-muda': () => ({ ...est([['parado', [cartaz('circo')]], ['circo', [cartaz('circo')]], ['sorriso', [cartaz('sorriso')]], ['olhos', [cartaz('olhos')]], ['vazio', [cartaz('vazio')]]]), sombra: true }),
  'janela-cortina': () => { const quadros = [], brilho = [], anims = {}; const add = (m, f) => { const { p, b } = janelaCortina(m, f); quadros.push(p); brilho.push(b); return quadros.length - 1; };
    for (const m of ['fechada', 'aberta', 'acesa', 'vulto']) anims[m] = { q: [add(m)], fps: 1 };
    anims.parado = anims.fechada; anims.balancando = { q: [0, 1, 2, 3].map((f) => add('balancando', f)), fps: 4 }; return { quadros, brilho, anims, sombra: false }; },
  celular: () => est(['inicio', 'mensagem', 'notificacao', 'chamada', 'camera', 'rachado', 'sem-sinal'].map((m) => [m, [celular(m)]]).concat([['parado', [celular('inicio')]]]), { sombra: false }),
  vassoura: () => est([['parado', [vassoura()]]], { sombra: false }),
  bola: () => est([['parado', [bola()]]], { sombra: true }),
  ...Object.fromEntries(Object.entries(NOVOS).map(([k, p]) => [k, () => pessoa(p)])),
}, { grupo: 'Cidade (melhorias)', status: 'protótipo' });
