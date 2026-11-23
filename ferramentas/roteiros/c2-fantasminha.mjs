import { marcar, P, S, RUA, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
const R = base('Nessa cidade, todo fantasma precisa de um grito');
const C = R.cenas;
const F = (x, z, extra = {}) => P('fant', 'fantasma-crianca', x, z, { pose: 'timido', y: 0.4, ...extra });

C.push(cena('Nessa cidade, todo fantasma precisa arrancar um grito de alguém até a meia-noite.', {
  cenario: 'praca-noite', transicao: 'fade', camera: PRACA(0), foco: 0,
  elementos: [P('lencol', 'fantasma-lencol', 4.2, -8.4, { y: 0.4, virado: 'esquerda' }), P('policial', 'policial', -1.2, -8.6)],
  // gancho: o fantasma já entra voando no 1º segundo (vídeo que abre parado perde 2/3 do público)
  acoes: [a(0, 'mover', { alvo: 'lencol', para: [1.6, 0.4], durF: 0.2 }), a(0, 'som', { som: 'fantasma' }), a(0.22, 'trocar', { alvo: 'lencol', estado: 'assustar' }),
    a(0.27, 'emocao', { alvo: 'policial', icone: '!' }), a(0.3, 'tremer', { intensidade: 0.4, durF: 0.12 }),
    a(0.35, 'falar', { alvo: 'policial', texto: '* AAAH!' })],
}));
C.push(cena('Quem não consegue, desaparece para sempre.', {
  cenario: 'praca-noite', camera: PRACA(-4), foco: -4,
  titulo: 'NESSA CIDADE, TODO FANTASMA PRECISA DE UM GRITO', tituloInicio: 0.2, tituloDuracao: 2.4,
  elementos: [P('lencol2', 'fantasma-lencol', -4, -8.4, { y: 0.4, pose: 'timido' })],
  acoes: [a(0.5, 'desaparecer', { alvo: 'lencol2', durF: 0.45 })],
}));
C.push(cena('Por isso, as noites daqui são barulhentas. Lençol correndo, vovó fantasma gargalhando.', {
  cenario: 'rua-comercial-noite', camera: RUA(4), foco: 4,
  elementos: [P('lencol', 'fantasma-lencol', -1, 5.2, { y: 0.4 }), P('vovof', 'fantasma-vovo', 6.6, 5.2, { y: 0.4, pose: 'rindo', virado: 'esquerda' }),
    P('aluno', 'aluno', 4, 5.2), P('caixa', 'caixa', 8.4, 5.2, { virado: 'esquerda' })],
  acoes: [a(0.35, 'mover', { alvo: 'lencol', para: 3, durF: 0.3 }), a(0.55, 'emocao', { alvo: 'aluno', icone: '!' }), a(0.55, 'falar', { alvo: 'aluno', texto: '* Socorro!' }),
    a(0.75, 'emocao', { alvo: 'caixa', icone: '!' }), a(0.8, 'som', { som: 'fantasma' })],
}));
C.push(cena('Mas essa fantasminha é tímida demais. Nunca assustou ninguém.', {
  cenario: 'praca-noite', camera: PRACA(1), foco: 1,
  elementos: [F(1, -8.4), S('relogio', 'relogio-praca', 2.6, -9.2, { pose: 'h11-55' })],
  acoes: [a(0.45, 'emocao', { alvo: 'fant', icone: '...' })],
}));
C.push(cena('A primeira tentativa foi o seu Tonho, fechando a padaria.', {
  cenario: 'rua-comercial-noite', camera: RUA(0.6), foco: 0.6,
  elementos: [P('tonho', 'padeiro', 1.6, 5.4, { virado: 'esquerda' }), F(-3, 5.2)],
  acoes: [a(0.2, 'mover', { alvo: 'fant', para: -0.2, durF: 0.55 })],
}));
C.push(cena('Ela gritou BU com toda a força. Porém, o seu Tonho só deu um pãozinho para ela.', {
  cenario: 'rua-comercial-noite', camera: RUA(0.6), foco: 0.6,
  elementos: [P('tonho', 'padeiro', 1.6, 5.4, { virado: 'esquerda' }), F(-0.2, 5.2, { pose: 'assustar' }), S('pao', 'pao', 0.9, 5.3, { y: 0.9, oculto: true })],
  acoes: [a(0, 'falar', { alvo: 'fant', texto: '* Bu!' }), a(0.45, 'falar', { alvo: 'tonho', texto: '* Tá com fome?' }),
    a(0.7, 'aparecer', { alvo: 'pao' }), a(0.85, 'trocar', { alvo: 'fant', estado: 'timido' })],
}));
C.push(cena('A segunda foi o policial, de plantão na delegacia.', {
  cenario: 'rua-comercial-noite', camera: RUA(10.4), foco: 10.4,
  elementos: [P('policial', 'policial', 10.8, 5.4), F(7, 5.2)],
  acoes: [a(0, 'emocao', { alvo: 'policial', icone: 'zzz', durF: 0.9 }), a(0.2, 'mover', { alvo: 'fant', para: 9.6, durF: 0.55 })],
}));
C.push(cena('Porém, o policial dormia em pé tão bem que nem abriu o olho.', {
  cenario: 'rua-comercial-noite', camera: RUA(10.4), foco: 10.4,
  elementos: [P('policial', 'policial', 10.8, 5.4), F(9.6, 5.2, { pose: 'assustar' })],
  acoes: [a(0, 'falar', { alvo: 'fant', texto: '* BU! BU!' }), a(0.45, 'emocao', { alvo: 'policial', icone: 'zzz', durF: 0.5 }),
    a(0.8, 'trocar', { alvo: 'fant', estado: 'timido' })],
}));
C.push(cena('Faltando um minuto, só restava uma pessoa acordada: a Bia.', {
  cenario: 'quarto-menina-noite-diorama', camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 1, 1.6, { virado: 'esquerda' }), F(-2.4, 1.4, { oculto: true })],
  acoes: [a(0.45, 'aparecer', { alvo: 'fant', som: 'fantasma' }), a(0.8, 'emocao', { alvo: 'bia', icone: '?' })],
}));
C.push(cena('Ela fez a cara mais feia que sabia e gritou.', {
  cenario: 'quarto-menina-noite-diorama', camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 1, 1.6, { virado: 'esquerda' }), F(-0.6, 1.4)],
  acoes: [a(0.3, 'trocar', { alvo: 'fant', estado: 'assustar' }), a(0.7, 'falar', { alvo: 'fant', texto: '* BUUU!' }), a(0.75, 'tremer', { intensidade: 0.3, durF: 0.15 })],
}));
C.push(cena('E a Bia gritou. Bem alto.', {
  cenario: 'quarto-menina-noite-diorama', camera: { x: 0, y: 3, zoom: 2 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 1, 1.6, { virado: 'esquerda' }), F(-0.6, 1.4, { pose: 'assustar' })],
  acoes: [a(0.1, 'falar', { alvo: 'bia', texto: '* AAAAH!' }), a(0.1, 'flash', { intensidade: 0.6 }), a(0.1, 'tremer', { intensidade: 0.8, durF: 0.3 }),
    a(0.1, 'som', { som: 'surpresa' })],
}));
C.push(cena('Só que não era de medo. Era de fofura.', {
  cenario: 'quarto-menina-noite-diorama', camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 1, 1.6, { virado: 'esquerda' }), F(-0.6, 1.4)],
  acoes: [a(0, 'falar', { alvo: 'bia', texto: '* Que fofinho!' }), a(0.35, 'emocao', { alvo: 'bia', icone: 'coracao' }), a(0.6, 'pular', { alvo: 'bia', altura: 0.4 })],
}));
C.push(cena('Grito é grito. E agora ela mora no quarto da Bia.', {
  cenario: 'quarto-menina-diorama', camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 1, 1.6, { virado: 'esquerda' }), F(-0.6, 1.4, { pose: 'acenar' })],
  acoes: [a(0.2, 'som', { som: 'sucesso' }), a(0.5, 'emocao', { alvo: 'fant', icone: 'coracao' })],
}));

// Continuidade (npm run conferir): cenas do mesmo "momento" da história têm o mesmo elenco; "saiDeCena" = saiu pela história
marcar(C, { padaria: [[5, 6]], delegacia: [[7, 8]], 'quarto-noite': [[9, 12]] }); C[12].salto = true;

// Expressões no rosto (PROTÓTIPO motor/expressoes.js): [cena, quem, rosto, início (fração da fala)]
rostos(C, [[3, "aluno", "assustado", 0.3], [3, "caixa", "assustado", 0.4], [6, "tonho", "feliz", 0.4], [10, "bia", "surpreso", 0.5], [12, "bia", "rindo", 0.3], [13, "bia", "feliz"]]);

salvar('nesse-mundo-fantasminha', ['NESSE MUNDO (curto, cômico, lista de 3) — "Nessa cidade, todo fantasma precisa arrancar um grito até a meia-noite."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-fantasminha',
  'Usa protótipos: fantasma-crianca, fantasma-lencol, fantasma-vovo, relogio-praca. "vertical" = enquadramento do Shorts.'], R);
