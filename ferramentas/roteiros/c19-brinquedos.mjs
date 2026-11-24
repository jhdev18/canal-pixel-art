import { alturaShorts, marcar, P, RUA, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, TERROR de dia — "Nessa cidade, seu brinquedo cresce toda vez que você brinca."
// Feito para retenção (táticas do vídeo das sombras): a regra é algo que toda criança tem (o brinquedo favorito) e fala com "você";
// o elemento da regra SE MEXE e CRESCE na tela (ação nova "crescer") desde 0,3 s; aparece em todas as cenas; escalada (cresce → passa a
// professora → dão corda sozinhos → pega-pega → as crianças somem → a praça só com brinquedos); a diferença da Bia se vê sem som (o
// soldadinho dela é pequeno); a crença é ação ("de mãos dadas"); detalhe feliz que fica sinistro ("corriam rindo"); a Bia ESCOLHE
// ("disse não", único balão); a virada inverte a crença; a última imagem é o brinquedo dela, ainda dando corda sozinho. Tudo de dia.
// Assets: brinquedos de corda (motor/assets/animatronicos.js, protótipo), praca-parquinho, escola-patio, rua-comercial.
const R = base('Nessa cidade, seu brinquedo cresce toda vez que você brinca');   // sem música de fundo (pedido do usuário)
const C = R.cenas;
// (v3) sem balanço/escorregador atrás do grupo: o brinquedo na frente do balanço parecia bugado (pedido do usuário)
const SEM_PARQUINHO = ['arvore3', 'arvore4', 'balanco', 'escorregador'];
const PATIO = (x, y = 2.6) => ({ x, z: 2.2, y });
const PERTO = (x, y = 1.8, z = 2.2) => ({ x, z, y, zoom: 2 });
// versão pequena de verdade ("<sprite>@mini": redesenhado na metade, sem pular pixels — a escala 0.5 deixava o desenho bugado)
const MINI = (id, sp, x, z, extra = {}) => ({ id, sprite: sp + '@mini', x, z, ...extra });
// "crescer" sem bug: o pequeno some e o grande aparece no mesmo lugar, no mesmo instante (o aparecer já dá o pulo de tamanho)
const CRESCE = (f, mini, grande) => [a(f, 'sumir', { alvo: mini, som: null }), a(f, 'aparecer', { alvo: grande, som: 'corda' }), a(f, 'magia', { alvo: grande })];

// 1. Gancho: o Léo anda com o robô; aos 0,3 s ele pula (brinca) e o robô CRESCE na hora (corda + faíscas)
C.push(cena('Nessa cidade, seu brinquedo cresce toda vez que você brinca.', {
  titulo: 'NÃO BRINQUE COM ELES', tituloInicio: 0, tituloDuracao: 2.6,   // título no quadro 0 da cena 1 (regra do gancho)
  cenario: 'rua-comercial', transicao: 'corte', camera: RUA(3.6), foco: ['leo', 'robo'],
  elementos: [P('leo', 'menino-topete', 2.2, 5.0), MINI('robo-mini', 'brinquedo-robo', 0.6, 4.4, { figurante: true }), P('robo', 'brinquedo-robo', 0.6, 4.4, { oculto: true })],   // ao lado do Léo, não atrás (cobria)
  acoes: [a(0, 'andar', { alvo: 'leo', para: 5.0, durF: 0.95 }), a(0, 'andar', { alvo: 'robo-mini', para: 3.4, durF: 0.95 }), a(0, 'andar', { alvo: 'robo', para: 3.4, durF: 0.95, som: null }),
    a(0.12, 'pular', { alvo: 'leo', altura: 0.45, durF: 0.12 }), ...CRESCE(0.16, 'robo-mini', 'robo')],
}));
// 2. Crença como AÇÃO: toda criança vai para a escola de mãos dadas com o brinquedo (cortejo na calçada da escola)
C.push(cena('Por isso, toda criança anda de mãos dadas com o seu.', {
  cenario: 'rua-comercial', camera: RUA(3.0),
  elementos: [P('nina', 'rival', -0.8, 5.0), MINI('boneca', 'brinquedo-boneca', -2.1, 4.4),
    P('aluno', 'aluno', 1.4, 5.0), MINI('caixa', 'brinquedo-caixa', 0.1, 4.4)],
  acoes: [a(0, 'andar', { alvo: 'nina', para: 2.0, durF: 0.95 }), a(0, 'andar', { alvo: 'boneca', para: 0.7, durF: 0.95 }),
    a(0, 'andar', { alvo: 'aluno', para: 4.2, durF: 0.95 }), a(0, 'andar', { alvo: 'caixa', para: 2.9, durF: 0.95 })],
}));
// 3. Escalada: a Nina brinca e a boneca dela cresce até passar da professora (corte de zoom na hora)
C.push(cena('A boneca da Nina já passou da altura da professora.', {
  cenario: 'escola-patio', camera: PATIO(0.4), foco: ['nina', 'prof'],
  elementos: [P('nina', 'rival', -1.2, 3.4), MINI('boneca-mini', 'brinquedo-boneca', -0.2, 2.8, { figurante: true }), P('boneca', 'brinquedo-boneca', -0.2, 2.8, { oculto: true }), P('prof', 'professora', 1.6, 3.2)],
  acoes: [a(0.05, 'pular', { alvo: 'nina', altura: 0.4, durF: 0.15 }), ...CRESCE(0.3, 'boneca-mini', 'boneca'),
    a(0.55, 'corte', { zoom: 2, y: 1.8 }), a(0.6, 'emocao', { alvo: 'prof', icone: '!' })],
}));
// 4. A diferença da Bia (sem som): o soldadinho dela é PEQUENO, andando colado no pé dela; o robô gigante passa atrás
C.push(cena('Só o soldadinho da Bia é pequeno. Ela quase não brinca.', {
  cenario: 'escola-patio', camera: PATIO(0.2), foco: ['bia', 'sold'],
  elementos: [P('bia', 'menina-capa', -2.0, 3.2), MINI('sold', 'brinquedo-soldadinho', -1.4, 2.6),
    P('leo', 'menino-topete', 4.8, 4.6), P('robo', 'brinquedo-robo', 5.6, 4.2)],
  acoes: [a(0, 'andar', { alvo: 'bia', para: 0.2, durF: 0.6 }), a(0, 'andar', { alvo: 'sold', para: 0.8, durF: 0.6 }),
    a(0.05, 'andar', { alvo: 'leo', para: 1.8, durF: 0.9 }), a(0.05, 'andar', { alvo: 'robo', para: 2.6, durF: 0.9 })],
}));
// 5. O sofrimento dura 1 cena: no recreio, a turma (com os brinquedos gigantes) ri do brinquedo de bebê dela
C.push(cena('No recreio, a turma ri do brinquedo de bebê.', {
  cenario: 'escola-patio', camera: PATIO(0.6), foco: ['bia', 'aluno', 'leo'],   // a turma rindo em volta da Bia (o Léo ficava fora do Shorts)
  elementos: [P('bia', 'menina-capa', 0.2, 3.2), MINI('sold', 'brinquedo-soldadinho', 0.8, 2.6),
    P('nina', 'rival', -2.2, 3.0), P('boneca', 'brinquedo-boneca', -3.0, 3.8), P('aluno', 'aluno', 2.6, 3.0), P('caixa', 'brinquedo-caixa', 4.4, 3.8),
    P('leo', 'menino-topete', 3.6, 2.4), P('robo', 'brinquedo-robo', 5.4, 3.2)],
  acoes: [a(0.05, 'pular', { alvo: 'aluno', altura: 0.35, durF: 0.15 }), a(0.15, 'trocar', { alvo: 'caixa', estado: 'cantando' }), a(0.2, 'pular', { alvo: 'nina', altura: 0.35, durF: 0.15 }),
    a(0.3, 'trocar', { alvo: 'boneca', estado: 'acenar' }), a(0.45, 'trocar', { alvo: 'robo', estado: 'acenar' }), a(0.6, 'emocao', { alvo: 'bia', icone: '...' })],
}));

// 6–15: o mesmo sábado na praça do parquinho (posições fixas; os brinquedos atrás das crianças, na faixa de trás)
const ZK = -8.6, ZT = -7.4, ZS = -8.0;   // crianças, brinquedos grandes, soldadinho da Bia (atrás e 1,5 à direita dela: na mesma linha da tela ele sumia atrás da Bia)
// 6. O evento cedo (~33%): os brinquedos "desligados" dão corda sozinhos, um por um
C.push(cena('Até que, num sábado, os brinquedos deram corda sozinhos.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(-2.4), foco: ['robo', 'caixa'],
  elementos: [P('leo', 'menino-topete', -3.0, ZK), P('robo', 'brinquedo-robo', -8.4, ZT, { pose: 'desligado' }),
    P('nina', 'rival', -0.6, ZK), P('boneca', 'brinquedo-boneca', -6.8, ZT, { pose: 'desligado' }),
    P('aluno', 'aluno', 1.8, ZK), P('caixa', 'brinquedo-caixa', -5.2, ZT, { pose: 'fechada' }),
    P('bia', 'menina-capa', 4.4, ZK), MINI('sold', 'brinquedo-soldadinho', 5.9, ZS)],
  acoes: [a(0.02, 'pular', { alvo: 'leo', altura: 0.4, durF: 0.12 }), a(0.12, 'pular', { alvo: 'aluno', altura: 0.35, durF: 0.12 }), a(0.85, 'pular', { alvo: 'nina', altura: 0.3, durF: 0.12 }),
    a(0.25, 'trocar', { alvo: 'robo', estado: 'parado', som: 'corda' }), a(0.4, 'trocar', { alvo: 'boneca', estado: 'parado', som: 'corda' }),
    a(0.55, 'trocar', { alvo: 'caixa', estado: 'parado', som: 'caixinha-musica' }),
    a(0.75, 'emocao', { alvo: 'bia', icone: '?' })],
}));
const ELENCO = (pos = {}, poses = {}) => [
  ['leo', 'menino-topete', -3.0, ZK], ['robo', 'brinquedo-robo', -8.4, ZT], ['nina', 'rival', -0.6, ZK], ['boneca', 'brinquedo-boneca', -6.8, ZT],
  ['aluno', 'aluno', 1.8, ZK], ['caixa', 'brinquedo-caixa', -5.2, ZT], ['bia', 'menina-capa', 4.4, ZK], ['sold', 'brinquedo-soldadinho', 5.9, ZS],
].filter(([id]) => pos[id] !== null).map(([id, sp, x, z]) => (id === 'sold' ? MINI : P)(id, sp, pos[id] ?? x, z, { ...(poses[id] ? { pose: poses[id] } : {}) }));
// depois de pegas, as crianças pequenas ficam NA MÃO do próprio brinquedo (como uma boneca), com o rosto assustado
const DONO = { leo: ['menino-topete', 'robo'], aluno: ['aluno', 'caixa'], nina: ['rival', 'boneca'] };
const NA_MAO = (ids) => ids.map((id) => MINI(id + '-p', DONO[id][0], 0, 0, { sobre: { id: DONO[id][1], dx: 1.05, dy: 0.65 }, pose: 'rosto-assustado' }));
// a criança pega: some e a versão pequena aparece no mesmo lugar (encolheu)
const ENCOLHE = (f, id) => [a(f, 'sumir', { alvo: id, som: null }), a(f, 'aparecer', { alvo: id + '-p', som: 'corda' }), a(f, 'magia', { alvo: id + '-p' })];
const PEQUENO = (id, x) => MINI(id + '-p', DONO[id][0], x, ZK, { oculto: true, pose: 'rosto-assustado' });
// 7. Pico de movimento no MEIO: os brinquedos vêm andando até as crianças; elas pulam de alegria (cada um vai até o seu dono)
//    (v2, pedido do usuário: o pega-pega com as crianças indo e voltando ficou esquisito — agora o movimento é num sentido só)
C.push(cena('E chamaram as crianças para brincar.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(-1.6), foco: ['leo', 'nina'],
  elementos: [...ELENCO()],
  acoes: [a(0.02, 'andar', { alvo: 'robo', para: -3.0, durF: 0.95 }), a(0.02, 'andar', { alvo: 'boneca', para: -0.6, durF: 0.95 }), a(0.02, 'andar', { alvo: 'caixa', para: 1.8, durF: 0.95 }),
    a(0.3, 'pular', { alvo: 'leo', altura: 0.4, durF: 0.12 }), a(0.4, 'pular', { alvo: 'nina', altura: 0.4, durF: 0.12 }), a(0.5, 'pular', { alvo: 'aluno', altura: 0.35, durF: 0.12 }),
    a(0.7, 'pular', { alvo: 'leo', altura: 0.4, durF: 0.12 }), a(0.8, 'pular', { alvo: 'aluno', altura: 0.35, durF: 0.12 })],
}));
// 8. Detalhe feliz que fica sinistro: as crianças riem; o brinquedo abre os braços ("abraço") e o Léo e o aluno ENCOLHEM até o tamanho de um brinquedo
C.push(cena('As crianças riam tanto que nem sentiram o abraço.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(-1.6), foco: ['leo', 'aluno'],
  elementos: [...ELENCO({ robo: -3.0, boneca: -0.6, caixa: 1.8 }), PEQUENO('leo', -3.0), PEQUENO('aluno', 1.8)],
  acoes: [a(0.2, 'trocar', { alvo: 'robo', estado: 'acenar', som: 'servo' }), a(0.3, 'trocar', { alvo: 'caixa', estado: 'acenar', som: 'servo' }),
    ...ENCOLHE(0.5, 'leo'), ...ENCOLHE(0.68, 'aluno'),
    a(0.85, 'emocao', { alvo: 'nina', icone: '?' })],
  saiDeCena: ['leo', 'aluno', 'leo-p', 'aluno-p'],   // saem do chão: daqui em diante ficam pequenos, na mão do brinquedo ("sobre")
}));
// 9. O soldadinho puxa a Bia para longe; ao fundo, a Nina some do lado da boneca (a escalada continua)
C.push(cena('O soldadinho da Bia puxou a mão dela para longe. Com força.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(2.4), foco: ['bia', 'sold'],
  elementos: [...ELENCO({ leo: null, aluno: null, robo: -3.0, boneca: -0.6, caixa: 1.8 }), ...NA_MAO(['leo', 'aluno']), PEQUENO('nina', -0.6)],
  acoes: [a(0.1, 'andar', { alvo: 'sold', para: 8.1, durF: 0.8 }), a(0.12, 'andar', { alvo: 'bia', para: 6.6, durF: 0.8 }),
    ...ENCOLHE(0.45, 'nina'), a(0.5, 'tremer', { intensidade: 0.25, durF: 0.12 })],
  saiDeCena: ['nina', 'nina-p'],
}));
const DEPOIS = (poses = {}, pos = {}) => [...ELENCO({ leo: null, aluno: null, nina: null, robo: -3.0, boneca: -0.6, caixa: 1.8, bia: 6.6, sold: 8.1, ...pos }, poses), ...NA_MAO(['leo', 'aluno', 'nina'])];
// 10. A caixa-surpresa vem aos pulinhos até a Bia e chama para brincar
C.push(cena('A caixa-surpresa chegou e chamou a Bia para brincar.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(4.2), foco: ['bia', 'caixa'],
  elementos: DEPOIS(),
  acoes: [a(0.05, 'andar', { alvo: 'caixa', para: 5.6, durF: 0.75 }), a(0.85, 'trocar', { alvo: 'caixa', estado: 'acenar', som: 'caixinha-musica' })],
}));
// 11. A ESCOLHA da Bia (único balão): "NÃO." — a caixa entorta a cabeça e volta para trás
C.push(cena('E a Bia, pela primeira vez, disse não.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(4.2), foco: ['bia', 'caixa'],
  elementos: DEPOIS({}, { caixa: 5.6 }),
  acoes: [a(0.25, 'falar', { alvo: 'bia', texto: 'NÃO.' }), a(0.55, 'trocar', { alvo: 'caixa', estado: 'virado', som: 'servo' }),
    a(0.65, 'andar', { alvo: 'caixa', para: 3.4, durF: 0.33 })],
}));
// 12. Reação antes da virada: a praça só com brinquedos parados onde estavam as crianças; a Bia congela
C.push(cena('Os brinquedos pararam. Cada um carregava a sua criança.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(1.6), foco: ['bia', 'boneca'],
  elementos: DEPOIS({}, { caixa: 3.4 }),
  acoes: [a(0.3, 'trocar', { alvo: 'robo', estado: 'olhos' }), a(0.35, 'trocar', { alvo: 'boneca', estado: 'olhos' }), a(0.4, 'trocar', { alvo: 'caixa', estado: 'olhos' }),
    a(0.4, 'flash', { intensidade: 0.4 }), a(0.4, 'som', { som: 'revelar' }), a(0.6, 'emocao', { alvo: 'bia', icone: '!' })],
}));
// 13–14. Virada em 2 frases curtíssimas, com a crença ao contrário: corte de zoom nos brinquedos; os rostos caem
C.push(cena('Não era você que brincava com o brinquedo.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(1.6), foco: ['boneca', 'caixa'],
  elementos: DEPOIS({ robo: 'olhos', boneca: 'olhos', caixa: 'olhos' }, { caixa: 3.4 }),
  acoes: [a(0.2, 'corte', { zoom: 2, x: 0.6, y: 1.2 }), a(0.3, 'trocar', { alvo: 'boneca', estado: 'virado', som: 'servo' }), a(0.6, 'trocar', { alvo: 'robo', estado: 'virado', som: 'servo' })],
}));
C.push(cena('Era ele que brincava com você.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PRACA(1.6), foco: ['boneca', 'caixa'],
  elementos: DEPOIS({ robo: 'virado', boneca: 'virado', caixa: 'olhos' }, { caixa: 3.4 }),
  acoes: [a(0.2, 'trocar', { alvo: 'boneca', estado: 'sem-rosto' }), a(0.2, 'trocar', { alvo: 'robo', estado: 'sem-rosto' }), a(0.2, 'trocar', { alvo: 'caixa', estado: 'sem-rosto' }),
    a(0.2, 'flash', { intensidade: 0.6 }), a(0.2, 'som', { som: 'falha-eletrica' }), a(0.22, 'tremer', { intensidade: 0.35, durF: 0.2 })],
}));
// 15. Última imagem com a regra viva: o soldadinho pequeno, colado no pé da Bia, dá corda sozinho
C.push(cena('E o soldadinho da Bia, colado no pé dela, ainda dava corda sozinho.', {
  cenario: 'praca-parquinho', remover: SEM_PARQUINHO, camera: PERTO(6.2, 1.2, -9.0), foco: ['bia', 'sold'],
  elementos: DEPOIS({ robo: 'sem-rosto', boneca: 'sem-rosto', caixa: 'sem-rosto' }, { caixa: 3.4 }),
  acoes: [a(0.45, 'trocar', { alvo: 'sold', estado: 'cantando', som: 'corda' }), a(0.75, 'tremer', { intensidade: 0.2, durF: 0.2 })],
}));

marcar(C, { sabado: [[6, 15]] });
rostos(C, [[1, 'leo', 'feliz', 0.4], [2, 'nina', 'feliz', 0.96], [3, 'nina', 'rindo', 0.35], [3, 'prof', 'surpreso', 0.6], [4, 'bia', 'pensativo', 0.7],
  [5, 'nina', 'rindo', 0.4], [5, 'aluno', 'rindo', 0.45], [5, 'leo', 'rindo', 0.5], [5, 'bia', 'envergonhado', 0.55],
  [6, 'leo', 'surpreso', 0.3], [6, 'nina', 'feliz', 0.45], [6, 'aluno', 'feliz', 0.6], [8, 'leo', 'rindo', 0.02, 0.45], [8, 'aluno', 'rindo', 0.02, 0.62], [8, 'nina', 'rindo', 0.02, 0.8], [9, 'bia', 'assustado', 0.95],
  [10, 'bia', 'assustado'], [11, 'bia', 'bravo', 0.2], [12, 'bia', 'assustado', 0.45], [13, 'bia', 'assustado'], [14, 'bia', 'assustado'], [15, 'bia', 'assustado', 0.5]]);

// Shorts: a legenda grande (76% da altura) fica abaixo dos pés (medido com medir-altura-shorts.mjs)
alturaShorts(C, { 2: -0.25, 3: -1.5, 4: -1, 5: -2.5, 6: -2, 7: -2.75, 8: -2.75, 9: -2.25, 10: -1.75, 11: -1, 12: -1.75, 13: -1.5, 14: -1.75, 15: -1.25 });

salvar('nesse-mundo-brinquedos', ['NESSE MUNDO (curto, terror de dia): "Nessa cidade, seu brinquedo cresce toda vez que você brinca."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-brinquedos',
  'Protótipos: brinquedos de corda (animatronicos.js), ação crescer, praca-parquinho, escola-patio, rival (Nina), menino-topete (Léo).'], R);
