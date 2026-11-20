// Imagens paradas de um projeto (sem vídeo): uma por cena, no momento "foto" da cena (segundos desde o
// início dela; pode ser uma lista [1.5, 4]) ou a ~60% da cena. Gera também uma folha com todas.
//   npm run fotos -- <projeto>      ->  projetos/<projeto>/saida/fotos/
//   npm run vitrine                 ->  fotos do projeto "vitrine" (as principais mudanças)
import fs from 'node:fs';
import path from 'node:path';
import { carregarConfig } from './config.js';
import { iniciarServidor } from './servidor.js';
import { caminhoProjeto, lerRoteiro } from './projeto.js';
import { resolverRoteiro } from '../motor/compartilhado/linhaDoTempo.js';
import { abrirMotor } from './render.js';

export async function gerarFotos(nome, { escala = 4, vertical = false } = {}) {
  const cfg = carregarConfig();
  const dir = caminhoProjeto(nome);
  const bruto = lerRoteiro(dir);
  const roteiro = resolverRoteiro(bruto, new Map(), { fps: 30 });
  const saida = path.join(dir, 'saida', 'fotos');
  fs.rmSync(saida, { recursive: true, force: true });
  fs.mkdirSync(saida, { recursive: true });
  console.log(`\n▶ FOTOS — ${bruto.titulo || nome}: ${roteiro.cenas.length} cenas`);
  const servidor = await iniciarServidor({ projetoDir: dir });
  const motor = await abrirMotor({ ...cfg, permitirRenderizacaoCPU: true }, servidor, roteiro, 'final');
  const arquivos = [];
  try {
    for (const a of motor.info.avisos || []) console.log(`  ⚠ ${a}`);
    for (const c of roteiro.cenas) {
      const tempos = c.foto == null ? [c.duracao * 0.6] : [].concat(c.foto);
      for (const [k, t] of tempos.entries()) {
        const url = await motor.page.evaluate(([T, e]) => window.motor.foto(T, e), [c.inicio + Math.min(t, c.duracao - 0.05), escala]);
        const arq = path.join(saida, `${String(c.numero).padStart(2, '0')}${tempos.length > 1 ? String.fromCharCode(97 + k) : ''}.png`);
        fs.writeFileSync(arq, Buffer.from(url.split(',')[1], 'base64'));
        arquivos.push(arq);
        console.log(`  ✔ ${path.basename(arq)}  ${c.legenda || ''}`);
      }
    }
    // folha com todas (miniaturas na resolução interna x2)
    const folha = await motor.page.evaluate(async (lista) => {
      const imgs = await Promise.all(lista.map((u) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = u; })));
      const w = imgs[0].width / 2, h = imgs[0].height / 2, cols = 3, rows = Math.ceil(imgs.length / cols);
      const cv = document.createElement('canvas'); cv.width = cols * (w + 8) + 8; cv.height = rows * (h + 8) + 8;
      const g = cv.getContext('2d'); g.fillStyle = '#101018'; g.fillRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false;
      imgs.forEach((im, i) => g.drawImage(im, 8 + (i % cols) * (w + 8), 8 + Math.floor(i / cols) * (h + 8), w, h));
      return cv.toDataURL('image/png');
    }, arquivos.map((a) => 'data:image/png;base64,' + fs.readFileSync(a).toString('base64')));
    const arqFolha = path.join(saida, 'folha.png');
    fs.writeFileSync(arqFolha, Buffer.from(folha.split(',')[1], 'base64'));
    console.log(`\n  Pronto: ${saida}\n  Folha com todas: ${arqFolha}`);
  } finally {
    await motor.browser.close();
    servidor.fechar?.();
  }
}
