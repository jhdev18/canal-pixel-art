// Palcos 3D para a vista "3d": personagens e objetos 2D (sprites) em pé num mundo 3D de verdade
// (chão, paredes e luz em 3D), com a câmera fixa inclinada para baixo — nunca gira para os lados.
// Coordenadas: x = lateral, z = profundidade (negativo = fundo, positivo = perto da câmera), y = altura.
// 1 unidade = 16 px de textura (mesma densidade dos sprites).
import * as THREE from 'three';
import { Pix, bayer } from '../pixel.js';
import { rng } from '../compartilhado/util.js';
import { PRESETS_INTERIORES, pintarComodo } from './interiores.js';
import { construirObjetos } from './objetos3d.js';

const texDe = (pix, repetir = false) => {
  const t = new THREE.CanvasTexture(pix.paraCanvas());
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.NoColorSpace;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
const mat = (pix) => new THREE.MeshLambertMaterial({ map: texDe(pix) });
const misturar = (hex, alvo, k) => {
  const a = parseInt(hex.slice(1), 16), b = parseInt(alvo.slice(1), 16);
  return '#' + [16, 8, 0].map((s) => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k).toString(16).padStart(2, '0')).join('');
};

// ------------------------------------------------------------------ pisos vistos de cima
function piso(estilo, c, w, h, tapetes, r) {
  const p = new Pix(w, h), [t0, t1, t2] = c.topo, [d0, d1] = c.terra;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let cor;
    if (estilo === 'taco') {
      const fila = Math.floor(y / 6), jj = (x + fila * 37) % 48;
      cor = y % 6 === 5 || jj === 0 ? t2 : y % 6 === 0 ? t0 : (fila % 2 ? t1 : (bayer(x, y) < 0.1 ? t2 : t1));
    } else if (estilo === 'piso') {
      cor = x % 16 === 0 || y % 16 === 0 ? t2 : ((Math.floor(x / 16) + Math.floor(y / 16)) % 2 ? t1 : d0);
    } else if (estilo === 'grama') {
      const v = r();
      cor = v < 0.06 ? c.topo[0] : v < 0.12 ? d1 : (bayer(x, y) < 0.35 ? t1 : d0);
      if (r() < 0.004) cor = ['#f0e060', '#f4f4f4', '#e86a8a'][Math.floor(r() * 3)];      // florzinhas
    } else cor = bayer(x, y) < 0.25 ? d1 : d0;
    p.set(x, y, cor);
  }
  for (const tp of tapetes || []) {
    const x0 = Math.round(tp.x0), y0 = Math.round(tp.y0);
    for (let y = 0; y < tp.h; y++) for (let x = 0; x < tp.w; x++) {
      const b = Math.min(x, y, tp.w - 1 - x, tp.h - 1 - y);
      const cor = b < 1 ? tp.cor[2] : b < 4 && (x + y) % 4 < 2 ? tp.cor[2] : (bayer(x, y) < 0.2 ? tp.cor[0] : tp.cor[1]);
      p.set(x0 + x, y0 + y, cor);
    }
  }
  return p;
}
// sombra suave (oclusão) junto às paredes, pintada no piso
function ocluir(p, lados) {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const d = Math.min(lados.fundo ? y : 99, lados.esq ? x : 99, lados.dir ? p.w - 1 - x : 99);
    if (d > 7) continue;
    const i = (y * p.w + x) * 4, k = d < 3 ? 0.78 : d < 7 && bayer(x, y) > (d - 3) / 4 ? 0.88 : 1;
    p.d[i] *= k; p.d[i + 1] *= k; p.d[i + 2] *= k;
  }
}

// ------------------------------------------------------------------ palcos prontos
// Paredes: decoração em px na textura (parede do fundo = 320 px = 20 unidades; laterais = profundidade).
export const PALCOS = {
  'quarto-menino': { estilo: 'quarto-menino', fundo: { janelas: [{ x: 36, w: 44, h: 40, cortina: ['#e8a040', '#c07820'] }],
      quadros: [{ x: 150, w: 22, h: 30, altura: 62, tipo: 'poster', cores: ['#c83c4c', '#a82a3c'], estrela: true }, { x: 196, w: 30, h: 20, altura: 70, tipo: 'paisagem' }] },
    dir: { portas: [{ x: 60, w: 30, h: 76 }] }, tapetes: [{ x: 0, z: -1.2, w: 6, d: 3.2, cor: ['#5a8ae0', '#3a6ac8', '#f0d090'] }],
    objetos: [{ tipo: 'cama', x: -6.4, z: -4.9 }, { tipo: 'criado-mudo', x: -3.5, z: -5.45 }, { tipo: 'bau-brinquedos', x: -0.6, z: -5.35 },
      { tipo: 'escrivaninha', x: 3.4, z: -5.3 }, { tipo: 'cadeira-gamer', x: 3.6, z: -4.2 }, { tipo: 'guarda-roupa', x: 7.8, z: -5.3 }, { tipo: 'bola', x: -1.8, z: 0.8 }] },
  'quarto-menino-noite': { base: 'quarto-menino', noite: true },
  'sala-aula': { estilo: 'sala-aula', fundo: { janelas: [{ x: 14, w: 52, h: 38 }, { x: 254, w: 52, h: 38 }],
      quadros: [{ x: 90, w: 20, h: 26, altura: 70, tipo: 'poster', cores: ['#f0d040', '#e8b030'], estrela: true }] },
    dir: { portas: [{ x: 50, w: 30, h: 78, cor: ['#c89a5a', '#a87a42', '#6a4a24'] }] },
    objetos: [{ tipo: 'lousa', x: 1, y: 1.5, z: -6 }, { tipo: 'cartaz-alfabeto', x: 1, y: 4.75, z: -6 }, { tipo: 'relogio-parede', x: 5.2, y: 4.4, z: -6 },
      { tipo: 'estante-livros', x: -4.6, z: -5.5 }, { tipo: 'mesa-professor', x: -7.2, z: -4.2 },
      ...[-1.5, 2, 5.5].flatMap((x) => [-2.8, -0.2].map((z) => ({ tipo: 'carteira', x, z })))] },
  'sala-estar': { estilo: 'sala-estar', fundo: { janelas: [{ x: 22, w: 56, h: 44, cortina: ['#b83a4a', '#8a2a3a'] }],
      quadros: [{ x: 138, w: 34, h: 22, altura: 74, tipo: 'paisagem' }, { x: 182, w: 22, h: 16, altura: 78, tipo: 'familia' }] },
    esq: { portas: [{ x: 70, w: 30, h: 78, cor: ['#f4f0e8', '#e0d8c8', '#a8a090'] }] }, tapetes: [{ x: 2.4, z: -3.2, w: 7, d: 3, cor: ['#c85a5a', '#a83a3a', '#f0d090'] }],
    objetos: [{ tipo: 'tv-rack', x: -6.8, z: -5.45 }, { tipo: 'estante-sala', x: -3.0, z: -5.5 }, { tipo: 'luminaria-pe', x: -1.0, z: -5.4 },
      { tipo: 'sofa', x: 2.4, z: -5.1 }, { tipo: 'mesa-centro', x: 2.4, z: -3.0 }, { tipo: 'poltrona', x: 7.0, z: -4.4 }, { tipo: 'planta-vaso', x: 9.1, z: -5.4 }] },
  praca: { externo: true, objetos: [
    { tipo: 'predio', sprite: 'escola', x: -12, z: -9, escala: 1.3 }, { tipo: 'predio', sprite: 'padaria', x: 1, z: -9.5, escala: 1.3 },
    { tipo: 'predio', sprite: 'mercado', x: 14.5, z: -9, escala: 1.3 },
    { tipo: 'banco-praca', x: -3, z: -2.6 }, { tipo: 'banco-praca', x: 5, z: -2.6 }, { tipo: 'poste', x: -7, z: -2.2 }, { tipo: 'poste', x: 9, z: -2.2 },
    { tipo: 'hidrante', x: 1.5, z: -2.3 }] },
  'praca-noite': { base: 'praca', noite: true },
};

// Monta o palco. Retorna { grupo, ambiente, fundo (cor do vazio/céu), noite, externo }.
export function gerarPalco3d(opc = {}) {
  let def = PALCOS[opc.tipo] || PALCOS['quarto-menino'];
  if (def.base) def = { ...PALCOS[def.base], ...def };
  const cfg = { ...def, ...opc };
  const noite = opc.periodo ? opc.periodo === 'noite' : !!cfg.noite;
  const r = rng(cfg.semente ?? 7);
  const grupo = new THREE.Group();
  if (cfg.externo) return praca(grupo, cfg, noite, r);

  const lat = PRESETS_INTERIORES[cfg.estilo];
  const par = { ...lat.camadas[0], noite }, chao = lat.chao;
  const L = cfg.largura ?? 20, Z0 = -6, Z1 = 3, D = Z1 - Z0, ALT = 104;   // ALT em px (6,5 unidades)
  const A = ALT / 16;
  // piso
  const tapetes = (cfg.tapetes || []).map((t) => ({ ...t, x0: (t.x - t.w / 2 + L / 2) * 16, y0: (t.z - t.d / 2 - Z0) * 16, w: t.w * 16, h: t.d * 16 }));
  const pPiso = piso(chao.estilo, chao, L * 16, D * 16, tapetes, r);
  ocluir(pPiso, { fundo: true, esq: true, dir: true });
  const mPiso = new THREE.Mesh(new THREE.PlaneGeometry(L, D), mat(pPiso));
  mPiso.rotation.x = -Math.PI / 2; mPiso.position.set(0, 0, (Z0 + Z1) / 2); grupo.add(mPiso);
  // borda da frente (espessura do piso, como num corte de maquete)
  const borda = new THREE.Mesh(new THREE.BoxGeometry(L + 0.5, 0.5, 0.25), new THREE.MeshLambertMaterial({ color: chao.topo[2] }));
  borda.position.set(0, -0.25, Z1 + 0.12); grupo.add(borda);
  // paredes: pintadas com o mesmo pintor da vista lateral
  const parede = (w, dec) => { const p = new Pix(w, ALT); pintarComodo(p, { ...par, janelas: [], portas: [], quadros: [], ...dec, base: ALT }, r() * 1e6 | 0); return p; };
  const pf = parede(L * 16, cfg.fundo);
  const mF = new THREE.Mesh(new THREE.PlaneGeometry(L, A), mat(pf)); mF.position.set(0, A / 2, Z0); grupo.add(mF);
  for (const [lado, sx] of [['esq', -1], ['dir', 1]]) {
    const p = parede(D * 16, cfg[lado]);
    // escurece um pouco as laterais (recebem menos luz)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(D, A), mat(p));
    m.rotation.y = -sx * Math.PI / 2; m.position.set(sx * L / 2, A / 2, (Z0 + Z1) / 2); grupo.add(m);
  }
  // topo das paredes (corte)
  const corte = new THREE.MeshLambertMaterial({ color: '#4a3e4c' });
  const cF = new THREE.Mesh(new THREE.BoxGeometry(L + 0.5, 0.12, 0.25), corte); cF.position.set(0, A + 0.06, Z0 - 0.12); grupo.add(cF);
  for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, D + 0.25), corte); c.position.set(sx * (L / 2 + 0.12), A + 0.06, (Z0 + Z1) / 2 - 0.12); grupo.add(c); }
  // luz das janelas: poças de luz de verdade no chão e nos personagens
  for (const j of cfg.fundo?.janelas || []) {
    const x = (j.x + j.w / 2) / 16 - L / 2;
    const luz = new THREE.PointLight(noite ? '#7a8ae0' : '#fff0d0', (noite ? 0.5 : 0.9) * Math.PI, 9, 1.2);
    luz.position.set(x, 3.6, Z0 + 1.2); grupo.add(luz);
  }
  objetosELuzes(grupo, cfg, noite);
  return { grupo, noite, externo: false, fundo: noite ? '#0c0c18' : '#1c1a26',
    ambiente: noite ? ['#6a74b0', 0.36] : ['#ffffff', 0.66], limites: { x: L / 2, z0: Z0, z1: Z1 } };
}

// Praça ao ar livre: grama, caminho de pedras e "fundo" de prédios/árvores (sprites, no roteiro).
function praca(grupo, cfg, noite, r) {
  const L = 64, Z0 = -16, Z1 = 10, D = Z1 - Z0;
  const cores = { topo: ['#8ad06a', '#5aa04a', '#3a7a3a'], terra: ['#4a9044', '#3e8040'] };
  const p = piso('grama', cores, L * 16, D * 16, [], r);
  // caminho de pedras ao longo de x (onde os personagens andam: z de -1,6 a 1,6)
  const ya = (-1.6 - Z0) * 16, yb = (1.6 - Z0) * 16;
  for (let y = Math.floor(ya); y < yb; y++) for (let x = 0; x < p.w; x++) {
    const bordaC = y - ya < 2 || yb - y < 2;
    const lin = Math.floor((y - ya) / 7), pedra = ((x + lin * 5) % 12 === 0) || (y - ya) % 7 === 0;
    p.set(x, y, bordaC ? '#8a8a7a' : pedra ? '#a8a090' : (bayer(x, y) < 0.15 ? '#c8c0a8' : '#d8d0b8'));
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(L, D), mat(p));
  m.rotation.x = -Math.PI / 2; m.position.set(0, 0, (Z0 + Z1) / 2); grupo.add(m);
  objetosELuzes(grupo, cfg, noite, true);
  return { grupo, noite, externo: true, fundo: null,
    ambiente: noite ? ['#7078b8', 0.42] : ['#ffffff', 0.7], neblina: noite ? ['#141638', 26, 48] : ['#a4d0f4', 30, 56], limites: { x: L / 2, z0: Z0, z1: Z1 } };
}
// Móveis/prédios 3D + luzes: uma luz direcional (de cima, da esquerda e da frente) dá volume às caixas
// (topo mais claro, frente média, lado mais escuro); abajures, TVs e postes acendem PointLights.
function objetosELuzes(grupo, cfg, noite, externo = false) {
  const ctx = { luzes: [], noite };
  construirObjetos(grupo, cfg.objetos, ctx);
  for (const l of ctx.luzes) { const L = new THREE.PointLight(l.cor, l.forca * Math.PI, l.alcance, 1.2); L.position.set(l.x, l.y, l.z); grupo.add(L); }
  const sol = new THREE.DirectionalLight(noite ? '#8090d0' : '#fff4e0', (noite ? 0.18 : externo ? 0.5 : 0.42) * Math.PI);
  sol.position.set(-4, 10, 6); grupo.add(sol); grupo.add(sol.target);
}
export { misturar };
