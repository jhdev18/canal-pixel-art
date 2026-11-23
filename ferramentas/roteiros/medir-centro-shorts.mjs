// Mede, por cena do Shorts (9:16), se os personagens importantes estão CENTRALIZADOS na largura (180 px internos).
// Mostra o centro horizontal deles (média ao longo da cena), o quanto sobra para fora da tela e a correção sugerida no "x" da câmera
// do Shorts (bloco "vertical"). Não gera imagem. Uso: node ferramentas/roteiros/medir-centro-shorts.mjs <projeto>
import { carregarConfig } from '../../src/config.js';
import { iniciarServidor } from '../../src/servidor.js';
import { caminhoProjeto, lerRoteiro } from '../../src/projeto.js';
import { resolverRoteiro } from '../../motor/compartilhado/linhaDoTempo.js';
import { abrirMotor } from '../../src/render.js';
const nome = process.argv[2];
const FOCO = JSON.parse(process.argv[3] || '{}');   // opcional: { "13": ["atop"] } = em qual(is) personagem(ns) centralizar naquela cena
const dir = caminhoProjeto(nome);
const r = lerRoteiro(dir);
r.resolucao = [180, 320];
for (const c of r.cenas) { for (const [k, v] of Object.entries(c.vertical || {})) c[k] = (v && typeof v === 'object' && !Array.isArray(v) && c[k] && typeof c[k] === 'object') ? { ...c[k], ...v } : v; delete c.vertical; }
const rot = resolverRoteiro(r, new Map(), { fps: 30 });
const cfg = carregarConfig();
const srv = await iniciarServidor({ projetoDir: dir });
const m = await abrirMotor({ ...cfg, permitirRenderizacaoCPU: true }, srv, rot, 'final');
const out = await m.page.evaluate((FOCO) => {
  const mo = window.motor, W = 180, res = [];
  for (const c of mo.r.cenas) {
    const cs = [], fora = [];
    for (let k = 0; k <= 8; k++) {
      const t = (c.duracao * k) / 8 * 0.98;
      mo.foto(c.inicio + t, 1);
      const bs = mo.ui.importantes(t).filter((b) => (FOCO[c.numero] ? FOCO[c.numero].includes(b.id) : b.pessoa && !b.figurante && !b.tela));   // só quem conta a história (sem figurantes/objetos)
      if (!bs.length) continue;
      const x0 = Math.min(...bs.map((b) => b.x0)), x1 = Math.max(...bs.map((b) => b.x1));
      cs.push((x0 + x1) / 2); fora.push(Math.max(0, -x0) + Math.max(0, x1 - W));
    }
    res.push({ ids: [...new Set(mo.ui.importantes(0).filter((b) => b.pessoa && !b.figurante).map((b) => b.id))].join(','), n: c.numero, zoom: c.camera?.zoom ?? 1, camx: c.camera?.x ?? 0, centro: cs.length ? cs.reduce((a, b) => a + b, 0) / cs.length : null, fora: fora.length ? Math.max(...fora) : 0 });
  }
  return res;
}, FOCO);
for (const o of out) {
  if (o.centro == null) { console.log(`cena ${o.n}: (ninguém importante)`); continue; }
  const off = o.centro - 90, dx = off / (16 * o.zoom);
  const marca = Math.abs(off) > 18 || o.fora > 4 ? '  ⚠' : '';
  console.log(`cena ${o.n} [${o.ids}]: centro ${o.centro.toFixed(0)} (meio = 90, ${off >= 0 ? '+' : ''}${off.toFixed(0)} px), fora da tela até ${o.fora.toFixed(0)} px → câmera x ${o.camx} ${dx >= 0 ? '+' : ''}${dx.toFixed(2)}${marca}`);
}
await m.browser.close(); srv.fechar?.();
