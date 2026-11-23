import { alturaShorts, marcar, P, S, RUA, FRENTE, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, TERROR de dia (Roblox) — versão 2 do "avatar" (as crianças substituídas pelos avatares).
// O que muda da v1: a crença vira AÇÃO ("joga até a bateria acabar"); a diferença da Bia é concreta (não tem celular, nunca jogou);
// a regra aparece no mundo real também (sombra QUADRADA de avatar nas crianças trocadas, cenas 7–9: o espectador vê a troca antes da
// virada); a Bia AGE (corre para casa e abre o jogo pela 1ª vez) e é essa escolha que fecha o vídeo: o avatar sem rosto dela sorri.
// Cenas de jogo DENTRO do mundo-bloco; a tela do jogo (monitor) só no mundo real. "Roblox" só na narração/título.
const R = base('Nesse mundo, seu avatar do Roblox aprende a ser você', 'suspense');
const C = R.cenas;
const JOGO = (x) => ({ x, z: 2.2, y: 2.6 });
const PERTO = (x, y = 1.6) => ({ x, z: 2.2, y, zoom: 2 });
const QUADRADA = (id, x, z, extra = {}) => ({ id, sombraPessoa: { tamanho: 2.2, direcao: 75, bloco: true, ...extra }, x, z });
const CEL = (id, quem) => S(id, 'celular-mao', 0, 0, { sobre: { id: quem, dx: 0.35, dy: 0.95 } });

// 1. Gancho: aos 0,15 s o avatar azul ganha a roupa do Léo (faíscas) e sai andando
C.push(cena('Nesse mundo, seu avatar do Roblox aprende a ser você.', {
  cenario: 'mundo-bloco', transicao: 'corte', camera: PERTO(-1, 1.8),
  elementos: [P('azul', 'avatar-bloco-azul', -2.0, 2.8), P('aleo1', 'avatar-leo-1', -2.0, 3.3, { oculto: true }), P('a1', 'avatar-bloco-vermelho', 1.6, 3.6, { figurante: true })],
  acoes: [{ tipo: 'andar', alvo: 'a1', para: 4.0, inicio: 0, duracao: 3.2 }, { tipo: 'magia', alvo: 'azul', inicio: 0.15 }, { tipo: 'som', som: 'magia', inicio: 0.15 },
    { tipo: 'sumir', alvo: 'azul', inicio: 0.4, som: null }, { tipo: 'aparecer', alvo: 'aleo1', inicio: 0.4 }, a(0.45, 'andar', { alvo: 'aleo1', para: 0.4, durF: 0.55 })],
}));
// 2. A regra avançando: a roupa → o cabelo (vira o avatar-leo-2, com topete) → corte de perto no sorriso
C.push(cena('Primeiro ele copia a roupa. Depois o cabelo. Depois o sorriso.', {
  cenario: 'mundo-bloco', camera: JOGO(0), titulo: 'SEU AVATAR APRENDE A SER VOCÊ', tituloInicio: 0.3, tituloDuracao: 2.4,
  elementos: [P('aleo1', 'avatar-leo-1', -3.0, 2.8), P('aleo2', 'avatar-leo-2', -0.6, 3.3, { oculto: true }), P('a1', 'avatar-bloco-vermelho', 3.6, 3.8, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'aleo1', para: -0.6, durF: 0.4 }), a(0.1, 'andar', { alvo: 'a1', para: 6.2, durF: 0.6 }),
    a(0.42, 'magia', { alvo: 'aleo1' }), a(0.42, 'som', { som: 'magia' }), a(0.46, 'sumir', { alvo: 'aleo1', som: null }), a(0.46, 'aparecer', { alvo: 'aleo2', som: null }),
    a(0.5, 'andar', { alvo: 'aleo2', para: 1.0, durF: 0.5 }), a(0.8, 'corte', { zoom: 2, y: 1.6 })],
}));
// 3. Crença como AÇÃO: a criançada joga até a bateria acabar (pátio, celular na mão, pulando de alegria)
C.push(cena('Por isso, a criançada joga até a bateria do celular acabar.', {
  cenario: 'escola-patio', camera: { x: 0.4, z: 2.2, y: 2.6 },
  elementos: [P('leo', 'menino-topete', -1.6, 3.0), P('aluno', 'aluno', 0.4, 3.4), P('aluna', 'aluna', 2.4, 3.0), CEL('c1', 'leo'), CEL('c2', 'aluno'), CEL('c3', 'aluna')],
  acoes: [a(0.05, 'pular', { alvo: 'leo', altura: 0.4 }), a(0.25, 'pular', { alvo: 'aluno', altura: 0.35 }), a(0.45, 'pular', { alvo: 'aluna', altura: 0.4 }),
    a(0.6, 'emocao', { alvo: 'aluna', icone: 'coracao' }), a(0.75, 'pular', { alvo: 'leo', altura: 0.4 })],
}));
// 4. A diferença da Bia (sem som): o avatar dela, sem rosto, parado no spawn, enquanto os outros pulam
C.push(cena('Só a Bia não tem celular. O avatar dela nunca ganhou rosto.', {
  cenario: 'mundo-bloco', camera: JOGO(-4),
  elementos: [P('abiaSem', 'avatar-bloco-verde', -5.6, 1.5, { pose: 'sem-rosto' }), P('aleo2', 'avatar-leo-2', -2.6, 3.6), P('anina', 'avatar-nina', -3.8, 2.4)],
  acoes: [a(0.05, 'pular', { alvo: 'aleo2', altura: 0.6 }), a(0.2, 'andar', { alvo: 'anina', para: -1.2, durF: 0.5 }), a(0.45, 'pular', { alvo: 'aleo2', altura: 0.6 }),
    a(0.65, 'corte', { zoom: 2, y: 1.6 }), a(0.68, 'som', { som: 'bug-jogo' })],
}));
// 5. Evento (~33%): numa sexta, o avatar do Léo fica perfeito (vira o avatar-topete de uma vez)
C.push(cena('Até que, numa sexta, o avatar do Léo ficou perfeito.', {
  cenario: 'mundo-bloco', camera: PERTO(0, 1.6),
  elementos: [P('aleo2', 'avatar-leo-2', -1.4, 2.8), P('atop', 'avatar-topete', 0.2, 3.25, { oculto: true })],
  acoes: [a(0.05, 'andar', { alvo: 'aleo2', para: 0.2, durF: 0.4 }), a(0.48, 'magia', { alvo: 'aleo2' }), a(0.55, 'flash', { intensidade: 0.7 }), a(0.55, 'som', { som: 'revelar' }),
    a(0.56, 'sumir', { alvo: 'aleo2', som: null }), a(0.56, 'aparecer', { alvo: 'atop', som: null }), a(0.6, 'tremer', { intensidade: 0.2, durF: 0.08 }), a(0.75, 'pular', { alvo: 'atop', altura: 0.5 })],
}));
// 6. Ainda fofo: no quarto, o Léo vai até o computador e ri para a tela (o jogo aberto no monitor da escrivaninha)
C.push(cena('Ele piscou pela tela. E o Léo, rindo, piscou de volta.', {
  cenario: 'quarto-leo-diorama', camera: { x: 0.8, y: 3 },
  elementos: [P('leo', 'menino-topete', -1.6, 1.4), CEL('c1', 'leo')],
  acoes: [a(0, 'andar', { alvo: 'leo', para: 1.0, durF: 0.45 }), a(0.5, 'som', { som: 'chat' }), a(0.55, 'emocao', { alvo: 'leo', icone: 'coracao' }), a(0.8, 'pular', { alvo: 'leo', altura: 0.3 })],
}));
// 7. A ameaça em pedaços: no sábado o Léo sai andando duro, com a sombra QUADRADA de avatar; para e o sorriso cresce
C.push(cena('No sábado, o Léo saiu de casa andando duro, feito um boneco.', {
  cenario: 'rua-comercial', camera: RUA(4.6),
  elementos: [P('leo', 'menino-topete', 1.2, 4.6), QUADRADA('sleo', 1.2, 4.6)],
  acoes: [a(0, 'andar', { alvo: 'leo', para: 4.6, durF: 0.66 }), a(0, 'andar', { alvo: 'sleo', para: 4.6, durF: 0.66 }),
    a(0.7, 'trocar', { alvo: 'leo', estado: 'rosto-macabro-cresce' }), a(0.7, 'som', { som: 'suspense' }), a(0.7, 'corte', { zoom: 2, x: 4.95, y: 1.2 })],
}));
// 8. Pico de movimento no meio: a turma inteira chega do mesmo jeito, no mesmo passo, cada um com a sua sombra quadrada
const TURMA = [['leo', 'menino-topete', 4.2, 1.8], ['aluno', 'aluno', 4.6, 2.6], ['aluna', 'aluna', 5.0, 1.0], ['nina', 'rival', 4.2, -0.2]];   // a Nina atrás do Léo, na mesma faixa (mesma velocidade: não alcança)
C.push(cena('Na segunda, a escola inteira chegou do mesmo jeito. Sorrindo.', {
  cenario: 'rua-comercial', camera: RUA(5.6),
  elementos: [...TURMA.map(([id, sp, z, x]) => P(id, sp, x, z)), ...TURMA.map(([id, , z, x]) => QUADRADA('s-' + id, x, z, { tamanho: 1.8 }))],
  acoes: [...TURMA.flatMap(([id, , , x]) => [a(0, 'andar', { alvo: id, para: +(x + 4).toFixed(1), durF: 0.72 }), a(0, 'andar', { alvo: 's-' + id, para: +(x + 4).toFixed(1), durF: 0.72, som: null })]),
    ...TURMA.map(([id]) => a(0.76, 'trocar', { alvo: id, estado: 'rosto-macabro' })), a(0.76, 'som', { som: 'bug-jogo' }),
    a(0.76, 'corte', { zoom: 1.5, x: 6.15, y: 1.6 }), a(0.78, 'tremer', { intensidade: 0.25, durF: 0.08 })],
}));
// 9. Reação: na calçada da frente, a Bia vê a turma passar atrás e repara nas sombras quadradas (congela)
const PASSAM = [['leo', 'menino-topete', 5.2, 3.0], ['aluno', 'aluno', 4.6, 1.4]];
C.push(cena('Só a Bia reparou: ninguém mais tinha sombra de gente.', {
  cenario: 'rua-comercial', camera: FRENTE(4.6), foco: ['bia', 'leo'],
  elementos: [P('bia', 'menina-capa', 4.4, 0.6), ...PASSAM.map(([id, sp, z, x]) => P(id, sp, x, z, { pose: 'rosto-macabro' })), ...PASSAM.map(([id, , z, x]) => QUADRADA('s-' + id, x, z, { tamanho: 1.8 }))],
  acoes: [...PASSAM.flatMap(([id, , , x]) => [a(0, 'andar', { alvo: id, para: x + 5, durF: 1 }), a(0, 'andar', { alvo: 's-' + id, para: x + 5, durF: 1, som: null })]),
    a(0.5, 'emocao', { alvo: 'bia', icone: '!' }), a(0.5, 'som', { som: 'surpresa' })],
}));
// 10. A Bia ESCOLHE agir: corre para casa e abre o jogo pela primeira vez (a tela aparece em close)
C.push(cena('Ela correu para casa e abriu o jogo pela primeira vez.', {
  cenario: 'quarto-menina-diorama', camera: { x: 0, y: 3 },
  elementos: [P('bia', 'menina-capa', -3.4, 1.6), S('tela', 'tela-jogo', 0, 0, { tela: true, pose: 'jogando', escurecer: 0.6, oculto: true })],
  acoes: [a(0, 'correr', { alvo: 'bia', para: -0.6, durF: 0.45 }), a(0.5, 'aparecer', { alvo: 'tela', som: 'entrar-jogo' }),
    a(0.78, 'trocar', { alvo: 'tela', estado: 'chat-nao-sai', som: 'chat' }), a(0.8, 'tremer', { intensidade: 0.25, durF: 0.08 })],
}));
// 11. Lá dentro, as crianças de verdade: os avatares vêm até a câmera em "bug", batendo na tela
C.push(cena('Lá dentro, as crianças batiam na tela, pedindo socorro.', {
  cenario: 'mundo-bloco', camera: { x: 0, z: 1.0, y: 1.4, zoom: 2 },
  elementos: [P('atop', 'avatar-topete', 0.2, 3.8), P('anina', 'avatar-nina', -1.6, 3.2), P('a1', 'avatar-bloco-vermelho', 1.8, 2.8, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'atop', para: 0.6, durF: 0.3 }), a(0.3, 'trocar', { alvo: 'atop', estado: 'bug' }), a(0.35, 'trocar', { alvo: 'anina', estado: 'bug' }),
    a(0.4, 'trocar', { alvo: 'a1', estado: 'bug' }), a(0.3, 'som', { som: 'bug-jogo' }),
    a(0.45, 'pular', { alvo: 'atop', altura: 0.4 }), a(0.5, 'tremer', { intensidade: 0.3, durF: 0.06 }), a(0.6, 'pular', { alvo: 'anina', altura: 0.4 }),
    a(0.65, 'tremer', { intensidade: 0.3, durF: 0.06 }), a(0.75, 'pular', { alvo: 'a1', altura: 0.4 }), a(0.8, 'tremer', { intensidade: 0.4, durF: 0.08 })],
}));
// 12–13. Virada em 2 frases curtíssimas: inverte a crença ("aprende a ser você" → "toma o seu lugar")
C.push(cena('O avatar não aprendia a ser você.', {
  cenario: 'rua-comercial', camera: { x: 9.0, z: 2.2, y: 1.6, zoom: 2 },
  elementos: [P('leo', 'menino-topete', 8.8, 4.6, { pose: 'rosto-macabro-abre' }), QUADRADA('sleo', 8.8, 4.6)],
  acoes: [a(0, 'andar', { alvo: 'leo', para: 9.4, durF: 1 }), a(0, 'andar', { alvo: 'sleo', para: 9.4, durF: 1, som: null }),
    a(0.32, 'flash', { intensidade: 0.7 }), a(0.02, 'som', { som: 'revelar' }), a(0.05, 'tremer', { intensidade: 0.3, durF: 0.2 })],
}));
C.push(cena('Ele tomava o seu lugar.', {
  cenario: 'mundo-bloco', camera: { x: 0, z: 1.0, y: 1.4, zoom: 2 },
  elementos: [P('atop', 'avatar-topete', 0.6, 3.8, { pose: 'bug' })],
  acoes: [a(0, 'pular', { alvo: 'atop', altura: 0.4, durF: 0.3 }), a(0.1, 'tremer', { intensidade: 0.4, durF: 0.15 }), a(0.4, 'pular', { alvo: 'atop', altura: 0.4, durF: 0.3 }), a(0.5, 'som', { som: 'ai' })],
}));
// 14. Última imagem: a escolha da Bia cobra o preço — o avatar sem rosto dela, que ela acabou de abrir, anda até a frente e SORRI
C.push(cena('E o avatar sem rosto da Bia, pela primeira vez, sorriu.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.0, z: 2.2, y: 1.8, zoom: 2 },
  elementos: [P('abiaSem', 'avatar-bloco-verde', -5.6, 1.5, { pose: 'sem-rosto' })],
  acoes: [a(0.1, 'andar', { alvo: 'abiaSem', para: -4.6, durF: 0.5 }), a(0.7, 'trocar', { alvo: 'abiaSem', estado: 'sorriso' }), a(0.7, 'som', { som: 'bug-jogo' }),
    a(0.72, 'tremer', { intensidade: 0.2, durF: 0.08 })],
}));

marcar(C, {});
rostos(C, [[3, 'aluna', 'rindo', 0.1], [3, 'aluno', 'rindo', 0.5], [6, 'leo', 'rindo', 0.5], [9, 'bia', 'assustado', 0.5], [10, 'bia', 'assustado', 0.5]]);
alturaShorts(C, { 1: -1.25, 2: -1.25, 3: -1, 4: -3, 5: -1.5, 14: -3 });

salvar('nesse-mundo-avatar-v2', ['NESSE MUNDO (curto, TERROR de dia, Roblox) — v2 do avatar: "Nesse mundo, seu avatar do Roblox aprende a ser você."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-avatar-v2',
  'Protótipos: jogo de blocos (mundo-bloco, avatares, avatar-leo-1/-2, tela-jogo), celular-mao, rosto macabro, sombra quadrada, quarto-leo-diorama, quarto-menina-diorama, escola-patio, menino-topete, rival.'], R);
