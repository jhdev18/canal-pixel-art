import { turma, marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
const R = base('Nessa cidade, o guardião só acorda no perigo');
const C = R.cenas;
const G = (id, dono, tipo = 'guardiao-azul', pose = 'dormindo', extra = {}) => ({ id, personagem: tipo, sobre: { id: dono, dx: 0.9, dy: 1.55, ...(extra.sobre || {}) }, pose, ...(extra.e || {}) });
const QN = 'quarto-menina-noite-diorama';

C.push(cena('Nessa cidade, cada pessoa tem um guardião que dorme ao lado da cabeça.', {
  cenario: 'rua-comercial', transicao: 'fade', camera: RUA(2), foco: 2,
  elementos: [P('tonho', 'padeiro', 0.6, 5.4), G('gt', 'tonho', 'guardiao-noturno'), P('prof', 'professora', 3.4, 5.4, { virado: 'esquerda' }), G('gp', 'prof', 'guardia-verde')],
  acoes: [a(0.5, 'emocao', { alvo: 'gt', icone: 'zzz' }), a(0.7, 'emocao', { alvo: 'gp', icone: 'zzz' })],
}));
C.push(cena('Ele só acorda quando o dono está em perigo.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  titulo: 'NESSA CIDADE, O GUARDIÃO SÓ ACORDA NO PERIGO', tituloInicio: 0.2, tituloDuracao: 2.4,
  elementos: [P('aluno', 'aluno', -3, 0.6), G('ga', 'aluno', 'guardiao-azul')],
  acoes: [a(0, 'correr', { alvo: 'aluno', para: 0.6, durF: 0.4 }), a(0.4, 'trocar', { alvo: 'ga', estado: 'alerta' }), a(0.42, 'emocao', { alvo: 'aluno', icone: '!' }),
    a(0.42, 'tremer', { intensidade: 0.3, durF: 0.12 }), a(0.85, 'trocar', { alvo: 'ga', estado: 'dormindo' })],
}));
C.push(cena('Mas o guardião da Bia nunca dormiu. Nem uma noite.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  elementos: [P('bia', 'menina-capa', 0, 0.6), G('gb', 'bia', 'guardiao-azul', 'alerta')],
  acoes: [a(0.6, 'emocao', { alvo: 'bia', icone: '...' })],
}));
C.push(cena('Ele vive acordado, olhando fixo para as costas dela.', {
  cenario: 'rua-comercial', camera: { x: 0, z: 0.4, y: 2.6, zoom: 2 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 0.4, 0.6), G('gb', 'bia', 'guardiao-azul', 'olhando-lado', { sobre: { dx: -0.9 }, e: { virado: 'esquerda' } })],
  acoes: [a(0.55, 'som', { som: 'suspense', volume: 0.6 })],
}));
C.push(cena('A cidade decidiu que o perigo era ela. Todos atravessam a rua quando ela passa.', {
  cenario: 'rua-comercial', camera: FRENTE(1), foco: 1,
  elementos: [P('bia', 'menina-capa', -2, 0.6), G('gb', 'bia', 'guardiao-azul', 'alerta'), P('prof', 'professora', 4.6, 0.6, { virado: 'esquerda' }), G('gp', 'prof', 'guardia-verde'),
    P('tonho', 'padeiro', 6.0, 0.6, { virado: 'esquerda' }), G('gt', 'tonho', 'guardiao-noturno')],
  acoes: [a(0.05, 'andar', { alvo: 'bia', para: 0.6, durF: 0.6 }), a(0.4, 'emocao', { alvo: 'prof', icone: '!' }),
    a(0.5, 'andar', { alvo: 'prof', para: 8.4, durF: 0.45 }), a(0.55, 'andar', { alvo: 'tonho', para: 9.0, durF: 0.4 }), a(0.9, 'emocao', { alvo: 'bia', icone: '...' })],
}));
C.push(cena('Na escola, ninguém senta do lado da menina do perigo.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: 1.4,
  // "ninguém senta do lado": as duas carteiras vizinhas da Bia ficam vazias; todo colega tem o seu guardião (dormindo)
  elementos: turma([P('bia', 'menina-capa', 1.4, 0.75, { pose: 'sentado-lado' }), G('gb', 'bia', 'guardiao-azul', 'alerta', { sobre: { dy: 1.2 } }),
    P('aluno', 'aluno', -4.6, 2.45, { pose: 'sentado-lado' }), G('ga', 'aluno', 'guardia-verde', 'dormindo', { sobre: { dy: 1.2 } }),
    P('aluna', 'aluna', -4.6, 0.75, { pose: 'sentado-lado' }), G('gal', 'aluna', 'guardiao-noturno', 'dormindo', { sobre: { dy: 1.2 } })],
    { livres: [[-1.6, 0.75], [1.4, 2.45]], junto: (id) => [G('g-' + id, id, 'guardiao-chefe', 'dormindo', { sobre: { dy: 1.2 } })] }),
  acoes: [a(0.4, 'falar', { alvo: 'aluna', texto: '* Não chega perto.' }), a(0.85, 'emocao', { alvo: 'bia', icone: '...' })],
}));
C.push(cena('Até que, numa noite, a Bia acordou e o guardião dela estava tremendo.', {
  cenario: QN, transicao: 'iris', camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 0, 1.4), G('gb', 'bia', 'guardiao-azul', 'alerta')],
  acoes: [a(0.25, 'emocao', { alvo: 'bia', icone: '?' }), a(0.55, 'trocar', { alvo: 'gb', estado: 'tremendo' }), a(0.6, 'tremer', { intensidade: 0.2, durF: 0.35 })],
}));
C.push(cena('Pela janela, ela viu os guardiões da rua inteira acordados. Olhando para a casa dela.', {
  cenario: 'rua-comercial-noite', camera: RUA(3), foco: 3,
  elementos: [P('tonho', 'padeiro', 0.6, 5.4, { virado: 'esquerda' }), G('gt', 'tonho', 'guardiao-noturno', 'alerta', { e: { virado: 'esquerda' } }),
    P('prof', 'professora', 3.4, 5.4, { virado: 'esquerda' }), G('gp', 'prof', 'guardia-verde', 'alerta', { e: { virado: 'esquerda' } }),
    P('policial', 'policial', 6.2, 5.4, { virado: 'esquerda' }), G('gpol', 'policial', 'guardiao-chefe', 'alerta', { e: { virado: 'esquerda' } })],
  acoes: [a(0.1, 'som', { som: 'suspense' }), a(0.75, 'tremer', { intensidade: 0.3, durF: 0.2 }), a(0.75, 'som', { som: 'revelar' })],
}));
C.push(cena('A Bia congelou. E, pela primeira vez, olhou para onde o guardião sempre olhava.', {
  cenario: QN, camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', 0, 1.4), G('gb', 'bia', 'guardiao-azul', 'olhando-lado', { sobre: { dx: -0.9 }, e: { virado: 'esquerda' } })],
  acoes: [a(0.15, 'emocao', { alvo: 'bia', icone: '!' }), a(0.75, 'virar', { alvo: 'bia', direcao: 'esquerda' })],
}));
// O vulto GRANDE (escala 2, ~110 px de altura) surge com a luz piscando: some no apagão, aparece no clarão seguinte,
// cada vez mais perto. Câmera sem zoom para caber a cabeça dele.
C.push(cena('Ela nunca foi o perigo. O perigo estava atrás dela.', {
  cenario: QN, camera: { x: -1.2, y: 3.6 }, foco: -1.2,
  elementos: [P('bia', 'menina-capa', 0, 1.2, { virado: 'esquerda' }), G('gb', 'bia', 'guardiao-azul', 'tremendo', { sobre: { dx: -0.9 }, e: { virado: 'esquerda' } }),
    S('sombra', 'vulto', -3.2, 3.2, { escala: 2, oculto: true })],
  acoes: [
    a(0.3, 'flash', { intensidade: 0.9, duracao: 0.12 }), a(0.3, 'som', { som: 'trovao', volume: 0.6 }),
    a(0.5, 'flash', { intensidade: 0.9, duracao: 0.12 }), a(0.5, 'aparecer', { alvo: 'sombra', som: 'sombra-surge', duracao: 0.05 }),
    a(0.52, 'tremer', { intensidade: 0.5, durF: 0.15 }), a(0.6, 'emocao', { alvo: 'bia', icone: '!' }),
    a(0.72, 'flash', { intensidade: 0.7, duracao: 0.1 }), a(0.72, 'mover', { alvo: 'sombra', para: -2.2, duracao: 0.05 })],
}));
C.push(cena('Em pé, quietinho, há dez anos. E agora ele sabia que ela tinha visto.', {
  cenario: QN, camera: { x: -1.2, y: 3.6 }, foco: -1.2,
  elementos: [P('bia', 'menina-capa', 0, 1.2, { virado: 'esquerda' }), S('sombra', 'vulto', -2.2, 3.2, { escala: 2 })],
  acoes: [
    a(0.35, 'som', { som: 'suspense' }),
    a(0.72, 'flash', { intensidade: 1, duracao: 0.15 }), a(0.72, 'trocar', { alvo: 'sombra', estado: 'olhos' }),
    a(0.72, 'mover', { alvo: 'sombra', para: -1.2, duracao: 0.05 }),
    a(0.74, 'tremer', { intensidade: 1, durF: 0.22 }), a(0.74, 'som', { som: 'trovao' }), a(0.76, 'som', { som: 'sombra-surge' })],
}));

// Continuidade (npm run conferir): cenas do mesmo "momento" da história têm o mesmo elenco; "saiDeCena" = saiu pela história
marcar(C, { 'bia-rua': [[3, 4]], 'quarto-noite': [[7, 7], [9, 11]] });

// Expressões no rosto (PROTÓTIPO motor/expressoes.js): [cena, quem, rosto, início (fração da fala)]
rostos(C, [[1, "tonho", "feliz"], [1, "prof", "feliz"], [3, "bia", "pensativo", 0.4], [5, "prof", "assustado", 0.3], [5, "tonho", "assustado", 0.35], [5, "bia", "triste", 0.6], [7, "bia", "assustado", 0.5], [8, "tonho", "assustado", 0.4], [8, "prof", "assustado", 0.4], [8, "policial", "assustado", 0.4], [9, "bia", "assustado", 0.3], [10, "bia", "assustado"], [11, "bia", "assustado"]]);

salvar('nesse-mundo-guardioes', ['NESSE MUNDO (curto, terror) — "Nessa cidade, cada pessoa tem um guardião que só acorda no perigo."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-guardioes',
  'Usa protótipos: guardiões (guardiao-azul, guardia-verde, guardiao-noturno, guardiao-chefe) + estados tremendo/olhando-lado, vulto e quarto-menina-noite-diorama. "vertical" = enquadramento do Shorts.'], R);
