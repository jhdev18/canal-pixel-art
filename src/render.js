// Orquestra: roteiro -> navegador (Three.js na GPU) -> FFmpeg (NVENC) -> áudio -> MP4.
import fs from 'node:fs';
import path from 'node:path';
import { carregarConfig } from './config.js';
import { verificarFfmpeg, detectarEncoder, abrirCodificador, decodificarAudio, executar } from './ffmpeg.js';
import { abrirNavegador, ehSoftware } from './navegador.js';
import { iniciarServidor } from './servidor.js';
import { caminhoProjeto, lerRoteiro, encontrarNarracoes, sfxPersonalizado } from './projeto.js';
import { resolverRoteiro, eventosSonoros, DURACAO_PADRAO } from '../motor/compartilhado/linhaDoTempo.js';
import { gerarSom } from './audio/sintetizador.js';
import { mixar, escreverWav } from './audio/mixer.js';

const ACOES = new Set(Object.keys(DURACAO_PADRAO));

function validar(roteiro) {
  const avisos = [];
  for (const c of roteiro.cenas) {
    const ids = new Set(c.elementos.map((e) => e.id));
    for (const a of c.acoes) {
      if (!ACOES.has(a.tipo)) avisos.push(`Cena ${c.numero}: ação desconhecida "${a.tipo}".`);
      if (a.alvo && !ids.has(a.alvo)) avisos.push(`Cena ${c.numero}: ação "${a.tipo}" aponta para "${a.alvo}", que não existe nos elementos.`);
    }
    if (c.seguir && !ids.has(c.seguir)) avisos.push(`Cena ${c.numero}: "seguir" aponta para "${c.seguir}", que não existe.`);
  }
  return avisos;
}

const fmt = (s) => `${Math.floor(s / 60)}m${String(Math.round(s % 60)).padStart(2, '0')}s`;

function barra(i, total, inicio) {
  const p = i / total, el = (Date.now() - inicio) / 1000;
  const fps = i / Math.max(el, 0.001), resto = (total - i) / Math.max(fps, 0.001);
  const n = 28, cheio = Math.round(p * n);
  process.stdout.write(`\r  [${'█'.repeat(cheio)}${'░'.repeat(n - cheio)}] ${(p * 100).toFixed(0).padStart(3)}%  ${i}/${total} quadros  ${fps.toFixed(1)} q/s  restam ${fmt(resto)}   `);
}

export async function abrirMotor(cfg, servidor, roteiro, modo, escala = 0) {
  let tentativaJanela = false;
  for (;;) {
    const { browser, nome } = await abrirNavegador(cfg, { janela: tentativaJanela });
    const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
    page.on('pageerror', (e) => console.error('\n  [motor] ERRO:', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.error('\n  [motor]', m.text()); });
    await page.goto(`${servidor.url}/motor/index.html`);
    await page.waitForFunction('window.motorPronto === true', null, { timeout: 30000 });
    const info = await page.evaluate(([r, m, e]) => window.motor.iniciar(r, { modo: m, escala: e }), [roteiro, modo, escala]);
    if (ehSoftware(info.gpu) && !cfg.permitirRenderizacaoCPU) {
      await browser.close();
      if (!tentativaJanela && !cfg.mostrarJanela) { tentativaJanela = true; console.log('  GPU não detectada no modo invisível; tentando com janela...'); continue; }
      throw new Error(
        `O navegador está renderizando na CPU (${info.gpu.renderizador}).\n` +
        '  • Atualize o driver da NVIDIA (GeForce Experience / nvidia.com).\n' +
        '  • Notebook: Configurações do Windows > Sistema > Tela > Gráficos > adicione o Chrome/Edge como "Alto desempenho".\n' +
        '  • Confira em chrome://gpu se "WebGL: Hardware accelerated".\n' +
        '  • Para renderizar mesmo assim (lento): "permitirRenderizacaoCPU": true no config.json.');
    }
    return { browser, page, info, nomeNavegador: nome };
  }
}

async function carregarSom(dir, ff, nome, cache, avisos) {
  if (cache.has(nome)) return cache.get(nome);
  let dados = null;
  const arq = sfxPersonalizado(dir, nome);
  if (arq) dados = await decodificarAudio(ff, arq);
  else dados = gerarSom(nome);
  if (!dados) avisos.add(`Som desconhecido "${nome}" (coloque sfx/${nome}.wav ou .mp3 para usar o seu).`);
  cache.set(nome, dados);
  return dados;
}

// Versão vertical (Shorts): troca a resolução e aplica os ajustes "vertical" de cada cena
// (ex.: enquadramento mais fechado), mantendo a mesma história e a mesma narração.
function paraVertical(roteiro) {
  const r = JSON.parse(JSON.stringify(roteiro));
  const [w, h] = r.resolucao || [320, 180];
  r.resolucao = r.resolucaoVertical || (w > h ? [h, w] : [w, h]);
  for (const c of r.cenas || []) {
    const v = c.vertical || {};
    for (const [k, val] of Object.entries(v)) {
      if (val && typeof val === 'object' && !Array.isArray(val) && c[k] && typeof c[k] === 'object' && !Array.isArray(c[k])) c[k] = { ...c[k], ...val };
      else c[k] = val;
    }
    delete c.vertical;
    // ação com "vertical": { ... } usa esses campos só no Shorts (ex.: corte de zoom com outro "y")
    c.acoes = (c.acoes || []).map(({ vertical: va, ...a }) => (va ? { ...a, ...va } : a));
  }
  return r;
}

function destinoLivre(arq) {
  if (!fs.existsSync(arq)) return arq;
  try { fs.unlinkSync(arq); return arq; } catch (e) {
    if (!['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
    const h = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const novo = arq.replace(/\.mp4$/, `-${h}.mp4`);
    console.log(`  ⚠ ${path.basename(arq)} está aberto em outro programa (player/OneDrive) e não pode ser substituído.\n    O vídeo NOVO vai ser salvo como: ${path.basename(novo)}  (feche o player para a próxima vez sobrescrever)`);
    return novo;
  }
}
function renomearComTentativas(de, para) {
  for (let i = 0; ; i++) {
    try { fs.renameSync(de, para); return; } catch (e) {
      if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400);   // espera 0,4 s e tenta de novo (antivírus/OneDrive soltando o arquivo)
    }
  }
}

export async function renderizar(nome, modo, opc = {}) {
  const t0 = Date.now();
  const cfg = carregarConfig();
  const ff = cfg.ffmpeg;
  const ffVersao = verificarFfmpeg(ff);
  const dir = caminhoProjeto(nome);
  const vertical = opc.formato === 'vertical';
  const bruto = vertical ? paraVertical(lerRoteiro(dir)) : lerRoteiro(dir);
  const sufixo = vertical ? '-shorts' : '';
  const m = { ...cfg[modo], ...opc };
  const fps = Number(m.fps);
  const lado = Math.min(...(bruto.resolucao || [320, 180]));
  m.escala = Number(m.escala) || Math.max(1, Math.floor((m.resolucao || 1080) / lado));

  console.log(`\n▶ ${modo === 'final' ? 'VERSÃO FINAL' : 'RASCUNHO'} ${vertical ? '(VERTICAL / SHORTS)' : '(NORMAL)'} — ${bruto.titulo || nome}`);
  const narr = await encontrarNarracoes(dir, bruto, ff);
  const roteiro = resolverRoteiro(bruto, narr.mapa, { fps });
  const avisos = validar(roteiro);

  console.log(`  Cenas: ${roteiro.cenas.length}  •  Duração: ${roteiro.duracaoTotal.toFixed(1)}s  •  ${roteiro.resolucao.join('x')} interno → ${roteiro.resolucao.map((v) => v * m.escala).join('x')}  •  ${fps} fps`);
  const semNarr = roteiro.cenas.filter((c) => !c.narracao).map((c) => c.numero);
  console.log(`  Narração: ${narr.mapa.size}/${roteiro.cenas.length} cenas${semNarr.length ? `  (sem áudio: ${semNarr.join(', ')})` : ''}  — pasta: ${narr.pasta}`);
  if (narr.unico) console.log(`  Narração única: ${narr.unico} cortada em ${narr.trechos} trechos (um por cena)`);
  if (narr.ignorados.length) avisos.push(`Arquivos de narração sem cena correspondente: ${narr.ignorados.join(', ')}`);

  const encoder = detectarEncoder(ff, cfg.encoder);
  console.log(`  FFmpeg: ${ffVersao.split(' ').slice(0, 3).join(' ')}  •  Codificador: ${encoder.nome}`);

  const saidaDir = path.join(dir, 'saida');
  fs.mkdirSync(saidaDir, { recursive: true });
  const videoTmp = path.join(saidaDir, `.${modo}${sufixo}-video.mp4`);
  // versão COM MÚSICA (npm run final-musica): sai como final-musica.mp4 / final-shorts-musica.mp4; o final.mp4 padrão (sem música) não muda.
  // Se o final.mp4 já existe, reaproveita o vídeo dele (só refaz o áudio, em segundos); --renderizar força renderizar de novo.
  const musica = opc.musica || null;
  let saidaFinal = path.join(saidaDir, `${modo}${sufixo}${musica ? '-musica' : ''}.mp4`);
  const videoPronto = path.join(saidaDir, `${modo}${sufixo}.mp4`);
  const reaproveitar = musica && !opc.renderizarDeNovo && fs.existsSync(videoPronto) && fs.statSync(videoPronto).mtimeMs >= fs.statSync(path.join(dir, 'roteiro.json')).mtimeMs;
  if (musica) console.log(`  Música: ${path.basename(musica.arquivo)}  •  volume ${musica.volume}${reaproveitar ? `  •  reaproveitando o vídeo de ${path.basename(videoPronto)} (só o áudio muda)` : ''}`);
  if (musica && !reaproveitar && fs.existsSync(videoPronto)) console.log('  (o roteiro mudou depois do último final.mp4: renderizando o vídeo de novo)');
  if (vertical && roteiro.duracaoTotal > 180) avisos.push(`A versão Shorts tem ${roteiro.duracaoTotal.toFixed(0)}s; o YouTube aceita Shorts de até 3 minutos.`);

  if (reaproveitar) { for (const a of avisos) console.log(`  ⚠ ${a}`); } else {
  const servidor = await iniciarServidor({ projetoDir: dir });
  let motor;
  try {
    motor = await abrirMotor(cfg, servidor, roteiro, modo, m.escala);
    console.log(`  Navegador: ${motor.nomeNavegador}  •  GPU: ${motor.info.gpu.renderizador}`);
    avisos.push(...motor.info.avisos);
    for (const a of avisos) console.log(`  ⚠ ${a}`);

    const [W, H] = roteiro.resolucao;
    const total = Math.round(roteiro.duracaoTotal * fps);
    // Com monstros 3D o motor já entrega o quadro ampliado (HD); o FFmpeg não amplia de novo.
    const hd = motor.info.escalaSaida || 0;
    if (hd) console.log(`  Monstros 3D: quadro em alta resolução (${W * hd}x${H * hd}) — a renderização fica mais lenta`);
    const cod = hd
      ? abrirCodificador(ff, { W: W * hd, H: H * hd, fps, escala: 1, grade: hd, saida: videoTmp, encoder, modo, qualidade: m.qualidade ?? 18, crt: modo === 'final' && m.crt })
      : abrirCodificador(ff, { W, H, fps, escala: m.escala, saida: videoTmp, encoder, modo, qualidade: m.qualidade ?? 18, crt: modo === 'final' && m.crt });
    const inicio = Date.now();
    const LOTE = hd ? 1 : 4;
    let pendente = Promise.resolve();
    for (let i = 0; i < total; i += LOTE) {
      const n = Math.min(LOTE, total - i);
      const quadros = await motor.page.evaluate(([a, b]) => window.motor.quadros(a, b), [i, n]);
      await pendente;
      pendente = (async () => { for (const q of quadros) await cod.escrever(Buffer.from(q, 'base64')); })();
      if ((i / LOTE) % 5 === 0 || i + n >= total) barra(i + n, total, inicio);
    }
    await pendente;
    await cod.fechar();
    const tVideo = (Date.now() - inicio) / 1000;
    console.log(`\n  Vídeo: ${cod.largura}x${cod.altura} em ${fmt(tVideo)} (${(total / tVideo).toFixed(1)} q/s)`);

    if (modo === 'rascunho') {
      const png = await motor.page.evaluate(() => window.motor.storyboard());
      fs.writeFileSync(path.join(saidaDir, `storyboard${sufixo}.png`), Buffer.from(png.split(',')[1], 'base64'));
    }
  } finally {
    await motor?.browser.close().catch(() => {});
    await servidor.fechar();
  }
  }

  // ---------- Áudio ----------
  const narracoes = roteiro.cenas.filter((c) => c.narracao).map((c) => ({
    dados: narr.mapa.get(c.indice).dados, inicio: c.inicio + c.narracaoInicio, volume: c.narracaoVolume ?? 1,
  }));
  let eventos = [], ambientes = [];
  if (modo === 'final') {
    const sons = eventosSonoros(roteiro);
    const cache = new Map(), faltando = new Set();
    for (const e of sons.eventos) { const d = await carregarSom(dir, ff, e.som, cache, faltando); if (d) eventos.push({ ...e, dados: d }); }
    for (const a of sons.ambientes) {
      if (musica && /^trilha-/.test(a.som)) continue;   // com música: a música do usuário entra no lugar da trilha gerada
      const d = await carregarSom(dir, ff, a.som, cache, faltando); if (d) ambientes.push({ ...a, dados: d });
    }
    for (const f of faltando) console.log(`  ⚠ ${f}`);
    console.log(`  Efeitos sonoros: ${eventos.length} eventos, ${ambientes.length} trechos de ambiente`);
  }

  // No Windows, se o vídeo antigo estiver aberto (player, OneDrive sincronizando), ele não pode ser substituído (EPERM/EBUSY).
  // Em vez de falhar, salva com outro nome e avisa — assim ninguém assiste ao vídeo velho achando que é o novo.
  saidaFinal = destinoLivre(saidaFinal);
  const fonteVideo = reaproveitar ? videoPronto : videoTmp;
  const musicaMix = musica ? { dados: await decodificarAudio(ff, musica.arquivo), volume: musica.volume, abaixar: musica.abaixar } : null;
  if (!narracoes.length && !eventos.length && !ambientes.length && !musicaMix) {
    renomearComTentativas(videoTmp, saidaFinal);
  } else {
    const { L, R } = mixar({ duracao: roteiro.duracaoTotal, narracoes, eventos, ambientes, musica: musicaMix, cfg: cfg.audio });
    const wav = path.join(saidaDir, `${modo}${sufixo}${musica ? '-musica' : ''}-audio.wav`);
    escreverWav(wav, L, R);
    const af = modo === 'final' && cfg.audio.normalizar ? ['-af', `loudnorm=I=${cfg.audio.lufs}:TP=-1.5:LRA=11`] : [];
    await executar(ff, ['-i', fonteVideo, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...af, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', saidaFinal]);
    if (!reaproveitar) fs.unlinkSync(videoTmp);
  }

  console.log(`\n✔ Pronto em ${fmt((Date.now() - t0) / 1000)}: ${saidaFinal}`);
  if (modo === 'rascunho') console.log(`  Storyboard: ${path.join(saidaDir, `storyboard${sufixo}.png`)}\n  Gostou? Gere a versão final (normal + Shorts): npm run final -- ${nome}`);
  return saidaFinal;
}
