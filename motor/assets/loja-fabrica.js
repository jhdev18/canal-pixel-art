// PROTÓTIPO (terror dos brinquedos): interiores da LOJA DE BRINQUEDOS e da FÁBRICA DE BRINQUEDOS, no sistema de cômodos em
// diorama (enchem a tela, como a cozinha e o quarto). De dia e bem iluminados (as táticas de retenção pedem dia).
// Cenários (prototipos/cenarios.json): loja-brinquedos-diorama, fabrica-brinquedos-diorama.
// As fachadas ficam na rua (motor/cenarios/ruaDiagonal.js, prédios "brinquedos" e "fabrica"):
//   rua-brinquedos (a rua comercial com a loja no lugar do prédio comum da esquerda) e fabrica-brinquedos (a fábrica no campo).
// Móveis novos: prateleira-brinquedos, balcao-loja, caixa-presentes, vitrine-vidro, cavalinho-balanco, trem-brinquedo (loja);
// esteira, maquina-brinquedos, caixa-pecas, forno, bancada (fábrica). Decorações de parede (DECOR): bandeirinhas, prateleira-parede,
// cartaz-brinquedo (loja); janela-fabrica, canos, engrenagens, aviso (fábrica).
import { MOVEIS, COMODOS_DIAGONAL, DECOR } from '../cenarios/comodoDiagonal.js';
import { PRESETS_INTERIORES } from '../cenarios/interiores.js';
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const MAD = ['#d8a070', '#b07a4a', '#7a4e2a'], METAL = ['#c8ccd8', '#9aa0ac', '#5a5e6a'];
const CORES = ['#e83a3a', '#3a8ad8', '#f8d040', '#3ab060', '#d84a8a', '#8a5ac8', '#f08a30'];

// brinquedo pequeno na prateleira (frente de cada nicho): bola, bloco, soldadinho, pião, boneca, robozinho
function brinquedoNicho(k, du, dt, alt) {
  const tipo = k % 6, c = CORES[k % CORES.length];
  if (tipo === 0) return (du - 0.25) ** 2 * 256 + (dt - 3) ** 2 < 10 ? (du < 0.25 ? c : '#ffffff') : null;           // bola
  if (tipo === 1) return du > 0.06 && du < 0.44 && dt < 6 ? (dt === 5 ? '#ffffff' : c) : null;                       // bloco
  if (tipo === 2) return du > 0.16 && du < 0.34 && dt < alt ? (dt > 7 ? '#c83040' : dt > 5 ? '#f4c8a4' : dt > 2 ? '#3a5ac8' : '#ffffff') : null;   // soldadinho
  if (tipo === 3) return Math.abs(du - 0.25) * 16 < 4 - Math.abs(dt - 3) && dt < 7 ? (dt % 2 ? c : '#ffffff') : null;   // pião
  if (tipo === 4) return du > 0.14 && du < 0.36 && dt < alt ? (dt > 7 ? '#e06a2a' : dt > 5 ? '#f8d8bc' : c) : null;   // boneca
  return du > 0.1 && du < 0.4 && dt < 7 ? (dt > 3 ? '#a8b4c4' : '#6a7484') : null;                                   // robozinho
}

Object.assign(MOVEIS, {
  // prateleira alta cheia de brinquedos (4 andares). op.pecas: true = peças soltas (cabeças, braços) na fábrica
  'prateleira-brinquedos': { di: 0.55, dj: 1.8, f(L, m, ctx) {
    const { i0, i1, j0, j1 } = m, pecas = ctx.op.pecas;
    L.caixa(i0, i1, j0, j1, 0, 54, {
      frente: (u, t, l) => {
        if (u < 0.08 || u > l - 0.08 || t < 2 || t > 51 || t % 13 < 2) return u < 0.08 ? MAD[0] : MAD[1];
        const k = Math.floor(u / 0.5) + Math.floor(t / 13) * 7, du = u % 0.5, dt = (t % 13) - 2;
        if (pecas) {   // cabeças de boneca enfileiradas (olhos pretos) e braços
          if (k % 2 === 0) { const d = (du - 0.25) ** 2 * 256 + (dt - 4) ** 2; return d < 12 ? (dt === 5 && (Math.abs(du - 0.18) < 0.04 || Math.abs(du - 0.32) < 0.04) ? '#14121c' : '#f8d8bc') : '#4a3a30'; }
          return du > 0.06 && du < 0.44 && dt > 1 && dt < 4 ? '#f4c8a4' : '#4a3a30';
        }
        return brinquedoNicho(k, du, dt, 10) || '#6a4a30';
      },
      lado: MAD[2], topo: MAD[0] });
  } },
  // balcão da loja com caixa registradora e um laço de presente
  'balcao-loja': { di: 0.9, dj: 2.4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 16, { frente: (u, t, l) => (t > 13 || t < 2 ? MAD[2] : Math.floor(u * 4) % 2 ? '#f8e060' : '#d84a8a'), lado: MAD[1], topo: MAD[0] });
    L.caixa(i0 + 0.15, i0 + 0.55, j1 - 0.8, j1 - 0.3, 16, 7, { frente: (u, t) => (t > 4 ? '#3a3a4a' : t === 2 && u > 0.1 && u < 0.4 ? ['#5ae070', 2] : '#5a5a6a'), lado: '#2a2a36', topo: '#6a6a7a' });   // caixa registradora
    L.caixa(i0 + 0.25, i0 + 0.6, j0 + 0.3, j0 + 0.65, 16, 6, { frente: (u) => (Math.abs(u - 0.17) < 0.04 ? '#f8e060' : '#3ab060'), lado: '#2a8a4a', topo: (a, b) => (Math.abs(b - 0.17) < 0.04 || Math.abs(a - 0.17) < 0.04 ? '#f8e060' : '#3ab060') });   // presente
  } },
  // pilha de caixas de presente
  'caixa-presentes': { di: 0.8, dj: 0.8, f(L, m) {
    const { i0, j0 } = m;
    const caixa = (a, b, h0, tam, h, c, fita) => L.caixa(a, a + tam, b, b + tam, h0, h, { frente: (u) => (Math.abs(u - tam / 2) < 0.04 ? fita : c), lado: (u) => (Math.abs(u - tam / 2) < 0.04 ? fita : c), topo: (x, y) => (Math.abs(x - tam / 2) < 0.04 || Math.abs(y - tam / 2) < 0.04 ? fita : c) });
    caixa(i0, j0, 0, 0.8, 10, '#3a8ad8', '#f8e060'); caixa(i0 + 0.15, j0 + 0.15, 10, 0.5, 8, '#e83a3a', '#ffffff'); caixa(i0 + 0.25, j0 + 0.25, 18, 0.3, 6, '#f8d040', '#d84a8a');
  } },
  // esteira da fábrica: roletes na frente, faixa escura em cima com brinquedos pela metade (cabeças e corpos)
  esteira: { di: 0.9, dj: 4.2, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const b of [j0 + 0.1, j1 - 0.25]) for (const a of [i0 + 0.05, i1 - 0.2]) L.caixa(a, a + 0.15, b, b + 0.15, 0, 10, METAL[2]);
    L.caixa(i0, i1, j0, j1, 10, 4, { frente: (u, t) => (t === 3 ? '#2a2a36' : Math.floor(u * 6) % 2 ? METAL[1] : METAL[2]), lado: METAL[2],
      topo: (a, b, d) => {
        if (d < 0.06) return METAL[0];
        const k = Math.floor(b / 0.6), db = b % 0.6, da = a - 0.45;
        if (k % 2 === 0 && (db - 0.3) ** 2 + da ** 2 < 0.04) return db > 0.22 && db < 0.38 && Math.abs(da) < 0.04 ? '#14121c' : '#f8d8bc';   // cabeça de boneca
        if (k % 2 === 1 && Math.abs(db - 0.3) < 0.14 && Math.abs(da) < 0.2) return CORES[k % CORES.length];                                  // corpinho
        return Math.floor(b * 8) % 2 ? '#2a2a34' : '#3a3a44';
      } });
  } },
  // máquina grande de montar brinquedos: luzes piscando (acesas), funil em cima, braço com garra
  'maquina-brinquedos': { di: 1.2, dj: 2.0, f(L, m) {
    const { i0, i1, j0, j1 } = m, cj = (j0 + j1) / 2;
    L.caixa(i0, i1, j0, j1, 0, 40, { frente: (u, t, l) => {
      if (t < 3 || u < 0.08 || u > l - 0.08) return METAL[2];
      if (t > 28 && t < 34 && u > 0.3 && u < l - 0.3) return Math.floor(u * 5) % 3 === 0 ? ['#ff4a3a', 2] : Math.floor(u * 5) % 3 === 1 ? ['#f8e060', 2] : ['#5ae070', 2];   // luzes
      if (t > 8 && t < 24 && Math.abs(u - l / 2) < 0.5) return t > 20 ? '#1a1a24' : '#2a2a36';   // boca da máquina
      return t % 10 === 0 ? METAL[2] : '#d8a040';
    }, lado: '#a87820', topo: METAL[1] });
    L.caixa(i0 + 0.3, i1 - 0.3, cj - 0.4, cj + 0.4, 40, 10, { frente: METAL[1], lado: METAL[2], topo: '#2a2a34' });   // funil
    L.caixa(i1 - 0.15, i1, cj - 0.06, cj + 0.06, 18, 14, METAL[0]);                                                     // braço
  } },
  // caixote cheio de peças (cabeças de boneca olhando para cima)
  'caixa-pecas': { di: 0.8, dj: 0.9, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 12, { frente: (u, t) => (t === 6 || Math.floor(u * 8) % 4 === 0 ? MAD[2] : MAD[1]), lado: MAD[2],
      topo: (a, b, d) => {
        if (d < 0.08) return MAD[0];
        const ka = Math.floor(a / 0.26), kb = Math.floor(b / 0.26), da = a % 0.26 - 0.13, db = b % 0.26 - 0.13;
        if (da * da + db * db < 0.012) return Math.abs(da) < 0.03 && Math.abs(db) > 0.03 && Math.abs(db) < 0.07 ? '#14121c' : ((ka + kb) % 3 ? '#f8d8bc' : '#f4c8a4');
        return '#3a2a20';
      } });
  } },
});

// ------------------------------------------------------------------ móveis extras (loja e fábrica)
Object.assign(MOVEIS, {
  // vitrine de vidro com bonecas de porcelana em 3 andares (olhos pretos)
  'vitrine-vidro': { di: 0.6, dj: 1.1, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 6, { frente: MAD[2], lado: MAD[2], topo: MAD[1] });
    L.caixa(i0, i1, j0, j1, 6, 40, { frente: (u, t, l) => {
      if (u < 0.06 || u > l - 0.06 || t > 37 || t % 13 === 0) return MAD[1];
      const k = Math.floor(u / 0.36), du = u % 0.36, dt = t % 13;
      if (du > 0.1 && du < 0.26 && dt > 1 && dt < 11) return dt > 8 ? (Math.abs(du - 0.18) < 0.05 && dt === 9 ? '#14121c' : '#fff0f0') : dt > 7 ? '#e06a8a' : CORES[(k + Math.floor(t / 13)) % CORES.length];
      return (u * 16 + t) % 9 < 1 ? '#f4fbff' : '#b8d8ec';
    }, lado: '#9ac0d8', topo: MAD[0] });
  } },
  // cavalinho de balanço (madeira pintada, crina vermelha)
  'cavalinho-balanco': { di: 0.4, dj: 1.4, f(L, m) {
    const { i0, i1, j0, j1 } = m, cj = (j0 + j1) / 2;
    L.caixa(i0, i1, j0, j1, 0, 2, { frente: (u, t, l) => (Math.abs(u - l / 2) < l * 0.42 ? MAD[2] : null) || MAD[2], lado: MAD[2], topo: MAD[1] });   // arco
    L.caixa(i0 + 0.1, i1 - 0.1, cj - 0.15, cj + 0.15, 2, 8, '#f4f0e8');                                          // pernas
    L.caixa(i0 + 0.08, i1 - 0.08, j0 + 0.2, j1 - 0.2, 10, 6, { frente: (u, t) => (t === 5 && u > 0.3 ? '#c83a3a' : '#f4f0e8'), lado: '#d8d0c0', topo: '#ffffff' });   // corpo
    L.caixa(i0 + 0.1, i1 - 0.1, j1 - 0.45, j1 - 0.15, 16, 8, { frente: (u, t) => (t > 5 ? '#c83a3a' : u < 0.12 && t === 4 ? '#14121c' : '#f4f0e8'), lado: '#d8d0c0', topo: '#c83a3a' });   // cabeça
  } },
  // trenzinho de brinquedo no chão (locomotiva + 2 vagões)
  'trem-brinquedo': { di: 0.4, dj: 1.8, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    [['#e83a3a', 7], ['#3a8ad8', 5], ['#f8d040', 5]].forEach(([c, h], k) => {
      const a = j1 - 0.6 * (k + 1);
      L.caixa(i0, i1, a, a + 0.5, 1, h, { frente: (u, t) => (t === 0 ? '#14121c' : c), lado: c, topo: k === 0 ? '#2a2a36' : c });
      L.caixa(i0 - 0.02, i1 + 0.02, a + 0.08, a + 0.18, 0, 2, '#14121c'); L.caixa(i0 - 0.02, i1 + 0.02, a + 0.32, a + 0.42, 0, 2, '#14121c');
    });
    L.caixa(i0 + 0.12, i1 - 0.12, j1 - 0.3, j1 - 0.18, 8, 5, '#2a2a36');                                          // chaminé da locomotiva
  } },
  // forno da fábrica: boca com fogo aceso (brilha), tijolo e porta de ferro aberta
  forno: { di: 0.9, dj: 1.5, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 30, { frente: (u, t, l) => {
      const dx = u - l / 2;
      if (Math.abs(dx) < 0.45 && t > 4 && t < 16 + Math.sqrt(Math.max(0, 0.2 - dx * dx)) * 10) return t < 7 ? ['#fff0a0', 2] : (Math.floor(u * 16) + t) % 3 ? ['#ff8a2a', 2] : ['#ff4a1a', 2];   // fogo
      if (t >= 26) return '#5a5e6a';
      return t % 4 === 0 || (Math.floor(u * 16) + (Math.floor(t / 4) % 2) * 4) % 8 === 0 ? '#d8c4b4' : '#946052';
    }, lado: '#7a4e44', topo: '#3a3a44' });
    L.caixa(i0 + 0.3, i0 + 0.6, (j0 + j1) / 2 - 0.15, (j0 + j1) / 2 + 0.15, 30, 22, { frente: '#5a5e6a', lado: '#3a3a44', topo: '#14101a' });   // cano de exaustão
  } },
  // bancada de trabalho: ferramentas, retalho e lâmpada (o boneco em conserto é o sprite "boneco-conserto", posto em cima: y 1.0)
  bancada: { di: 0.8, dj: 1.9, f(L, m) {
    const { i0, i1, j0, j1 } = m, cj = (j0 + j1) / 2;
    for (const [a, b] of [[i0 + 0.05, j0 + 0.05], [i1 - 0.12, j0 + 0.05], [i0 + 0.05, j1 - 0.12], [i1 - 0.12, j1 - 0.12]]) L.caixa(a, a + 0.07, b, b + 0.07, 0, 13, MAD[2]);
    L.caixa(i0, i1, j0, j1, 13, 3, { frente: MAD[1], lado: MAD[2], topo: (a, b) => (Math.floor(b * 8) % 5 === 0 ? MAD[2] : MAD[0]) });
    L.caixa(i0 + 0.3, i0 + 0.45, cj + 0.3, cj + 0.7, 16, 2, { frente: '#e8e0d0', lado: '#c8c0b0', topo: '#ffffff' });                 // retalho de pano
    L.caixa(i0 + 0.5, i0 + 0.6, j0 + 0.2, j0 + 0.7, 16, 1, FERRO[1]);                                                         // chave inglesa
    L.caixa(i0 + 0.1, i0 + 0.16, j0 + 0.15, j0 + 0.21, 16, 18, FERRO[2]); L.caixa(i0 + 0.08, i0 + 0.3, j0 + 0.1, j0 + 0.3, 34, 3, ['#fff0a0', 2]);   // lâmpada
  } },
});
const FERRO = ['#8a8e9c', '#5a5e6a', '#2e2e38'];

// ------------------------------------------------------------------ decorações de parede (DECOR)
Object.assign(DECOR, {
  // varal de bandeirinhas coloridas (loja)
  bandeirinhas(d, u, U, t) {
    const y0 = d.altura ?? 80, tt = y0 - t, k = Math.floor(u / 8), du = u % 8;
    const curva = Math.round(Math.sin((u / U) * Math.PI) * 4);
    if (tt === curva) return '#6a4a3a';
    if (tt > curva && tt < curva + 7 - Math.abs(du - 3.5) * 1.6) return CORES[k % CORES.length];
    return null;
  },
  // prateleira de parede com brinquedos pequenos em cima (loja)
  'prateleira-parede'(d, u, U, t) {
    const y0 = d.altura ?? 56, tt = t - y0;
    if (tt < -2 || tt > 11) return null;
    if (tt < 0) return tt === -2 ? MAD[2] : MAD[1];
    return brinquedoNicho(Math.floor(u / 8) + 3, (u % 8) / 16, tt, 10);
  },
  // cartaz do soldadinho sorrindo ("o melhor amigo da criança")
  'cartaz-brinquedo'(d, u, U, t) {
    const y0 = d.altura ?? 58, h = d.h ?? 24, tt = t - y0;
    if (tt < 0 || tt >= h || u < 0 || u >= U) return null;
    if (u < 2 || u > U - 3 || tt < 2 || tt > h - 3) return '#c8a050';
    const cx = U / 2, dx = u - cx;
    if (Math.abs(dx) < 4 && tt > h - 9 && tt < h - 3) return '#c83040';                                // barretina
    if ((dx * dx) / 16 + ((tt - (h - 12)) ** 2) / 9 < 1) return Math.abs(dx) === 2 && tt === h - 12 ? '#14121c' : (tt === h - 14 && Math.abs(dx) < 2 ? '#c83a4a' : '#f4c8a4');   // rosto
    if (Math.abs(dx) < 4 && tt > 3 && tt <= h - 15) return '#3a5ac8';                                   // casaco
    return (u + tt) % 6 === 0 ? '#ffe8f0' : '#f8c8d8';
  },
  // janela industrial em arco, vidro em grade (fábrica)
  'janela-fabrica'(d, u, U, t, noite) {
    const y0 = d.peitoril ?? 40, h = d.h ?? 30, tt = t - y0, r = U / 2, dx = u - r;
    const alto = h - r * 0.8 + Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.8;
    if (tt < -2 || tt > alto + 1) return null;
    if (tt < 0 || tt >= alto || u < 1 || u > U - 2) return '#d0b4c0';
    if ((u - 1) % 5 === 0 || tt % 6 === 5) return '#2e2e38';
    if (d.quebrada && dx > 0 && tt > 6 && tt < 18 && (u + tt) % 3) return '#1a1420';
    return noite ? '#2a3266' : tt > h * 0.6 ? '#a8c0d8' : ((u + tt) % 7 === 0 ? '#d8e8f4' : '#6a84a8');
  },
  // canos grossos na parede, com braçadeiras, uma curva e válvula vermelha; ferrugem escorrendo
  canos(d, u, U, t) {
    const y0 = d.altura ?? 70, tt = t - y0;
    if (tt >= 0 && tt < 5) return tt === 0 ? FERRO[0] : tt === 4 ? FERRO[2] : (u % 20 === 0 ? FERRO[2] : FERRO[1]);
    if (u >= U - 6 && u < U - 1 && tt < 0 && t > 6) return u === U - 6 ? FERRO[0] : u === U - 2 ? FERRO[2] : FERRO[1];   // desce até o chão
    const vx = U - 3.5, vy = y0 - 22, r = Math.hypot(u - vx, t - vy);
    if ((r < 4.5 && r > 3.2) || (r < 4.5 && (Math.abs(u - vx) < 0.6 || Math.abs(t - vy) < 0.6))) return '#c83a3a';     // válvula
    if (tt < 0 && tt > -9 && u % 20 === 7 && (t % 3)) return '#a8603a';                                                  // ferrugem
    return null;
  },
  // duas engrenagens grandes pintadas/presas na parede (fábrica)
  engrenagens(d, u, U, t) {
    const y0 = d.altura ?? 50;
    for (const [cx, cy, R] of [[U * 0.35, y0, 11], [U * 0.35 + 17, y0 - 9, 7]]) {
      const dx = u - cx, dy = t - cy, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx), dente = Math.cos(a * (R > 9 ? 10 : 7)) > 0.25;
      if (r < R * 0.25) return '#2e2e38';
      if (r < R * 0.8) return r < R * 0.38 ? '#8a7034' : dx + dy > 0 ? '#c8a860' : '#f0d890';
      if (r < R && dente) return '#c8a860';
    }
    return null;
  },
  // placa de aviso amarela e preta com "!" (fábrica)
  aviso(d, u, U, t) {
    const y0 = d.altura ?? 44, h = d.h ?? 14, tt = t - y0;
    if (tt < 0 || tt >= h) return null;
    if (tt < 2 || tt > h - 3) return (u + tt) % 6 < 3 ? '#14121c' : '#f8d040';
    if (Math.abs(u - U / 2) < 1 && (tt > 5 || tt === 3)) return '#14121c';
    return '#f8d040';
  },
});

// ------------------------------------------------------------------ cômodos
PRESETS_INTERIORES['loja-brinquedos'] = {
  ceu: { cores: ['#fff4e0'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#fff0f8', '#f8d8e8', '#d8a8c0'], padrao: 'listras', teto: ['#fffaf0', '#f0e4d0', '#c0ac90'],
    meiaParede: { altura: 26, padrao: 'lambri', cores: ['#a8d8f0', '#7ab8e0', '#4a88b8'] },
    rodape: ['#4a88b8', '#3a6a9a', '#2a4a7a'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#f8f0e0', '#e0d0b8', '#d84a8a'], terra: ['#c8b8a8', '#a89888'] },
  ambiente: ['#ffffff', 1.0],
};
PRESETS_INTERIORES['fabrica-brinquedos'] = {
  ceu: { cores: ['#d8d4d0'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#d8a08a', '#b87a68', '#946052'], padrao: 'tijolo', teto: ['#c8ccd4', '#9aa0ac', '#5a5e6a'],   // o mesmo tijolo de fora
    meiaParede: { altura: 18, padrao: 'liso', cores: ['#ead4da', '#d0b4c0', '#a88c9a'] },                 // faixa de pedra rosa (toque de castelo)
    rodape: ['#3a3a44', '#2e2e38', '#22222a'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#c8c8c4', '#a8a8a4', '#f8d040'], terra: ['#8a8a88', '#6a6a68'] },
  ambiente: ['#fffaf0', 0.96],
};

// LOJA: bandeirinhas e prateleiras de parede, 2 prateleiras grandes, vitrine de bonecas, balcão, presentes, cavalinho e trenzinho.
// Pessoas: z de 0 (frente) a ~1.6. Brinquedos em pé na frente das prateleiras (x -6.9, -3.4, 0; z ~2.6); atendente atrás do
// balcão (x ~4.4, z ~2.6).
COMODOS_DIAGONAL['loja-brinquedos'] = {
  estilo: 'loja-brinquedos', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'bandeirinhas', x: -2.4, w: 12, altura: 92 },
    { tipo: 'prateleira-parede', x: 4.4, w: 3.0, altura: 54 }, { tipo: 'cartaz-brinquedo', x: 1.4, w: 1.4, altura: 56, h: 26 },
    { tipo: 'janela', x: 7.2, w: 2.0, cortina: ['#f8e060', '#d8b030'], peitoril: 36 }, { tipo: 'relogio', x: -8.0, w: 0.9, altura: 70, h: 14 },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#a8d8f0', '#7ab8e0', '#4a88b8'] },
    { tipo: 'bandeirinhas', lateral: true, x: 2.0, w: 5, altura: 92 },
  ],
  moveis: [
    { tipo: 'vitrine-vidro', x: -8.0, i: 0 },
    { tipo: 'prateleira-brinquedos', x: -5.1, i: 0 }, { tipo: 'prateleira-brinquedos', x: -1.7, i: 0 },
    { tipo: 'caixa-presentes', x: 1.6, i: 0.2 }, { tipo: 'balcao-loja', x: 4.4, i: 1.4 }, { tipo: 'bau-brinquedos', x: 7.6, i: 0.2 },
    { tipo: 'cavalinho-balanco', x: 7.4, i: 2.0 }, { tipo: 'trem-brinquedo', x: -6.6, i: 3.1 },
  ],
  piso: [{ x: -1.0, i0: 1.2, i1: 2.6, dj: 3.2, cor: ['#f8e060', '#e8c040', '#ffffff'] }],
};
// FÁBRICA: o mesmo tijolo de fora com faixa de pedra rosa; janelas industriais em arco (uma quebrada), canos com válvula,
// engrenagens na parede, aviso; máquina com luzes, forno aceso, prateleira de cabeças, esteira, caixotes e bancada.
// Pessoas: z de 0 a ~1.6 (na frente da esteira) ou x > 3. Brinquedos saem da máquina em x ~-6.2, z ~1.0 e andam para a direita.
COMODOS_DIAGONAL['fabrica-brinquedos'] = {
  estilo: 'fabrica-brinquedos', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'janela-fabrica', x: -3.6, w: 1.8, peitoril: 52, h: 30 }, { tipo: 'janela-fabrica', x: 3.8, w: 1.8, peitoril: 52, h: 30, quebrada: true },
    { tipo: 'canos', x: 0, w: 18, altura: 92 }, { tipo: 'engrenagens', x: 6.8, w: 2.4, altura: 60 },
    { tipo: 'aviso', x: 2.2, w: 1.0, altura: 40, h: 14 }, { tipo: 'relogio', x: 0.3, w: 1, altura: 70, h: 14 },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#9aa0ac', '#7a808c', '#5a5e6a'] },
    { tipo: 'janela-fabrica', lateral: true, x: 0.6, w: 1.6, peitoril: 52, h: 28 },
  ],
  moveis: [
    { tipo: 'maquina-brinquedos', x: -6.4, i: 0 }, { tipo: 'prateleira-brinquedos', x: -2.6, i: 0, pecas: true },
    { tipo: 'forno', x: 0.9, i: 0 }, { tipo: 'caixa-pecas', x: 3.6, i: 0.3 }, { tipo: 'caixa-pecas', x: 5.2, i: 0.2 },
    { tipo: 'esteira', x: -0.2, i: 1.6 }, { tipo: 'bancada', x: 6.8, i: 1.4 },
  ],
  piso: [{ x: 5.6, i0: 2.4, i1: 3.0, dj: 3.0, cor: ['#f8d040', '#2a2a36', '#f8d040'] }],
};

// SALA DOS FUNDOS da loja (oficina de conserto, atrás do balcão): o papel de parede listrado da loja, mas gasto e manchado;
// bancada com um boneco aberto, prateleira de cabeças, caixotes de peças e caixas de papelão. A FÁBRICA continua existindo
// (fabrica-brinquedos / fabrica-brinquedos-diorama) para outras histórias. Cenário: loja-fundos-diorama.
// Pessoas: z 0–1.4; a porta para a loja fica na parede da direita (x ~2.6).
PRESETS_INTERIORES['loja-fundos'] = {
  ceu: { cores: ['#efe4dc'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#e8d0d8', '#d4b8c4', '#a88a98'], padrao: 'listras', teto: ['#e0d8cc', '#b8ac9c', '#7a6e60'],
    meiaParede: { altura: 26, padrao: 'lambri', cores: ['#8aa8b8', '#6a8898', '#4a6070'] },
    rodape: ['#4a6070', '#3a4a58', '#2a3440'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#d8ccb8', '#b8a890', '#6a5a48'], terra: ['#a89888', '#887868'] },
  ambiente: ['#fff8f0', 0.94],
};
DECOR['mancha'] = (d, u, U, t) => {   // mancha de umidade e papel de parede descascando
  const y0 = d.altura ?? 50, dx = u - U / 2, dy = t - y0;
  if (dx * dx / (U * U / 5) + dy * dy / 90 < 1) return (u + t) % 4 ? '#c4a8b0' : '#b89aa4';
  if (dy > 9 && dy < 13 && Math.abs(dx) < U / 3 && (u % 3)) return '#f4ece4';
  return null;
};
COMODOS_DIAGONAL['loja-fundos'] = {
  estilo: 'loja-fundos', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'mancha', x: -4.6, w: 2.4, altura: 60 }, { tipo: 'mancha', x: 3.4, w: 1.6, altura: 44 },
    { tipo: 'prateleira-parede', x: 0.6, w: 3.2, altura: 58 }, { tipo: 'relogio', x: -1.8, w: 0.9, altura: 72, h: 14 },
    { tipo: 'aviso', x: 6.6, w: 1.0, altura: 40, h: 14 },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#a8d8f0', '#7ab8e0', '#4a88b8'] },
  ],
  moveis: [
    { tipo: 'prateleira-brinquedos', x: -6.6, i: 0, pecas: true }, { tipo: 'caixa-pecas', x: -3.6, i: 0.2 },
    { tipo: 'bancada', x: -0.6, i: 0.6 }, { tipo: 'caixas-papelao', x: 4.4, i: 0.1 }, { tipo: 'caixa-pecas', x: 6.8, i: 0.3 },
  ],
  piso: [],
};

// ------------------------------------------------------------------ SALA DOS MANEQUINS (depósito da loja)
// Cimento cinza, janelinha alta, espelho velho, araras com cabides vazios e caixas de papelão. Os manequins são personagens
// (sprites "manequim" e "manequim-coberto"), para poderem mudar de lugar entre as cenas. Pessoas: z 0–1.4; manequins em
// fileira no fundo (z ~2.4–2.8, x -6.5 a 6.5) ou espalhados.
Object.assign(MOVEIS, {
  // arara de roupas vazia: barra de metal com cabides balançando
  arara: { di: 0.5, dj: 2.2, f(L, m) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2;
    for (const b of [j0 + 0.05, j1 - 0.12]) { L.caixa(ci - 0.04, ci + 0.04, b, b + 0.07, 0, 40, FERRO[1]); L.caixa(i0, i1, b - 0.05, b + 0.12, 0, 2, FERRO[2]); }
    L.caixa(ci - 0.04, ci + 0.04, j0, j1, 40, 2, FERRO[0]);
    for (let k = 0; k < 6; k++) { const b = j0 + 0.3 + k * 0.3; L.caixa(ci - 0.02, ci + 0.02, b, b + 0.22, 33, 1, '#c8ccd8'); L.caixa(ci - 0.02, ci + 0.02, b + 0.1, b + 0.12, 34, 6, '#c8ccd8'); }
  } },
  // pilha de caixas de papelão fechadas com fita
  'caixas-papelao': { di: 0.9, dj: 1.0, f(L, m) {
    const { i0, j0 } = m, PAP = ['#d8b880', '#b8945a', '#8a6a3a'];
    const cx = (a, b, h0, ti, tj, h) => L.caixa(a, a + ti, b, b + tj, h0, h, { frente: (u, t) => (Math.abs(u - tj / 2) < 0.05 ? '#c8b088' : t === h - 1 ? PAP[2] : PAP[1]), lado: PAP[2], topo: (x, y) => (Math.abs(y - tj / 2) < 0.05 ? '#e8d8b0' : PAP[0]) });
    cx(i0, j0, 0, 0.9, 1.0, 14); cx(i0 + 0.1, j0 + 0.1, 14, 0.7, 0.75, 11); cx(i0 + 0.2, j0 + 0.25, 25, 0.45, 0.5, 8);
  } },
});
DECOR['parede-rachada'] = (d, u, U, t) => {   // rachadura e mancha de umidade (cimento)
  const y0 = d.altura ?? 60;
  if (Math.abs(t - (y0 - u * 0.6 + Math.sin(u * 0.9) * 2)) < 0.6 && u < U) return '#6a6a72';
  if ((u - U * 0.7) ** 2 / 30 + (t - y0 + 30) ** 2 / 60 < 1) return (u + t) % 3 ? '#9a9aa2' : '#a4a4ac';
  return null;
};
PRESETS_INTERIORES['sala-manequins'] = {
  ceu: { cores: ['#d8d8dc'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#c8c8cc', '#b4b4ba', '#8e8e96'], padrao: 'liso', teto: ['#d0d0d4', '#a8a8ae', '#6a6a72'],
    meiaParede: { altura: 14, padrao: 'liso', cores: ['#a0a0a8', '#8a8a92', '#5a5a62'] },
    rodape: ['#5a5a62', '#4a4a52', '#3a3a42'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#b8b8b8', '#a0a0a2', '#6a6a70'], terra: ['#8a8a8c', '#6a6a6c'] },
  ambiente: ['#f4f6fa', 0.95],
};
COMODOS_DIAGONAL['sala-manequins'] = {
  estilo: 'sala-manequins', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'janela', x: -2.4, w: 1.6, peitoril: 64, h: 16 }, { tipo: 'espelho', x: 4.2, w: 1.4, altura: 20, h: 40 },
    { tipo: 'parede-rachada', x: -6.4, w: 3, altura: 70 }, { tipo: 'parede-rachada', x: 1.2, w: 2, altura: 52 },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#9aa0ac', '#7a808c', '#5a5e6a'] },
  ],
  moveis: [
    { tipo: 'arara', x: -7.6, i: 0.1 }, { tipo: 'caixas-papelao', x: 7.4, i: 0.1 }, { tipo: 'caixas-papelao', x: 1.4, i: 0.2 },
  ],
  piso: [],
};

// ------------------------------------------------------------------ manequim (cinza, sem roupa, sem rosto) e manequim coberto
// De frente, 26x50, em pé num suporte de metal (barra até o quadril, base redonda). Juntas marcadas (pescoço, ombros, cotovelos,
// punhos, cintura, joelhos). Estados: parado, virado (cabeça torta), braco (um braço levantado), torto (o corpo inteiro inclinado).
// "andar"/"mover" funcionam (desliza no suporte, balançando um pouco) — o terror é ele estar num lugar diferente a cada cena.
const CINZA = ['#d4d6dc', '#aeb2ba', '#80848e'], JUNTA = '#6a6e78';
function quadroManequim({ cabeca = 0, braco = false, torto = 0, bal = 0 } = {}) {
  const W = 26, H = 50, p = new Pix(W, H);
  const sh = (y) => Math.round((torto * (44 - y)) / 44) + bal;   // inclinação: desloca cada linha
  const corpo = new Pix(W, H);
  const t3 = (x, y, dx, dy) => Pix.tom(CINZA, 0.75 - dy * 0.4 - dx * 0.25, x, y);
  corpo.elipse(13 + cabeca, 6, 3.6, 4.6, t3);                                              // cabeça lisa (sem rosto)
  corpo.ret(12, 10, 3, 3, CINZA[1]); corpo.ret(12, 11, 3, 1, JUNTA);                      // pescoço
  for (let y = 13; y < 27; y++) { const m = y < 15 ? 5 + (y - 13) : y < 22 ? 6.6 - (y - 15) * 0.25 : 4.8 + (y - 22) * 0.5; corpo.ret(Math.round(13 - m), y, Math.round(m * 2), 1, t3(0, y, 0, (y - 20) / 10)); }
  corpo.ret(9, 22, 8, 1, JUNTA);                                                            // cintura
  for (const x of [10, 14]) { corpo.ret(x, 27, 3, 16, CINZA[1]); corpo.ret(x, 27, 1, 16, CINZA[0]); corpo.ret(x, 35, 3, 1, JUNTA); corpo.ret(x - 1, 43, 4, 1, CINZA[2]); }   // pernas e pés
  corpo.ret(5, 13, 2, 1, JUNTA); corpo.ret(19, 13, 2, 1, JUNTA);                          // ombros
  corpo.ret(5, 14, 2, 13, CINZA[1]); corpo.ret(5, 20, 2, 1, JUNTA); corpo.ret(5, 26, 2, 2, CINZA[2]);   // braço esquerdo
  if (braco) { corpo.ret(19, 1, 2, 13, CINZA[1]); corpo.ret(19, 7, 2, 1, JUNTA); corpo.ret(19, 0, 2, 2, CINZA[2]); }
  else { corpo.ret(19, 14, 2, 13, CINZA[1]); corpo.ret(19, 20, 2, 1, JUNTA); corpo.ret(19, 26, 2, 2, CINZA[2]); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {                                // aplica a inclinação
    const i = (y * W + x) * 4; if (!corpo.d[i + 3]) continue;
    p.set(x + sh(y), y, '#' + [0, 1, 2].map((k) => corpo.d[i + k].toString(16).padStart(2, '0')).join(''));
  }
  p.ret(12 + bal, 27, 2, 18, '#5a5e6a'); p.elipse(13 + bal, 46.5, 6, 1.8, '#4a4a54'); p.ret(8 + bal, 46, 10, 1, '#6a6e78');   // suporte
  return p.contorno('#1a1a22');
}
function quadroCoberto({ cabeca = 0, bal = 0 } = {}) {
  const W = 26, H = 50, p = new Pix(W, H), L = ['#ffffff', '#ecebf0', '#c8c6d0', '#9a98a8'];
  p.elipse(13 + cabeca + bal, 7, 4.4, 5, (x, y, dx, dy) => Pix.tom(L, 0.8 - dy * 0.4 - dx * 0.3, x, y));
  for (let y = 11; y < 45; y++) { const m = 5 + (y - 11) * 0.22; for (let x = Math.round(13 - m); x <= Math.round(12 + m); x++) p.set(x + bal, y, (x * 3 + Math.floor(y / 2)) % 11 === 0 ? L[3] : Pix.tom(L, 0.75 - (x - 13) / 18 - (y - 11) / 60, x, y)); }
  for (let x = 6; x < 21; x += 3) p.set(x + bal, 44, L[3]);                                 // barra do lençol
  p.ret(12 + bal, 45, 2, 1, '#5a5e6a'); p.elipse(13 + bal, 46.5, 6, 1.8, '#4a4a54');
  return p.contorno('#1a1a22');
}
const estadosSprite = (pares, extra = {}) => { const quadros = [], anims = {}; for (const [k, lista, fps] of pares) { anims[k] = { q: lista.map((q) => { quadros.push(q); return quadros.length - 1; }), fps: fps || 1 }; } return { quadros, anims, sombra: true, personagem: true, ...extra }; };

// fumaça da chaminé (8 quadros): bolotas que sobem, crescem e somem; levemente lilás (fantasia). A rua da fábrica põe uma em
// cima de cada chaminé sozinha (rua.fumacas); também serve como elemento comum: { "sprite": "fumaca-chamine" }.
function quadroFumaca(f) {
  const W = 28, H = 60, p = new Pix(W, H), N = 6, cores = ['#ffffff', '#ece6f0', '#cfc6d8', '#a89cb4'];
  for (let k = 0; k < N; k++) {
    const fase = ((k + f / 8) / N) % 1, y = H - 4 - fase * (H - 10), r = 3 + fase * 7;
    const x = W / 2 + Math.sin((k * 1.7 + fase * 3.2)) * (2 + fase * 4);
    if (fase > 0.85 && (k + f) % 2) continue;                                            // as de cima vão sumindo
    p.circulo(x, y, r, (xx, yy, dx, dy) => Pix.tom(cores, 0.25 + dy * 0.35 + dx * 0.15 + fase * 0.35, xx, yy));
  }
  return p;
}
// boneca de pano em conserto, sentada e tombada (para pôr em cima da bancada: { "sprite": "boneco-conserto", "y": 1.0 }):
// peito aberto com engrenagem e enchimento, um olho de botão e o outro costurado em X, braço solto do lado preso por uma linha.
function bonecoConserto() {
  const p = new Pix(28, 24), la = ['#f8904a', '#e06a2a', '#a8441a'], pano = ['#fff0e0', '#f8d8bc', '#c8a088'], az = ['#7aa8f0', '#5a8ad8', '#3a5a9a'];
  const t3 = (c) => (x, y, dx, dy) => Pix.tom(c, 0.75 - dy * 0.45 - dx * 0.2, x, y);
  // pernas esticadas para a frente (listradas) e sapatos
  for (const x of [11, 15]) { for (let y = 17; y < 21; y++) p.ret(x, y, 3, 1, y % 2 ? '#ffffff' : '#d83a4a'); p.ret(x - 1, 21, 4, 2, '#1a1a24'); }
  // corpo (vestido azul) com o peito aberto
  p.elipse(14, 13.5, 4.6, 4.6, t3(az)); p.ret(10, 15, 9, 3, az[1]);
  p.elipse(14.5, 13, 2.6, 2.8, '#1a1420');                                         // buraco
  for (const [x, y, c] of [[14, 12, '#c8a860'], [15, 12, '#f0d890'], [14, 13, '#8a7034'], [15, 13, '#c8a860'], [13, 12, '#8a7034'], [16, 13, '#8a7034'], [14, 11, '#c8a860'], [15, 14, '#c8a860']]) p.set(x, y, c);   // engrenagem
  for (const [x, y] of [[12, 11], [12, 14], [17, 11], [16, 15], [13, 15]]) p.set(x, y, '#f4f4f0');                                                    // enchimento saindo
  p.ret(18, 10, 2, 5, az[0]); p.set(20, 11, az[0]); p.set(20, 12, az[0]);         // aba do vestido aberta para o lado
  // braço que ficou (pendurado) e o ombro sem braço com a linha solta
  p.ret(8, 11, 2, 6, pano[1]); p.ret(8, 16, 2, 2, pano[2]);
  p.set(19, 10, '#1a1420'); p.set(20, 9, '#c83a4a'); p.set(21, 10, '#c83a4a');
  // braço solto deitado na bancada, ligado ao ombro por uma linha vermelha
  p.ret(20, 20, 6, 2, pano[1]); p.ret(25, 19, 2, 3, pano[2]); p.set(20, 20, '#c8a088');
  for (const [x, y] of [[21, 11], [22, 13], [22, 15], [21, 17], [21, 19]]) p.set(x, y, '#c83a4a');
  // cabeça tombada para a esquerda: cabelo de lã, um botão, um X costurado, boca costurada
  p.circulo(5.5, 9, 2.4, t3(la)); p.circulo(12.5, 3.5, 2.2, t3(la));             // marias-chiquinhas
  p.elipse(9, 6.5, 4.4, 4.4, t3(pano)); p.elipse(9, 3.5, 4.6, 2.2, t3(la));
  p.circulo(7.5, 6.5, 1.2, '#1a1a24'); p.set(7, 6, '#4a4a5a');                    // olho de botão
  for (const [x, y] of [[10, 5], [12, 7], [12, 5], [10, 7], [11, 6]]) p.set(x, y, '#3a2a2a');   // olho costurado em X
  p.ret(7, 9, 5, 1, '#c83a4a'); for (const x of [7, 9, 11]) { p.set(x, 8, '#c83a4a'); p.set(x, 10, '#c83a4a'); }
  p.set(6, 8, '#f0a0b0');
  return p.contorno('#14121c');
}

registrarSprites({
  'boneco-conserto': () => ({ quadros: [bonecoConserto()], anims: { parado: { q: [0], fps: 1 } }, sombra: false }),
  manequim: () => estadosSprite([
    ['parado', [quadroManequim()]], ['virado', [quadroManequim({ cabeca: 2, torto: 0 })]], ['braco', [quadroManequim({ braco: true })]],
    ['torto', [quadroManequim({ torto: 3 })]],
    ['andando', [quadroManequim({ bal: -1 }), quadroManequim(), quadroManequim({ bal: 1 }), quadroManequim()], 6],
    ['virado-andando', [quadroManequim({ cabeca: 2, bal: -1 }), quadroManequim({ cabeca: 2 }), quadroManequim({ cabeca: 2, bal: 1 }), quadroManequim({ cabeca: 2 })], 6],
  ]),
  'manequim-coberto': () => estadosSprite([
    ['parado', [quadroCoberto()]], ['virado', [quadroCoberto({ cabeca: 2 })]],
    ['andando', [quadroCoberto({ bal: -1 }), quadroCoberto(), quadroCoberto({ bal: 1 }), quadroCoberto()], 6],
  ]),
  'fumaca-chamine': () => { const quadros = [0, 1, 2, 3, 4, 5, 6, 7].map(quadroFumaca); return { quadros, anims: { parado: { q: [0, 1, 2, 3, 4, 5, 6, 7], fps: 6 } }, sombra: false }; },
}, { grupo: 'Loja e fábrica de brinquedos', status: 'protótipo' });
