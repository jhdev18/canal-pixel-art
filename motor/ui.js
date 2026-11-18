// Interface 2D desenhada em pixels: balões de fala, emoções, legenda, título e marca d'água.
import * as THREE from 'three';
import { desenharTexto, desenharTextoContorno, larguraTexto, quebrarLinhas, normalizar } from './fonte.js';
import { clamp, easeOutBack } from './compartilhado/util.js';

const K = '#1a1c2c';
const BRANCO = '#f4f4f4';
const LINHA = 10;

function caixa(ctx, x, y, w, h, fundo, borda) {
  ctx.fillStyle = borda;
  ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
  ctx.fillStyle = fundo;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
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
  desenhar({ cena, t, cabeca, rascunho, info }) {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    for (const a of cena.acoes) {
      if (t < a.inicio || t > a.inicio + a.duracao) continue;
      if (a.tipo === 'falar') this.balao(a, t, cabeca(a.alvo, t));
      if (a.tipo === 'emocao') this.emocao(a, t, cabeca(a.alvo, t));
    }
    if (cena.legendasNarracao) {
      const b = cena.legendasNarracao.find((l) => t >= l.ini && t < l.fim + 0.12);
      if (b) this.legendaTexto(b.texto, b.ini, b.fim + 0.12, t);
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

  balao(a, t, pos) {
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
    caixa(ctx, x, y, larg, alt, BRANCO, K);
    // rabinho
    const rx = clamp(Math.round(pos.x), x + 4, x + larg - 5);
    ctx.fillStyle = K; ctx.fillRect(rx - 2, y + alt - 1, 5, 1); ctx.fillRect(rx - 1, y + alt, 3, 1); ctx.fillRect(rx, y + alt + 1, 1, 2);
    ctx.fillStyle = BRANCO; ctx.fillRect(rx - 1, y + alt - 1, 3, 1); ctx.fillRect(rx, y + alt, 1, 1);
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
    const txt = ic === 'coracao' ? '♥' : ic;
    const p = clamp((t - a.inicio) / 0.25);
    const salto = Math.round((1 - easeOutBack(p)) * 6);
    const larg = larguraTexto(txt) + 6, alt = 13;
    const x = Math.round(pos.x - larg / 2), y = Math.round(pos.y - alt - 5 + salto);
    caixa(ctx, x, y, larg, alt, BRANCO, K);
    ctx.fillStyle = K; ctx.fillRect(Math.round(pos.x), y + alt, 1, 2);
    desenharTexto(ctx, txt, x + 3, y, ic === 'coracao' ? '#e83a4a' : ic === '!' ? '#c83c4c' : K);
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

  titulo(cena, t) {
    const { ctx, W, H } = this;
    const dur = cena.tituloDuracao ?? Math.min(cena.duracao - 0.3, 3.5);
    const ini = cena.tituloInicio ?? 0.15;
    if (t < ini || t > ini + dur) return;
    const p = clamp((t - ini) / 0.45);
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
