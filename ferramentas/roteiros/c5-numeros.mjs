import { turma, marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
const R = base('Nessa cidade, todo mundo tem um número na cabeça');
const C = R.cenas;
const QN = 'quarto-menina-noite-diorama';
const N = (id, personagem, x, z, numero, extra = {}) => P(id, personagem, x, z, { numero, ...extra });

C.push(cena('Nessa cidade, todo mundo tem um número em cima da cabeça.', {
  cenario: 'rua-comercial', transicao: 'fade', camera: RUA(2), foco: 2,
  elementos: [N('tonho', 'padeiro', 0.6, 5.4, 85), N('prof', 'professora', 2.6, 5.4, 140, { virado: 'esquerda' }), N('aluno', 'aluno', 4.6, 5.2, 12)],
  acoes: [a(0.6, 'emocao', { alvo: 'aluno', icone: '!' })],
}));
C.push(cena('A cidade acredita que é o número de amigos de cada um.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  titulo: 'NESSA CIDADE, TODO MUNDO TEM UM NÚMERO', tituloInicio: 0.2, tituloDuracao: 2.4,
  elementos: [N('aluno', 'aluno', -2.4, 0.6, 12), N('bia', 'menina-capa', 2, 0.6, 9, { virado: 'esquerda' })],
  acoes: [a(0.1, 'andar', { alvo: 'aluno', para: -0.6, durF: 0.4 }), a(0.5, 'falar', { alvo: 'aluno', texto: '* Oi, Bia!' }),
    a(0.7, 'numero', { alvo: 'bia', valor: 10 }), a(0.8, 'emocao', { alvo: 'bia', icone: 'coracao' })],
}));
C.push(cena('Por isso, o prefeito Arlindo, com três mil, é o mais querido da cidade.', {
  cenario: 'praca-decorada', camera: PRACA(4), foco: 5,
  elementos: [N('prefeito', 'prefeito', 5, -6.7, 3000, { y: 0.75, virado: 'esquerda' }), N('caixa', 'caixa', 2.4, -8.6, 51)],
  acoes: [a(0.7, 'emocao', { alvo: 'caixa', icone: 'coracao' })],
}));
C.push(cena('Em todo comício, ele faz a praça inteira gritar o nome dele.', {
  cenario: 'praca-decorada', camera: PRACA(2), foco: 4,
  elementos: [N('prefeito', 'prefeito', 5, -6.7, 3000, { y: 0.75, virado: 'esquerda' }), N('tonho', 'padeiro', -1, -8.4, 85), N('prof', 'professora', 0.8, -8.6, 140), N('caixa', 'caixa', 2.6, -8.6, 51)],
  acoes: [a(0.45, 'falar', { alvo: 'tonho', texto: '* AR-LIN-DO!' }), a(0.5, 'pular', { alvo: 'prof', altura: 0.4 }), a(0.55, 'pular', { alvo: 'caixa', altura: 0.4 }),
    a(0.65, 'numero', { alvo: 'prefeito', valor: 3003 }), a(0.85, 'numero', { alvo: 'prefeito', valor: 3010 })],
}));
C.push(cena('Mas a rival da Bia sempre teve o número zero.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  elementos: [N('nina', 'rival', -2, 0.6, 0)],
  acoes: [a(0.05, 'andar', { alvo: 'nina', para: 0.4, durF: 0.6 }), a(0.75, 'emocao', { alvo: 'nina', icone: '...' })],
}));
C.push(cena('Ninguém sabe o nome dela. Na escola, ela é só a rival.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: 1.4,
  elementos: turma([N('nina', 'rival', 1.4, 0.75, 0, { pose: 'sentado-lado' }), N('aluno', 'aluno', -1.6, 0.75, 12, { pose: 'sentado-lado' }),
    N('bia', 'menina-capa', -4.6, 2.45, 10, { pose: 'sentado-lado' })], { extra: (id) => ({ numero: { aluna: 15, topete: 8 }[id] ?? 5 }) }),
  acoes: [a(0.5, 'falar', { alvo: 'aluno', texto: '* Ei, rival!' }), a(0.9, 'emocao', { alvo: 'nina', icone: '...' })],
}));
C.push(cena('Até que, numa noite de neblina, uma voz começou a chamar nomes pela rua.', {
  cenario: 'rua-comercial-noite', transicao: 'iris', camera: RUA(4), foco: 4, clima: 'neblina',
  elementos: [S('s1', 'vulto', -2, 3, { oculto: true })],
  acoes: [a(0.45, 'aparecer', { alvo: 's1', som: 'sombra-surge' }), a(0.8, 'trocar', { alvo: 's1', estado: 'olhos' })],
}));
C.push(cena('Primeiro, o maior número: Arlindo. E o prefeito abriu a porta, sorrindo.', {
  cenario: 'rua-comercial-noite', camera: RUA(10.4), foco: 10.4,
  elementos: [N('prefeito', 'prefeito', 10.4, 5.6, 3010, { oculto: true }), S('s1', 'vulto', 8, 4.4, { pose: 'olhos' })],
  acoes: [a(0, 'som', { som: 'porta' }), a(0.25, 'aparecer', { alvo: 'prefeito', som: null }), a(0.45, 'emocao', { alvo: 'prefeito', icone: 'coracao' }),
    // a escuridão sai do chão, sobe pelo prefeito e ele some dentro dela
    a(0.55, 'sombra', { origem: [10.4, 5.4], raio: 2.4, durF: 0.3 }),
    a(0.78, 'desaparecer', { alvo: 'prefeito', durF: 0.2 }), a(0.78, 'tremer', { intensidade: 0.4, durF: 0.15 })],
}));
C.push(cena('Depois o padeiro, a professora, a rua inteira. Ninguém resiste ao próprio nome.', {
  cenario: 'rua-comercial-noite', camera: RUA(2), foco: 2, clima: 'neblina',
  elementos: [N('tonho', 'padeiro', 0.6, 5.6, 85), N('prof', 'professora', 4.6, 5.6, 140), S('s1', 'vulto', 2.6, 4.2, { pose: 'olhos' })],
  acoes: [
    // uma escuridão por vez: engole o padeiro, depois a professora (a última que começou é a que aparece)
    a(0.02, 'sombra', { origem: [0.6, 5.4], raio: 2.2, durF: 0.25, som: null }), a(0.22, 'desaparecer', { alvo: 'tonho', durF: 0.15 }),
    a(0.42, 'sombra', { origem: [4.6, 5.4], raio: 2.2, durF: 0.25 }), a(0.6, 'desaparecer', { alvo: 'prof', durF: 0.15 }),
    a(0.4, 'som', { som: 'porta' }), a(0.8, 'tremer', { intensidade: 0.3, durF: 0.15 })],
}));
C.push(cena('Ela congelou. O número não contava amigos. Contava quantas vezes disseram seu nome.', {
  cenario: QN, camera: { x: 0, y: 3 }, foco: 0,
  elementos: [N('nina', 'rival', 0, 1.4, 0)],
  acoes: [a(0.15, 'emocao', { alvo: 'nina', icone: '!' }), a(0.4, 'som', { som: 'revelar' }), a(0.4, 'flash', { intensidade: 0.3 })],
}));
C.push(cena('E o dela, ninguém nunca tinha dito.', {
  cenario: QN, camera: { x: 0, y: 3, zoom: 2 }, foco: 0,
  elementos: [N('nina', 'rival', 0, 1.4, 0)],
  acoes: [a(0.5, 'emocao', { alvo: 'nina', icone: '...' })],
}));
C.push(cena('Até que, do lado de fora da janela, a voz sussurrou: Nina.', {
  cenario: QN, camera: { x: 0, y: 3, zoom: 2 }, foco: 0,
  elementos: [N('nina', 'rival', 0, 1.4, 0)],
  acoes: [a(0.35, 'som', { som: 'sombra' }), a(0.9, 'numero', { alvo: 'nina', valor: 1 }), a(0.9, 'flash'), a(0.9, 'tremer', { intensidade: 0.8, durF: 0.12 })],
}));

// Continuidade (npm run conferir): cenas do mesmo "momento" da história têm o mesmo elenco; "saiDeCena" = saiu pela história
marcar(C, { 'quarto-nina': [[10, 12]] });

// Expressões no rosto (PROTÓTIPO motor/expressoes.js): [cena, quem, rosto, início (fração da fala)]
rostos(C, [[1, "tonho", "feliz"], [1, "prof", "feliz"], [1, "aluno", "feliz"], [2, "aluno", "feliz"], [3, "prefeito", "rindo"], [3, "caixa", "feliz", 0.4], [4, "prefeito", "rindo"], [5, "nina", "triste", 0.4], [8, "prefeito", "feliz", 0.5], [9, "tonho", "feliz"], [9, "prof", "feliz"], [10, "nina", "assustado"], [11, "nina", "triste"], [12, "nina", "assustado", 0.6]]);

salvar('nesse-mundo-numeros', ['NESSE MUNDO (curto, terror) — "Nessa cidade, todo mundo tem um número em cima da cabeça."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-numeros',
  'Números no estilo placa ("numero" + ação numero). Protótipos: rival (a Nina), vulto (a voz), clima neblina, quarto-menina. "vertical" = enquadramento do Shorts.'], R);
