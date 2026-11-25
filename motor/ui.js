// Interface 2D desenhada em pixels: balões de fala, emoções, legenda, título e marca d'água.
import * as THREE from 'three';
import { desenharTexto, desenharTextoContorno, larguraTexto, quebrarLinhas, normalizar } from './fonte.js';
import { clamp, easeOutBack } from './compartilhado/util.js';

const K = '#1a1c2c';
const BRANCO = '#f4f4f4';
const LINHA = 10;

// Ícones 8x8 (desenhados 2x) dos cartões do placar "escolha"
const PAL_ESCOLHA = { g: '#3ac860', G: '#1e8a3e', t: '#8a5a34', r: '#e05a4a', R: '#a83a30', w: '#f4ecd8', y: '#f8d040', k: '#1a1c2c', c: '#9aa0ac', s: '#e0d8c0' };
const ICONES_ESCOLHA = {
  arvore: ['...gg...', '..gggg..', '.ggGggg.', 'gggggGgg', '.gGgggg.', '...tt...', '...tt...', '..tttt..'],
  casa: ['...rr...', '..rrrr..', '.rrrrrr.', 'RRRRRRRR', '.wwwwww.', '.wkwwyw.', '.wkwwww.', '.wwwwww.'],
  caveira: ['..ssss..', '.ssssss.', 'skksskks', 'skksskks', 'ssssssss', '.ss..ss.', '.s.ss.s.', '........'],
  castelo: ['c.c..c.c', 'cccccccc', '.cccccc.', '.cckkcc.', '.cckkcc.', '.cccccc.', '.cccccc.', '........'],
};

function caixa(ctx, x, y, w, h, fundo, borda) {
  ctx.fillStyle = borda;
  ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
  ctx.fillStyle = fundo;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
}

// Algarismos 5x7 (mais grossos que a fonte do texto) para os números sobre a cabeça.
const DIGITOS = {
  0: ['.###.', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.'],
  1: ['.##..', '###..', '.##..', '.##..', '.##..', '.##..', '####.'],
  2: ['.###.', '##.##', '...##', '..##.', '.##..', '##...', '#####'],
  3: ['####.', '...##', '...##', '.###.', '...##', '...##', '####.'],
  4: ['...##', '..###', '.#.##', '#..##', '#####', '...##', '...##'],
  5: ['#####', '##...', '####.', '...##', '...##', '##.##', '.###.'],
  6: ['.###.', '##...', '##...', '####.', '##.##', '##.##', '.###.'],
  7: ['#####', '...##', '..##.', '..##.', '.##..', '.##..', '.##..'],
  8: ['.###.', '##.##', '##.##', '.###.', '##.##', '##.##', '.###.'],
  9: ['.###.', '##.##', '##.##', '.####', '...##', '...##', '.###.'],
  '?': ['.###.', '##.##', '...##', '..##.', '.##..', '.....', '.##..'],
  '#': ['.#.#.', '#####', '.#.#.', '.#.#.', '#####', '.#.#.', '.....'],
  '-': ['.....', '.....', '.....', '####.', '.....', '.....', '.....'],
};
function desenharDigito(ctx, c, x, y, e, cor, contorno) {
  const m = DIGITOS[c];
  if (contorno) {
    ctx.fillStyle = contorno;
    for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (m[j][i] === '#') ctx.fillRect(x + (i - 1) * e, y + (j - 1) * e, 3 * e, 3 * e);
  }
  ctx.fillStyle = cor;
  for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (m[j][i] === '#') ctx.fillRect(x + i * e, y + j * e, e, e);
}
function clarear(hex, t) {
  const n = parseInt(hex.replace('#', ''), 16), rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 'rgb(' + rgb.map((v) => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t))).join(',') + ')';
}
// Ícones de emoção desenhados (além de ! ? coracao ... zzz, que usam a fonte)
const ICONES_EMOCAO = {
  lampada: ['..yyy..', '.yYYYy.', 'yYYyYYy', 'yYYYYYy', '.yYYYy.', '..ggg..', '..ggg..', '...g...'],
  gota: ['...b...', '..bBb..', '..bBb..', '.bBBBb.', '.bBWBb.', '.bBBBb.', '..bbb..'],
  raiva: ['r.r.r.r', '.rr.rr.', 'rr...rr', '.......', 'rr...rr', '.rr.rr.', 'r.r.r.r'],
  nota: ['...kkk.', '...k.kk', '...k..k', '...k...', '.kkk...', 'kkkk...', '.kk....'],
};
const CORES_ICONE = { y: '#e8a820', Y: '#f8e060', g: '#6a6a80', b: '#2a6ac8', B: '#6ab8f8', W: '#ffffff', r: '#d83a3a', k: '#1a1c2c' };

// Número ativo de um elemento no tempo t: a última ação "numero" que já começou vence o campo "numero" do elemento.
function numeroAtual(cena, el, t) {
  let n = el.numero != null ? { valor: el.numero, inicio: 0, cor: el.numeroCor, estilo: el.numeroEstilo } : null;
  let ultimo = -1;
  for (const a of cena.acoes) {
    if (a.tipo !== 'numero' || a.alvo !== el.id || a.inicio > t || a.inicio < ultimo) continue;
    ultimo = a.inicio;
    n = a.valor == null ? null : { valor: a.valor, inicio: a.inicio, cor: a.cor ?? el.numeroCor, estilo: a.estilo ?? el.numeroEstilo };
  }
  return n;
}

export class UI {
  constructor(W, H) {
    this.W = W; this.H = H;
    this.canvas = document.createElement('canvas');
    this.canvas.width = W; this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d');
    this.textura = new THREE.CanvasTexture(this.canvas);
    this.textura.magFilter = THREE.NearestFilter; this.textura.minFilter = THREE.NearestFilter;
    this.textura.generateMipmaps = false; this.textura.colorSpace = THREE.NoColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: this.textura, transparent: true, depthTest: false, depthWrite: false });
    this.malha = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
    this.malha.position.set(W / 2, H / 2, 0);
    this.malha.renderOrder = 100;
  }

  // cabeca(id, t) -> {x, y} em px da tela (y a partir do topo) do topo do sprite.
  desenhar({ cena, t, cabeca, rascunho, info, importantes, zoom = 1 }) {
    this.importantes = importantes; this.cenaAtual = cena; this.zoom = zoom;
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // números sobre a cabeça (campo "numero" do elemento / ação "numero"); balões e emoções sobem acima deles
    const acima = new Map();
    for (const el of cena.elementos || []) {
      const n = numeroAtual(cena, el, t);
      if (!n) continue;
      const pos = cabeca(el.id, t);
      if (!pos || pos.visivel === false) continue;
      acima.set(el.id, this.numero(n, t, pos));
    }
    const cab = (id, tt) => { const p = cabeca(id, tt); return p && acima.has(id) ? { ...p, y: p.y - acima.get(id) } : p; };
    for (const a of cena.acoes) {
      if (t < a.inicio || t > a.inicio + a.duracao) continue;
      if (a.tipo === 'falar') this.balao(a, t, cab(a.alvo, t));
      if (a.tipo === 'emocao') this.emocao(a, t, cab(a.alvo, t));
      if (a.tipo === 'pensar') this.balao(a, t, cab(a.alvo, t), true);
    }
    // efeitos de tela (por cima de tudo, menos legenda e título)
    for (const a of cena.acoes) {
      if (t < a.inicio || t > a.inicio + a.duracao) continue;
      if (a.tipo === 'destaque') this.destaque(a, t, a.alvo ? cabeca(a.alvo, t) : null);
      if (a.tipo === 'contador') this.contador(a, t);
      if (a.tipo === 'placar') (a.estilo === 'escolha' ? this.placarEscolha(a, t) : this.placar(a, t));
      if (a.tipo === 'continua') this.continua(a, t);
    }
    if (cena.legendasNarracao) {
      const b = cena.legendasNarracao.find((l) => t >= l.ini && t < l.fim + (l.palavras ? 0 : 0.12));
      if (b?.palavras) this.legendaPalavras(b, t);
      else if (b) this.legendaTexto(b.texto, b.ini, b.fim + 0.12, t);
      else if (cena.legenda) this.legenda(cena, t);
    } else if (cena.legenda) this.legenda(cena, t);
    if (cena.titulo) this.titulo(cena, t);
    if (rascunho && info) {
      const txt = normalizar(info);
      const w = larguraTexto(txt) + 6;
      ctx.globalAlpha = 0.8; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, 11); ctx.globalAlpha = 1;
      desenharTexto(ctx, txt, 3, -1, '#ffe040');
    }
    this.textura.needsUpdate = true;
  }

  balao(a, t, pos, pensamento = false) {
    if (!pos) return;
    const { ctx, W } = this;
    const linhas = quebrarLinhas(a.texto || '', a.largura || 110);
    const vel = a.velocidade ?? 0.045;
    let visiveis = Math.max(0, Math.floor((t - a.inicio - 0.15) / vel) + 1);
    const larg = Math.max(...linhas.map((l) => larguraTexto(l))) + 8;
    const alt = linhas.length * LINHA + 4;
    let x = Math.round(pos.x - larg / 2), y = Math.round(pos.y - alt - 6);
    x = clamp(x, 2, W - larg - 2);
    y = Math.max(2, y);
    const pulo = t - a.inicio < 0.08 ? 1 : 0;
    y += pulo;
    const rx = clamp(Math.round(pos.x), x + 4, x + larg - 5);
    if (pensamento) {   // nuvem: borda com "ondas" e bolinhas descendo até a cabeça
      caixa(ctx, x, y, larg, alt, BRANCO, K);
      ctx.fillStyle = K;
      for (let k = x + 3; k < x + larg - 3; k += 5) { ctx.fillRect(k, y - 1, 3, 1); ctx.fillRect(k, y + alt, 3, 1); }
      for (let k = y + 3; k < y + alt - 3; k += 5) { ctx.fillRect(x - 1, k, 1, 3); ctx.fillRect(x + larg, k, 1, 3); }
      const bola = (bx, by, r) => { ctx.fillStyle = K; ctx.fillRect(bx - r, by - r + 1, 2 * r + 1, 2 * r - 1); ctx.fillRect(bx - r + 1, by - r, 2 * r - 1, 2 * r + 1); ctx.fillStyle = BRANCO; ctx.fillRect(bx - r + 1, by - r + 1, 2 * r - 1, 2 * r - 1); };
      bola(rx, y + alt + 3, 2); bola(rx + 1, y + alt + 7, 1);
    } else {
      caixa(ctx, x, y, larg, alt, BRANCO, K);
      // rabinho
      ctx.fillStyle = K; ctx.fillRect(rx - 2, y + alt - 1, 5, 1); ctx.fillRect(rx - 1, y + alt, 3, 1); ctx.fillRect(rx, y + alt + 1, 1, 2);
      ctx.fillStyle = BRANCO; ctx.fillRect(rx - 1, y + alt - 1, 3, 1); ctx.fillRect(rx, y + alt, 1, 1);
    }
    linhas.forEach((l, i) => {
      const n = Math.min(l.length, visiveis);
      visiveis -= l.length + 1;
      if (n > 0) desenharTexto(ctx, l, x + 4, y + i * LINHA, K, 1, n);
    });
  }

  emocao(a, t, pos) {
    if (!pos) return;
    const { ctx } = this;
    const ic = a.icone || '!';
    if (ICONES_EMOCAO[ic]) {
      const m = ICONES_EMOCAO[ic], p0 = clamp((t - a.inicio) / 0.25), sal = Math.round((1 - easeOutBack(p0)) * 6);
      const larg = m[0].length + 6, alt = m.length + 6, x = Math.round(pos.x - larg / 2), y = Math.round(pos.y - alt - 5 + sal);
      caixa(ctx, x, y, larg, alt, BRANCO, K);
      ctx.fillStyle = K; ctx.fillRect(Math.round(pos.x), y + alt, 1, 2);
      m.forEach((l, j) => [...l].forEach((c, i) => { if (CORES_ICONE[c]) { ctx.fillStyle = CORES_ICONE[c]; ctx.fillRect(x + 3 + i, y + 3 + j, 1, 1); } }));
      return;
    }
    const txt = ic === 'coracao' ? '♥' : ic;
    const p = clamp((t - a.inicio) / 0.25);
    const salto = Math.round((1 - easeOutBack(p)) * 6);
    const larg = larguraTexto(txt) + 6, alt = 13;
    const x = Math.round(pos.x - larg / 2), y = Math.round(pos.y - alt - 5 + salto);
    caixa(ctx, x, y, larg, alt, BRANCO, K);
    ctx.fillStyle = K; ctx.fillRect(Math.round(pos.x), y + alt, 1, 2);
    desenharTexto(ctx, txt, x + 3, y, ic === 'coracao' ? '#e83a4a' : ic === '!' ? '#c83c4c' : K);
  }

  // Número sobre a cabeça. estilo "placa" (padrão: plaquinha com borda) ou "solto" (algarismos grandes com contorno).
  // Devolve quantos pixels ocupa acima da cabeça.
  numero(n, t, pos) {
    const { ctx } = this;
    const txt = String(n.valor).toUpperCase().split('').filter((c) => DIGITOS[c]);
    if (!txt.length) return 0;
    const pop = clamp((t - n.inicio) / 0.25);
    const salto = n.inicio > 0 ? Math.round((1 - easeOutBack(pop)) * 5) : 0;
    const flut = Math.floor(t * 2.5) % 2;                     // sobe e desce 1 px (nada parado)
    const cor = n.cor || '#f8d040';
    if (n.estilo === 'solto') {
      const e = 2, larg = txt.length * 6 * e - e, alt = 7 * e;
      const x = Math.round(pos.x - larg / 2), y = Math.round(pos.y - alt - 4 - flut + salto);
      txt.forEach((c, i) => desenharDigito(ctx, c, x + i * 6 * e, y, e, cor, K));
      return alt + 6;
    }
    const larg = txt.length * 6 + 5, alt = 11;
    const x = Math.round(pos.x - larg / 2), y = Math.round(pos.y - alt - 5 - flut + salto);
    caixa(ctx, x, y, larg, alt, cor, K);
    ctx.fillStyle = clarear(cor, 0.45); ctx.fillRect(x + 2, y + 1, larg - 4, 1);       // brilho em cima
    ctx.fillStyle = clarear(cor, -0.35); ctx.fillRect(x + 2, y + alt - 2, larg - 4, 1); // sombra embaixo
    ctx.fillStyle = K; ctx.fillRect(Math.round(pos.x) - 1, y + alt, 3, 1); ctx.fillRect(Math.round(pos.x), y + alt + 1, 1, 2);
    txt.forEach((c, i) => desenharDigito(ctx, c, x + 3 + i * 6, y + 2, 1, n.corTexto || K));
    return alt + 7;
  }

  // Lupa/destaque: escurece a tela e deixa um círculo claro no alvo (ou em "posicao" [x, y] em px da tela).
  destaque(a, t, pos) {
    const { ctx, W, H } = this;
    const p = pos ? { x: pos.x, y: pos.y + (a.dy ?? 14) } : { x: a.posicao?.[0] ?? W / 2, y: a.posicao?.[1] ?? H / 2 };
    const ent = clamp((t - a.inicio) / 0.2), sai = clamp((a.inicio + a.duracao - t) / 0.2);
    const R = Math.round((a.raio ?? 22) * (0.6 + 0.4 * easeOutBack(ent)));
    ctx.globalAlpha = (a.escurecer ?? 0.7) * Math.min(ent, sai);
    ctx.fillStyle = '#06060c';
    for (let y = 0; y < H; y++) {
      const dy = y + 0.5 - p.y, meia = dy * dy < R * R ? Math.floor(Math.sqrt(R * R - dy * dy)) : -1;
      if (meia < 0) { ctx.fillRect(0, y, W, 1); continue; }
      ctx.fillRect(0, y, Math.round(p.x - meia), 1); ctx.fillRect(Math.round(p.x + meia), y, W, 1);
    }
    ctx.globalAlpha = Math.min(ent, sai);
    ctx.fillStyle = a.cor || '#f8e040';
    for (let k = 0; k < 48; k++) { const ang = k / 48 * Math.PI * 2; ctx.fillRect(Math.round(p.x + Math.cos(ang) * R), Math.round(p.y + Math.sin(ang) * R), 1, 1); }
    ctx.globalAlpha = 1;
  }

  // Contagem regressiva grande no alto da tela: "de" (padrão = duração) até 0.
  contador(a, t) {
    const { ctx, W } = this;
    const de = Math.round(a.de ?? a.duracao), passo = a.duracao / de, dt = t - a.inicio;
    const n = Math.max(0, de - Math.floor(dt / passo)), pulso = clamp((dt % passo) / 0.15);
    const e = (n <= 3 ? 4 : 3) + (pulso < 1 ? 1 : 0), txt = String(n).split('');
    const larg = txt.length * 6 * e - e, x = Math.round((W - larg) / 2), y = a.y ?? 8;
    txt.forEach((c, i) => desenharDigito(ctx, c, x + i * 6 * e, y, e, n <= 3 ? '#f05a4a' : (a.cor || '#f8e040'), K));
  }

  // Placar de votação: "opcoes": ["AJUDAR", "FUGIR"], "votos": [62, 38] (opcional, as barras enchem).
  placar(a, t) {
    const { ctx, W } = this;
    const ops = a.opcoes || ['1', '2'], cores = a.cores || ['#3a8ae8', '#e8503a'];
    const p = clamp((t - a.inicio) / 0.3), cheio = clamp((t - a.inicio - 0.3) / Math.max(0.5, a.duracao - 0.8));
    const w = Math.floor((W - 24 - (ops.length - 1) * 8) / ops.length), alt = a.votos ? 30 : 20;
    const y = Math.round((a.y ?? 10) - (1 - easeOutBack(p)) * 30);
    ops.forEach((o, i) => {
      const x = 12 + i * (w + 8);
      caixa(ctx, x, y, w, alt, '#10101c', cores[i % cores.length]);
      desenharDigito(ctx, String(i + 1), x + 4, y + 4, 1, cores[i % cores.length], null);
      desenharTexto(ctx, normalizar(String(o)).toUpperCase(), x + 12, y + 2, BRANCO);
      if (a.votos) {
        const pct = (a.votos[i] ?? 0) * cheio, bw = Math.round((w - 8) * pct / 100);
        ctx.fillStyle = '#2a2a3a'; ctx.fillRect(x + 4, y + 16, w - 8, 6);
        ctx.fillStyle = cores[i % cores.length]; ctx.fillRect(x + 4, y + 16, bw, 6);
        desenharTexto(ctx, `${Math.round(pct)}%`, x + 4, y + 20, BRANCO);
      }
    });
  }

  // PROTÓTIPO (isekai, pedido do usuário "a votação poderia ser mais bonita"): "estilo": "escolha" — cartaz "VOCÊ DECIDE!" com dois (ou três)
  // cartões grandes: número num selo redondo, ícone em pixel ("icones": ["arvore", "casa", ...]) e o nome. Entram pulando, um depois do
  // outro, e a borda pisca devagar. "titulo" troca o "VOCÊ DECIDE!".
  placarEscolha(a, t) {
    const { ctx, W } = this;
    const ops = a.opcoes || ['1', '2'], cores = a.cores || ['#3ac860', '#f0a040'], ics = a.icones || [];
    const dt = t - a.inicio, n = ops.length;
    const tit = normalizar(a.titulo || 'VOCÊ DECIDE!'), et = larguraTexto(tit, 2) <= W - 24 ? 2 : 1, lt = larguraTexto(tit, et);
    const gap = 6, cw = Math.min(110, Math.floor((W - 20 - (n - 1) * gap) / n)), ch = 50;
    const x0 = Math.round((W - (n * cw + (n - 1) * gap)) / 2);
    // painel de menu de jogo (moldura dourada) que desce do alto
    const pP = clamp(dt / 0.3), desce = Math.round((1 - easeOutBack(pP)) * -40);
    const px = x0 - 5, pw = n * cw + (n - 1) * gap + 10, py = 4 + desce, ph = 11 * et + 8 + ch + 10;
    caixa(ctx, px - 1, py - 1, pw + 2, ph + 2, '#1a1c2c', '#1a1c2c');
    caixa(ctx, px, py, pw, ph, '#161a30', '#f8d040');
    ctx.fillStyle = '#c8901e'; ctx.fillRect(px + 2, py + ph - 3, pw - 4, 1);
    for (const [cx2, cy2] of [[px + 2, py + 2], [px + pw - 4, py + 2]]) { ctx.fillStyle = '#fff4a0'; ctx.fillRect(cx2, cy2, 2, 2); }   // rebites
    desenharTextoContorno(ctx, tit, Math.round((W - lt) / 2), py + 5, '#fff4a0', '#5a3a10', et);
    const yC = py + 11 * et + 8;
    ops.forEach((o, i) => {
      const p = clamp((dt - 0.2 - i * 0.18) / 0.3);
      if (p <= 0) return;
      const cor = cores[i % cores.length], x = x0 + i * (cw + gap), y = Math.round(yC - (1 - easeOutBack(p)) * 18);
      const pisca = Math.floor(dt * 2.5 + i) % 2 === 0;
      caixa(ctx, x - 1, y - 1, cw + 2, ch + 2, pisca ? '#ffffff' : cor, pisca ? '#ffffff' : cor);
      caixa(ctx, x, y, cw, ch, '#242a46', cor);
      ctx.fillStyle = cor; ctx.fillRect(x + 2, y + 2, cw - 4, 2);
      // selo redondo com o número (canto de cima à esquerda)
      const sx = x + 3, sy = y + 6;
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(sx, sy, 13, 13);
      ctx.fillStyle = cor; ctx.fillRect(sx + 2, sy + 1, 9, 11); ctx.fillRect(sx + 1, sy + 2, 11, 9);
      desenharDigito(ctx, String(i + 1), sx + 4, sy + 3, 1, '#1a1c2c', null);
      // ícone grande (8x8 desenhado 3x) no meio
      const ic = ICONES_ESCOLHA[ics[i]];
      if (ic) { const e = 3, ix = Math.round(x + (cw - 8 * e) / 2), iy = y + 5; ic.forEach((l, j) => [...l].forEach((c, k) => { if (c !== '.') { ctx.fillStyle = PAL_ESCOLHA[c]; ctx.fillRect(ix + k * e, iy + j * e, e, e); } })); }
      // nome embaixo, centralizado
      const nome = normalizar(String(o)).toUpperCase(), ln = larguraTexto(nome, 1);
      desenharTextoContorno(ctx, nome, Math.round(x + (cw - ln) / 2), y + ch - 12, '#ffffff', '#1a1c2c', 1);
    });
  }

  // Selo "CONTINUA..." no canto (gancho do fim do episódio). "texto" troca a palavra.
  continua(a, t) {
    const { ctx, W, H } = this;
    const txt = normalizar(a.texto || 'CONTINUA...'), p = clamp((t - a.inicio) / 0.25), esc = 2;
    const larg = larguraTexto(txt, esc) + 10, alt = 11 * esc + 4;
    const x = W - larg - 8, y = H - alt - 18 + Math.round((1 - easeOutBack(p)) * -12);
    caixa(ctx, x, y, larg, alt, '#c83c4c', '#f4f4f4');
    desenharTexto(ctx, txt, x + 5 + esc, y + 1 + esc, '#5a1a24', esc);
    desenharTexto(ctx, txt, x + 5, y + 1, '#f4f4f4', esc);
  }

  legenda(cena, t) {
    this.legendaTexto(cena.legenda, cena.legendaInicio ?? 0.2, cena.legendaFim ?? cena.duracao - 0.3, t, 0.2);
  }

  // Caixa de legenda na parte de baixo (usada pela legenda fixa e pela do narrador).
  legendaTexto(texto, ini, fim, t, entrada = 0.06) {
    const { ctx, W, H } = this;
    const linhas = quebrarLinhas(texto, W - 28);
    if (t < ini || t > fim) return;
    const alpha = clamp(Math.min((t - ini) / entrada, (fim - t) / entrada));
    const alt = linhas.length * LINHA + 4;
    const y0 = H - alt - 4;
    ctx.globalAlpha = 0.7 * alpha; ctx.fillStyle = '#0a0a14';
    const larg = Math.max(...linhas.map((l) => larguraTexto(l))) + 12;
    ctx.fillRect(Math.round((W - larg) / 2), y0, larg, alt);
    ctx.globalAlpha = alpha;
    linhas.forEach((l, i) => desenharTexto(ctx, l, Math.round((W - larguraTexto(l)) / 2), y0 + i * LINHA, BRANCO));
    ctx.globalAlpha = 1;
  }

  // Legenda palavra por palavra: 2-3 palavras grandes, com contorno, e a palavra que o narrador está falando em amarelo.
  // No Shorts fica a ~66% da altura (fora da área coberta pelos botões e pelo título do YouTube).
  legendaPalavras(b, t) {
    const { ctx, W, H } = this;
    const vertical = H > W;
    // tamanho FIXO (pedido do usuário): sempre grande; se não couber numa linha, quebra em duas (só encolhe se UMA palavra não couber)
    let esc = 2;
    if (b.palavras.some((p) => larguraTexto(p.w, esc) > W - 12)) esc = 1;
    const linhas = [];
    let atual = [];
    for (const p of b.palavras) {
      const txt = [...atual, p].map((q) => q.w).join(' ');
      if (atual.length && larguraTexto(txt, esc) > W - 12) { linhas.push(atual); atual = [p]; } else atual.push(p);
    }
    if (atual.length) linhas.push(atual);
    const altLinha = 11 * esc, altBloco = linhas.length * altLinha;
    const pop = clamp((t - b.ini) / 0.08);
    const larguraMax = Math.max(...linhas.map((ln) => larguraTexto(ln.map((p) => p.w).join(' '), esc)));
    // posição fixa embaixo (pedido do usuário: legenda que troca de lugar confunde). No Shorts fica logo acima dos ~18% de
    // baixo, onde ficam o título e os botões do YouTube. "legendaPosicao" (0–1) no roteiro/cena muda; "legendaPosicao": "auto"
    // usa lugarLegenda (desvia de quem está na cena).
    // cena com zoom (personagens grandes, no meio da tela): a legenda desce um pouco para não ficar em cima deles
    const perto = (this.zoom ?? 1) >= 1.5;
    const pos = this.cenaAtual?.legendaPosicao ?? (vertical ? (perto ? 0.8 : 0.76) : (perto ? 0.88 : 0.85));
    const centro = pos === 'auto' ? this.lugarLegenda(b, altBloco, larguraMax, vertical) : pos;
    const y0 = Math.round(H * centro - altBloco / 2 + (1 - pop) * 2);
    const espaco = larguraTexto(' ', esc) + esc;
    linhas.forEach((ln, i) => {
      const larg = ln.reduce((sm, p) => sm + larguraTexto(p.w, esc), 0) + espaco * (ln.length - 1);
      let x = Math.round((W - larg) / 2);
      const y = y0 + i * altLinha;
      for (const p of ln) {
        const falando = t >= p.ini && t < p.fim + 0.05;
        desenharTexto(ctx, p.w, x + esc, y + esc, '#000000', esc);
        desenharTextoContorno(ctx, p.w, x, y, falando ? '#ffe040' : BRANCO, K, esc);
        x += larguraTexto(p.w, esc) + espaco;
      }
    });
  }

  // Onde a legenda não cobre ninguém: testa alturas em ordem de preferência. Primeiro uma posição para a CENA inteira
  // (a legenda não pula de cima para baixo); só se ela cobrir alguém num grupo, esse grupo procura outra.
  // Shorts: evita os 18% de baixo (título/botões do YouTube) e os 8% de cima.
  lugarLegenda(b, altBloco, larg, vertical) {
    const { W, H } = this;
    const opcoes = vertical ? [0.66, 0.74, 0.2, 0.28, 0.58, 0.12] : [0.84, 0.12, 0.74, 0.22];
    if (!this.importantes) return opcoes[0];
    if (b._lugar != null) return b._lugar;
    const x0 = (W - larg) / 2 - 3, x1 = (W + larg) / 2 + 3;
    const cobre = (c, caixas) => {
      const y0 = H * c - altBloco / 2 - 2, y1 = H * c + altBloco / 2 + 2;
      let area = 0;
      for (const k of caixas) area += Math.max(0, Math.min(x1, k.x1) - Math.max(x0, k.x0)) * Math.max(0, Math.min(y1, k.y1) - Math.max(y0, k.y0));
      return area;
    };
    const escolher = (caixas) => {
      let melhor = opcoes[0], menor = Infinity;
      for (const [i, c] of opcoes.entries()) {
        const area = cobre(c, caixas), custo = area + i * 0.5;   // empate: a preferida
        if (custo < menor) { menor = custo; melhor = c; }
        if (area === 0) break;
      }
      return melhor;
    };
    const amostras = (g) => [g.ini, (g.ini + g.fim) / 2, Math.max(g.ini, g.fim - 0.05)];
    const cena = this.cenaAtual;
    if (cena && cena._lugarLegenda == null) {
      const todas = (cena.legendasNarracao || []).flatMap((g) => amostras(g)).flatMap((tt) => this.importantes(tt));
      cena._lugarLegenda = escolher(todas);
    }
    const caixas = amostras(b).flatMap((tt) => this.importantes(tt));
    const daCena = cena?._lugarLegenda ?? opcoes[0];
    b._lugar = cobre(daCena, caixas) === 0 ? daCena : escolher(caixas);
    b._cobre = Math.round(cobre(b._lugar, caixas));
    return b._lugar;
  }

  titulo(cena, t) {
    const { ctx, W, H } = this;
    const dur = cena.tituloDuracao ?? Math.min(cena.duracao - 0.3, 3.5);
    const ini = cena.tituloInicio ?? 0.15;
    if (t < ini || t > ini + dur) return;
    const p = cena.tituloSemEntrada ? 1 : clamp((t - ini) / 0.45);   // continua o título da cena anterior (abertura) sem pular de novo
    const alpha = clamp((ini + dur - t) / 0.3);
    const esc = cena.tituloEscala ?? (Math.max(W, H) >= 320 ? 2 : 1);
    const linhas = quebrarLinhas(cena.titulo, W - 20, esc);
    const altLinha = 11 * esc;
    const blocoAlt = linhas.length * altLinha + (cena.subtitulo ? 14 : 0);
    const yBase = Math.round(H * (cena.tituloPosicao ?? 0.32) - blocoAlt / 2 - (1 - easeOutBack(p)) * 20);
    ctx.globalAlpha = alpha;
    linhas.forEach((l, i) => {
      const x = Math.round((W - larguraTexto(l, esc)) / 2), y = yBase + i * altLinha;
      desenharTexto(ctx, l, x + esc, y + esc, '#000000', esc);
      desenharTextoContorno(ctx, l, x, y, cena.tituloCor || '#ffe040', K, esc);
    });
    if (cena.subtitulo && p >= 1) {
      const p2 = clamp((t - ini - 0.45) / 0.3);
      ctx.globalAlpha = alpha * p2;
      const y = yBase + linhas.length * altLinha + 2;
      for (const [i, l] of quebrarLinhas(cena.subtitulo, W - 20).entries()) {
        desenharTextoContorno(ctx, l, Math.round((W - larguraTexto(l)) / 2), y + i * LINHA, BRANCO, K);
      }
    }
    ctx.globalAlpha = 1;
  }
}
