// Desenho de personagens por camadas: formas por material -> sombreamento automático
// (luz vinda da esquerda/cima) -> linhas internas -> contorno colorido (tom mais escuro de cada material).
import { Pix } from './pixel.js';

export class Boneco {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.mat = new Int16Array(w * h).fill(-1);
    this.ord = new Int32Array(w * h).fill(-1);
    this.cor = new Array(w * h).fill(null); // sobreposição direta
    this.mats = []; this.n = 0;
  }
  material(tons, opc = {}) { this.mats.push({ luz: tons[0], base: tons[1], sombra: tons[2], contorno: tons[3], ...opc }); return this.mats.length - 1; }
  _set(x, y, m) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; const i = y * this.w + x; this.mat[i] = m; this.ord[i] = this.n; }
  ret(x, y, w, h, m) { this.n++; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this._set(x + i, y + j, m); }
  elipse(cx, cy, rx, ry, m) {
    this.n++;
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) this._set(x, y, m);
    }
  }
  poli(pts, m) {
    this.n++;
    const ys = pts.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
        if ((y0 <= yc && y1 > yc) || (y1 <= yc && y0 > yc)) xs.push(x0 + ((yc - y0) / (y1 - y0)) * (x1 - x0));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this._set(x, y, m);
    }
  }
  traco(x0, y0, x1, y1, esp, m) { // segmento grosso
    this.n++;
    const passos = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1;
    for (let s = 0; s <= passos; s++) {
      const t = s / passos, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
      for (let j = -esp; j <= esp; j++) for (let i = -esp; i <= esp; i++) if (i * i + j * j <= esp * esp * 0.6 + 0.3) this._set(cx + i, cy + j, m);
    }
  }
  apagar(x, y) { const i = y * this.w + x; if (i >= 0 && i < this.mat.length) { this.mat[i] = -1; } }
  pinta(x, y, cor) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cor[y * this.w + x] = cor; }
  tom(x, y, qual) { const m = this.mat[y * this.w + x]; if (m >= 0) this.pinta(x, y, this.mats[m][qual]); }

  render() {
    const { w, h, mat, ord } = this;
    const M = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : mat[y * w + x]);
    const O = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : ord[y * w + x]);
    const p = new Pix(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const m = M(x, y);
      if (m < 0) continue;
      const mt = this.mats[m];
      let c = mt.base;
      if (!mt.plano) {
        const fora = (dx, dy) => M(x + dx, y + dy) !== m;
        if (fora(1, 0) || (mt.sombraLarga && fora(2, 0)) || fora(0, 1)) c = mt.sombra;
        else if (fora(-1, 0) || fora(0, -1)) c = mt.luz;
      }
      // linha interna: a peça da frente ganha contorno onde encosta numa peça de trás
      if (mt.borda !== false) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const mm = M(x + dx, y + dy);
          if (mm >= 0 && mm !== m && this.mats[mm].borda !== false && O(x + dx, y + dy) < ord[y * w + x]) { c = mt.contorno; break; }
        }
      }
      p.set(x, y, c);
    }
    // contorno externo colorido (cor do material vizinho)
    const contorno = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (M(x, y) >= 0) continue;
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const mm = M(x + dx, y + dy);
        if (mm >= 0) { contorno.push([x, y, this.mats[mm].contorno]); break; }
      }
    }
    for (const [x, y, c] of contorno) p.set(x, y, c);
    for (let i = 0; i < this.cor.length; i++) if (this.cor[i]) p.set(i % w, Math.floor(i / w), this.cor[i]);
    return p;
  }
}

// Ciclo de passada genérico: devolve pés e balanço dos braços na fase t (0..1).
export function passada(t, { passo, levanta, quadril = [13.5, 33], chao = 41 }) {
  const a = t * Math.PI * 2;
  const pe = (fase) => ({ x: quadril[0] + Math.sin(a + fase) * passo, y: chao - Math.max(0, Math.cos(a + fase)) * levanta });
  return { frente: pe(0), tras: pe(Math.PI), braco: Math.sin(a + Math.PI) };
}

