// PROTÓTIPO (aguardando aprovação): INTERIOR DA DELEGACIA no sistema de cômodos em diorama (o mesmo da sala de aula).
// Cenários: delegacia-diorama / delegacia-noite-diorama (em prototipos/cenarios.json).
// Móveis novos: balcao-delegacia, mesa-escritorio (com computador), cadeira-escritorio, arquivo, cela, bebedouro.
// Lugares (aprox.; z 0 = frente, ~3.8 = parede do fundo):
//   policial atrás do balcão: x ~0.6, z ~2.6 · quem chega no balcão: x ~0.6, z ~0.8
//   na mesa do computador: x ~-4.4, z ~2.4 (sentado: "pose": "sentado") · dentro da cela: x ~7.4, z ~2.6
import { MOVEIS, COMODOS_DIAGONAL } from '../cenarios/comodoDiagonal.js';
import { PRESETS_INTERIORES } from '../cenarios/interiores.js';

const MAD = ['#c89060', '#a8703e', '#7a4e2a'], ACO = ['#c4cad4', '#9aa2b0', '#6a7282'], ESC = '#2a2e3a', K = '#1a1c2c';
const AZUL = ['#5a7ac8', '#3a5aa8', '#2a4280'], OURO = '#f0c840';

Object.assign(MOVEIS, {
  // balcão de atendimento: madeira com faixa azul e o distintivo (estrela) na frente
  'balcao-delegacia': { di: 0.8, dj: 3.2, f(L, m) {
    const { i0, i1, j0, j1 } = m, meio = (j1 - j0) / 2;
    L.caixa(i0, i1, j0, j1, 0, 20, {
      frente: (u, t) => {
        const dx = (u - meio) * 16, dy = t - 11;
        if (Math.abs(dx) + Math.abs(dy) * 0.8 < 3.2) return OURO;                     // estrela/distintivo
        if (t < 2) return MAD[2]; if (t > 12 && t < 15) return AZUL[1];
        return u < 0.06 || u > (j1 - j0) - 0.06 ? MAD[2] : MAD[1];
      },
      lado: (u, t) => (t > 12 && t < 15 ? AZUL[2] : MAD[2]), topo: MAD[0] });
    L.caixa(i0 + 0.1, i0 + 0.35, j0 + 0.4, j0 + 0.9, 20, 1, '#f4f0e8');              // papéis
    L.caixa(i0 + 0.15, i0 + 0.35, j1 - 0.8, j1 - 0.5, 20, 3, { frente: '#c83c4c', lado: '#8a2a3a', topo: '#e85a5a' });   // telefone
    L.caixa(i0 + 0.2, i0 + 0.3, j1 - 0.35, j1 - 0.25, 20, 6, { frente: ['#f8d040', 2], topo: ['#fff0a0', 2] });           // campainha/luminária
  } },
  // mesa de escritório com computador, teclado, pilha de pastas e caneca
  'mesa-escritorio': { di: 0.9, dj: 1.8, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    for (const [a, b] of [[i0, j0], [i1 - 0.08, j0], [i0, j1 - 0.08], [i1 - 0.08, j1 - 0.08]]) L.caixa(a, a + 0.08, b, b + 0.08, 0, 13, ACO[2]);
    L.caixa(i0, i1, j0, j1, 13, 2, { frente: MAD[2], lado: MAD[2], topo: MAD[0] });
    L.caixa(i0 + 0.05, i0 + 0.3, j0 + 0.5, j0 + 1.2, 15, 12, { frente: (u, t) => (u > 0.08 && u < 0.62 && t > 2 && t < 10 ? ['#7ad0ff', 2] : ESC), lado: ESC, topo: ESC });   // monitor
    L.caixa(i0 + 0.45, i0 + 0.6, j0 + 0.55, j0 + 1.15, 15, 1, '#3a3e4a');           // teclado
    L.caixa(i0 + 0.1, i0 + 0.45, j1 - 0.5, j1 - 0.15, 15, 5, { frente: (u, t) => ['#e8c860', '#7ac0f0', '#f08080'][t % 3], lado: '#c8a040', topo: '#e8c860' });   // pastas
    L.caixa(i1 - 0.25, i1 - 0.12, j0 + 0.15, j0 + 0.28, 15, 4, { frente: '#f4f0e8', topo: '#5a3a20' });   // caneca de café
  } },
  'cadeira-escritorio': { di: 0.5, dj: 0.5, f(L, m) {
    const { i0, i1, j0, j1 } = m, ci = (i0 + i1) / 2, cj = (j0 + j1) / 2;
    L.caixa(ci - 0.2, ci + 0.2, cj - 0.2, cj + 0.2, 0, 1, ESC);
    L.caixa(ci - 0.04, ci + 0.04, cj - 0.04, cj + 0.04, 1, 7, ACO[2]);
    L.caixa(i0, i1, j0, j1, 8, 3, { frente: AZUL[1], lado: AZUL[2], topo: AZUL[0] });
    L.caixa(i1 - 0.1, i1, j0, j1, 11, 12, { frente: AZUL[1], lado: AZUL[2], topo: AZUL[0] });   // encosto (na frente: quem senta olha para o fundo)
  } },
  // arquivo de aço com 3 gavetas
  arquivo: { di: 0.6, dj: 0.7, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 32, { frente: (u, t) => (t % 10 === 0 ? ACO[2] : (t % 10 === 6 && u > 0.25 && u < 0.45) ? ESC : ACO[0]), lado: ACO[1], topo: ACO[0] });
  } },
  // cela com grades (vazadas: dá para ver quem está dentro), banquinho e grade lateral
  cela: { di: 1.6, dj: 2.6, f(L, m) {
    const { i0, i1, j0, j1 } = m, ALT = 48;
    L.caixa(i0, i1, j0, j1, 0, 1, { frente: '#8a909c', lado: '#7a808c', topo: '#9aa0ac' });             // piso da cela
    L.caixa(i0 + 0.05, i0 + 0.5, j0 + 0.2, j1 - 0.2, 1, 8, { frente: MAD[2], lado: MAD[2], topo: MAD[1] });   // banco no fundo
    const barra = (u, t) => (t < 2 || t > ALT - 3 || t === 24 || (Math.floor(u * 16) % 5 === 0) ? (u * 16 % 5 < 1 ? ACO[0] : ACO[1]) : null);
    L.prisma(i1 - 0.05, i1, j0, j1, 0, ALT, { frente: barra, lado: () => ACO[2], topo: () => ACO[1] });   // grade da frente
    L.prisma(i0, i1, j1 - 0.05, j1, 0, ALT, { frente: () => ACO[2], lado: barra, topo: () => ACO[1] });   // grade do lado
    L.caixa(i1 - 0.08, i1, j0 + 0.9, j0 + 1.0, 20, 6, OURO);                                             // fechadura
  } },
  bebedouro: { di: 0.4, dj: 0.4, f(L, m) {
    const { i0, i1, j0, j1 } = m;
    L.caixa(i0, i1, j0, j1, 0, 18, { frente: (u, t) => (t > 12 && t < 15 && u > 0.12 && u < 0.28 ? ACO[2] : '#f4f4f8'), lado: '#d8dae2', topo: '#e8e8f0' });
    L.caixa(i0 + 0.06, i1 - 0.06, j0 + 0.06, j1 - 0.06, 18, 10, { frente: '#8ad0f0', lado: '#6ab0d8', topo: '#3a8ac8' });   // galão
  } },
});

PRESETS_INTERIORES.delegacia = {
  ceu: { cores: ['#dce6f0'] },
  camadas: [{ tipo: 'comodo', z: -3, acima: 140, iluminada: true,
    cor: ['#e4ecf4', '#ccd8e6', '#a0b0c4'], padrao: 'liso', teto: ['#f4f8fc', '#dce4ee', '#a4b0c0'],
    meiaParede: { altura: 34, padrao: 'liso', cores: ['#5a7ac8', '#3a5aa8', '#2a4280'] },
    rodape: ['#2a4280', '#22366a', '#1a2a54'], janelas: [], portas: [], quadros: [] }],
  chao: { estilo: 'piso', topo: ['#eceff3', '#d0d6de', '#8a96a6'], terra: ['#b8c0cc', '#a0a8b4'] },
  ambiente: ['#ffffff', 1.0],
};
PRESETS_INTERIORES['delegacia-noite'] = { ...PRESETS_INTERIORES.delegacia, ceu: { cores: ['#1e2438'] },
  camadas: [{ ...PRESETS_INTERIORES.delegacia.camadas[0], noite: true }], ambiente: ['#7a84c0', 0.62] };

// Paredes: janela com grade, quadro de "procurados" (cartazes), relógio, porta dos fundos; cela à direita.
COMODOS_DIAGONAL.delegacia = {
  estilo: 'delegacia', inicio: -9, fim: 9,
  paredes: [
    { tipo: 'janela', x: -6.4, w: 2.4, peitoril: 44 },
    { tipo: 'poster', x: -3.0, w: 1.0, altura: 50, h: 22, cores: ['#f4ead0', '#e4d8b8'] },
    { tipo: 'poster', x: -1.8, w: 1.0, altura: 50, h: 22, cores: ['#f4ead0', '#e4d8b8'] },
    { tipo: 'relogio', x: 0.6, w: 0.9, altura: 66, h: 14 },
    { tipo: 'porta', x: 3.2, w: 1.8, cor: ['#7a8aa8', '#5a6a88', '#3a4a68'] },
    { tipo: 'porta', lateral: true, x: 2.6, w: 1.8, cor: ['#7a8aa8', '#5a6a88', '#3a4a68'] },
  ],
  moveis: [
    { tipo: 'arquivo', x: -8.2, i: 0 }, { tipo: 'arquivo', x: -7.4, i: 0 },
    { tipo: 'mesa-escritorio', x: -4.4, i: 0.3 }, { tipo: 'cadeira-escritorio', x: -4.4, i: 1.35 },
    { tipo: 'balcao-delegacia', x: 0.6, i: 1.6 }, { tipo: 'bebedouro', x: 4.4, i: 0.1 },
    { tipo: 'cela', x: 7.4, i: 0.1 }, { tipo: 'planta', x: -1.0, i: 0.1 },
  ],
  piso: [],
};
COMODOS_DIAGONAL['delegacia-noite'] = { ...COMODOS_DIAGONAL.delegacia, estilo: 'delegacia-noite', noite: true };
