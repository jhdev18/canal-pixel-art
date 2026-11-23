import { turma, marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
const sp = (id, x, z, extra = {}) => ({ id, sombraPessoa: { tamanho: 2.6, direcao: 0, ...(extra.s || {}) }, x, z, ...(extra.e || {}) });
// Pessoa + a PRÓPRIA sombra logo à frente (sombra deitada no sentido da caminhada). As duas andam juntas até o fim da
// fala (ninguém para e vira para a câmera); no fim a pessoa fica logo atrás da própria sombra.
const GAP = 0.5;
function par(id, quem, x0, x1, z, { f0 = 0, tam = 1.8, extra = {} } = {}) {
  const dir = x1 >= x0 ? 1 : -1, sid = 's-' + id;
  return {
    el: [P(id, quem, x0, z, extra), sp(sid, x0 + dir * GAP, z + 0.2, { s: { tamanho: tam, direcao: dir > 0 ? 90 : 270 } })],
    ac: [a(f0, 'andar', { alvo: sid, para: x1 + dir * GAP, durF: 1 - f0 }), a(f0 + 0.03, 'andar', { alvo: id, para: x1, durF: 0.97 - f0 })],
  };
}
const R = base('Nessa cidade, a sua sombra chega antes de você');
const C = R.cenas;

const P1 = par('tonho', 'padeiro', -5, 3, 5.2);
C.push(cena('Nessa cidade, a sua sombra sempre chega um minuto antes de você.', {
  cenario: 'rua-comercial', transicao: 'fade', camera: RUA(1), foco: 1,
  elementos: [...P1.el], acoes: [...P1.ac],
}));
const P2a = par('prof', 'professora', 0.6, 5.0, 5.2), P2b = par('aluno', 'aluno', 3.0, 7.4, 5.4, { f0: 0.05 });
C.push(cena('Por isso, ninguém se perde. É só seguir a própria sombra.', {
  cenario: 'rua-comercial', camera: RUA(5), foco: 5,
  titulo: 'NESSA CIDADE, A SUA SOMBRA CHEGA ANTES', tituloInicio: 0.3, tituloDuracao: 2.6,
  elementos: [...P2a.el, ...P2b.el], acoes: [...P2a.ac, ...P2b.ac],
}));
C.push(cena('Mas a sombra da Bia sempre vai para o lado contrário.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  elementos: [P('bia', 'menina-capa', -1, 0.6), sp('sb', -1.6, 0.8, { s: { tamanho: 2.2, direcao: 270 } })],
  acoes: [a(0.05, 'andar', { alvo: 'bia', para: 2, durF: 0.5 }), a(0.05, 'andar', { alvo: 'sb', para: -4.4, durF: 0.5 }),
    a(0.6, 'virar', { alvo: 'bia', direcao: 'esquerda' }), a(0.65, 'emocao', { alvo: 'bia', icone: '?' })],
}));
C.push(cena('Ela chega atrasada em tudo. Na escola, a chamam de perdida.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: -1.6,
  elementos: turma([P('aluna', 'aluna', -4.6, 2.45, { pose: 'sentado-lado' }), P('aluno', 'aluno', -1.6, 2.45, { pose: 'sentado-lado' }),
    P('prof', 'professora', 8.1, 1.6, { virado: 'esquerda' }), P('bia', 'menina-capa', -8.4, -0.1)], { livres: [[-1.6, 0.75]] }),   // a Bia (atrasada) entra pelo corredor da FRENTE das carteiras (z -0.1), sem passar por cima de ninguém; a carteira dela fica livre
  acoes: [a(0, 'correr', { alvo: 'bia', para: -1.6, durF: 0.35 }), a(0.4, 'emocao', { alvo: 'prof', icone: '!' }),
    a(0.55, 'falar', { alvo: 'aluna', texto: '* Perdida!' }), a(0.7, 'emocao', { alvo: 'bia', icone: '...' })],
}));
C.push(cena('Até que, num domingo, todas as sombras saíram andando sozinhas.', {
  cenario: 'rua-comercial', camera: RUA(6), foco: 6,
  elementos: [sp('s1', 0, 5.6), sp('s2', 2.6, 4.2, { s: { tamanho: 2.2 } }), sp('s3', 5, 5.6, { s: { tamanho: 3 } }), sp('s4', 7.4, 3.6, { s: { tamanho: 2.4 } })],
  acoes: [a(0.15, 'andar', { alvo: 's1', para: 6, durF: 0.8 }), a(0.2, 'andar', { alvo: 's2', para: 8.6, durF: 0.75 }),
    a(0.25, 'andar', { alvo: 's3', para: 11, durF: 0.7 }), a(0.3, 'andar', { alvo: 's4', para: 13, durF: 0.65 }), a(0.12, 'som', { som: 'suspense' })],
}));

const X0 = -0.6;
const P7 = [['tonho', 'padeiro'], ['prof', 'professora'], ['aluno', 'aluno'], ['policial', 'policial']].map(([id, q], i) => par(id, q, X0 + i * 2.0, X0 + 7 + i * 2.0, 5.2, { f0: i * 0.02, tam: 1.6 }));   // na calçada dos prédios; X0 escolhido para nenhum parar ATRÁS de um poste
C.push(cena('E os moradores foram atrás delas, sorrindo, um atrás do outro.', {
  cenario: 'rua-comercial', camera: RUA(6.5), foco: 6.5,
  elementos: P7.flatMap((p) => p.el),
  acoes: [...P7.flatMap((p) => p.ac), a(0.5, 'emocao', { alvo: 'prof', icone: 'coracao' })],
}));
C.push(cena('Só a sombra da Bia puxava para o outro lado. Com força.', {
  cenario: 'rua-comercial', camera: FRENTE(1), foco: 1,
  elementos: [P('bia', 'menina-capa', 0, 0.6), sp('sb', -0.4, 1.4, { s: { tamanho: 2.2, direcao: 90 } }), P('aluno', 'aluno', 4.2, 0.6)],
  acoes: [a(0, 'andar', { alvo: 'aluno', para: 8.6, durF: 1 }), a(0.1, 'andar', { alvo: 'sb', para: -2.4, durF: 0.5 }),
    a(0.7, 'tremer', { intensidade: 0.5, durF: 0.15 }), a(0.75, 'emocao', { alvo: 'bia', icone: '!' })],
}));
C.push(cena('A Bia parou na esquina. E, pela primeira vez, seguiu a própria sombra.', {
  cenario: 'rua-comercial', camera: FRENTE(-3), foco: -3,
  elementos: [P('bia', 'menina-capa', -1, 0.6, { virado: 'esquerda' }), sp('sb', -1.5, 0.8, { s: { tamanho: 2.2, direcao: 270 } })],
  acoes: [a(0.4, 'andar', { alvo: 'sb', para: -6.5, durF: 0.6 }), a(0.43, 'andar', { alvo: 'bia', para: -6, durF: 0.57 })],
}));
// A partir da cena 9: a Bia fica no canto da praça, AO LADO da árvore (na frente dela, sem ser coberta), olhando o grupo.
const ARVORE = () => S('arvoreBia', 'arvore-iso-grande', -9.2, -9.6);
const BIA_ESCONDIDA = (extra = {}) => P('bia', 'menina-capa', -5.4, -10.3, { virado: 'direita', ...extra });
const GRUPO = () => [P('tonho', 'padeiro', 0.6, -8.4), P('prof', 'professora', 2.1, -8.6), P('aluno', 'aluno', 3.6, -8.4)];   // na frente da fonte (não em cima nem atrás dela)

C.push(cena('Lá de longe, ela olhou para trás e congelou.', {
  cenario: 'praca', camera: PRACA(-2), foco: -5.7, remover: ['arvore3', 'arvore4'],
  elementos: [ARVORE(), BIA_ESCONDIDA(), ...GRUPO(),
    sp('s1', 0.6, -7.8), sp('s2', 2.1, -8.0), sp('s3', 3.6, -7.8, { s: { tamanho: 2.2 } })],
  acoes: [a(0.5, 'emocao', { alvo: 'bia', icone: '!' }), a(0.5, 'som', { som: 'surpresa' }), a(0.7, 'emocao', { alvo: 'prof', icone: 'coracao' })],
}));
C.push(cena('As sombras não mostravam o caminho. Elas levavam.', {
  cenario: 'praca', camera: PRACA(-2), foco: 1.6, remover: ['arvore3', 'arvore4'],
  elementos: [ARVORE(), BIA_ESCONDIDA(), ...GRUPO()],
  acoes: [
    // a escuridão nasce no meio do grupo, cobre o chão e sobe pelas pessoas (raio pequeno: não chega na árvore da Bia)
    a(0.05, 'sombra', { origem: [2.1, -8.4], raio: 3.0, durF: 0.75 }),
    a(0.5, 'desaparecer', { alvo: 'tonho', durF: 0.25 }), a(0.58, 'desaparecer', { alvo: 'prof', durF: 0.25 }), a(0.66, 'desaparecer', { alvo: 'aluno', durF: 0.25 }),
    a(0.55, 'tremer', { intensidade: 0.4, durF: 0.2 }), a(0.6, 'emocao', { alvo: 'bia', icone: '!' })],
}));
C.push(cena('Na segunda, a praça amanheceu cheia de sombras. Sem ninguém em cima.', {
  cenario: 'praca', camera: PRACA(-2), foco: -2, remover: ['arvore3', 'arvore4'],
  elementos: [ARVORE(), BIA_ESCONDIDA(), sp('s1', -2.4, -7.6), sp('s2', 0, -6.8, { s: { tamanho: 2.2 } }), sp('s3', 1.6, -7.4, { s: { tamanho: 3, olhos: true } }), sp('s4', 3.4, -6.6, { s: { tamanho: 2.4 } })],
  acoes: [a(0.75, 'flash', { intensidade: 0.4 }), a(0.75, 'som', { som: 'suspense' }), a(0.8, 'emocao', { alvo: 'bia', icone: '...' })],
}));
C.push(cena('E a sombra da Bia, colada nos pés dela, ainda tremia.', {
  cenario: 'praca', camera: { x: -5.4, z: -11.3, zoom: 2 }, foco: -5.4, remover: ['arvore3', 'arvore4'],
  elementos: [ARVORE(), BIA_ESCONDIDA(), sp('sb', -5.4, -10.1, { s: { tamanho: 2.2 } }), sp('s1', -2, -7.6)],
  acoes: [a(0.5, 'tremer', { intensidade: 0.3, durF: 0.4 }), a(0.55, 'emocao', { alvo: 'bia', icone: '...' })],
}));

// Continuidade (npm run conferir): cenas do mesmo "momento" da história têm o mesmo elenco; "saiDeCena" = saiu pela história
marcar(C, { 'domingo-rua': [[6, 8]], 'domingo-praca': [[9, 10]], segunda: [[11, 12]] }); C[5].saiDeCena = ['tonho', 'prof', 'policial']; C[6].saiDeCena = ['aluno'];

// Expressões no rosto (PROTÓTIPO motor/expressoes.js): [cena, quem, rosto, início (fração da fala)]
rostos(C, [[1, "tonho", "feliz"], [2, "prof", "feliz"], [2, "aluno", "feliz"], [3, "bia", "triste", 0.4], [4, "bia", "envergonhado", 0.5], [7, "bia", "assustado", 0.3], [9, "bia", "assustado", 0.5], [9, "tonho", "feliz"], [9, "prof", "feliz"], [9, "aluno", "feliz"], [10, "bia", "assustado"], [10, "tonho", "feliz"], [10, "prof", "feliz"], [10, "aluno", "feliz"], [12, "bia", "assustado", 0.3]]);

salvar('nesse-mundo-sombras', ['NESSE MUNDO (curto, sombrio) — "Nessa cidade, a sua sombra chega um minuto antes de você."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-sombras',
  'Usa o protótipo sombraPessoa (sombras sem dono). "vertical" = enquadramento do Shorts.'], R);
