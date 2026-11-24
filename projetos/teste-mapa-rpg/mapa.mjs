// Gera a imagem do mapa inteiro (sem personagens): node projetos/teste-mapa-rpg/mapa.mjs saida.png
import fs from 'node:fs';
import { chromium } from 'playwright';
import { iniciarServidor } from '../../src/servidor.js';
const srv = await iniciarServidor({ projetoDir: 'projetos/teste-mapa-rpg' });
const b = await chromium.launch(); const pg = await b.newPage();
await pg.goto(srv.url || `http://localhost:${srv.porta}/`);
const url = await pg.evaluate(async () => {
  const { gerarMapaRPG } = await import('/motor/cenarios/mapaRPG.js');
  const m = gerarMapaRPG({}), E = 2, cv = document.createElement('canvas'); cv.width = m.W * E; cv.height = m.H * E;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(m.chao, 0, 0, m.W * E, m.H * E);
  for (const p of [...m.pecas].sort((a, b) => b.zBase - a.zBase)) g.drawImage(p.cv, p.x0 * E, p.y0 * E, p.cv.width * E, p.cv.height * E);
  return cv.toDataURL();
});
fs.writeFileSync(process.argv[2] || 'projetos/teste-mapa-rpg/saida/mapa.png', Buffer.from(url.split(',')[1], 'base64'));
await b.close(); srv.fechar?.(); process.exit(0);
