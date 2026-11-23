import { alturaShorts, turma, marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, terror DE DIA — "consequência inesperada". Feito com as táticas de retenção do vídeo das sombras:
// gato (algo do dia a dia) que SE MEXE sozinho em toda cena, 1ª frase com "você", tudo de dia, evento aos ~33%,
// a Bia AGE na hora H, a virada inverte a crença ("sorte" → "buscar") e a última imagem é o gato seguindo a Bia.
const R = base('Nessa cidade, gato que segue você é sorte');
const C = R.cenas;
const G = (id, x, z, extra = {}) => P(id, 'gato-chapeu', x, z, { figurante: true, ...extra });   // gatos = figurantes (mesmo sprite)
const GM = (id, x, z, extra = {}) => P(id, 'gato-monstro', x, z, { figurante: true, ...extra });  // depois da cena 9: a cara de verdade
// RELANCE: a cara monstruosa aparece por um instante num gato parado (sem som) e some — o público vê que não são o que parecem
const relance = (alvo, f, durF = 0.06, som = false) => [a(f, 'trocar', { alvo, estado: 'monstro' }), a(f + durF, 'trocar', { alvo, estado: 'parado' }),
  ...(som ? [a(f, 'som', { som: 'miau-monstro', volume: 0.7 })] : [])];

// 1. Regra — o gato já está correndo atrás do seu Tonho aos 0,3 s
C.push(cena('Nessa cidade, se um gato começa a seguir você, é sorte pra vida inteira.', {
  // gancho: câmera perto (zoom 2) seguindo o gato, que já corre aos 0 s e mostra a cara de monstro aos ~0,5 s (o seu Tonho de costas)
  cenario: 'rua-comercial', transicao: 'corte', camera: { x: -1.2, z: 2.2, y: 1.5, zoom: 2 }, foco: -1.2, seguir: 'g1',
  elementos: [P('tonho', 'padeiro', -1.6, 5.2), G('g1', -3.2, 4.75)],
  acoes: [{ tipo: 'andar', alvo: 'tonho', para: 3.4, inicio: 0, duracao: 3.1 }, { tipo: 'correr', alvo: 'g1', para: 2.4, inicio: 0, duracao: 3.0 },
    { tipo: 'trocar', alvo: 'g1', estado: 'monstro', inicio: 0.5 }, { tipo: 'som', som: 'miau-monstro', volume: 0.7, inicio: 0.5 }, a(0.3, 'trocar', { alvo: 'g1', estado: 'parado' }),   // ~1 s de cara de monstro e volta ao normal antes de ele parar
    a(0.66, 'virar', { alvo: 'tonho', direcao: 'esquerda' }), a(0.7, 'emocao', { alvo: 'g1', icone: 'coracao' }), a(0.72, 'som', { som: 'miau' })],
}));
// 2. Crença como AÇÃO — todo mundo anda devagarinho para o gato alcançar
C.push(cena('Por isso, todo mundo anda devagarinho, pro gato alcançar.', {
  cenario: 'rua-comercial', camera: RUA(9), foco: 9,
  titulo: 'NESSA CIDADE, GATO QUE SEGUE É SORTE', tituloInicio: 0.3, tituloDuracao: 2.6,
  elementos: [P('prof', 'professora', 7.2, 5.2), G('g2', 4.6, 4.6), P('caixa', 'caixa', 9.0, 5.6), G('g3', 6.2, 4.7)],
  acoes: [a(0.02, 'andar', { alvo: 'prof', para: 10.6, durF: 0.8 }), a(0.02, 'andar', { alvo: 'g2', para: 9.6, durF: 0.8 }),
    a(0.05, 'andar', { alvo: 'caixa', para: 12.4, durF: 0.77 }), a(0.05, 'andar', { alvo: 'g3', para: 11.4, durF: 0.77 }),
    ...relance('g2', 0.4, 0.3, true), ...relance('g3', 0.44, 0.28)],   // atrás das pessoas (de costas), cara de monstro; elas param e viram de frente → normais
}));
// 3. Protagonista diferente (sem som dá para entender): o gato FOGE da Bia
C.push(cena('Mas nenhum gato nunca seguiu a Bia. Todos fogem dela.', {
  cenario: 'rua-comercial', camera: FRENTE(1), foco: 1,
  elementos: [P('bia', 'menina-capa', -2.4, 0.6), G('g4', 4.2, 0.6, { virado: 'esquerda' })],
  acoes: [a(0, 'andar', { alvo: 'bia', para: 1.4, durF: 0.45 }), a(0.4, 'emocao', { alvo: 'g4', icone: '!' }),
    a(0.45, 'correr', { alvo: 'g4', para: 7.4, durF: 0.3 }), a(0.7, 'emocao', { alvo: 'bia', icone: '...' })],
}));
// 4. Ela sofre por isso (uma cena só)
C.push(cena('Na escola, ninguém empresta nem lápis pra azarada.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: 0,
  elementos: turma([P('bia', 'menina-capa', 1.4, 0.75, { pose: 'sentado-lado' }), P('prof', 'professora', 8.1, 1.6, { virado: 'esquerda' })]),
  acoes: [a(0.05, 'andar', { alvo: 'prof', para: 5.2, durF: 0.4 }), a(0.45, 'falar', { alvo: 'nina', texto: '* Sai, azarada!' }),
    a(0.8, 'emocao', { alvo: 'bia', icone: 'gota' })],
}));
// 5. Evento (~33%): TODOS os gatos da cidade atrás do prefeito
C.push(cena('Até que, numa segunda, todos os gatos da cidade saíram atrás do prefeito.', {
  cenario: 'rua-comercial', camera: RUA(8.6), foco: 8.6,
  elementos: [P('prefeito', 'prefeito', 5.6, 5.2), G('c1', 1.6, 5.0), G('c2', 2.6, 4.6), G('c3', 0.6, 4.2), G('c4', 3.4, 4.2), G('c5', -0.4, 4.6)],
  acoes: [a(0, 'andar', { alvo: 'prefeito', para: 11.8, durF: 0.95 }),
    ...['c1', 'c2', 'c3', 'c4', 'c5'].map((id, k) => a(0.05 + k * 0.05, 'correr', { alvo: id, para: [9.4, 10.1, 8.7, 10.8, 8.0][k], durF: 0.85 - k * 0.05 })),   // quem sai na frente chega na frente (ninguém ultrapassa na mesma faixa)
    a(0.3, 'som', { som: 'miau' }), a(0.55, 'som', { som: 'miau', taxa: 1.2 })],
}));
// ---- Praça: o MESMO público nas mesmas posições (momento "praca", cenas 6–9)
const ANEL = [[-2.0, -8.0], [2.0, -7.9], [-1.3, -7.4], [1.3, -7.4], [3.6, -8.8], [-2.8, -7.6], [2.8, -7.6], [-0.9, -9.95], [0.9, -9.95]];
const CAMPO = (perto = 1, extra = []) => [P('prefeito', 'prefeito', 0, -8.4), P('bia', 'menina-capa', -5.6, -9.2), ...extra,
  ...ANEL.map(([x, z], k) => G('p' + k, x * perto, z, { virado: x > 0 ? 'esquerda' : 'direita' }))];
// 6. Escalada em números + pico de movimento no meio
C.push(cena('Primeiro cinco, depois vinte. A praça inteira ficou miando em volta dele.', {
  cenario: 'praca', camera: PRACA(-1), foco: -1,
  elementos: [P('prefeito', 'prefeito', 0, -8.4), P('bia', 'menina-capa', -5.6, -9.2),
    ...ANEL.map(([x, z], k) => G('p' + k, x > 0 ? 7.5 + k * 0.3 : -7.8 - k * 0.3, z, { virado: x > 0 ? 'esquerda' : 'direita' }))],
  acoes: [...ANEL.map(([x], k) => a(0.02 + k * 0.06, 'correr', { alvo: 'p' + k, para: x, durF: 0.35 })),
    a(0.2, 'som', { som: 'miau' }), a(0.5, 'som', { som: 'miau', taxa: 1.3 }), a(0.75, 'som', { som: 'miau', taxa: 0.9 })],
}));
// 7. Detalhe feliz que fica sinistro
C.push(cena('O prefeito ria. Ninguém nunca teve tanta sorte.', {
  cenario: 'praca', camera: { x: -0.4, z: -9.6, zoom: 2 }, foco: 0,
  elementos: CAMPO(),
  acoes: [a(0.05, 'pular', { alvo: 'prefeito', altura: 0.4 }), a(0.4, 'andar', { alvo: 'p2', para: -0.9, durF: 0.3 }), a(0.45, 'andar', { alvo: 'p3', para: 0.9, durF: 0.3 }),
    a(0.6, 'som', { som: 'miau', taxa: 0.95 })],
}));
// 8. Reação + pista: só a Bia vê
C.push(cena('Só a Bia percebeu. Os gatos não estavam felizes. Estavam esperando.', {
  cenario: 'praca', camera: PRACA(-3), foco: -3.4,
  elementos: CAMPO(),
  acoes: [a(0.05, 'andar', { alvo: 'bia', para: -4.2, durF: 0.3 }), a(0.4, 'emocao', { alvo: 'bia', icone: '!' }), a(0.45, 'som', { som: 'suspense' }),
    a(0.62, 'tremer', { intensidade: 0.25, durF: 0.15 })],
}));
// 9. A protagonista AGE na hora H
C.push(cena('Ela correu, puxou o prefeito pela mão e tirou ele da praça.', {
  cenario: 'praca', camera: PRACA(1), foco: 1,
  elementos: [P('prefeito', 'prefeito', 0, -8.4), P('bia', 'menina-capa', -4.2, -9.2),
    ...ANEL.map(([x, z], k) => G('p' + k, x, z, { virado: x > 0 ? 'esquerda' : 'direita' }))],
  acoes: [a(0, 'correr', { alvo: 'bia', para: -0.8, durF: 0.3 }), a(0.35, 'correr', { alvo: 'bia', para: 8.6, durF: 0.6 }),
    a(0.38, 'correr', { alvo: 'prefeito', para: 7.8, durF: 0.57 }),
    ...ANEL.map((_, k) => a(0.72 + k * 0.015, 'trocar', { alvo: 'p' + k, estado: 'monstro' })), a(0.72, 'som', { som: 'sombra' }), a(0.74, 'tremer', { intensidade: 0.3, durF: 0.1 })],
  saiDeCena: ['bia', 'prefeito'],
}));
// 10. Callback de "devagarinho": os gatos vão atrás, sem pressa
C.push(cena('Mas os gatos foram atrás. Devagarinho. Sem pressa nenhuma.', {
  cenario: 'rua-comercial', camera: RUA(4), foco: 4,
  elementos: [P('bia', 'menina-capa', 3.4, 5.25), P('prefeito', 'prefeito', 2.2, 5.2), ...[0, 1, 2, 3, 4].map((k) => GM('r' + k, -3.6 - k * 1.1, k % 2 ? 4.75 : 4.25))],
  acoes: [a(0, 'andar', { alvo: 'bia', para: 9.0, durF: 0.95 }), a(0, 'andar', { alvo: 'prefeito', para: 7.4, durF: 0.95 }),
    ...[0, 1, 2, 3, 4].map((k) => a(0.02, 'andar', { alvo: 'r' + k, para: 3.0 - k * 1.1, durF: 0.96 }))],
}));
// 11. Virada: inverte a crença ("sorte" → "buscar"); os gatos passam reto pelo prefeito e cercam a Bia
C.push(cena('Os gatos nunca trouxeram sorte. Eles vinham buscar.', {
  cenario: 'rua-comercial', camera: RUA(9), foco: 8.6,
  // os gatos se reúnem na frente do prefeito (quem sai na frente chega na frente) e a sombra sobe por todos e leva o prefeito
  elementos: [P('bia', 'menina-capa', 9.0, 5.25), P('prefeito', 'prefeito', 7.4, 5.2), ...[0, 1, 2, 3, 4].map((k) => GM('r' + k, 3.0 - k * 1.1, k % 2 ? 4.75 : 4.25))],
  acoes: [a(0, 'correr', { alvo: 'bia', para: 12.4, durF: 0.25 }),
    ...[0, 1, 2, 3, 4].map((k) => a(0.02 + k * 0.03, 'correr', { alvo: 'r' + k, para: [9.2, 8.4, 7.6, 6.4, 5.8][k], durF: 0.3 })),
    a(0.1, 'emocao', { alvo: 'prefeito', icone: '!' }),
    a(0.42, 'sombra', { origem: [7.4, 4.8], raio: 2.6, durF: 0.3 }), a(0.42, 'som', { som: 'sombra' }), a(0.5, 'tremer', { intensidade: 0.35, durF: 0.12 }),
    a(0.62, 'desaparecer', { alvo: 'prefeito', durF: 0.2 }), ...[0, 1, 2, 3, 4].map((k) => a(0.64 + k * 0.02, 'desaparecer', { alvo: 'r' + k, durF: 0.2 })),
    a(0.8, 'emocao', { alvo: 'bia', icone: '!' })],
  saiDeCena: ['prefeito'],
}));
// 12. Última imagem: o 1º gato da vida da Bia, seguindo ela (callback das cenas 1 e 3)
C.push(cena('E, pela primeira vez na vida, um gato estava seguindo a Bia.', {
  cenario: 'rua-comercial', camera: FRENTE(1), foco: 1,
  elementos: [P('bia', 'menina-capa', -2.6, 0.6), GM('ultimo', -4.0, 0.6)],
  acoes: [a(0, 'andar', { alvo: 'bia', para: 1.4, durF: 0.7 }), a(0.05, 'andar', { alvo: 'ultimo', para: -0.4, durF: 0.7 }),
    a(0.78, 'virar', { alvo: 'bia', direcao: 'esquerda' }), a(0.8, 'trocar', { alvo: 'ultimo', estado: 'pior' }), a(0.8, 'flash', { intensidade: 0.5, durF: 0.04 }),
    a(0.8, 'som', { som: 'revelar' }), a(0.82, 'tremer', { intensidade: 0.35, durF: 0.12 }), a(0.85, 'som', { som: 'miau-monstro' })],   // a cara de monstro vira algo ainda pior
}));

marcar(C, { praca: [[6, 9]] });
rostos(C, [[1, 'tonho', 'feliz', 0.7], [3, 'bia', 'triste', 0.72], [4, 'bia', 'triste', 0.5], [5, 'prefeito', 'feliz', 0.96],
  [6, 'prefeito', 'rindo', 0.5], [6, 'bia', 'pensativo', 0.6], [7, 'prefeito', 'rindo', 0.05], [8, 'bia', 'assustado', 0.4], [8, 'prefeito', 'rindo'],
  [11, 'prefeito', 'assustado', 0.12], [11, 'bia', 'assustado', 0.3], [12, 'bia', 'assustado', 0.82]]);

// Shorts: câmera mais baixa para a legenda fixa embaixo não cobrir ninguém (medido; praça cheia limitada a -2)
alturaShorts(C, { 2: -1.25, 3: -1.5, 4: -2.25, 5: -2.25, 6: -2, 7: -2, 8: -1.5, 9: -2, 10: -2.25, 11: -2, 12: -2.25 });

salvar('nesse-mundo-gatos', ['NESSE MUNDO (curto, terror DE DIA) — "Nessa cidade, se um gato começa a seguir você, é sorte pra vida inteira."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-gatos',
  'Feito com as táticas de retenção do vídeo das sombras (CLAUDE.md). Usa protótipos: gato-chapeu (relances da cara monstruosa: estados monstro/pior), gato-monstro (cenas 10–12), ação sombra e rival (Nina).'], R);
