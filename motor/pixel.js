// Tela de pixels simples sobre ImageData, com utilidades de desenho pixel-art.

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bayer = (x, y) => (BAYER4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

export function hexParaRgb(hex) {
  if (Array.isArray(hex)) return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function misturar(a, b, t) {
  const A = hexParaRgb(a), B = hexParaRgb(b);
  return A.map((v, i) => Math.round(v + (B[i] - v) * t));
}

export class Pix {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  dentro(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  set(x, y, cor, alpha = 255) {
    x = Math.floor(x); y = Math.floor(y);
    if (!this.dentro(x, y) || cor == null) return;
    const [r, g, b] = hexParaRgb(cor);
    const i = (y * this.w + x) * 4;
    this.d[i] = r; this.d[i + 1] = g; this.d[i + 2] = b; this.d[i + 3] = alpha;
  }
  opaco(x, y) { return this.dentro(x, y) && this.d[(y * this.w + x) * 4 + 3] > 0; }
  ret(x, y, w, h, cor) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, cor); }
  circulo(cx, cy, r, corFn) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++)
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        if (dx * dx + dy * dy <= r * r) this.set(x, y, typeof corFn === 'function' ? corFn(x, y, dx / r, dy / r) : corFn);
      }
  }
  elipse(cx, cy, rx, ry, corFn) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, typeof corFn === 'function' ? corFn(x, y, dx, dy) : corFn);
      }
  }
  // Contorno externo (4-vizinhos) em volta dos pixels opacos.
  contorno(cor) {
    const marcar = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.opaco(x, y)) continue;
        if (this.opaco(x - 1, y) || this.opaco(x + 1, y) || this.opaco(x, y - 1) || this.opaco(x, y + 1)) marcar.push([x, y]);
      }
    for (const [x, y] of marcar) this.set(x, y, cor);
    return this;
  }
  // Escolhe entre cores por valor 0..1 com dithering ordenado.
  static tom(cores, v, x, y) {
    const n = cores.length;
    const f = Math.min(n - 1.0001, Math.max(0, v * (n - 1)));
    const i = Math.floor(f);
    return f - i > bayer(x, y) ? cores[i + 1] : cores[i];
  }
  paraCanvas() {
    const c = document.createElement('canvas');
    c.width = this.w; c.height = this.h;
    c.getContext('2d').putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    return c;
  }
  static deAscii(linhas, cores) {
    const h = linhas.length, w = Math.max(...linhas.map((l) => l.length));
    const p = new Pix(w, h);
    linhas.forEach((l, y) => [...l].forEach((c, x) => { if (c !== '.' && c !== ' ' && cores[c]) p.set(x, y, cores[c]); }));
    return p;
  }
}
