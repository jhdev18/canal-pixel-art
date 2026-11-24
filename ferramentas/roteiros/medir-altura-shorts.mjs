// mede, por cena do Shorts, o quanto baixar/subir a câmera para nada importante ficar na faixa da legenda (76% da altura)
import { carregarConfig } from '../../src/config.js';
import { iniciarServidor } from '../../src/servidor.js';
import { caminhoProjeto, lerRoteiro } from '../../src/projeto.js';
import { resolverRoteiro } from '../../motor/compartilhado/linhaDoTempo.js';
import { abrirMotor } from '../../src/render.js';
const nome = process.argv[2];
const dir = caminhoProjeto(nome);
const r = lerRoteiro(dir);
r.resolucao = [180, 320];
for (const c of r.cenas) { for (const [k, v] of Object.entries(c.vertical || {})) c[k] = (v && typeof v === 'object' && !Array.isArray(v) && c[k] && typeof c[k] === 'object') ? { ...c[k], ...v } : v; delete c.vertical; c.acoes = (c.acoes || []).map(({ vertical: va, ...a }) => (va ? { ...a, ...va } : a)); }
const DY = [0, -0.25, -0.5, -0.75, -1, -1.25, -1.5, -1.75, -2, -2.25, -2.5, -2.75, -3, -3.25, -3.5];
const base = r.cenas;
r.cenas = base.flatMap((c, i) => DY.map((dy) => {
  const n = JSON.parse(JSON.stringify(c));
  n.acoes = (n.acoes || []).map((ac) => (ac.tipo === 'corte' && ac.y != null ? { ...ac, y: ac.y + dy } : ac));   // o corte de zoom desce junto
  return { ...n, _i: i + 1, _dy: dy, camera: { ...(c.camera || {}), y: (c.camera?.y ?? (c.comodo ? 3 : 2.2)) + dy } };
}));
const rot = resolverRoteiro(r, new Map(), { fps: 30 });
const cfg = carregarConfig();
const srv = await iniciarServidor({ projetoDir: dir });
const m = await abrirMotor({ ...cfg, permitirRenderizacaoCPU: true }, srv, rot, 'final');
const out = await m.page.evaluate(() => {
  const mo = window.motor, H = 320, res = [];
  for (const c of mo.r.cenas) {
    let area = 0, topo = 999;
    for (let k = 0; k <= 6; k++) {
      const t = (c.duracao * k) / 6 * 0.98;
      mo.foto(c.inicio + t, 1);
      // a legenda fica a 76% (80% com zoom ≥ 1,5, inclusive depois de um corte de zoom) — motor/ui.js
      const cortes = c.acoes.filter((a) => a.tipo === 'camera' && a.corte && a.inicio <= t);
      const zoom = cortes.length ? (cortes[cortes.length - 1].para?.zoom ?? 1) : (c.camera?.zoom ?? 1);
      const L = zoom >= 1.5 ? 0.8 : 0.76;
      for (const b of mo.ui.importantes(t)) {
        if (b.figurante || b.tela) continue;   // figurante passando e detalhe em close não contam
        area += Math.max(0, Math.min(174, b.x1) - Math.max(6, b.x0)) * Math.max(0, Math.min(H * L + 12, b.y1) - Math.max(H * L - 12, b.y0));
        topo = Math.min(topo, b.y0);
      }
    }
    res.push([c._i, c._dy, Math.round(area), Math.round(topo)]);
  }
  return res;
});
const porCena = {};
for (const [i, dy, area, topo] of out) (porCena[i] ||= []).push({ dy, area, topo });
if (process.argv[3]) for (const x of porCena[process.argv[3]]) console.log(x);
for (const [i, l] of Object.entries(porCena)) {
  const ok = l.filter((x) => x.area === 0 && x.topo >= 2).sort((a, b) => Math.abs(a.dy) - Math.abs(b.dy))[0];
  const min = l.filter((x) => x.topo >= 2).sort((a, b) => a.area - b.area)[0] || [...l].sort((a, b) => a.area - b.area)[0];
  console.log(`cena ${i}: ${ok ? `dy ${ok.dy}` : `SEM SOLUÇÃO (menor: dy ${min.dy}, cobre ${min.area})`}   (dy 0: cobre ${l[0].area}, topo ${l[0].topo})`);
}
await m.browser.close(); srv.fechar?.();
