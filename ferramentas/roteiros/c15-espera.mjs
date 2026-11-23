import { alturaShorts, P, S, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, EMOCIONAL de dia (Roblox). "Nesse mundo, quando você sai do Roblox, seu avatar te espera."
// Pista: a Nina parou de jogar "sem tchau" (cena 4). Mistério que se vê: o aceno dela ficando mais devagar, com os dias somando.
// Evento (~38%): o servidor vai fechar. A Nina age (chega primeiro). A virada inverte a crença ("espera você voltar" → "esperava um tchau").
// Última imagem: o avatar da Nina acenando para o spawn vazio, ao pôr do sol — agora é ela que espera.
const R = base('Nesse mundo, quando você sai do Roblox, seu avatar te espera', 'emocional');
const C = R.cenas;
const JOGO = (x, extra = {}) => ({ x, z: 2.2, y: 2.6, ...extra });
const SPAWN = { x: -6.0, z: 2.6, y: 0.19 };

// 1. Regra: aos 0,3 s um avatar corre até o spawn e começa a acenar
C.push(cena('Nesse mundo, quando você sai do Roblox, seu avatar te espera.', {
  cenario: 'mundo-bloco', transicao: 'corte', camera: { x: -4.6, z: 2.2, y: 2.0, zoom: 1.5 }, foco: -5.0,
  elementos: [P('azul', 'avatar-bloco-azul', -2.0, 2.8, { figurante: true })],
  acoes: [{ tipo: 'correr', alvo: 'azul', para: -5.6, inicio: 0, duracao: 1.2 }, a(0.4, 'trocar', { alvo: 'azul', estado: 'acenar' })],
}));
// 2. Ele fica no spawn acenando até você voltar (vários avatares esperando)
C.push(cena('Ele fica no spawn, acenando, até você voltar. Às vezes por anos.', {
  cenario: 'mundo-bloco', camera: JOGO(-4.6), foco: -5.0, titulo: 'SEU AVATAR TE ESPERA', tituloInicio: 0.3, tituloDuracao: 2.4,
  elementos: [P('azul', 'avatar-bloco-azul', -5.6, 2.8, { pose: 'acenar', figurante: true }), P('a1', 'avatar-bloco-vermelho', -6.8, 3.4, { pose: 'acenar', figurante: true }),
    P('a2', 'avatar-bloco-verde', -1.0, 2.2, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'a2', para: -4.2, durF: 0.7 }), a(0.72, 'trocar', { alvo: 'a2', estado: 'acenar' })],
}));
// 3. Crença como AÇÃO: a criançada entra todo dia só para dar um oi (praça, celulares, pulinhos)
C.push(cena('Por isso, a criançada entra todo dia só para dar um oi.', {
  cenario: 'praca', camera: PRACA(0), foco: 0,
  elementos: [P('aluno', 'aluno', -2.4, -8.6), P('aluna', 'aluna', -0.8, -9.2), P('leo', 'menino-topete', 0.8, -8.6), P('bia', 'menina-capa', 2.4, -9.2)],
  acoes: [a(0.05, 'pular', { alvo: 'aluno', altura: 0.4 }), a(0.25, 'pular', { alvo: 'leo', altura: 0.4 }), a(0.45, 'pular', { alvo: 'aluna', altura: 0.4 }),
    a(0.6, 'emocao', { alvo: 'bia', icone: 'coracao' }), a(0.65, 'som', { som: 'entrar-jogo' })],
}));
// 4. A diferença da Nina + a PISTA: parou de jogar de um dia para o outro, sem tchau (vira as costas)
C.push(cena('Mas a Nina parou de jogar de um dia para o outro. Sem tchau.', {
  cenario: 'quarto-nina-diorama', camera: { x: 1.0, y: 3 }, foco: 1.0,
  elementos: [P('nina', 'rival', 1.0, 1.6)],
  acoes: [a(0.05, 'andar', { alvo: 'nina', para: -1.6, durF: 0.4 }), a(0.5, 'trocar', { alvo: 'nina', estado: 'costas' }), a(0.55, 'som', { som: 'porta' })],
}));
// 5. Mistério que se vê: o avatar dela acenando sozinho, cada dia mais devagar (os dias somando)
C.push(cena('Desde então, o avatar dela acena sozinho, cada dia mais devagar.', {
  cenario: 'mundo-bloco', camera: { x: -5.4, z: 2.2, y: 2.0, zoom: 1.5 }, foco: -5.6,
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' }), P('a2', 'avatar-bloco-verde', -2.0, 3.6, { figurante: true }),
    P('a3', 'avatar-bloco-vermelho', -1.0, 2.0, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'a2', para: 2.0, durF: 0.6 }), a(0.1, 'pular', { alvo: 'a3', altura: 0.6 }), a(0.15, 'contador', { de: 300, durF: 0.75 })],
}));
// 6. Evento (~38%): o servidor da cidade vai fechar (a tela do jogo em close, no quarto da Nina — mundo real)
C.push(cena('Até que avisaram: no domingo, o servidor da cidade ia fechar para sempre.', {
  cenario: 'quarto-nina-diorama', camera: { x: 1.0, y: 3 }, foco: 1.0,
  elementos: [P('nina', 'rival', -1.6, 1.6), S('tela', 'tela-jogo', 0, 0, { tela: true, pose: 'erro', escurecer: 0.6, oculto: true })],
  acoes: [a(0, 'andar', { alvo: 'nina', para: 0.4, durF: 0.3 }), a(0.4, 'aparecer', { alvo: 'tela', som: null }), a(0.4, 'som', { som: 'bug-jogo' })],
}));
// 7. Os avatares começam a apagar, um por um, ainda acenando
C.push(cena('No jogo, os avatares começaram a apagar, um por um, ainda acenando.', {
  cenario: 'mundo-bloco', camera: JOGO(-4.0), foco: -4.6,
  elementos: [P('a1', 'avatar-bloco-vermelho', -7.6, 3.4, { pose: 'acenar', figurante: true }), P('azul', 'avatar-bloco-azul', -4.4, 2.8, { pose: 'acenar', figurante: true }),
    P('a2', 'avatar-bloco-verde', -2.8, 3.6, { pose: 'acenar', figurante: true }), P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' })],
  acoes: [a(0.1, 'desaparecer', { alvo: 'a1', durF: 0.2 }), a(0.35, 'desaparecer', { alvo: 'azul', durF: 0.2 }), a(0.6, 'desaparecer', { alvo: 'a2', durF: 0.2 }),
    a(0.1, 'som', { som: 'magia' }), a(0.35, 'som', { som: 'magia' }), a(0.6, 'som', { som: 'magia' })],
}));
// 8. Pico de movimento: as crianças correm para a praça, com o celular na mão (cada uma na sua faixa)
C.push(cena('As crianças correram para a praça, com o celular na mão.', {
  cenario: 'praca-tarde', camera: PRACA(0), foco: 0,
  elementos: [P('aluno', 'aluno', -9.0, -9.8), P('aluna', 'aluna', -10.0, -9.2), P('leo', 'menino-topete', -11.0, -8.6), P('bia', 'menina-capa', -12.0, -8.0)],
  acoes: [a(0, 'correr', { alvo: 'aluno', para: -1.2, durF: 0.9 }), a(0, 'correr', { alvo: 'aluna', para: 0.4, durF: 0.9 }), a(0, 'correr', { alvo: 'leo', para: 2.0, durF: 0.9 }),
    a(0, 'correr', { alvo: 'bia', para: 3.6, durF: 0.9 })],
}));
// 9. A Nina age: diz que não liga, mas chega primeiro (corre e para, triste)
C.push(cena('A Nina disse que não ligava. Mas foi a primeira a chegar.', {
  cenario: 'praca-tarde', camera: PRACA(-1), foco: -1,
  elementos: [P('nina', 'rival', -9.0, -8.6)],
  acoes: [a(0, 'correr', { alvo: 'nina', para: -1.0, durF: 0.6 }), a(0.7, 'emocao', { alvo: 'nina', icone: '...' })],
}));
// 10. Ela entra no jogo e para na frente do próprio avatar (o spawn quase vazio, ao pôr do sol)
C.push(cena('Ela entrou e parou na frente do próprio avatar. Só faltava ele.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.0, z: 2.2, y: 2.0, zoom: 1.5 }, foco: -5.2,
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' }), P('avis', 'avatar-bloco-roxo', -1.6, 2.0, { oculto: true })],
  acoes: [a(0.05, 'aparecer', { alvo: 'avis', som: null }), a(0.05, 'som', { som: 'entrar-jogo' }), a(0.1, 'andar', { alvo: 'avis', para: -4.0, durF: 0.55 })],
}));
// 11–12. Virada (2 frases curtíssimas): ele não esperava a volta dela; esperava um tchau
C.push(cena('Ele não esperava a volta dela.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.6, z: 2.2, y: 1.6, zoom: 2 }, foco: -5.6,
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y, pose: 'acenar' }), P('avis', 'avatar-bloco-roxo', -4.0, 2.0)],
  acoes: [a(0.1, 'pular', { alvo: 'anina', altura: 0.3 }), a(0.5, 'som', { som: 'revelar' })],
}));
C.push(cena('Esperava um tchau.', {
  cenario: 'praca-tarde', camera: { x: -1.0, z: -8.5, y: 1.4, zoom: 2 }, foco: -1.0,
  elementos: [P('nina', 'rival', -1.0, -8.6)],
  acoes: [a(0, 'emocao', { alvo: 'nina', icone: 'gota' }), a(0.05, 'pular', { alvo: 'nina', altura: 0.15, durF: 0.3 })],
}));
// 13. O gesto: ela acena; ele acena de volta e some sorrindo, devagar
C.push(cena('A Nina acenou. Ele acenou de volta e sumiu, sorrindo.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.0, z: 2.2, y: 2.0, zoom: 1.5 }, foco: -5.2,
  elementos: [P('anina', 'avatar-nina', SPAWN.x, SPAWN.z, { y: SPAWN.y }), P('avis', 'avatar-bloco-roxo', -4.0, 2.0)],
  acoes: [a(0.02, 'trocar', { alvo: 'avis', estado: 'acenar' }), a(0.3, 'trocar', { alvo: 'anina', estado: 'acenar' }), a(0.55, 'desaparecer', { alvo: 'anina', durF: 0.4 }),
    a(0.55, 'som', { som: 'magia' })],
}));
// 14. Última imagem: o avatar da Nina acena para o spawn vazio, até a tela apagar — agora é ela que espera
C.push(cena('E a Nina continuou acenando para o spawn vazio, até a tela apagar.', {
  cenario: 'mundo-bloco-tarde', camera: { x: -5.0, z: 2.2, y: 2.0, zoom: 1.5 }, foco: -5.2, saiDeCena: ['anina'],
  elementos: [P('avis', 'avatar-bloco-roxo', -4.0, 2.0, { pose: 'acenar' })],
  acoes: [a(0.05, 'andar', { alvo: 'avis', para: -4.6, durF: 0.3 }), a(0.4, 'trocar', { alvo: 'avis', estado: 'acenar' }), a(0.85, 'desaparecer', { alvo: 'avis', durF: 0.15 })],
}));

rostos(C, [[3, 'aluno', 'rindo', 0.1], [3, 'aluna', 'rindo', 0.4], [3, 'leo', 'feliz', 0.5], [4, 'nina', 'bravo', 0.02, 0.05], [6, 'nina', 'surpreso', 0.4],
  [9, 'nina', 'triste', 0.65], [12, 'nina', 'chorando', 0.1]]);
alturaShorts(C, { 3: -1.75, 4: -1.25, 6: -1.25, 8: -2, 9: -1.75, 12: -0.5 });

salvar('nesse-mundo-espera', ['NESSE MUNDO (curto, EMOCIONAL de dia, Roblox) — "Nesse mundo, quando você sai do Roblox, seu avatar te espera."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-espera',
  'Protótipos: jogo de blocos (mundo-bloco, mundo-bloco-tarde, avatares, tela-jogo erro), quarto-nina-diorama, praca-tarde, rival (Nina), menino-topete.'], R);
