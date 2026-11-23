import { turma, marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';

// Troca de corpo: flash, as duas ALMAS saem das cabeças, se cruzam no ar e entram no corpo do outro; "?" nos dois.
// A e B: { id, x, z, y? }. Devolve { el, ac } para juntar nos elementos e ações da cena.
let nAlma = 0;
function troca(f, A, B) {
  const k = ++nAlma, ya = (A.y || 0) + 2.4, yb = (B.y || 0) + 2.4, mx = (A.x + B.x) / 2, my = Math.max(ya, yb) + 1.3;
  const ea = S('almaA' + k, 'alma', A.x, A.z - 0.1, { y: ya, pose: 'azul', oculto: true });
  const eb = S('almaB' + k, 'alma', B.x, B.z - 0.1, { y: yb, pose: 'rosa', oculto: true });
  return { el: [ea, eb], ac: [
    a(f, 'flash', { intensidade: 0.5 }), a(f, 'som', { som: 'magia' }),
    a(f, 'aparecer', { alvo: ea.id, som: null, duracao: 0.15 }), a(f, 'aparecer', { alvo: eb.id, som: null, duracao: 0.15 }),
    a(f + 0.04, 'mover', { alvo: ea.id, para: [mx - 0.3, my], durF: 0.12 }), a(f + 0.04, 'mover', { alvo: eb.id, para: [mx + 0.3, my], durF: 0.12 }),
    a(f + 0.17, 'mover', { alvo: ea.id, para: [B.x, yb], durF: 0.12 }), a(f + 0.17, 'mover', { alvo: eb.id, para: [A.x, ya], durF: 0.12 }),
    a(f + 0.3, 'desaparecer', { alvo: ea.id, duracao: 0.2 }), a(f + 0.3, 'desaparecer', { alvo: eb.id, duracao: 0.2 }),
    a(f + 0.32, 'emocao', { alvo: A.id, icone: '?' }), a(f + 0.34, 'emocao', { alvo: B.id, icone: '?' }),
  ] };
}
const junta = (...partes) => ({ el: partes.flatMap((p) => p.el || []), ac: partes.flatMap((p) => p.ac || p) });
const R = base('Nessa cidade, quem espirra troca de corpo');
const C = R.cenas;
const atchim = (f, alvo) => [a(f, 'espirrar', { alvo }), a(f + 0.12, 'falar', { alvo, texto: '* Atchim!' })];
const PD = 'praca-decorada';
const palanque = (extra = {}) => P('prefeito', 'prefeito', 5, -6.7, { y: 0.75, virado: 'esquerda', ...extra });

// 1. Regra + mundo
const T1 = troca(0.3, { id: 'aluno', x: 9.6, z: 5.2 }, { id: 'policial', x: 11, z: 5.4 });
C.push(cena('Nessa cidade, quem espirra troca de corpo com quem estiver mais perto.', {
  cenario: 'rua-comercial', transicao: 'fade', camera: RUA(10.4), foco: 10.4,
  elementos: [P('aluno', 'aluno', 9.6, 5.2), P('policial', 'policial', 11, 5.4, { virado: 'esquerda' }), ...T1.el],
  acoes: [...atchim(0.05, 'aluno'), ...T1.ac, a(0.68, 'falar', { alvo: 'policial', texto: '* Cadê minha mochila?' })],
}));
C.push(cena('Por isso, ninguém chega perto de ninguém. A fila do mercado tem três quarteirões.', {
  cenario: 'rua-comercial', camera: RUA(14), foco: 14,
  titulo: 'NESSA CIDADE, QUEM ESPIRRA TROCA DE CORPO', tituloInicio: 0.2, tituloDuracao: 2.6,
  elementos: [P('caixa', 'caixa', 16.6, 5.4, { virado: 'esquerda' }), P('tonho', 'padeiro', 15.4, 5.2), P('prof', 'professora', 11.8, 5.2), P('aluna', 'aluna', 9.2, 5.2)],
  acoes: [a(0.5, 'emocao', { alvo: 'prof', icone: '...' }), a(0.75, 'emocao', { alvo: 'aluna', icone: 'zzz' })],
}));
C.push(cena('E em dia de gripe a escola fecha, para a professora não acordar no corpo de um aluno.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: 4,
  elementos: turma([P('prof', 'professora', 8.1, 1.6, { virado: 'esquerda' }), P('aluno', 'aluno', 1.4, 2.45, { pose: 'sentado-lado' }), P('aluna', 'aluna', -1.6, 2.45, { pose: 'sentado-lado' })]),
  acoes: [...atchim(0.25, 'aluno'), a(0.4, 'emocao', { alvo: 'prof', icone: '!' }), a(0.5, 'pular', { alvo: 'prof', altura: 0.6 }), a(0.62, 'falar', { alvo: 'prof', texto: '* Ninguém chega perto!' }), a(0.75, 'emocao', { alvo: 'aluna', icone: '...' })],
}));
C.push(cena('O seu Tonho, o padeiro, não espirra há trinta anos. Faz pão com um pregador no nariz.', {
  cenario: 'rua-comercial', camera: { x: 0.6, z: 3.4, y: 2.6, zoom: 2 }, foco: 0.6,
  elementos: [P('tonho', 'padeiro-pregador', 0.6, 5.4)],
  acoes: [a(0.3, 'emocao', { alvo: 'tonho', icone: '...' }), a(0.75, 'falar', { alvo: 'tonho', texto: '* Pão quentinho!' })],
}));
C.push(cena('E tem uma mania estranha: adora ciscar as migalhas da calçada.', {
  cenario: 'rua-comercial', camera: RUA(0.6), foco: 0.6,
  elementos: [P('tonho', 'padeiro', -0.4, 5.2), P('pombo', 'pombo-fofoqueiro', 2.4, 5.6, { virado: 'esquerda' })],
  acoes: [a(0.35, 'pular', { alvo: 'tonho', altura: 0.3, para: 0.2 }), a(0.5, 'pular', { alvo: 'tonho', altura: 0.3, para: 0.8 }), a(0.65, 'pular', { alvo: 'tonho', altura: 0.3, para: 1.4 }),
    a(0.75, 'emocao', { alvo: 'pombo', icone: '?' })],
}));
C.push(cena('E o pombo da padaria passa o dia olhando para o forno, com saudade.', {
  cenario: 'rua-comercial', camera: { x: 0.6, z: 3.4, y: 2.6, zoom: 2 }, foco: 0.6,
  elementos: [P('pombo', 'pombo-fofoqueiro', 1.6, 5.6, { virado: 'esquerda' })],
  acoes: [a(0.55, 'emocao', { alvo: 'pombo', icone: 'coracao' })],
}));
// 2. Protagonista
C.push(cena('E tinha a Bia, de dez anos, alérgica a quase tudo.', {
  cenario: 'quarto-menina-diorama', camera: { x: 0, y: 3 }, foco: 0,
  elementos: [P('bia', 'menina-capa', -1.5, 1.6)],
  acoes: [a(0.1, 'andar', { alvo: 'bia', para: 1, durF: 0.5 }), ...atchim(0.7, 'bia')],
}));
C.push(cena('Ela espirra sempre duas vezes seguidas. E nunca trocou de corpo com ninguém.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  elementos: [P('bia', 'menina-capa', -0.6, 0.6), P('aluna', 'aluna', 0.8, 0.6, { virado: 'esquerda' })],
  acoes: [a(0, 'espirrar', { alvo: 'bia', duracao: 0.8 }), a(0.2, 'espirrar', { alvo: 'bia', duracao: 0.8 }), a(0.1, 'falar', { alvo: 'bia', texto: '* Atchim! Atchim!' }), a(0.55, 'emocao', { alvo: 'aluna', icone: '!' }), a(0.8, 'emocao', { alvo: 'aluna', icone: '?' })],
}));
C.push(cena('E anda com um saquinho de pimenta no bolso, porque acha a merenda sem graça.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: 1.4,
  elementos: turma([P('bia', 'menina-capa', 1.4, 0.75, { pose: 'sentado-lado' }), P('aluno', 'aluno', -1.6, 0.75, { pose: 'sentado-lado' }), S('sanduiche', 'sanduiche', 2, 0.9, { y: 1.1 }), S('pimenta', 'saquinho-pimenta', 2.45, 0.55, { y: 0.78, pose: 'fechado', oculto: true })]),   // em cima da carteira, ao lado do sanduíche (no bolso ficava atrás da carteira)
  acoes: [a(0.15, 'aparecer', { alvo: 'pimenta' }), a(0.45, 'trocar', { alvo: 'pimenta', estado: 'aberto' }), a(0.45, 'som', { som: 'papel' }), a(0.6, 'magia', { alvo: 'sanduiche' }), a(0.8, 'emocao', { alvo: 'bia', icone: 'coracao' })],
}));
// ---- Praça do festival: o PÚBLICO FICA O TEMPO TODO no mesmo lugar (continuidade); cada cena só muda a câmera e as ações.
// Fileira da frente z -8.8, de trás z -7.8. As árvores da frente saem (padrão de nm.mjs) para não cobrir ninguém.
const POS = {
  caixa: [-5.0, -7.8], tonho: [-4.2, -8.8], pombo: [-2.9, -8.5], prof: [-1.4, -8.8], aluno: [0.2, -8.8],
  aluna: [1.2, -7.8], policial: [1.9, -8.8], cao: [3.3, -8.6],
};
const QUEM = { caixa: 'caixa', tonho: 'padeiro', pombo: 'pombo-fofoqueiro', prof: 'professora', aluno: 'aluno', aluna: 'aluna', policial: 'policial', cao: 'cao-guarda' };
const VIRADO = { aluno: 'esquerda', aluna: 'esquerda', policial: 'esquerda', cao: 'esquerda' };
const pos = (id) => ({ id, x: POS[id][0], z: POS[id][1] });
// bia: onde a Bia está nesta cena ({ x, z, y } ou null para fora de cena)
function FESTA({ bia = { x: -5.6, z: -8.8 }, biaExtra = {}, sem = [] } = {}) {
  const el = Object.entries(POS).filter(([id]) => !sem.includes(id)).map(([id, [x, z]]) => P(id, QUEM[id], x, z, VIRADO[id] ? { virado: VIRADO[id] } : {}));
  el.push(P('prefeito', 'prefeito', 5, -6.7, { y: 0.75, virado: 'esquerda' }));
  if (bia) el.push(P('bia', 'menina-capa', bia.x, bia.z, { ...(bia.y ? { y: bia.y } : {}), ...biaExtra }));
  return el;
}
const PREF = { id: 'prefeito', x: 5, z: -6.7, y: 0.75 };
const BIA_PERTO = { x: -5.6, z: -8.8 };               // ao lado do seu Tonho, depois que ela corre para ajudar
const BIA_PALANQUE = { x: 3.8, z: -6.7, y: 0.75 };

// 3. Evento
C.push(cena('Até que chegou a Festa da Primavera, com a praça cheia de flores.', {
  cenario: PD, camera: PRACA(-1), foco: -1,
  elementos: FESTA({ bia: { x: -9.5, z: -8.8 } }),
  acoes: [a(0.05, 'andar', { alvo: 'bia', para: -7.2, durF: 0.6 }), a(0.55, 'emocao', { alvo: 'prof', icone: 'coracao' }), a(0.7, 'emocao', { alvo: 'tonho', icone: 'coracao' })],
}));
C.push(cena('O prefeito subiu no palanque para fazer o discurso.', {
  cenario: PD, camera: PRACA(3.5), foco: 5,
  elementos: FESTA({ bia: { x: -7.2, z: -8.8 } }),
  acoes: [a(0.45, 'falar', { alvo: 'prefeito', texto: '* Caros eleitores...' }), a(0.8, 'emocao', { alvo: 'cao', icone: 'zzz' })],
}));
C.push(cena('Bem na hora, uma ventania soprou o pólen de todas as flores de uma vez.', {
  cenario: PD, camera: PRACA(-1), foco: -1, clima: 'polen', ambiente: [['vento', 0.8]],
  elementos: FESTA({ bia: { x: -7.2, z: -8.8 } }),
  acoes: [a(0.45, 'tremer', { intensidade: 0.4, durF: 0.3 }), a(0.55, 'emocao', { alvo: 'prof', icone: '!' }), a(0.6, 'emocao', { alvo: 'aluno', icone: '!' }), a(0.66, 'emocao', { alvo: 'caixa', icone: '!' })],
}));
// 4. Escalada
{ const t = troca(0.3, pos('prof'), pos('aluno'));
C.push(cena('Primeiro espirrou a professora. E acordou no corpo do aluno.', {
  cenario: PD, camera: PRACA(-0.6), foco: -0.6, clima: 'polen',
  elementos: [...FESTA({ bia: { x: -7.2, z: -8.8 } }), ...t.el],
  acoes: [...atchim(0, 'prof'), ...t.ac, a(0.72, 'falar', { alvo: 'aluno', texto: '* Silêncio, turma!' })],
})); }
{ const t = junta(troca(0.08, pos('tonho'), pos('caixa')), troca(0.22, pos('policial'), pos('aluna')), troca(0.4, pos('pombo'), pos('prof')));
C.push(cena('Depois, cinco de uma vez. Em um minuto, doze pessoas estavam no corpo errado.', {
  cenario: PD, camera: PRACA(-1), foco: -1, clima: 'polen',
  elementos: [...FESTA({ bia: { x: -7.2, z: -8.8 } }), ...t.el],
  acoes: [...t.ac, a(0.75, 'tremer', { intensidade: 0.5, durF: 0.15 }), a(0.78, 'emocao', { alvo: 'bia', icone: '!' })],
})); }
{ const t = troca(0.06, PREF, pos('cao'));
C.push(cena('O prefeito trocou com o cachorro da delegacia, e terminou o discurso latindo.', {
  cenario: PD, camera: PRACA(3.5), foco: 4.2, clima: 'polen',
  elementos: [...FESTA({ bia: { x: -7.2, z: -8.8 } }), ...t.el],
  acoes: [...t.ac, a(0.45, 'falar', { alvo: 'cao', texto: '* Votem em mim!' }), a(0.72, 'falar', { alvo: 'prefeito', texto: '* Au! Au! Auuu!' })],
})); }
C.push(cena('O policial foi parar no corpo da moça do caixa, e multava todo mundo com voz fininha.', {
  cenario: PD, camera: PRACA(-2.6), foco: -4.6, clima: 'polen',
  elementos: FESTA({ bia: { x: -7.2, z: -8.8 } }),
  acoes: [a(0.45, 'falar', { alvo: 'caixa', texto: '* Teje multado!' }), a(0.8, 'emocao', { alvo: 'tonho', icone: '!' })],
}));
{ const t = troca(0.05, pos('aluna'), PREF);
C.push(cena('E a aluna, melhor amiga da Bia, acordou em cima do palanque. De terno.', {
  cenario: PD, camera: PRACA(3.5), foco: 5, clima: 'polen',
  elementos: [...FESTA({ bia: { x: -7.2, z: -8.8 } }), ...t.el],
  acoes: [...t.ac, a(0.62, 'falar', { alvo: 'prefeito', texto: '* Por que eu tô de terno?!' })],
})); }
// 5. Protagonista atingida
C.push(cena('A Bia correu para ajudar, mas o pólen entrou direto no nariz dela.', {
  cenario: PD, camera: PRACA(-3), foco: -5, clima: 'polen',
  elementos: FESTA({ bia: { x: -7.2, z: -8.8 } }),
  acoes: [a(0.05, 'correr', { alvo: 'bia', para: BIA_PERTO.x, durF: 0.4 }), a(0.7, 'emocao', { alvo: 'bia', icone: '!' })],
}));
{ const t = troca(0.22, { id: 'bia', ...BIA_PERTO }, pos('tonho'));
C.push(cena('Atchim! E ela acordou no corpo do seu Tonho.', {
  cenario: PD, camera: { x: -4.9, z: -9.8, zoom: 2 }, foco: -4.9, clima: 'polen',
  elementos: [...FESTA({ bia: BIA_PERTO }), ...t.el],
  acoes: [...atchim(0, 'bia'), ...t.ac, a(0.62, 'falar', { alvo: 'tonho', texto: '* Eu tô cheirando a pão!' })],
})); }
C.push(cena('Com medo de trocar de novo, ela tapou o nariz e segurou o segundo espirro.', {
  cenario: PD, camera: { x: -4.9, z: -9.8, zoom: 2 }, foco: -4.9, clima: 'polen',
  elementos: FESTA({ bia: BIA_PERTO }),
  acoes: [a(0.3, 'espirrar', { alvo: 'tonho', durF: 0.65, inspira: 0.99, som: null }), a(0.35, 'piscar', { alvo: 'tonho', durF: 0.5 }), a(0.4, 'tremer', { intensidade: 0.3, durF: 0.5 })],
}));
{ const t = troca(0.42, { id: 'bia', ...BIA_PERTO }, pos('tonho'));
C.push(cena('Mas não deu. Atchim! E ela voltou para o próprio corpo.', {
  cenario: PD, camera: { x: -4.9, z: -9.8, zoom: 2 }, foco: -4.9, clima: 'polen',
  elementos: [...FESTA({ bia: BIA_PERTO }), ...t.el],
  acoes: [a(0.1, 'espirrar', { alvo: 'tonho' }), a(0.25, 'falar', { alvo: 'tonho', texto: '* Atchim!' }), ...t.ac, a(0.85, 'pular', { alvo: 'bia', altura: 0.5 })],
})); }
// 6. Descoberta
C.push(cena('Foi aí que a Bia entendeu tudo: o segundo espirro desfaz a troca.', {
  cenario: PD, camera: PRACA(-3), foco: -5.6,
  elementos: FESTA({ bia: BIA_PERTO }),
  acoes: [a(0.3, 'emocao', { alvo: 'bia', icone: '!' }), a(0.3, 'som', { som: 'revelar' }), a(0.3, 'flash', { intensidade: 0.4 })],
}));
C.push(cena('Ela nunca teve sorte nenhuma. Ela só espirrava sempre duas vezes.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  elementos: [P('bia', 'menina-capa', -0.6, 0.6), P('aluna', 'aluna', 0.8, 0.6, { virado: 'esquerda' })],
  acoes: [a(0.3, 'espirrar', { alvo: 'bia', duracao: 0.8 }), a(0.55, 'espirrar', { alvo: 'bia', duracao: 0.8 }), a(0.4, 'falar', { alvo: 'bia', texto: '* Atchim! Atchim!' })],
}));
{ const t = troca(0.78, { id: 'tonho', x: 0, z: 5.4 }, { id: 'pombo', x: 1.4, z: 5.6, y: -1 });
C.push(cena('E o seu Tonho não ciscava por mania. Trinta anos atrás, ele espirrou uma vez só.', {
  cenario: 'rua-comercial', camera: RUA(0.6), foco: 0.6,
  elementos: [P('tonho', 'padeiro', 0, 5.4), P('pombo', 'pombo-fofoqueiro', 1.4, 5.6, { virado: 'esquerda' }), ...t.el],
  acoes: [a(0.5, 'espirrar', { alvo: 'tonho' }), a(0.6, 'falar', { alvo: 'tonho', texto: '* Atchim!' }), ...t.ac],
})); }
C.push(cena('O pombo da padaria era o seu Tonho de verdade.', {
  cenario: PD, camera: { x: -3.5, z: -9.8, zoom: 2 }, foco: -3.5,
  elementos: FESTA({ bia: BIA_PERTO }),
  acoes: [a(0.35, 'emocao', { alvo: 'pombo', icone: '!' }), a(0.6, 'falar', { alvo: 'pombo', texto: '* Até que enfim!' })],
}));
// 7. Solução
C.push(cena('A Bia subiu no palanque e abriu o saquinho de pimenta.', {
  cenario: PD, camera: PRACA(3.5), foco: 4.4,
  elementos: [...FESTA({ bia: { x: 2.6, z: -6.7, y: 0.75 } }), S('pimenta', 'saquinho-pimenta', 0, 0, { sobre: { id: 'bia', dx: 0.7, dy: 0.9 }, pose: 'fechado' })],
  acoes: [a(0.05, 'andar', { alvo: 'bia', para: BIA_PALANQUE.x, durF: 0.35 }), a(0.45, 'virar', { alvo: 'bia', direcao: 'esquerda' }), a(0.7, 'trocar', { alvo: 'pimenta', estado: 'aberto', som: 'papel' })],
}));
C.push(cena('E soprou a pimenta na praça inteira.', {
  cenario: PD, camera: PRACA(1), foco: 1, clima: 'poeira',
  elementos: [...FESTA({ bia: BIA_PALANQUE, biaExtra: { virado: 'esquerda' } }), S('pimenta', 'saquinho-pimenta', 0, 0, { sobre: { id: 'bia', dx: 0.7, dy: 0.9 }, pose: 'aberto' })],
  acoes: [a(0.25, 'tremer', { intensidade: 0.5, durF: 0.4 }), a(0.3, 'som', { som: 'magia' }), a(0.65, 'emocao', { alvo: 'prof', icone: '!' }), a(0.7, 'emocao', { alvo: 'caixa', icone: '!' })],
}));
{ const t = junta(troca(0.08, pos('prof'), pos('aluno')), troca(0.6, pos('policial'), pos('caixa')));
C.push(cena('Atchim, atchim! A professora voltou para o próprio corpo. Depois, o policial.', {
  cenario: PD, camera: PRACA(-1), foco: -0.6, clima: 'poeira',
  elementos: [...FESTA({ bia: BIA_PALANQUE, biaExtra: { virado: 'esquerda' } }), ...t.el],
  acoes: [a(0, 'espirrar', { alvo: 'prof', duracao: 0.7 }), ...t.ac, a(0.5, 'pular', { alvo: 'prof', altura: 0.4 })],
})); }
{ const t = troca(0.35, PREF, pos('cao'));
C.push(cena('Depois, o prefeito, que parou de latir bem no meio da frase.', {
  cenario: PD, camera: PRACA(3.5), foco: 4.2, clima: 'poeira',
  elementos: [...FESTA({ bia: BIA_PALANQUE, biaExtra: { virado: 'esquerda' } }), ...t.el],
  acoes: [a(0.05, 'falar', { alvo: 'prefeito', texto: '* Au... digo, obrigado!' }), ...t.ac],
})); }
C.push(cena('Um por um, os doze voltaram para o próprio corpo. Só faltavam dois.', {
  cenario: PD, camera: PRACA(-1), foco: -3.5,
  elementos: FESTA({ bia: BIA_PALANQUE, biaExtra: { virado: 'esquerda' } }),
  acoes: [a(0.1, 'pular', { alvo: 'aluna', altura: 0.5 }), a(0.18, 'pular', { alvo: 'prof', altura: 0.5 }), a(0.26, 'pular', { alvo: 'aluno', altura: 0.5 }), a(0.3, 'pular', { alvo: 'caixa', altura: 0.5 }),
    a(0.7, 'emocao', { alvo: 'tonho', icone: '...' }), a(0.75, 'emocao', { alvo: 'pombo', icone: '...' })],
}));
// 8. Callback (a Bia desce do palanque e vai até os dois)
C.push(cena('O seu Tonho olhou para o pombo. O pombo olhou para o seu Tonho.', {
  cenario: PD, camera: { x: -3.5, z: -9.8, zoom: 2 }, foco: -3.5,
  elementos: FESTA({ bia: BIA_PERTO }),
  acoes: [a(0.05, 'virar', { alvo: 'tonho', direcao: 'direita' }), a(0.55, 'virar', { alvo: 'pombo', direcao: 'esquerda' })],
}));
C.push(cena('A Bia ofereceu a pimenta. Os dois disseram não, obrigado.', {
  cenario: PD, camera: { x: -3.9, z: -9.8, zoom: 2 }, foco: -3.9,
  elementos: [...FESTA({ bia: BIA_PERTO, biaExtra: { virado: 'direita' } }), S('pimenta', 'saquinho-pimenta', 0, 0, { sobre: { id: 'bia', dx: 0.7, dy: 0.9 }, pose: 'aberto' })],
  acoes: [a(0.1, 'magia', { alvo: 'pimenta' }), a(0.55, 'falar', { alvo: 'tonho', texto: '* Cruu!' }), a(0.75, 'emocao', { alvo: 'bia', icone: '...' })],
}));
C.push(cena('Até hoje, quem faz o pão da cidade é o pombo. E nunca foi tão bom.', {
  cenario: 'rua-comercial', camera: { x: 0.6, z: 3.4, y: 2.6, zoom: 2 }, foco: 0.6,
  elementos: [P('pombo', 'pombo-fofoqueiro', 0.6, 5.6), P('tonho', 'padeiro', 2.2, 5.2, { virado: 'esquerda' }), S('pao', 'pao', 1, 5.7, { y: 0.6, oculto: true })],
  acoes: [a(0.35, 'aparecer', { alvo: 'pao' }), a(0.5, 'pular', { alvo: 'tonho', altura: 0.3 }), a(0.75, 'emocao', { alvo: 'pombo', icone: 'coracao' }), a(0.85, 'som', { som: 'sucesso' })],
}));

// Continuidade (npm run conferir): cenas do mesmo "momento" da história têm o mesmo elenco; "saiDeCena" = saiu pela história
marcar(C, { festa: [[10, 22], [25, 32]] });

// Expressões no rosto (PROTÓTIPO motor/expressoes.js): [cena, quem, rosto, início (fração da fala)]
rostos(C, [[2, "caixa", "bravo", 0.4], [3, "prof", "assustado", 0.3], [5, "tonho", "feliz", 0.4], [7, "bia", "envergonhado", 0.5], [10, "prefeito", "feliz"], [10, "caixa", "feliz"], [10, "prof", "feliz"], [10, "aluna", "feliz"], [10, "bia", "feliz"], [11, "prefeito", "rindo", 0.3], [12, "bia", "assustado", 0.5], [12, "aluna", "assustado", 0.5], [13, "aluno", "surpreso", 0.5], [13, "prof", "surpreso", 0.5], [14, "tonho", "assustado", 0.3], [14, "caixa", "assustado", 0.3], [15, "prefeito", "envergonhado", 0.4], [16, "caixa", "bravo", 0.4], [16, "policial", "surpreso", 0.3], [17, "aluna", "surpreso", 0.4], [17, "bia", "surpreso", 0.4], [18, "bia", "assustado", 0.5], [19, "tonho", "surpreso", 0.5], [20, "tonho", "envergonhado", 0.3], [21, "bia", "surpreso", 0.6], [22, "bia", "feliz", 0.5], [23, "bia", "feliz"], [23, "aluna", "rindo", 0.5], [24, "tonho", "triste", 0.4], [25, "bia", "surpreso", 0.3], [26, "bia", "bravo", 0.2], [27, "bia", "rindo", 0.3], [28, "prof", "feliz", 0.5], [29, "prefeito", "envergonhado", 0.4], [30, "caixa", "feliz"], [30, "aluna", "feliz"], [30, "bia", "feliz"], [31, "tonho", "pensativo"], [32, "tonho", "rindo", 0.5], [32, "bia", "feliz"], [33, "tonho", "feliz"]]);

salvar('nesse-mundo-espirro', ['NESSE MUNDO (longo, cômico) — "Nessa cidade, quem espirra troca de corpo com quem estiver mais perto."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-espirro',
  'Troca de corpo = faíscas + flash + "?" nos dois; quem está no corpo errado fala com a voz/assunto do outro (balões).',
  'Protótipos: espirrar, clima polen, saquinho-pimenta, pao, padeiro-pregador, quarto-menina-diorama. "vertical" = enquadramento do Shorts.'], R);
