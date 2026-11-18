// Personagens detalhados (28x44): frente com respiração e piscar, andar de lado (4 quadros)
// e correr (6 quadros). Desenhados com o sistema de camadas de boneco.js.
import { Boneco, passada } from './boneco.js';
import { registrarSprites } from './sprites.js';

const W = 28, H = 44;

// ======================= MENINA DA CAPA (v2) =======================
const PAL_MENINA = {
  capa: ['#fff3a0', '#f8c82c', '#d48a14', '#5a2c06'],
  bota: ['#ff8070', '#d83a3a', '#982436', '#3a0c18'],
  pele: ['#ffe6cc', '#f8c8a0', '#d89a7a', '#5a2a20'],
  cabelo: ['#9a5a36', '#64361e', '#40200f', '#1e0c06'],
  meia: ['#5a6ab0', '#36428a', '#222a5c', '#0e1024'],
  guarda: ['#6ac0f0', '#2a7cc8', '#1a4a8a', '#08183a'],
};

function meninaFrente({ resp = 0, piscar = false, passo = 0 } = {}) {
  const b = new Boneco(W, H);
  const C = b.material(PAL_MENINA.capa, { sombraLarga: true }), B = b.material(PAL_MENINA.bota), S = b.material(PAL_MENINA.pele);
  const Hh = b.material(PAL_MENINA.cabelo), M = b.material(PAL_MENINA.meia), U = b.material(PAL_MENINA.guarda);
  const r = resp; // respiração: tronco e cabeça sobem 1px
  // guarda-chuva fechado (atrás, na mão direita)
  b.poli([[21.5, 31 - r], [24, 31 - r], [24.5, 37], [23, 42], [21, 37]], U);
  b.traco(22.8, 26 - r, 22.8, 31 - r, 0.5, U);
  // pernas e galochas
  const pl = passo, pr = -passo;
  b.ret(9, 33, 3, 5 + Math.min(0, pl), M); b.ret(15, 33, 3, 5 + Math.min(0, pr), M);
  b.poli([[8, 37 + Math.min(0, pl)], [12.5, 37 + Math.min(0, pl)], [13, 42 + Math.min(0, pl)], [7.5, 42 + Math.min(0, pl)]], B);
  b.poli([[14.5, 37 + Math.min(0, pr)], [19, 37 + Math.min(0, pr)], [19.5, 42 + Math.min(0, pr)], [14, 42 + Math.min(0, pr)]], B);
  // capa (corte em A, barra irregular)
  b.poli([[8.5, 16 - r], [18.5, 16 - r], [22.5, 33], [20, 34.5], [14, 33.6], [7, 34.5], [4.5, 33]], C);
  // braços
  b.poli([[7.5, 17.5 - r], [10, 18 - r], [8.6, 29 - r], [5, 29 - r]], C);
  b.poli([[17, 18 - r], [19.6, 17.5 - r], [23, 28.5 - r], [19.6, 29 - r]], C);
  b.elipse(6.8, 30 - r, 1.7, 1.4, S); b.elipse(21.4, 29.7 - r, 1.7, 1.4, S);
  // capuz + rosto + franja assimétrica
  b.elipse(13.6, 9.6 - r, 9.2, 8.4, C);
  b.elipse(14.2, 11.4 - r, 6.1, 5.4, S);
  b.poli([[7.6, 6.5 - r], [19.8, 6.2 - r], [20.6, 10 - r], [18.4, 8.6 - r], [16.6, 10.6 - r], [14.6, 8.4 - r], [11.6, 11.2 - r], [9.6, 9 - r], [7.8, 10.8 - r]], Hh);
  // detalhes
  const o = (y) => Math.round(y - r);
  if (piscar) { b.pinta(11, o(12), '#a06a58'); b.pinta(12, o(12), '#a06a58'); b.pinta(16, o(12), '#a06a58'); b.pinta(17, o(12), '#a06a58'); }
  else { for (const x of [12, 16]) { b.pinta(x, o(11), '#2a1410'); b.pinta(x, o(12), '#2a1410'); } b.pinta(16, o(11), '#5a3830'); }
  b.pinta(10, o(13), '#f39080'); b.pinta(18, o(13), '#f39080');
  b.pinta(14, o(14.6), '#a04a3a'); b.pinta(15, o(14.6), '#a04a3a');
  for (const [x, y] of [[11, 17], [11, 18], [17, 17], [17, 18]]) b.pinta(x, o(y), '#f4f4f0');
  b.pinta(11, o(19), '#8a8a98'); b.pinta(17, o(19), '#8a8a98');
  for (let y = 19; y < 33; y++) b.tom(13, o(y), 'sombra');            // abertura da capa
  for (const y of [21, 25, 29]) { b.pinta(14, o(y), '#5a2c06'); b.pinta(15, o(y), '#5a2c06'); } // botões tipo pino
  for (let x = 16; x < 20; x++) b.tom(x, o(27), 'sombra');            // bolso
  for (let y = 19; y < 29; y++) b.pinta(9 + Math.floor((y - 19) / 5), o(y), '#fff8c8'); // reflexo do plástico
  b.pinta(23, o(26), '#9ad8ff');
  b.pinta(9, 38 + Math.min(0, pl), '#ffb0a0'); b.pinta(15, 38 + Math.min(0, pr), '#ffb0a0'); // brilho da galocha
  return b.render();
}

function meninaLado(t, { correr = false } = {}) {
  const b = new Boneco(W, H);
  const C = b.material(PAL_MENINA.capa, { sombraLarga: true }), B = b.material(PAL_MENINA.bota), S = b.material(PAL_MENINA.pele);
  const Hh = b.material(PAL_MENINA.cabelo), M = b.material(PAL_MENINA.meia), U = b.material(PAL_MENINA.guarda);
  const g = passada(t, correr ? { passo: 6, levanta: 4 } : { passo: 3.6, levanta: 2.2 });
  const incl = correr ? 2.5 : 0;           // inclinação para frente
  const pulo = correr ? Math.round(Math.abs(Math.sin(t * Math.PI * 2)) * 1.5) : Math.round(Math.abs(Math.sin(t * Math.PI * 2)));
  const y0 = -pulo;
  // pernas: saem abaixo da barra da capa; a de trás é mais escura (profundidade)
  const Mb = b.material(['#36428a', '#222a5c', '#161c40', '#0e1024']), Bb = b.material(['#b02c34', '#8a2030', '#64162a', '#3a0c18']);
  const perna = (pe, m, mb) => {
    b.traco(13.5 + incl * 0.2, 33 + y0, pe.x, pe.y - 3, 1.1, m);
    b.poli([[pe.x - 2.4, pe.y - 4], [pe.x + 1.6, pe.y - 4], [pe.x + 3.4, pe.y], [pe.x - 2.4, pe.y]], mb);
  };
  // braço de trás + guarda-chuva
  const bt = -g.braco * (correr ? 4 : 2.5);
  b.traco(13 + incl, 19 + y0, 13 + incl + bt, 27 + y0, 1.2, C);
  b.poli([[12 + incl + bt * 1.4, 27 + y0], [14 + incl + bt * 1.4, 27 + y0], [13.5 + incl + bt * 2.4, 39 + y0], [12.6 + incl + bt * 2.4, 39 + y0]], U);
  // corpo (capa de lado) com barra balançando
  const balanco = Math.sin(t * Math.PI * 2) * (correr ? 2 : 1);
  b.poli([[10 + incl, 16 + y0], [17 + incl, 16 + y0], [19.5 + balanco * 0.5, 32.5 + y0], [7.5 - balanco, 33.5 + y0]], C);
  perna(g.tras, Mb, Bb);
  perna(g.frente, M, B);
  // cabeça de perfil
  b.elipse(13.4 + incl, 9.8 + y0, 8.6, 8.4, C);
  b.elipse(17.6 + incl, 11.6 + y0, 4.3, 5.2, S);
  b.poli([[13 + incl, 5 + y0], [21 + incl, 5.8 + y0], [22 + incl, 10 + y0], [19.6 + incl, 8.6 + y0], [17 + incl, 10.4 + y0], [14 + incl, 8 + y0]], Hh);
  // braço da frente
  const bf = g.braco * (correr ? 4 : 2.5);
  b.traco(14 + incl, 19 + y0, 14.5 + incl + bf, 27.5 + y0, 1.3, C);
  b.elipse(14.8 + incl + bf, 29 + y0, 1.6, 1.4, S);
  const e = Math.round(19 + incl), ey = Math.round(11 + y0);
  b.pinta(e, ey, '#2a1410'); b.pinta(e, ey + 1, '#2a1410'); b.pinta(e - 1, ey + 2, '#f39080');
  b.pinta(e + 2, ey + 3, '#a04a3a');
  for (let y = 19; y < 30; y++) b.pinta(Math.round(11 + incl + (y - 19) * 0.12), Math.round(y + y0), '#fff8c8');
  return b.render();
}

function meninaV2() {
  const q = [meninaFrente(), meninaFrente({ piscar: true }), meninaFrente({ resp: 1 })];
  const andar = [0, 0.25, 0.5, 0.75].map((t) => meninaLado(t));
  const correr = [0, 1, 2, 3, 4, 5].map((i) => meninaLado(i / 6, { correr: true }));
  const quadros = [...q, ...andar, ...correr];
  return {
    quadros,
    anims: {
      parado: { q: [0, 0, 2, 2, 0, 0, 2, 2, 1, 2], fps: 4 },
      andando: { q: [3, 4, 5, 6], fps: 7, passada: 14 },     // passada = pixels percorridos por ciclo
      correndo: { q: [7, 8, 9, 10, 11, 12], fps: 13, passada: 24 },
      pulando: { q: [9], fps: 1 },
    },
    sombra: true, personagem: true,
  };
}

// ======================= ROBÔ SEMÁFORO (v2) =======================
const PAL_ROBO = {
  caixa: ['#4e8a62', '#2f6446', '#1d4430', '#08170f'],
  metal: ['#b8bcc8', '#7a7e8e', '#4e5262', '#14161e'],
  viseira: ['#2a3e32', '#1a2a22', '#0e1812', '#040806'],
  verm: ['#8a3a3a', '#5a1e22', '#3e1218', '#14060a'],
  ambar: ['#8a7230', '#5a4a1a', '#3e3210', '#141006'],
  verde: ['#e0ffd8', '#5ef070', '#26b048', '#0a3a18'],
  botao: ['#fff08a', '#f0c830', '#b08a18', '#3a2a06'],
};

function roboFrente({ piscar = false, aceno = 0, resp = 0 } = {}) {
  const b = new Boneco(W, H);
  const X = b.material(PAL_ROBO.caixa, { sombraLarga: true }), Mt = b.material(PAL_ROBO.metal), V = b.material(PAL_ROBO.viseira);
  const R = b.material(PAL_ROBO.verm), A = b.material(PAL_ROBO.ambar), G = b.material(PAL_ROBO.verde, { borda: false }), Bt = b.material(PAL_ROBO.botao);
  const r = resp;
  // pernas (tubos) e base
  b.ret(9, 34, 3, 6, Mt); b.ret(16, 34, 3, 6, Mt);
  b.poli([[6.5, 40], [13, 40], [13.5, 43], [6, 43]], Mt); b.poli([[14.5, 40], [21, 40], [21.5, 43], [14, 43]], Mt);
  // braço esquerdo (abaixado) atrás
  b.traco(6, 20 - r, 4, 29 - r, 0.9, Mt); b.ret(2.5, 29 - r, 3, 3, Mt);
  // caixa principal
  b.ret(6, 3 - r, 16, 31, X);
  b.ret(10, 1 - r, 8, 2, Mt); b.ret(13, -1 - r, 2, 2, Mt);
  // lâmpadas + viseiras
  const lamp = (cy, m) => { b.elipse(14, cy - r, 4.3, 4.3, m); b.poli([[8.6, cy - 4.6 - r], [19.4, cy - 4.6 - r], [20.4, cy - 2.4 - r], [7.6, cy - 2.4 - r]], V); };
  lamp(9, R); lamp(18.5, A); lamp(28, G);
  // braço direito acenando
  const ax = 23 + aceno, ay = 13 - r - aceno;
  b.traco(21.5, 21 - r, ax, ay + 4, 0.9, Mt); b.ret(ax - 1, ay, 3, 3, Mt);
  // caixinha do botão de pedestre (assimetria)
  b.ret(21, 25 - r, 5, 7, Bt);
  // detalhes
  const o = (y) => Math.round(y - r);
  for (const [x, y] of [[7, 4], [20, 4], [7, 32], [20, 32], [7, 18], [20, 18]]) b.pinta(x, o(y), '#9ad0a8');
  b.pinta(11, o(8), '#c86a6a'); b.pinta(11, o(17.5), '#c8a860');         // brilho das lâmpadas apagadas
  if (piscar) { b.pinta(12, o(28), '#26b048'); b.pinta(16, o(28), '#26b048'); b.pinta(12, o(27), '#0a3a18'); b.pinta(16, o(27), '#0a3a18'); }
  else { for (const x of [12, 16]) { b.pinta(x, o(27), '#0a3a18'); b.pinta(x, o(28), '#0a3a18'); } }
  for (const x of [13, 14, 15]) b.pinta(x, o(30), '#0a3a18'); b.pinta(12, o(29), '#0a3a18'); b.pinta(16, o(29), '#0a3a18');
  b.pinta(11, o(26), '#ffffff');
  b.pinta(23, o(27), '#14161e'); b.pinta(24, o(27), '#14161e'); b.pinta(23, o(28), '#c83030'); b.pinta(24, o(28), '#c83030');
  for (const x of [22, 23, 24]) b.pinta(x, o(30), '#3a2a06');
  b.pinta(10, 41, '#e0e4f0'); b.pinta(15, 41, '#e0e4f0');
  for (let y = 5; y < 33; y += 9) b.pinta(18, o(y + 5), '#1d4430');
  return b.render();
}

function roboLado(t, { correr = false } = {}) {
  const b = new Boneco(W, H);
  const X = b.material(PAL_ROBO.caixa, { sombraLarga: true }), Mt = b.material(PAL_ROBO.metal), V = b.material(PAL_ROBO.viseira);
  const R = b.material(PAL_ROBO.verm), A = b.material(PAL_ROBO.ambar), G = b.material(PAL_ROBO.verde, { borda: false });
  const g = passada(t, correr ? { passo: 5, levanta: 3.5, quadril: [13, 34] } : { passo: 3, levanta: 2, quadril: [13, 34] });
  const incl = correr ? 2 : 0, y0 = -Math.round(Math.abs(Math.sin(t * Math.PI * 2)) * (correr ? 1.5 : 1));
  const perna = (pe) => { b.traco(13, 34 + y0, pe.x, pe.y - 2, 1, Mt); b.poli([[pe.x - 3, pe.y - 2.5], [pe.x + 3, pe.y - 2.5], [pe.x + 3.5, pe.y], [pe.x - 3, pe.y]], Mt); };
  perna(g.tras);
  b.traco(13 + incl, 18 + y0, 13 + incl - g.braco * 3, 27 + y0, 0.9, Mt);
  b.ret(9 + incl, 3 + y0, 10, 31, X); b.ret(11 + incl, 1 + y0, 5, 2, Mt);
  const lamp = (cy, m) => { b.elipse(18.5 + incl, cy + y0, 2.4, 4, m); b.poli([[15 + incl, cy - 4.8 + y0], [22.5 + incl, cy - 4.4 + y0], [22.5 + incl, cy - 2.8 + y0], [15 + incl, cy - 2.8 + y0]], V); };
  lamp(9, R); lamp(18.5, A); lamp(28, G);
  perna(g.frente);
  b.traco(14 + incl, 18 + y0, 14 + incl + g.braco * 3.5, 27 + y0, 0.9, Mt);
  b.ret(13 + incl + g.braco * 3.5, 27 + y0, 3, 3, Mt);
  const e = Math.round(19 + incl), ey = Math.round(27 + y0);
  b.pinta(e, ey, '#0a3a18'); b.pinta(e, ey + 1, '#0a3a18'); b.pinta(e + 1, ey + 3, '#0a3a18'); b.pinta(e, ey + 3, '#0a3a18');
  for (const [x, y] of [[10, 4], [10, 32], [10, 18]]) b.pinta(Math.round(x + incl), Math.round(y + y0), '#9ad0a8');
  return b.render();
}

function roboV2() {
  const q = [roboFrente(), roboFrente({ piscar: true }), roboFrente({ aceno: 2 }), roboFrente({ resp: 1 })];
  const andar = [0, 0.25, 0.5, 0.75].map((t) => roboLado(t));
  const correr = [0, 1, 2, 3, 4, 5].map((i) => roboLado(i / 6, { correr: true }));
  return {
    quadros: [...q, ...andar, ...correr],
    anims: {
      parado: { q: [0, 3, 0, 3, 2, 0, 2, 0, 3, 1], fps: 4 },
      andando: { q: [4, 5, 6, 7], fps: 6, passada: 12 },
      correndo: { q: [8, 9, 10, 11, 12, 13], fps: 12, passada: 20 },
      pulando: { q: [10], fps: 1 },
    },
    sombra: true, personagem: true,
    luz: { cor: '#60ff80', intensidade: 0.9, alcance: 3, dy: 1, dz: 0.6 },
  };
}

registrarSprites({
  'menina-capa': () => meninaV2(),
  'robo-semaforo': () => roboV2(),
  // nomes usados antes (continuam funcionando)
  'menina-capa-detalhada': () => meninaV2(),
  'robo-semaforo-detalhado': () => roboV2(),
});
