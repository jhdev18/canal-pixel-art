// Gera a arte do canal: node projetos/canal/arte/gerar.mjs [saida.png]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { iniciarServidor } from '../../../src/servidor.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const saida = path.resolve(process.argv[2] || path.join(AQUI, '..', 'banner.png'));
const srv = await iniciarServidor({ projetoDir: AQUI });
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('Erro na página:', e.message));
  await page.goto(`${srv.url}/projeto/banner.html`);
  await page.waitForFunction(() => window.resultado, null, { timeout: 60000 });
  const { url, limites } = await page.evaluate(() => ({ url: window.resultado, limites: window.limites }));
  fs.writeFileSync(saida, Buffer.from(url.split(',')[1], 'base64'));
  const seguro = { x0: 127, x1: 513, y0: 127, y1: 233 };
  for (const l of limites) {
    const ok = l.x0 >= seguro.x0 && l.x1 <= seguro.x1 && l.y0 >= seguro.y0 && l.y1 <= seguro.y1;
    console.log(`${l.texto}: x ${l.x0}-${l.x1}, y ${l.y0}-${l.y1} ${ok ? 'dentro da área segura' : 'FORA da área segura'}`);
  }
  console.log('Salvo em', saida);
} finally { await browser.close(); await srv.fechar(); }
