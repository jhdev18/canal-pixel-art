// Servidor HTTP mínimo: serve o motor, o three.js e os arquivos do projeto.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.css': 'text/css',
};

function dentro(base, alvo) {
  const rel = path.relative(base, alvo);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

export function iniciarServidor({ projetoDir = null, rotas = {}, porta = 0 } = {}) {
  const mapas = [
    ['/motor/', path.join(RAIZ, 'motor')],
    ['/vendor/three/', path.join(RAIZ, 'node_modules', 'three', 'build')],
    ['/vendor/three-addons/', path.join(RAIZ, 'node_modules', 'three', 'examples', 'jsm')],
  ];
  if (projetoDir) mapas.push(['/projeto/', projetoDir], ['/sprites/', path.join(projetoDir, 'sprites')]);
  mapas.push(['/sprites/', path.join(RAIZ, 'biblioteca', 'sprites')]); // projeto primeiro, depois a biblioteca

  const servidor = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (rotas[url]) {
      const corpo = JSON.stringify(rotas[url]());
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(corpo);
    }
    if (url === '/' || url === '/index.html') return res.writeHead(302, { Location: '/motor/index.html' }).end();
    for (const [prefixo, base] of mapas) {
      if (!url.startsWith(prefixo)) continue;
      const arquivo = path.join(base, url.slice(prefixo.length));
      if (!dentro(base, arquivo) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) continue;
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      return fs.createReadStream(arquivo).pipe(res);
    }
    res.writeHead(404).end('nao encontrado');
  });

  return new Promise((resolve) => {
    servidor.listen(porta, '127.0.0.1', () => {
      const { port } = servidor.address();
      resolve({ url: `http://127.0.0.1:${port}`, porta: port, fechar: () => new Promise((r) => servidor.close(r)) });
    });
  });
}

