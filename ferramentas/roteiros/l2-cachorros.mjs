import { turma, marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos } from './nm.mjs';
const R = base('Nessa cidade, todo cachorro fala o que o dono pensa');
const C = R.cenas;
// cão de cada dono (protótipos de motor/assets/leva3.js); o Bolota, da delegacia, é o cao-guarda (de uniforme)
const RACA = { bolota: 'cao-guarda', ccaixa: 'cachorro-caramelo', cprof: 'cachorro-branco', cpref: 'cachorro-chique', ctonho: 'cachorro-preto',
  ccand: 'cachorro-cinza', caluna: 'cachorro-cinza', vira: 'vira-lata', c1: 'cachorro-caramelo', c2: 'cachorro-cinza', c4: 'cachorro-cinza' };
// figurantes (cães sem dono na história, só no fundo): podem repetir sprite; o npm run conferir não cobra
const FIG = new Set(['c1', 'c2', 'c4', 'caluna']);
const D = (id, x, z, extra = {}) => P(id, RACA[id] || 'cachorro-caramelo', x, z, { ...(FIG.has(id) ? { figurante: true } : {}), ...extra });
const PD = 'praca-decorada';
const palanque = () => [P('prefeito', 'prefeito', 5, -6.7, { y: 0.75, virado: 'esquerda' }), D('cpref', 6.4, -6.7, { y: 0.75, virado: 'esquerda' })];
const plateia = () => [P('tonho', 'padeiro', -3.6, -8.4), D('ctonho', -2.4, -8.2), P('prof', 'professora', -0.6, -8.6), D('cprof', 0.6, -8.4), P('caixa', 'caixa', 2.4, -8.6)];

// 1. Regra + mundo
C.push(cena('Nessa cidade, todo cachorro fala em voz alta o que o dono está pensando.', {
  cenario: 'rua-comercial', transicao: 'fade', camera: RUA(16.2), foco: 16.2,
  elementos: [P('caixa', 'caixa', 15.6, 5.4), D('ccaixa', 19.4, 5.4, { virado: 'esquerda' })],
  // gancho: o cachorro já entra correndo e latindo no 1º segundo (vídeo que abre parado perde 2/3 do público)
  acoes: [a(0, 'correr', { alvo: 'ccaixa', para: 17, durF: 0.18 }), a(0.2, 'falar', { alvo: 'ccaixa', texto: '* Que fome de pastel.' }), a(0.7, 'emocao', { alvo: 'caixa', icone: '!' })],
}));
C.push(cena('Funciona assim: o dono pensa, e o cachorro late a frase inteira.', {
  cenario: 'rua-comercial', camera: RUA(4.6), foco: 4.6,
  titulo: 'NESSA CIDADE, O CACHORRO FALA O QUE VOCÊ PENSA', tituloInicio: 0.2, tituloDuracao: 2.6,
  elementos: [P('prof', 'professora', 4, 5.4), D('cprof', 5.4, 5.4, { virado: 'esquerda' })],
  acoes: [a(0.45, 'falar', { alvo: 'cprof', texto: '* Que preguiça de segunda.' }), a(0.85, 'emocao', { alvo: 'prof', icone: '...' })],
}));
C.push(cena('Por isso, ninguém leva cachorro em entrevista de emprego.', {
  cenario: 'rua-comercial', camera: RUA(16.2), foco: 16.2,
  elementos: [P('caixa', 'caixa', 17, 5.4, { virado: 'esquerda' }), P('cand', 'policial-oculos', 15.9, 5.2), D('ccand', 14.9, 5.2)],
  acoes: [a(0.35, 'falar', { alvo: 'ccand', texto: '* Ele mentiu no currículo.' }), a(0.85, 'emocao', { alvo: 'caixa', icone: '!' })],
}));
C.push(cena('E primeiro encontro é sempre sem cachorro, por segurança.', {
  // encontro EM PÉ, um de frente para o outro (o sentar no banco ficou estranho): o cão chega e entrega
  cenario: 'praca', camera: { x: -1, z: -9.6, zoom: 2 }, foco: -1,
  elementos: [P('caixa', 'caixa', -1.9, -8.6, { virado: 'direita' }), P('tonho', 'padeiro', -0.5, -8.6, { virado: 'esquerda' }), D('ctonho', 2.6, -8.8, { virado: 'esquerda' })],
  acoes: [a(0.05, 'emocao', { alvo: 'caixa', icone: 'coracao' }), a(0.1, 'andar', { alvo: 'ctonho', para: 0.8, durF: 0.3 }), a(0.45, 'falar', { alvo: 'ctonho', texto: '* Ela tem chulé.' }), a(0.85, 'emocao', { alvo: 'caixa', icone: '!' })],
}));
C.push(cena('O Bolota, cachorro da delegacia, há quinze anos só fala uma frase.', {
  cenario: 'rua-comercial', camera: RUA(10.4), foco: 10.4,
  elementos: [P('policial', 'policial', 10, 5.4), D('bolota', 11.2, 5.4, { virado: 'esquerda' })],
  acoes: [a(0.7, 'emocao', { alvo: 'bolota', icone: '...' })],
}));
C.push(cena('Hora do lanche. E o policial jura que nunca pensa nisso.', {
  cenario: 'rua-comercial', camera: { x: 10.6, z: 3.4, y: 1.5, zoom: 2 }, foco: 10.6,
  elementos: [P('policial', 'policial', 10, 5.4), D('bolota', 11.2, 5.4, { virado: 'esquerda' })],
  acoes: [a(0, 'falar', { alvo: 'bolota', texto: '* Hora do lanche.' }), a(0.5, 'falar', { alvo: 'policial', texto: '* Não penso!' })],
}));
// 2. Protagonista
C.push(cena('E tinha o Caio, de dez anos, o único menino da cidade sem cachorro.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0, seguir: 'caio',
  elementos: [P('caio', 'aluno', -3, 0.6), P('aluna', 'aluna', 3, 4.4, { virado: 'esquerda' }), D('caluna', 1.8, 4.4, { virado: 'esquerda' })],
  acoes: [a(0.05, 'andar', { alvo: 'caio', para: 1, durF: 0.7 }), a(0.8, 'emocao', { alvo: 'caio', icone: '...' })],
}));
C.push(cena('Ele tem mania de conversar com os cachorros dos outros, como se fossem gente.', {
  cenario: 'praca', camera: PRACA(0), foco: 0,
  elementos: [P('caio', 'aluno', -0.6, -8.6), D('cprof', 0.8, -8.4, { virado: 'esquerda' }), P('prof', 'professora', 2.2, -8.6, { virado: 'esquerda' })],
  acoes: [a(0.3, 'falar', { alvo: 'caio', texto: '* Como foi seu dia?' }), a(0.85, 'emocao', { alvo: 'prof', icone: '?' })],
}));
C.push(cena('Todo mundo ri dele. Cachorro não tem opinião, só repete o dono.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: -1.6,
  elementos: turma([P('caio', 'aluno', -1.6, 0.75, { pose: 'sentado-lado' }), P('aluna', 'aluna', -4.6, 0.75, { pose: 'sentado-lado' }), P('bia', 'menina-capa', 1.4, 2.45, { pose: 'sentado-lado' })]),
  acoes: [a(0.05, 'falar', { alvo: 'aluna', texto: '* Esquisito!' }), a(0.6, 'emocao', { alvo: 'caio', icone: '...' })],
}));
C.push(cena('E os cachorros sempre respondem para ele coisas que ninguém entende.', {
  cenario: 'praca', camera: PRACA(0), foco: 0,
  elementos: [P('caio', 'aluno', -0.6, -8.6), D('cprof', 0.8, -8.4, { virado: 'esquerda' }), P('prof', 'professora', 2.2, -8.6, { virado: 'esquerda' })],
  acoes: [a(0.25, 'falar', { alvo: 'cprof', texto: '* Odeio o carteiro.' }), a(0.8, 'emocao', { alvo: 'prof', icone: '?' })],
}));
C.push(cena('Ele também imita latido tão bem que até os cachorros se confundem.', {
  cenario: 'rua-comercial', camera: FRENTE(0), foco: 0,
  elementos: [P('caio', 'aluno', -0.6, 0.6), D('c1', 1, 0.6, { virado: 'esquerda' }), D('c2', 2.4, 0.6, { virado: 'esquerda' })],
  acoes: [a(0.3, 'falar', { alvo: 'caio', texto: '* Au! Au!' }), a(0.75, 'emocao', { alvo: 'c1', icone: '?' }), a(0.8, 'emocao', { alvo: 'c2', icone: '?' })],
}));
// ---- O DEBATE NA PRAÇA (cenas 12–30): o público fica o tempo todo nas MESMAS posições (continuidade);
// cada cena só muda a câmera e as ações. Quem se move (policial, Caio, vira-lata) fica na posição nova depois.
const POSD = {
  policial: [-6.2, -7.9, 'policial'],   // um pouco atrás do Bolota: no passo da cena 20 ele não passa por dentro do cão bolota: [-5.0, -8.6, 'cao'], c4: [-4.0, -7.6, 'cao'],
  tonho: [-3.4, -8.4, 'padeiro'], ctonho: [-2.3, -8.2, 'cao'], prof: [-1.0, -8.6, 'professora'], cprof: [0.1, -8.4, 'cao'],
  caixa: [1.4, -8.6, 'caixa'], ccaixa: [2.5, -8.4, 'cao', 'esquerda'],   // o cão da moça do caixa (o mesmo da cena 1)
};
function DEBATE({ mover = {}, extras = [] } = {}) {
  const el = Object.entries(POSD).map(([id, [x, z, q, v]]) => {
    const m = mover[id] || {}, op = { ...(v ? { virado: v } : {}), ...m.op };
    return q === 'cao' ? D(id, m.x ?? x, m.z ?? z, op) : P(id, q, m.x ?? x, m.z ?? z, op);
  });
  return [...el, ...palanque(), ...extras];
}
const CAIO = (x = -0.4, z = -9.6, op = {}) => P('caio', 'aluno', x, z, op);
const VIRA = (x = -1.6, z = -9.5, op = {}) => D('vira', x, z, op);
const DEPOIS20 = { policial: { x: -5.6 } };            // o policial deu um passo para levar os cães (cena 20)
const NO_PALANQUE = (op = {}) => CAIO(3.7, -6.7, { y: 0.75, ...op });

// 3. Evento
C.push(cena('Até que chegou o grande debate da eleição para prefeito, na praça.', {
  cenario: PD, camera: PRACA(1), foco: 4,
  elementos: DEBATE(),
  acoes: [a(0.6, 'emocao', { alvo: 'tonho', icone: 'coracao' }), a(0.7, 'emocao', { alvo: 'caixa', icone: 'coracao' })],
}));
C.push(cena('E, no meio do discurso, o cachorro do prefeito latiu: quero ir para casa dormir.', {
  cenario: PD, camera: { x: 5.7, z: -7.8, zoom: 2 }, foco: 5.7,
  elementos: DEBATE(),
  acoes: [a(0, 'falar', { alvo: 'prefeito', texto: '* Caros eleitores...' }), a(0.45, 'falar', { alvo: 'cpref', texto: '* Quero ir pra casa dormir.' })],
}));
// 4. Escalada
C.push(cena('A praça inteira olhou para o prefeito.', {
  cenario: PD, camera: PRACA(0), foco: 0,
  elementos: DEBATE(),
  acoes: [...['tonho', 'prof', 'caixa', 'policial'].map((id, i) => a(0.1 + i * 0.08, 'emocao', { alvo: id, icone: '!' })), a(0.4, 'tremer', { intensidade: 0.3, durF: 0.2 })],
}));
C.push(cena('Primeiro, o cachorro do seu Tonho contou que o pão de hoje era de anteontem.', {
  cenario: PD, camera: PRACA(-3), foco: -3,
  elementos: DEBATE(),
  acoes: [a(0.3, 'falar', { alvo: 'ctonho', texto: '* Esse pão é de anteontem.' }), a(0.85, 'emocao', { alvo: 'tonho', icone: '!' })],
}));
C.push(cena('Depois, cinco cachorros falaram de uma vez. Em um minuto, doze segredos estavam no meio da praça.', {
  cenario: PD, camera: PRACA(-1), foco: -1,
  elementos: DEBATE(),
  acoes: [a(0.05, 'falar', { alvo: 'c4', texto: '* Ronca!' }), a(0.2, 'falar', { alvo: 'cprof', texto: '* Pinta o cabelo!' }),
    a(0.4, 'falar', { alvo: 'ccaixa', texto: '* Deve o aluguel!' }), a(0.55, 'tremer', { intensidade: 0.4, durF: 0.2 }),
    a(0.6, 'emocao', { alvo: 'caixa', icone: '!' }), a(0.7, 'falar', { alvo: 'ctonho', texto: '* Usa peruca!' })],
}));
C.push(cena('O cachorro da professora latiu que ela odiava a escola. E ela chorou na frente de todo mundo.', {
  cenario: PD, camera: { x: -0.5, z: -9.6, zoom: 2 }, foco: -0.5,
  elementos: DEBATE(),
  acoes: [a(0.1, 'falar', { alvo: 'cprof', texto: '* Odeio a escola!' }), a(0.7, 'emocao', { alvo: 'prof', icone: 'gota' })],
}));
C.push(cena('E o Bolota, no meio da confusão, lembrou a todos: hora do lanche.', {
  cenario: PD, camera: PRACA(-4), foco: -5,
  elementos: DEBATE(),
  acoes: [a(0.6, 'falar', { alvo: 'bolota', texto: '* Hora do lanche.' })],
}));
// 5. Aperto
C.push(cena('O prefeito ficou vermelho de vergonha e decretou: todo cachorro vai para a delegacia.', {
  cenario: PD, camera: PRACA(4), foco: 5,
  elementos: DEBATE(),
  acoes: [a(0.1, 'piscar', { alvo: 'prefeito', durF: 0.3 }), a(0.5, 'falar', { alvo: 'prefeito', texto: '* Prendam os cães!' }), a(0.55, 'tremer', { intensidade: 0.4, durF: 0.2 })],
}));
C.push(cena('O policial começou a levar os cachorros, um por um.', {
  cenario: PD, camera: PRACA(-3.5), foco: -4.5,
  elementos: DEBATE(),
  acoes: [a(0.05, 'andar', { alvo: 'policial', para: -5.6, durF: 0.3 }), a(0.4, 'falar', { alvo: 'policial', texto: '* Todos comigo!' }),
    a(0.7, 'emocao', { alvo: 'c4', icone: '...' }), a(0.75, 'emocao', { alvo: 'ctonho', icone: '...' }), a(0.8, 'emocao', { alvo: 'bolota', icone: '...' })],
}));
C.push(cena('O Caio tentou explicar, mas ninguém escuta um menino sem cachorro.', {
  cenario: PD, camera: PRACA(0), foco: 0,
  elementos: DEBATE({ mover: DEPOIS20, extras: [CAIO(-0.4, -9.6, { oculto: false })] }),
  acoes: [a(0.05, 'falar', { alvo: 'caio', texto: '* Esperem!' }), a(0.55, 'virar', { alvo: 'tonho', direcao: 'direita' }), a(0.6, 'virar', { alvo: 'caixa', direcao: 'esquerda' }), a(0.75, 'emocao', { alvo: 'caio', icone: '...' })],
}));
C.push(cena('Até que um cachorro sem dono se escondeu atrás dele e latiu: eu gosto desse menino.', {
  cenario: PD, camera: { x: -0.9, z: -10.6, zoom: 2 }, foco: -0.9,
  elementos: DEBATE({ mover: DEPOIS20, extras: [CAIO(-0.4, -9.6, { virado: 'esquerda' }), VIRA(-4.2, -9.5)] }),
  acoes: [a(0.1, 'correr', { alvo: 'vira', para: -1.6, durF: 0.3 }), a(0.4, 'emocao', { alvo: 'caio', icone: '!' }), a(0.6, 'falar', { alvo: 'vira', texto: '* Eu gosto desse menino.' })],
}));
C.push(cena('Mas o Caio não tinha dono nenhum. E estava pensando em pizza.', {
  cenario: PD, camera: { x: -0.9, z: -10.6, zoom: 2 }, foco: -0.9,
  elementos: DEBATE({ mover: DEPOIS20, extras: [CAIO(-0.4, -9.6, { virado: 'esquerda' }), VIRA()] }),
  acoes: [a(0.5, 'pensar', { alvo: 'caio', texto: 'Pizza...' })],
}));
C.push(cena('Foi aí que o Caio entendeu tudo: os cachorros nunca falaram o que os donos pensam.', {
  cenario: PD, camera: PRACA(-1), foco: -1,
  elementos: DEBATE({ mover: DEPOIS20, extras: [CAIO(), VIRA()] }),
  acoes: [a(0.3, 'emocao', { alvo: 'caio', icone: '!' }), a(0.3, 'som', { som: 'revelar' }), a(0.3, 'flash', { intensidade: 0.4 })],
}));
C.push(cena('Eles falam o que eles mesmos pensam. E os donos, com vergonha, sempre concordaram.', {
  cenario: 'rua-comercial', camera: RUA(4.6), foco: 4.6,
  elementos: [P('prof', 'professora', 4, 5.4), D('cprof', 5.4, 5.4, { virado: 'esquerda' })],
  acoes: [a(0.05, 'falar', { alvo: 'cprof', texto: '* Que preguiça de segunda.' }), a(0.7, 'falar', { alvo: 'prof', texto: '* É... verdade.' })],
}));
C.push(cena('E o Bolota não repetia o policial. Ele só estava com fome. Há quinze anos.', {
  cenario: 'rua-comercial', camera: { x: 10.6, z: 3.4, y: 1.5, zoom: 2 }, foco: 10.6,
  elementos: [P('policial', 'policial', 10, 5.4), D('bolota', 11.2, 5.4, { virado: 'esquerda' })],
  acoes: [a(0.5, 'emocao', { alvo: 'bolota', icone: 'coracao' }), a(0.8, 'emocao', { alvo: 'policial', icone: '!' })],
}));
// 7. Solução (o Caio sobe no palanque e fica lá até o fim do debate)
C.push(cena('O Caio subiu no palanque e latiu tão alto que todos os cachorros pararam.', {
  cenario: PD, camera: PRACA(2), foco: 3.7,
  elementos: DEBATE({ mover: DEPOIS20, extras: [CAIO(2.6, -6.7, { y: 0.75 }), VIRA()] }),
  acoes: [a(0.05, 'andar', { alvo: 'caio', para: 3.7, durF: 0.3 }), a(0.4, 'virar', { alvo: 'caio', direcao: 'esquerda' }), a(0.45, 'falar', { alvo: 'caio', texto: '* AU AU AU!' }),
    a(0.55, 'tremer', { intensidade: 0.6, durF: 0.2 }), a(0.75, 'emocao', { alvo: 'ctonho', icone: '!' }), a(0.8, 'emocao', { alvo: 'cprof', icone: '!' })],
}));
C.push(cena('E perguntou a cada um o que ele queria de verdade.', {
  cenario: PD, camera: PRACA(5), foco: 5,
  elementos: DEBATE({ mover: DEPOIS20, extras: [NO_PALANQUE({ virado: 'direita' }), VIRA()] }),
  acoes: [a(0.2, 'falar', { alvo: 'caio', texto: '* O que você quer?' }), a(0.85, 'emocao', { alvo: 'cpref', icone: 'zzz' })],
}));
C.push(cena('O do prefeito só queria dormir. O da professora só odiava o apito do recreio.', {
  cenario: PD, camera: PRACA(2), foco: 2,
  elementos: DEBATE({ mover: DEPOIS20, extras: [NO_PALANQUE({ virado: 'esquerda' }), VIRA()] }),
  acoes: [a(0, 'emocao', { alvo: 'cpref', icone: 'zzz', durF: 0.4 }), a(0.55, 'falar', { alvo: 'cprof', texto: '* Odeio o apito!' }), a(0.9, 'emocao', { alvo: 'prof', icone: 'coracao' })],
}));
C.push(cena('Um por um, os segredos viraram só opinião de cachorro. Só faltava um.', {
  cenario: PD, camera: PRACA(-1), foco: -3,
  elementos: DEBATE({ mover: DEPOIS20, extras: [NO_PALANQUE({ virado: 'esquerda' }), VIRA()] }),
  acoes: [a(0.1, 'pular', { alvo: 'tonho', altura: 0.4 }), a(0.2, 'pular', { alvo: 'prof', altura: 0.4 }), a(0.3, 'pular', { alvo: 'caixa', altura: 0.4 }),
    a(0.45, 'emocao', { alvo: 'vira', icone: 'coracao' }), a(0.7, 'emocao', { alvo: 'bolota', icone: '...' })],
}));
// 8. Callback
C.push(cena('O Caio ofereceu um sanduíche para o Bolota.', {
  cenario: 'rua-comercial', camera: { x: 10.6, z: 3.4, y: 1.5, zoom: 2 }, foco: 10.6,
  elementos: [P('caio', 'aluno', 9.6, 5.2), D('bolota', 11.2, 5.4, { virado: 'esquerda' }), S('sand', 'sanduiche', 10.15, 4.9, { y: 1.0, oculto: true })],   // na mão do Caio, e vai até o Bolota (a câmera com zoom 2 já mostra grande)
  acoes: [a(0.08, 'aparecer', { alvo: 'sand' }), a(0.1, 'magia', { alvo: 'sand' }), a(0.35, 'mover', { alvo: 'sand', para: [10.75, 1.0], durF: 0.25 }),
    a(0.62, 'emocao', { alvo: 'bolota', icone: 'coracao' }), a(0.66, 'pular', { alvo: 'bolota', altura: 0.4 }), a(0.82, 'coletar', { alvo: 'sand' })],
}));
C.push(cena('E, pela primeira vez em quinze anos, o Bolota disse outra frase: agora, hora da janta.', {
  cenario: 'rua-comercial', camera: { x: 10.6, z: 3.4, y: 1.5, zoom: 2 }, foco: 10.6,
  elementos: [P('caio', 'aluno', 9.6, 5.2), D('bolota', 11.2, 5.4, { virado: 'esquerda' })],
  acoes: [a(0.1, 'emocao', { alvo: 'caio', icone: '?' }), a(0.55, 'falar', { alvo: 'bolota', texto: '* Agora, hora da janta.' }), a(0.9, 'som', { som: 'sucesso' })],
}));

// Continuidade (npm run conferir): cenas do mesmo "momento" da história têm o mesmo elenco; "saiDeCena" = saiu pela história
marcar(C, { debate: [[12, 24], [27, 30]], 'bolota-rua': [[5, 6]], final: [[31, 32]] });

// Expressões no rosto (PROTÓTIPO motor/expressoes.js): [cena, quem, rosto, início (fração da fala)]
rostos(C, [[1, "caixa", "envergonhado", 0.4], [2, "prof", "envergonhado", 0.5], [3, "cand", "assustado", 0.4], [4, "caixa", "envergonhado", 0.4], [4, "tonho", "envergonhado", 0.5], [6, "policial", "envergonhado", 0.4], [7, "caio", "triste", 0.5], [7, "aluna", "rindo", 0.4], [8, "caio", "feliz"], [8, "prof", "pensativo", 0.3], [10, "caio", "feliz"], [10, "prof", "pensativo", 0.3], [11, "caio", "rindo"], [12, "prefeito", "feliz"], [13, "prefeito", "surpreso", 0.5], [14, "tonho", "surpreso"], [14, "prof", "surpreso"], [14, "caixa", "surpreso"], [14, "prefeito", "envergonhado"], [15, "tonho", "envergonhado", 0.5], [16, "caixa", "assustado"], [16, "policial", "surpreso"], [17, "prof", "chorando", 0.6], [18, "policial", "envergonhado", 0.4], [19, "prefeito", "bravo"], [20, "tonho", "triste", 0.3], [20, "prof", "triste", 0.3], [21, "caio", "triste", 0.5], [22, "caio", "surpreso", 0.5], [23, "caio", "feliz", 0.5], [24, "caio", "feliz", 0.5], [25, "prof", "envergonhado"], [26, "policial", "surpreso", 0.4], [27, "caio", "bravo", 0.1], [27, "prefeito", "surpreso", 0.5], [28, "caio", "feliz"], [29, "prefeito", "envergonhado", 0.3], [29, "prof", "rindo", 0.6], [30, "tonho", "feliz"], [30, "caixa", "feliz"], [30, "prof", "feliz"], [31, "caio", "feliz"], [32, "caio", "rindo", 0.5], [13, "cpref", "triste", 0.3], [17, "cprof", "envergonhado", 0.6], [22, "vira", "feliz", 0.5], [28, "vira", "feliz"]]);

salvar('nesse-mundo-cachorros', ['NESSE MUNDO (longo, cômico) — "Nessa cidade, todo cachorro fala em voz alta o que o dono está pensando."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-cachorros',
  'Cães: protótipos cachorro-* e vira-lata (leva3); Bolota = cao-guarda. Ícone "gota" e ação "pensar" são protótipos. "vertical" = enquadramento do Shorts.'], R);
