// PROTÓTIPOS (aguardando aprovação) — animatrônicos para os vídeos de terror "Nesse Mundo".
// Bonecos mecânicos em tamanho de gente, mascotes das lojas de Vila Serena (originais; nada de urso/coelho/galinha/raposa):
//   animatronico-pao        "Pãozito", mascote da padaria do seu Tonho (cabeça de pão, chapéu de padeiro, gravata)
//   animatronico-sapo       "Sapo Bandinha", da festa da praça (quepe de banda, colete azul)
//   animatronico-vaca       "Mimosa", mascote do mercado (manchas, sino no pescoço, avental verde)
//   animatronico-bailarina  boneca de caixinha de música em tamanho real (porcelana, tutu, maxilar de boneco)
// De frente, 30x50 (um pouco mais altos que um adulto). Juntas de metal aparecendo no pescoço, cotovelos e joelhos.
// Estados: parado (ligado, sorriso fixo, um tique de cabeça), desligado (cabeça caída, olhos apagados), cantando (boca abre e
// fecha), acenar, virado (cabeça torta), olhos (olhos vermelhos que brilham), sem-rosto (a máscara abre e mostra o esqueleto de
// metal), falha (pisca entre o rosto e o esqueleto). Andam duros: andando/correndo e <estado>-andando para olhos, virado e sem-rosto.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const W = 30, H = 50, K = '#14121c';
const METAL = ['#c8ccd8', '#8a8e9c', '#555866'];
const VERMELHO = '#ff2a1a';

const tons3 = (c) => (x, y, dx, dy) => Pix.tom(c, 0.75 - dy * 0.45 - dx * 0.15, x, y);
const junta = (p, x, y) => { p.set(x, y, METAL[1]); p.set(x + 1, y, METAL[2]); };

// ------------------------------------------------------------------ cabeças (desenhadas numa folha à parte, para entortar)
// op: { boca: 0|1, olhos: 'normal'|'apagado'|'vermelho', semRosto }
// Devolve { p, olhos: [[x, y], ...] } (olhos = pixels que acendem no estado "olhos").
const CABECAS = {
  pao(op) {
    const p = new Pix(W, 22), pao = ['#f0c070', '#d8a050', '#a86a2a'];
    p.elipse(15, 13, 7.5, 6.2, tons3(pao));
    for (const [x, y] of [[11, 8], [12, 9], [15, 8], [16, 9], [19, 8], [20, 9]]) p.set(x, y, '#8a5222');   // cortes do pão
    p.elipse(15, 4, 5.5, 2.8, tons3(['#ffffff', '#ecebf0', '#b8b8c8'])); p.ret(10, 5, 11, 3, '#ecebf0');   // chapéu
    p.ret(10, 7, 11, 1, '#b8b8c8');
    const olhos = [[12, 12], [18, 12]];
    rostoPadrao(p, op, olhos, { boca: [12, 16, 7], bochecha: [[10, 14], [20, 14]], olhoCor: '#ffffff', botao: true });
    return { p, olhos };
  },
  sapo(op) {
    const p = new Pix(W, 22), verde = ['#8ad060', '#5aa040', '#2e6a2a'];
    p.elipse(15, 14, 8.5, 5.5, tons3(verde));
    p.circulo(11, 9, 3, tons3(verde)); p.circulo(19, 9, 3, tons3(verde));                               // bolotas dos olhos
    p.ret(13, 4, 5, 3, '#3a5ab0'); p.ret(12, 7, 7, 1, '#26407a'); p.set(15, 5, '#f8d040');            // quepe de banda
    const olhos = [[11, 9], [19, 9]];
    rostoPadrao(p, op, olhos, { boca: [9, 16, 13], olhoCor: '#f8f4d0', grande: true });
    return { p, olhos };
  },
  vaca(op) {
    const p = new Pix(W, 22), branco = ['#ffffff', '#ecebe4', '#b8b4a8'];
    p.set(8, 4, '#f0e0b0'); p.set(9, 5, '#f0e0b0'); p.set(22, 4, '#f0e0b0'); p.set(21, 5, '#f0e0b0');   // chifres
    p.elipse(7, 9, 2.2, 1.4, '#e8a0a8'); p.elipse(23, 9, 2.2, 1.4, '#e8a0a8');                        // orelhas
    p.elipse(15, 11, 6.5, 6.5, tons3(branco));
    for (const [x, y] of [[11, 7], [12, 7], [11, 8], [19, 9], [20, 9], [20, 10], [18, 6]]) p.set(x, y, '#2a2630');   // manchas
    p.elipse(15, 15.5, 4.5, 2.6, tons3(['#f8c0c8', '#e898a4', '#b86a78']));                            // focinho
    p.set(13, 15, '#8a3a4a'); p.set(17, 15, '#8a3a4a');
    const olhos = [[12, 10], [18, 10]];
    rostoPadrao(p, op, olhos, { boca: [13, 18, 5], olhoCor: '#ffffff' });
    return { p, olhos };
  },
  bailarina(op) {
    const p = new Pix(W, 22), pele = ['#fff8f4', '#f4e0d8', '#c8a8a0'], cab = '#5a3424';
    p.circulo(15, 3.5, 3, cab); p.elipse(15, 8, 6.5, 3.5, cab);                                         // coque e cabelo
    p.elipse(15, 11.5, 5.5, 6.5, tons3(pele));
    p.ret(9, 8, 1, 6, cab); p.ret(20, 8, 1, 6, cab);
    const olhos = [[13, 11], [17, 11]];
    rostoPadrao(p, op, olhos, { boca: [14, 15, 3], bochecha: [[11, 13], [19, 13]], olhoCor: '#6ab0f0', vidro: true, maxilar: true });
    return { p, olhos };
  },
};

function rostoPadrao(p, op, olhos, { boca, bochecha = [], olhoCor, botao = false, grande = false, vidro = false, maxilar = false }) {
  const [bx, by, bw] = boca;
  if (op.semRosto) {   // a máscara abre: buraco escuro, crânio de metal, olhos vermelhos e dentes
    const cx = (olhos[0][0] + olhos[1][0]) / 2 + 0.5, cy = (olhos[0][1] + by) / 2 + 0.5;
    p.elipse(cx, cy, (olhos[1][0] - olhos[0][0]) / 2 + 2.5, (by - olhos[0][1]) / 2 + 2.5, '#0c0a10');
    p.elipse(cx, cy, (olhos[1][0] - olhos[0][0]) / 2 + 1.2, (by - olhos[0][1]) / 2 + 1.4, tons3(METAL));
    for (const [x, y] of olhos) { p.ret(x - 1, y - 1, 3, 3, '#0c0a10'); p.set(x, y, VERMELHO); }
    for (let x = bx; x < bx + bw; x++) p.set(x, by, x % 2 ? '#f4f0e0' : '#0c0a10');
    for (let x = bx; x < bx + bw; x++) p.set(x, by + 1, '#3a3a44');
    return;
  }
  for (const [x, y] of bochecha) p.set(x, y, '#f08aa0');
  for (const [x, y] of olhos) {
    if (op.olhos === 'apagado') { p.ret(x - 1, y, 3, 1, '#3a3a44'); continue; }      // pálpebra fechada
    if (grande) p.ret(x - 1, y - 1, 3, 3, olhoCor); else { p.set(x, y, olhoCor); p.set(x + 1, y, olhoCor); p.set(x, y - 1, olhoCor); p.set(x + 1, y - 1, olhoCor); }
    const pup = op.olhos === 'vermelho' ? VERMELHO : vidro ? '#1a3a7a' : K;
    p.set(x, y, pup);
    if (botao && op.olhos !== 'vermelho') p.set(x + 1, y - 1, '#ffffff');
    if (vidro) p.set(x + 1, y - 1, '#ffffff');
  }
  if (maxilar) { p.ret(bx - 1, by, 1, 3, '#a88880'); p.ret(bx + bw, by, 1, 3, '#a88880'); }   // linhas do maxilar de boneco
  if (op.boca) { p.ret(bx, by, bw, 2, '#2a0a10'); for (let x = bx; x < bx + bw; x += 2) p.set(x, by, '#f4f0e0'); if (maxilar) p.ret(bx - 1, by + 2, bw + 2, 1, '#c8a8a0'); }
  else p.ret(bx, by, bw, 1, maxilar ? '#c83a4a' : '#3a1a1a');
  if (!op.boca && bw > 4) { p.set(bx - 1, by - 1, '#3a1a1a'); p.set(bx + bw, by - 1, '#3a1a1a'); }   // cantos para cima: sorriso fixo
}

// ------------------------------------------------------------------ corpos
const CORPOS = {
  pao: { roupa: ['#ffffff', '#e8e6ee', '#b0b0c0'], detalhe: '#d83a3a', pele: ['#f0c070', '#d8a050', '#a86a2a'], luva: '#ffffff', calca: '#4a3a5a', pe: '#3a2a20' },
  sapo: { roupa: ['#5a7ad0', '#3a5ab0', '#26407a'], detalhe: '#f8d040', pele: ['#8ad060', '#5aa040', '#2e6a2a'], luva: '#8ad060', calca: '#5aa040', pe: '#2e6a2a', barriga: '#d8e8a0' },
  vaca: { roupa: ['#5ab870', '#3a9a50', '#26703a'], detalhe: '#f8d040', pele: ['#ffffff', '#ecebe4', '#b8b4a8'], luva: '#2a2630', calca: '#ecebe4', pe: '#2a2630', sino: true },
  bailarina: { roupa: ['#ffd0e4', '#f8a8c8', '#c87098'], detalhe: '#ffffff', pele: ['#fff8f4', '#f4e0d8', '#c8a8a0'], luva: '#f4e0d8', calca: '#f4e0d8', pe: '#f8a8c8', tutu: true, fina: true },
};

// f: { cabecaY, inclina, passo (-1|0|1), bracoE, bracoD (dy da mão; 'alto' = levantado), aceno }
function quadro(tipo, op, f = {}) {
  const c = CORPOS[tipo], p = new Pix(W, H), b = new Pix(W, H);
  const bob = f.passo ? 1 : 0;   // o corpo desce 1 px a cada passo (anda duro)
  // pernas (bailarina: finas) com joelho de metal
  const larg = c.fina ? 2 : 3;
  for (const [x, lado] of [[c.fina ? 12 : 11, -1], [c.fina ? 16 : 16, 1]]) {
    const ergue = f.passo === lado ? 2 : 0;
    p.ret(x, 34 + bob, larg, 12 - ergue - bob, c.calca);
    junta(p, x, 40 - ergue);
    p.ret(x - 1, 46 - ergue, larg + 2, 3, c.pe);
  }
  // braços com cotovelo de metal; mão de luva
  const braco = (x, dy, alto) => {
    if (alto) { p.ret(x, 10 + bob + (f.aceno || 0), 2, 12, c.pele[1]); junta(p, x, 16 + bob); p.ret(x - 1, 8 + bob + (f.aceno || 0), 4, 3, c.luva); return; }
    p.ret(x, 21 + bob, 2, 12 + dy, c.pele[1]); junta(p, x, 27 + bob + Math.round(dy / 2)); p.ret(x - 1, 33 + bob + dy, 4, 3, c.luva);
  };
  braco(5, f.bracoE || 0, false);
  braco(23, f.bracoD === 'alto' ? 0 : (f.bracoD || 0), f.bracoD === 'alto');
  // tronco
  p.elipse(15, 27 + bob, 8, 8, tons3(c.roupa));
  p.ret(8, 20 + bob, 15, 4, c.roupa[1]);
  if (c.barriga) p.elipse(15, 29 + bob, 4, 4, c.barriga);
  if (tipo === 'pao') { p.ret(12, 23 + bob, 7, 9, '#ffffff'); p.ret(12, 23 + bob, 7, 1, '#c8c8d4'); }          // avental
  if (tipo === 'vaca') { p.ret(11, 22 + bob, 9, 10, '#ecebe4'); p.ret(11, 22 + bob, 9, 1, c.roupa[2]); }
  if (tipo === 'sapo') for (const y of [24, 28]) p.set(15, y + bob, c.detalhe);                                  // botões do colete
  if (c.tutu) p.elipse(15, 33 + bob, 10, 2.6, tons3(['#ffffff', '#ffd0e4', '#f8a8c8']));
  // pescoço de metal (aparece entre a cabeça e o corpo: é o que denuncia o boneco)
  p.ret(14, 18 + bob, 3, 3, METAL[1]); p.set(14, 19 + bob, METAL[0]);
  if (tipo === 'pao') { p.ret(12, 20 + bob, 3, 2, c.detalhe); p.ret(16, 20 + bob, 3, 2, c.detalhe); p.set(15, 20 + bob, '#a82a2a'); }   // gravata borboleta
  if (c.sino) { p.ret(14, 21 + bob, 3, 3, c.detalhe); p.set(15, 24 + bob, '#a88020'); }
  // cabeça (com inclinação: cada linha desliza um pouco para o lado)
  const cab = CABECAS[tipo](op);
  const oy = (f.cabecaY || 0) + bob, inc = f.inclina || 0;
  for (let y = 0; y < cab.p.h; y++) {
    const dx = Math.round(inc * (y - 11) / 11) + (inc ? Math.sign(inc) * 1 : 0);
    for (let x = 0; x < cab.p.w; x++) {
      const i = (y * cab.p.w + x) * 4;
      if (!cab.p.d[i + 3]) continue;
      const cor = '#' + [0, 1, 2].map((k) => cab.p.d[i + k].toString(16).padStart(2, '0')).join('');
      p.set(x - dx, y + oy, cor);
      if ((op.olhos === 'vermelho' || op.semRosto) && cab.olhos.some(([ox, oy2]) => ox === x && oy2 === y)) b.set(x - dx, y + oy, VERMELHO);
    }
  }
  p.contorno(K);
  return { p, b };
}

function spriteAnimatronico(tipo) {
  const quadros = [], brilho = [], anims = {};
  const add = (op, f) => { const { p, b } = quadro(tipo, op, f); quadros.push(p); brilho.push(b); return quadros.length - 1; };
  const N = {}, A = {};
  const normal = { boca: 0, olhos: 'normal' };
  N.parado = add(normal); N.tique = add(normal, { inclina: 1 });
  N.desligado = add({ boca: 0, olhos: 'apagado' }, { cabecaY: 2, inclina: -2, bracoE: 1, bracoD: 1 });
  N.boca = add({ boca: 1, olhos: 'normal' }, { cabecaY: -1 });
  N.acenaA = add(normal, { bracoD: 'alto' }); N.acenaB = add(normal, { bracoD: 'alto', aceno: 1 });
  N.virado = add(normal, { inclina: 3, cabecaY: 1 });
  N.olhos = add({ boca: 0, olhos: 'vermelho' }); N.olhosT = add({ boca: 0, olhos: 'vermelho' }, { inclina: 1 });
  N.sem = add({ semRosto: true }); N.semT = add({ semRosto: true }, { inclina: -1 });
  const andar = (op, f0 = {}) => [add(op, { ...f0, passo: -1, bracoE: 1, bracoD: -1 }), add(op, f0), add(op, { ...f0, passo: 1, bracoE: -1, bracoD: 1 }), add(op, f0)];
  A.normal = andar(normal); A.olhos = andar({ boca: 0, olhos: 'vermelho' }); A.virado = andar(normal, { inclina: 3, cabecaY: 1 }); A.sem = andar({ semRosto: true });
  const e = (q, fps = 4) => ({ q, fps });
  Object.assign(anims, {
    parado: e([N.parado, N.parado, N.parado, N.parado, N.parado, N.parado, N.tique, N.parado], 4),
    desligado: e([N.desligado], 1),
    cantando: e([N.parado, N.boca], 5),
    acenar: e([N.acenaA, N.acenaB], 4),
    virado: e([N.virado], 1),
    olhos: e([N.olhos, N.olhos, N.olhos, N.olhosT], 4),
    'sem-rosto': e([N.sem, N.sem, N.semT, N.sem], 6),
    falha: e([N.parado, N.sem, N.parado, N.parado, N.sem, N.virado], 12),
    andando: e(A.normal, 5), correndo: e(A.normal, 9), pulando: e([N.parado], 1),
    'olhos-andando': e(A.olhos, 5), 'olhos-correndo': e(A.olhos, 9),
    'virado-andando': e(A.virado, 5), 'virado-correndo': e(A.virado, 9),
    'sem-rosto-andando': e(A.sem, 5), 'sem-rosto-correndo': e(A.sem, 9),
  });
  return { quadros, brilho, anims, sombra: true, personagem: true };
}

registrarSprites({
  'animatronico-pao': () => spriteAnimatronico('pao'),
  'animatronico-sapo': () => spriteAnimatronico('sapo'),
  'animatronico-vaca': () => spriteAnimatronico('vaca'),
  'animatronico-bailarina': () => spriteAnimatronico('bailarina'),
}, { grupo: 'Animatrônicos (terror)', status: 'protótipo', descricoes: {
  'animatronico-pao': 'Pãozito, mascote da padaria', 'animatronico-sapo': 'Sapo Bandinha, da festa da praça',
  'animatronico-vaca': 'Mimosa, mascote do mercado', 'animatronico-bailarina': 'boneca de caixinha de música em tamanho real',
} });
