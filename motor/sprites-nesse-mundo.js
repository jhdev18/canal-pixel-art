// Assets das histórias "Nesse Mundo" (aprovados).
// Estados: muitos sprites têm vários estados, trocados pela ação  { "tipo": "trocar", "alvo": "id", "estado": "chuva" }.
// Estados com "unica" tocam uma vez a partir do "trocar" e param no último quadro.
// Para prender num personagem: "sobre": { "id": "bia", "dx": 0, "dy": 2.8 } (dx acompanha o lado em que ele olha).
import { Pix } from './pixel.js';
import { registrarSprites } from './sprites.js';
import { desenharTexto, larguraTexto } from './fonte.js';
import { rng } from './compartilhado/util.js';

const K = '#1a1c2c';

// junta vários "estados" (listas de quadros) num sprite só
function montar(estados, extra = {}) {
  const quadros = [], anims = {};
  for (const [nome, { q, fps = 4, unica = false }] of Object.entries(estados)) {
    const ini = quadros.length;
    quadros.push(...q);
    anims[nome] = { q: q.map((_, i) => ini + i), fps, unica };
  }
  if (!anims.parado) anims.parado = anims[Object.keys(estados)[0]];
  return { quadros, anims, sombra: false, ...extra };
}
// escreve texto (fonte do canal) dentro de um Pix
function texto(p, txt, x, y, cor) {
  const cv = p.paraCanvas(), g = cv.getContext('2d');
  g.clearRect(0, 0, p.w, p.h);
  desenharTexto(g, txt, x, y, cor);
  const d = g.getImageData(0, 0, p.w, p.h).data;
  for (let k = 0; k < p.w * p.h; k++) if (d[k * 4 + 3] > 0) p.set(k % p.w, Math.floor(k / p.w), cor);
}
const sombreado = (cores) => (x, y, dx, dy) => {   // esfera iluminada de cima/esquerda, 3–4 tons
  const v = dx * 0.55 + dy * 0.75;
  return v < -0.45 ? cores[0] : v < 0.15 ? cores[1] : v < 0.6 ? cores[2] : (cores[3] || cores[2]);
};

// ===================================================================== TEMPO PESSOAL
// O "tempo" em cima da cabeça de cada um: sol (feliz) ou nuvem (triste).
// Estados: sol-pequeno, sol, sol-grande, sol-forte, nuvenzinha, garoa, chuva, aguaceiro, nada.
// A base do desenho fica logo acima da cabeça: use "sobre": { "id": "...", "dy": 2.8 } (criança ~2.65).
const TW = 34, TH = 40;
const SOL = ['#fffbe0', '#ffe060', '#f8b020', '#d07818'];
function sol(r, f, { forte = false } = {}) {
  const p = new Pix(TW, TH);
  const cx = TW / 2, cy = TH - 4 - r - 3;
  // raios: alternam entre retos e diagonais (giram)
  const n = 8;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + (f % 2 ? Math.PI / 8 : 0);
    const L = (k % 2 ? 2 : 3) + (forte ? 1 : 0);
    for (let s = 1; s <= L; s++) p.set(cx - 0.5 + Math.cos(a) * (r + s + 0.5), cy - 0.5 + Math.sin(a) * (r + s + 0.5), s === L ? SOL[2] : SOL[1]);
  }
  p.circulo(cx, cy, r, sombreado(forte && f % 2 ? ['#fff4c0', '#ffc040', '#f08020', '#c84a10'] : SOL));
  p.contorno('#a85a10');
  // rostinho feliz (no sol-forte: suando)
  if (r >= 4) {
    const ey = Math.round(cy - r * 0.15), ex = Math.max(1, Math.round(r * 0.4));
    p.set(cx - ex - 1, ey, '#7a3a10'); p.set(cx + ex, ey, '#7a3a10');
    if (r >= 6) { p.set(cx - ex - 1, ey - 1, '#7a3a10'); p.set(cx + ex, ey - 1, '#7a3a10'); }
    const my = ey + Math.max(2, Math.round(r * 0.35));
    p.set(cx - 2, my, '#7a3a10'); p.set(cx - 1, my + 1, '#7a3a10'); p.set(cx, my + 1, '#7a3a10'); p.set(cx + 1, my, '#7a3a10');
    if (r >= 6) { p.set(cx - 2, ey + 2, '#f88a6a'); p.set(cx + ex + 1, ey + 2, '#f88a6a'); }
    if (forte) { p.set(cx + r - 1, cy - r + 3 + (f % 2), '#8ad0ff'); p.set(cx + r - 1, cy - r + 4 + (f % 2), '#8ad0ff'); }
  }
  return p;
}
const NUVEM_CLARA = ['#ffffff', '#e4eaf4', '#b4bed2', '#8a94ac'];
const NUVEM_ESCURA = ['#a8b0c4', '#7c849c', '#5a6078', '#3e4258'];
function nuvem(larg, gotas, f, { escura = false, longas = false } = {}) {
  const p = new Pix(TW, TH), cores = escura ? NUVEM_ESCURA : NUVEM_CLARA;
  const cx = TW / 2, base = escura ? 13 : 11, meia = larg / 2;
  // gotas caindo (desenhadas antes do contorno da nuvem? não: depois, para não ganharem contorno)
  const corpo = new Pix(TW, TH);
  const bolas = [[cx - meia * 0.55, base - 3, meia * 0.5], [cx + meia * 0.1, base - 5, meia * 0.6], [cx + meia * 0.6, base - 2.5, meia * 0.42], [cx - meia * 0.05, base - 1.5, meia * 0.62]];
  for (const [bx, by, br] of bolas) corpo.circulo(bx, by, br, (x, y, dx, dy) => (dy < -0.4 ? cores[0] : dy < 0.3 ? cores[1] : cores[2]));
  for (let x = Math.floor(cx - meia); x < cx + meia; x++) for (let y = base - 1; y <= base; y++) if (corpo.opaco(x, y - 1) || corpo.opaco(x, y)) corpo.set(x, y, cores[2]);
  corpo.contorno(cores[3]);
  // rostinho triste
  const ey = base - 4;
  corpo.set(cx - 3, ey, K); corpo.set(cx + 2, ey, K);
  corpo.set(cx - 4, ey - 1, K); corpo.set(cx + 3, ey - 1, K);       // sobrancelhas caídas
  corpo.set(cx - 1, ey + 2, K); corpo.set(cx, ey + 2, K); corpo.set(cx - 2, ey + 3, K); corpo.set(cx + 1, ey + 3, K);
  if (escura) { corpo.set(cx - 3, ey + 1, '#8ad0ff'); corpo.set(cx - 3, ey + 2, '#8ad0ff'); }
  // gotas
  const r = rng(gotas * 7 + larg);
  const topo = base + 2, fundo = TH - 1, alt = fundo - topo;
  for (let k = 0; k < gotas; k++) {
    const gx = Math.round(cx - meia + 2 + r() * (larg - 4));
    const fase = r();
    const comp = longas ? 4 : 2;
    const y0 = topo + ((fase * alt + f * (alt / 3)) % alt);
    for (let s = 0; s < comp; s++) { const yy = Math.round(y0 + s); if (yy <= fundo) p.set(gx, yy, s === comp - 1 ? '#d8f0ff' : '#7ab8f0'); }
  }
  // nuvem por cima das gotas
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) if (corpo.opaco(x, y)) { const i = (y * TW + x) * 4; p.d.set(corpo.d.subarray(i, i + 4), i); }
  return p;
}
function tempoPessoal() {
  const tres = (fn) => [0, 1, 2].map(fn);
  return montar({
    sol: { q: [sol(5, 0), sol(5, 1)], fps: 3 },
    'sol-pequeno': { q: [sol(3, 0), sol(3, 1)], fps: 3 },
    'sol-grande': { q: [sol(8, 0), sol(8, 1)], fps: 3 },
    'sol-forte': { q: [sol(10, 0, { forte: true }), sol(10, 1, { forte: true })], fps: 6 },
    nuvenzinha: { q: [nuvem(14, 0, 0)], fps: 1 },
    garoa: { q: tres((f) => nuvem(14, 4, f)), fps: 8 },
    chuva: { q: tres((f) => nuvem(22, 9, f)), fps: 10 },
    aguaceiro: { q: tres((f) => nuvem(30, 20, f, { escura: true, longas: true })), fps: 12 },
    nada: { q: [new Pix(TW, TH)], fps: 1 },
  }, { semLuz: true });
}

// ===================================================================== GUARDA-CHUVA
// Estados: aberto, fechando (toca uma vez), fechado. Na mão: "sobre": { "id": "ronaldo", "dx": 0.45, "dy": 0.9 }
function guardaChuva(abertura) {   // 1 = aberto ... 0 = fechado
  const W = 30, H = 40, p = new Pix(W, H), cx = 15;
  const tec = ['#5a6aa0', '#3a4678', '#262e54'];
  const meia = Math.max(2, Math.round(13 * abertura)), topo = 2, altura = Math.round(6 + 4 * (1 - abertura));
  // copa
  for (let x = -meia; x <= meia; x++) {
    const u = x / (meia + 0.5);
    const yTopo = Math.round(topo + (abertura > 0.3 ? (1 - Math.sqrt(Math.max(0, 1 - u * u))) * altura : Math.abs(u) * 2));
    const recorte = abertura > 0.6 ? (((x + meia) % 7) < 3 ? 0 : 1) : 0;
    const yBase = topo + altura + 2 + (abertura > 0.3 ? 0 : 8) - recorte;
    for (let y = yTopo; y <= yBase; y++) p.set(cx + x, y, y === yTopo ? tec[0] : (Math.floor((x + meia) / 7) % 2 ? tec[1] : tec[2]));
  }
  p.set(cx, topo - 1, '#c8c8d8'); p.set(cx, topo - 2, '#c8c8d8');
  // haste e cabo (J)
  for (let y = topo + altura + 2; y < H - 2; y++) p.set(cx, y, '#4a4a5a');
  p.set(cx, H - 2, '#6a3a24'); p.set(cx, H - 1, '#6a3a24'); p.set(cx - 1, H - 1, '#6a3a24'); p.set(cx - 2, H - 2, '#6a3a24');
  p.contorno(K);
  return p;
}
const sprGuardaChuva = () => montar({
  aberto: { q: [guardaChuva(1)] },
  fechando: { q: [guardaChuva(1), guardaChuva(0.7), guardaChuva(0.4), guardaChuva(0.15), guardaChuva(0)], fps: 10, unica: true },
  fechado: { q: [guardaChuva(0)] },
});

// ===================================================================== ESTRELAS QUE VIRAM OLHOS
// Estados: parado (estrela piscando), olho (abre uma vez: estrela -> fenda -> olho olhando para baixo), olho-aberto (pisca de vez em quando)
function estrela(t, fase) {   // t = meia largura
  const N = 2 * t + 3, p = new Pix(N, N), c = t + 1;
  const cores = ['#ffffff', '#fff2a0', '#f8c840'];
  const L = t + (fase ? 0 : 1);
  for (let s = -L; s <= L; s++) { const cor = Math.abs(s) < t * 0.4 ? cores[0] : Math.abs(s) < t * 0.75 ? cores[1] : cores[2]; p.set(c + s, c, cor); p.set(c, c + s, cor); }
  const m = Math.max(0, Math.floor(t * 0.35));
  for (let j = -m; j <= m; j++) for (let i = -m; i <= m; i++) if (Math.abs(i) + Math.abs(j) <= m) p.set(c + i, c + j, cores[0]);
  if (t >= 4) { const d = Math.floor(t * 0.45); for (let s = 1; s <= d; s++) for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) p.set(c + a * s, c + b * s, s === d ? cores[2] : cores[1]); }
  return p;
}
function olho(t, abertura, pupila = 1) {   // abertura 0..1; pupila 1 = olhando para baixo
  const N = 2 * t + 3, p = new Pix(N, N), c = t + 1;
  const rx = t + 0.6, ry = Math.max(0.6, (t * 0.62) * abertura);
  if (abertura <= 0.05) { for (let x = -t; x <= t; x++) p.set(c + x, c, '#fff2a0'); p.contorno('#3a1a2a'); return p; }
  p.elipse(c + 0.5, c + 0.5, rx, ry, (x, y, dx, dy) => (dy < -0.5 ? '#ffffff' : '#f4ecd8'));
  // íris (vermelha) e pupila, encostadas embaixo
  const ri = Math.max(1, Math.round(t * 0.38)), iy = c + Math.round(ry * 0.45 * pupila);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!p.opaco(x, y)) continue;
    const dx = x - c, dy = y - iy;
    if (dx * dx + dy * dy <= ri * ri) p.set(x, y, dx * dx + dy * dy <= (ri * 0.45) ** 2 + 0.3 ? '#1a0a14' : (dy < 0 ? '#e84a3a' : '#b02a2a'));
  }
  if (t >= 3) p.set(c - 1, iy - Math.max(1, ri - 1), '#ffffff');
  p.contorno('#3a1a2a');
  return p;
}
function sprEstrela(t) {
  return montar({
    parado: { q: [estrela(t, 0), estrela(t, 0), estrela(t, 1), estrela(t, 0), estrela(t, 0), estrela(t, 0)], fps: 5 },
    olho: { q: [estrela(t, 0), estrela(t, 1), olho(t, 0), olho(t, 0.35), olho(t, 0.7, 0), olho(t, 1, 0), olho(t, 1, 1)], fps: 6, unica: true },
    'olho-aberto': { q: [olho(t, 1), olho(t, 1), olho(t, 1), olho(t, 1), olho(t, 1), olho(t, 1), olho(t, 1), olho(t, 0.35), olho(t, 0), olho(t, 0.35)], fps: 6 },
  }, { semLuz: true });
}

// ===================================================================== FESTA NA PRAÇA
// Palanque: o personagem que sobe fica em "y": 1.125. Microfone no lado direito.
function palanque() {
  const W = 58, H = 40, p = new Pix(W, H), deck = 22;
  const mad = ['#d8a070', '#b07a48', '#7a5030'];
  for (let x = 4; x < W - 2; x++) { p.set(x, deck, mad[0]); p.set(x, deck + 1, mad[1]); p.set(x, deck + 2, mad[2]); }
  // saia com listras verde/amarelo (cores de Vila Serena)
  for (let y = deck + 3; y < H; y++) for (let x = 6; x < W - 4; x++) p.set(x, y, Math.floor((x - 6) / 4) % 2 ? '#f0c840' : '#3a9a5a');
  for (let x = 6; x < W - 4; x++) p.set(x, deck + 3, '#2a2a3a');
  // escadinha à esquerda
  for (let k = 0; k < 3; k++) for (let x = 0; x < 6 - k; x++) p.set(x, H - 1 - k * 5, mad[1]);
  for (let y = deck + 3; y < H; y++) p.set(1, y, mad[2]);
  // pedestal do microfone
  const mx = 44;
  for (let y = 8; y < deck; y++) p.set(mx, y, '#4a4a5a');
  p.ret(mx - 2, deck - 1, 5, 1, '#4a4a5a');
  p.ret(mx - 1, 4, 3, 4, '#2a2a3a'); p.set(mx, 4, '#8a8a9a');
  p.contorno(K);
  return p;
}
function bandeirinhas(f) {
  const W = 112, H = 18, p = new Pix(W, H);
  const cores = ['#e83a4a', '#f8c840', '#3aa860', '#3a7ad8', '#f07ac0', '#f88a30'];
  const fio = (x) => Math.round(2 + 6 * Math.sin((x / (W - 1)) * Math.PI));
  for (let x = 0; x < W; x++) p.set(x, fio(x), '#5a4a3a');
  for (let k = 0, x0 = 3; x0 < W - 5; x0 += 7, k++) {
    const y0 = fio(x0 + 2) + 1, cor = cores[k % cores.length], ponta = (k + f) % 2;
    for (let j = 0; j < 6; j++) { const meia = Math.round(2.5 * (1 - j / 6)); for (let i = -meia; i <= meia; i++) p.set(x0 + 2 + i + (j > 3 ? ponta : 0), y0 + j, j === 0 ? '#ffffff' : cor); }
  }
  return p;
}
const sprBandeirinhas = () => montar({ parado: { q: [bandeirinhas(0), bandeirinhas(1)], fps: 2 } });

// Fonte da praça. Estados: cheia (jato de água animado), seca (rachada).
function fonte(cheia, f) {
  const W = 48, H = 36, p = new Pix(W, H);
  const pedra = ['#d0d0dc', '#a8a8ba', '#7a7a90'];
  // bacia
  for (let y = 22; y < H; y++) for (let x = 1; x < W - 1; x++) p.set(x, y, y < 24 ? pedra[0] : (x < 4 || x > W - 5) ? pedra[2] : pedra[1]);
  for (let x = 3; x < W - 3; x += 8) for (let y = 26; y < H - 1; y++) if (y % 4 === 0) p.set(x, y, pedra[2]);
  // coluna e tacinha
  for (let y = 10; y < 22; y++) for (let x = 21; x < 27; x++) p.set(x, y, x === 21 ? pedra[0] : x === 26 ? pedra[2] : pedra[1]);
  for (let x = 16; x < 32; x++) { p.set(x, 9, pedra[0]); p.set(x, 10, pedra[1]); p.set(x, 11, pedra[2]); }
  if (!cheia) {   // rachaduras
    for (const [x, y] of [[10, 27], [11, 28], [11, 29], [12, 30], [33, 26], [34, 27], [35, 27], [36, 28], [24, 31], [25, 32]]) p.set(x, y, '#5a5a6e');
  }
  p.contorno(K);
  if (cheia) {
    const ag = ['#e8f8ff', '#8ad0f8', '#4aa0e8'];
    for (let x = 2; x < W - 2; x++) p.set(x, 21, ag[1]);                  // água na borda da bacia
    for (let x = 17; x < 31; x++) p.set(x, 8, ag[1]);                     // água na tacinha
    for (let y = 1; y < 8; y++) { p.set(23, y, ag[y % 3 === f ? 0 : 1]); p.set(24, y, ag[(y + 1) % 3 === f ? 0 : 2]); }
    // arcos que caem na bacia
    for (let s = 0; s < 14; s++) {
      const u = s / 13, xL = Math.round(16 - u * 10), xR = Math.round(31 + u * 10), y = Math.round(9 + u * u * 12);
      const cor = (s + f) % 3 === 0 ? ag[0] : ag[1];
      p.set(xL, y, cor); p.set(xR, y, cor);
    }
    p.set(24, 0, ag[0]);
  }
  return p;
}
const sprFonte = () => montar({
  cheia: { q: [fonte(true, 0), fonte(true, 1), fonte(true, 2)], fps: 8 },
  seca: { q: [fonte(false, 0)] },
});

// Canteiro de flores. Estados: verde, murcho.
function canteiro(verde, f) {
  const W = 34, H = 16, p = new Pix(W, H), r = rng(9);
  for (let y = 11; y < H; y++) for (let x = 0; x < W; x++) p.set(x, y, y === 11 ? '#c87a50' : ((x + (y % 2) * 3) % 6 === 0 ? '#7a3a2a' : '#a8543a'));
  for (let x = 1; x < W - 1; x++) p.set(x, 10, verde ? '#4a3a2a' : '#8a6a4a');
  for (let k = 0; k < 8; k++) {
    const x = 2 + k * 4 + Math.floor(r() * 2), h = 4 + Math.floor(r() * 4);
    if (verde) {
      const bal = (k + f) % 2;
      for (let j = 1; j <= h; j++) p.set(x + (j > h - 2 ? bal : 0), 10 - j, '#3a9a4a');
      p.set(x - 1, 8, '#5ac85a'); p.set(x + 1, 7, '#5ac85a');
      const cor = ['#e83a5a', '#f8c840', '#f07ac0', '#ffffff'][k % 4], fx = x + bal, fy = 10 - h - 1;
      p.set(fx, fy, '#f8e070'); p.set(fx - 1, fy, cor); p.set(fx + 1, fy, cor); p.set(fx, fy - 1, cor); p.set(fx, fy + 1, cor);
    } else {
      for (let j = 1; j <= Math.ceil(h / 2); j++) p.set(x, 10 - j, '#8a7a3a');
      p.set(x + 1, 10 - Math.ceil(h / 2), '#7a5a2a'); p.set(x + 2, 9 - Math.ceil(h / 2) + 1, '#6a4a2a');
      p.set(x + 2, 9, '#9a5a3a');   // pétala caída
    }
  }
  p.contorno(K);
  return p;
}
const sprCanteiro = () => montar({ verde: { q: [canteiro(true, 0), canteiro(true, 1)], fps: 2 }, murcho: { q: [canteiro(false, 0)] } });

// Placa da lei do prefeito
function placaLei() {
  const l1 = 'LEI DO CÉU LIMPO', l2 = 'NUBLADO = MULTA';
  const W = Math.max(larguraTexto(l1), larguraTexto(l2)) + 10, H = 44, p = new Pix(W, H);
  for (let y = 26; y < H; y++) { p.set(Math.floor(W / 2) - 1, y, '#8a6a4a'); p.set(Math.floor(W / 2), y, '#6a4a30'); }
  p.ret(0, 0, W, 26, '#c83a3a'); p.ret(2, 2, W - 4, 22, '#f8f4e8');
  p.contorno(K);
  const t = new Pix(W, H);
  texto(t, l1, Math.round((W - larguraTexto(l1)) / 2), 2, '#2a2a3a');
  for (let k = 0; k < W * H; k++) if (t.d[k * 4 + 3]) p.d.set(t.d.subarray(k * 4, k * 4 + 4), k * 4);
  const t2 = new Pix(W, H);
  texto(t2, l2, Math.round((W - larguraTexto(l2)) / 2), 13, '#c83a3a');
  for (let k = 0; k < W * H; k++) if (t2.d[k * 4 + 3]) p.d.set(t2.d.subarray(k * 4, k * 4 + 4), k * 4);
  return montar({ parado: { q: [p] } });
}

// Bloco de multas (na mão): "sobre": { "id": "ronaldo", "dx": -0.45, "dy": 0.85 }
function blocoMultas() {
  const p = new Pix(7, 9);
  p.ret(0, 2, 7, 7, '#f8f4e8'); p.ret(0, 0, 7, 2, '#c83a3a');
  for (let x = 1; x < 7; x += 2) p.set(x, 1, '#c8c8d8');
  for (const y of [4, 6]) for (let x = 1; x < 6; x++) p.set(x, y, '#9a9ab0');
  p.contorno(K);
  return montar({ parado: { q: [p] } });
}

// Fogo no chapéu do padeiro: "sobre": { "id": "tonho", "dy": 2.6 }
function fogo(f) {
  const W = 16, H = 16, p = new Pix(W, H), r = rng(31 + f * 5);
  const cores = ['#fff8c0', '#ffd040', '#ff8a20', '#d83a1a'];
  for (let x = 2; x < W - 2; x++) {
    const h = Math.round(5 + 7 * Math.sin(((x - 1) / (W - 3)) * Math.PI) * (0.6 + r() * 0.5));
    for (let j = 0; j < h; j++) {
      const v = j / h + (Math.abs(x - W / 2) / W) * 0.6;
      p.set(x, H - 1 - j, v < 0.3 ? cores[0] : v < 0.55 ? cores[1] : v < 0.8 ? cores[2] : cores[3]);
    }
  }
  p.set(4 + f * 3, 2, cores[2]); p.set(10 - f, 1, cores[1]);
  return p;
}
const sprFogo = () => montar({ parado: { q: [fogo(0), fogo(1), fogo(2)], fps: 10 } }, { semLuz: true, luz: { cor: '#ff9a40', intensidade: 1.6, alcance: 4, dy: 0.4, cintila: true } });

// Peruca do prefeito (voa com "mover")
function peruca() {
  const p = new Pix(14, 6);
  p.elipse(7, 4, 7, 4, (x, y, dx, dy) => (dy < -0.3 ? '#e4e4ec' : dy < 0.4 ? '#c0c0cc' : '#9a9aa8'));
  for (let x = 0; x < 14; x++) for (let y = 4; y < 6; y++) p.set(x, y, null);
  for (const x of [2, 5, 8, 11]) p.set(x, 1, '#f4f4f8');
  for (let y = 0; y < 6; y++) for (let x = 0; x < 14; x++) if (y >= 4) { const i = (y * 14 + x) * 4; p.d[i + 3] = 0; }
  p.contorno(K);
  return montar({ parado: { q: [p] } });
}

// Sorvete. Estados: parado (inteiro), derretendo (toca uma vez), derretido (poça)
function sorvete(etapa) {   // 0..3
  const W = 14, H = 16, p = new Pix(W, H), cx = 7;
  const bola = ['#ffd0e0', '#f890b0', '#d86088'];
  if (etapa < 3) {
    for (let j = 0; j < 8; j++) { const m = Math.round(3 * (1 - j / 8)); for (let i = -m; i <= m; i++) p.set(cx + i, 7 + j, (i + j) % 3 === 0 ? '#b07830' : '#e0a850'); }
    const ry = 3 - etapa, yb = 6 + etapa;
    p.elipse(cx + 0.5, yb, 4 + etapa * 0.6, ry + 0.5, (x, y, dx, dy) => (dy < -0.3 ? bola[0] : dy < 0.5 ? bola[1] : bola[2]));
    for (let k = 0; k < etapa * 2; k++) p.set(cx - 3 + k * 2, yb + 2 + (k % 2) * etapa, bola[1]);
  } else {
    for (let j = 0; j < 8; j++) { const m = Math.round(3 * (1 - j / 8)); for (let i = -m; i <= m; i++) p.set(cx + i, 2 + j, (i + j) % 3 === 0 ? '#b07830' : '#e0a850'); }
    for (let x = 0; x < W; x++) { p.set(x, H - 2, bola[1]); if (x > 1 && x < W - 2) p.set(x, H - 3, bola[0]); }
  }
  p.contorno(K);
  return p;
}
const sprSorvete = () => montar({
  parado: { q: [sorvete(0)] },
  derretendo: { q: [sorvete(0), sorvete(1), sorvete(2), sorvete(3)], fps: 3, unica: true },
  derretido: { q: [sorvete(3)] },
});

// Água da enchente: faixa que emenda dos lados (coloque várias lado a lado, 8 unidades cada)
function agua(f) {
  const W = 128, H = 16, p = new Pix(W, H);
  for (let x = 0; x < W; x++) {
    const crista = Math.round(3 + 1.5 * Math.sin(((x + f * 5) / 16) * Math.PI * 2));
    for (let y = crista; y < H; y++) p.set(x, y, y === crista ? '#c8ecff' : y < crista + 3 ? '#6ab0e8' : y < 11 ? '#4a8ad0' : '#2e64a8');
    if ((x * 7 + f * 3) % 23 === 0) p.set(x, crista + 5, '#8ac8f0');
  }
  return p;
}
const sprAgua = () => montar({ parado: { q: [agua(0), agua(1), agua(2)], fps: 4 } });

// Cerca do mirante (morro)
function cerca() {
  const W = 64, H = 16, p = new Pix(W, H), m = ['#c89060', '#9a6a3a', '#6a4422'];
  for (const y of [4, 9]) for (let x = 0; x < W; x++) { p.set(x, y, m[0]); p.set(x, y + 1, m[1]); }
  for (let x = 2; x < W; x += 16) for (let y = 1; y < H; y++) { p.set(x, y, m[1]); p.set(x + 1, y, m[2]); }
  p.contorno(K);
  return montar({ parado: { q: [p] } });
}

// ===================================================================== MONSTROS DE RUA (curto 2)
// Bueiro monstro (colorido, para a rua). Estados: parado (olhos na fresta), agarrar (mão sobe, uma vez),
// enjoado (rosto verde para fora), fechado.
function bueiro(estado, f) {
  const W = 30, H = 34, p = new Pix(W, H), br = new Pix(W, H), cx = 15;
  const metal = ['#8a8e9e', '#62667a', '#42465a'];
  const tampaY = estado === 'fechado' ? H - 3 : estado === 'enjoado' ? H - 12 : estado.startsWith('agarrar') ? H - 9 - Math.min(3, f) : H - 6;
  // buraco (elipse escura no chão)
  p.elipse(cx + 0.5, H - 2, 12, 2.2, '#0a0a12');
  // rosto enjoado saindo do buraco
  if (estado === 'enjoado') {
    p.elipse(cx + 0.5, H - 5, 8, 5, (x, y, dx, dy) => (dy < -0.3 ? '#a8d880' : dy < 0.4 ? '#7ab860' : '#5a9848'));
    p.set(cx - 3, H - 7, K); p.set(cx + 3, H - 7, K); p.set(cx - 4, H - 8 + f, K); p.set(cx + 4, H - 8 + f, K);
    for (let i = -3; i <= 3; i++) p.set(cx + i, H - 4 + ((i + f) % 2 ? 0 : 1), '#2a4a2a');
    p.set(cx + 6, H - 9 - f, '#8ad0ff'); p.set(cx + 6, H - 8 - f, '#8ad0ff');
  }
  // mão subindo
  if (estado === 'agarrar') {
    const topo = H - 6 - [4, 10, 16, 21][Math.min(3, f)];
    const pele = ['#9ac0a8', '#6a9a80', '#4a7a60'];
    for (let y = topo + 4; y < H - 2; y++) for (let x = cx - 2; x < cx + 2; x++) p.set(x, y, x === cx - 2 ? pele[0] : x === cx + 1 ? pele[2] : pele[1]);
    for (let y = topo; y < topo + 5; y++) for (let x = cx - 3; x < cx + 4; x++) p.set(x, y, pele[1]);
    for (const dx of [-3, 0, 3]) { p.set(cx + dx, topo - 1, pele[1]); p.set(cx + dx, topo - 2, '#f4f4e8'); }
  }
  // tampa
  const incl = estado === 'fechado' ? 0 : 2;
  for (let x = -11; x <= 11; x++) {
    const y = Math.round(tampaY + (x / 11) * incl);
    for (let j = 0; j < 3; j++) p.set(cx + x, y + j, j === 0 ? metal[0] : j === 1 ? metal[1] : metal[2]);
    if (x % 4 === 0 && Math.abs(x) < 10) p.set(cx + x, y + 1, metal[2]);
  }
  p.contorno(K);
  // olhos brilhando na fresta (camada de brilho)
  if (estado === 'parado' || estado === 'agarrar') {
    const ey = Math.round(tampaY + 4);
    if (!(estado === 'parado' && f === 1)) for (const dx of [-6, -5, 4, 5]) for (const yy of [ey - 1, ey]) { br.set(cx + dx, yy, '#ffe040'); p.set(cx + dx, yy, '#ffe040'); }
  }
  return { p, br };
}
function sprBueiro() {
  const est = {
    parado: [bueiro('parado', 0), bueiro('parado', 0), bueiro('parado', 0), bueiro('parado', 1)],
    agarrar: [0, 1, 2, 3].map((f) => bueiro('agarrar', f)),
    enjoado: [bueiro('enjoado', 0), bueiro('enjoado', 1)],
    fechado: [bueiro('fechado', 0)],
  };
  const quadros = [], brilho = [], anims = {};
  const fps = { parado: 4, agarrar: 8, enjoado: 3, fechado: 1 };
  for (const [n, lst] of Object.entries(est)) {
    const ini = quadros.length;
    lst.forEach(({ p, br }) => { quadros.push(p); brilho.push(br); });
    anims[n] = { q: lst.map((_, i) => ini + i), fps: fps[n], unica: n === 'agarrar' };
  }
  return { quadros, brilho, anims, sombra: false };
}

// Cone monstro (personagem). Estados: parado (bravo), andando, correndo, dormindo.
function cone(perna, olhos = 'bravo') {
  const W = 18, H = 28, p = new Pix(W, H), cx = 9;
  const lar = ['#ffb060', '#f87a20', '#c85410'];
  for (let y = 2; y < 22; y++) {
    const m = 1 + Math.round((y - 2) * 0.33);
    for (let i = -m; i <= m - 1; i++) {
      const listra = (y >= 8 && y <= 10) || (y >= 15 && y <= 16);
      p.set(cx + i, y, listra ? (i < -m + 2 ? '#ffffff' : '#dcdce8') : i < -m + 2 ? lar[0] : i > m - 3 ? lar[2] : lar[1]);
    }
  }
  for (let x = 1; x < W - 1; x++) { p.set(x, 22, '#4a4a5a'); p.set(x, 23, '#2a2a36'); }
  // perninhas
  const pe = [[5, 12], [4, 12], [5, 13]][perna] || [5, 12];
  for (const [i, px] of pe.entries()) { const off = perna === 1 ? (i ? -1 : 1) : perna === 2 ? (i ? 1 : -1) : 0; for (let y = 24; y < 27; y++) p.set(px + (y === 26 ? off : 0), y, K); p.set(px + off + 1, 27, K); p.set(px + off, 27, K); }
  p.contorno(K);
  // rosto
  const ey = 12;
  if (olhos === 'dormindo') { for (const x of [cx - 3, cx - 2, cx + 1, cx + 2]) p.set(x, ey, K); p.set(cx - 1, ey + 3, K); p.set(cx, ey + 3, K); }
  else {
    for (const x of [cx - 3, cx + 1]) { p.set(x, ey, '#ffffff'); p.set(x + 1, ey, '#ffffff'); p.set(x + (x < cx ? 1 : 0), ey + 1, K); p.set(x + (x < cx ? 0 : 1), ey + 1, '#ffffff'); }
    p.set(cx - 4, ey - 2, K); p.set(cx - 3, ey - 1, K); p.set(cx - 2, ey - 1, K); p.set(cx + 3, ey - 2, K); p.set(cx + 2, ey - 1, K); p.set(cx + 1, ey - 1, K);
    for (let i = -2; i <= 1; i++) p.set(cx + i, ey + 4, K); p.set(cx - 2, ey + 3, '#ffffff'); p.set(cx + 1, ey + 3, '#ffffff');
  }
  return p;
}
function sprCone() {
  const quadros = [cone(0), cone(1), cone(2), cone(0, 'dormindo')];
  return {
    quadros,
    anims: { parado: { q: [0], fps: 1 }, andando: { q: [1, 0, 2, 0], fps: 8 }, correndo: { q: [1, 0, 2, 0], fps: 14 }, pulando: { q: [1], fps: 1 }, dormindo: { q: [3], fps: 1 } },
    sombra: true, personagem: true,
  };
}

// Sanduíche de sardinha (arremessado com "mover")
function sanduiche() {
  const p = new Pix(12, 7);
  p.ret(0, 0, 10, 2, '#e8b060'); p.ret(0, 2, 10, 1, '#5ab84a'); p.ret(0, 3, 12, 1, '#b8c4d0'); p.ret(0, 4, 10, 2, '#d89848');
  p.set(11, 2, '#b8c4d0'); p.set(11, 4, '#b8c4d0'); p.set(10, 3, '#8a96a8');
  p.contorno(K);
  return montar({ parado: { q: [p] } });
}
// Lista de compras que desenrola até o chão. Estados: enrolada, abrindo (uma vez), aberta.
// Na mão da Bia: "sobre": { "id": "bia", "dx": 0.6, "dy": 0 }
function lista(compr) {   // 0..1
  const W = 16, H = 22, p = new Pix(W, H), topo = 6;
  p.ret(2, topo - 1, 8, 2, '#d8d0b8');
  const fim = Math.round(topo + 1 + compr * (H - topo - 3));
  for (let y = topo + 1; y <= fim; y++) for (let x = 3; x < 9; x++) p.set(x, y, (y % 3 === 0 && x > 3 && x < 8) ? '#9a9ab0' : '#f4f0e0');
  if (compr >= 1) for (let x = 3; x < 15; x++) { p.set(x, H - 2, '#f4f0e0'); p.set(x, H - 1, '#e0d8c0'); if (x > 9) p.set(x, H - 3, '#f4f0e0'); }
  else p.ret(3, fim, 6, 2, '#e0d8c0');
  p.contorno(K);
  return p;
}
const sprLista = () => montar({
  enrolada: { q: [lista(0)] },
  abrindo: { q: [lista(0), lista(0.25), lista(0.5), lista(0.75), lista(1)], fps: 6, unica: true },
  aberta: { q: [lista(1)] },
});
// Malinha (pombo indo embora): "sobre": { "id": "pombo", "dx": 0.4, "dy": 0.1 }
function malinha() {
  const p = new Pix(10, 9);
  p.ret(0, 2, 10, 7, '#a8643a'); p.ret(0, 2, 10, 1, '#c88050'); p.ret(0, 5, 10, 1, '#7a4422');
  p.ret(3, 0, 4, 1, '#4a2a18'); p.set(3, 1, '#4a2a18'); p.set(6, 1, '#4a2a18');
  p.set(2, 4, '#f0c840'); p.set(7, 4, '#f0c840');
  p.contorno(K);
  return montar({ parado: { q: [p] } });
}

registrarSprites({
  'tempo-pessoal': tempoPessoal,
  'guarda-chuva': sprGuardaChuva,
  'estrela-mentira': () => sprEstrela(3),
  'estrela-gigante': () => sprEstrela(10),
  palanque: () => montar({ parado: { q: [palanque()] } }),
  bandeirinhas: sprBandeirinhas,
  'fonte-praca': sprFonte,
  canteiro: sprCanteiro,
  'placa-lei': placaLei,
  'bloco-multas': blocoMultas,
  'fogo-chapeu': sprFogo,
  peruca,
  sorvete: sprSorvete,
  'agua-enchente': sprAgua,
  'cerca-mirante': cerca,
  'bueiro-monstro': sprBueiro,
  'cone-monstro': sprCone,
  sanduiche,
  'lista-compras': sprLista,
  malinha,
});
