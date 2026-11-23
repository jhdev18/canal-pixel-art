// Utilidades da arte do canal (banner e foto de perfil): sprites do motor, sombras, títulos e ampliação pelo Three.js.
import * as THREE from 'three';
import { Pix, misturar, bayer } from '/motor/pixel.js';
import { desenharTexto, larguraTexto } from '/motor/fonte.js';
import { obterSprite } from '/motor/sprites.js';
import '/motor/assets/index.js';

export { Pix, misturar, bayer, larguraTexto };

export function criarTela(W, H, semente = 7) {
  const p = new Pix(W, H);
  let s = semente;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const get = (x, y) => { x = Math.max(0, Math.min(W - 1, x | 0)); y = Math.max(0, Math.min(H - 1, y | 0)); const i = (y * W + x) * 4; return [p.d[i], p.d[i + 1], p.d[i + 2]]; };
  const escurecer = (x, y, cor, t) => { if (p.dentro(x, y)) p.set(x, y, misturar(get(x, y), cor, t)); };
  const brilho = (cx, cy, R, cor, forca) => {
    for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      if (!p.dentro(x, y)) continue;
      const d = Math.hypot(x - cx, y - cy) / R; if (d >= 1) continue;
      const t = (1 - d) * (1 - d) * forca;
      const q = Math.round(t * 4) / 4 + ((t * 4) % 1 > bayer(x, y) ? 0.25 : 0);
      if (q > 0) p.set(x, y, misturar(get(x, y), cor, Math.min(1, q)));
    }
  };
  return { p, rnd, get, escurecer, brilho, W, H };
}

// Quadro de um sprite do motor como lista de pixels [x, y, [r,g,b]].
export function quadro(nome, anim = 'parado') {
  const s = obterSprite(nome);
  const a = s.anims?.[anim] || s.anims?.parado;
  const q = s.quadros[(a?.q || a || [0])[0]];
  const d = q.getContext('2d').getImageData(0, 0, q.width, q.height).data;
  const px = [];
  for (let y = 0; y < q.height; y++) for (let x = 0; x < q.width; x++) {
    const i = (y * q.width + x) * 4;
    if (d[i + 3] > 128) px.push([x, y, [d[i], d[i + 1], d[i + 2]]]);
  }
  const base = Math.max(...px.map((v) => v[1])) + 1; // linha dos pés
  return { px, w: q.width, h: q.height, base };
}

// Desenha o sprite com os pés em (pesX, pesY), ampliado por "esc" (inteiro).
export function desenharSprite(T, spr, pesX, pesY, esc = 1, { espelhar = false } = {}) {
  const ox = Math.round(pesX - (spr.w * esc) / 2), oy = pesY - spr.base * esc;
  for (const [x, y, c] of spr.px) {
    const sx = espelhar ? spr.w - 1 - x : x;
    T.p.ret(ox + sx * esc, oy + y * esc, esc, esc, c);
  }
}

// Sombra deitada no chão a partir dos pés: dir = 1 (direita) ou -1 (esquerda).
export function sombra(T, spr, pesX, pesY, esc, dir, { comp = 1.15, achatar = 0.2, cor = '#3d3a5c', forca = 0.5 } = {}) {
  const ox = pesX - (spr.w * esc) / 2, feito = new Set();
  for (const [x, y] of spr.px) for (let j = 0; j < esc; j++) for (let i = 0; i < esc; i++) {
    const X = ox + x * esc + i, alt = spr.base * esc - (y * esc + j);
    const sx = Math.round(X + dir * alt * comp), sy = Math.round(pesY - 1 + alt * achatar);
    const k = sx + ',' + sy; if (feito.has(k)) continue; feito.add(k);
    T.escurecer(sx, sy, cor, forca);
  }
}

// Título com contorno, sombra e degradê, centralizado em "cx" (ou na tela). Devolve os limites.
export function titulo(T, texto, escala, topo, cores, { contorno = '#2a1240', sombraCor = '#120822', cx = T.W / 2 } = {}) {
  const pts = new Set();
  const ctx = { set fillStyle(v) {}, fillRect(x, y, w, h) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pts.add((x + i) + ',' + (y + j)); } };
  desenharTexto(ctx, texto, 0, 0, '#fff', escala);
  const arr = [...pts].map((s) => s.split(',').map(Number));
  const w = Math.max(...arr.map((a) => a[0])) + 1, y0 = Math.min(...arr.map((a) => a[1])), y1 = Math.max(...arr.map((a) => a[1])) + 1;
  const ox = Math.round(cx - w / 2), oy = topo - y0;
  const tem = new Set(arr.map(([x, y]) => (x + ox) + ',' + (y + oy)));
  const lista = [...tem].map((s) => s.split(',').map(Number));
  const grossa = Math.max(1, Math.round(escala / 3));
  for (const [x, y] of lista) for (let k = 1; k <= grossa + 1; k++) T.p.set(x + k, y + k + 1, sombraCor);
  for (const [x, y] of lista) for (let dy = -grossa; dy <= grossa; dy++) for (let dx = -grossa; dx <= grossa; dx++)
    if (!tem.has((x + dx) + ',' + (y + dy))) T.p.set(x + dx, y + dy, contorno);
  const alto = y1 - y0;
  for (const [x, y] of lista) T.p.set(x, y, cores[Math.min(cores.length - 1, Math.floor(((y - topo) / alto) * cores.length))]);
  for (const [x, y] of lista) if (!tem.has(x + ',' + (y - 1))) T.p.set(x, y, '#fffdf2');
  return { texto, x0: ox - grossa, x1: ox + w + grossa + 2, y0: topo - grossa, y1: topo + alto + grossa + 2, ox, w };
}

// Amplia sem suavizar (Three.js) e devolve o PNG.
export function finalizar(T, esc, limites = []) {
  const tex = new THREE.CanvasTexture(T.p.paraCanvas());
  tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.colorSpace = THREE.SRGBColorSpace;
  const r = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, antialias: false });
  r.setPixelRatio(1); r.setSize(T.W * esc, T.H * esc, false); r.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(r.domElement);
  const cena = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: tex })));
  r.render(cena, cam);
  window.limites = limites;
  window.resultado = r.domElement.toDataURL('image/png');
}
