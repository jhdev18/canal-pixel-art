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
  fs.writeFileSync(path.join(dir, 'roteiro.json'), JSON.stringify(ROTEIRO_NOVO(nome.replace(/[-_]/g, ' ').toUpperCase()), null, 2));
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
             (ou "arquivo:meu.png" de sprites/ do projeto ou de biblioteca/sprites/)
AÇÕES:       ${Object.keys(DURACAO_PADRAO).join(', ')}
CLIMAS:      chuva, neve, vagalumes, brasas, poeira, folhas, nenhum
TRANSIÇÕES:  dither, fade, iris, pixelizar, corte
PALETAS:     nenhuma (padrão), posterizar, retro32, verde4, sepia, noir, quente, fria
EMOÇÕES:     !, ?, coracao, ..., zzz
EFEITOS:     ${NOMES_SONS.filter((n) => !AMBIENTES.includes(n)).join(', ')}
AMBIENTES:   ${AMBIENTES.join(', ')}
`);
  const proj = pos[0] ? caminhoProjeto(pos[0]) : null;
  const lib = carregarBiblioteca(proj);
  const fmtP = (k, p) => `  ${k.padEnd(14)} ${p.sprite}${p.voz ? `  (voz ${p.voz})` : ''}`;
  const fmtC = (k, c) => `  ${k.padEnd(14)} ${c.fundo || '?'}${c.clima ? ` + ${c.clima}` : ''}: ${(c.elementos || []).map((e) => e.id).join(', ')}`;
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

  npm run novo -- meu-video         cria projetos/meu-video
  npm run rascunho -- meu-video     rascunho rápido (baixa resolução, só narração) + storyboard.png
  npm run final -- meu-video        versão final 1080p com efeitos visuais e sonoros
  npm run previa -- meu-video       prévia em tempo real no navegador
  npm run gpu                       verifica GPU (WebGL) e NVENC
  npm run sfx                       exporta os efeitos sonoros para sfx/_gerados
  npm run sprites                   gera sprites-disponiveis.png
  npm run lista [-- projeto]        lista fundos, sprites, sons e a biblioteca (personagens, cenários)

Opções: --fps 60   --escala 4   --crt   (ex.: npm run final -- meu-video --fps 60)
`;

try {
  const opc = {};
  if (flags.fps) opc.fps = Number(flags.fps);
  if (flags.escala) opc.escala = Number(flags.escala);
  if (flags.crt) opc.crt = true;
  switch (cmd) {
    case 'novo': await novo(pos[0]); break;
    case 'rascunho': await renderizar(pos[0], 'rascunho', opc); break;
    case 'final': await renderizar(pos[0], 'final', opc); break;
    case 'previa': await previa(pos[0]); break;
    case 'gpu': await gpu(); break;
    case 'sfx': sfx(); break;
    case 'sprites': await sprites(); break;
    case 'lista': await lista(); break;
    default: console.log(AJUDA);
  }
} catch (e) {
  console.error(`\n✘ ${e.message}`);
  process.exit(1);
}
