// Lógica de tempo compartilhada entre o motor (navegador) e o Node (áudio).
// Tudo aqui é função pura do tempo: qualquer quadro pode ser calculado isoladamente.

import { clamp, lerp, easeInOut, easeOutBack, EASINGS, ruido1, PIXELS_POR_UNIDADE } from './util.js';

export const DURACAO_PADRAO = {
  andar: 1.5, correr: 1, mover: 1.5, pular: 0.6, virar: 0, falar: null, coletar: 0.6,
  aparecer: 0.4, sumir: 0.4, explosao: 0.9, tremer: 0.4, flash: 0.25, emocao: 1.2,
  piscar: 0.8, camera: 1.5, magia: 1, som: 0,
};

export const TRANSICAO_DURACAO = 0.45;
const NARRACAO_FOLGA = 0.6;

function duracaoFala(texto) {
  return 1.2 + texto.length * 0.05;
}

// Normaliza o roteiro e calcula início/duração de cada cena.
// narracoes: Map<indiceCena, {arquivo, duracao}>
export function resolverRoteiro(roteiro, narracoes = new Map(), opcoes = {}) {
  const res = roteiro.resolucao || [320, 180];
  const fps = opcoes.fps || 30;
  let inicio = 0;
  const cenas = (roteiro.cenas || []).map((c, indice) => {
    const cena = JSON.parse(JSON.stringify(c));
    cena.indice = indice;
    cena.numero = indice + 1;
    cena.elementos = (cena.elementos || []).map((e, i) => ({ id: e.id || `el${i}`, ...e }));
    cena.acoes = (cena.acoes || []).map((a) => {
      const acao = { ...a };
      acao.inicio = acao.inicio ?? 0;
      if (acao.duracao == null) {
        acao.duracao = acao.tipo === 'falar' ? duracaoFala(acao.texto || '') : (DURACAO_PADRAO[acao.tipo] ?? 1);
      }
      return acao;
    }).sort((a, b) => a.inicio - b.inicio);
    // Elementos que "aparecem" começam ocultos.
    for (const el of cena.elementos) {
      if (el.oculto == null) {
        const primeira = cena.acoes.find((a) => a.alvo === el.id && (a.tipo === 'aparecer' || a.tipo === 'sumir'));
        el.oculto = primeira?.tipo === 'aparecer';
      }
    }
    // Câmera padrão: chão a ~80% da altura da tela (funciona em 16:9 e 9:16).
    const camPadrao = cena.vista === 'diagonal' ? { x: 0, y: 2.2, zoom: 1 }
      : cena.vista === 'avenida' ? { x: 0.6, y: 2.6, z: 11, zoom: 1 }
      : { x: 0, y: Math.round(res[1] * 0.3) / 16, zoom: 1 };
    cena.camera = { ...camPadrao, ...(cena.camera || {}) };
    cena.narracaoInicio = cena.narracaoInicio ?? 0.3;
    const narr = narracoes.get(indice);
    let dur = cena.duracao ?? 4;
    if (narr) {
      cena.narracao = { arquivo: narr.arquivo, duracao: narr.duracao };
      dur = Math.max(dur, cena.narracaoInicio + narr.duracao + NARRACAO_FOLGA);
    }
    const fimAcoes = cena.acoes.reduce((m, a) => Math.max(m, a.inicio + a.duracao), 0);
    if (cena.duracao == null) dur = Math.max(dur, fimAcoes + 0.5);
    // Arredonda para quadros inteiros.
    cena.duracao = Math.ceil(dur * fps) / fps;
    cena.inicio = inicio;
    cena.transicao = cena.transicao || (indice === 0 ? 'fade' : 'dither');
    inicio += cena.duracao;
    return cena;
  });
  for (let i = 0; i < cenas.length; i++) {
    cenas[i].transicaoSaida = i + 1 < cenas.length ? cenas[i + 1].transicao : (cenas[i].transicaoSaida || 'fade');
  }
  return {
    titulo: roteiro.titulo || 'Sem título',
    resolucao: res,
    paleta: roteiro.paleta || 'nenhuma',
    niveis: roteiro.niveis || 8,
    efeitos: { bloom: 0.8, vinheta: 0.3, aberracao: true, ...(roteiro.efeitos || {}) },
    fps,
    cenas,
    duracaoTotal: inicio,
  };
}

export function cenaNoTempo(roteiro, T) {
  const cenas = roteiro.cenas;
  for (let i = 0; i < cenas.length; i++) {
    if (T < cenas[i].inicio + cenas[i].duracao || i === cenas.length - 1) {
      return { cena: cenas[i], t: T - cenas[i].inicio };
    }
  }
  return null;
}

function destino(a, x, y) {
  const p = a.para;
  if (p == null) return [x, y];
  if (typeof p === 'number') return [p, y];
  if (Array.isArray(p)) return [p[0] ?? x, p[1] ?? y];
  return [p.x ?? x, p.y ?? y];
}

// Estado de um elemento no tempo local t da cena.
export function estadoElemento(cena, el, t) {
  let x = el.x ?? 0, y = el.y ?? 0;
  const z = el.z ?? 0;
  let virado = el.virado === 'esquerda' ? -1 : 1;
  let visivel = !el.oculto;
  let anim = 'parado', alpha = 1, offY = 0, escala = 1, vermelho = 0;
  for (const a of cena.acoes) {
    if (a.alvo !== el.id) continue;
    if (t < a.inicio) break;
    const dur = Math.max(a.duracao, 1e-6);
    const p = clamp((t - a.inicio) / dur);
    switch (a.tipo) {
      case 'andar': case 'correr': case 'mover': {
        const [tx, ty] = destino(a, x, y);
        if (a.tipo !== 'mover' && Math.abs(tx - x) > 1e-4) virado = tx < x ? -1 : 1;
        const ease = a.tipo === 'mover' ? (EASINGS[a.easing] || easeInOut) : (EASINGS[a.easing] || ((v) => v));
        x = lerp(x, tx, ease(p)); y = lerp(y, ty, ease(p));
        if (p < 1 && a.tipo !== 'mover') anim = a.tipo === 'correr' ? 'correndo' : 'andando';
        break;
      }
      case 'pular': {
        const h = a.altura ?? 1.5;
        const [tx, ty] = destino(a, x, y);
        if (Math.abs(tx - x) > 1e-4) virado = tx < x ? -1 : 1;
        x = lerp(x, tx, p); y = lerp(y, ty, p);
        if (p < 1) { offY += 4 * h * p * (1 - p); anim = 'pulando'; }
        break;
      }
      case 'virar':
        virado = a.direcao === 'esquerda' ? -1 : a.direcao === 'direita' ? 1 : -virado;
        break;
      case 'aparecer':
        visivel = true;
        if (p < 1) escala = Math.max(0, easeOutBack(p));
        break;
      case 'sumir':
        if (p >= 1) visivel = false; else escala = 1 - p * p;
        break;
      case 'coletar':
        if (p >= 1) visivel = false; else { offY += easeOutBack(p) * 1.2; alpha = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4; }
        break;
      case 'piscar':
        if (p < 1) { const on = Math.floor((t - a.inicio) * 14) % 2 === 0; vermelho = on ? 1 : 0; alpha = on ? 1 : 0.35; }
        break;
      default: break;
    }
  }
  return { x, y: y + offY, yBase: y, z, virado, visivel, anim, alpha, escala, vermelho, alturaPulo: offY };
}

export function elementoPorId(cena, id) {
  return cena.elementos.find((e) => e.id === id);
}

function camBase(cena) {
  return { x: 0, y: 3.5, zoom: 1, ...(cena.camera || {}) };
}

// Estado da câmera (sem tremor) no tempo t.
export function estadoCamera(cena, t) {
  const base = camBase(cena);
  // Vista avenida: a câmera fica parada e só se move junto com o protagonista ("seguir"),
  // acompanhando o deslocamento dele a partir do início da cena.
  if (cena.vista === 'avenida') {
    let cam = { ...base };
    // movimentoReal (teste): permite avançar/recuar com cameraFim e ações de câmera
    if (cena.avenida?.movimentoReal) {
      if (cena.cameraFim) {
        const fim = { ...base, ...cena.cameraFim }, p = easeInOut(clamp(t / cena.duracao));
        cam = { ...cam, y: lerp(base.y, fim.y, p), zoom: lerp(base.zoom, fim.zoom, p), z: lerp(base.z, fim.z ?? base.z, p) };
      }
      for (const a of cena.acoes) {
        if (a.tipo !== 'camera' || t < a.inicio) continue;
        const p = (EASINGS[a.easing] || easeInOut)(clamp((t - a.inicio) / Math.max(a.duracao, 1e-6)));
        const alvo = { ...cam, ...(a.para || {}) };
        cam = { ...cam, y: lerp(cam.y, alvo.y, p), zoom: lerp(cam.zoom, alvo.zoom, p), z: lerp(cam.z, alvo.z ?? cam.z, p) };
      }
    }
    const el = cena.seguir && elementoPorId(cena, cena.seguir);
    if (el) {
      const x0 = estadoElemento(cena, el, 0).x;
      let soma = 0; const N = 10;
      for (let i = 0; i < N; i++) soma += estadoElemento(cena, el, Math.max(0, t - (i / N) * 0.6)).x;
      cam.x = base.x + (soma / N - x0);
    }
    return cam;
  }
  let cam = { ...base };
  if (cena.cameraFim) {
    const fim = { ...base, ...cena.cameraFim };
    const p = easeInOut(clamp(t / cena.duracao));
    cam = { x: lerp(base.x, fim.x, p), y: lerp(base.y, fim.y, p), zoom: lerp(base.zoom, fim.zoom, p) };
    if (base.z != null) cam.z = lerp(base.z, fim.z ?? base.z, p);
  }
  for (const a of cena.acoes) {
    if (a.tipo !== 'camera' || t < a.inicio) continue;
    const p = (EASINGS[a.easing] || easeInOut)(clamp((t - a.inicio) / Math.max(a.duracao, 1e-6)));
    const alvo = { ...cam, ...(a.para || {}) };
    const zAnt = cam.z;
    cam = { x: lerp(cam.x, alvo.x, p), y: lerp(cam.y, alvo.y, p), zoom: lerp(cam.zoom, alvo.zoom, p) };
    if (zAnt != null) cam.z = lerp(zAnt, alvo.z ?? zAnt, p);
  }
  if (cena.seguir) {
    const el = elementoPorId(cena, cena.seguir);
    if (el) {
      // Média do passado recente = câmera "atrasada" suave, sem simulação.
      let soma = 0; const N = 10;
      for (let i = 0; i < N; i++) soma += estadoElemento(cena, el, Math.max(0, t - (i / N) * 0.6)).x;
      cam.x = soma / N + (cena.seguirDeslocamento ?? 0);
    }
  }
  return cam;
}

// Efeitos de tela: tremor, flash e transição.
export function efeitosTela(cena, t) {
  let tremor = 0, flash = 0;
  for (const a of cena.acoes) {
    if (t < a.inicio) continue;
    const dt = t - a.inicio;
    if (a.tipo === 'tremer' && dt < a.duracao) tremor = Math.max(tremor, (a.intensidade ?? 1) * (1 - dt / a.duracao));
    if (a.tipo === 'explosao') {
      if (dt < 0.5) tremor = Math.max(tremor, (a.intensidade ?? 1) * 1.4 * (1 - dt / 0.5));
      if (dt < 0.12) flash = Math.max(flash, 0.85 * (1 - dt / 0.12));
    }
    if (a.tipo === 'flash' && dt < a.duracao) flash = Math.max(flash, (a.intensidade ?? 1) * (1 - dt / a.duracao));
  }
  const amp = tremor * 4; // pixels
  const tremorX = Math.round(ruido1(t * 38, 1) * amp);
  const tremorY = Math.round(ruido1(t * 41, 2) * amp);

  let fade = 0, tipo = 'corte';
  const d = TRANSICAO_DURACAO;
  if (cena.transicao !== 'corte' && t < d) { fade = 1 - t / d; tipo = cena.transicao; }
  const resto = cena.duracao - t;
  if (cena.transicaoSaida !== 'corte' && resto < d) {
    const f = 1 - resto / d;
    if (f > fade) { fade = f; tipo = cena.transicaoSaida; }
  }
  return { tremorX, tremorY, tremor, flash, fade: clamp(fade), transicao: tipo };
}

export function larguraVisivel(roteiro, zoom = 1) {
  const [w] = roteiro.resolucao;
  return w / PIXELS_POR_UNIDADE / zoom;
}

const SOM_COLETAR = { moeda: 'moeda', coracao: 'vida', estrela: 'powerup', gema: 'powerup', chave: 'item' };
const SOM_EMOCAO = { '!': 'surpresa', '?': 'duvida', coracao: 'amor', '...': 'blip', zzz: 'blip' };

const AMBIENTE_FUNDO = {
  'floresta-dia': [['passaros', 0.5], ['vento', 0.25]],
  'floresta-noite': [['grilos', 0.6]],
  'por-do-sol': [['vento', 0.35], ['grilos', 0.2]],
  caverna: [['caverna', 0.7]],
  deserto: [['vento', 0.6]],
  espaco: [['espaco', 0.6]],
  'cidade-noite': [['cidade', 0.6]],
  neve: [['vento', 0.6]],
};
const AMBIENTE_CLIMA = { chuva: [['chuva', 0.9]], neve: [['vento', 0.4]] };

// Lista de eventos sonoros com tempo global (segundos).
export function eventosSonoros(roteiro) {
  const eventos = [];
  const ambientes = [];
  const meiaLarg = larguraVisivel(roteiro) / 2;
  for (const cena of roteiro.cenas) {
    const T0 = cena.inicio;
    const pan = (x, t) => clamp((x - estadoCamera(cena, t).x) / meiaLarg, -1, 1) * 0.7;
    const panEl = (id, t) => {
      const el = elementoPorId(cena, id);
      return el ? pan(estadoElemento(cena, el, t).x, t) : 0;
    };
    const add = (som, t, extra = {}) => { if (som) eventos.push({ som, tempo: T0 + t, volume: 1, taxa: 1, pan: 0, ...extra }); };

    if (cena.indice > 0 && ['iris', 'pixelizar'].includes(cena.transicao)) add('transicao', -0.35, { volume: 0.6 });
    if (cena.titulo) add('revelar', 0.15, { volume: 0.8 });

    for (const a of cena.acoes) {
      const somManual = a.som === null || a.som === false ? null : a.som;
      const semSom = a.som === null || a.som === false;
      const el = a.alvo ? elementoPorId(cena, a.alvo) : null;
      const vol = a.volume ?? 1;
      switch (a.tipo) {
        case 'andar': case 'correr': {
          if (semSom) break;
          const passo = a.tipo === 'correr' ? 0.19 : 0.3;
          let k = 0;
          for (let t = a.inicio + 0.05; t < a.inicio + a.duracao; t += passo, k++) {
            add(somManual || 'passo', t, { volume: 0.55 * vol, taxa: k % 2 ? 1.08 : 0.94, pan: panEl(a.alvo, t) });
          }
          break;
        }
        case 'pular':
          if (semSom) break;
          add(somManual || 'pulo', a.inicio, { volume: vol, pan: panEl(a.alvo, a.inicio) });
          add('aterrissar', a.inicio + a.duracao, { volume: 0.7 * vol, pan: panEl(a.alvo, a.inicio + a.duracao) });
          break;
        case 'coletar':
          if (!semSom) add(somManual || SOM_COLETAR[el?.sprite] || 'item', a.inicio, { volume: vol, pan: panEl(a.alvo, a.inicio) });
          break;
        case 'aparecer': case 'sumir':
          if (!semSom) add(somManual || 'puf', a.inicio, { volume: 0.8 * vol, pan: panEl(a.alvo, a.inicio) });
          break;
        case 'explosao': {
          if (semSom) break;
          const px = a.posicao ? a.posicao[0] : (el ? estadoElemento(cena, el, a.inicio).x : 0);
          add(somManual || 'explosao', a.inicio, { volume: vol, pan: pan(px, a.inicio) * 0.6 });
          break;
        }
        case 'tremer':
          if (!semSom && a.som !== undefined) add(somManual, a.inicio, { volume: vol });
          else if (!semSom) add('tremor', a.inicio, { volume: 0.8 * vol });
          break;
        case 'falar': {
          if (semSom) break;
          const tom = el?.voz ?? 1;
          const txt = a.texto || '';
          const vel = a.velocidade ?? 0.045;
          for (let i = 0; i < txt.length; i += 2) {
            if (!/[\p{L}\p{N}]/u.test(txt[i])) continue;
            const t = a.inicio + 0.15 + i * vel;
            add(somManual || 'blip', t, { volume: 0.35 * vol, taxa: tom * (1 + ((i * 7) % 5) * 0.03), pan: panEl(a.alvo, t) });
          }
          break;
        }
        case 'emocao':
          if (!semSom) add(somManual || SOM_EMOCAO[a.icone || '!'] || 'surpresa', a.inicio, { volume: 0.8 * vol, pan: panEl(a.alvo, a.inicio) });
          break;
        case 'piscar':
          if (!semSom) add(somManual || 'dano', a.inicio, { volume: vol, pan: panEl(a.alvo, a.inicio) });
          break;
        case 'magia':
          if (!semSom) add(somManual || 'magia', a.inicio, { volume: vol, pan: a.alvo ? panEl(a.alvo, a.inicio) : 0 });
          break;
        case 'som':
          if (a.som) add(a.som, a.inicio, { volume: vol, taxa: a.taxa ?? 1, pan: a.pan ?? 0 });
          break;
        default:
          if (somManual) add(somManual, a.inicio, { volume: vol });
      }
    }
    for (const s of cena.sons || []) add(s.som, s.inicio ?? 0, { volume: s.volume ?? 1, taxa: s.taxa ?? 1, pan: s.pan ?? 0 });

    // Ambiente
    let amb;
    if (cena.ambiente === false) amb = [];
    else if (Array.isArray(cena.ambiente)) amb = cena.ambiente.map((s) => (Array.isArray(s) ? s : [s, 0.6]));
    else {
      amb = [...(AMBIENTE_FUNDO[cena.fundo] || []), ...(AMBIENTE_CLIMA[cena.clima] || [])];
      if (cena.elementos.some((e) => e.sprite === 'fogueira' || e.sprite === 'tocha')) amb.push(['fogo', 0.6]);
    }
    for (const [som, volume] of amb) ambientes.push({ som, inicio: T0, fim: T0 + cena.duracao, volume });
  }
  eventos.sort((a, b) => a.tempo - b.tempo);
  return { eventos: eventos.filter((e) => e.tempo >= 0), ambientes };
}
