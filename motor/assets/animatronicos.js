// PROTÓTIPOS (aguardando aprovação) — animatrônicos de BRINQUEDO para os vídeos de terror "Nesse Mundo".
// Brinquedos de corda gigantes (do tamanho de um adulto), originais, no clima "brinquedo de criança que deu errado":
//   brinquedo-soldadinho   soldadinho de madeira: barretina vermelha, bigode pintado, maxilar de quebra-nozes, juntas de bolinha
//   brinquedo-boneca       boneca de pano: cabelo de lã laranja, olhos de botão, boca costurada, remendos e meias listradas
//   brinquedo-robo         robô de lata: antena com bolinha, visor de luz, grade na boca, painel no peito, ferrugem
//   brinquedo-caixa        caixa-surpresa: caixa roxa de estrelas com manivela; o bobo da corte sai na mola
// A chave de corda gira nas costas (aparece do lado direito) enquanto estão "ligados"; para quando desligam.
// Estados (os 3 de corpo): parado (chave girando, tique de cabeça), desligado (sem corda: cabeça caída, chave parada),
//   cantando (boca abre e fecha), acenar, virado (cabeça torta), olhos (os olhos viram buracos pretos com um pontinho
//   branco que brilha), rachado (o rosto racha e mostra o escuro de dentro: engrenagens / enchimento), falha (pisca entre
//   o normal e o rachado). Andam travados: andando/correndo e olhos-, virado-, rachado-andando.
// Caixa-surpresa: fechada (só a caixa, manivela girando), parado (aberta, o bobo balança na mola), desligado (mola frouxa,
//   cabeça pendurada), cantando, virado, olhos, rachado, falha; anda aos pulinhos (andando, fechada-andando...).
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';

const W = 30, H = 50, K = '#14121c';
const OCO = '#0a0810', PONTO = '#ffffff';
const tons3 = (c) => (x, y, dx, dy) => Pix.tom(c, 0.75 - dy * 0.45 - dx * 0.15, x, y);
const LATAO = ['#f8e08a', '#d8b040', '#8a6a20'];

// ------------------------------------------------------------------ pedaços comuns dos rostos
// olhos: [[x, y], ...]; op.olhos: 'normal' | 'oco' (buraco preto + pontinho branco)
function olhoOco(p, b, x, y) { p.ret(x - 1, y - 1, 3, 3, OCO); p.set(x, y, PONTO); b.set(x, y, PONTO); }
function racha(p, pontos, cor = OCO) { for (const [x, y] of pontos) p.set(x, y, cor); }
function engrenagem(p, cx, cy) {
  p.circulo(cx, cy, 2.2, '#8a8e9c'); p.set(Math.floor(cx), Math.floor(cy), '#3a3a44');
  for (const [dx, dy] of [[0, -3], [3, 0], [0, 3], [-3, 0]]) p.set(Math.floor(cx + dx), Math.floor(cy + dy), '#6a6e7c');
}

// ------------------------------------------------------------------ cabeças (folha 30x22, para poder entortar)
const CABECAS = {
  soldadinho(op, b) {
    const p = new Pix(W, 22), pele = ['#ffe4cc', '#f4c8a4', '#c89878'];
    p.elipse(15, 13.5, 5.6, 5.8, tons3(pele));
    p.ret(10, 0, 11, 8, '#c83040'); p.ret(10, 0, 2, 8, '#e05060'); p.ret(19, 0, 2, 8, '#8a1a2a');   // barretina
    p.circulo(15.5, 4.5, 2, '#f0c040'); p.set(15, 4, '#fff0a0');                                     // placa dourada
    p.ret(9, 7, 13, 2, '#1a1a26');                                                                   // aba
    p.ret(9, 9, 1, 9, '#d8b040'); p.ret(21, 9, 1, 9, '#d8b040');                                     // jugular dourada
    const olhos = [[13, 12], [17, 12]];
    for (const [x, y] of [[11, 15], [19, 15]]) { p.set(x, y, '#e8606a'); p.set(x + 1, y, '#e8606a'); }   // bochechas pintadas
    if (op.olhos === 'oco') olhos.forEach(([x, y]) => olhoOco(p, b, x, y));
    else for (const [x, y] of olhos) { p.set(x, y, K); p.set(x, y - 1, K); p.set(x - 1, y - 2, '#5a3a2a'); p.set(x + 1, y - 2, '#5a3a2a'); }
    p.ret(12, 15, 7, 1, '#3a2418'); p.set(11, 14, '#3a2418'); p.set(19, 14, '#3a2418');            // bigode pintado
    // maxilar de quebra-nozes: duas linhas verticais; a boca é o pedaço do meio, que cai
    p.ret(13, 16, 1, 4, '#a87858'); p.ret(17, 16, 1, 4, '#a87858');
    if (op.boca) { p.ret(14, 16, 3, 3, OCO); p.ret(14, 16, 3, 1, '#f4f0e0'); p.ret(13, 19, 5, 2, '#f4c8a4'); }
    else p.ret(14, 17, 3, 1, '#c83a4a');
    if (op.rachado) {
      racha(p, [[16, 9], [16, 10], [17, 11], [18, 12], [18, 13], [19, 14], [18, 15]]);
      p.elipse(18.5, 13, 2.6, 2.8, OCO); engrenagem(p, 18.6, 13.4); p.set(18, 12, '#ff2a1a'); b.set(18, 12, '#ff2a1a');
    }
    return { p, olhos };
  },
  boneca(op, b) {
    const p = new Pix(W, 22), pano = ['#fff0e0', '#f8d8bc', '#c8a088'], la = ['#f8904a', '#e06a2a', '#a8441a'];
    p.circulo(6.5, 13.5, 2.6, tons3(la)); p.circulo(23.5, 13.5, 2.6, tons3(la));                    // marias-chiquinhas
    p.set(8, 11, '#3a8ad8'); p.set(22, 11, '#3a8ad8');                                                 // laços
    p.elipse(15, 12.5, 6.2, 6.2, tons3(pano));
    p.elipse(15, 6.5, 7, 3.6, tons3(la)); p.ret(9, 7, 13, 2, la[1]);                                  // cabelo e franja
    for (let x = 9; x <= 21; x += 2) p.set(x, 9, la[2]);
    const olhos = [[12, 12], [18, 12]];
    p.set(10, 15, '#f0a0b0'); p.set(20, 15, '#f0a0b0');
    if (op.olhos === 'oco') olhos.forEach(([x, y]) => olhoOco(p, b, x, y));
    else for (const [x, y] of olhos) { p.circulo(x + 0.5, y + 0.5, 1.6, '#1a1a24'); p.set(x, y, '#4a4a5a'); }   // botões
    if (op.olhos === 'oco') { p.ret(18, 14, 1, 3, '#2a2a34'); p.circulo(18.5, 17.5, 1.1, '#1a1a24'); }          // um botão pendurado na linha
    if (op.boca) { p.ret(12, 15, 7, 2, OCO); for (let x = 12; x <= 18; x += 2) p.ret(x, 15, 1, 2, '#c83a4a'); } // costura esticada
    else { p.ret(12, 16, 7, 1, '#c83a4a'); for (let x = 12; x <= 18; x += 2) { p.set(x, 15, '#c83a4a'); p.set(x, 17, '#c83a4a'); } }
    if (op.rachado) {   // rasgo com enchimento saindo
      p.elipse(17.5, 11.5, 2.8, 3.2, OCO);
      for (const [x, y] of [[15, 9], [16, 8], [20, 10], [20, 13], [15, 14], [19, 15]]) p.set(x, y, '#f4f4f0');
      p.set(18, 11, PONTO); b.set(18, 11, PONTO);
    }
    return { p, olhos };
  },
  robo(op, b) {
    const p = new Pix(W, 22), lata = ['#d8e0ec', '#a8b4c4', '#6a7484'];
    p.ret(15, 1, 1, 4, '#6a7484'); p.circulo(15.5, 1.5, 1.4, '#e8404a'); b.set(15, 1, '#ff6a6a');   // antena
    p.ret(9, 5, 13, 13, lata[1]); p.ret(9, 5, 13, 2, lata[0]); p.ret(20, 7, 2, 11, lata[2]);
    p.ret(7, 9, 2, 5, lata[2]); p.ret(22, 9, 2, 5, lata[2]);                                          // parafusos das orelhas
    for (const [x, y] of [[10, 6], [20, 6], [10, 16], [20, 16]]) p.set(x, y, '#5a6070');            // rebites
    for (const [x, y] of [[11, 15], [12, 15], [19, 8], [19, 9], [20, 12]]) p.set(x, y, '#a8603a');  // ferrugem
    const olhos = [[12, 10], [18, 10]];
    for (const [x, y] of olhos) p.circulo(x + 0.5, y + 0.5, 2.2, '#3a3a44');
    if (op.olhos === 'oco') olhos.forEach(([x, y]) => { p.circulo(x + 0.5, y + 0.5, 1.4, '#ff2a1a'); b.set(x, y, '#ff2a1a'); b.set(x - 1, y, '#ff2a1a'); b.set(x, y - 1, '#ff2a1a'); });
    else if (op.olhos === 'apagado') olhos.forEach(([x, y]) => p.circulo(x + 0.5, y + 0.5, 1.4, '#5a5a66'));
    else olhos.forEach(([x, y]) => { p.circulo(x + 0.5, y + 0.5, 1.4, '#f8e060'); b.set(x, y, '#f8e060'); p.set(x, y, '#fff8c0'); });
    p.ret(12, 14, 7, 2, '#2a2a34');
    for (let x = 12; x <= 18; x += 2) p.ret(x, 14, 1, 2, op.boca ? '#f8e060' : '#6a7484');
    if (op.boca) for (let x = 12; x <= 18; x += 2) b.set(x, 14, '#f8e060');
    if (op.rachado) {   // a placa do rosto amassou e soltou: fios e engrenagem
      p.ret(16, 7, 6, 9, OCO); engrenagem(p, 18.5, 10.5);
      for (const [x, y, c] of [[16, 13, '#e8404a'], [17, 14, '#e8404a'], [21, 12, '#f8d040'], [20, 13, '#f8d040'], [21, 14, '#f8d040']]) p.set(x, y, c);
      p.set(12, 10, '#ff2a1a'); b.set(12, 10, '#ff2a1a');
    }
    return { p, olhos };
  },
};

// ------------------------------------------------------------------ corpos (soldadinho, boneca, robô)
const CORPOS = {
  soldadinho: { roupa: ['#5a7ae0', '#3a5ac8', '#24388a'], braco: '#3a5ac8', mao: '#ffffff', perna: '#f4f0e8', pe: '#1a1a26', junta: '#d8b080' },
  boneca: { roupa: ['#7aa8f0', '#5a8ad8', '#3a5a9a'], braco: '#f8d8bc', mao: '#f8d8bc', perna: 'listra', pe: '#1a1a26', junta: '#c83a4a' },
  robo: { roupa: ['#d8e0ec', '#a8b4c4', '#6a7484'], braco: '#8a94a4', mao: '#6a7484', perna: '#8a94a4', pe: '#5a6070', junta: '#5a6070' },
};

// chave de corda nas costas, vista de lado (sai à direita): 4 posições girando, ou parada
function chave(p, y, k) {
  p.ret(23, y + 2, 2, 1, LATAO[2]);
  const f = k % 4;
  if (f === 0) { p.ret(25, y - 1, 1, 7, LATAO[1]); p.set(26, y - 1, LATAO[0]); p.set(26, y + 5, LATAO[0]); p.ret(26, y, 1, 5, LATAO[2]); }
  else if (f === 1 || f === 3) { p.ret(25, y, 2, 5, LATAO[1]); p.set(25, y, LATAO[0]); }
  else { p.ret(25, y - 1, 1, 7, LATAO[2]); p.ret(26, y, 1, 5, LATAO[1]); }
}

// f: { cabecaY, inclina, passo (-1|0|1), bracoE, bracoD (dy ou 'alto'), aceno, chave (0..3 ou null) }
function quadro(tipo, op, f = {}) {
  const c = CORPOS[tipo], p = new Pix(W, H), b = new Pix(W, H);
  const bob = f.passo ? 1 : 0;
  if (f.chave != null) chave(p, 21 + bob, f.chave);
  // pernas
  for (const [x, lado] of [[11, -1], [16, 1]]) {
    const ergue = f.passo === lado ? 2 : 0, alt = 12 - ergue - bob;
    if (c.perna === 'listra') for (let j = 0; j < alt; j++) p.ret(x, 34 + bob + j, 3, 1, j % 2 ? '#ffffff' : '#d83a4a');
    else p.ret(x, 34 + bob, 3, alt, c.perna);
    if (tipo === 'robo') for (let j = 36; j < 44; j += 2) p.ret(x, j + bob - ergue, 3, 1, '#6a7484');   // sanfona
    if (tipo === 'soldadinho') p.ret(x, 41 - ergue, 3, 5, c.pe);                                     // botas altas
    p.ret(x - 1, 46 - ergue, 5, 3, c.pe);
    if (tipo !== 'robo') p.set(x + 1, 40 - ergue, c.junta);
  }
  // braços
  const braco = (x, dy, alto) => {
    if (alto) { p.ret(x, 10 + bob + (f.aceno || 0), 2, 12, c.braco); p.set(x, 16 + bob, c.junta); p.ret(x - 1, 8 + bob + (f.aceno || 0), 4, 3, c.mao); return; }
    p.ret(x, 21 + bob, 2, 12 + dy, c.braco); p.set(x, 27 + bob + Math.round(dy / 2), c.junta); p.set(x + 1, 27 + bob + Math.round(dy / 2), c.junta);
    if (tipo === 'robo') { p.ret(x - 1, 33 + bob + dy, 1, 3, c.mao); p.ret(x + 2, 33 + bob + dy, 1, 3, c.mao); p.ret(x - 1, 33 + bob + dy, 4, 1, c.mao); }   // garra
    else p.ret(x - 1, 33 + bob + dy, 4, 3, c.mao);
  };
  braco(5, f.bracoE || 0, false);
  braco(23, f.bracoD === 'alto' ? 0 : (f.bracoD || 0), f.bracoD === 'alto');
  // tronco
  if (tipo === 'robo') {
    p.ret(8, 20 + bob, 15, 14, c.roupa[1]); p.ret(8, 20 + bob, 15, 2, c.roupa[0]); p.ret(21, 22 + bob, 2, 12, c.roupa[2]);
    p.ret(11, 24 + bob, 9, 6, '#3a3a44'); p.set(12, 25 + bob, '#40d060'); p.set(14, 25 + bob, '#e8404a'); b.set(12, 25 + bob, '#40d060');
    p.ret(12, 27 + bob, 7, 2, '#6a7484'); p.set(16, 27 + bob, '#f8e060');                         // painel e ponteiro
    for (const [x, y] of [[9, 21], [21, 21], [9, 32], [21, 32]]) p.set(x, y + bob, '#5a6070');
    p.set(10, 31 + bob, '#a8603a'); p.set(11, 31 + bob, '#a8603a');
  } else {
    p.elipse(15, 27 + bob, 7.6, 7.6, tons3(c.roupa)); p.ret(8, 20 + bob, 15, 4, c.roupa[1]);
    if (tipo === 'soldadinho') {
      for (let k = 0; k < 10; k++) { p.set(9 + k, 21 + k + bob, '#ffffff'); p.set(21 - k, 21 + k + bob, '#ffffff'); }   // alças cruzadas
      for (const y of [22, 25, 28, 31]) p.set(15, y + bob, '#f0c040');
      p.ret(8, 32 + bob, 15, 2, '#1a1a26'); p.set(15, 32 + bob, '#f0c040');
      p.ret(6, 20 + bob, 4, 2, '#f0c040'); p.ret(21, 20 + bob, 4, 2, '#f0c040');                    // dragonas
      for (const [x, y] of [[11, 26], [19, 29]]) p.set(x, y + bob, '#8a6a58');                       // tinta descascada
    } else {
      p.elipse(15, 33 + bob, 9, 2.4, tons3(c.roupa));                                                // saia
      p.ret(10, 24 + bob, 4, 4, '#f8d040'); for (const [x, y] of [[10, 24], [13, 24], [10, 27], [13, 27]]) p.set(x, y + bob, '#a87820');   // remendo
      p.ret(17, 21 + bob, 5, 1, '#ffffff');                                                          // gola
      for (let y = 22; y < 33; y += 2) p.set(19, y + bob, '#2a3a6a');                                // costura
    }
  }
  // pescoço (pino de madeira / lata)
  p.ret(14, 18 + bob, 3, 3, tipo === 'robo' ? '#6a7484' : c.junta);
  // cabeça entortada (cada linha desliza um pouco)
  const bc = new Pix(W, 22), cab2 = CABECAS[tipo](op, bc);   // bc = camada que brilha (olhos ocos, luzes)
  const oy = (f.cabecaY || 0) + bob, inc = f.inclina || 0;
  for (let y = 0; y < 22; y++) {
    const dx = Math.round(inc * (y - 11) / 11) + (inc ? Math.sign(inc) : 0);
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (cab2.p.d[i + 3]) p.set(x - dx, y + oy, hex(cab2.p.d, i));
      if (bc.d[i + 3]) b.set(x - dx, y + oy, hex(bc.d, i));
    }
  }
  p.contorno(K);
  return { p, b };
}
const hex = (d, i) => '#' + [0, 1, 2].map((k) => d[i + k].toString(16).padStart(2, '0')).join('');

function spriteBrinquedo(tipo) {
  const quadros = [], brilho = [];
  const add = (op, f) => { const { p, b } = quadro(tipo, op, f); quadros.push(p); brilho.push(b); return quadros.length - 1; };
  const nor = { olhos: 'normal' }, oco = { olhos: 'oco' }, rach = { olhos: 'normal', rachado: true };
  const gira = (op, f = {}) => [0, 1, 2, 3].map((k) => add(op, { ...f, chave: k }));
  const P = gira(nor), T = add(nor, { inclina: 1, chave: 0 });
  const D = add({ olhos: tipo === 'robo' ? 'apagado' : 'normal' }, { cabecaY: 2, inclina: -2, bracoE: 1, bracoD: 1, chave: 2 });
  const C = [add({ olhos: 'normal', boca: 1 }, { cabecaY: -1, chave: 0 }), add(nor, { chave: 2 })];
  const AC = [add(nor, { bracoD: 'alto', chave: 0 }), add(nor, { bracoD: 'alto', aceno: 1, chave: 2 })];
  const V = gira(nor, { inclina: 3, cabecaY: 1 });
  const O = gira(oco), R = gira(rach);
  const andar = (op, f0 = {}) => [0, 1, 2, 3].map((k) => add(op, { ...f0, chave: k, passo: [-1, 0, 1, 0][k], bracoE: [1, 0, -1, 0][k], bracoD: [-1, 0, 1, 0][k] }));
  const AN = andar(nor), AO = andar(oco), AV = andar(nor, { inclina: 3, cabecaY: 1 }), AR = andar(rach);
  const e = (q, fps = 6) => ({ q, fps });
  return { quadros, brilho, sombra: true, personagem: true, anims: {
    parado: e([P[0], P[1], P[2], P[3], P[0], P[1], T, P[3]], 6), desligado: e([D], 1), cantando: e(C, 5), acenar: e(AC, 4),
    virado: e(V, 6), olhos: e(O, 6), rachado: e(R, 6), falha: e([P[0], R[1], P[2], V[0], R[0], P[3]], 12),
    andando: e(AN, 5), correndo: e(AN, 9), pulando: e([P[0]], 1),
    'olhos-andando': e(AO, 5), 'olhos-correndo': e(AO, 9), 'virado-andando': e(AV, 5), 'virado-correndo': e(AV, 9),
    'rachado-andando': e(AR, 5), 'rachado-correndo': e(AR, 9),
  } };
}

// ------------------------------------------------------------------ caixa-surpresa
// op: { fechada, olhos, boca, rachado }; f: { manivela 0..2, balanco -2..2, frouxa, inclina, pulo }
function quadroCaixa(op, f = {}) {
  const p = new Pix(W, H), b = new Pix(W, H), pulo = f.pulo || 0;
  const roxo = ['#a878e0', '#7a4ab0', '#4a2a7a'];
  // manivela do lado direito
  const [mx, my] = [[0, -3], [3, 0], [1, 3]][(f.manivela || 0) % 3];
  p.ret(23, 40 - pulo, 2, 1, '#8a8e9c'); p.ret(24, 40 - pulo + Math.min(0, my), 1, Math.abs(my) + 1, '#8a8e9c');
  p.ret(24, 40 - pulo, Math.max(1, mx + 1), 1, '#8a8e9c'); p.circulo(24.5 + mx, 40.5 - pulo + my, 1.2, '#e8404a');
  // caixa
  p.ret(7, 34 - pulo, 16, 14, roxo[1]); p.ret(7, 34 - pulo, 3, 14, roxo[0]); p.ret(20, 34 - pulo, 3, 14, roxo[2]);
  for (const [x, y] of [[11, 37], [16, 40], [12, 44], [18, 36], [14, 42]]) { p.set(x, y - pulo, '#f8e060'); p.set(x + 1, y - pulo, '#f8e060'); p.set(x, y + 1 - pulo, '#f8e060'); }
  p.ret(7, 47 - pulo, 16, 1, roxo[2]);
  if (op.fechada) { p.ret(6, 32 - pulo, 18, 3, '#5a3a8a'); p.ret(6, 32 - pulo, 18, 1, roxo[0]); p.contorno(K); return { p, b }; }
  p.ret(4, 20 - pulo, 3, 14, '#5a3a8a'); p.ret(4, 20 - pulo, 1, 14, roxo[0]);                     // tampa aberta, em pé à esquerda
  // mola em zigue-zague, balançando (mais em cima, mais desloca)
  const topo = f.frouxa ? 26 : 19, bal = f.balanco || 0;
  for (let y = topo; y < 34; y++) {
    const t = (34 - y) / (34 - topo), x0 = 15 + Math.round(bal * t) + ((y % 3) - 1) * 2;
    p.ret(x0 - 1, y - pulo, 2, 1, (y % 3) ? '#a8acb8' : '#6a6e7c');
  }
  // gola de babados
  const gy = topo - 2 - pulo, gx = Math.round(bal);
  for (let x = 9; x <= 21; x++) p.ret(x + gx, gy + (x % 2), 1, 2, x % 4 < 2 ? '#e8404a' : '#f8e060');
  // cabeça do bobo (folha à parte, entortada)
  const cab = new Pix(W, 22), bc = new Pix(W, 22);
  cab.elipse(15, 13, 5.6, 5.8, tons3(['#ffffff', '#f4f0ec', '#c8c0c8']));
  for (let k = 0; k <= 6; k++) { cab.ret(9 - k, 7 - k / 1.5, 4, 2, '#e8404a'); cab.ret(17 + k, 7 - k / 1.5, 4, 2, '#3ab060'); }   // chapéu de duas pontas
  cab.ret(10, 7, 11, 2, '#5a3a8a'); cab.circulo(3, 2.5, 1.4, '#f8d040'); cab.circulo(27, 2.5, 1.4, '#f8d040');            // guizos
  const olhos = [[13, 12], [17, 12]];
  if (op.olhos === 'oco') olhos.forEach(([x, y]) => olhoOco(cab, bc, x, y));
  else for (const [x, y] of olhos) { cab.set(x, y, K); cab.set(x, y - 1, K); cab.set(x - 1, y - 2, K); cab.set(x + 1, y - 2, K); }
  for (const [x, y] of [[12, 14], [12, 15], [11, 15], [13, 15], [12, 16]]) cab.set(x, y, '#7a4ab0');                      // losango pintado
  if (op.boca) { cab.ret(11, 16, 9, 3, OCO); for (let x = 11; x <= 19; x += 2) cab.set(x, 16, '#f4f0e0'); }
  else { cab.ret(11, 17, 9, 1, '#d83a3a'); cab.set(10, 16, '#d83a3a'); cab.set(20, 16, '#d83a3a'); cab.set(10, 15, '#d83a3a'); cab.set(20, 15, '#d83a3a'); }   // sorriso pintado até as bochechas
  if (op.rachado) { racha(cab, [[15, 8], [15, 9], [16, 10], [17, 11], [16, 12], [17, 13]]); cab.elipse(17.5, 12, 2.4, 2.6, OCO); engrenagem(cab, 17.6, 12.4); cab.set(17, 11, '#ff2a1a'); bc.set(17, 11, '#ff2a1a'); }
  const oy = gy - 19 + (f.frouxa ? 3 : 0), inc = (f.inclina || 0) + (f.frouxa ? 3 : 0);
  for (let y = 0; y < 22; y++) {
    const dx = Math.round(inc * (y - 11) / 11) + (inc ? Math.sign(inc) : 0) - gx;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (cab.d[i + 3]) p.set(x - dx, y + oy, hex(cab.d, i));
      if (bc.d[i + 3]) b.set(x - dx, y + oy, hex(bc.d, i));
    }
  }
  p.contorno(K);
  return { p, b };
}

function spriteCaixa() {
  const quadros = [], brilho = [];
  const add = (op, f) => { const { p, b } = quadroCaixa(op, f); quadros.push(p); brilho.push(b); return quadros.length - 1; };
  const bal = [0, 1, 2, 1, 0, -1, -2, -1];
  const ciclo = (op, f = {}) => bal.map((v, k) => add(op, { ...f, balanco: v, manivela: k % 3 }));
  const nor = { olhos: 'normal' };
  const F = [0, 1, 2].map((k) => add({ fechada: true }, { manivela: k }));
  const P = ciclo(nor), O = ciclo({ olhos: 'oco' }), R = ciclo({ olhos: 'normal', rachado: true }), V = ciclo(nor, { inclina: 3 });
  const C = [add({ olhos: 'normal', boca: 1 }, { balanco: 1 }), add(nor, { balanco: -1 })];
  const D = add(nor, { frouxa: true });
  const pula = (op) => [0, 2, 3, 2, 0, 0].map((h, k) => add(op, { pulo: h, balanco: [0, -1, -2, -1, 1, 0][k], manivela: k % 3 }));
  const AN = pula(nor), AO = pula({ olhos: 'oco' }), AR = pula({ olhos: 'normal', rachado: true });
  const AF = [0, 2, 3, 2, 0, 0].map((h, k) => add({ fechada: true }, { pulo: h, manivela: k % 3 }));
  const e = (q, fps = 8) => ({ q, fps });
  return { quadros, brilho, sombra: true, personagem: true, anims: {
    parado: e(P, 8), fechada: e(F, 6), desligado: e([D], 1), cantando: e(C, 5), acenar: e(P, 12), virado: e(V, 8),
    olhos: e(O, 8), rachado: e(R, 8), falha: e([P[0], R[2], P[4], V[1], R[6], P[3]], 12),
    andando: e(AN, 8), correndo: e(AN, 12), pulando: e([AN[2]], 1), 'fechada-andando': e(AF, 8), 'fechada-correndo': e(AF, 12),
    'olhos-andando': e(AO, 8), 'olhos-correndo': e(AO, 12), 'rachado-andando': e(AR, 8), 'rachado-correndo': e(AR, 12),
  } };
}

registrarSprites({
  'brinquedo-soldadinho': () => spriteBrinquedo('soldadinho'),
  'brinquedo-boneca': () => spriteBrinquedo('boneca'),
  'brinquedo-robo': () => spriteBrinquedo('robo'),
  'brinquedo-caixa': () => spriteCaixa(),
}, { grupo: 'Animatrônicos de brinquedo (terror)', status: 'protótipo', descricoes: {
  'brinquedo-soldadinho': 'soldadinho de corda gigante', 'brinquedo-boneca': 'boneca de pano gigante',
  'brinquedo-robo': 'robô de lata de corda', 'brinquedo-caixa': 'caixa-surpresa com o bobo na mola',
} });
