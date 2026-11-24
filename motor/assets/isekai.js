// PROTÓTIPOS (aguardando aprovação) — série ISEKAI "E se você renascesse como o monstro mais fraco do jogo?":
//   cogumelo-davi (o Davi, cogumelo protagonista), cogumelo-comum (os outros cogumelos da floresta), goblin (o rival bruxo que anota tudo),
//   heróis aventureiros (3 variações + versões deitadas, dormindo), espada-heroi (vai na mão com "sobre") e chapeu-davi (o chapéu que voa).
//   Ações novas no motor: "golpe" (arco branco da espada) e "esporos" (nuvem colorida de esporos) — ver motor.js / particulas.js.
//   Estilo próprio (nada copiado de jogos): contorno escuro, poucas cores, rosto expressivo.
import { Pix } from '../pixel.js';
import { registrarSprites } from '../sprites.js';
import { adicionarExpressoes } from '../expressoes.js';
import { pessoaComSentado as pessoa } from './moradores.js';

const K = '#2a1a1a';

// ---------------------------------------------------------------- DAVI, o cogumelo (22x26)
// chapeu: 'normal' | 'sem' | 'grande'; perna: 'parado' | 'a' | 'b' | 'pulo'; face: expressão; dy: respiração; dx: tremor
const CHAPEU = { luz: '#ff8a6a', base: '#e8483a', sombra: '#a82a2a', bola: '#fff8ec', bolaSombra: '#e8d8c8' };
const CHAPEU_GRANDE = CHAPEU;   // o chapéu grande cresce mas NÃO muda de cor (o usuário achou que o Davi "mudava de cor" no fim com o dourado)
const CAULE = { luz: '#fff8e8', base: '#f6ead0', sombra: '#d8c4a0' };
function chapeuTico(p, cx, topo, grande, cores) {
  const rx = grande ? 11 : 9.5, ry = grande ? 8 : 6.5, cy = topo + ry;
  p.elipse(cx, cy, rx, ry, (x, y, dx, dy) => (y > cy + 1 ? null : Pix.tom([cores.sombra, cores.base, cores.luz], 0.75 - dy * 0.55 - dx * 0.25, x, y)));
  for (let x = Math.round(cx - rx + 1); x <= Math.round(cx + rx - 1); x++) p.set(x, Math.round(cy + 1), cores.sombra);   // aba de baixo
  const bolas = grande ? [[-6, -2, 2], [0, -5, 2.4], [5.5, -2.5, 2], [-2.5, 0, 1.4], [3, 0.4, 1.2]] : [[-5, -1.5, 1.8], [0, -4, 2.2], [4.8, -2, 1.6], [-1.5, 0.3, 1.1]];
  for (const [bx, by, r] of bolas) p.circulo(cx + bx, cy + by, r, (x, y, dx, dy) => (dx + dy > 0.6 ? cores.bolaSombra : cores.bola));
  return Math.round(cy + 1);
}
function rostoTico(p, cx, cy, e) {
  const set = (x, y, c) => p.set(Math.round(cx + x), Math.round(cy + y), c);
  const olho = (x, y) => { set(x, y, K); set(x, y + 1, K); set(x, y - 0, K); };
  const W = '#ffffff', B = '#5a2020', R = '#f08a8a', L = '#9ad8ff';
  const ol = { esq: -3, dir: 2 };
  const olhosNormais = () => { for (const ox of [ol.esq, ol.dir]) { set(ox, 0, K); set(ox, 1, K); set(ox + 1, 0, K); set(ox + 1, 1, K); set(ox, 0, W); } };
  const fechados = () => { for (const ox of [ol.esq, ol.dir]) { set(ox, 1, K); set(ox + 1, 1, K); } };
  const arcos = () => { for (const ox of [ol.esq, ol.dir]) { set(ox, 1, K); set(ox + 0.5, 0, K); set(ox + 1, 1, K); } };
  switch (e) {
    case 'feliz': arcos(); set(-1, 4, B); set(0, 5, B); set(1, 4, B); break;
    case 'rindo': arcos(); for (let x = -1; x <= 1; x++) { set(x, 4, B); set(x, 5, B); } set(0, 5, '#c84a5a'); break;
    case 'triste': olhosNormais(); set(ol.esq, 2, L); set(-1, 5, B); set(0, 4, B); set(1, 5, B); break;
    case 'chorando': fechados(); set(ol.esq, 2, L); set(ol.esq, 3, L); set(ol.dir + 1, 2, L); set(ol.dir + 1, 3, L); for (let x = -1; x <= 1; x++) set(x, 4, B); set(0, 5, B); break;
    case 'bravo': olhosNormais(); set(ol.esq - 1, -1, K); set(ol.esq, -1, K); set(ol.dir + 1, -1, K); set(ol.dir + 2, -1, K); set(-1, 5, B); set(0, 5, B); set(1, 5, B); break;
    case 'surpreso': olhosNormais(); set(ol.esq, -1, K); set(ol.dir + 1, -1, K); set(0, 4, B); set(0, 5, B); break;
    case 'assustado':   // olhos grandes brancos com pupila pequena, boca tremida
      for (const ox of [ol.esq, ol.dir]) { for (const [dx, dy] of [[0, -1], [1, -1], [0, 0], [1, 0], [0, 1], [1, 1]]) set(ox + dx, dy, W); set(ox + (ox < 0 ? 1 : 0), 0, K); }
      set(-1, 5, B); set(0, 4, B); set(1, 5, B); set(-2, 4, '#a8e0ff'); break;
    case 'envergonhado': fechados(); set(-1, 4, B); set(0, 4, B); set(ol.esq - 1, 3, R); set(ol.dir + 2, 3, R); break;
    case 'pensativo': for (const ox of [ol.esq, ol.dir]) { set(ox + 1, 0, K); set(ox + 1, 1, K); } set(0, 4, B); set(1, 4, B); break;
    case 'inspira': fechados(); set(0, 4, B); break;                                     // "ah... ah..."
    case 'espirro': for (const ox of [ol.esq, ol.dir]) { set(ox, 0, K); set(ox + 1, 1, K); set(ox, 1, K); } for (let x = -1; x <= 1; x++) for (let y = 3; y <= 5; y++) set(x, y, B); break;   // > < e boca aberta
    case 'dormindo': fechados(); set(0, 4, B); break;
    default: olhosNormais(); set(-1, 4, B); set(0, 4, B); set(1, 4, B);                 // neutro: sorrisinho
  }
  if (['feliz', 'rindo', 'envergonhado'].includes(e)) { set(ol.esq - 1, 3, R); set(ol.dir + 2, 3, R); }
}
function tico({ chapeu = 'normal', perna = 'parado', face = 'normal', dy = 0, dx = 0 } = {}) {
  const W = 24, H = 28, p = new Pix(W, H), cx = 12 + dx, pulo = perna === 'pulo' ? -1 : 0;
  const topo = (chapeu === 'grande' ? 2 : 3) + dy + pulo;   // o chapéu encosta no caule (antes o grande ficava descolado, "flutuando")
  // caule (corpo) — fica atrás da aba do chapéu
  const cy = 18 + dy + pulo;
  p.elipse(cx, cy, 6, 6, (x, y, ex, ey) => Pix.tom([CAULE.sombra, CAULE.base, CAULE.luz], 0.8 - ex * 0.3 - ey * 0.2, x, y));
  // pezinhos redondos da cor do caule (antes eram toquinhos finos com ponta marrom: "pés estranhos"); andando, um sobe de cada vez
  const pes = { parado: [[-3, 0], [3, 0]], a: [[-3, -1], [3, 0]], b: [[-3, 0], [3, -1]], pulo: [[-3, -1], [3, -1]] }[perna];
  for (const [px, py] of pes) p.elipse(cx + px, 24.6 + py + dy + pulo, 2.4, 1.5, (x, y, ex, ey) => (ey > 0.25 ? CAULE.sombra : ex < -0.3 && ey < 0 ? CAULE.luz : '#ecdcbc'));
  if (chapeu === 'sem') {   // careca: topo do caule à mostra (cômico)
    p.elipse(cx, 12 + dy + pulo, 5, 2.4, (x, y, ex, ey) => (ey < -0.2 ? CAULE.luz : CAULE.base));
    p.set(cx - 1, 10 + dy + pulo, '#d8c4a0'); p.set(cx + 1, 10 + dy + pulo, '#d8c4a0');
  } else chapeuTico(p, cx, topo, chapeu === 'grande', chapeu === 'grande' ? CHAPEU_GRANDE : CHAPEU);
  rostoTico(p, cx, 15 + dy + pulo, face);
  return p.contorno(K);
}
function spriteTico() {
  const quadros = [], anims = {};
  const add = (op) => { quadros.push(tico(op)); return quadros.length - 1; };
  const grupo = (nome, chapeu, face) => {
    const n0 = add({ chapeu, face }), n1 = add({ chapeu, face, dy: 1 });
    const a = add({ chapeu, face, perna: 'a' }), b = add({ chapeu, face, perna: 'b', dy: 1 });
    const pre = nome ? nome + '-' : '';
    anims[nome || 'parado'] = { q: [n0, n0, n1, n1], fps: 3 };
    anims[pre + 'andando'] = { q: [a, n0, b, n0], fps: 8 };
    anims[pre + 'correndo'] = { q: [a, n1, b, n1], fps: 14 };
    if (nome) anims[pre + 'pulando'] = { q: [add({ chapeu, face, perna: 'pulo' })], fps: 1 };   // o pulo mantém o chapéu/rosto do estado
  };
  grupo('', 'normal', 'normal');
  anims.pulando = { q: [add({ perna: 'pulo' })], fps: 1 };
  grupo('assustado', 'normal', 'assustado');
  anims.tremendo = { q: [add({ face: 'assustado', dx: -1 }), add({ face: 'assustado', dx: 1 })], fps: 16 };
  grupo('sem-chapeu', 'sem', 'assustado');
  anims['sem-chapeu-tremendo'] = { q: [add({ chapeu: 'sem', face: 'assustado', dx: -1 }), add({ chapeu: 'sem', face: 'assustado', dx: 1 })], fps: 16 };
  anims['sem-chapeu-inspira'] = { q: [add({ chapeu: 'sem', face: 'inspira', dy: -1 })], fps: 1 };
  anims['sem-chapeu-espirro'] = { q: [add({ chapeu: 'sem', face: 'espirro', dy: 1 })], fps: 1 };
  anims['espirro-antes'] = { q: [add({ face: 'inspira', dy: -1 })], fps: 1 };   // ação "espirrar" (com chapéu)
  anims.espirro = { q: [add({ face: 'espirro', dy: 1 })], fps: 1 };
  grupo('feliz', 'normal', 'feliz');
  grupo('grande', 'grande', 'feliz');
  const s = { quadros, anims, sombra: true, personagem: true };
  return adicionarExpressoes(s, (e) => [tico({ face: e }), tico({ face: e, dy: 1 })]);
}

// ---------------------------------------------------------------- cogumelo comum (os da floresta, 18x20)
function cogumeloComum({ perna = 'parado', dy = 0, cor = 0 } = {}) {
  const W = 18, H = 20, p = new Pix(W, H), cx = 9;
  const pal = [{ luz: '#e0a060', base: '#b8743a', sombra: '#7a4a24', bola: '#f6e4c0', bolaSombra: '#d8c4a0' },
    { luz: '#c8a0e0', base: '#9a6ab8', sombra: '#5a3a7a', bola: '#f0e4f8', bolaSombra: '#d0c0e0' },
    { luz: '#a0d080', base: '#6aa850', sombra: '#3a6a2a', bola: '#f0f8e0', bolaSombra: '#d0e0c0' }][cor];
  p.elipse(cx, 13 + dy, 4.5, 4.5, (x, y, ex, ey) => Pix.tom([CAULE.sombra, CAULE.base, CAULE.luz], 0.8 - ex * 0.3, x, y));
  const pernas = { parado: [[-2.5, 0], [1.5, 0]], a: [[-2.5, -1], [1.5, 0]], b: [[-2.5, 0], [1.5, -1]] }[perna];
  for (const [px, py] of pernas) p.ret(cx + px, 17 + py + dy, 1.6, 2, '#8a6a4a');
  const cy = 6 + dy;
  p.elipse(cx, cy, 7.5, 5.5, (x, y, ex, ey) => (y > cy + 1 ? null : Pix.tom([pal.sombra, pal.base, pal.luz], 0.75 - ey * 0.55 - ex * 0.25, x, y)));
  for (const [bx, by, r] of [[-3.5, -1, 1.3], [0.5, -3, 1.5], [3.8, -1, 1.2]]) p.circulo(cx + bx, cy + by, r, pal.bola);
  for (let x = cx - 6; x <= cx + 6; x++) p.set(x, cy + 1, pal.sombra);
  p.set(cx - 2, 12 + dy, K); p.set(cx + 2, 12 + dy, K); p.set(cx, 14 + dy, '#5a2020');   // rostinho bobo
  return p.contorno(K);
}
function spriteCogumeloComum(cor) {
  const quadros = [0, 1, 2, 3].map((k) => cogumeloComum({ cor, dy: k === 1 ? 1 : 0, perna: k === 2 ? 'a' : k === 3 ? 'b' : 'parado' }));
  return { quadros, anims: { parado: { q: [0, 0, 1, 1], fps: 3 }, andando: { q: [2, 0, 3, 0], fps: 8 }, correndo: { q: [2, 0, 3, 0], fps: 14 }, pulando: { q: [2], fps: 1 } }, sombra: true, personagem: true };
}

// ---------------------------------------------------------------- GOBLIN BRUXO, o rival da série (30x48)
// Pedido do usuário: o goblin tem algo especial — é um BRUXO (necromante): chapéu pontudo de aba larga, manto roxo com estrelinhas,
// olhos verdes que brilham, livro de feitiços (grimório roxo com runa verde) na mão esquerda e cajado com uma caveirinha e chama verde
// na direita. Ele "anota" no grimório o que vê. Estados: parado (anotando: a página vira), anotando, feliz, rindo, alerta,
// conjurar (cajado erguido, chama e olhos acesos mais fortes), andando/correndo. A chama e os olhos ficam na camada que brilha.
const MANTO = ['#2a1a3e', '#3e2858', '#563878'], VERDE_MAGIA = ['#c8ffd8', '#7af0a0', '#2ec870'];
// goblinMago: o 1º desenho de bruxo (chapéu de mago e manto roxo estrelado) — o usuário gostou da ideia para PERSONAGENS FUTUROS (sprite goblin-mago).
function goblinMago({ pagina = 0, face = 'normal', perna = 'parado', dy = 0, conjurar = false, chama = 0 } = {}) {
  // O = espaço em cima para o chapéu pontudo de bruxo (o desenho do corpo é o mesmo, descido O px)
  const O = 10, W = 30, H = 48, p = new Pix(W, H), b = new Pix(W, H), cx = 13, G = ['#4a7a2a', '#6aa83a', '#8ac850'], y0 = 2 + dy + O;
  // cajado (atrás do corpo, na mão direita): erguido quando conjura
  const sx = cx + 9, topo = conjurar ? y0 - 1 : y0 + 4;
  p.ret(sx, topo + 5, 1, 34 + O - topo - 5 + (conjurar ? -3 : 0), '#5a3a22'); p.ret(sx + 1, topo + 5, 1, 30 + O - topo, '#3a2414');
  p.elipse(sx + 0.5, topo + 3, 2.4, 2.2, '#e8e0c8'); p.set(sx - 1, topo + 3, '#2a1a1a'); p.set(sx + 1, topo + 3, '#2a1a1a'); p.ret(sx - 1, topo + 5, 3, 1, '#c8c0a8');   // caveirinha
  const ch = conjurar ? 4 : 2 + chama;                                                                                               // chama verde em cima
  for (let k = 0; k < ch + 2; k++) { const w = Math.max(0, Math.round((ch + 2 - k) * 0.6)); for (let x = -w; x <= w; x++) { const c = k < 1 ? VERDE_MAGIA[2] : x === 0 && k < ch ? VERDE_MAGIA[0] : VERDE_MAGIA[1]; p.set(sx + x, topo - k, c); b.set(sx + x, topo - k, c); } }
  // pernas e pés (aparecem embaixo do manto)
  const pernas = { parado: [[-4, 0], [2, 0]], a: [[-4, -1], [2, 0]], b: [[-4, 0], [2, -1]] }[perna];
  for (const [px, py] of pernas) { p.ret(cx + px, 31 + O + py + dy, 3, 4, G[0]); p.ret(cx + px - 1, 34 + O + py + dy, 4, 2, '#2a1a14'); }
  // manto de bruxo roxo, comprido, com barra verde e estrelinhas
  for (let y = 18; y < 33; y++) { const w = 5 + Math.round((y - 18) * 0.35); for (let x = -w; x <= w; x++) p.set(cx + x, y + dy + O, Pix.tom(MANTO, 0.75 - (x / w) * 0.3 - (y - 18) * 0.02, cx + x, y)); }
  for (let x = -10; x <= 10; x++) if (p.opaco(cx + x, 32 + dy + O)) p.set(cx + x, 32 + dy + O, '#2ec870');
  for (const [x, y] of [[-3, 22], [3, 25], [-5, 28], [4, 30], [0, 27]]) { p.set(cx + x, y + dy + O, '#f8e070'); }
  p.ret(cx - 1, 19 + dy + O, 2, 12, '#1e1230');
  // braços: grimório (esquerda) e mão no cajado (direita)
  p.ret(cx - 8, 21 + dy + O, 3, 6, MANTO[1]); p.ret(cx + 6, 21 + dy + O, 3, 6, MANTO[1]); p.ret(cx + 7, 27 + dy + O, 3, 2, G[1]);
  const lx = cx - 13, ly = 22 + dy + O;
  p.ret(lx, ly, 7, 8, '#4a2a6a'); p.ret(lx, ly, 7, 1, '#6a4a8a'); p.ret(lx + 6, ly, 1, 8, '#2a1a3e');                               // grimório
  p.ret(lx + 1, ly + 1, 5, 6, '#e8dcc0'); p.ret(lx + 3, ly + 1, 1, 6, '#b8a888');                                                    // páginas abertas
  for (const [x, y] of [[lx + 2, ly + 3], [lx + 4, ly + 2], [lx + 4, ly + 4]]) { p.set(x, y, '#2ec870'); b.set(x, y, '#2ec870'); }       // runas que brilham
  if (pagina) { p.ret(lx + 3, ly - 1, 3, 4, '#f4ecd8'); }                                                                          // a página virando
  // cabeça, orelhas pontudas e nariz comprido
  const hy = 10 + dy + O;
  p.elipse(cx, hy + 1, 7, 6.5, (x, y, ex, ey) => Pix.tom(G, 0.75 - ex * 0.3 - ey * 0.35, x, y));
  for (const s2 of [-1, 1]) for (let k = 0; k < 7; k++) { const x = cx + s2 * (7 + k), y = hy + 1 - Math.round(k * 0.55); p.set(x, y, G[1]); p.set(x, y + 1, k < 4 ? G[1] : G[0]); if (k < 3) p.set(x, y + 2, G[0]); }
  p.ret(cx - 1, hy + 2, 2, 4, G[0]); p.set(cx, hy + 6, G[0]);
  // CHAPÉU DE BRUXO: aba larga e cone alto, torto para trás, com fita verde e estrelinha
  const aba = hy - 4;
  p.elipse(cx, aba, 11, 2.6, (x, y, ex, ey) => (ey < -0.1 ? MANTO[2] : MANTO[0]));
  for (let k = 0; k < 16; k++) { const w = Math.max(0, Math.round(6.5 - k * 0.42)), dx = Math.round(k > 9 ? (k - 9) * 0.8 : 0); for (let x = -w; x <= w; x++) p.set(cx + x + dx, aba - 1 - k, Pix.tom(MANTO, 0.8 - (x / Math.max(1, w)) * 0.35, cx + x, aba - k)); }
  for (let x = -6; x <= 6; x++) { p.set(cx + x, aba - 2, '#2ec870'); p.set(cx + x, aba - 3, '#1e9a50'); }                          // fita verde
  for (const [x, y] of [[-2, -7], [2, -10], [-1, -12]]) p.set(cx + x, aba + y, '#f8e070');                                          // estrelinhas no chapéu
  // olhos verdes que brilham (sem pupila preta quando conjura)
  const olhos = (grande) => { for (const ox of [-5, 2]) { p.ret(cx + ox, hy - 1 - (grande ? 1 : 0), 3, grande ? 3 : 2, VERDE_MAGIA[1]); b.ret(cx + ox, hy - 1 - (grande ? 1 : 0), 3, grande ? 3 : 2, VERDE_MAGIA[1]); if (!conjurar) p.set(cx + ox + 1, hy, '#0e2a14'); } };
  olhos(face === 'alerta' || conjurar);
  if (face === 'rindo' || conjurar) { for (let x = -4; x <= 4; x++) p.set(cx + x, hy + 7 - (Math.abs(x) > 2 ? 1 : 0), K); for (const x of [-2, 0, 2]) p.set(cx + x, hy + 6, '#ffffff'); }
  else if (face === 'alerta') { p.ret(cx - 1, hy + 6, 3, 2, K); }
  else { for (let x = -3; x <= 4; x++) p.set(cx + x, hy + 7 - (x > 1 ? 1 : 0), K); p.set(cx + 2, hy + 7, '#ffffff'); }              // sorriso torto com um dente
  p.contorno('#140a1e');
  return [p, b];
}
// GOBLIN BRUXO DAS TREVAS (o rival do Davi; pedido do usuário: "algo mais ameaçador", sem o manto roxo): capuz pontudo preto com o rosto
// na sombra (só os olhos verdes acesos e o sorriso de dentes pontudos aparecem), manto preto rasgado em tiras, colar de ossinhos,
// grimório preto com runas verdes e cajado retorcido com uma caveira de olhos verdes e chama verde; fumaça escura nos pés.
const TREVAS = ['#0c0c10', '#18181f', '#26262f'], PELE_TREVAS = ['#2a4419', '#3a5a24', '#4c6e30'];
function goblinTrevas({ pagina = 0, face = 'normal', perna = 'parado', dy = 0, conjurar = false, chama = 0 } = {}) {
  const O = 10, W = 30, H = 48, p = new Pix(W, H), b = new Pix(W, H), cx = 13, G = PELE_TREVAS, y0 = 2 + dy + O;
  // CAJADO DE CAVEIRA (pedido do usuário): cabo retorcido e, na ponta, uma caveira grande com os olhos verdes acesos;
  // a chama verde sai do alto da caveira (mais alta quando conjura). Erguido quando conjura.
  const sx = cx + 10, topo = conjurar ? y0 - 6 : y0 - 3;
  for (let y = topo + 8; y < 36 + O + (conjurar ? -3 : 0); y++) { const tx = Math.round(Math.sin(y * 0.7) * 0.8); p.set(sx + tx, y, '#3a2a1e'); p.set(sx + tx + 1, y, '#241810'); }
  p.set(sx - 1, topo + 11, '#3a2a1e'); p.set(sx - 2, topo + 10, '#3a2a1e'); p.set(sx + 2, topo + 13, '#3a2a1e');                   // galhos tortos
  const CAV = ['.XXXXX.', 'XXXXXXX', 'XEEXEEX', 'XEEXEEX', 'XXXNXXX', '.XXXXX.', '.TDTDT.'];
  const OSSO = '#e8e0c8', OSSO2 = '#b8b098', ESC = '#1a1414';
  CAV.forEach((l, j) => [...l].forEach((c, i) => {
    const x = sx - 3 + i, y = topo + j;
    if (c === 'X') p.set(x, y, i >= 5 || j >= 5 ? OSSO2 : OSSO);
    else if (c === 'E') { p.set(x, y, VERDE_MAGIA[1]); b.set(x, y, VERDE_MAGIA[1]); }
    else if (c === 'N' || c === 'D') p.set(x, y, ESC);
    else if (c === 'T') p.set(x, y, OSSO);
  }));
  const ch = conjurar ? 5 : 2 + chama;                                                                                               // chama verde saindo do alto da caveira
  for (let k = 0; k < ch + 1; k++) { const w = Math.max(0, Math.round((ch + 1 - k) * 0.5)); for (let x = -w; x <= w; x++) { const c = k < 1 ? VERDE_MAGIA[2] : x === 0 && k < ch ? VERDE_MAGIA[0] : VERDE_MAGIA[1]; p.set(sx + x, topo - 1 - k, c); b.set(sx + x, topo - 1 - k, c); } }
  // pés e fumaça escura saindo do chão
  const pernas = { parado: [[-4, 0], [2, 0]], a: [[-4, -1], [2, 0]], b: [[-4, 0], [2, -1]] }[perna];
  for (const [px, py] of pernas) p.ret(cx + px - 1, 34 + O + py + dy, 4, 2, '#0a0a0c');
  for (const [x, y] of [[-9, 35], [-7, 34], [7, 35], [9, 34], [-11, 36], [11, 36], [0, 36]]) p.set(cx + x, y + O + dy, '#2a2232');
  // manto preto, comprido, rasgado em tiras na barra
  for (let y = 17; y < 35; y++) { const w = 5 + Math.round((y - 17) * 0.4); for (let x = -w; x <= w; x++) {
    if (y > 31 && ((x + 20) % 3 === 0 || (y > 33 && (x + 20) % 3 === 1))) continue;                                              // tiras rasgadas
    p.set(cx + x, y + dy + O, Pix.tom(TREVAS, 0.75 - (x / w) * 0.35 - (y - 17) * 0.02, cx + x, y)); } }
  p.ret(cx - 1, 19 + dy + O, 1, 12, '#050507');
  for (const [x, y] of [[-4, 18], [-3, 19], [-1, 20], [1, 20], [3, 19], [4, 18]]) p.set(cx + x, y + dy + O, '#d8d0b8');             // colar de ossinhos
  p.set(cx, 21 + dy + O, '#e8e0c8');
  // braços: grimório preto (esquerda) e mão ossuda no cajado (direita)
  p.ret(cx - 8, 21 + dy + O, 3, 6, TREVAS[1]); p.ret(cx + 6, 21 + dy + O, 3, 6, TREVAS[1]); p.ret(cx + 7, 27 + dy + O, 3, 2, G[1]);
  const lx = cx - 13, ly = 22 + dy + O;
  p.ret(lx, ly, 7, 8, '#141010'); p.ret(lx, ly, 7, 1, '#2a2020'); p.ret(lx + 6, ly, 1, 8, '#050505');
  p.ret(lx + 1, ly + 1, 5, 6, '#c8bc9c'); p.ret(lx + 3, ly + 1, 1, 6, '#9a8e70');
  for (const [x, y] of [[lx + 2, ly + 3], [lx + 4, ly + 2], [lx + 4, ly + 4], [lx + 2, ly + 5]]) { p.set(x, y, '#2ec870'); b.set(x, y, '#2ec870'); }
  if (pagina) p.ret(lx + 3, ly - 1, 3, 4, '#d8ccac');
  // capuz pontudo preto (atrás), cabeça escura e orelhas furando o capuz
  const hy = 10 + dy + O;
  p.elipse(cx, hy, 10, 9.5, (x, y, ex, ey) => Pix.tom(TREVAS, 0.7 - ex * 0.3 - ey * 0.4, x, y));
  for (let k = 0; k < 9; k++) { const w = Math.max(0, Math.round(4 - k * 0.45)), dx = Math.round(k * 0.35); for (let x = -w; x <= w; x++) p.set(cx + x + dx, hy - 9 - k, TREVAS[k < 3 ? 1 : 2]); }   // ponta do capuz caída para trás
  p.elipse(cx, hy + 1, 6.5, 6.2, (x, y, ex, ey) => Pix.tom(G, 0.7 - ex * 0.3 - ey * 0.35, x, y));
  for (const s2 of [-1, 1]) for (let k = 0; k < 6; k++) { const x = cx + s2 * (9 + k), y = hy - Math.round(k * 0.6); p.set(x, y, G[1]); p.set(x, y + 1, G[0]); }
  // sombra do capuz sobre a testa e os olhos (o rosto fica escondido)
  for (let y = hy - 6; y <= hy; y++) for (let x = -7; x <= 7; x++) if (p.opaco(cx + x, y) && (y < hy - 2 || Math.abs(x) > 4 + (y - hy + 2))) p.set(cx + x, y, '#07090a');
  p.ret(cx - 1, hy + 2, 2, 4, G[0]); p.set(cx, hy + 6, G[0]);                                                                       // nariz comprido
  // olhos verdes acesos, puxados (bravos); maiores quando conjura ou em alerta
  const grande = face === 'alerta' || conjurar;
  for (const [ox, dir] of [[-5, 1], [2, -1]]) {
    const pts = grande ? [[0, 0], [1, 0], [2, 0], [0, -1], [1, -1], [2, -1]] : [[0, 0], [1, 0], [2, 0], [dir > 0 ? 2 : 0, -1]];
    for (const [x, y] of pts) { p.set(cx + ox + x, hy - 1 + y, VERDE_MAGIA[1]); b.set(cx + ox + x, hy - 1 + y, VERDE_MAGIA[1]); }
    p.set(cx + ox + 1, hy - 1, VERDE_MAGIA[0]); b.set(cx + ox + 1, hy - 1, VERDE_MAGIA[0]);
  }
  // sorriso de dentes pontudos (abre mais rindo/conjurando)
  const abre = face === 'rindo' || conjurar;
  for (let x = -4; x <= 4; x++) { p.set(cx + x, hy + 6, '#0a0a0a'); if (abre) p.set(cx + x, hy + 7, '#0a0a0a'); }
  for (const x of [-3, -1, 1, 3]) p.set(cx + x, hy + 6, '#f0ead8');
  if (abre) for (const x of [-2, 0, 2]) p.set(cx + x, hy + 7, '#f0ead8');
  p.contorno('#050507');
  return [p, b];
}

function spriteGoblin(desenho) {
  const quadros = [], brilho = [], add = (op) => { const [q, b] = desenho(op); quadros.push(q); brilho.push(b); return quadros.length - 1; };
  const a0 = add({}), a1 = add({ pagina: 1, chama: 1 }), a2 = add({ dy: 1, chama: 1 });
  const f0 = add({ face: 'feliz' }), f1 = add({ face: 'feliz', dy: 1, chama: 1 });
  const r0 = add({ face: 'rindo', chama: 1 }), r1 = add({ face: 'rindo', dy: 1 });
  const al = add({ face: 'alerta' });
  const c0 = add({ conjurar: true }), c1 = add({ conjurar: true, dy: -1 });
  const wa = add({ perna: 'a' }), wb = add({ perna: 'b', dy: 1, chama: 1 });
  return { quadros, brilho,
    anims: { parado: { q: [a0, a1, a0, a1, a2, a0], fps: 6 }, anotando: { q: [a0, a1], fps: 6 }, feliz: { q: [f0, f0, f1, f1], fps: 3 },
      rindo: { q: [r0, r1], fps: 6 }, alerta: { q: [al], fps: 1 }, conjurar: { q: [c0, c1], fps: 6 },
      andando: { q: [wa, a0, wb, a0], fps: 8 }, correndo: { q: [wa, a0, wb, a0], fps: 14 }, pulando: { q: [wa], fps: 1 } },
    sombra: true, personagem: true };
}

// ---------------------------------------------------------------- heróis aventureiros (gerador de pessoas) + deitados (dormindo)
// Desenho próprio: armadura de couro, capa curta, cabelos e cores diferentes (nada de túnica verde nem gorro pontudo).
export const HEROIS = {
  'heroi-aventureiro': { cores: { pele: '#f0c4a0', cabelo: '#c8562a', tronco: '#8a5a34', calca: '#3a3a4a', sapato: '#4a3424', capa: '#c8383a', cinto: '#4a2a1a' },
    cabelo: 'bagunçado', capa: true, cinto: true, baixo: 'calca' },
  'heroi-aventureira': { cores: { pele: '#d89a70', cabelo: '#1e1a24', tronco: '#6a4a34', calca: '#4a3a2a', sapato: '#3a2418', capa: '#3a6ac8', cinto: '#2a1e14' },
    cabelo: 'rabo', capa: true, cinto: true, baixo: 'calca' },
  'heroi-grandao': { cores: { pele: '#b07a54', cabelo: '#2a1e1a', bigode: '#2a1e1a', tronco: '#7a6a5a', calca: '#3a3a44', sapato: '#2a2420', capa: '#e8b030', cinto: '#4a3424' },
    cabelo: 'careca', bigode: true, capa: true, cinto: true, corpo: 'largo', baixo: 'calca' },
};
// deitado no chão (90°, cabeça para a direita), olhos fechados: o herói que caiu dormindo
function deitado(preset) {
  const s = pessoa(preset), q = s.quadros[s.anims['rosto-feliz']?.q?.[0] ?? 0];
  const r = new Pix(q.h, q.w);
  for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) { const i = (y * q.w + x) * 4; if (q.d[i + 3]) r.set(q.h - 1 - y, x, [q.d[i], q.d[i + 1], q.d[i + 2]]); }
  // corta as linhas vazias de baixo para o corpo encostar no chão
  let base = r.h - 1; while (base > 0 && ![...Array(r.w).keys()].some((x) => r.d[(base * r.w + x) * 4 + 3])) base--;
  const t = new Pix(r.w, base + 2); for (let y = 0; y <= base; y++) for (let x = 0; x < r.w; x++) { const i = (y * r.w + x) * 4; if (r.d[i + 3]) t.set(x, y + 1, [r.d[i], r.d[i + 1], r.d[i + 2]]); }
  return { quadros: [t], anims: { parado: { q: [0] } }, sombra: true };
}

// ---------------------------------------------------------------- objetos
// espada curta de ferro (vai na mão do herói com "sobre": { id, dx: 0.45, dy: 0.8 }). Todos os estados no mesmo quadro de 40x20,
// com o cabo no meio-embaixo (a mão): parado = de pé; golpe-dir / golpe-esq = deitada, apontando para o lado do golpe (a ação
// "golpe" troca sozinha para esse estado por ~0,25 s e volta).
function espada(estado = 'parado') {
  const W = 40, H = 20, p = new Pix(W, H), L = '#f0f4fa', M = '#c8ccd8', S = '#8a8e9a', G = '#8a6a3a', g = '#c8a060', C = '#5a3a22';
  if (estado === 'parado') {
    const x0 = 17;
    p.ret(x0 + 3, 1, 1, 1, L); p.ret(x0 + 2, 2, 3, 10, M); p.ret(x0 + 3, 2, 1, 10, L); p.ret(x0 + 4, 3, 1, 9, S);
    p.ret(x0, 12, 7, 2, G); p.ret(x0, 12, 7, 1, g); p.ret(x0 + 2, 14, 3, 4, C); p.ret(x0 + 2, 18, 3, 1, g);
  } else {
    const d = estado === 'golpe-esq' ? -1 : 1, X = (x) => (d > 0 ? x : W - 1 - x), y = 11;
    for (let x = 22; x <= 37; x++) { p.set(X(x), y - 1, L); p.set(X(x), y, M); p.set(X(x), y + 1, S); }   // lâmina deitada
    p.set(X(38), y, L);
    for (let k = -3; k <= 3; k++) p.set(X(21), y + k, k === -3 ? g : G);                                     // guarda
    for (let x = 17; x <= 20; x++) { p.set(X(x), y - 1, C); p.set(X(x), y, C); p.set(X(x), y + 1, C); }      // cabo
    p.set(X(16), y, g);
    for (const [x, yy] of [[30, y - 3], [34, y - 4], [26, y - 2]]) p.set(X(x), yy, '#ffffff');               // brilho do corte
  }
  return p.contorno('#1e1a24');
}
function chapeuSolto(grande) {   // o chapéu do Davi sozinho (voa com "mover"/"pular" e volta para a cabeça)
  const p = new Pix(24, 14);
  chapeuTico(p, 12, 1, grande, grande ? CHAPEU_GRANDE : CHAPEU);
  return p.contorno(K);
}

registrarSprites({
  'cogumelo-davi': () => spriteTico(),
  'cogumelo-comum': () => spriteCogumeloComum(0),
  'cogumelo-roxo': () => spriteCogumeloComum(1),
  'cogumelo-verde': () => spriteCogumeloComum(2),
  goblin: () => spriteGoblin(goblinTrevas),
  'goblin-mago': () => spriteGoblin(goblinMago),
  ...Object.fromEntries(Object.entries(HEROIS).map(([k, p]) => [k, () => pessoa(p)])),
  ...Object.fromEntries(Object.entries(HEROIS).map(([k, p]) => [k + '-dormindo', () => deitado(p)])),
  'espada-heroi': () => ({ quadros: [espada(), espada('golpe-dir'), espada('golpe-esq')], anims: { parado: { q: [0] }, 'golpe-dir': { q: [1] }, 'golpe-esq': { q: [2] } }, sombra: false }),
  'chapeu-davi': () => ({ quadros: [chapeuSolto(false), chapeuSolto(true)], anims: { parado: { q: [0] }, grande: { q: [1] } }, sombra: true }),
}, { grupo: 'Isekai (o cogumelo Davi)', status: 'protótipo', descricoes: {
  'cogumelo-davi': 'o cogumelo protagonista (Davi) do isekai; estados parado/andando/correndo/pulando, assustado, tremendo, sem-chapeu (+andando/tremendo/inspira/espirro), espirro-antes/espirro, feliz, grande (chapéu gigante dourado) e expressões',
  'goblin-mago': 'goblin de chapéu de mago e manto roxo estrelado, guardado para personagens futuros; mesmos estados do goblin',
  goblin: 'o goblin BRUXO DAS TREVAS, rival da série: capuz pontudo preto com o rosto na sombra, manto preto rasgado, colar de ossinhos, grimório, cajado com caveirinha e chama verde, olhos verdes que brilham; parado/anotando, feliz, rindo, alerta, conjurar, andando',
  'cogumelo-comum': 'os outros cogumelos da floresta (figurantes); também cogumelo-roxo e cogumelo-verde',
} });
