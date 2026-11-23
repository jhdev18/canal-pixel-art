import { alturaShorts, turma, marcar, P, S, RUA, FRENTE, PRACA, a, cena, salvar, base, rostos, LUGARES_AULA } from './nm.mjs';
// NESSE MUNDO curto, COMÉDIA de dia. Táticas de retenção do vídeo das sombras: comida (do dia a dia) que SE MEXE sozinha em
// toda cena, 1ª frase com "você", evento aos ~33%, pico de movimento no meio (a cidade inteira correndo atrás do pão),
// a Bia AGE (para e abre a mão), a virada inverte a crença e o callback fecha com a piada ("quatro segundos" → "quatro horas").
const R = base('Nessa cidade, a comida que você deixa no prato foge', 'comedia');
const C = R.cenas;
const PAO = (id, x, z, extra = {}) => S(id, 'pao', x, z, { escala: 2, ...extra });
const SAND = (id, x, z, extra = {}) => S(id, 'sanduiche', x, z, { y: 0.78, ...extra });
const naCarteira = ([x, z]) => [x + 1.05, z - 0.2];   // em cima da carteira de quem senta em (x, z)
// comida foge SALTITANDO (pulinhos seguidos), não deslizando
const saltos = (alvo, x0, x1, f0, durF, n, altura = 0.45) => Array.from({ length: n }, (_, k) =>
  a(f0 + (k * durF) / n, 'pular', { alvo, altura, para: +(x0 + ((x1 - x0) * (k + 1)) / n).toFixed(2), durF: (durF / n) * 0.95 }));

// 1. Regra — o pão já pula e foge aos 0,3 s
C.push(cena('Nessa cidade, a comida que você deixa no prato sai correndo.', {
  // gancho: câmera perto (zoom 2) seguindo o pão, que já está pulando no 1º quadro; o aluno já começa com cara de susto
  cenario: 'rua-comercial', transicao: 'corte', camera: { x: 4, z: 2.2, y: 1.5, zoom: 2 }, foco: 4, seguir: 'pao1',
  elementos: [P('aluno', 'aluno', 2.8, 5.2, { pose: 'rosto-surpreso' }), PAO('pao1', 3.7, 4.8)],
  acoes: [{ tipo: 'pular', alvo: 'pao1', altura: 0.6, para: 4.5, inicio: 0, duracao: 0.4 }, { tipo: 'som', som: 'pulo', inicio: 0 },
    ...saltos('pao1', 4.5, 10.2, 0.02, 0.88, 6, 0.5), { tipo: 'emocao', alvo: 'aluno', icone: '!', inicio: 0.1 }],
}));
// 2. Crença como AÇÃO + exagero concreto: a merenda dura 4 segundos (os sanduíches somem um por um)
const sand2 = LUGARES_AULA.map((l, k) => SAND('s' + k, ...naCarteira(l)));
C.push(cena('Por isso, ninguém deixa resto. A merenda da escola dura quatro segundos.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: -1.6,
  titulo: 'NESSA CIDADE, A COMIDA FOGE', tituloInicio: 0.3, tituloDuracao: 2.6,
  elementos: turma([P('prof', 'professora', 8.1, 1.6, { virado: 'esquerda' }), ...sand2]),
  acoes: [...sand2.map((s, k) => a(0.35 + k * 0.06, 'coletar', { alvo: s.id })), a(0.05, 'andar', { alvo: 'prof', para: 6.0, durF: 0.35 }),
    a(0.8, 'emocao', { alvo: 'prof', icone: '!' })],
}));
// 3. Imagem cômica: os pães pulando para fugir e o seu Tonho trancando com cadeado
C.push(cena('E o seu Tonho tranca os pães com cadeado.', {
  cenario: 'rua-comercial', camera: RUA(0.6), foco: 0.6,
  elementos: [P('tonho', 'padeiro', -0.3, 5.2), PAO('pa', 0.9, 4.9), PAO('pb', 1.5, 5.0), PAO('pc', 2.1, 4.9), S('cad', 'cadeado', 1.5, 4.6, { y: 0.9, pose: 'aberto', escala: 2 })],
  acoes: [...['pa', 'pb', 'pc'].flatMap((id, k) => [a(0.05 + k * 0.08, 'pular', { alvo: id, altura: 0.5 }), a(0.35 + k * 0.08, 'pular', { alvo: id, altura: 0.4 })]),
    a(0.68, 'trocar', { alvo: 'cad', estado: 'fechado' }), a(0.68, 'som', { som: 'cadeado' })],
}));
// 4. Protagonista diferente (sem som se entende): o lanche dos outros foge; o da Bia fica
C.push(cena('Mas a Bia come devagarinho. E o lanche dela nunca fugiu.', {
  cenario: 'rua-comercial', camera: FRENTE(1), foco: 1,
  elementos: [P('bia', 'menina-capa', -1.2, 0.6), S('sandBia', 'sanduiche', 0, 0, { sobre: { id: 'bia', dx: 0.55, dy: 1.0 } }),
    P('nina', 'rival', 1.4, 0.7), SAND('sandNina', 2.0, 0.2, { y: 0 })],
  acoes: [...saltos('sandNina', 2.0, 6.8, 0.1, 0.5, 5, 0.35), a(0.2, 'correr', { alvo: 'nina', para: 5.6, durF: 0.45 }),
    a(0.7, 'emocao', { alvo: 'bia', icone: 'coracao' }), a(0.72, 'magia', { alvo: 'sandBia' })],
}));
// 5. Evento (~33%)
C.push(cena('Até que, num domingo, o seu Tonho assou o maior pão da história.', {
  cenario: 'rua-comercial', camera: RUA(1.4), foco: 1.4,
  elementos: [P('tonho', 'padeiro', -0.4, 5.2), PAO('gigante', 1.6, 4.8, { escala: 4, oculto: true })],
  acoes: [a(0.2, 'aparecer', { alvo: 'gigante' }), a(0.22, 'magia', { alvo: 'gigante' }), a(0.35, 'som', { som: 'sucesso' }),
    a(0.55, 'pular', { alvo: 'tonho', altura: 0.5 })],
}));
// 6. O pão gigante foge
C.push(cena('E o pão pulou da vitrine e saiu quicando rua abaixo.', {
  cenario: 'rua-comercial', camera: RUA(5.6), foco: 5.6,
  elementos: [P('tonho', 'padeiro', -0.4, 5.2), PAO('gigante', 1.6, 4.8, { escala: 4 })],
  acoes: [...saltos('gigante', 1.6, 12.4, 0.02, 0.92, 6, 0.6),
    a(0.3, 'emocao', { alvo: 'tonho', icone: '!' }), a(0.35, 'correr', { alvo: 'tonho', para: 9.8, durF: 0.6 }), a(0.05, 'som', { som: 'pulo' })],
}));
// 7. Escalada + pico de movimento no MEIO: a cidade inteira correndo atrás do pão
C.push(cena('Primeiro o padeiro. Depois a professora. Em um minuto, a cidade inteira.', {
  cenario: 'rua-comercial', camera: RUA(12), foco: 12,
  elementos: [PAO('gigante', 12.4, 3.8, { escala: 4 }), P('tonho', 'padeiro', 9.8, 5.3), P('prof', 'professora', 5.4, 4.9), P('caixa', 'caixa', 3.8, 5.75), P('policial', 'policial', 2.2, 4.45)],
  acoes: [...saltos('gigante', 12.4, 22.4, 0, 0.95, 6, 0.6), a(0, 'correr', { alvo: 'tonho', para: 20.4, durF: 0.95 }),
    a(0.2, 'correr', { alvo: 'prof', para: 18.2, durF: 0.75 }), a(0.45, 'correr', { alvo: 'caixa', para: 17.2, durF: 0.5 }), a(0.55, 'correr', { alvo: 'policial', para: 16.2, durF: 0.42 })],
}));
// ---- Praça: o MESMO elenco nas mesmas posições (momento "praca", cenas 8–11)
// 8. Quanto mais correm, mais o pão foge
C.push(cena('E quanto mais gente corria, mais rápido o pão fugia.', {
  cenario: 'praca', camera: PRACA(0), foco: 0,
  elementos: [PAO('gigante', -6.4, -9.8, { escala: 4 }), P('bia', 'menina-capa', -2.6, -8.6), P('tonho', 'padeiro', -8.6, -8.0), P('prof', 'professora', -9.4, -7.6),
    P('caixa', 'caixa', -10.2, -7.2), P('policial', 'policial', -11.0, -9.2)],
  acoes: [...saltos('gigante', -6.4, 6.8, 0, 0.6, 5, 0.6), a(0.05, 'correr', { alvo: 'tonho', para: 3.6, durF: 0.85 }),
    a(0.08, 'correr', { alvo: 'prof', para: 2.6, durF: 0.85 }), a(0.11, 'correr', { alvo: 'caixa', para: 1.6, durF: 0.85 }), a(0.14, 'correr', { alvo: 'policial', para: 0.6, durF: 0.84 }),
    a(0.35, 'emocao', { alvo: 'bia', icone: '?' })],
}));
// 9. A protagonista AGE: não corre, para e abre a mão
C.push(cena('Só a Bia não correu. Ela parou no meio da praça e abriu a mão.', {
  cenario: 'praca', camera: PRACA(0), foco: -2.6,
  elementos: [PAO('gigante', 6.8, -9.8, { escala: 4 }), P('bia', 'menina-capa', -2.6, -8.6), P('tonho', 'padeiro', 3.6, -8.0), P('prof', 'professora', 2.6, -7.6),
    P('caixa', 'caixa', 1.6, -7.2), P('policial', 'policial', 0.6, -9.2)],
  acoes: [a(0.05, 'pular', { alvo: 'gigante', altura: 0.5 }), a(0.3, 'emocao', { alvo: 'tonho', icone: '...' }), a(0.55, 'magia', { alvo: 'bia' }), a(0.6, 'som', { som: 'item' })],
}));
// 10. O pão volta e deita do lado dela
C.push(cena('E o pão gigante freou, deu meia-volta e deitou do lado dela.', {
  cenario: 'praca', camera: PRACA(-1), foco: -1.6,
  elementos: [PAO('gigante', 6.8, -9.8, { escala: 4 }), P('bia', 'menina-capa', -2.6, -8.6), P('tonho', 'padeiro', 3.6, -8.0), P('prof', 'professora', 2.6, -7.6),
    P('caixa', 'caixa', 1.6, -7.2), P('policial', 'policial', 0.6, -9.2)],
  acoes: [...saltos('gigante', 6.8, -0.6, 0.02, 0.6, 5, 0.5), a(0.68, 'pular', { alvo: 'gigante', altura: 0.3 }), a(0.7, 'som', { som: 'puf' }),
    a(0.75, 'emocao', { alvo: 'bia', icone: 'coracao' })],
}));
// 11. Virada: inverte a crença
C.push(cena('A comida nunca fugiu do prato. Fugia da pressa.', {
  cenario: 'praca', camera: PRACA(0), foco: 0,
  elementos: [PAO('gigante', -0.6, -9.8, { escala: 4 }), P('bia', 'menina-capa', -2.6, -8.6), P('tonho', 'padeiro', 3.6, -8.0), P('prof', 'professora', 2.6, -7.6),
    P('caixa', 'caixa', 1.6, -7.2), P('policial', 'policial', 0.6, -9.2)],
  acoes: [a(0.1, 'emocao', { alvo: 'tonho', icone: '!' }), a(0.14, 'emocao', { alvo: 'prof', icone: '!' }), a(0.18, 'emocao', { alvo: 'caixa', icone: '!' }),
    a(0.4, 'som', { som: 'revelar' }), a(0.45, 'tremer', { intensidade: 0.2, durF: 0.1 }), a(0.6, 'pular', { alvo: 'gigante', altura: 0.2 })],
}));
// 12. Callback da piada: "quatro segundos" → "quatro horas"; a comida continua na tela, quietinha
const sand12 = LUGARES_AULA.map((l, k) => SAND('t' + k, ...naCarteira(l)));
C.push(cena('Hoje, a cidade inteira almoça devagar. E a merenda dura quatro horas.', {
  cenario: 'sala-de-aula-diorama', camera: { x: 1.5, y: 3 }, foco: 0,
  elementos: turma([P('prof', 'professora', 8.1, 1.6, { virado: 'esquerda' }), ...sand12, PAO('mini', 6.4, 1.4, { y: 1.15 })]),
  acoes: [a(0.05, 'andar', { alvo: 'prof', para: 6.9, durF: 0.5 }), a(0.55, 'emocao', { alvo: 'aluno', icone: 'zzz' }), a(0.7, 'emocao', { alvo: 'bia', icone: 'coracao' }),
    a(0.75, 'som', { som: 'sucesso' }), a(0.86, 'pular', { alvo: 'mini', altura: 0.25 }), a(0.88, 'emocao', { alvo: 'mini', icone: 'coracao', rosto: false })],
}));

marcar(C, { praca: [[8, 11]] });
rostos(C, [[3, 'tonho', 'bravo', 0.6], [4, 'bia', 'feliz', 0.65], [5, 'tonho', 'rindo', 0.3], [6, 'tonho', 'surpreso', 0.28],
  [8, 'bia', 'pensativo', 0.35], [9, 'bia', 'feliz', 0.5], [9, 'tonho', 'assustado', 0.3], [10, 'bia', 'rindo', 0.72], [10, 'tonho', 'surpreso', 0.3], [10, 'prof', 'surpreso', 0.3],
  [11, 'tonho', 'envergonhado', 0.3], [11, 'prof', 'envergonhado', 0.35], [11, 'caixa', 'envergonhado', 0.4], [11, 'policial', 'surpreso', 0.2], [11, 'bia', 'feliz'], [12, 'bia', 'feliz', 0.7]]);

// Shorts: câmera mais baixa para a legenda fixa embaixo não cobrir ninguém (medido; praça cheia limitada a -2)
alturaShorts(C, { 1: -0.5, 2: -1.5, 4: -1, 6: -0.75, 7: -1.25, 8: -2, 10: -0.5, 11: -1.25, 12: -2.25 });

salvar('nesse-mundo-comida', ['NESSE MUNDO (curto, comédia DE DIA) — "Nessa cidade, a comida que você deixa no prato sai correndo."',
  'Narração: UM único áudio do narrador (narracao/narracao-completa.mp3). Texto: npm run narracao -- nesse-mundo-comida',
  'Feito com as táticas de retenção do vídeo das sombras (CLAUDE.md). Usa protótipos: pao, cadeado, rival (Nina).'], R);
