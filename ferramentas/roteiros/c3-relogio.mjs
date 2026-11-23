import { marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
const R = base('Nessa cidade, o relógio da virada anda para trás');
const C = R.cenas;
const REL = (pose = 'h11-55') => S('relogio', 'relogio-praca', 2.6, -9.2, { pose });
// o povo da festa fica sempre no meio da praça; a Bia e a vovó, na beirada (x -2.6 e -5.6)
const povo = () => [P('tonho', 'padeiro', -0.6, -8.6), P('prof', 'professora', 1.0, -8.4), P('aluno', 'aluno', 2.4, -8.6, { virado: 'esquerda' }), P('caixa', 'caixa', 5.4, -8.6, { virado: 'esquerda' })];

C.push(cena('Nessa cidade, na virada do ano, o relógio da praça anda para trás.', {
  cenario: 'praca-decorada-noite', transicao: 'fade', camera: PRACA(2), foco: 2.6,
  elementos: [REL('h12'), P('aluno', 'aluno', 0.4, -8.6)],
  acoes: [a(0.45, 'trocar', { alvo: 'relogio', estado: 'h11-55' }), a(0.45, 'som', { som: 'sino-relogio' }), a(0.62, 'trocar', { alvo: 'relogio', estado: 'h9' }),
    a(0.78, 'trocar', { alvo: 'relogio', estado: 'h6' }), a(0.8, 'emocao', { alvo: 'aluno', icone: '!' })],
}));
C.push(cena('E quem estiver na praça fica um ano mais novo.', {
  cenario: 'praca-decorada-noite', camera: PRACA(0), foco: 0,
  titulo: 'NESSA CIDADE, O RELÓGIO ANDA PARA TRÁS', tituloInicio: 0.2, tituloDuracao: 2.4,
  elementos: [...povo(), REL('h6')],
  acoes: [a(0.3, 'magia', { alvo: 'tonho' }), a(0.38, 'magia', { alvo: 'prof' }), a(0.46, 'magia', { alvo: 'aluno' }), a(0.54, 'magia', { alvo: 'caixa' }),
    a(0.6, 'pular', { alvo: 'tonho', altura: 0.5 }), a(0.66, 'pular', { alvo: 'prof', altura: 0.5 })],
}));
C.push(cena('Por isso, a festa vive lotada. O prefeito tem noventa anos e cara de quarenta.', {
  cenario: 'praca-decorada-noite', camera: PRACA(4), foco: 5,
  elementos: [P('prefeito', 'prefeito', 5, -6.7, { y: 0.75, virado: 'esquerda' }), P('caixa', 'caixa', 2.4, -8.6)],
  acoes: [a(0.1, 'falar', { alvo: 'prefeito', texto: '* Feliz ano novo!' }), a(0.75, 'emocao', { alvo: 'caixa', icone: 'coracao' })],
}));
C.push(cena('Mas a vovó da Bia nunca foi na festa. Nem uma vez.', {
  cenario: 'rua-comercial-noite', camera: FRENTE(-2), foco: -2,
  elementos: [P('vovo', 'vovo', -2, 0.6, { virado: 'direita' })],
  acoes: [a(0.6, 'emocao', { alvo: 'vovo', icone: '...' })],
}));
C.push(cena('Ela é a mais velha da cidade, e as crianças riem das rugas dela.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  elementos: [P('vovo', 'vovo', -3.0, 0.6), P('aluno', 'aluno', -0.4, 0.6, { virado: 'esquerda' }), P('aluna', 'aluna', 0.9, 0.6, { virado: 'esquerda' })],
  acoes: [a(0.45, 'falar', { alvo: 'aluno', texto: '* Uva-passa!' }), a(0.7, 'pular', { alvo: 'aluna', altura: 0.4 }), a(0.8, 'emocao', { alvo: 'vovo', icone: '...' })],
}));
C.push(cena('Até que, nesse ano, a Bia puxou a vovó pela mão até a festa.', {
  cenario: 'rua-comercial-noite', camera: FRENTE(0), foco: 0, seguir: 'bia',
  elementos: [P('bia', 'menina-capa', -2.2, 0.6), P('vovo', 'vovo', -3.6, 0.6)],
  acoes: [a(0.1, 'andar', { alvo: 'bia', para: 4.6, durF: 0.85 }), a(0.12, 'andar', { alvo: 'vovo', para: 3.9, durF: 0.85 })],
}));
C.push(cena('Mas, na beirada da praça, a vovó parou. E não quis entrar.', {
  cenario: 'praca-decorada-noite', camera: PRACA(-3), foco: -3,
  elementos: [P('bia', 'menina-capa', -4, -8.6), P('vovo', 'vovo', -5.6, -8.6), ...povo(), REL('h11-55')],
  acoes: [a(0.05, 'andar', { alvo: 'bia', para: -2.6, durF: 0.4 }), a(0.5, 'virar', { alvo: 'bia', direcao: 'esquerda' }),
    a(0.55, 'emocao', { alvo: 'bia', icone: '?' }), a(0.75, 'emocao', { alvo: 'vovo', icone: '...' })],
}));
C.push(cena('O relógio bateu meia-noite, e os ponteiros giraram para trás.', {
  cenario: 'praca-decorada-noite', camera: PRACA(1), foco: 2.6,
  elementos: [...povo(), P('bia', 'menina-capa', -2.6, -8.6, { virado: 'esquerda' }), P('vovo', 'vovo', -5.6, -8.6), REL('h11-55')],
  acoes: [a(0.2, 'trocar', { alvo: 'relogio', estado: 'h12' }), a(0.2, 'som', { som: 'sino-relogio' }), a(0.25, 'flash', { intensidade: 0.5 }),
    a(0.55, 'trocar', { alvo: 'relogio', estado: 'h9' }), a(0.7, 'trocar', { alvo: 'relogio', estado: 'h6' }), a(0.85, 'trocar', { alvo: 'relogio', estado: 'h3' }),
    a(0.55, 'tremer', { intensidade: 0.3, durF: 0.3 }),
    a(0.25, 'fogos', { posicao: [-2, 7, -9], cor: 'dourado' }), a(0.45, 'fogos', { posicao: [4, 8, -9], cor: 'rosa' }), a(0.6, 'fogos', { posicao: [0.5, 7.5, -9], cor: 'azul' })],
}));
C.push(cena('A cidade inteira ficou mais nova. E a vovó ganhou mais uma ruga.', {
  cenario: 'praca-decorada-noite', camera: PRACA(-3), foco: -5,
  elementos: [P('bia', 'menina-capa', -2.6, -8.6, { virado: 'esquerda' }), P('vovo', 'vovo', -5.6, -8.6), ...povo()],
  acoes: [a(0.05, 'magia', { alvo: 'tonho' }), a(0.1, 'magia', { alvo: 'bia' }), a(0.6, 'piscar', { alvo: 'vovo' }), a(0.7, 'emocao', { alvo: 'bia', icone: '!' })],
}));
C.push(cena('Foi aí que a Bia entendeu: o ano que a cidade perde, alguém leva.', {
  cenario: 'praca-decorada-noite', camera: { x: -4.1, z: -9.6, zoom: 2 }, foco: -4.1,
  elementos: [P('bia', 'menina-capa', -2.6, -8.6, { virado: 'esquerda' }), P('vovo', 'vovo', -5.6, -8.6), ...povo()],
  acoes: [a(0.25, 'emocao', { alvo: 'bia', icone: '!' }), a(0.25, 'som', { som: 'revelar' })],
}));
C.push(cena('A vovó sempre ficou de fora de propósito. Há cento e oitenta anos.', {
  cenario: 'praca-decorada-noite', camera: { x: -4.1, z: -9.6, zoom: 2 }, foco: -4.1,
  elementos: [P('bia', 'menina-capa', -2.6, -8.6, { virado: 'esquerda' }), P('vovo', 'vovo', -5.6, -8.6), ...povo()],
  acoes: [a(0.4, 'falar', { alvo: 'vovo', texto: '* Alguém tem que ficar.' })],
}));
C.push(cena('E, nesse ano, pela primeira vez, ela não ficou sozinha na calçada.', {
  cenario: 'praca-decorada-noite', camera: PRACA(-4), foco: -5,
  elementos: [P('bia', 'menina-capa', -2.6, -8.6, { virado: 'esquerda' }), P('vovo', 'vovo', -5.6, -8.6), ...povo()],
  acoes: [a(0.15, 'andar', { alvo: 'bia', para: -4.1, durF: 0.4 }), a(0.65, 'emocao', { alvo: 'vovo', icone: 'coracao' }),
    a(0.35, 'fogos', { posicao: [-3, 7, -9], cor: 'dourado' }), a(0.55, 'fogos', { posicao: [-6.5, 7.5, -9], cor: 'verde' })],
}));

// Continuidade (npm run conferir): cenas do mesmo "momento" da história têm o mesmo elenco; "saiDeCena" = saiu pela história
marcar(C, { virada: [[7, 12]] });

// Expressões no rosto (PROTÓTIPO motor/expressoes.js): [cena, quem, rosto, início (fração da fala)]
rostos(C, [[2, "tonho", "feliz", 0.3], [2, "prof", "feliz", 0.35], [2, "caixa", "feliz", 0.4], [3, "prefeito", "rindo"], [3, "caixa", "feliz", 0.5], [4, "vovo", "triste", 0.4], [5, "aluno", "rindo", 0.4], [5, "aluna", "rindo", 0.5], [5, "vovo", "envergonhado", 0.5], [7, "vovo", "triste", 0.45], [8, "tonho", "feliz", 0.3], [8, "prof", "feliz", 0.3], [8, "caixa", "feliz", 0.3], [9, "vovo", "triste", 0.55], [10, "vovo", "triste"], [11, "bia", "chorando", 0.55], [12, "vovo", "feliz", 0.5], [12, "bia", "feliz", 0.6]]);

salvar('nesse-mundo-relogio', ['NESSE MUNDO (curto, emocional) — "Nessa cidade, na virada do ano, o relógio da praça anda para trás."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-relogio',
  'Usa protótipos: vovo, relogio-praca, ação fogos. "vertical" = enquadramento do Shorts.'], R);
