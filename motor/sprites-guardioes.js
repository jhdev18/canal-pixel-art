// PROTÓTIPO (aguardando aprovação): pequenos guardiões com jeito de gente.
// Usam o mesmo gerador dos moradores (28x44, frente + andar/correr de lado, caminhada clássica),
// então já funcionam na vista diorama. Corpo de criança = guardiões pequenos.
import { pessoa } from './sprites-cidade.js';
import { registrarSprites } from './sprites.js';

const BASE = { cabelo: 'curto', chapeu: 'elmo', baixo: 'calca', corpo: 'crianca', capa: true, cinto: true, emblema: true };
const COURO = { lanca: '#7a4a2a', metal: '#dfe3ee', cinto: '#5a3a20', sapato: '#4a3020' };

export const GUARDIOES = {
  // lança, elmo prateado com pluma vermelha
  'guardiao-azul': { ...BASE, lanca: true,
    cores: { ...COURO, pele: '#e0a882', cabelo: '#3a2618', tronco: '#3a6ac8', calca: '#2a3058', chapeu: '#c8ccd8', aba: '#8a90a2', pluma: '#d83a3a', capa: '#b8303a', emblema: '#f0c840' } },
  // escudo de madeira, elmo de bronze, cabelo comprido
  'guardia-verde': { ...BASE, cabelo: 'longo', escudo: true,
    cores: { ...COURO, pele: '#8a5a40', cabelo: '#1e1410', tronco: '#3a9a5a', calca: '#2a4a34', chapeu: '#c8a040', aba: '#8a6a24', pluma: '#f4f0e4', capa: '#2a5a8a', escudo: '#a0622a', emblema: '#f4f0e4' } },
  // chefe: elmo dourado, lança e escudo, bigode grisalho
  'guardiao-chefe': { ...BASE, cabelo: 'grisalho', bigode: true, lanca: true, escudo: true,
    cores: { ...COURO, pele: '#f0c4a0', cabelo: '#b8b8c0', bigode: '#d0d0d8', tronco: '#7a3aa0', calca: '#3a2a4a', chapeu: '#e8c040', aba: '#a8801e', pluma: '#4ad0e8', capa: '#f0ece0', escudo: '#c8ccd8', emblema: '#e8c040' } },
  // ronda da noite: cores escuras, pluma roxa
  'guardiao-noturno': { ...BASE, lanca: true,
    cores: { ...COURO, pele: '#c88a64', cabelo: '#1a1410', tronco: '#2e2e52', calca: '#1c1c30', chapeu: '#6a6a82', aba: '#44445a', pluma: '#9a5ad8', capa: '#1e1a2e', emblema: '#9a5ad8' } },
};

registrarSprites(Object.fromEntries(Object.entries(GUARDIOES).map(([k, p]) => [k, () => pessoa(p)])));
