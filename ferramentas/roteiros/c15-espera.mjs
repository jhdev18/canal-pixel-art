import { alturaShorts, marcar, P, S, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, EMOCIONAL de dia (Roblox). "Nesse mundo, quando você sai do Roblox, seu avatar te espera."
// Pista: a Nina parou de jogar "sem tchau" (cena 4). Mistério que se vê: o aceno dela ficando mais devagar, com os dias somando.
// Evento (~38%): o servidor vai fechar. A Nina age (chega primeiro). A virada inverte a crença ("espera você voltar" → "esperava um tchau").
// Última imagem: o avatar da Nina acenando para o spawn vazio, ao pôr do sol — agora é ela que espera.
const R = base('Nesse mundo, quando você sai do Roblox, seu avatar te espera');   // sem música de fundo (pedido do usuário: só quando ele escolher)
const C = R.cenas;
const JOGO = (x, extra = {}) => ({ x, z: 2.2, y: 2.6, ...extra });
const SPAWN = { x: -5.6, z: 1.5, y: 0 };   // na frente da plataforma do spawn (em cima dela o desenho piscava)

// 1. Regra: aos 0,3 s um avatar corre até o spawn e começa a acenar
C.push(cena('Nesse mundo, quando você sai do Roblox, seu avatar te espera.', {
  titulo: 'ELE NUNCA ESQUECE', tituloInicio: 0, tituloDuracao: 2.6,   // título no quadro 0 da cena 1 (regra do gancho)
  cenario: 'mundo-bloco', transicao: 'corte', camera: { x: -4.6, z: 2.2, y: 2.0, zoom: 1.5 },
  elementos: [P('azul', 'avatar-bloco-azul', -2.0, 2.8, { figurante: true })],
  acoes: [{ tipo: 'correr', alvo: 'azul', para: -4.4, inicio: 0, duracao: 1.2 }, a(0.4, 'trocar', { alvo: 'azul', estado: 'acenar' })],
}));
// 2. Ele fica no spawn acenando até você voltar (vários avatares esperando)
C.push(cena('Ele fica no spawn, acenando, até você voltar. Às vezes por anos.', {
  cenario: 'mundo-bloco', camera: JOGO(-4.6),
  elementos: [P('azul', 'avatar-bloco-azul', -4.4, 2.8, { pose: 'acenar', figurante: true }), P('a1', 'avatar-bloco-vermelho', -7.4, 1.6, { pose: 'acenar', figurante: true }),
    P('a2', 'avatar-bloco-verde', -1.0, 2.2, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'a2', para: -4.2, durF: 0.7 }), a(0.72, 'trocar', { alvo: 'a2', estado: 'acenar' })],
}));
// 3. Crença como AÇÃO: a criançada entra todo dia só para dar um oi (praça, celulares, pulinhos)
C.push(cena('Por isso, a criançada entra todo dia só para dar um oi.', {
  cenario: 'praca', camera: PRACA(0),
  elementos: [P('aluno', 'aluno', -2.4, -8.6), P('aluna', 'aluna', -0.8, -9.2), P('leo', 'menino-topete', 0.8, -8.6), P('bia', 'menina-capa', 2.4, -9.2)],
  acoes: [a(0.05, 'pular', { alvo: 'aluno', altura: 0.4 }), a(0.25, 'pular', { alvo: 'leo', altura: 0.4 }), a(0.45, 'pular', { alvo: 'aluna', altura: 0.4 }),
    a(0.6, 'emocao', { alvo: 'bia', icone: 'coracao' }), a(0.65, 'som', { som: 'entrar-jogo' })],
}));
// 4. A diferença da Nina + a PISTA: parou de jogar de um dia para o outro, sem tchau (vira as costas)
C.push(cena('Mas a Nina parou de jogar de um dia para o outro. Sem tchau.', {
  cenario: 'quarto-nina-diorama', camera: { x: 1.0, y: 3 },
  elementos: [P('nina', 'rival', 1.0, 1.6)],
  acoes: [a(0.05, 'andar', { alvo: 'nina', para: -1.6, durF: 0.4 }), a(0.5, 'trocar', { alvo: 'nina', estado: 'costas' }), a(0.55, 'som', { som: 'porta' })],
}));
// 5. Mistério que se vê: o avatar dela acenando sozinho, cada dia mais devagar (os dias somando)
C.push(cena('Desde então, o avatar dela acena sozinho, cada dia mais devagar.', {
  cenario: 'mundo-bloco', camera: { x: -5.4, z: 2.2, y: 2.0, zoom: 1.5 },
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' }), P('a2', 'avatar-bloco-verde', -2.0, 3.6, { figurante: true }),
    P('a3', 'avatar-bloco-vermelho', -1.0, 2.0, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'a2', para: 2.0, durF: 0.6 }), a(0.1, 'pular', { alvo: 'a3', altura: 0.6 }),
    // sem contador no alto (o usuário achou estranho): o aceno vai cansando — acena, para, acena, para mais tempo...
    a(0.25, 'trocar', { alvo: 'anina', estado: 'parado' }), a(0.35, 'trocar', { alvo: 'anina', estado: 'acenar' }),
    a(0.55, 'trocar', { alvo: 'anina', estado: 'parado' }), a(0.75, 'trocar', { alvo: 'anina', estado: 'acenar' }), a(0.85, 'trocar', { alvo: 'anina', estado: 'parado' })],
}));
// 6. Evento (~38%): o servidor da cidade vai fechar (a tela do jogo em close, no quarto da Nina — mundo real)
C.push(cena('Até que avisaram: no domingo, o servidor da cidade ia fechar para sempre.', {
  cenario: 'quarto-nina-diorama', camera: { x: 1.0, y: 3 },
  elementos: [P('nina', 'rival', -1.6, 1.6), S('tela', 'tela-jogo', 0, 0, { tela: true, pose: 'erro', escurecer: 0.6, oculto: true })],
  acoes: [a(0, 'andar', { alvo: 'nina', para: 0.4, durF: 0.3 }), a(0.4, 'aparecer', { alvo: 'tela', som: null }), a(0.4, 'som', { som: 'bug-jogo' })],
}));
// 7. Os avatares começam a apagar, um por um, ainda acenando
C.push(cena('No jogo, os avatares começaram a apagar, um por um, ainda acenando.', {
  cenario: 'mundo-bloco', camera: JOGO(-4.0),
  elementos: [P('a1', 'avatar-bloco-vermelho', -7.4, 1.6, { pose: 'acenar', figurante: true }), P('azul', 'avatar-bloco-azul', -4.4, 2.8, { pose: 'acenar', figurante: true }),
    P('a2', 'avatar-bloco-verde', -1.4, 3.6, { figurante: true }), P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' })],
  acoes: [a(0, 'andar', { alvo: 'a2', para: -3.4, durF: 0.55 }), a(0.1, 'desaparecer', { alvo: 'a1', durF: 0.2 }), a(0.35, 'desaparecer', { alvo: 'azul', durF: 0.2 }), a(0.62, 'desaparecer', { alvo: 'a2', durF: 0.2 }),
    a(0.1, 'som', { som: 'magia' }), a(0.35, 'som', { som: 'magia' }), a(0.6, 'som', { som: 'magia' })],
}));
// 8. Pico de movimento: as crianças correm pela rua rumo à praça, com o celular na mão, e saem da tela (cada uma na sua faixa)
C.push(cena('As crianças correram para a praça, com o celular na mão.', {
  cenario: 'rua-tarde', camera: { x: 3.0, z: 2.2, y: 2.4 },
  elementos: [P('aluno', 'aluno', -6.0, 4.2), P('aluna', 'aluna', -7.0, 4.6), P('leo', 'menino-topete', -8.0, 5.0), P('bia', 'menina-capa', -10.0, 4.6)],   // atrás da aluna, na mesma faixa (mesma velocidade: não alcança)
  acoes: [a(0, 'correr', { alvo: 'aluno', para: 14.0, durF: 0.95 }), a(0, 'correr', { alvo: 'aluna', para: 13.0, durF: 0.95 }), a(0, 'correr', { alvo: 'leo', para: 12.0, durF: 0.95 }),
    a(0, 'correr', { alvo: 'bia', para: 10.0, durF: 0.95 })],
}));
// 9. Na praça: a Nina chega PRIMEIRO e para; as outras crianças chegam logo atrás e ficam em volta (momento "praca", cenas 9 e 12)
// faixas de z fora dos canteiros (x -6.7..-4.3 e 4.3..6.7, z -9.9..-9.1): quem corre vem pela frente deles (z ≤ -10) ou por trás (z ≥ -8.6)
const NA_PRACA = [['aluno', 'aluno', -3.2, -10.5], ['aluna', 'aluna', -4.4, -8.0], ['leo', 'menino-topete', 1.2, -10.0], ['bia', 'menina-capa', 0.2, -7.6]];
C.push(cena('A Nina disse que não ligava. Mas foi a primeira a chegar.', {
  cenario: 'praca-tarde', foco: 'nina', camera: PRACA(-1),
  elementos: [P('nina', 'rival', -11.0, -8.6), ...NA_PRACA.map(([id, sp, , z]) => P(id, sp, -13.0, z))],
  acoes: [a(0, 'correr', { alvo: 'nina', para: -1.0, durF: 0.5 }), a(0.55, 'emocao', { alvo: 'nina', icone: '...' }),
    ...NA_PRACA.map(([id, , x], k) => a(0.3 + k * 0.05, 'correr', { alvo: id, para: x, durF: 0.55 }))],
}));
// 10. Ela entra no jogo e para na frente do próprio avatar (o spawn quase vazio, ao pôr do sol)
C.push(cena('Ela entrou e parou na frente do próprio avatar. Só faltava ele.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.0, z: 2.2, y: 2.0, zoom: 1.5 },
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' }), P('avis', 'avatar-bloco-roxo', -1.6, 2.0, { oculto: true })],
  acoes: [a(0.05, 'aparecer', { alvo: 'avis', som: null }), a(0.05, 'som', { som: 'entrar-jogo' }), a(0.1, 'andar', { alvo: 'avis', para: -4.0, durF: 0.55 })],
}));
// 11–12. Virada (2 frases curtíssimas): ele não esperava a volta dela; esperava um tchau
C.push(cena('Ele não esperava a volta dela.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.6, z: 2.2, y: 1.6, zoom: 2 },
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' }), P('avis', 'avatar-bloco-roxo', -4.0, 2.0)],
  acoes: [a(0.1, 'pular', { alvo: 'anina', altura: 0.3 }), a(0.5, 'som', { som: 'revelar' })],
}));
C.push(cena('Esperava um tchau.', {
  cenario: 'praca-tarde', foco: 'nina', camera: { x: -1.0, z: -8.5, y: 1.4, zoom: 2 },
  elementos: [P('nina', 'rival', -1.0, -8.6), ...NA_PRACA.map(([id, sp, x, z]) => P(id, sp, x, z))],
  acoes: [a(0, 'emocao', { alvo: 'nina', icone: 'gota' }), a(0.05, 'pular', { alvo: 'nina', altura: 0.15, durF: 0.3 })],
}));
// 13. O gesto: ela acena; ele acena de volta e some sorrindo, devagar
C.push(cena('A Nina acenou. Ele acenou de volta e sumiu, sorrindo.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.0, z: 2.2, y: 2.0, zoom: 1.5 },
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y }), P('avis', 'avatar-bloco-roxo', -4.0, 2.0)],
  acoes: [a(0, 'andar', { alvo: 'avis', para: -4.6, durF: 0.18 }), a(0.2, 'trocar', { alvo: 'avis', estado: 'acenar' }), a(0.3, 'trocar', { alvo: 'anina', estado: 'acenar' }), a(0.55, 'desaparecer', { alvo: 'anina', durF: 0.4 }),
    a(0.55, 'som', { som: 'magia' })],
}));
// 14. Última imagem: o avatar da Nina acena para o spawn vazio, até a tela apagar — agora é ela que espera
C.push(cena('E a Nina continuou acenando para o spawn vazio, até a tela apagar.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.0, z: 2.2, y: 2.0, zoom: 1.5 }, saiDeCena: ['anina'],
  elementos: [P('avis', 'avatar-bloco-roxo', -4.6, 2.0, { pose: 'acenar' })],
  acoes: [a(0.05, 'andar', { alvo: 'avis', para: -5.0, durF: 0.3 }), a(0.4, 'trocar', { alvo: 'avis', estado: 'acenar' }), a(0.85, 'desaparecer', { alvo: 'avis', durF: 0.15 })],
}));

marcar(C, { praca: [[9, 9], [12, 12]] });
rostos(C, [[3, 'aluno', 'rindo', 0.1], [3, 'aluna', 'rindo', 0.4], [3, 'leo', 'feliz', 0.5], [4, 'nina', 'bravo', 0.02, 0.05], [6, 'nina', 'surpreso', 0.4],
  [9, 'nina', 'triste', 0.65], [12, 'nina', 'chorando', 0.1]]);
alturaShorts(C, { 1: -1.25, 2: -1.25, 3: -2, 4: -1.25, 5: -2, 6: -1.25, 7: -1.75, 8: -1.75, 9: -3.5, 10: -3, 11: -3, 12: -3.5, 13: -2.75, 14: -2.25 });


salvar('nesse-mundo-espera', ['NESSE MUNDO (curto, EMOCIONAL de dia, Roblox) — "Nesse mundo, quando você sai do Roblox, seu avatar te espera."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-espera',
  'Protótipos: jogo de blocos (mundo-bloco, mundo-bloco-tarde, avatares, tela-jogo erro), quarto-nina-diorama, praca-tarde, rival (Nina), menino-topete.'], R);
