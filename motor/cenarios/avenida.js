// Avenida em PERSPECTIVA: rua indo para o fundo, prédios dos dois lados, postes acesos e carros.
// A câmera nunca gira; só avança, recua, sobe ou desce — os pixels seguem alinhados à tela.
import * as THREE from 'three';
import { Pix, bayer } from '../pixel.js';
import { rng } from '../compartilhado/util.js';

const T = 16;
const tex = (canvas) => { const t = new THREE.CanvasTexture(canvas); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.NoColorSpace; return t; };

const CORES = [[['#7a4a4a', '#6a3a3e', '#4a2a30'], ['#e8e0d0', '#c83c4c']], [['#4a5a7a', '#3e4c6a', '#2a3450'], ['#e8e0d0', '#3aa868']],
  [['#8a7a5a', '#7a6a4c', '#5a4c36'], ['#e8e0d0', '#3a6ac8']], [['#5a4a6a', '#4c3e5c', '#342a42'], ['#f0d040', '#5a3a6a']], [['#6a6a5a', '#5a5a4c', '#3e3e34'], ['#e8e0d0', '#e87a3a']]];

function fachada(w, h, cor, r, loja, noite) {
  const pw = w * T, ph = h * T, p = new Pix(pw, ph), brilho = new Pix(pw, ph);
  for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) p.set(x, y, (y % 4 === 0 || (x + (Math.floor(y / 4) % 2) * 4) % 8 === 0) ? cor[1] : cor[0]);
  for (let x = 0; x < pw; x++) { p.set(x, 0, cor[2]); p.set(x, 1, '#d8d0c0'); p.set(x, 2, '#d8d0c0'); p.set(x, 3, cor[2]); }
  for (let andar = 1; andar * 24 + 10 < ph - 22; andar++) {
    const y = andar * 24 - 10;
    for (let x = 6; x + 10 < pw; x += 16) {
      const acesa = noite && r() < 0.55;
      for (let j = 0; j < 12; j++) for (let i = 0; i < 9; i++) {
        const c = j === 0 || i === 0 || i === 8 || j === 11 ? '#2a2638' : acesa ? (j < 3 ? '#fff4c0' : '#ffd860') : (j < 4 ? '#6a7aa0' : '#26304e');
        p.set(x + i, y + j, c); if (acesa && c !== '#2a2638') brilho.set(x + i, y + j, c);
      }
      for (let i = 0; i < 9; i++) { p.set(x + i, y + 12, '#d8d0c0'); p.set(x + i, y - 1, cor[2]); }
    }
  }
  const yb = ph - 22;
  for (let x = 0; x < pw; x++) for (let k = 0; k < 5; k++) p.set(x, yb + k, k === 4 ? '#2a2026' : (Math.floor(x / 6) % 2 ? loja[0] : loja[1]));
  for (let j = 6; j < 22; j++) for (let i = 4; i < 14; i++) p.set(i, yb + j, j === 6 || i === 4 || i === 13 ? '#2a2638' : '#5a3a2a');
  p.set(11, yb + 14, '#f8d040');
  for (let j = 7; j < 18; j++) for (let i = 18; i < pw - 6; i++) {
    const borda = j === 7 || i === 18 || i === pw - 7 || j === 17;
    const c = borda ? '#2a2638' : noite ? (j < 10 ? '#fff0c0' : '#ffcc66') : (j < 11 ? '#a8c8e0' : '#6a8aa8');
    p.set(i, yb + j, c); if (!borda && noite) brilho.set(i, yb + j, c);
  }
  return { cor: tex(p.paraCanvas()), brilho: tex(brilho.paraCanvas()) };
}
function telhado(w, d, cor) {
  const p = new Pix(w * T, d * T);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) p.set(x, y, x < 2 || y < 2 || x >= p.w - 2 || y >= p.h - 2 ? '#7a7a8a' : (bayer(x, y) < 0.1 ? '#4a4a5a' : '#3e3e4c'));
  p.ret(6, 6, 10, 7, '#8a8a98'); p.ret(7, 5, 8, 1, '#a8a8b4');
  return tex(p.paraCanvas());
}
function lateral(h, d, cor) { const p = new Pix(d * T, h * T); for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) p.set(x, y, y % 4 === 0 ? cor[2] : cor[1]); return tex(p.paraCanvas()); }

function carro(corHex) {
  const g = new THREE.Group();
  const c = (hex) => new THREE.MeshLambertMaterial({ color: hex });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.55, 1.2), c(corHex)); corpo.position.y = 0.45; g.add(corpo);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.05), [c(0x5a8ac8), c(0x5a8ac8), c(corHex), c(0), c(0x7aaae0), c(0x7aaae0)]); cab.position.set(-0.2, 0.95, 0); g.add(cab);
  for (const [dx, dz] of [[-0.85, 0.6], [0.85, 0.6], [-0.85, -0.6], [0.85, -0.6]]) { const rd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.15), c(0x1a1a22)); rd.position.set(dx, 0.2, dz); g.add(rd); }
  for (const z of [0.35, -0.35]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff0b0 })); f.position.set(1.31, 0.5, z); g.add(f); const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: 0xff3030 })); l.position.set(-1.31, 0.5, z); g.add(l); }
  return g;
}

// opc: { periodo, comprimento, carros, distanciaPostes, semente }
// Retorna objetos 3D + posições dos postes (para os sprites) + atualizar(t) dos carros.
export function gerarAvenida(opc = {}) {
  const noite = (opc.periodo ?? 'noite') === 'noite';
  const comp = opc.comprimento ?? 80, ZI = 12, ZF = ZI - comp;
  const r = rng(opc.semente ?? 4);
  const grupo = new THREE.Group();
  // chão: |x|<3 asfalto, 3..3.3 meio-fio, 3.3..6 calçada
  const L = 12, p = new Pix(L * T, comp * T);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const ux = x / T - 6, uz = y / T, ax = Math.abs(ux);
    let c;
    if (ax < 3) {
      const v = r(); c = v < 0.08 ? '#44465a' : v < 0.14 ? '#2a2a36' : '#363846';
      if (ax < 0.08 && (uz % 2) < 1.1) c = '#e8c040';
      if (opc.faixaPedestre !== false && uz > 4 && uz < 6.5 && Math.floor((ux + 3) * 2) % 2 === 0) c = '#e4e4ec';
    } else if (ax < 3.3) c = ax < 3.15 ? '#b4b6c4' : '#9a9cac';
    else c = ((x % 8 === 0) || (y % 8 === 0)) ? '#5e6074' : (bayer(x, y) < 0.06 ? '#8e90a2' : '#7a7c90');
    p.set(x, y, c);
  }
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(L, comp), new THREE.MeshLambertMaterial({ map: tex(p.paraCanvas()) }));
  chao.rotation.x = -Math.PI / 2; chao.position.set(0, 0, ZI - comp / 2);
  grupo.add(chao);
  // prédios
  for (const lado of [-1, 1]) {
    let z = ZI, i = lado > 0 ? 2 : 0;
    while (z > ZF + 6) {
      const w = 4 + (i * 7) % 3, h = 4 + (i * 5) % 4, d = 4;
      const [cor, loja] = CORES[i % CORES.length];
      const f = fachada(w, h, cor, rng(50 + i + (lado > 0 ? 100 : 0)), loja, noite), lat = lateral(h, d, cor);
      const M = (o) => new THREE.MeshLambertMaterial(o);
      const mats = [M({ map: lat }), M({ map: lat }), M({ map: telhado(w, d, cor) }), M({ color: 0 }), M({ map: f.cor, emissiveMap: f.brilho, emissive: new THREE.Color(1, 1, 1) }), M({ map: lat })];
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
      m.rotation.y = lado < 0 ? Math.PI / 2 : -Math.PI / 2;
      m.position.set(lado * (6 + d / 2), h / 2, z - w / 2);
      grupo.add(m);
      z -= w; i++;
    }
  }
  const postes = [];
  const passo = opc.distanciaPostes ?? 9;
  for (const lado of [-1, 1]) for (let z = ZI - 6; z > ZF; z -= passo) postes.push({ x: lado * 3.8, z });
  // carros (movimento determinístico em função do tempo)
  const carros = [];
  if (opc.carros !== false) {
    const c1 = carro(0xc83c4c); c1.rotation.y = Math.PI / 2; grupo.add(c1); carros.push({ g: c1, x: 1.5, z0: -6, v: -3.2 });
    const c2 = carro(0x3a6ac8); c2.rotation.y = -Math.PI / 2; grupo.add(c2); carros.push({ g: c2, x: -1.5, z0: ZF + 10, v: 4.0 });
  }
  const ciclo = comp - 10;
  return {
    grupo, postes, noite,
    ceu: noite ? '#0c0c22' : '#8ac4f0',
    neblina: noite ? ['#0c0c22', 25, 75] : ['#a8d4f4', 40, 90],
    ambiente: noite ? ['#8a90c8', 0.55] : ['#ffffff', 1.0],
    atualizar(t) {
      for (const c of carros) {
        let z = c.z0 + c.v * t;
        z = ZF + 5 + ((((z - (ZF + 5)) % ciclo) + ciclo) % ciclo);
        c.g.position.set(c.x, 0, z);
      }
    },
  };
}
