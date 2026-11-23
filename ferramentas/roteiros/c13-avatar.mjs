import { alturaShorts, marcar, P, S, RUA, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, TERROR de dia (Roblox). "Nesse mundo, seu avatar do Roblox vai ficando igual a você."
// Táticas do vídeo das sombras: a regra (o avatar virando a pessoa) se mexe aos 0,3 s; 1ª frase com "seu/você"; o "Até que..." aos ~34%;
// pico de movimento no meio (a turma andando dura, no mesmo passo); a pista (o avatar da Bia sem rosto) volta no fim; a virada inverte
// a crença ("fica igual" → "trocava de lugar"); a última imagem é o avatar da Bia ganhando o rosto dela, sorrindo.
// Cenas de jogo DENTRO do mundo-bloco; a tela do jogo (monitor) só no mundo real.
const R = base('Nesse mundo, seu avatar do Roblox vai ficando igual a você', 'suspense');
const C = R.cenas;
const JOGO = (x) => ({ x, z: 2.2, y: 2.6 });
const PERTO = (x, y = 1.6) => ({ x, z: 2.2, y, zoom: 2 });

// 1. Regra: aos 0,3 s um avatar azul vira o avatar do Léo (faíscas) e sai andando
C.push(cena('Nesse mundo, seu avatar do Roblox vai ficando igual a você.', {
  cenario: 'mundo-bloco', transicao: 'corte', camera: PERTO(-1, 1.8), foco: -1,
  elementos: [P('azul', 'avatar-bloco-azul', -2.0, 2.8), P('atop', 'avatar-topete', -2.0, 3.3, { oculto: true }), P('a1', 'avatar-bloco-vermelho', 1.6, 3.6, { figurante: true })],
  acoes: [{ tipo: 'andar', alvo: 'a1', para: 4.0, inicio: 0, duracao: 3.2 }, { tipo: 'magia', alvo: 'azul', inicio: 0.15 }, { tipo: 'som', som: 'magia', inicio: 0.15 },
    { tipo: 'sumir', alvo: 'azul', inicio: 0.4, som: null }, { tipo: 'aparecer', alvo: 'atop', inicio: 0.4 }, a(0.45, 'andar', { alvo: 'atop', para: 0.4, durF: 0.5 })],
}));
// 2. Escalada da regra: roupa, cabelo, jeito de andar (o avatar anda; corte de perto no rosto)
C.push(cena('Primeiro a roupa. Depois o cabelo. Depois o jeito de andar.', {
  cenario: 'mundo-bloco', camera: JOGO(0), foco: 0, titulo: 'SEU AVATAR VAI FICANDO IGUAL A VOCÊ', tituloInicio: 0.3, tituloDuracao: 2.4,
  elementos: [P('atop', 'avatar-topete', -3.0, 2.8), P('a1', 'avatar-bloco-vermelho', 3.6, 3.8, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'atop', para: 2.2, durF: 0.75 }), a(0.1, 'andar', { alvo: 'a1', para: 6.2, durF: 0.6 }), a(0.8, 'corte', { zoom: 2, y: 1.6 })],
}));
// 3. Crença como AÇÃO: a criançada joga o dia inteiro (pátio da escola, todos rindo com o jogo)
C.push(cena('Por isso, a criançada joga o dia inteiro para ter o avatar mais parecido.', {
  cenario: 'escola-patio', camera: { x: 0.4, z: 2.2, y: 2.6 }, foco: 0.4,
  elementos: [P('leo', 'menino-topete', -1.6, 3.0), P('aluno', 'aluno', 0.2, 3.4), P('aluna', 'aluna', 1.8, 3.0), P('nina', 'rival', 3.4, 3.6)],
  acoes: [a(0.05, 'pular', { alvo: 'leo', altura: 0.4 }), a(0.25, 'pular', { alvo: 'aluno', altura: 0.35 }), a(0.4, 'andar', { alvo: 'nina', para: 4.6, durF: 0.4 }),
    a(0.55, 'emocao', { alvo: 'aluna', icone: 'coracao' }), a(0.7, 'pular', { alvo: 'leo', altura: 0.4 })],
}));
// 4. A diferença da Bia (se entende sem som): o avatar dela nem tem rosto, parado no spawn, enquanto os outros pulam
C.push(cena('Mas a Bia só pode jogar dez minutos. O avatar dela nem tem rosto.', {
  cenario: 'mundo-bloco', camera: JOGO(-5), foco: -5.6,
  elementos: [P('abiaSem', 'avatar-bloco-verde', -6.0, 2.6, { y: 0.19, pose: 'sem-rosto' }), P('atop', 'avatar-topete', -2.6, 3.6), P('anina', 'avatar-nina', -3.8, 2.0)],
  acoes: [a(0.05, 'pular', { alvo: 'atop', altura: 0.6 }), a(0.2, 'andar', { alvo: 'anina', para: -1.2, durF: 0.5 }), a(0.45, 'pular', { alvo: 'atop', altura: 0.6 }),
    a(0.65, 'corte', { zoom: 2, y: 1.6 }), a(0.68, 'som', { som: 'bug-jogo' })],
}));
// 5. Evento (~34%): o avatar do Léo ficou idêntico a ele
C.push(cena('Até que, numa sexta, o avatar do Léo ficou idêntico a ele.', {
  cenario: 'mundo-bloco', camera: PERTO(0, 1.6), foco: 0,
  elementos: [P('atop', 'avatar-topete', -1.4, 2.8)],
  acoes: [a(0.05, 'andar', { alvo: 'atop', para: 0.2, durF: 0.4 }), a(0.55, 'flash', { intensidade: 0.6 }), a(0.55, 'som', { som: 'revelar' }),
    a(0.58, 'magia', { alvo: 'atop' }), a(0.75, 'pular', { alvo: 'atop', altura: 0.5 })],
}));
// 6. Ele acena pela tela (o Léo no quarto, diante do computador com o jogo aberto) — começa fofo
C.push(cena('Piscava igual. Ria igual. E acenou para ele, pela tela.', {
  cenario: 'quarto-leo-diorama', camera: { x: 1.4, y: 3 }, foco: 1.6,
  elementos: [P('leo', 'menino-topete', -1.4, 1.6)],
  acoes: [a(0.05, 'andar', { alvo: 'leo', para: 1.0, durF: 0.4 }), a(0.75, 'emocao', { alvo: 'leo', icone: '!' }), a(0.78, 'corte', { zoom: 2, y: 2.2 })],
}));
// 7. A ameaça em pedaços: o Léo volta andando duro, com a sombra QUADRADA de avatar; para de frente e o sorriso cresce
C.push(cena('No sábado, o Léo voltou da escola andando duro. Sorrindo.', {
  cenario: 'rua-comercial', camera: RUA(5.6), foco: 5.6,
  elementos: [P('leo', 'menino-topete', 2.2, 4.6), S('sleo', null, 2.2, 4.6, { sprite: undefined, sombraPessoa: { tamanho: 2.6, direcao: 75, bloco: true } })],
  acoes: [a(0, 'andar', { alvo: 'leo', para: 5.4, durF: 0.62 }), a(0, 'andar', { alvo: 'sleo', para: 5.4, durF: 0.62 }),
    a(0.68, 'trocar', { alvo: 'leo', estado: 'rosto-macabro-cresce' }), a(0.68, 'som', { som: 'suspense' })],
}));
// 8. Detalhe feliz que fica sinistro: a mãe acha graça; ele não pisca (dentes rangendo)
C.push(cena('A mãe achou graça. Ele não piscava mais.', {
  cenario: 'sala-de-estar-diorama', camera: { x: 0.4, y: 3 }, foco: 0.6,
  elementos: [P('mae', 'mae', -2.4, 1.6), P('leo', 'menino-topete', 2.0, 1.6, { pose: 'rosto-macabro-range' })],
  acoes: [a(0.05, 'andar', { alvo: 'mae', para: -1.0, durF: 0.35 }), a(0.55, 'corte', { zoom: 2, y: 2.2 }), a(0.6, 'piscar', { alvo: 'leo', durF: 0.08 })],
}));
// 9. Pico de movimento no meio: a turma inteira volta andando duro, no mesmo passo (cada um na sua faixa), e para junta de frente
const TURMA9 = [['leo', 'menino-topete', 4.2, 2.6], ['aluno', 'aluno', 4.6, 1.8], ['aluna', 'aluna', 5.0, 2.2], ['nina', 'rival', 4.2, 0.2]];   // a Nina na mesma faixa do Léo, atrás (mesma velocidade: não alcança)
C.push(cena('Na segunda, a turma inteira voltou do mesmo jeito.', {
  cenario: 'rua-comercial', camera: RUA(5.6), foco: 5.6,
  elementos: TURMA9.map(([id, sp, z, x]) => P(id, sp, x, z)),
  acoes: [...TURMA9.map(([id, , , x]) => a(0, 'andar', { alvo: id, para: +(x + 4).toFixed(1), durF: 0.7 })),
    ...TURMA9.map(([id]) => a(0.74, 'trocar', { alvo: id, estado: 'rosto-macabro' })), a(0.74, 'som', { som: 'bug-jogo' }), a(0.76, 'tremer', { intensidade: 0.25, durF: 0.08 })],
}));
// 10. No jogo, as crianças de verdade: os avatares batem na tela (vêm até a câmera, travando), pedindo socorro
C.push(cena('E, no jogo, os avatares batiam na tela, pedindo socorro.', {
  cenario: 'mundo-bloco', camera: { x: 0, z: 1.0, y: 1.4, zoom: 2 }, foco: 0,
  elementos: [P('atop', 'avatar-topete', 0.2, 3.8), P('anina', 'avatar-nina', -1.6, 3.2), P('a1', 'avatar-bloco-vermelho', 1.8, 2.8, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'atop', para: 0.6, durF: 0.3 }), a(0.3, 'trocar', { alvo: 'atop', estado: 'bug' }), a(0.35, 'trocar', { alvo: 'anina', estado: 'bug' }),
    a(0.4, 'trocar', { alvo: 'a1', estado: 'bug' }), a(0.3, 'som', { som: 'bug-jogo' }),
    a(0.45, 'pular', { alvo: 'atop', altura: 0.4 }), a(0.5, 'tremer', { intensidade: 0.3, durF: 0.06 }), a(0.6, 'pular', { alvo: 'anina', altura: 0.4 }),
    a(0.65, 'tremer', { intensidade: 0.3, durF: 0.06 }), a(0.75, 'pular', { alvo: 'a1', altura: 0.4 }), a(0.8, 'tremer', { intensidade: 0.4, durF: 0.08 })],
}));
// 11. Reação antes da virada: a Bia chega perto e congela (a tela do socorro em close, no mundo real)
C.push(cena('A Bia chegou perto da tela e congelou.', {
  cenario: 'quarto-menina-diorama', camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', -2.4, 1.6), S('tela', 'tela-jogo', 0, 0, { tela: true, pose: 'socorro', escurecer: 0.6, oculto: true })],
  acoes: [a(0, 'andar', { alvo: 'bia', para: -0.6, durF: 0.4 }), a(0.45, 'aparecer', { alvo: 'tela', som: 'bug-jogo' })],
}));
// 12–13. Virada curta (2 frases curtíssimas): inverte a crença
C.push(cena('O avatar não copiava a criança.', {
  cenario: 'rua-comercial', camera: { x: 9.0, z: 2.2, y: 1.6, zoom: 2 }, foco: 9.0,
  elementos: [P('leo', 'menino-topete', 9.4, 4.6, { pose: 'rosto-macabro-abre' })],
  acoes: [a(0, 'flash', { intensidade: 0.7 }), a(0.02, 'som', { som: 'revelar' }), a(0.05, 'tremer', { intensidade: 0.3, durF: 0.2 })],
}));
C.push(cena('Trocava de lugar com ela.', {
  cenario: 'mundo-bloco', camera: { x: 0, z: 1.0, y: 1.4, zoom: 2 }, foco: 0,
  elementos: [P('atop', 'avatar-topete', 0.6, 3.8, { pose: 'bug' })],
  acoes: [a(0, 'pular', { alvo: 'atop', altura: 0.4, durF: 0.3 }), a(0.1, 'tremer', { intensidade: 0.4, durF: 0.15 }), a(0.4, 'pular', { alvo: 'atop', altura: 0.4, durF: 0.3 }), a(0.5, 'som', { som: 'ai' })],
}));
// 14. Última imagem: o avatar sem rosto da Bia ganha o rosto dela (sem ela ter jogado), anda até a frente e sorri
C.push(cena('Na manhã seguinte, o avatar da Bia ganhou um rosto. E ela nem tinha jogado.', {
  cenario: 'mundo-bloco', camera: { x: -5.4, z: 2.2, y: 1.8, zoom: 2 }, foco: -5.4,
  elementos: [P('abiaSem', 'avatar-bloco-verde', -6.0, 2.6, { y: 0.19, pose: 'sem-rosto' }), P('abia', 'avatar-bia', -6.0, 3.1, { y: 0.19, oculto: true })],
  acoes: [a(0.25, 'magia', { alvo: 'abiaSem' }), a(0.25, 'som', { som: 'magia' }), a(0.4, 'sumir', { alvo: 'abiaSem', som: null }), a(0.4, 'aparecer', { alvo: 'abia' }),
    a(0.45, 'andar', { alvo: 'abia', para: -5.0, durF: 0.3 }), a(0.8, 'trocar', { alvo: 'abia', estado: 'sorriso' }), a(0.8, 'som', { som: 'bug-jogo' })],
}));

marcar(C, {});
rostos(C, [[3, 'aluna', 'rindo', 0.1], [3, 'aluno', 'rindo', 0.5], [6, 'leo', 'surpreso', 0.5, 0.2], [6, 'leo', 'feliz', 0.75], [8, 'mae', 'rindo', 0.4],
  [11, 'bia', 'assustado', 0.45]]);
// a sombra do Léo (cena 7): elemento só de sombra
C[6].elementos[1] = { id: 'sleo', sombraPessoa: { tamanho: 2.6, direcao: 75, bloco: true }, x: 2.2, z: 4.6 };
alturaShorts(C, { 1: -0.5, 2: -1, 3: -1.25, 4: -1, 6: -1.25, 7: -1.25, 8: -1.25, 9: -1.25, 11: -1.25, 14: -0.5 });

salvar('nesse-mundo-avatar', ['NESSE MUNDO (curto, TERROR de dia, Roblox) — "Nesse mundo, seu avatar do Roblox vai ficando igual a você."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-avatar',
  'Protótipos: jogo de blocos (mundo-bloco, avatares, tela-jogo socorro), rosto macabro (cresce/range/abre), sombra quadrada, quarto-leo-diorama, escola-patio, mae, menino-topete, rival.'], R);
