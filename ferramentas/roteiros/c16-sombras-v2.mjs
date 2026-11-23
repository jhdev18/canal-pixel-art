import { alturaShorts, marcar, P, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, TERROR de dia — versão 2 do vídeo das sombras (para o canal novo; NÃO é repost: texto, cenas e final novos).
// Mesma regra (a sombra de todo mundo anda na frente), mesmas táticas que deram 68,5% de retenção: a sombra se mexe aos 0,3 s,
// "você/sua" na 1ª frase, a regra na tela em toda cena, contraste da Bia sem som (a sombra DELA fica atrás, grudada no calcanhar),
// "Até que" a ~34%, pico de movimento no meio (a cidade correndo atrás das sombras), a Bia escolhe agir (dá um passo para trás),
// a virada inverte a crença ("é só ir atrás dela" → "não iam na frente para guiar; iam para esperar") e a última imagem é a
// sombra da Bia, escondida atrás dela. Tudo de dia.
const sp = (id, x, z, s = {}, e = {}) => ({ id, sombraPessoa: { tamanho: 2.2, direcao: 90, ...s }, x, z, ...e });
// Pessoa + a PRÓPRIA sombra BEM na frente (GAP); as duas vão até o fim da fala (ninguém para antes).
const GAP = 1.4;
function par(id, quem, x0, x1, z, { f0 = 0, tam = 1.8, tipo = 'andar', s = {} } = {}) {
  const sid = 's-' + id, d = x1 >= x0 ? 1 : -1;
  return {
    el: [P(id, quem, x0, z), sp(sid, x0 + d * GAP, z + 0.2, { tamanho: tam, direcao: d > 0 ? 90 : 270, ...s })],
    ac: [a(f0, tipo, { alvo: sid, para: x1 + d * GAP, durF: 1 - f0 }), a(f0 + 0.04, tipo, { alvo: id, para: x1, durF: 0.96 - f0 })],
  };
}
const R = base('Nessa cidade, a sua sombra anda sempre na sua frente', 'suspense');
const C = R.cenas;

// 1. Gancho: aos 0,3 s a sombra do seu Tonho já está andando BEM na frente dele (grande, de dia)
const P1 = par('tonho', 'padeiro', -4.6, 3.4, 4.6, { tam: 2.4 });
C.push(cena('Nessa cidade, a sua sombra anda sempre na sua frente.', {
  cenario: 'rua-comercial', transicao: 'fade', camera: RUA(0.6), foco: 'tonho',
  elementos: [...P1.el], acoes: [...P1.ac],
}));
// 2. Crença como AÇÃO: ninguém usa mapa, é só ir atrás dela (professora e aluno seguindo as sombras)
const P2a = par('prof', 'professora', 1.0, 5.8, 5.2), P2b = par('aluno', 'aluno', 2.6, 7.4, 4.6, { f0: 0.06 });
C.push(cena('Ninguém usa mapa. Quem quer chegar, é só ir atrás dela.', {
  cenario: 'rua-comercial', camera: RUA(4.6),
  titulo: 'A SUA SOMBRA ANDA NA SUA FRENTE', tituloInicio: 0.3, tituloDuracao: 2.6,
  elementos: [...P2a.el, ...P2b.el], acoes: [...P2a.ac, ...P2b.ac],
}));
// 3. A anomalia (se entende sem som): a Bia anda para a direita e a sombra dela vem ATRÁS, grudada no calcanhar
C.push(cena('Só a sombra da Bia anda para trás, grudada no calcanhar.', {
  cenario: 'rua-comercial', camera: FRENTE(0.6), foco: 'bia',
  elementos: [P('bia', 'menina-capa', -2.6, 0.6), sp('sb', -3.1, 0.8, { tamanho: 1.6, direcao: 270 })],
  acoes: [a(0, 'andar', { alvo: 'bia', para: 1.4, durF: 1 }), a(0, 'andar', { alvo: 'sb', para: 0.9, durF: 1 }), a(0.6, 'emocao', { alvo: 'bia', icone: '?' })],
}));
// 4. O sofrimento dela dura 1 cena: no pátio da escola ela tropeça (sem sombra na frente) e a turma ri
C.push(cena('Por isso, ela tropeça em tudo. A turma ri dela no recreio.', {
  cenario: 'escola-patio', camera: { x: 0.4, z: 2.2, y: 2.6 }, foco: ['bia', 'nina'],
  elementos: [P('bia', 'menina-capa', -2.6, 2.6), P('nina', 'rival', 1.8, 3.2), P('aluna', 'aluna', 3.2, 3.6), P('leo', 'menino-topete', 0.4, 3.8)],
  acoes: [a(0, 'correr', { alvo: 'bia', para: -0.8, durF: 0.3 }), a(0.3, 'pular', { alvo: 'bia', altura: 0.15, durF: 0.12 }), a(0.32, 'som', { som: 'dano' }),
    a(0.34, 'tremer', { intensidade: 0.2, durF: 0.08 }), a(0.45, 'falar', { alvo: 'nina', texto: '* Tropeçona!' }), a(0.75, 'emocao', { alvo: 'bia', icone: '...' })],
}));
// 5. O evento chega cedo (~34%): num sábado de sol, as sombras aceleram sozinhas (4 grandes, sem dono na tela)
C.push(cena('Até que, num sábado de sol, as sombras começaram a correr.', {
  cenario: 'rua-comercial', camera: RUA(6.5),
  elementos: [sp('s1', -0.4, 5.6, { tamanho: 2.6 }), sp('s2', 2.2, 4.4, { tamanho: 2.2 }), sp('s3', 4.6, 5.6, { tamanho: 3 }), sp('s4', 6.8, 4.0, { tamanho: 2.4 })],
  acoes: [a(0.08, 'andar', { alvo: 's1', para: 3.6, durF: 0.3 }), a(0.38, 'correr', { alvo: 's1', para: 13, durF: 0.6 }),
    a(0.12, 'andar', { alvo: 's2', para: 5.4, durF: 0.3 }), a(0.42, 'correr', { alvo: 's2', para: 15, durF: 0.56 }),
    a(0.16, 'andar', { alvo: 's3', para: 7.6, durF: 0.3 }), a(0.46, 'correr', { alvo: 's3', para: 17, durF: 0.52 }),
    a(0.2, 'andar', { alvo: 's4', para: 9.6, durF: 0.3 }), a(0.5, 'correr', { alvo: 's4', para: 19, durF: 0.48 }),
    a(0.38, 'som', { som: 'suspense' }), a(0.4, 'tremer', { intensidade: 0.2, durF: 0.08 })],
}));
// 6. Pico de movimento no MEIO: a cidade inteira corre atrás das sombras, rindo (cada um na sua faixa de z; ninguém ultrapassa)
const P6 = [['tonho', 'padeiro', 5.25], ['prof', 'professora', 4.6], ['aluno', 'aluno', 4.2], ['policial', 'policial', 5.0]]
  .map(([id, q, z], i) => par(id, q, -1.6 + i * 2.2, 8.4 + i * 2.2, z, { f0: i * 0.03, tam: 1.6, tipo: 'correr' }));
C.push(cena('E a cidade inteira correu atrás delas, rindo, sem olhar para os lados.', {
  cenario: 'rua-comercial', camera: RUA(6.5),
  elementos: P6.flatMap((p) => p.el),
  acoes: [...P6.flatMap((p) => p.ac), a(0.5, 'emocao', { alvo: 'prof', icone: 'coracao' })],
}));
// 7. A pista volta: a sombra da Bia agarra o pé dela; ela tenta ir junto e não sai do lugar (o aluno passa correndo atrás)
C.push(cena('A sombra da Bia agarrou o pé dela e não soltou mais.', {
  cenario: 'rua-comercial', camera: FRENTE(1), foco: 'bia',
  elementos: [P('bia', 'menina-capa', 0.4, 0.6), sp('sb', -0.1, 0.8, { tamanho: 1.6, direcao: 270 }), P('aluno', 'aluno', -3.6, 0.2)],
  acoes: [a(0, 'correr', { alvo: 'aluno', para: 9.0, durF: 1 }), a(0.1, 'andar', { alvo: 'bia', para: 1.3, durF: 0.9 }),
    a(0.32, 'andar', { alvo: 'sb', para: -1.6, durF: 0.3 }), a(0.4, 'tremer', { intensidade: 0.45, durF: 0.18 }), a(0.42, 'emocao', { alvo: 'bia', icone: '!' })],
}));
// 8. A Bia ESCOLHE: para de lutar e dá um passo para trás, junto da própria sombra
C.push(cena('Então a Bia parou de lutar. E deu um passo para trás.', {
  cenario: 'rua-comercial', camera: FRENTE(-1.4), foco: 'bia',
  elementos: [P('bia', 'menina-capa', 0.9, 0.6, { virado: 'esquerda' }), sp('sb', -1.6, 0.8, { tamanho: 1.6, direcao: 270 })],
  acoes: [a(0.45, 'andar', { alvo: 'sb', para: -4.2, durF: 0.55 }), a(0.48, 'andar', { alvo: 'bia', para: -1.8, durF: 0.52 })],
}));
// 9–12: a mesma manhã na praça. A Bia de longe (sem árvore na frente), o grupo chegando atrás das sombras.
const BIA = (extra = {}) => P('bia', 'menina-capa', -4.6, -9.0, { virado: 'direita', ...extra });
const SB = (s = {}) => sp('sb', -5.1, -8.8, { tamanho: 1.6, direcao: 270, ...s });
const GX = [0.4, 2.0, 3.6], GRUPO = [['tonho', 'padeiro'], ['prof', 'professora'], ['aluno', 'aluno']];
const P9 = GRUPO.map(([id, q], i) => par(id, q, GX[i] + 4.4, GX[i], -8.4, { f0: i * 0.04, tam: 1.6 }));
C.push(cena('Na praça, as sombras chegaram primeiro e pararam.', {
  cenario: 'praca-parquinho', camera: PRACA(-1), foco: ['bia', 'aluno'],
  elementos: [BIA(), SB(), ...P9.flatMap((p) => p.el)],
  acoes: [...P9.flatMap((p) => p.ac), a(0.55, 'trocar', { alvo: 'balanco', estado: 'sozinho' }), a(0.65, 'trocar', { alvo: 'giragira', estado: 'girando' }),
    a(0.75, 'emocao', { alvo: 'bia', icone: '?' })],
}));
// depois da cena 9, o balanço e o gira-gira continuam se mexendo sozinhos (mesmo id do cenário = ajusta o elemento)
const BRINQUEDOS = () => [{ id: 'balanco', sprite: 'balanco', x: 2, z: -5.8, pose: 'sozinho' }, { id: 'giragira', sprite: 'gira-gira', x: -5.4, z: -6.4, pose: 'girando' }];
const SOMBRAS_GRUPO = (s = {}) => GRUPO.map(([id], i) => sp('s-' + id, GX[i] - GAP, -8.2, { tamanho: 1.6, ...s }));
const GRUPO_EL = () => GRUPO.map(([id, q], i) => P(id, q, GX[i], -8.4));
C.push(cena('E se viraram, devagar, para os donos.', {
  cenario: 'praca-parquinho', camera: PRACA(-1), foco: ['bia', 'aluno'],
  elementos: [...BRINQUEDOS(), BIA(), SB(), ...GRUPO_EL(), ...SOMBRAS_GRUPO({ direcao: 90, olhos: true })],
  acoes: [a(0.55, 'flash', { intensidade: 0.5 }), a(0.55, 'som', { som: 'revelar' }), a(0.6, 'emocao', { alvo: 'bia', icone: '!' })],
}));
// 11–12. Virada em 2 frases curtíssimas: a escuridão nasce no meio do grupo, sobe pelas pessoas e elas desaparecem
C.push(cena('Elas não iam na frente para guiar.', {
  cenario: 'praca-parquinho', camera: PRACA(-1), foco: ['bia', 'aluno'],
  elementos: [...BRINQUEDOS(), BIA(), SB(), ...GRUPO_EL(), ...SOMBRAS_GRUPO({ direcao: 90, olhos: true })],
  acoes: [a(0.05, 'sombra', { origem: [1.4, -8.4], raio: 2.8, durF: 0.95 }), a(0.3, 'tremer', { intensidade: 0.3, durF: 0.15 })],
}));
C.push(cena('Iam na frente para esperar.', {
  cenario: 'praca-parquinho', camera: PRACA(-1), foco: ['bia', 'aluno'],
  elementos: [...BRINQUEDOS(), BIA(), SB(), ...GRUPO_EL(), ...SOMBRAS_GRUPO({ direcao: 90, olhos: true })],
  acoes: [a(0.05, 'desaparecer', { alvo: 'tonho', durF: 0.4 }), a(0.2, 'desaparecer', { alvo: 'prof', durF: 0.4 }), a(0.35, 'desaparecer', { alvo: 'aluno', durF: 0.4 }),
    a(0.1, 'som', { som: 'sombra' }), a(0.4, 'tremer', { intensidade: 0.4, durF: 0.2 })],
  saiDeCena: ['tonho', 'prof', 'aluno'],
}));
// 13. Última imagem com a regra viva e emoção: na segunda, a praça vazia e a sombra da Bia escondida atrás dela, tremendo
C.push(cena('Na segunda, a sombra da Bia continuava escondida atrás dela. Tremendo.', {
  cenario: 'praca-parquinho', camera: { x: -4.6, z: -10.4, zoom: 2 }, foco: 'bia',
  elementos: [...BRINQUEDOS(), BIA({ virado: undefined }), SB(), sp('s1', -1.0, -8.2, { tamanho: 1.6, direcao: 90, olhos: true })],
  acoes: [a(0.55, 'tremer', { intensidade: 0.25, durF: 0.4 }), a(0.6, 'emocao', { alvo: 'bia', icone: '...' })],
}));

marcar(C, { 'sabado-praca': [[9, 12]] });
C[5].saiDeCena = ['policial'];
C[5].vidaNaRua = { pedestres: 3, pombos: 2 };   // pico de movimento: gente no fundo também correndo e pombos voando assustados   // o policial seguiu correndo pela rua (só o grupo chega na praça)
rostos(C, [[1, 'tonho', 'feliz'], [2, 'prof', 'feliz'], [2, 'aluno', 'feliz'], [3, 'bia', 'pensativo', 0.7],
  [4, 'nina', 'rindo', 0.4], [4, 'aluna', 'rindo', 0.45], [4, 'leo', 'rindo', 0.5], [4, 'bia', 'envergonhado', 0.6],
  [7, 'bia', 'assustado', 0.45], [8, 'bia', 'triste', 0.05, 0.4],
  [9, 'tonho', 'feliz', 0.8], [9, 'prof', 'feliz', 0.8], [9, 'aluno', 'feliz', 0.8],
  [10, 'bia', 'assustado', 0.6], [10, 'tonho', 'feliz'], [10, 'prof', 'feliz'], [10, 'aluno', 'feliz'],
  [11, 'bia', 'assustado'], [11, 'tonho', 'feliz'], [11, 'prof', 'feliz'], [11, 'aluno', 'feliz'], [12, 'bia', 'assustado'], [13, 'bia', 'triste', 0.4]]);
alturaShorts(C, { 3: -1, 4: -1.75, 7: -2.5, 8: -1, 9: -2.75, 10: -2.75, 11: -2.75, 12: -2.75, 13: -1 });

salvar('nesse-mundo-sombras-v2', ['NESSE MUNDO (curto, terror de dia) — v2 das sombras para o canal novo: "Nessa cidade, a sua sombra anda sempre na sua frente."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-sombras-v2',
  'Protótipos: sombraPessoa, ação sombra, desaparecer, escola-patio, rival (Nina), menino-topete (Léo). "vertical" = enquadramento do Shorts.'], R);
