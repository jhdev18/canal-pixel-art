// "Mundo sombrio" para a vista LATERAL (teste): céu preto, colunas e blocos flutuando em poucas cores,
// borda neon nas formas e chão de placas com uma linha brilhante. Personagens mantêm as cores normais.
import { bayer } from '../pixel.js';
import { rng } from '../compartilhado/util.js';

// Camada 'pilares': colunas (algumas flutuando) + losangos soltos. base = linha do chão no desenho.
export function pintarPilares(p, c, s) {
  const r = rng(s), W = p.w, base = (c.acima ?? 80) + 30;   // mesma conta de criarFundo (topo = chão - acima - 30)
  const [escuro, corpo, borda] = c.cores;
  const set = (x, y, cor) => p.set(((Math.round(x) % W) + W) % W, y, cor);
  for (let k = 0; k < (c.quantidade ?? 9); k++) {
    const x0 = Math.floor((k + r() * 0.6) * W / (c.quantidade ?? 9)), w = 10 + Math.floor(r() * (c.largura ?? 18));
    const alt = (c.acima ?? 80) * (0.45 + r() * 0.55), flut = r() < 0.5 ? 6 + Math.floor(r() * 18) : 0;
    const y1 = base - flut, y0 = Math.round(y1 - alt);
    for (let y = y0; y < y1; y++) for (let i = 0; i < w; i++) {
      let cor = corpo;
      if (i < 2) cor = borda;                                      // aresta iluminada
      else if (i > w - 4) cor = escuro;
      else if ((y - y0) % 18 === 17) cor = escuro;                  // juntas dos blocos
      else if (bayer(i, y) < 0.08) cor = escuro;
      set(x0 + i, y, cor);
    }
    for (let i = -1; i <= w; i++) { set(x0 + i, y0 - 1, c.neon); set(x0 + i, y0, borda); }   // topo neon
    if (flut) for (let i = 2; i < w - 2; i += 3) set(x0 + i, y1 + 2 + (i % 2), escuro);       // "pedrinhas" soltas embaixo
    if (c.runas && r() < 0.6) { const yy = y0 + 10 + Math.floor(r() * Math.max(1, alt - 24)); for (const [dx, dy] of [[0, 0], [1, 1], [2, 0], [1, -1], [1, 0]]) set(x0 + Math.floor(w / 2) - 1 + dx, yy + dy, c.neon); }
  }
  // losangos flutuando
  for (let k = 0; k < (c.losangos ?? 6); k++) {
    const cx = r() * W, cy = base - (c.acima ?? 80) * (0.4 + r() * 0.7), t = 3 + Math.floor(r() * 4);
    for (let dy = -t; dy <= t; dy++) for (let dx = -(t - Math.abs(dy)); dx <= t - Math.abs(dy); dx++) set(cx + dx, Math.round(cy + dy), Math.abs(dx) + Math.abs(dy) === t ? c.neon : dx < 0 ? borda : corpo);
  }
}

export const PRESETS_SOMBRIOS = {
  'mundo-sombrio': {
    ceu: { cores: ['#020106', '#06030f', '#0c0620', '#140a30'] },
    estrelas: 26,
    camadas: [
      { tipo: 'pilares', z: -90, acima: 110, cores: ['#0a0618', '#120a28', '#1c1240'], neon: '#2a1e5a', quantidade: 7, largura: 26, losangos: 4 },
      { tipo: 'pilares', z: -40, acima: 84, cores: ['#120a26', '#22144a', '#3a2470'], neon: '#4af0e0', quantidade: 6, largura: 20, losangos: 5, runas: true },
      { tipo: 'pilares', z: -14, acima: 40, cores: ['#0a0614', '#1a0e34', '#2e1a5a'], neon: '#ff5ad0', quantidade: 5, largura: 14, losangos: 0, iluminada: true },
    ],
    chao: { estilo: 'neon', topo: ['#4af0e0', '#1e8a8a', '#2c1858'], terra: ['#1c0f3a', '#0c0620'] },
    primeiroPlano: { cor: '#000000', estilo: 'pedras' },
    ambiente: ['#ffffff', 1.0],
    clima: 'vagalumes',
  },
};
