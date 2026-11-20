// Integração com FFmpeg: detecção do NVENC (GTX 1050 Ti), codificação e decodificação de áudio.
import { spawn, spawnSync } from 'node:child_process';

export function verificarFfmpeg(ff) {
  const r = spawnSync(ff, ['-hide_banner', '-version'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    throw new Error(
      `FFmpeg não encontrado ("${ff}").\n` +
      '  Windows: winget install Gyan.FFmpeg   (depois feche e abra o terminal)\n' +
      '  ou defina "ffmpeg" no config.json com o caminho completo do ffmpeg.exe');
  }
  return r.stdout.split('\n')[0];
}

function testar(ff, args) {
  const r = spawnSync(ff, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=320x180:d=0.2', ...args, '-f', 'null', '-'], { encoding: 'utf8' });
  return { ok: r.status === 0, erro: (r.stderr || '').trim() };
}

// Retorna { nome, gpu, args(modo, qualidade, fps) }
export function detectarEncoder(ff, preferencia = 'auto') {
  if (preferencia !== 'cpu') {
    // NVENC moderno (presets p1..p7, driver NVIDIA recente)
    let t = testar(ff, ['-c:v', 'h264_nvenc', '-preset', 'p5']);
    if (t.ok) {
      return {
        nome: 'h264_nvenc', gpu: true,
        args: (modo, q, fps) => modo === 'final'
          ? ['-c:v', 'h264_nvenc', '-preset', 'p6', '-tune', 'hq', '-rc', 'vbr', '-cq', String(q), '-b:v', '0', '-maxrate', '40M', '-bufsize', '80M', '-profile:v', 'high', '-g', String(fps * 2)]
          : ['-c:v', 'h264_nvenc', '-preset', 'p1', '-rc', 'vbr', '-cq', '28', '-b:v', '0'],
      };
    }
    // NVENC antigo (FFmpeg/driver mais velhos)
    const t2 = testar(ff, ['-c:v', 'h264_nvenc', '-preset', 'slow']);
    if (t2.ok) {
      return {
        nome: 'h264_nvenc (legado)', gpu: true,
        args: (modo, q, fps) => modo === 'final'
          ? ['-c:v', 'h264_nvenc', '-preset', 'slow', '-rc', 'vbr_hq', '-cq', String(q), '-b:v', '0', '-profile:v', 'high', '-g', String(fps * 2)]
          : ['-c:v', 'h264_nvenc', '-preset', 'fast', '-cq', '28'],
      };
    }
    if (preferencia === 'nvenc') throw new Error(`NVENC indisponível:\n${t.erro}\nAtualize o driver NVIDIA ou use "encoder": "auto" no config.json.`);
  }
  return {
    nome: 'libx264 (CPU)', gpu: false,
    args: (modo, q) => modo === 'final'
      ? ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(Math.max(10, q - 2)), '-tune', 'animation', '-profile:v', 'high']
      : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26'],
  };
}

// Processo de codificação que recebe quadros RGBA crus pelo stdin.
export function abrirCodificador(ff, { W, H, fps, escala, grade = escala, saida, encoder, modo, qualidade, crt }) {
  const OW = Math.round((W * escala) / 2) * 2, OH = Math.round((H * escala) / 2) * 2;
  const filtros = ['vflip'];
  if (escala !== 1) filtros.push(`scale=${OW}:${OH}:flags=neighbor`);
  if (crt && grade >= 3) filtros.push(`drawgrid=w=iw:h=${grade}:t=${Math.max(1, Math.floor(grade / 3))}:c=black@0.28`);
  filtros.push('format=yuv420p');
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-framerate', String(fps), '-i', '-',
    '-vf', filtros.join(','),
    ...encoder.args(modo, qualidade, fps),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-movflags', '+faststart', saida,
  ];
  const proc = spawn(ff, args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let erro = '';
  proc.stderr.on('data', (d) => { erro += d; });
  const fim = new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg falhou (${code}):\n${erro}`))));
  });
  return {
    largura: OW, altura: OH,
    async escrever(buf) {
      if (!proc.stdin.write(buf)) await new Promise((r) => proc.stdin.once('drain', r));
    },
    async fechar() { proc.stdin.end(); await fim; },
  };
}

// Decodifica qualquer áudio para Float32 mono 48 kHz.
export function decodificarAudio(ff, arquivo) {
  return new Promise((resolve, reject) => {
    const p = spawn(ff, ['-hide_banner', '-loglevel', 'error', '-i', arquivo, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const partes = []; let erro = '';
    p.stdout.on('data', (d) => partes.push(d));
    p.stderr.on('data', (d) => { erro += d; });
    p.on('error', reject);
    p.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Não consegui ler o áudio ${arquivo}:\n${erro}`));
      const b = Buffer.concat(partes);
      const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.length - (b.length % 4));
      resolve(new Float32Array(ab));
    });
  });
}

export function executar(ff, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ff, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: ['ignore', 'ignore', 'pipe'] });
    let erro = '';
    p.stderr.on('data', (d) => { erro += d; });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg falhou:\n${erro}`))));
  });
}
