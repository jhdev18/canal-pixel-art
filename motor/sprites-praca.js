// PROTÓTIPO (não aprovado): objetos da praça para a RUA DIAGONAL, desenhados igual aos móveis do diorama.
// Posição no roteiro (x, z) = canto da FRENTE do objeto (o ponto mais baixo na tela). O objeto se estende
// para a direita (+x, "largura") e para o fundo (+z, "fundo"). A ordem de desenho usa o centro do objeto,
// então os personagens passam na frente ou atrás dele.
import { Pix } from './pixel.js';
import { registrarSprites } from './sprites.js';
import { spriteIso } from './cenarios/comodoDiagonal.js';

// estados: { nome: { tipo, op, noite } }; todos os quadros com o mesmo tamanho (o maior), base no mesmo ponto
function iso(estados, extra = {}) {
  const partes = Object.entries(estados).map(([nome, e]) => [nome, spriteIso(e.tipo, e.op || {}, { noite: !!e.noite })]);
  const W = Math.max(...partes.map(([, s]) => s.w)) | 1, H = Math.max(...partes.map(([, s]) => s.h));
  const quadros = [], brilho = [], anims = {};
  let temBrilho = false;
  for (const [nome, s] of partes) {
    const p = new Pix(W, H), b = new Pix(W, H), dx = (W - s.w) / 2, dy = H - s.h;
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      const k = (y * s.w + x) * 4, kk = ((y + dy) * W + x + dx) * 4;
      if (s.img[k + 3]) p.d.set(s.img.subarray(k, k + 4), kk);
      if (s.br && s.br[k + 3]) { b.d.set(s.br.subarray(k, k + 4), kk); temBrilho = true; }
    }
    anims[nome] = { q: [quadros.length], fps: 1 };
    quadros.push(p); brilho.push(b);
  }
  anims.parado = anims[partes[0][0]];
  const s0 = partes[0][1];
  return { quadros, brilho: temBrilho ? brilho : undefined, anims, sombra: false, isoCentro: { di: s0.di, dj: s0.dj }, ...extra };
}
const SECA = ['#c8b860', '#a89a48', '#7a7a3a', '#5a5a2a'];

registrarSprites({
  'fonte-iso': () => iso({ cheia: { tipo: 'fonte' }, seca: { tipo: 'fonte', op: { seca: true } } }),
  'banco-iso': () => iso({ parado: { tipo: 'banco' } }),
  'arvore-iso': () => iso({ verde: { tipo: 'arvore' }, seca: { tipo: 'arvore', op: { folhas: SECA } } }),
  'arvore-iso-grande': () => iso({ verde: { tipo: 'arvore', op: { altura: 36, copa: 26 } }, seca: { tipo: 'arvore', op: { altura: 36, copa: 26, folhas: SECA } } }),
  'poste-iso': () => iso({ apagado: { tipo: 'poste', op: { aceso: false } } }),
  'poste-iso-aceso': () => iso({ aceso: { tipo: 'poste', op: { aceso: true } } }, { luz: { cor: '#ffe0a0', intensidade: 1.4, alcance: 5, dy: 3.4, dz: 0.6 } }),
  'canteiro-iso': () => iso({ verde: { tipo: 'canteiro-flores' }, murcho: { tipo: 'canteiro-flores', op: { murcho: true } } }),
  'palanque-iso': () => iso({ parado: { tipo: 'palanque-d' } }),
  'bandeirinhas-iso': () => iso({ parado: { tipo: 'bandeirinhas' } }),
});
