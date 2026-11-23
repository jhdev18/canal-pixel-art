import { alturaShorts, P, S, RUA, a, cena, salvar, base, rostos } from './nm.mjs';
// NESSE MUNDO curto, COMÉDIA de dia (Roblox). "Nesse mundo, quando sua mãe manda pausar o Roblox, tudo pausa."
// A frase que toda criança ouve ("pausa esse jogo!") e a resposta de sempre ("online não pausa!") viram regra, pista e virada.
// Gancho: o avatar congela no ar aos 0,3 s. Pico de movimento no meio (a corrida pelos pilares). Imagem cômica a cada ~4 s.
// A mãe (vilã boba) usa a regra a favor; a virada inverte a pista ("online não pausa" → "filho online, pausa").
const R = base('Nesse mundo, quando sua mãe manda pausar o Roblox, tudo pausa', 'comedia');
const C = R.cenas;
const PK = (x, y = 2.8) => ({ x, z: 2.2, y });
// pilares do parkour-campeonato: [x do pilar, altura] → avatar em cima em x+0.6, z 3.2, y altura+0.25
const PIL = [[-7.0, 1], [-4.2, 2], [-1.4, 2], [1.4, 3], [4.2, 3], [7.0, 4]];
const topo = (k) => [+(PIL[k][0] + 0.6).toFixed(2), PIL[k][1] + 0.25];
const pausa = (id, alvo, extra = {}) => S(id, 'icone-pausa', 0, 0, { sobre: { id: alvo, dx: 0, dy: 3.0 }, oculto: true, ...extra });

// 1. Gancho: o avatar pula de um pilar e CONGELA no ar (ícone de pausa) aos ~0,4 s
C.push(cena('Nesse mundo, quando sua mãe manda pausar o Roblox, tudo pausa.', {
  cenario: 'parkour-campeonato', transicao: 'corte', camera: { x: -2.0, z: 2.2, y: 2.4, zoom: 1.5 },
  elementos: [P('a1', 'avatar-bloco-azul', ...[topo(1)[0], 3.2], { y: topo(1)[1] }), pausa('p1', 'a1')],
  // pulo de verdade (agacha → sobe com os braços para cima) até o próximo pilar, CONGELADO no meio do caminho (congelar)
  acoes: [{ tipo: 'pular', alvo: 'a1', para: topo(2), altura: 1.1, inicio: 0, duracao: 0.8 }, { tipo: 'som', som: 'pulo-bloco', inicio: 0 },
    { tipo: 'congelar', alvo: 'a1', inicio: 0.34 }, { tipo: 'flash', inicio: 0.36, intensidade: 0.5 }, { tipo: 'aparecer', alvo: 'p1', inicio: 0.38, som: null },
    { tipo: 'som', som: 'erro', inicio: 0.38 }],
}));
// 2. Exemplos rápidos: o pão parado no ar, o prefeito congelado no meio do espirro
C.push(cena('O avatar parou no ar. O pão parou no ar. O prefeito, no meio do espirro.', {
  cenario: 'rua-comercial', camera: RUA(0.8), titulo: 'PAUSA ESSE JOGO!', tituloInicio: 0.3, tituloDuracao: 2.2,
  elementos: [P('tonho', 'padeiro', -0.6, 5.2), S('pao', 'pao', 0.4, 4.3, { escala: 2, y: 0.3 }), P('prefeito', 'prefeito', 2.6, 5.2), pausa('p1', 'tonho'), pausa('p2', 'prefeito')],
  acoes: [a(0, 'mover', { alvo: 'pao', para: [1.0, 1.3], durF: 0.3 }), a(0.05, 'espirrar', { alvo: 'prefeito', durF: 0.4, inspira: 0.75 }),
    a(0.32, 'flash', { intensidade: 0.4 }), a(0.33, 'aparecer', { alvo: 'p1', som: null }), a(0.33, 'aparecer', { alvo: 'p2', som: null }), a(0.33, 'som', { som: 'erro' }),
    a(0.6, 'trocar', { alvo: 'prefeito', estado: 'espirro' }), a(0.75, 'corte', { zoom: 2, y: 1.6 })],
}));
// 3. Crença como AÇÃO (exagero): a criançada joga trancada no banheiro; batidas na porta
C.push(cena('Por isso, a criançada joga Roblox trancada no banheiro.', {
  cenario: 'banheiro-diorama', camera: { x: 0, y: 3 },
  elementos: [P('aluno', 'aluno', -0.6, 1.6), S('cel', 'celular-mao', 0, 0, { sobre: { id: 'aluno', dx: 0.35, dy: 0.95 } })],
  acoes: [a(0.05, 'pular', { alvo: 'aluno', altura: 0.4 }), a(0.25, 'corte', { zoom: 2, y: 2.2 }), a(0.4, 'som', { som: 'porta' }), a(0.55, 'som', { som: 'porta' }), a(0.55, 'emocao', { alvo: 'aluno', icone: '!' }),
    a(0.7, 'tremer', { intensidade: 0.15, durF: 0.08 })],
}));
// 4. A mãe do Léo (a vilã boba): pausa a cidade vinte vezes por dia — anda, congela, anda, congela, com o contador subindo
C.push(cena('Mas a mãe do Léo grita pausa vinte vezes por dia.', {
  cenario: 'rua-comercial', camera: RUA(5.0),
  elementos: [P('mae', 'mae', 2.6, 5.0), P('caixa', 'caixa', 4.2, 4.6, { figurante: true }), P('policial', 'policial', 6.6, 4.2, { figurante: true })],
  acoes: [a(0, 'andar', { alvo: 'caixa', para: 5.4, durF: 0.2 }), a(0, 'andar', { alvo: 'policial', para: 7.6, durF: 0.2 }), a(0.22, 'flash', { intensidade: 0.3 }),
    a(0.35, 'andar', { alvo: 'caixa', para: 6.6, durF: 0.18 }), a(0.35, 'andar', { alvo: 'policial', para: 8.6, durF: 0.18 }), a(0.55, 'flash', { intensidade: 0.3 }),
    a(0.68, 'andar', { alvo: 'caixa', para: 7.8, durF: 0.2 }), a(0.68, 'andar', { alvo: 'policial', para: 9.6, durF: 0.2 }),
    a(0.1, 'contador', { de: 20, durF: 0.8 }), a(0.5, 'emocao', { alvo: 'mae', icone: 'raiva' })],
}));
// 5. A pista (o único balão): "MÃE, ONLINE NÃO PAUSA!"
C.push(cena('E ele sempre responde: mãe, online não pausa!', {
  cenario: 'sala-de-estar-diorama', camera: { x: 0.4, y: 3 },
  elementos: [P('mae', 'mae', -2.4, 1.6), P('leo', 'menino-topete', 2.2, 1.6), S('cel', 'celular-mao', 0, 0, { sobre: { id: 'leo', dx: 0.35, dy: 0.95 } })],
  acoes: [a(0, 'andar', { alvo: 'mae', para: -1.2, durF: 0.3 }), a(0.3, 'pular', { alvo: 'leo', altura: 0.35 }), a(0.35, 'falar', { alvo: 'leo', texto: 'MÃE, ONLINE NÃO PAUSA!' })],
}));
// 6. Evento (~38%): o campeonato valendo mil Robux; a largada e o grito
C.push(cena('Até que, no campeonato valendo mil Robux, ela gritou: pausa!', {
  cenario: 'parkour-campeonato', camera: PK(-8.0),
  elementos: [P('atop', 'avatar-topete', -10.2, 2.4, { y: 1 }), P('a1', 'avatar-bloco-vermelho', -9.0, 2.8, { y: 1, figurante: true }), P('a2', 'avatar-bloco-verde', -8.0, 2.3, { y: 1, figurante: true }),
    S('m1', 'moeda-bloco', -9.4, 3.6, { y: 2.6 })],
  acoes: [a(0.05, 'pular', { alvo: 'a1', altura: 0.4 }), a(0.2, 'pular', { alvo: 'atop', altura: 0.4 }), a(0.35, 'pular', { alvo: 'a2', altura: 0.4 }), a(0.4, 'som', { som: 'sino' }),
    a(0.8, 'flash', { intensidade: 0.5 }), a(0.8, 'tremer', { intensidade: 0.35, durF: 0.12 }), a(0.8, 'som', { som: 'erro' })],
}));
// 7. Todo mundo congela no ar (ícones de pausa); só o avatar do Léo se mexe
C.push(cena('A cidade congelou. O servidor congelou. Menos um avatar.', {
  cenario: 'parkour-campeonato', camera: PK(-4.0),
  elementos: [P('a1', 'avatar-bloco-vermelho', -6.0, 3.2, { y: 2.2, pose: 'pulando', figurante: true }), P('a2', 'avatar-bloco-verde', -3.6, 3.6, { y: 3.0, pose: 'pulando', figurante: true }),
    pausa('p1', 'a1', { oculto: false }), pausa('p2', 'a2', { oculto: false }), P('atop', 'avatar-topete', -9.4, 2.6, { y: 1 })],
  acoes: [a(0.55, 'pular', { alvo: 'atop', para: topo(0), altura: 1.1, durF: 0.22 }), a(0.55, 'som', { som: 'pulo-bloco' }), a(0.85, 'emocao', { alvo: 'atop', icone: '!' })],
}));
// 8. Pico de movimento: ele pula de pilar em pilar até a chegada e ganha de doze estátuas
C.push(cena('Ele pulou de pilar em pilar e ganhou de doze estátuas.', {
  cenario: 'parkour-campeonato', camera: PK(3.0),
  elementos: [P('atop', 'avatar-topete', topo(0)[0], 3.2, { y: topo(0)[1] }), P('a2', 'avatar-bloco-verde', -3.6, 3.6, { y: 3.0, pose: 'pulando', figurante: true }), pausa('p2', 'a2', { oculto: false })],
  acoes: [...[1, 2, 3, 4, 5].map((k, i) => a(0.02 + i * 0.15, 'pular', { alvo: 'atop', para: topo(k), altura: 1.1, durF: 0.12 })),
    a(0.77, 'pular', { alvo: 'atop', para: [10.6, 4], altura: 1.1, durF: 0.12 }), a(0.92, 'fogos', { posicao: [10.6, 6, 3], cor: 'dourado' }), a(0.92, 'som', { som: 'sucesso' })],
}));
// 9. Na rua parada: o Léo pega o pão do ar e a peruca do prefeito (que vira careca)
C.push(cena('Na rua, o Léo pegou o pão do ar e a peruca do prefeito.', {
  cenario: 'rua-comercial', camera: RUA(1.0),
  elementos: [P('tonho', 'padeiro', -0.6, 5.2), S('pao', 'pao', 1.0, 4.9, { escala: 2, y: 1.3 }), P('prefeito', 'prefeito', 2.6, 5.2, { pose: 'espirro' }),
    P('prefCareca', 'prefeito-careca', 2.6, 5.7, { pose: 'espirro', oculto: true }), P('leo', 'menino-topete', -2.4, 4.4),
    S('peruca', 'peruca', 0, 0, { sobre: { id: 'leo', dx: 0.5, dy: 1.0 }, oculto: true })],
  acoes: [a(0, 'andar', { alvo: 'leo', para: 0.6, durF: 0.35 }), a(0.36, 'coletar', { alvo: 'pao' }), a(0.42, 'andar', { alvo: 'leo', para: 1.8, durF: 0.25 }),
    a(0.7, 'sumir', { alvo: 'prefeito' }), a(0.7, 'aparecer', { alvo: 'prefCareca', som: null }), a(0.72, 'aparecer', { alvo: 'peruca', som: null }), a(0.75, 'emocao', { alvo: 'leo', icone: 'coracao' })],
}));
// 10. A mãe descongela, com a peruca bem na frente dela
C.push(cena('Foi aí que a mãe descongelou. Com a peruca bem na frente dela.', {
  cenario: 'rua-comercial', camera: { x: 2.4, z: 2.2, y: 1.6, zoom: 2 },
  elementos: [P('mae', 'mae', 4.6, 4.6), P('leo', 'menino-topete', 1.8, 4.4), S('peruca', 'peruca', 0, 0, { sobre: { id: 'leo', dx: 0.5, dy: 1.0 } })],
  acoes: [a(0, 'andar', { alvo: 'mae', para: 3.0, durF: 0.35 }), a(0.4, 'emocao', { alvo: 'mae', icone: 'lampada' }), a(0.62, 'emocao', { alvo: 'mae', icone: 'raiva' }),
    a(0.62, 'tremer', { intensidade: 0.15, durF: 0.08 })],
}));
// 11. A mãe cria uma conta: o avatar roxo dela nasce no spawn do lobby
C.push(cena('No dia seguinte, ela criou uma conta no Roblox.', {
  cenario: 'mundo-bloco', camera: { x: -5.4, z: 2.2, y: 2.0, zoom: 1.5 },
  elementos: [P('amae', 'avatar-bloco-roxo', -6.0, 2.6, { y: 0.19, oculto: true })],
  acoes: [a(0.05, 'magia', { alvo: 'amae' }), a(0.1, 'aparecer', { alvo: 'amae', som: null }), a(0.1, 'som', { som: 'entrar-jogo' }), a(0.4, 'andar', { alvo: 'amae', para: -3.6, durF: 0.4 }),
    a(0.85, 'pular', { alvo: 'amae', altura: 0.5 })],
}));
// 12. Ela entra no campeonato e grita, lá de dentro: pausa! (chat em balão)
C.push(cena('Entrou no campeonato do Léo e gritou, lá dentro: pausa!', {
  cenario: 'parkour-campeonato', camera: PK(-2.0),
  elementos: [P('amae', 'avatar-bloco-roxo', -9.4, 2.6, { y: 1 }), P('atop', 'avatar-topete', topo(1)[0], 3.2, { y: topo(1)[1] })],
  acoes: [a(0.05, 'pular', { alvo: 'atop', para: topo(2), altura: 1.1, durF: 0.22 }), a(0.4, 'falar', { alvo: 'amae', texto: 'PAUSA!' }), a(0.45, 'som', { som: 'chat' }),
    a(0.7, 'flash', { intensidade: 0.5 }), a(0.7, 'tremer', { intensidade: 0.3, durF: 0.1 })],
}));
// 13–14. Virada (2 frases curtas): online não pausa… mas filho online, pausa. Ele fica no ar; ela ganha.
C.push(cena('Jogo online não pausa.', {
  cenario: 'parkour-campeonato', foco: 'atop', camera: { x: 0.4, z: 2.2, y: 2.0, zoom: 2 },
  elementos: [P('atop', 'avatar-topete', topo(2)[0], 3.2, { y: topo(2)[1] }), pausa('p', 'atop'), P('amae', 'avatar-bloco-roxo', -9.4, 2.6, { y: 1 })],   // a mãe ficou lá na largada (fora do quadro)
  acoes: [{ tipo: 'pular', alvo: 'atop', para: topo(3), altura: 1.1, inicio: 0, duracao: 0.8 }, { tipo: 'som', som: 'pulo-bloco', inicio: 0 },
    { tipo: 'congelar', alvo: 'atop', inicio: 0.34 }, { tipo: 'aparecer', alvo: 'p', inicio: 0.38, som: null }, { tipo: 'som', som: 'erro', inicio: 0.38 }],
}));
C.push(cena('Mas filho online, pausa. E o Léo ficou no ar até a hora do banho.', {
  cenario: 'parkour-campeonato', foco: 'atop', camera: PK(4.0),
  elementos: [P('atop', 'avatar-topete', 0.39, 3.2, { y: 3.75, pose: 'pulando-sobe' }), pausa('p', 'atop', { oculto: false }), P('amae', 'avatar-bloco-roxo', topo(1)[0], 3.2, { y: topo(1)[1] })],
  // a mãe vem na MESMA faixa (z 3.2) e passa POR CIMA do Léo congelado num pulão (pico ~y 8.7, acima da cabeça e do ícone de pausa),
  // em vez de cruzar por trás/por dentro dele
  acoes: [a(0.02, 'pular', { alvo: 'amae', para: topo(2), altura: 1.1, durF: 0.13 }),
    a(0.18, 'pular', { alvo: 'amae', para: topo(3), altura: 6, durF: 0.22 }), a(0.18, 'som', { som: 'pulo-bloco' }),
    a(0.43, 'pular', { alvo: 'amae', para: topo(4), altura: 1.1, durF: 0.13 }), a(0.58, 'pular', { alvo: 'amae', para: topo(5), altura: 1.1, durF: 0.13 }),
    a(0.73, 'pular', { alvo: 'amae', para: [10.6, 4], altura: 1.1, durF: 0.12 }),
    a(0.86, 'fogos', { posicao: [10.6, 6, 3], cor: 'rosa' }), a(0.86, 'som', { som: 'sucesso' }), a(0.85, 'falar', { alvo: 'amae', texto: 'VAI TOMAR BANHO!' })],
}));

rostos(C, [[2, 'tonho', 'surpreso', 0.3], [4, 'mae', 'bravo', 0.25], [5, 'leo', 'bravo', 0.3], [5, 'mae', 'rindo', 0.35], [9, 'tonho', 'surpreso', 0.3],
  [10, 'leo', 'envergonhado', 0.1], [10, 'mae', 'bravo', 0.4]]);
alturaShorts(C, { 2: -1.25, 3: -1.25, 4: -1.25, 5: -1.25, 9: -1.25, 10: -0.5 });


salvar('nesse-mundo-pausa', ['NESSE MUNDO (curto, COMÉDIA de dia, Roblox) — "Nesse mundo, quando sua mãe manda pausar o Roblox, tudo pausa."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-pausa',
  'Protótipos: jogo de blocos (parkour-campeonato, mundo-bloco, avatares, icone-pausa), banheiro-diorama, mae, menino-topete, peruca/prefeito-careca (aprovados).'], R);
