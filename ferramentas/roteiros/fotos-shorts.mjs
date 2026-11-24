// Fotos paradas no formato SHORTS (9:16), COM a legenda, para conferir se a legenda cobre alguém (sem renderizar vídeo).
//   node ferramentas/roteiros/fotos-shorts.mjs <projeto> [cena cena ...]
// Duas fotos por cena (a ~40% e ~85% da duração) em projetos/<projeto>/saida/fotos-shorts/ + folha.png com todas.
import fs from 'node:fs';
import path from 'node:path';
import { carregarConfig } from '../../src/config.js';
import { iniciarServidor } from '../../src/servidor.js';
import { caminhoProjeto, lerRoteiro } from '../../src/projeto.js';
import { resolverRoteiro } from '../../motor/compartilhado/linhaDoTempo.js';
import { abrirMotor } from '../../src/render.js';

const nome = process.argv[2];
if (!nome) throw new Error('Uso: node ferramentas/roteiros/fotos-shorts.mjs <projeto> [cenas]');
const so = process.argv.slice(3).map(Number);
const dir = caminhoProjeto(nome);
const r = lerRoteiro(dir);
r.resolucao = [180, 320];
for (const c of r.cenas) {   // aplica o bloco "vertical" de cada cena e de cada ação (igual ao render do Shorts)
  for (const [k, v] of Object.entries(c.vertical || {})) c[k] = (v && typeof v === 'object' && !Array.isArray(v) && c[k] && typeof c[k] === 'object') ? { ...c[k], ...v } : v;
  delete c.vertical;
  c.acoes = (c.acoes || []).map(({ vertical: va, ...a }) => (va ? { ...a, ...va } : a));
}
const rot = resolverRoteiro(r, new Map(), { fps: 30 });
const saida = path.join(dir, 'saida', 'fotos-shorts');
fs.rmSync(saida, { recursive: true, force: true });
fs.mkdirSync(saida, { recursive: true });
const srv = await iniciarServidor({ projetoDir: dir });
const m = await abrirMotor({ ...carregarConfig(), permitirRenderizacaoCPU: true }, srv, rot, 'final');
const arquivos = [];
try {
  for (const c of rot.cenas) {
    if (so.length && !so.includes(c.numero)) continue;
    for (const [k, f] of [0.4, 0.85].entries()) {
      const url = await m.page.evaluate(([T]) => window.motor.foto(T, 2), [c.inicio + c.duracao * f]);
      const arq = path.join(saida, `${String(c.numero).padStart(2, '0')}${'ab'[k]}.png`);
      fs.writeFileSync(arq, Buffer.from(url.split(',')[1], 'base64'));
      arquivos.push(arq);
    }
  }
  const folha = await m.page.evaluate(async (lista) => {
    const imgs = await Promise.all(lista.map((u) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = u; })));
    const w = imgs[0].width / 2, h = imgs[0].height / 2, cols = 8, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cols * (w + 6) + 6; cv.height = rows * (h + 6) + 6;
    const g = cv.getContext('2d'); g.fillStyle = '#101018'; g.fillRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false;
    imgs.forEach((im, i) => g.drawImage(im, 6 + (i % cols) * (w + 6), 6 + Math.floor(i / cols) * (h + 6), w, h));
    return cv.toDataURL('image/png');
  }, arquivos.map((a) => 'data:image/png;base64,' + fs.readFileSync(a).toString('base64')));
  fs.writeFileSync(path.join(saida, 'folha.png'), Buffer.from(folha.split(',')[1], 'base64'));
  console.log(`✔ ${arquivos.length} fotos em ${saida} (folha.png com todas)`);
} finally { await m.browser.close(); srv.fechar?.(); }
