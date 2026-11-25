// Helpers para montar roteiros "Nesse Mundo" com tempos calculados pela fala estimada (0,065 s/letra).
import fs from 'node:fs';
import path from 'node:path';
import { lerJsonFlexivel } from '../../src/biblioteca.js';
import { fileURLToPath } from 'node:url';
import { xCentrado, centrarCena } from '../../motor/compartilhado/centro.js';
import { lerRoteiro } from '../../src/projeto.js';
import { resolverRoteiro, estadoElemento } from '../../motor/compartilhado/linhaDoTempo.js';
const RAIZ_PROJ = fileURLToPath(new URL('../../', import.meta.url));
const CENARIOS = { ...lerJsonFlexivel(RAIZ_PROJ + 'prototipos/cenarios.json'), ...lerJsonFlexivel(RAIZ_PROJ + 'biblioteca/cenarios.json') };

// Postes da rua (motor/cenarios/ruaDiagonal.js): um a cada "distanciaPostes" (8), alternando calçada dos prédios (z 5.35)
// e calçada da frente (z 0), a partir de j = -comprimento/2 + 3 (x = -j). Escolhe um comprimento de rua em que NENHUM poste
// fique a menos de 1.6 de alguém que está/anda numa calçada (evita "gente atrás/na frente do poste").
function ruaSemPosteNaFrente(c) {
  const base = CENARIOS[c.cenario];
  if (!base?.rua || c.comodo || (c.vista && c.vista !== 'diorama')) return;
  const pessoas = (c.elementos || []).filter((e) => e.personagem && !e.sobre);
  const xs = [];
  for (const e of pessoas) {
    const z = e.z ?? 0, perto = (z > -0.8 && z < 1.6) ? 0 : (z > 4.2 && z < 6.4) ? 5.35 : null;
    if (perto == null) continue;
    let x = e.x ?? 0; xs.push([x, perto]);
    for (const ac of (c.acoes || []).filter((a) => a.alvo === e.id && ['andar', 'correr', 'mover'].includes(a.tipo))) {
      const x1 = typeof ac.para === 'number' ? ac.para : Array.isArray(ac.para) ? ac.para[0] : x;
      for (let k = 1; k <= 8; k++) xs.push([x + (x1 - x) * k / 8, perto]);
      x = x1;
    }
  }
  if (!xs.length) return;
  const todos = [...(c.elementos || []).map((e) => e.x ?? 0), c.camera?.x ?? 0, c.cameraFim?.x ?? 0, ...(c.acoes || []).map((a) => (typeof a.para === 'number' ? a.para : Array.isArray(a.para) ? a.para[0] : a.para?.x ?? 0))];
  const minimo = Math.ceil(2 * (Math.max(...todos.map(Math.abs)) + 2 + 20)) + 4;
  let melhor = null;
  busca: for (const passo of [base.rua.distanciaPostes ?? 8, 9, 10, 11, 12, 13, 14]) {
    for (let comp = minimo; comp < minimo + 2 * passo; comp++) {
      const J0 = -comp / 2, J1 = comp / 2, postes = [];
      for (let j = J0 + 3; j < J1 - 1; j += passo) { postes.push([-j, 5.35]); postes.push([-(j + passo / 2), 0]); }
      const folga = Math.min(...xs.map(([x, z]) => Math.min(99, ...postes.filter((p) => p[1] === z).map((p) => Math.abs(p[0] - x)))));
      if (!melhor || folga > melhor.folga + 0.05) melhor = { comp, passo, folga };
      if (folga >= 1.6) break busca;
    }
  }
  c.rua = { ...base.rua, ...(c.rua || {}), comprimento: melhor.comp, distanciaPostes: melhor.passo };
}


export const SEG = 0.065, INI = 0.3;
const r2 = (v) => Math.round(v * 100) / 100;

export const P = (id, personagem, x, z, extra = {}) => ({ id, personagem, x, z, ...extra });
export const S = (id, sprite, x, z, extra = {}) => ({ id, sprite, x, z, ...extra });

// Câmeras-padrão do diorama
export const RUA = (x) => ({ x, z: 2.2, y: 2.4 });        // calçada dos prédios (pessoas z ~5.2)
export const FRENTE = (x) => ({ x, z: 0, y: 2.4 });       // calçada da frente (pessoas z ~0.6)
export const PRACA = (x) => ({ x, z: -8.5 });             // praça (pessoas z ~-8.6; palanque em cima: x 5, z -6.7, y 0.75)
export const CEU = (x) => ({ x, z: 3.5, y: 3.6 });

// a(f, acao): ação com início numa fração f da fala (0 = começo, 1 = fim). Campos "dur" também em fração da fala.
export const a = (f, tipo, campos = {}) => ({ f, tipo, ...campos });

// cena(texto, { cenario, camera, foco, elementos, acoes, ... })
export function cena(texto, o) {
  const F = texto.length * SEG;
  const fim = INI + F;
  const acoes = (o.acoes || []).map((x) => {
    const { f, durF, ...resto } = x;
    const ac = { ...resto, inicio: r2(INI + f * F) };
    if (durF != null) ac.duracao = r2(durF * F);
    // balão: termina junto com a fala (regra 10)
    if (ac.tipo === 'falar') {
      const d = 1.2 + (ac.texto || '').length * 0.05;
      if (ac.inicio + d > fim) ac.inicio = r2(Math.max(INI, fim - d));
    }
    const d = ac.duracao ?? { andar: 1.5, correr: 1, mover: 1.5, pular: 0.6, emocao: 1.2, aparecer: 0.4, sumir: 0.4, explosao: 0.9, tremer: 0.4, flash: 0.25, magia: 1, piscar: 0.8, camera: 1.5, coletar: 0.6, desaparecer: 1, expressao: 1.5 }[ac.tipo] ?? 0;
    if (ac.inicio + d > fim) ac.inicio = r2(Math.max(0, fim - d));
    return ac;
  });
  const c = { narracaoTexto: texto };
  for (const k of ['cenario', 'vista', 'rua', 'comodo', 'fundo', 'transicao', 'clima', 'paleta', 'titulo', 'subtitulo', 'tituloInicio', 'tituloDuracao', 'remover', 'ambiente', 'seguir', 'momento', 'saiDeCena', 'salto', 'continuaFrase', 'tituloSemEntrada', 'tituloPosicao']) if (o[k] != null) c[k] = o[k];
  // praça: as árvores da frente (arvore3/arvore4) cobrem quem está na frente; saem por padrão
  if (/^praca/.test(o.cenario || '') && !o.remover) c.remover = ['arvore3', 'arvore4'];
  if (o.camera) c.camera = o.camera;
  if (o.cameraFim) c.cameraFim = o.cameraFim;
  c.elementos = o.elementos || [];
  c.acoes = acoes;
  // Shorts: a câmera do bloco "vertical" CENTRALIZA SOZINHA em quem conta a história (média do começo e do fim de cada um,
  // levando o "z" em conta — ver motor/compartilhado/centro.js). foco: número = x manual (antigo); id ou [ids] = em quem centrar;
  // sem foco = todos os personagens com papel (sem figurantes, "sobre" e "tela").
  if (o.camera) {
    let x = o.camera.x;
    if (typeof o.foco === 'number') x = o.foco;
    else {
      const ids = o.foco == null ? null : [].concat(o.foco);
      let quem = (o.elementos || []).filter((e) => e.personagem && !e.sobre && !e.tela && (ids ? ids.includes(e.id) : !e.figurante));
      if (!quem.length && !ids) quem = (o.elementos || []).filter((e) => e.personagem && !e.sobre && !e.tela);
      const base = CENARIOS[o.cenario] || {}, comodo = !!(base.comodo || o.comodo);
      const camZ = o.camera.z ?? base.camera?.z ?? 0;
      const pontos = quem.flatMap((e) => {
        let xf = e.x ?? 0;
        for (const ac of (o.acoes || []).filter((ac) => ac.alvo === e.id && ['andar', 'correr', 'mover', 'pular'].includes(ac.tipo) && ac.para != null)) xf = typeof ac.para === 'number' ? ac.para : Array.isArray(ac.para) ? ac.para[0] : xf;
        return [xCentrado(e.x ?? 0, e.z ?? 0, camZ, comodo), xCentrado(xf, e.z ?? 0, camZ, comodo)];
      });
      if (pontos.length) x = +((Math.min(...pontos) + Math.max(...pontos)) / 2).toFixed(2);
      // o salvar() ainda refina o x medindo a cena resolvida no tempo (pulos, congelar, sumir) — igual ao conferir
    }
    c.vertical = { camera: { ...o.camera, x }, ...(typeof o.foco === 'string' || Array.isArray(o.foco) ? { centrarEm: [].concat(o.foco) } : {}), ...(o.vertical || {}) };
  }
  return c;
}

// Expressões no rosto depois de montar as cenas: rostos(C, [[nCena, alvo, rosto, f, durF], ...]) (cena começa em 1).
// f/durF em fração da fala (padrão: do começo até o fim). Termina junto com a fala (regra 10).
export function rostos(C, lista) {
  for (const [n, alvo, rosto, f = 0.05, durF] of lista) {
    const c = C[n - 1], F = c.narracaoTexto.length * SEG, ini = r2(INI + f * F);
    const dur = r2(durF != null ? durF * F : INI + F - ini);
    if (!c.elementos.some((e) => e.id === alvo)) throw new Error(`rostos: cena ${n} não tem "${alvo}"`);
    c.acoes.push({ tipo: 'expressao', alvo, rosto, inicio: ini, duracao: Math.min(dur, r2(INI + F - ini)) });
  }
}

// Troca de corpo (espirro): faíscas nos dois + flash + "?" nos dois
export const troca = (f, a1, a2) => [
  a(f, 'flash', { intensidade: 0.7 }), a(f, 'magia', { alvo: a1 }), a(f, 'magia', { alvo: a2 }),
  a(f + 0.12, 'emocao', { alvo: a1, icone: '?' }), a(f + 0.14, 'emocao', { alvo: a2, icone: '?' }),
];

export function salvar(nome, cabecalho, roteiro) {
  const dir = path.join(RAIZ_PROJ, 'projetos', nome);
  for (const s of ['narracao', 'sfx', 'sprites']) fs.mkdirSync(path.join(dir, s), { recursive: true });
  const escrever = () => fs.writeFileSync(path.join(dir, 'roteiro.json'), cabecalho.map((l) => '// ' + l).join('\n') + '\n' + JSON.stringify(roteiro, null, 1) + '\n');
  escrever();
  // Shorts: centraliza de verdade — resolve o roteiro e mede onde cada um fica no tempo (mesma conta do aviso [centro] do conferir)
  if (roteiro.cenas.some((c) => c.vertical?.camera)) {
    const r = resolverRoteiro(lerRoteiro(dir), new Map(), { fps: 30 });
    roteiro.cenas.forEach((cb, i) => {
      if (!cb.vertical?.camera || cb.vertical.camera.travado) return;   // "travado": true = x escolhido à mão, não mexer
      const res = centrarCena(r.cenas[i], cb, estadoElemento);
      if (!res || (Math.abs(res.desvio) <= 2 && !res.centrarEm)) return;
      cb.vertical.camera.x = res.x;
      if (res.centrarEm) cb.vertical.centrarEm = res.centrarEm;
    });
    escrever();
  }
  const tot = roteiro.cenas.reduce((s, c) => s + INI + c.narracaoTexto.length * SEG + 0.6, 0);
  const fala = roteiro.cenas.reduce((s, c) => s + c.narracaoTexto.length * SEG, 0);
  const mm = (t) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;
  console.log(`${nome}: ${roteiro.cenas.length} cenas, fala ~${mm(fala)} (com folgas sem áudio ~${mm(tot)})`);
}

// trilha de fundo gerada: SÓ quando o usuário pedir música (pedido dele: sem música de fundo por padrão) — base(titulo, 'suspense' | 'comedia' | 'emocional')
export const base = (titulo, trilha = null) => ({ titulo, narrador: 'Narrador', resolucao: [320, 180], volumeBaloes: 0.4, ...(trilha ? { trilha } : {}), cenas: [] });

// Marca o "momento" da história em faixas de cenas (números de cena, começando em 1): { festa: [[10, 22], [25, 32]] }
export function marcar(C, mapa) {
  for (const [m, faixas] of Object.entries(mapa)) for (const [a, b] of faixas) for (let i = a; i <= b; i++) C[i - 1].momento = m;
}

// ---- Sala de aula: TURMA FIXA. Lugares das carteiras (sala-de-aula-diorama, ângulo clássico), alunos "sentado-lado".
export const LUGARES_AULA = [[-4.6, 2.45], [-1.6, 2.45], [1.4, 2.45], [-4.6, 0.75], [-1.6, 0.75], [1.4, 0.75]];
// colegas da turma, em ordem de prioridade (o menino do topete é o protagonista masculino)
export const COLEGAS = [['bia', 'menina-capa'], ['nina', 'rival'], ['aluno', 'aluno'], ['aluna', 'aluna'], ['topete', 'menino-topete']];
// Completa as carteiras vazias com colegas que ainda não estão na cena (sem repetir sprite).
//   livres: lugares que a história quer vazios ([[x, z]]); extra(id): campos a mais (ex.: numero); junto(id): elementos a mais (ex.: guardião)
export function turma(elementos, { livres = [], extra = () => ({}), junto = () => [] } = {}) {
  const sprites = new Set(elementos.map((e) => e.personagem).filter(Boolean)), ids = new Set(elementos.map((e) => e.id));
  const perto = (x, z) => (e) => Math.abs((Array.isArray(e) ? e[0] : e.x ?? 99) - x) < 0.4 && Math.abs((Array.isArray(e) ? e[1] : e.z ?? 99) - z) < 0.4;
  const fila = COLEGAS.filter(([id, sp]) => !sprites.has(sp) && !ids.has(id));
  const novos = [];
  for (const [x, z] of LUGARES_AULA) {
    if (elementos.some(perto(x, z)) || livres.some(perto(x, z)) || !fila.length) continue;
    const [id, sp] = fila.shift();
    novos.push(P(id, sp, x, z, { pose: 'sentado-lado', ...extra(id) }), ...junto(id));
  }
  return [...elementos, ...novos];
}

// Legenda fixa embaixo (76% da altura no Shorts): abaixa a câmera do Shorts (bloco "vertical") de cada cena para os
// personagens ficarem acima da faixa da legenda. dy por cena (múltiplos de 0,25 = 8 px), medido com ferramentas/_altura.mjs.
export function alturaShorts(C, ajustes) {
  for (const [n, dy] of Object.entries(ajustes)) {
    const c = C[Number(n) - 1];
    const v = (c.vertical ||= {});
    const base = v.camera?.y ?? c.camera?.y ?? (c.comodo || /-diorama$/.test(c.cenario || '') ? 3 : 2.2);
    v.camera = { ...(c.camera || {}), ...(v.camera || {}), y: +(base + dy).toFixed(2) };
    // corte de zoom com "y" próprio: no Shorts ele também desce (senão o corte joga todo mundo para baixo da legenda).
    // Um "vertical": { "y" } escrito à mão no corte manda.
    for (const ac of c.acoes || []) if (ac.tipo === 'corte' && ac.y != null && ac.vertical?.y == null) ac.vertical = { ...(ac.vertical || {}), y: +(ac.y + dy).toFixed(2) };
  }
}

// OBSOLETO (scripts antigos): soma dx ao "x" da câmera do "vertical". Hoje o salvar() centraliza sozinho por cima disto.
export function centroShorts(C, ajustes) {
  for (const [n, dx] of Object.entries(ajustes)) {
    const c = C[Number(n) - 1];
    const v = (c.vertical ||= {});
    const cam = { ...(c.camera || {}), ...(v.camera || {}) };
    v.camera = { ...cam, x: +((cam.x ?? 0) + dx).toFixed(2) };
  }
}
