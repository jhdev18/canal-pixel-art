import { cortesZoom, zoomShorts, alturaShorts, marcar, P, S, a, cena, salvar, base, rostos } from './nm.mjs';
// ISEKAI — série do cogumelo Davi, EPISÓDIO 1 (Shorts, aventura de dia). "E se você renascesse como o monstro mais fraco do jogo?"
// Táticas de retenção (as mesmas do vídeo das sombras): a regra (os esporos) se mexe na tela desde 0,6 s e aparece em quase toda cena;
// escalada (1 herói → 2 → muitos; cogumelos 4 → 0); o "Até que" a ~35%; o Davi ESCOLHE espirrar de propósito (a pista do espirro
// que fez o cogumelo dormir, cena 2); a virada inverte a crença ("o mais fraco" → "derrotavam antes que crescessem"); última imagem com
// os esporos ainda boiando e o gancho do goblin (o rival da série). Tudo de dia, num lugar só (a floresta).
const R = base('E se você renascesse como o monstro mais fraco do jogo?');   // sem música de fundo (pedido do usuário: só quando ele escolher)
const C = R.cenas;
const CAM = (x, y = 2.6) => ({ x, z: 2.2, y });
const PERTO = (x, y = 1.8) => ({ x, z: 2.2, y, zoom: 2 });
const F = { figurante: true };
const ESPADA = (heroi) => S('e-' + heroi, 'espada-heroi', 0, 0, { sobre: { id: heroi, dx: 0.45, dy: 0.8 } });
const COMUM = ['cogumelo-comum', 'cogumelo-roxo', 'cogumelo-verde', 'cogumelo-comum'];

// 1. Gancho: aos 0,15 s o Davi brota do chão (puf) e pula; no meio da frase, espirra uma nuvenzinha azul
C.push(cena('como o monstro mais fraco do jogo?', {
  continuaFrase: true, titulo: 'E SE VOCÊ RENASCESSE COMO O MONSTRO MAIS FRACO?', tituloInicio: 0, tituloDuracao: 2.0, tituloSemEntrada: true, tituloPosicao: 0.13,   // o título já entrou na abertura
  cenario: 'floresta-isekai', transicao: 'corte', camera: PERTO(0, 1.8), foco: 'davi',
  elementos: [P('davi', 'cogumelo-davi', 0, 3.0, { oculto: true })],
  acoes: [{ tipo: 'aparecer', alvo: 'davi', inicio: 0.15 }, { tipo: 'pular', alvo: 'davi', altura: 0.5, inicio: 0.35, duracao: 0.5 },
    a(0.5, 'espirrar', { alvo: 'davi', duracao: 1, inspira: 0.6 }), a(0.5, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'pequeno', inicio: undefined })],
}));
// o esporo sai no ATCHIM (início do espirro + 0,6 s)
{ const c = C[0], e = c.acoes.find((x) => x.tipo === 'espirrar'), s = c.acoes.find((x) => x.tipo === 'esporos'); s.inicio = +(e.inicio + 0.6).toFixed(2); }
// 2. A desvantagem e a PISTA: ele tropeça, espirra de novo e o cogumelo ao lado cai no sono
C.push(cena('Davi acordou sem braços, de perninhas curtas e chapéu gigante.', {
  cenario: 'floresta-isekai', camera: CAM(0.4), foco: 'davi',
  elementos: [P('davi', 'cogumelo-davi', -1.6, 3.0), P('c1', 'cogumelo-roxo', 1.8, 3.8, F)],
  acoes: [a(0, 'andar', { alvo: 'davi', para: 0.2, durF: 0.4 }), a(0.42, 'pular', { alvo: 'davi', altura: 0.15, durF: 0.08 }), a(0.44, 'som', { som: 'aterrissar' }),
    a(0.55, 'espirrar', { alvo: 'davi', duracao: 1, inspira: 0.6 }), a(0.8, 'emocao', { alvo: 'c1', icone: 'zzz' })],
}));
{ const c = C[1], e = c.acoes.find((x) => x.tipo === 'espirrar'); c.acoes.push({ tipo: 'esporos', alvo: 'davi', cor: 'azul', tamanho: 'pequeno', inicio: +(e.inicio + 0.6).toFixed(2) }); }
// 3. A crença como AÇÃO: ao fundo, um herói derrota um cogumelo com um golpe (puf); o Davi assiste, assustado
C.push(cena('Nesse mundo, cogumelo é o primeiro monstro que todo herói derrota.', {
  cenario: 'floresta-isekai', camera: CAM(1.2), foco: ['davi', 'h1'],
  elementos: [P('davi', 'cogumelo-davi', -1.4, 2.6), P('h1', 'heroi-aventureiro', 2.0, 4.0, F), ESPADA('h1'), P('c2', 'cogumelo-comum', 3.4, 4.0, F)],
  acoes: [a(0.05, 'andar', { alvo: 'h1', para: 2.4, durF: 0.3 }), a(0.4, 'golpe', { alvo: 'h1', direcao: 'direita' }), a(0.44, 'sumir', { alvo: 'c2' }),
    a(0.46, 'trocar', { alvo: 'davi', estado: 'tremendo' }), a(0.5, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'pequeno' })],
}));
// 4. Mais heróis: dois chegam girando a espada no ar (treino); um cogumelo verde se assusta e foge (pedido do usuário: não o Davi)
C.push(cena('Por isso, todo herói novo vem treinar na floresta.', {
  cenario: 'floresta-isekai', camera: CAM(1.6), foco: ['h1', 'h2'],
  elementos: [P('h1', 'heroi-aventureiro', -2.6, 3.0, F), ESPADA('h1'), P('h2', 'heroi-aventureira', -4.6, 3.8, F), ESPADA('h2'), P('c3', 'cogumelo-verde', 4.2, 2.2, F)],
  acoes: [a(0, 'andar', { alvo: 'h1', para: 1.2, durF: 0.55 }), a(0.05, 'andar', { alvo: 'h2', para: -0.8, durF: 0.55 }),
    a(0.62, 'golpe', { alvo: 'h1', direcao: 'direita' }), a(0.75, 'golpe', { alvo: 'h2', direcao: 'esquerda' }), a(0.66, 'emocao', { alvo: 'c3', icone: '!' }), a(0.72, 'andar', { alvo: 'c3', para: 6.4, durF: 0.26 })],   // outro cogumelo (não o Davi) se assusta e foge
}));
// Posições da manhã do ataque (cenas 5–13): o Davi na esquerda, os heróis espalhados pela clareira (cada um na sua faixa de z)
const HEROIS = [['h1', 'heroi-aventureiro', 0.8, 3.0], ['h2', 'heroi-aventureira', 2.4, 3.8], ['h3', 'heroi-grandao', 3.8, 2.6],
  ['h4', 'heroi-aventureiro', 5.2, 4.2], ['h5', 'heroi-aventureira', 6.6, 3.2], ['h6', 'heroi-grandao', 8.0, 4.4]];
const COGUMELOS = [['c1', 1.6, 1.6], ['c2', 3.2, 1.6], ['c3', 4.8, 1.6], ['c4', 6.4, 1.6]];
const HER = (extra = {}) => HEROIS.flatMap(([id, sp, x, z]) => [P(id, sp, x, z, { ...F, ...extra }), ESPADA(id)]);
// Shorts das cenas 5 e 6: o grupo inteiro no meio, câmera fixa (os heróis entram correndo de fora, pela direita)
const ATAQUE_SHORTS = () => ({ x: 5.6, z: 2.2, y: 2.6, travado: true });
// 5. O evento (~30%): seis heróis entram correndo de uma vez pela direita (cada um na sua faixa); os cogumelos levam susto ("!")
C.push(cena('Até que, numa manhã, vieram seis de uma vez.', {
  cenario: 'floresta-isekai', camera: CAM(6.2),
  // enquadramento: o grupo inteiro (heróis + cogumelos, como fica no fim) no meio da tela; os heróis entram correndo de FORA, pela direita
  vertical: { camera: ATAQUE_SHORTS() },
  elementos: [...HEROIS.flatMap(([id, sp, x, z]) => [P(id, sp, x + 9, z, F), ESPADA(id)]), ...COGUMELOS.map(([id, x, z], k) => P(id, COMUM[k], x, z, F))],
  acoes: [...HEROIS.map(([id, , x], k) => a(k * 0.03, 'correr', { alvo: id, para: x, durF: 0.6 })), a(0.6, 'tremer', { intensidade: 0.25, durF: 0.1 }), a(0.6, 'som', { som: 'passo' }),
    ...COGUMELOS.map(([id], k) => a(0.72 + k * 0.04, 'emocao', { alvo: id, icone: '!' }))],
}));
// 6. Escalada: um por um, os cogumelos fazem "puf" (cada herói golpeia o da frente)
C.push(cena('Um por um, os cogumelos da floresta foram sumindo.', {
  cenario: 'floresta-isekai', camera: CAM(3.4), vertical: { camera: ATAQUE_SHORTS() },
  // cada herói dá um passo para a esquerda e golpeia (termina na posição da manhã do ataque)
  elementos: [...HEROIS.flatMap(([id, sp, x, z]) => [P(id, sp, x + 0.6, z, F), ESPADA(id)]), ...COGUMELOS.map(([id, x, z], k) => P(id, COMUM[k], x, z, F))],
  acoes: [...HEROIS.map(([id, , x], k) => a(k * 0.04, 'andar', { alvo: id, para: x, durF: 0.96 - k * 0.04 })),
    ...COGUMELOS.flatMap(([id], k) => [a(0.08 + k * 0.2, 'golpe', { alvo: HEROIS[k][0], direcao: 'esquerda' }), a(0.12 + k * 0.2, 'sumir', { alvo: id })])],
  saiDeCena: COGUMELOS.map(([id]) => id),
}));
// 7. Só sobrou o Davi: foge a passinhos minúsculos, soltando um esporo de medo a cada passo; o herói vem atrás, sem pressa
C.push(cena('Só sobrou o Davi. E ele fugia a passinhos deste tamanho.', {
  cenario: 'floresta-isekai', camera: CAM(-0.4), foco: ['davi', 'h1'],
  elementos: [P('davi', 'cogumelo-davi', 0.2, 3.0, { pose: 'assustado' }), P('h1', 'heroi-aventureiro', 2.8, 3.0, F), ESPADA('h1')],
  acoes: [a(0.25, 'andar', { alvo: 'davi', para: -1.0, durF: 0.75, som: null }), a(0.3, 'andar', { alvo: 'h1', para: 0.8, durF: 0.7 }),
    a(0.35, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'pequeno' }), a(0.6, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'pequeno' }),
    a(0.85, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'pequeno' })],
}));
// 8. A espada desce e leva o chapéu: ele fica careca e treme; o chapéu voa para a esquerda
C.push(cena('A espada desceu e levou o chapéu dele junto.', {
  cenario: 'floresta-isekai', camera: CAM(-0.6), foco: ['davi', 'h1'],
  elementos: [P('davi', 'cogumelo-davi', -1.0, 3.0, { pose: 'assustado' }), P('h1', 'heroi-aventureiro', 2.2, 3.0, F), ESPADA('h1'), S('chapeu', 'chapeu-davi', -1.0, 3.0, { oculto: true })],
  // o herói chega andando, golpeia; o Davi dá um pulinho de susto no lugar e fica com a gota de medo (pedido do usuário: mais movimento)
  acoes: [a(0, 'andar', { alvo: 'h1', para: 0.8, durF: 0.28 }), a(0.55, 'pular', { alvo: 'davi', altura: 0.35, durF: 0.12 }), a(0.75, 'emocao', { alvo: 'davi', icone: 'gota' }), a(0.3, 'golpe', { alvo: 'h1', direcao: 'esquerda' }), a(0.34, 'trocar', { alvo: 'davi', estado: 'sem-chapeu-tremendo' }), a(0.34, 'aparecer', { alvo: 'chapeu', som: null }),
    a(0.34, 'pular', { alvo: 'chapeu', para: -3.4, altura: 1.4, durF: 0.3 }), a(0.36, 'tremer', { intensidade: 0.35, durF: 0.12 }), a(0.36, 'som', { som: 'dano' })],
}));
// 9–13: o mesmo instante (o Davi careca no meio dos heróis; o chapéu caído à esquerda)
const DAVI = (pose = 'sem-chapeu-tremendo') => P('davi', 'cogumelo-davi', -1.0, 3.0, { pose });
const CHAPEU = () => S('chapeu', 'chapeu-davi', -3.4, 3.0);
// 9. O Davi ESCOLHE: para, respira fundo e espirra de propósito
C.push(cena('Então o Davi parou. Respirou fundo. E espirrou de propósito.', {
  cenario: 'floresta-isekai', camera: PERTO(-0.4, 1.8), foco: 'davi',
  elementos: [DAVI(), CHAPEU(), ...HEROIS.flatMap(([id, sp, x, z]) => [P(id, sp, id === 'h1' ? 1.8 : x, z, F), ESPADA(id)])],
  acoes: [a(0.05, 'andar', { alvo: 'h1', para: 0.8, durF: 0.9 }), a(0.3, 'trocar', { alvo: 'davi', estado: 'sem-chapeu' }), a(0.5, 'trocar', { alvo: 'davi', estado: 'sem-chapeu-inspira', som: 'espirro-inspira' }),
    a(0.86, 'trocar', { alvo: 'davi', estado: 'sem-chapeu-espirro', som: 'espirro' }), a(0.88, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'pequeno' }),
    a(0.95, 'golpe', { alvo: 'h1', direcao: 'esquerda' })],
}));
// 10. O pico visual: a nuvem azul enche a floresta
C.push(cena('A floresta inteira ficou azul.', {
  cenario: 'floresta-isekai', camera: CAM(2.4), foco: ['davi', 'h5'],
  elementos: [DAVI('sem-chapeu-espirro'), CHAPEU(), ...HER()],
  acoes: [a(0, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'grande' }), a(0.05, 'flash', { intensidade: 0.5, cor: '#5aa0f0', durF: 0.95 }), a(0.1, 'tremer', { intensidade: 0.3, durF: 0.2 }),
    ...HEROIS.slice(0, 3).map(([id], k) => a(0.4 + k * 0.1, 'emocao', { alvo: id, icone: '!' }))],
}));
// 11. Os heróis caem dormindo um por um (a pessoa some e entra a versão deitada, com "zzz")
const DORMEM = HEROIS.map(([id, sp, x, z]) => P('d' + id, sp + '-dormindo', x, z, { ...F, oculto: true }));
C.push(cena('E os seis heróis caíram dormindo.', {
  cenario: 'floresta-isekai', camera: CAM(2.4), foco: ['davi', 'h5'],
  elementos: [DAVI('sem-chapeu'), CHAPEU(), ...HER(), ...DORMEM],
  acoes: [a(0, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'flutuando' }),
    ...HEROIS.flatMap(([id], k) => [a(0.08 + k * 0.12, 'sumir', { alvo: id, som: null }), a(0.08 + k * 0.12, 'sumir', { alvo: 'e-' + id, som: null }),
      a(0.08 + k * 0.12, 'aparecer', { alvo: 'd' + id, som: k % 2 ? null : 'aterrissar' })]),
    a(0.85, 'emocao', { alvo: 'dh1', icone: 'zzz' })],
  saiDeCena: HEROIS.flatMap(([id]) => [id, 'e-' + id]),
}));
const DORMINDO = () => HEROIS.map(([id, sp, x, z]) => P('d' + id, sp + '-dormindo', x, z, F));
// 12. Virada (1): ele pega o chapéu de volta (o chapéu pula até a cabeça dele) no meio dos heróis dormindo
C.push(cena('Os heróis não derrotavam os cogumelos por serem fracos.', {
  cenario: 'floresta-isekai', camera: CAM(0.4), foco: 'davi',
  elementos: [DAVI('sem-chapeu'), CHAPEU(), ...DORMINDO()],
  acoes: [a(0, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'flutuando' }), a(0.2, 'pular', { alvo: 'chapeu', para: -1.0, altura: 1.0, durF: 0.3 }),
    a(0.5, 'sumir', { alvo: 'chapeu', som: null }), a(0.5, 'trocar', { alvo: 'davi', estado: 'feliz', som: 'sucesso' }), a(0.7, 'emocao', { alvo: 'dh2', icone: 'zzz' })],
  saiDeCena: ['chapeu'],
}));
// 13. Virada (2): o chapéu cresce, dourado e brilhando (corte de zoom na transformação)
C.push(cena('Derrotavam antes que eles crescessem.', {
  cenario: 'floresta-isekai', camera: CAM(0.4), foco: 'davi',
  elementos: [DAVI('feliz'), ...DORMINDO()],
  acoes: [a(0, 'esporos', { alvo: 'davi', cor: 'azul', tamanho: 'flutuando' }), a(0.35, 'trocar', { alvo: 'davi', estado: 'grande', som: 'revelar' }), a(0.35, 'magia', { alvo: 'davi' }),
    a(0.36, 'flash', { intensidade: 0.5 }), a(0.38, 'corte', { zoom: 2, x: -0.7, y: 1.8 }), a(0.6, 'pular', { alvo: 'davi', altura: 0.4, durF: 0.25 })],
}));
// 14. Gancho da série: na moita, o goblin BRUXO anota tudo no grimório; em volta dele flutuam chamas verdes — as almas dos
//     cogumelos que os heróis derrotaram (o mistério da série: o que ele vai fazer com elas?). No fim, ele ergue o cajado e ri.
const ALMAS = [[4.6, 4.6, 1.4], [6.8, 4.4, 1.8], [5.4, 5.6, 2.2]];
C.push(cena('E, escondido na moita, um goblin bruxo anotava tudo.', {
  cenario: 'floresta-isekai', camera: PERTO(6.0, 1.9), foco: 'gob',
  elementos: [P('gob', 'goblin', 5.6, 5.0), P('davi', 'cogumelo-davi', -1.0, 3.0, { pose: 'grande' }),
    ...ALMAS.map(([x, z, y], k) => S('alma' + k, 'fogo-fatuo', x, z, { y, pose: 'verde', oculto: true }))],
  acoes: [a(0, 'esporos', { alvo: 'gob', cor: 'azul', tamanho: 'flutuando' }), a(0.05, 'andar', { alvo: 'gob', para: 6.0, durF: 0.3 }),
    ...ALMAS.map((_, k) => a(0.3 + k * 0.1, 'aparecer', { alvo: 'alma' + k, som: k ? null : 'fantasma' })),
    a(0.65, 'trocar', { alvo: 'gob', estado: 'conjurar', som: 'magia' }), a(0.66, 'flash', { intensidade: 0.35, cor: '#7af0a0' }),
    a(0.85, 'trocar', { alvo: 'gob', estado: 'rindo', som: 'suspense' })],
}));
// 15. FINAL INTERATIVO (últimos ~4 s): o público escolhe para onde o Davi vai no episódio 2 — mais fundo na floresta ou para a vila
//     dos heróis. Na tela: o Davi (chapéu dourado) dá uns passos para um lado, para com "?", e volta; o placar mostra só as duas
//     opções no alto: cartaz "VOCÊ DECIDE!" com dois cartões (número, ícone de árvore/casa e o nome) que entram pulando.
C.push(cena('Para onde o Davi vai agora? Comenta: um, floresta. Dois, vila.', {
  cenario: 'floresta-isekai', camera: PERTO(0, 1.8), foco: 'davi',
  elementos: [P('davi', 'cogumelo-davi', 0.4, 3.0, { pose: 'grande' })],
  acoes: [a(0.02, 'placar', { estilo: 'escolha', opcoes: ['FLORESTA', 'VILA'], icones: ['arvore', 'casa'], cores: ['#3ac860', '#f0a040'], durF: 0.96 }),
    a(0.05, 'andar', { alvo: 'davi', para: -0.6, durF: 0.3 }), a(0.4, 'emocao', { alvo: 'davi', icone: '?' }),
    a(0.62, 'andar', { alvo: 'davi', para: 1.2, durF: 0.3 }), a(0.95, 'som', { som: 'blip' })],
}));

marcar(C, { ataque: [[9, 13]] });
rostos(C, [[3, 'h1', 'bravo', 0.6], [4, 'h1', 'feliz', 0.6], [4, 'h2', 'feliz', 0.7], [6, 'h5', 'bravo', 0.5], [6, 'h6', 'bravo', 0.5],
  [7, 'h1', 'bravo', 0.75], [8, 'h1', 'bravo', 0.5], [9, 'h2', 'bravo'], [9, 'h3', 'bravo'], [10, 'h4', 'surpreso', 0.4], [10, 'h5', 'surpreso', 0.4], [10, 'h6', 'surpreso', 0.4],
  // o Davi (v3) reage com o rosto em toda cena em que fica parado (também de chapéu grande e sem chapéu: "<estado>-rosto-x")
  [1, 'davi', 'surpreso', 0.75], [2, 'davi', 'envergonhado', 0.85], [3, 'davi', 'pensativo', 0.05, 0.38], [9, 'davi', 'bravo', 0.31, 0.18],
  [11, 'davi', 'surpreso', 0.35], [12, 'davi', 'rindo', 0.56], [13, 'davi', 'rindo', 0.86], [15, 'davi', 'feliz', 0.93]]);
alturaShorts(C, { 15: -2.25, 1: -2.25, 2: -1, 3: -1.25, 4: -0.25, 5: -2.25, 6: -2.25, 7: -1.25, 8: -2, 9: -1.25, 10: -2.25, 11: -1.5, 12: -1.5, 13: -1.25 });   // refeito com o Davi v3 (maior)

// 16:9: o Davi é baixinho e a legenda (85% da altura) cobria ele — a câmera do 16:9 desce 1,25 (os personagens sobem na tela) (o Shorts, já ajustado acima, não muda)
for (const c of C) {
  if (c.camera?.y != null) c.camera = { ...c.camera, y: +(c.camera.y - 1.25).toFixed(2) };
  for (const ac of c.acoes) if (ac.tipo === 'corte' && ac.y != null) { ac.vertical = { y: ac.vertical?.y ?? ac.y, ...(ac.vertical || {}) }; ac.y = +(ac.y - 1.25).toFixed(2); }
}
// formato novo (pedido do usuário 25/11/2026): personagens maiores no Shorts (zoom 1,5) e a regra fixa no alto o vídeo inteiro
zoomShorts(C);
cortesZoom(C, [[2, 'davi', 0.7], [3, 'davi', 0.7], [7, 'davi', 0.75], [10, 'davi', 0.5], [12, 'davi', 0.65]]);   // quebra de padrão: zoom 2 na palavra forte (números = cenas sem a abertura)
R.tituloFixo = 'RENASCI COMO O MONSTRO MAIS FRACO';

// ABERTURA (gancho, pedido do usuário 25/11/2026): ~1 s com a imagem mais forte do vídeo EM CLOSE, falando o começo da 1ª frase;
// a cena 1 continua a frase ("continuaFrase": o mesmo parágrafo no ElevenLabs). Entra no começo só agora (os números de cena acima são da 1ª em diante).
{ const abre = [cena('E se você renascesse', {   // a espadada que leva o chapéu do Davi, de perto
    titulo: 'E SE VOCÊ RENASCESSE COMO O MONSTRO MAIS FRACO?', tituloInicio: 0, tituloDuracao: 2.6, tituloPosicao: 0.13,
    cenario: 'floresta-isekai', transicao: 'corte', camera: { x: -0.2, z: 2.2, y: 1.4, zoom: 3 }, foco: ['davi', 'h1', 'chapeu'],
    elementos: [P('davi', 'cogumelo-davi', -1.0, 3.0, { pose: 'assustado' }), P('h1', 'heroi-aventureiro', 0.8, 3.0, F), ESPADA('h1'), S('chapeu', 'chapeu-davi', -1.0, 3.0, { oculto: true })],
    acoes: [a(0, 'golpe', { alvo: 'h1', direcao: 'esquerda' }), a(0, 'som', { som: 'dano' }), a(0.04, 'trocar', { alvo: 'davi', estado: 'sem-chapeu-tremendo' }),
      a(0.04, 'aparecer', { alvo: 'chapeu', som: null }), a(0.04, 'pular', { alvo: 'chapeu', para: -3.4, altura: 1.4, durF: 0.6 }), a(0.05, 'tremer', { intensidade: 0.35, durF: 0.15 }), a(0.05, 'flash', { intensidade: 0.4 })],
  })];
  alturaShorts(abre, { 1: -2 }); C.unshift(abre[0]); }

salvar('isekai-davi-01', ['ISEKAI (série do cogumelo Davi) — EPISÓDIO 1: "E se você renascesse como o monstro mais fraco do jogo?"',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- isekai-davi-01',
  'Protótipos: motor/assets/isekai.js (cogumelo-davi, cogumelos, goblin, heróis + dormindo, espada, chapéu), ações golpe e esporos, floresta-isekai.'], R);
