// Abre o Chrome/Edge com WebGL acelerado pela GPU (ANGLE/D3D11 no Windows).
import { chromium } from 'playwright';

const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render|microsoft basic|software/i;

export function ehSoftware(gpu) { return SOFTWARE.test(`${gpu?.renderizador} ${gpu?.fabricante}`); }

export async function abrirNavegador(cfg, { janela = false } = {}) {
  const args = [
    '--ignore-gpu-blocklist', '--enable-gpu', '--enable-gpu-rasterization', '--enable-zero-copy',
    '--force_high_performance_gpu', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
  ];
  if (process.platform === 'win32') args.push('--use-angle=d3d11');
  if (cfg.permitirRenderizacaoCPU) args.push('--enable-unsafe-swiftshader');
  const headless = !(cfg.mostrarJanela || janela);
  if (!headless) args.push('--window-size=1000,700');

  const tentativas = [];
  if (cfg.caminhoNavegador) tentativas.push({ executablePath: cfg.caminhoNavegador });
  else {
    const canais = cfg.navegador === 'auto' ? ['chrome', 'msedge', 'chromium'] : [cfg.navegador];
    for (const c of canais) tentativas.push(c === 'chromium' ? { channel: 'chromium' } : { channel: c });
    tentativas.push({});
  }
  const erros = [];
  for (const t of tentativas) {
    try {
      const browser = await chromium.launch({ ...t, headless, args });
      return { browser, nome: t.channel || t.executablePath || 'chromium (playwright)' };
    } catch (e) {
      erros.push(`${t.channel || t.executablePath || 'padrão'}: ${e.message.split('\n')[0]}`);
    }
  }
  throw new Error('Não consegui abrir nenhum navegador. Instale o Google Chrome ou rode: npx playwright install chromium\n' + erros.join('\n'));
}
