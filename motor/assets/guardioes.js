// PROTÓTIPO (aguardando aprovação): guardiões — pequenas criaturas com jeito de gente (elmo, rostinho, bracinhos)
// que FLUTUAM ao lado da cabeça de uma pessoa, com asinhas batendo e cauda de fumaça no lugar das pernas.
// Uso: { "id": "g", "personagem": "guardiao-azul", "sobre": { "id": "bia", "dx": 0.9, "dy": 1.55 } }
//   (dx segue o lado para onde a pessoa está virada). Estados: parado, feliz, alerta, dormindo.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const W = 18, H = 20, K = '#1a1c2c';

function guardiao(d, estado, f) {
  const p = new Pix(W, H);
  const asa = f % 2 === 0;
  // asinhas (atrás): abertas / meio fechadas
  const ca = d.asa || '#f4f8ff';
  if (asa) { p.elipse(3, 9, 2.6, 3.4, ca); p.elipse(15, 9, 2.6, 3.4, ca); }
  else { p.elipse(4, 11, 2, 2.4, ca); p.elipse(14, 11, 2, 2.4, ca); }
  // cauda de fumaça (no lugar das pernas)
  for (let y = 14; y < 20; y++) { const w = Math.max(0, 3 - (y - 14) * 0.55), cx = 9 + Math.round(Math.sin(f * 1.6 + y * 0.7)); for (let x = Math.round(cx - w); x <= cx + w; x++) p.set(x, y, d.cauda); }
  // corpinho (túnica) e bracinhos
  p.elipse(9, 13, 3.6, 2.8, (x, y, dx, dy) => Pix.tom([d.tunica[2], d.tunica[1], d.tunica[0]], 0.75 - dx * 0.35 - dy * 0.3, x, y));
  const by = estado === 'alerta' || estado === 'tremendo' ? 10 : 13;
  p.set(5, by, d.pele); p.set(13, by, d.pele); p.set(5, by + 1, d.pele); p.set(13, by + 1, d.pele);
  // cabeça
  p.elipse(9, 7, 4.2, 4, (x, y, dx, dy) => Pix.tom(['#d49a78', '#f2c4a0', '#ffe0c8'].map((c, i) => d.peles?.[i] || c), 0.7 - dx * 0.3 - dy * 0.3, x, y));
  // elmo + pluma
  p.elipse(9, 4.6, 4.6, 2.6, (x, y, dx) => (dx < -0.2 ? d.elmo[0] : dx > 0.4 ? d.elmo[2] : d.elmo[1]));
  p.ret(5, 5, 9, 1, d.elmo[2]);
  for (let y = 0; y < 3; y++) p.set(9 + (y === 0 ? (f % 2 ? 1 : 0) : 0), y, d.pluma);
  p.set(8, 1, d.pluma);
  // acessórios
  if (d.lanca) { for (let y = 5; y < 16; y++) p.set(15, y, '#8a5a2a'); p.set(15, 3, d.metal); p.set(15, 4, d.metal); p.set(14, 4, d.metal); p.set(16, 4, d.metal); }
  if (d.escudo) { p.elipse(4, 13, 2, 2.4, d.escudo); p.set(4, 13, d.emblema); }
  if (d.lanterna) { p.ret(14, 13, 2, 3, '#f8e070'); p.set(14, 12, K); p.set(15, 12, K); }
  p.contorno(d.contorno || K);
  // rosto
  const ol = K;
  if (estado === 'feliz' || estado === 'dormindo') { p.set(7, 8, ol); p.set(8, 7, ol); p.set(10, 7, ol); p.set(11, 8, ol); }
  else if (estado === 'alerta' || estado === 'tremendo') { p.ret(7, 6, 2, 3, ol); p.ret(10, 6, 2, 3, ol); p.set(7, 6, '#ffffff'); p.set(10, 6, '#ffffff'); }
  else if (estado === 'olhando-lado') { p.ret(5, 7, 2, 2, ol); p.ret(8, 7, 2, 2, ol); p.set(5, 7, '#ffffff'); p.set(8, 7, '#ffffff'); }
  else { p.ret(7, 7, 2, 2, ol); p.ret(10, 7, 2, 2, ol); p.set(7, 7, '#ffffff'); p.set(10, 7, '#ffffff'); }
  if (estado === 'feliz') { p.set(8, 10, '#9a3a3a'); p.set(9, 10, '#9a3a3a'); p.set(10, 10, '#9a3a3a'); }
  else if (estado === 'alerta' || estado === 'tremendo') { p.set(9, 10, '#5a2a2a'); p.set(9, 9, '#5a2a2a'); if (estado === 'tremendo') { p.set(13, 4, '#8ad0ff'); p.set(13, 5, '#5aa8e8'); } }
  else if (estado === 'olhando-lado') p.set(7, 10, '#9a3a3a');
  else if (estado !== 'dormindo') p.set(9, 10, '#9a3a3a');
  p.set(6, 9, '#f0a0a0'); p.set(12, 9, '#f0a0a0');
  // a ponta da cauda some em pontilhado
  for (let y = 17; y < H; y++) for (let x = 0; x < W; x++) if ((x + y) % 2 === 0) p.d[(y * W + x) * 4 + 3] = 0;
  return p;
}

// desloca o desenho dx pixels na horizontal (tremedeira)
function deslocar(p, dx) {
  const q = new Pix(p.w, p.h);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const nx = x + dx; if (nx < 0 || nx >= p.w) continue; const i = (y * p.w + x) * 4, j = (y * p.w + nx) * 4; q.d.set(p.d.subarray(i, i + 4), j); }
  return q;
}

export const GUARDIOES = {
  'guardiao-azul': { tunica: ['#7aa8f0', '#3a6ac8', '#24448a'], elmo: ['#f0f2f8', '#c8ccd8', '#8a90a2'], pluma: '#e83a3a', cauda: '#b8d4ff', metal: '#e8ecf4', pele: '#f2c4a0', lanca: true },
  'guardia-verde': { tunica: ['#8ad8a0', '#3a9a5a', '#246a3a'], elmo: ['#f8e0a0', '#c8a040', '#8a6a24'], pluma: '#ffffff', cauda: '#c8f0d0', pele: '#c8946a',
    peles: ['#8a5a40', '#b07a58', '#d09a78'], escudo: '#a0622a', emblema: '#f4f0e4' },
  'guardiao-chefe': { tunica: ['#c890f0', '#7a3aa0', '#4e2468'], elmo: ['#fff0a0', '#e8c040', '#a8801e'], pluma: '#4ad0e8', cauda: '#f0e0ff', asa: '#fff8d8', metal: '#fff0a0', pele: '#f2c4a0',
    lanca: true, escudo: '#c8ccd8', emblema: '#e8c040' },
  'guardiao-noturno': { tunica: ['#6a6aa0', '#2e2e52', '#1c1c30'], elmo: ['#9a9ab4', '#6a6a82', '#44445a'], pluma: '#9a5ad8', cauda: '#8a8ab8', asa: '#c8c8e8', pele: '#c88a64',
    peles: ['#a06a48', '#c88a64', '#e0a882'], lanterna: true, contorno: '#0c0c18' },
};

registrarSprites(Object.fromEntries(Object.entries(GUARDIOES).map(([k, d]) => [k, () => {
  const quadros = [], anims = {};
  // tremendo e olhando-lado: PROTÓTIPO (leva 3)
  for (const est of ['parado', 'feliz', 'alerta', 'dormindo', 'tremendo', 'olhando-lado']) {
    const ini = quadros.length;
    for (let f = 0; f < 4; f++) quadros.push(est === 'tremendo' ? deslocar(guardiao(d, est, f), f % 2 ? 1 : -1) : guardiao(d, est, f));
    anims[est] = { q: [ini, ini + 1, ini + 2, ini + 3], fps: est === 'dormindo' ? 3 : est === 'alerta' ? 10 : est === 'tremendo' ? 16 : 6 };
  }
  anims.andando = anims.correndo = anims.parado;
  const s = { quadros, anims, sombra: false, flutua: true };
  if (d.lanterna) s.luz = { cor: '#ffe080', intensidade: 0.7, alcance: 2.5 };
  return s;
}])), { grupo: 'Guardiões', status: 'protótipo' });
