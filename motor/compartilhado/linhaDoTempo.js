// Lógica de tempo compartilhada entre o motor (navegador) e o Node (áudio).
// Tudo aqui é função pura do tempo: qualquer quadro pode ser calculado isoladamente.

import { clamp, lerp, easeInOut, easeOutBack, EASINGS, ruido1, PIXELS_POR_UNIDADE } from './util.js';

export const DURACAO_PADRAO = {
  andar: 1.5, correr: 1, mover: 1.5, pular: 0.6, virar: 0, falar: null, coletar: 0.6,
  aparecer: 0.4, sumir: 0.4, explosao: 0.9, tremer: 0.4, flash: 0.25, emocao: 1.2,
  piscar: 0.8, camera: 1.5, magia: 1, som: 0, congelar: 0, sentar: 0, levantar: 0, espirrar: 1, fogos: 1.5, expressao: 1.5, trocar: 0, desaparecer: 1.2, numero: 0.3,
  golpe: 0.3, esporos: 1.5,
  pensar: null, destaque: 1.5, sombra: 4, contador: 3, placar: 3, continua: 2,
};

export const TRANSICAO_DURACAO = 0.2;   // padrão (cada lado); o roteiro pode mudar com "transicaoDuracao"
const NARRACAO_FOLGA = 0.6;
const SEG_POR_LETRA = 0.065;   // estimativa da fala quando ainda não há áudio

// Divide o texto da narração em blocos curtos de legenda (frases; frases longas quebram na vírgula).
function blocosLegenda(texto, max = 64) {
  const frases = texto.match(/[^.!?…]+(?:\.\.\.|[.!?…]+)?/g)?.map((f) => f.trim()).filter(Boolean) || [texto];
  const blocos = [];
  for (const f of frases) {
    if (f.length <= max) { blocos.push(f); continue; }
    let atual = '';
    for (const parte of f.split(/(?<=,)\s+/)) {
      if (atual && (atual + ' ' + parte).length > max) { blocos.push(atual); atual = parte; }
      else atual = atual ? atual + ' ' + parte : parte;
    }
    if (atual) blocos.push(atual);
  }
  return blocos;
}

// Legenda palavra por palavra: tempo de cada palavra (real, do alinhamento, ou estimado pelas letras e pausas)
// e grupos curtos de palavras que aparecem juntos na tela (a palavra falada fica destacada).
function palavrasLegenda(texto, ini, falaDur, reais = null, maxLetras = 16) {
  const tk = texto.split(/\s+/).filter(Boolean);
  if (!tk.length) return [];
  const peso = tk.map((w) => w.length + 1 + (/[.!?…:]$/.test(w) ? 6 : /[,;]$/.test(w) ? 3 : 0));
  const soma = peso.reduce((a, b) => a + b, 0);
  let acc = 0;
  const est = tk.map((w, i) => { const a = acc; acc += peso[i]; return { ini: ini + falaDur * (a / soma), fim: ini + falaDur * ((a + w.length + 1) / soma) }; });
  let pal = est;
  if (reais && reais.length === tk.length && reais.filter(Boolean).length >= tk.length * 0.5) {
    // reais: alinhadas pelo que é falado; as que faltam ficam entre as vizinhas
    pal = reais.map((r) => (r ? { ini: ini + r.ini, fim: ini + Math.max(r.ini + 0.05, r.fim) } : null));
    for (let i = 0; i < pal.length; i++) if (!pal[i]) {
      let a = i - 1; while (a >= 0 && !pal[a]) a--;
      let b = i + 1; while (b < pal.length && !pal[b]) b++;
      const t0 = a >= 0 ? pal[a].fim : ini, t1 = b < pal.length ? pal[b].ini : ini + falaDur;
      const n = b - a - 1, k = i - a;
      pal[i] = { ini: t0 + ((t1 - t0) * (k - 1)) / n, fim: t0 + ((t1 - t0) * k) / n };
    }
    for (let i = 1; i < pal.length; i++) if (pal[i].ini < pal[i - 1].ini) pal[i].ini = pal[i - 1].ini;
  }
  const grupos = [];
  let g = null;
  tk.forEach((w, i) => {
    const txt = g ? g.palavras.map((p) => p.w).join(' ') + ' ' + w : w;
    if (!g || txt.length > maxLetras) { g = { palavras: [] }; grupos.push(g); }
    g.palavras.push({ w, ini: pal[i].ini, fim: pal[i].fim });
    if (/[.!?…:,;]$/.test(w)) g = null;   // pontuação fecha o grupo
  });
  return grupos.map((gr, i) => ({
    texto: gr.palavras.map((p) => p.w).join(' '),
    palavras: gr.palavras,
    ini: gr.palavras[0].ini,
    fim: i + 1 < grupos.length ? grupos[i + 1].palavras[0].ini : Math.max(gr.palavras.at(-1).fim, ini + falaDur),
  }));
}

function duracaoFala(texto) {
  return 1.2 + texto.length * 0.05;
}

// Normaliza o roteiro e calcula início/duração de cada cena.
// narracoes: Map<indiceCena, {arquivo, duracao}>
// PROTÓTIPO: "vidaNaRua" (na cena ou no cenário) — gente passando no fundo, pombos que voam, cachorro e carros,
// sem precisar escrever ações. true = padrão (3 pedestres e 2 pombos) ou { pedestres, carros, pombos, cachorro, onibus,
// zPedestres }. Os elementos são figurantes marcados com "vida": true (a conferência não cobra nada deles).
// Pedestres na calçada dos prédios, ATRÁS de quem está na cena (z 5.3 indo para a direita, 5.7 para a esquerda); na praça
// (câmera com z < -2) passam atrás das fileiras (z -6.9 / -6.5). Carros no asfalto (z 2.6 e 3.6) passam NA FRENTE de quem
// está na calçada dos prédios: use carros só quando ninguém importante estiver ali.
const SPRITES_VIDA = ['carteiro', 'vovo', 'mae', 'sorveteiro', 'aluno', 'aluna', 'caixa', 'mae-avental', 'professora', 'menino-pijama', 'campones'];
function adicionarVidaNaRua(cena, n) {
  const cfg = cena.vidaNaRua === true ? {} : cena.vidaNaRua, dur = cena.duracao, cx = cena.camera?.x ?? 0;
  const praca = (cena.camera?.z ?? 0) < -2;
  const usados = new Set(cena.elementos.map((e) => e.sprite || e.personagem));
  const livres = SPRITES_VIDA.filter((s) => !usados.has(s));
  let sem = (n + 1) * 7919;
  const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  const add = (el, acoes) => { cena.elementos.push({ figurante: true, vida: true, ...el }); cena.acoes.push(...acoes); };
  const zP = cfg.zPedestres ?? (praca ? -6.9 : 5.3);
  for (let k = 0; k < (cfg.pedestres ?? 3) && livres.length; k++) {
    const dir = k % 2 ? -1 : 1, vel = dir > 0 ? 1.1 : 0.95, x0 = cx - dir * (7 + (k >> 1) * 4.5) + (rnd() - 0.5);
    add({ id: `vida-p${k}`, sprite: livres[k % livres.length], x: x0, z: zP + (dir > 0 ? 0 : 0.4) },
      [{ tipo: 'andar', alvo: `vida-p${k}`, para: x0 + dir * vel * (dur + 1), inicio: 0, duracao: dur + 1, som: null }]);
  }
  for (let k = 0; k < (cfg.pombos ?? 2); k++) {
    const id = `vida-pombo${k}`, x0 = cx - 4 + k * 5.5 + rnd() * 2, z0 = praca ? -7.3 : 4.55, tv = dur * (0.45 + 0.2 * rnd());
    add({ id, sprite: 'pombo-rua', x: x0, z: z0 },
      [{ tipo: 'trocar', alvo: id, estado: 'voando', inicio: tv }, { tipo: 'mover', alvo: id, para: [x0 + 3 + rnd() * 2, 5], inicio: tv, duracao: 1.8 }]);
  }
  if (cfg.cachorro) {
    const x0 = cx + 8;
    add({ id: 'vida-cao', sprite: 'vira-lata', x: x0, z: zP + 0.4 }, [{ tipo: 'andar', alvo: 'vida-cao', para: x0 - 1.4 * (dur + 1), inicio: 0, duracao: dur + 1, som: null }]);
  }
  const CARROS = ['carro-vermelho', 'carro-azul', 'carro-amarelo', 'carro-branco'];
  for (let k = 0; k < (cfg.carros ?? 0); k++) {
    const dir = k % 2 ? -1 : 1, z = dir > 0 ? 2.6 : 3.6, x0 = cx - dir * 14, t0 = k * 1.3;
    add({ id: `vida-carro${k}`, sprite: CARROS[k % CARROS.length], x: x0, z }, [{ tipo: 'mover', alvo: `vida-carro${k}`, para: x0 + dir * 28, inicio: t0, duracao: 6, easing: 'linear' }]);
  }
  if (cfg.onibus) add({ id: 'vida-onibus', sprite: 'onibus', x: cx + 16, z: 3.4 }, [{ tipo: 'mover', alvo: 'vida-onibus', para: cx - 16, inicio: 0, duracao: 9, easing: 'linear' }]);
  cena.acoes.sort((a, b) => a.inicio - b.inicio);
}

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
      let acao = { ...a };
      // "corte": troca de enquadramento instantânea no meio da cena (ex.: zoom 1 → 2 na palavra forte), sem movimento lento
      if (acao.tipo === 'corte') {
        const para = { ...(acao.para || {}) };
        for (const k of ['zoom', 'x', 'y', 'z']) if (acao[k] != null) para[k] = acao[k];
        acao = { tipo: 'camera', inicio: acao.inicio ?? 0, duracao: 0, para, corte: true };
      }
      acao.inicio = acao.inicio ?? 0;
      if (acao.duracao == null) {
        acao.duracao = (acao.tipo === 'falar' || acao.tipo === 'pensar') ? duracaoFala(acao.texto || '') : (DURACAO_PADRAO[acao.tipo] ?? 1);
      }
      return acao;
    }).sort((a, b) => a.inicio - b.inicio);
    // PROTÓTIPO (isekai): "golpe" gira a espada de quem ataca (elemento espada-heroi "sobre" ele) por ~0,25 s e volta a ficar de pé
    for (const g of cena.acoes.filter((x) => x.tipo === 'golpe' && x.alvo)) {
      for (const esp of cena.elementos.filter((e) => e.sprite === 'espada-heroi' && (e.sobre?.id ?? e.sobre) === g.alvo)) {
        cena.acoes.push({ tipo: 'trocar', alvo: esp.id, estado: g.direcao === 'esquerda' ? 'golpe-esq' : 'golpe-dir', inicio: g.inicio, duracao: 0, auto: true },
          { tipo: 'trocar', alvo: esp.id, estado: 'parado', inicio: +(g.inicio + 0.25).toFixed(3), duracao: 0, auto: true });
      }
    }
    // Elementos que "aparecem" começam ocultos.
    for (const el of cena.elementos) {
      if (el.oculto == null) {
        const primeira = cena.acoes.find((a) => a.alvo === el.id && (a.tipo === 'aparecer' || a.tipo === 'sumir'));
        el.oculto = primeira?.tipo === 'aparecer';
      }
    }
    // Câmera padrão: chão a ~80% da altura da tela (funciona em 16:9 e 9:16).
    const camPadrao = (cena.vista === 'diorama' && cena.comodo) ? { x: 0, y: 3, zoom: 1 }
      : (cena.vista === 'diorama' || cena.vista === 'diagonal') ? { x: 0, y: 2.2, zoom: 1 }
      : cena.vista === 'avenida' ? { x: 0.6, y: 2.6, z: 11, zoom: 1 }
      : cena.vista === '3d' ? { x: 0, y: 1.6, z: -1, zoom: 1 }
      : { x: 0, y: Math.round(res[1] * 0.3) / 16 / (cena.camera?.zoom ?? 1), zoom: 1 };   // chão a ~80% da altura, considerando o zoom
    cena.camera = { ...camPadrao, ...(cena.camera || {}) };
    cena.narracaoInicio = cena.narracaoInicio ?? 0.3;
    const narr = narracoes.get(indice);
    // Ações sincronizadas com a fala real: o roteiro marca os tempos pela fala estimada (0,065 s por letra);
    // com o áudio, os tempos de cada cena esticam/encolhem na mesma proporção da fala real.
    // ("sincronizarAcoes": false no roteiro ou "sincronizar": false na cena desliga.)
    // Narração única contínua: a cena dura exatamente o seu trecho de áudio (que já traz meia pausa de cada lado),
    // sem silêncio extra no começo nem no fim — a voz segue sem buracos e o vídeo tem o tamanho do áudio.
    const continuo = !!(narr && narr.continuo);
    if (narr && cena.narracaoTexto && roteiro.sincronizarAcoes !== false && cena.sincronizar !== false) {
      const f = clamp(narr.duracao / (cena.narracaoTexto.length * SEG_POR_LETRA + (continuo ? cena.narracaoInicio : 0)), 0.5, 2);
      const n0 = cena.narracaoInicio, novo = continuo ? 0 : n0;
      for (const a of cena.acoes) {
        a.inicio = a.inicio > n0 ? novo + (a.inicio - n0) * f : a.inicio * (n0 ? novo / n0 : 1);
        if (a.tipo !== 'flash' && a.tipo !== 'tremer') a.duracao *= f;
      }
      for (const k of ['tituloInicio', 'tituloDuracao']) if (cena[k] != null) cena[k] *= f;
    }
    if (continuo) cena.narracaoInicio = 0;
    let dur = cena.duracao ?? (cena.narracaoTexto ? 0 : 4);   // com texto do narrador, a cena dura a fala (sem o mínimo de 4 s)
    if (narr) {
      cena.narracao = { arquivo: narr.arquivo, duracao: narr.duracao };
      dur = continuo ? narr.duracao : Math.max(dur, cena.narracaoInicio + narr.duracao + NARRACAO_FOLGA);
    }
    // Legenda do narrador: blocos distribuídos pela duração da fala (real, ou estimada sem áudio).
    if (cena.narracaoTexto && roteiro.legendasNarracao !== false && cena.legendaNarracao !== false) {
      const falaDur = narr ? narr.duracao : cena.narracaoTexto.length * SEG_POR_LETRA;
      if (!narr) dur = Math.max(dur, cena.narracaoInicio + falaDur + 0.15);   // sem áudio (rascunho): a fala estimada + um respiro curto, sem silêncio parado
      if ((roteiro.legendaEstilo || 'palavra') === 'palavra') {
        // padrão: grupos curtos (até ~3 palavras) com a palavra falada destacada — segura quem assiste sem som
        if (cena.legendaPosicao == null && roteiro.legendaPosicao != null) cena.legendaPosicao = roteiro.legendaPosicao;
        cena.legendasNarracao = palavrasLegenda(cena.narracaoTexto, cena.narracaoInicio, falaDur, narr?.palavras, roteiro.legendaLetras || (res[0] < res[1] ? 14 : 16))   // Shorts: 14 letras cabem numa linha no tamanho grande (tamanho fixo);
      } else {
        const blocos = blocosLegenda(cena.narracaoTexto);
        const total = blocos.reduce((s, b) => s + b.length, 0) || 1;
        let t0 = cena.narracaoInicio;
        cena.legendasNarracao = blocos.map((b) => { const d = falaDur * (b.length / total); const r = { texto: b, ini: t0, fim: t0 + d }; t0 += d; return r; });
      }
    }
    const fimAcoes = cena.acoes.reduce((m, a) => Math.max(m, a.inicio + a.duracao), 0);
    if (cena.duracao == null && !continuo) dur = Math.max(dur, fimAcoes + (cena.narracaoTexto ? 0.1 : 0.5));
    if (continuo) for (const a of cena.acoes) if (a.inicio + a.duracao > dur) a.duracao = Math.max(0, dur - a.inicio);   // nada passa do fim da fala
    // Arredonda para quadros inteiros.
    cena.duracao = Math.ceil(dur * fps) / fps;
    if (cena.vidaNaRua && (cena.vista === 'diorama' || cena.vista === 'diagonal') && !cena.comodo) adicionarVidaNaRua(cena, indice);
    cena.inicio = inicio;
    cena.transicao = cena.transicao || (indice === 0 ? 'corte' : 'dither')   // 1ª cena começa já com imagem (sem fade do preto: o 1º segundo decide se o público fica);
    cena.transicaoDuracao = cena.transicaoDuracao ?? roteiro.transicaoDuracao ?? TRANSICAO_DURACAO;
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
    volumeBaloes: roteiro.volumeBaloes ?? 1,
    trilha: roteiro.trilha || null,
    volumeTrilha: roteiro.volumeTrilha ?? 0.7,
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
// PROTÓTIPO "congelar": { "tipo": "congelar", "alvo": "a1", "inicio": 0.4 } — a partir do início, o elemento fica parado EXATAMENTE como
// estava (no meio do pulo, da corrida, do espirro): posição e quadro da animação param ("pausa" do jogo). Quem está "sobre" ele também para.
export function estadoElemento(cena, el, t, _prof = 0) {
  const gelo = (cena.acoes || []).find((a) => a.tipo === 'congelar' && a.alvo === el.id && t >= a.inicio);
  if (gelo && !_congelando.has(el.id)) {
    _congelando.add(el.id);
    try { const st = estadoElemento(cena, el, gelo.inicio, _prof); return { ...st, congeladoEm: gelo.inicio }; } finally { _congelando.delete(el.id); }
  }
  return estadoLivre(cena, el, t, _prof);
}
const _congelando = new Set();
function estadoLivre(cena, el, t, _prof = 0) {
  let x = el.x ?? 0, y = el.y ?? 0;
  let z = el.z ?? 0;
  let virado = el.virado === 'esquerda' ? -1 : 1;
  // "sobre": { "id": "bia", "dx": 0, "dy": 2.8 } — o elemento acompanha outro (tempo na cabeça, guarda-chuva na mão).
  // dx segue o lado para onde o dono está virado; "virar": false mantém o próprio lado.
  let dono = null;
  if (el.sobre && _prof < 4) {
    const so = typeof el.sobre === 'string' ? { id: el.sobre } : el.sobre;
    const pai = elementoPorId(cena, so.id);
    if (pai) {
      dono = estadoElemento(cena, pai, t, _prof + 1);
      if (so.virar !== false) virado = dono.virado;
      x = dono.x + (so.dx ?? 0) * (so.virar !== false ? dono.virado : 1);
      y = dono.yBase + (dono.alturaPulo || 0) + (so.dy ?? 0);
      z = dono.z + (so.dz ?? 0);
    }
  }
  let visivel = !el.oculto;
  let anim = 'parado', alpha = 1, offY = 0, escala = 1, vermelho = 0;
  // pose de quando está parado: "pose": "sentado" (de frente) ou "sentado-lado"; muda com as ações sentar/levantar
  let pose = el.pose || null;
  let espirro = null, rosto = null;
  const ROSTO_DA_EMOCAO = { '!': 'surpreso', '?': 'pensativo', coracao: 'feliz', gota: 'chorando', raiva: 'bravo', '...': 'envergonhado', lampada: 'surpreso' };
  let animInicio = 0;   // quando começou o estado atual (para animações que tocam uma vez só)
  let fasePulo = null;  // 0..1 durante um pulo (o sprite pode ter quadros de subida/descida)
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
        if (p < 1) { offY += 4 * h * p * (1 - p); anim = 'pulando'; fasePulo = p; }
        break;
      }
      case 'sentar': pose = a.pose || (a.lado ? 'sentado-lado' : 'sentado'); break;
      case 'expressao': if (p < 1) { rosto = a.rosto || a.estado || null; animInicio = a.inicio; } break;   // PROTÓTIPO: rosto por um tempo
      case 'emocao': if (p < 1 && a.rosto !== false && !rosto) rosto = (typeof a.rosto === 'string' && a.rosto) || ROSTO_DA_EMOCAO[a.icone] || null; break;
      case 'espirrar': if (p < 1) espirro = p < (a.inspira ?? 0.6) ? 'espirro-antes' : 'espirro'; break;   // PROTÓTIPO
      case 'levantar': pose = null; break;
      // "trocar": muda o estado do objeto (ex.: tempo-pessoal de "sol" para "chuva"; estrela vira "olho")
      case 'trocar': pose = a.estado || a.anim || null; animInicio = a.inicio; break;
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
      // "desaparecer": some devagar, sem fumaça nem som (para cenas pesadas)
      case 'desaparecer':
        if (p >= 1) visivel = false; else alpha = Math.min(alpha, 1 - p);
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
  const rostoPose = pose && anim === 'parado' && rosto ? rosto : null;   // o sprite pode ter "<estado>-rosto-<x>" (ex.: Davi de chapéu grande)
  if (pose && anim === 'parado') anim = pose;
  if (espirro && anim === 'parado' && !pose) anim = espirro;
  else if (rosto && anim === 'parado' && !pose) anim = 'rosto-' + rosto;
  if (dono && !dono.visivel) visivel = false;
  return { x, y: y + offY, yBase: y, z, virado, visivel, anim, pose, rostoPose, animInicio, alpha, escala, vermelho, alturaPulo: offY, fasePulo };
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
// Sombra que se alastra (ação "sombra"): { "origem": [x, z], "raio": 14, "inicio", "duracao", "recolher": s }.
// Devolve { x, z, R, t } (R = raio atual, em unidades) ou null. A borda é irregular: raioNoAngulo().
export function estadoSombra(cena, t) {
  let r = null;
  for (const a of cena.acoes) {
    if (a.tipo !== 'sombra' || t < a.inicio) continue;
    const p = clamp((t - a.inicio) / Math.max(0.1, a.duracao));
    let R = (a.raio ?? 14) * (1 - (1 - p) * (1 - p));
    if (a.recolher != null && t > a.recolher) R *= 1 - clamp((t - a.recolher) / 1.2);
    const [x, z] = a.origem || [0, 0];
    r = { x, z, R, t, cor: a.cor, borda: a.corBorda, personagens: a.personagens !== false };
  }
  return r;
}
export const raioNoAngulo = (R, ang, t) => R * (0.8 + 0.14 * Math.sin(ang * 5 + 1.3) + 0.06 * Math.sin(ang * 13 + t * 1.7));

export function efeitosTela(cena, t) {
  let tremor = 0, flash = 0, flashCor = null;
  for (const a of cena.acoes) {
    if (t < a.inicio) continue;
    const dt = t - a.inicio;
    if (a.tipo === 'tremer' && dt < a.duracao) tremor = Math.max(tremor, (a.intensidade ?? 1) * (1 - dt / a.duracao));
    if (a.tipo === 'explosao') {
      if (dt < 0.5) tremor = Math.max(tremor, (a.intensidade ?? 1) * 1.4 * (1 - dt / 0.5));
      if (dt < 0.12) flash = Math.max(flash, 0.85 * (1 - dt / 0.12));
    }
    if (a.tipo === 'flash' && dt < a.duracao) { const v = (a.intensidade ?? 1) * (1 - dt / a.duracao); if (v > flash) { flash = v; flashCor = a.cor || null; } }
  }
  const amp = tremor * 4; // pixels
  const tremorX = Math.round(ruido1(t * 38, 1) * amp);
  const tremorY = Math.round(ruido1(t * 41, 2) * amp);

  let fade = 0, tipo = 'corte';
  const d = cena.transicaoDuracao ?? TRANSICAO_DURACAO;
  if (cena.transicao !== 'corte' && t < d) { fade = 1 - t / d; tipo = cena.transicao; }
  const resto = cena.duracao - t;
  if (cena.transicaoSaida !== 'corte' && resto < d) {
    const f = 1 - resto / d;
    if (f > fade) { fade = f; tipo = cena.transicaoSaida; }
  }
  return { tremorX, tremorY, tremor, flash, flashCor, fade: clamp(fade), transicao: tipo };
}

export function larguraVisivel(roteiro, zoom = 1) {
  const [w] = roteiro.resolucao;
  return w / PIXELS_POR_UNIDADE / zoom;
}

const SOM_COLETAR = { moeda: 'moeda', coracao: 'vida', estrela: 'powerup', gema: 'powerup', chave: 'item' };
const SOM_EMOCAO = { '!': 'surpresa', '?': 'duvida', coracao: 'amor', '...': 'blip', zzz: 'blip', lampada: 'item', gota: 'duvida', raiva: 'erro', nota: 'amor' };

const AMBIENTE_FUNDO = {
  'floresta-dia': [['passaros', 0.5], ['vento', 0.25]],
  'floresta-noite': [['grilos', 0.6]],
  'por-do-sol': [['vento', 0.35], ['grilos', 0.2]],
  caverna: [['caverna', 0.7]],
  deserto: [['vento', 0.6]],
  espaco: [['espaco', 0.6]],
  'cidade-noite': [['cidade', 0.6]],
  neve: [['vento', 0.6]],
  diorama: [['passaros', 0.15]],
  'diorama-noite': [['grilos', 0.25]],
};
const AMBIENTE_CLIMA = { chuva: [['chuva', 0.9]], neve: [['vento', 0.4]] };

// Lista de eventos sonoros com tempo global (segundos).
export function eventosSonoros(roteiro) {
  const eventos = [];
  const ambientes = [];
  const meiaLarg = larguraVisivel(roteiro) / 2;
  const volBaloes = roteiro.volumeBaloes ?? 1;   // som das falas dos balões (projetos novos: 0.4, narrador em destaque)
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
          if (semSom || el?.sombraPessoa) break;   // sombra andando não faz barulho de passo
          // multidão: só as 3 primeiras pessoas andando ao mesmo tempo fazem som de passo, cada uma num ritmo um pouco
          // diferente e mais baixo quanto mais gente anda junto (antes os passos se empilhavam e viravam um "metralhar")
          const juntos = cena.acoes.filter((b) => (b.tipo === 'andar' || b.tipo === 'correr') && b.som !== null && b.som !== false
            && !elementoPorId(cena, b.alvo)?.sombraPessoa && b.inicio < a.inicio + a.duracao && a.inicio < b.inicio + b.duracao);
          const ordem = juntos.indexOf(a);
          if (!somManual && ordem >= 3) break;
          const passo = (a.tipo === 'correr' ? 0.19 : 0.3) * (1 + ((ordem * 37) % 11 - 5) / 50);
          const fase = ordem * 0.11;
          const volJuntos = 1 / Math.sqrt(Math.min(juntos.length, 3));
          let k = 0;
          for (let t = a.inicio + 0.05 + fase; t < a.inicio + a.duracao; t += passo, k++) {
            add(somManual || 'passo', t, { volume: 0.55 * vol * volJuntos, taxa: (k % 2 ? 1.08 : 0.94) * (1 - ordem * 0.04), pan: panEl(a.alvo, t) });
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
          if (!semSom) add(somManual || ((el?.monstro || el?.sombraPessoa) ? (a.tipo === 'aparecer' ? 'sombra-surge' : 'sombra-some') : 'puf'), a.inicio, { volume: 0.8 * vol, pan: panEl(a.alvo, a.inicio) });
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
            add(somManual || 'blip', t, { volume: 0.35 * vol * volBaloes, taxa: tom * (1 + ((i * 7) % 5) * 0.03), pan: panEl(a.alvo, t) });
          }
          break;
        }
        case 'emocao':
          if (!semSom) add(somManual || SOM_EMOCAO[a.icone || '!'] || 'surpresa', a.inicio, { volume: 0.8 * vol, pan: panEl(a.alvo, a.inicio) });
          break;
        case 'contador':   // um tique por segundo; no último, o sino
          if (semSom) break;
          for (let k = 0; k < Math.round(a.de ?? a.duracao); k++) add(somManual || 'clique', a.inicio + k * (a.duracao / Math.round(a.de ?? a.duracao)), { volume: 0.7 * vol });
          add('sino', a.inicio + a.duracao, { volume: 0.5 * vol });
          break;
        case 'sombra':
          if (!semSom) add(somManual || 'sombra', a.inicio, { volume: 0.9 * vol });
          break;
        case 'destaque':
          if (!semSom) add(somManual || 'revelar', a.inicio, { volume: 0.6 * vol });
          break;
        case 'continua':
          if (!semSom) add(somManual || 'suspense', a.inicio, { volume: 0.8 * vol });
          break;
        case 'numero':
          if (!semSom) add(somManual || 'clique', a.inicio, { volume: 0.5 * vol, pan: panEl(a.alvo, a.inicio) });
          break;
        case 'fogos':   // PROTÓTIPO: assobio subindo + estouro
          if (semSom) break;
          if ((a.subida ?? 0.5) > 0) add('fogos-sobe', a.inicio, { volume: 0.6 * vol, pan: a.posicao ? pan(a.posicao[0], a.inicio) : 0 });
          add(somManual || 'fogos', a.inicio + (a.subida ?? 0.5), { volume: vol, pan: a.posicao ? pan(a.posicao[0], a.inicio) : 0 });
          break;
        case 'trocar':   // guardião que passa a "alerta"/"tremendo" dá um "iiip!" de susto (PROTÓTIPO)
          if (!semSom && /^guardi/.test(el?.sprite || el?.personagem || '') && ['alerta', 'tremendo'].includes(a.estado)) add(somManual || 'guardiao-susto', a.inicio, { volume: 0.8 * vol, pan: el.sobre ? panEl(el.sobre.id, a.inicio) : panEl(a.alvo, a.inicio) });
          else if (somManual) add(somManual, a.inicio, { volume: vol });
          break;
        case 'espirrar':   // PROTÓTIPO: inspira no começo, atchim no meio da ação
          if (semSom) break;
          add('espirro-inspira', a.inicio, { volume: 0.7 * vol, pan: panEl(a.alvo, a.inicio), taxa: el?.voz ?? 1 });
          add(somManual || 'espirro', a.inicio + a.duracao * (a.inspira ?? 0.6), { volume: vol, pan: panEl(a.alvo, a.inicio), taxa: el?.voz ?? 1 });
          break;
        case 'golpe':   // PROTÓTIPO (isekai): "vush" da espada
          if (!semSom) add(somManual || 'espada', a.inicio, { volume: vol, pan: panEl(a.alvo, a.inicio) });
          break;
        case 'esporos':   // PROTÓTIPO (isekai): "fssh" macio com brilhinho (a nuvem grande é mais alta)
          if (!semSom && a.tamanho !== 'flutuando') add(somManual || 'esporos', a.inicio, { volume: (a.tamanho === 'grande' ? 1 : 0.6) * vol, pan: a.alvo ? panEl(a.alvo, a.inicio) : 0 });
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
  // trilha de fundo do vídeo inteiro (baixa, abaixa sozinha com a narração): "trilha": "suspense" | "comedia" | "emocional"
  if (roteiro.trilha) {
    const fim = roteiro.cenas.reduce((m, c) => Math.max(m, c.inicio + c.duracao), 0);
    ambientes.push({ som: `trilha-${roteiro.trilha}`, inicio: 0, fim, volume: roteiro.volumeTrilha ?? 0.7, entrada: 0.05 });
  }
  eventos.sort((a, b) => a.tempo - b.tempo);
  return { eventos: eventos.filter((e) => e.tempo >= 0), ambientes };
}
