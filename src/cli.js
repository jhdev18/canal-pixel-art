#!/usr/bin/env node
// Linha de comando: novo | rascunho | final | previa | gpu | sfx | sprites | lista
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, carregarConfig } from './config.js';
import { renderizar } from './render.js';
import { iniciarServidor } from './servidor.js';
import { caminhoProjeto, lerRoteiro, encontrarNarracoes, PASTA_NARRACAO } from './projeto.js';
import { resolverRoteiro, DURACAO_PADRAO } from '../motor/compartilhado/linhaDoTempo.js';
import { verificarFfmpeg, detectarEncoder } from './ffmpeg.js';
import { abrirNavegador, ehSoftware } from './navegador.js';
import { gerarSom, NOMES_SONS, AMBIENTES } from './audio/sintetizador.js';
import { escreverWavMono } from './audio/mixer.js';
import { carregarBiblioteca, listarSpritesBiblioteca, PASTA_BIBLIOTECA } from './biblioteca.js';
import { gerarFotos } from './fotos.js';
import { gerarCatalogo } from './catalogo.js';

const [cmd, ...resto] = process.argv.slice(2);
const flags = {}, pos = [];
for (let i = 0; i < resto.length; i++) {
  const a = resto[i];
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) flags[k] = v;
    else if (resto[i + 1] && !resto[i + 1].startsWith('--')) flags[k] = resto[++i];
    else flags[k] = true;
  } else pos.push(a);
}

const LEIA_ME_NARRACAO = `COLOQUE AQUI OS ÁUDIOS DO ELEVENLABS
=====================================

Um arquivo por cena, com o NÚMERO da cena no nome:

  01.mp3   -> cena 1
  02.mp3   -> cena 2
  cena03.mp3 / cena-3.wav / 3.m4a também funcionam

Formatos aceitos: mp3, wav, m4a, ogg, flac, aac, opus, webm

A duração de cada cena aumenta automaticamente para caber a narração
(a narração começa em "narracaoInicio" segundos, padrão 0.3).

Para usar outro nome, informe na cena do roteiro.json:
  "narracao": "meu-arquivo.mp3"
Para ignorar o áudio de uma cena:  "narracao": false
`;

const ROTEIRO_NOVO = (titulo) => ({
  titulo,
  resolucao: [320, 180],
  volumeBaloes: 0.4,
  paleta: 'nenhuma',
  cenas: [
    {
      fundo: 'floresta-dia', duracao: 5, titulo, subtitulo: 'Episódio 1',
      elementos: [
        { id: 'heroi', personagem: 'protagonista', x: -3 },
        { id: 'arvore', sprite: 'arvore', x: 4, z: -1.5 },
      ],
      acoes: [{ tipo: 'andar', alvo: 'heroi', para: 0, inicio: 1, duracao: 2 }],
    },
    {
      cenario: 'acampamento', duracao: 5, legenda: 'Escreva aqui a legenda da cena 2.',
      elementos: [
        { id: 'heroi', personagem: 'protagonista', x: -2 },
        { id: 'amiga', personagem: 'companheira', x: 2.4, virado: 'esquerda' },
      ],
      acoes: [{ tipo: 'falar', alvo: 'heroi', texto: 'Que noite fria...', inicio: 1 }],
    },
  ],
});

async function novo(nome) {
  if (!nome) throw new Error('Uso: npm run novo -- nome-do-projeto');
  const dir = path.join(RAIZ, 'projetos', nome);
  if (fs.existsSync(path.join(dir, 'roteiro.json'))) throw new Error(`Já existe: ${dir}`);
  for (const sub of [PASTA_NARRACAO, 'sfx', 'sprites', 'saida']) fs.mkdirSync(path.join(dir, sub), { recursive: true });
  const modelo = flags.modelo;
  if (modelo) {
    const arq = path.join(RAIZ, 'modelos', String(modelo), 'roteiro.json');
    if (!fs.existsSync(arq)) {
      const lista = fs.readdirSync(path.join(RAIZ, 'modelos')).filter((d) => fs.existsSync(path.join(RAIZ, 'modelos', d, 'roteiro.json')));
      throw new Error(`Modelo "${modelo}" não existe. Modelos: ${lista.join(', ')}`);
    }
    // Projetos novos: som dos balões mais baixo (narrador em destaque).
    let txt = fs.readFileSync(arq, 'utf8');
    if (!/"volumeBaloes"/.test(txt)) txt = txt.replace('{', '{\n  "volumeBaloes": 0.4,');
    fs.writeFileSync(path.join(dir, 'roteiro.json'), txt);
  } else {
    fs.writeFileSync(path.join(dir, 'roteiro.json'), JSON.stringify(ROTEIRO_NOVO(nome.replace(/[-_]/g, ' ').toUpperCase()), null, 2));
  }
  fs.writeFileSync(path.join(dir, PASTA_NARRACAO, 'LEIA-ME.txt'), LEIA_ME_NARRACAO);
  fs.writeFileSync(path.join(dir, 'sfx', 'LEIA-ME.txt'), 'Opcional: coloque aqui um arquivo com o nome de um efeito (ex.: moeda.wav, explosao.mp3)\npara substituir o efeito gerado automaticamente. Veja os nomes com: npm run lista\n');
  fs.writeFileSync(path.join(dir, 'sprites', 'LEIA-ME.txt'), 'Opcional: sprites PNG só deste projeto (fundo transparente).\nPara usar em todos os projetos, coloque em biblioteca/sprites/.\nUse no roteiro: { "sprite": "arquivo:meu-sprite.png", "quadros": 4, "fps": 8 }\nQuadros lado a lado na horizontal.\n');
  console.log(`✔ Projeto criado: ${dir}\n  1. Edite roteiro.json\n  2. Coloque as narrações em ${path.join(dir, PASTA_NARRACAO)} (01.mp3, 02.mp3...)\n  3. npm run rascunho -- ${nome}\n  4. npm run final -- ${nome}`);
}

async function previa(nome) {
  const cfg = carregarConfig();
  const dir = caminhoProjeto(nome);
  const porta = Number(flags.porta || 5173);
  const montar = async () => {
    const bruto = lerRoteiro(dir);
    const narr = await encontrarNarracoes(dir, bruto, cfg.ffmpeg);
    return resolverRoteiro(bruto, narr.mapa, { fps: 60 });
  };
  let atual = await montar();
  const recarregar = async () => { try { atual = await montar(); console.log('  roteiro recarregado (atualize a página)'); } catch (e) { console.error('  ', e.message); } };
  for (const arq of [path.join(dir, 'roteiro.json'), path.join(dir, 'personagens.json'), path.join(dir, 'cenarios.json'),
    path.join(PASTA_BIBLIOTECA, 'personagens.json'), path.join(PASTA_BIBLIOTECA, 'cenarios.json')]) {
    if (fs.existsSync(arq)) fs.watch(arq, recarregar);
  }
  const s = await iniciarServidor({ projetoDir: dir, porta, rotas: { '/api/roteiro': () => atual } });
  console.log(`\n▶ Prévia em tempo real (sem áudio): ${s.url}/motor/index.html?previa=1${flags.rascunho ? '&modo=rascunho' : ''}\n  Abra no Chrome/Edge. Ctrl+C para sair.`);
}

async function gpu() {
  const cfg = carregarConfig();
  console.log('\n▶ Diagnóstico');
  try {
    console.log(`  FFmpeg: ${verificarFfmpeg(cfg.ffmpeg)}`);
    const enc = detectarEncoder(cfg.ffmpeg, cfg.encoder);
    console.log(`  Codificador de vídeo: ${enc.nome} ${enc.gpu ? '✔ (placa de vídeo NVIDIA)' : '✘ (sem NVENC — vai usar a CPU)'}`);
  } catch (e) { console.log(`  ✘ ${e.message}`); }
  const s = await iniciarServidor();
  for (const janela of [false, true]) {
    try {
      const { browser, nome } = await abrirNavegador({ ...cfg, permitirRenderizacaoCPU: true }, { janela });
      const page = await browser.newPage();
      await page.goto(`${s.url}/motor/index.html`);
      await page.waitForFunction('window.motorPronto === true');
      const info = await page.evaluate(() => window.motor.iniciar({ resolucao: [64, 36], cenas: [], efeitos: {} }, {}));
      await browser.close();
      const ok = !ehSoftware(info.gpu);
      console.log(`  Navegador (${janela ? 'com janela' : 'invisível'}): ${nome}\n  WebGL: ${info.gpu.renderizador} ${ok ? '✔ GPU' : '✘ CPU (software)'}`);
      if (ok) break;
    } catch (e) { console.log(`  ✘ Navegador ${janela ? 'com janela' : 'invisível'}: ${e.message.split('\n')[0]}`); break; }
  }
  await s.fechar();
}

// Monta os textos da narração (campo "narracaoTexto" de cada cena) para colar no ElevenLabs.
async function verificarNarracao(nome) {
  const cfg = carregarConfig();
  const dir = caminhoProjeto(nome);
  const r = lerRoteiro(dir);
  const n = await encontrarNarracoes(dir, r, cfg.ffmpeg);
  if (!n.mapa.size) throw new Error(`Nenhum áudio de narração em ${n.pasta} (nome esperado: narracao-completa.mp3).`);
  console.log(n.unico ? `\n▶ ${n.unico} → ${n.trechos} trechos (${n.metodo === 'fala' ? 'alinhado pelo que é falado' : 'cortado pelas pausas'})` : `\n▶ Narração por cena (${n.mapa.size} arquivos)`);
  const linhas = [];
  for (const [i, v] of [...n.mapa.entries()].sort((a, b) => a[0] - b[0])) {
    const txt = r.cenas[i].narracaoTexto || '';
    const l = `  Cena ${String(i + 1).padStart(2)}  ${v.arquivo.replace(/^.*\[/, '[').padEnd(18)} ${v.duracao.toFixed(1).padStart(5)}s  ${txt.slice(0, 70)}`;
    console.log(l); linhas.push(l);
  }
  fs.writeFileSync(path.join(n.pasta, 'CORTES.txt'), linhas.join('\n') + '\n');
  console.log('\n  Confira se cada fala caiu na cena certa. (Também salvo em narracao/CORTES.txt)');
}

function narracao(nome) {
  if (flags.verificar) return verificarNarracao(nome);
  const dir = caminhoProjeto(nome);
  const r = lerRoteiro(dir);
  const falas = (r.cenas || []).map((c, i) => ({ n: i + 1, texto: c.narracaoTexto })).filter((f) => f.texto);
  if (!falas.length) throw new Error('Nenhuma cena tem "narracaoTexto" no roteiro.');
  const pasta = path.join(dir, PASTA_NARRACAO);
  fs.mkdirSync(pasta, { recursive: true });
  const pausa = '\n\n';   // um parágrafo por cena (a pausa natural da voz basta para o corte; sem <break>, a fala flui melhor)
  fs.writeFileSync(path.join(pasta, 'TEXTO-COMPLETO.txt'), falas.map((f) => f.texto).join(pausa) + '\n');
  const narrador = r.narrador ? ` (narrado por ${r.narrador})` : '';
  const md = [`# Narração — ${r.titulo || nome}${narrador}`, '',
    'Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como',
    '**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).', '',
    'O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)',
    'e escolhe as que combinam com cada cena; confira com `npm run narracao -- ' + nome + ' --verificar`.', '',
    `São **${falas.length} falas** (uma por cena com narração):`, '', '| Cena | Fala |', '|---|---|',
    ...falas.map((f) => `| ${f.n} | ${f.texto.replace(/\|/g, '/')} |`), '',
    'Depois rode `npm run rascunho -- ' + nome + '`: o terminal mostra em quantos trechos o áudio foi cortado.'].join('\n');
  fs.writeFileSync(path.join(pasta, 'TEXTOS-PARA-ELEVENLABS.md'), md + '\n');
  console.log(`✔ ${falas.length} falas → ${path.join(pasta, 'TEXTO-COMPLETO.txt')}\n  Gere um único áudio e salve como ${path.join(pasta, 'narracao-completa.mp3')}`);
}

function sfx() {
  const dir = path.join(PASTA_BIBLIOTECA, 'sfx', '_gerados');
  fs.mkdirSync(dir, { recursive: true });
  for (const n of NOMES_SONS) escreverWavMono(path.join(dir, `${n}.wav`), gerarSom(n));
  console.log(`✔ ${NOMES_SONS.length} efeitos exportados para ${dir}\n  Para trocar um efeito, coloque o seu arquivo com o mesmo nome em biblioteca/sfx/ (ex.: biblioteca/sfx/moeda.wav).`);
}

async function sprites() {
  const cfg = carregarConfig();
  const s = await iniciarServidor();
  const { browser } = await abrirNavegador({ ...cfg, permitirRenderizacaoCPU: true });
  const page = await browser.newPage();
  await page.goto(`${s.url}/motor/folha-sprites.html`);
  await page.waitForFunction('window.pronto');
  const arq = path.join(RAIZ, 'sprites-disponiveis.png');
  await (await page.$('canvas')).screenshot({ path: arq });
  await browser.close(); await s.fechar();
  console.log(`✔ ${arq}`);
}

async function lista() {
  const { NOMES_FUNDOS } = await import('../motor/fundos.js').catch(() => ({ NOMES_FUNDOS: null }));
  const fundos = NOMES_FUNDOS || ['floresta-dia', 'floresta-noite', 'por-do-sol', 'caverna', 'deserto', 'espaco', 'cidade-noite', 'neve'];
  console.log(`
FUNDOS:      ${fundos.join(', ')}
SPRITES:     heroi, amiga, velho, guarda, crianca, pessoa (com "cores"), mago, slime, morcego,
             moeda, coracao, estrela, gema, bau, chave, arvore, pinheiro, pinheiro-neve, arbusto,
             pedra, casa, casa-noite, nuvem, cacto, poste, placa, fogueira, tocha
             estilo RPG: menina-capa, robo-semaforo, pombo-fofoqueiro, lixeira-timida, cao-guarda,
             fantasma-metro, coruja-banca, cone-agressivo, bueiro-olhos
             (menina-capa e robo-semaforo são detalhados: 28x44, andar de lado e correr)
             antigos: menina-capa-antigo, robo-semaforo-antigo
             moradores: policial, prefeito, aluno, aluna, professora, padeiro, caixa
             cidade: escola, delegacia, padaria, mercado, farmacia, carro-policia, banco-praca, ponto-onibus, hidrante
             casa (diorama): casa-sala, casa-cozinha, casa-quarto, casa-banheiro (+ -noite); mae, mae-avental, menino-topete
             (ou "arquivo:meu.png" de sprites/ do projeto ou de biblioteca/sprites/)
AÇÕES:       ${Object.keys(DURACAO_PADRAO).join(', ')}
CLIMAS:      chuva, neve, vagalumes, brasas, poeira, folhas, calor, neblina, polen, nenhum
VISTAS:      diorama (padrão: rua desenhada 2:1; com "comodo" = interior), lateral, 3d (guardado), avenida (perspectiva)
TRANSIÇÕES:  dither, fade, iris, pixelizar, corte
PALETAS:     nenhuma (padrão), posterizar, retro32, verde4, sepia, noir, quente, fria
EMOÇÕES:     !, ?, coracao, ..., zzz
EFEITOS:     ${NOMES_SONS.filter((n) => !AMBIENTES.includes(n)).join(', ')}
AMBIENTES:   ${AMBIENTES.join(', ')}
`);
  const proj = pos[0] ? caminhoProjeto(pos[0]) : null;
  const lib = carregarBiblioteca(proj);
  const fmtP = (k, p) => `  ${k.padEnd(14)} ${p.sprite}${p.voz ? `  (voz ${p.voz})` : ''}`;
  const fmtC = (k, c) => `  ${k.padEnd(14)} ${c.fundo || (c.vista ? 'vista ' + c.vista : '?')}${c.clima ? ` + ${c.clima}` : ''}: ${(c.elementos || []).map((e) => e.id).join(', ')}`;
  console.log(`BIBLIOTECA (${PASTA_BIBLIOTECA})${proj ? ` + projeto ${pos[0]}` : ''}
PERSONAGENS ("personagem": "nome"):
${Object.entries(lib.personagens).map(([k, p]) => fmtP(k, p)).join('\n') || '  (nenhum)'}
CENÁRIOS ("cenario": "nome"):
${Object.entries(lib.cenarios).map(([k, c]) => fmtC(k, c)).join('\n') || '  (nenhum)'}
SPRITES PNG: ${listarSpritesBiblioteca().join(', ') || '(nenhum em biblioteca/sprites/)'}
`);
}

const AJUDA = `
Gerador de vídeos pixel art (Three.js + GPU)

  npm run novo -- meu-video         cria projetos/meu-video  (--modelo diorama: começa de um modelo; veja FORMAS-DE-VIDEO.md)
  npm run rascunho -- meu-video     rascunho rápido (baixa resolução, só narração) + storyboard.png
  npm run final -- meu-video        versão final 1080p com efeitos visuais e sonoros
  npm run previa -- meu-video       prévia em tempo real no navegador
  npm run gpu                       verifica GPU (WebGL) e NVENC
  npm run narracao -- meu-video     monta o texto da narração para colar no ElevenLabs
  npm run sfx                       exporta os efeitos sonoros para sfx/_gerados
  npm run sprites                   gera sprites-disponiveis.png
  npm run fotos -- meu-video        imagens paradas de cada cena (sem vídeo) em saida/fotos/
  npm run vitrine                   imagens das principais mudanças (projeto "vitrine")
  npm run catalogo                  lista todos os assets em biblioteca/CATALOGO.md
  npm run conferir -- meu-video     confere sem renderizar: gente coberta, continuidade, elenco, limites
  npm run lista [-- projeto]        lista fundos, sprites, sons e a biblioteca (personagens, cenários)

Opções: --fps 60   --escala 4   --crt   --formato normal|vertical|ambos
  (o rascunho sai no formato normal; o final gera normal + Shorts. Ex.: npm run final -- meu-video --formato normal)
`;

try {
  const opc = {};
  if (flags.fps) opc.fps = Number(flags.fps);
  if (flags.escala) opc.escala = Number(flags.escala);
  if (flags.crt) opc.crt = true;
  switch (cmd) {
    case 'novo': await novo(pos[0]); break;
    case 'rascunho': {   // padrão: só o formato normal (16:9)
      const f = flags.formato || 'normal';
      if (f !== 'vertical') await renderizar(pos[0], 'rascunho', { ...opc, formato: 'normal' });
      if (f === 'vertical' || f === 'ambos') await renderizar(pos[0], 'rascunho', { ...opc, formato: 'vertical' });
      break;
    }
    case 'final': {      // padrão: as duas versões — normal (vídeo longo) e vertical (Shorts)
      const f = flags.formato || 'ambos';
      const feitos = [];
      if (f !== 'vertical') feitos.push(await renderizar(pos[0], 'final', { ...opc, formato: 'normal' }));
      if (f !== 'normal') feitos.push(await renderizar(pos[0], 'final', { ...opc, formato: 'vertical' }));
      if (feitos.length > 1) console.log(`\n✔ Versões finais:\n  • Vídeo longo (16:9): ${feitos[0]}\n  • Shorts (9:16):     ${feitos[1]}`);
      break;
    }
    case 'previa': await previa(pos[0]); break;
    case 'gpu': await gpu(); break;
    case 'narracao': await narracao(pos[0]); break;
    case 'sfx': sfx(); break;
    case 'sprites': await sprites(); break;
    case 'fotos': if (!pos[0]) throw new Error('Uso: npm run fotos -- nome-do-projeto'); await gerarFotos(pos[0], { escala: Number(flags.escala) || 4 }); break;
    case 'vitrine': await gerarFotos('vitrine', { escala: Number(flags.escala) || 4 }); break;
    case 'catalogo': { const c = await gerarCatalogo(); console.log(`✔ ${c.arq}\n  ${c.sprites} sprites, ${c.personagens} personagens, ${c.cenarios} cenários`); break; }
    case 'conferir': { if (!pos[0]) throw new Error('Uso: npm run conferir -- nome-do-projeto'); const { conferir } = await import('./conferir.js'); await conferir(pos[0]); break; }
    case 'lista': await lista(); break;
    default: console.log(AJUDA);
  }
} catch (e) {
  console.error(`\n✘ ${e.message}`);
  process.exit(1);
}
