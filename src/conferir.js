// npm run conferir -- <projeto>
// Confere o roteiro SEM renderizar e avisa dos erros que mais se repetiram nos vídeos:
//   1. personagem coberto por árvore/objeto alto ou poste da rua (diorama de rua e praça); 1b. em pé em cima de canteiro/fonte/banco
//   1c. parado em cima de objeto FIXO desenhado na rua (caixotes do mercado) — lista FIXOS_RUA: ao desenhar um objeto novo
//       no fundo da rua (ruaDiagonal.js), acrescentar a área dele lá
//   2. continuidade: com "momento" nas cenas, cobra o elenco de cada momento ("saiDeCena" libera quem sai pela história);
//      sem "momento", acusa quem some e reaparece logo depois no mesmo lugar ("salto": true libera)
//   3. o mesmo sprite fazendo dois personagens diferentes no mesmo vídeo ("figurante": true libera os de fundo)
//   4. personagem fora do cômodo (andando "na parede") ou da praça/rua
//   5. sombras de pessoa demais na cena (máx. 4) e quem segue algo e para antes do fim da fala (vira para a câmera)
// São avisos (heurística): conferir cada um e corrigir ou justificar.
import { lerRoteiro, caminhoProjeto } from './projeto.js';
import { lerJsonFlexivel } from './biblioteca.js';
import { resolverRoteiro, estadoElemento, estadoCamera } from '../motor/compartilhado/linhaDoTempo.js';
import { Pix } from '../motor/pixel.js';
import path from 'node:path';

const PPU = 16;
const ALTOS = /^(arvore|barraca|palanque|poste|fonte|relogio|caixa-correio|carrinho|placa-praca|viatura|cela|estante|guarda-roupa)/;

async function tamanhos() {
  Pix.prototype.paraCanvas = function () { return this; };   // no Node: só precisamos do tamanho dos quadros
  const { obterSprite } = await import('../motor/sprites.js');
  await import('../motor/assets/index.js');
  const cache = new Map();
  return (nome) => {
    if (!nome) return null;
    if (!cache.has(nome)) {
      let s = null;
      try { s = obterSprite(nome); } catch { s = null; }
      cache.set(nome, s ? { w: s.quadros[0].w, h: s.quadros[0].h, personagem: !!s.personagem, iso: s.isoCentro || null, flutua: !!s.flutua } : null);
    }
    return cache.get(nome);
  };
}

const local = (c) => (c.cenarioBruto || c.vista || c.fundo || '?').replace(/-noite(?=-|$)/, '').replace(/-decorada/, '');
const ehPessoa = (e, tam) => !!(e.sprite && tam(e.sprite)?.personagem && !e.sobre);

export async function conferir(nome) {
  const dir = caminhoProjeto(nome);
  const bruto = lerJsonFlexivel(path.join(dir, 'roteiro.json'));
  const r = resolverRoteiro(lerRoteiro(dir), new Map(), { fps: 30 });
  r.cenas.forEach((c, i) => { c.cenarioBruto = bruto.cenas[i].cenario; });
  const tam = await tamanhos();
  const av = [];
  const aviso = (n, tipo, msg) => av.push({ n, tipo, msg });

  // ---------- 1. coberto por objeto alto (diorama de rua/praça: quem tem x + z menor fica na frente)
  const vistos = new Set();
  for (const c of r.cenas) {
    if (c.vista !== 'diorama' && c.vista !== 'diagonal') continue;
    if (c.comodo) continue;
    const altos = c.elementos.filter((e) => e.sprite && ALTOS.test(e.sprite) && !e.oculto && tam(e.sprite));
    // postes da RUA (gerados pelo desenho da rua, não estão nos elementos): lugar fixo no mundo (motor/cenarios/ruaDiagonal.js)
    if (c.rua?.postes !== false) {
      const passo = c.rua?.distanciaPostes ?? 8, fase = c.rua?.fasePostes ?? 6.5;
      for (let k = -8; k <= 8; k++) {
        altos.push({ id: 'poste da rua (calçada dos prédios)', sprite: 'poste-iso', x: fase + k * passo, z: 5.35 });
        altos.push({ id: 'poste da rua (calçada da frente)', sprite: 'poste-iso', x: fase + k * passo - passo / 2, z: 0 });
      }
    }
    const pessoas = c.elementos.filter((e) => ehPessoa(e, tam));
    for (const p of pessoas) {
      const tp = tam(p.sprite);
      for (const t of [0, c.duracao * 0.5, c.duracao - 0.05]) {
        const sp = estadoElemento(c, p, t);
        if (!sp.visivel) continue;
        const ret = (x, z, y, w, h) => ({ x0: (x - z) * PPU - w / 2, x1: (x - z) * PPU + w / 2, y0: (x + z) * 8 + y * PPU, y1: (x + z) * 8 + y * PPU + h });
        const rp = ret(sp.x, p.z ?? 0, sp.y, tp.w * (p.escala || 1), tp.h * (p.escala || 1));
        for (const o of altos) {
          if (sp.y >= 0.5 && /^palanque/.test(o.sprite)) continue;            // está em cima do palanque
          const chave = `${c.numero}|${p.id}|${o.id}`;
          if (vistos.has(chave)) continue;
          const to = tam(o.sprite), so = estadoElemento(c, o, t);
          const cx = (o.x ?? 0) + (to.iso?.dj ?? 0) / 2, cz = (o.z ?? 0) + (to.iso?.di ?? 0) / 2;
          if (!(cx + cz < sp.x + (p.z ?? 0))) continue;                      // o objeto está atrás da pessoa
          const ro = ret(so.x, o.z ?? 0, so.y, to.w * (o.escala || 1), to.h * (o.escala || 1));
          const ix = Math.max(0, Math.min(rp.x1, ro.x1) - Math.max(rp.x0, ro.x0)), iy = Math.max(0, Math.min(rp.y1, ro.y1) - Math.max(rp.y0, ro.y0));
          const frac = (ix * iy) / ((rp.x1 - rp.x0) * (rp.y1 - rp.y0));
          if (frac > 0.3) { vistos.add(chave); aviso(c.numero, 'coberto', `"${p.id}" fica ${Math.round(frac * 100)}% atrás de "${o.id}" (${o.sprite}) em ~${t.toFixed(1)} s — mova a pessoa ou tire o objeto com "remover"`); break; }
        }
      }
    }
  }

  // ---------- 1b. pessoa EM CIMA de objeto baixo (canteiro, fonte, banco, barraca...): pés dentro da base do objeto
  const BASE = /^(canteiro|fonte|banco-iso|barraca|palanque|carrinho|caixote|mesa|cama|sofa)/;
  for (const c of r.cenas) {
    if ((c.vista !== 'diorama' && c.vista !== 'diagonal') || c.comodo) continue;
    const objs = c.elementos.filter((e) => e.sprite && BASE.test(e.sprite) && !e.oculto && tam(e.sprite)?.iso);
    for (const p of c.elementos.filter((e) => ehPessoa(e, tam))) {
      for (const t of [0, c.duracao - 0.05]) {
        const sp = estadoElemento(c, p, t);
        if (!sp.visivel || sp.yBase > 0.3) continue;                       // em cima de propósito (palanque, banco) usa "y"
        const o = objs.find((o) => { const b = tam(o.sprite).iso; return sp.x > o.x + 0.1 && sp.x < o.x + (b.dj ?? 1) - 0.1 && (p.z ?? 0) > o.z + 0.1 && (p.z ?? 0) < o.z + (b.di ?? 1) - 0.1; });
        if (o) { aviso(c.numero, 'em cima', `"${p.id}" está em pé em cima de "${o.id}" (${o.sprite}) em ~${t.toFixed(1)} s — mova para fora da base do objeto`); break; }
      }
    }
  }

  // ---------- 1c. objetos FIXOS desenhados na rua (não estão nos elementos): caixotes do mercado (motor/cenarios/ruaDiagonal.js)
  // ficam no desenho de fundo, então quem para em cima/atrás deles parece "bugado" dentro dos caixotes.
  const FIXOS_RUA = [{ nome: 'caixotes do mercado', tipo: 'mercado', x0: 13.0, x1: 14.6, z0: 4.9 }];
  for (const c of r.cenas) {
    if ((c.vista !== 'diorama' && c.vista !== 'diagonal') || c.comodo || c.rua?.semPredios) continue;
    const tipos = new Set((c.rua?.predios || []).map((p) => p.tipo));
    for (const f of FIXOS_RUA) {
      if (!tipos.has(f.tipo)) continue;
      for (const p of c.elementos.filter((e) => ehPessoa(e, tam))) {
        for (const t of [0, c.duracao * 0.5, c.duracao - 0.05]) {
          const sp = estadoElemento(c, p, t);
          if (!sp.visivel || sp.yBase > 0.3) continue;
          if (sp.x > f.x0 && sp.x < f.x1 && (p.z ?? 0) > f.z0) { aviso(c.numero, 'em cima', `"${p.id}" está nos ${f.nome} (x ${f.x0}–${f.x1}) em ~${t.toFixed(1)} s — pare em outro x da calçada`); break; }
        }
      }
    }
  }

  // ---------- 2. continuidade: mesmo lugar E mesmo enquadramento (câmera perto) em cenas seguidas
  const camX = (c) => c.camera?.x ?? 0, largura = (c) => 10 / (c.camera?.zoom ?? 1);
  const naTela = (c, e) => Math.abs((e.x ?? 0) - camX(c)) < largura(c);
  const presentes = r.cenas.map((c) => new Set(c.elementos.filter((e) => ehPessoa(e, tam) && naTela(c, e)).map((e) => e.id)));
  const saiu = (c, id) => c.acoes.some((a) => a.alvo === id && ['sumir', 'desaparecer', 'coletar'].includes(a.tipo))
    || c.acoes.some((a) => a.alvo === id && (a.tipo === 'andar' || a.tipo === 'correr') && Math.abs((typeof a.para === 'number' ? a.para : a.para?.[0] ?? 0) - camX(c)) > largura(c));
  // Intenção escrita no roteiro (evita "corrigir" o que é da história):
  //   "momento": "festa"     → cenas com o mesmo momento são o MESMO instante da história: quem já apareceu nele
  //                            precisa estar em todas as cenas seguintes desse momento (como elemento, mesmo fora da tela)
  //   "saiDeCena": ["tonho"] → saiu por causa da história depois desta cena (não precisa voltar)
  //   "salto": true          → pulo de tempo / montagem (sem "momento", a heurística não compara esta cena com a anterior)
  const saiDeCena = (i) => new Set(bruto.cenas[i]?.saiDeCena || []);
  const usaMomentos = bruto.cenas.some((c) => c.momento);
  if (usaMomentos) {
    const elenco = new Map();   // momento → Map(id → cena em que entrou)
    r.cenas.forEach((c, i) => {
      const m = bruto.cenas[i].momento;
      if (!m) return;
      if (!elenco.has(m)) elenco.set(m, new Map());
      const E = elenco.get(m), aqui = new Set(c.elementos.filter((e) => ehPessoa(e, tam)).map((e) => e.id));
      const faltam = [...E].filter(([id]) => !aqui.has(id));
      if (faltam.length) aviso(c.numero, 'continuidade', `momento "${m}": faltam ${faltam.map(([id, d]) => `${id} (desde a cena ${d})`).join(', ')} — inclua nas mesmas posições (podem ficar fora da tela) ou marque "saiDeCena" na cena em que saem`);
      for (const [id] of faltam) E.delete(id);   // avisa uma vez só (se voltar depois, entra de novo)
      for (const id of aqui) if (!E.has(id)) E.set(id, c.numero);
      for (const id of saiDeCena(i)) E.delete(id);
      for (const id of aqui) if (saiu(c, id)) E.delete(id);
    });
  } else {
    // sem "momento": heurística — mesmo lugar + mesmo enquadramento + sem pulo de tempo ("salto" ou iris/pixelizar)
    const mesmoLugar = (a, b) => local(a) === local(b) && Math.abs(camX(a) - camX(b)) < 6
      && !bruto.cenas[b.indice]?.salto && b.transicao !== 'iris' && b.transicao !== 'pixelizar';
    // erro clássico: a pessoa está na cena, SOME na seguinte (sem sair) e REAPARECE logo depois, no mesmo lugar
    for (let i = 0; i + 2 < r.cenas.length; i++) {
      const a = r.cenas[i];
      for (const id of presentes[i]) {
        if (saiu(a, id) || saiDeCena(i).has(id)) continue;
        for (let k = i + 1; k <= Math.min(i + 3, r.cenas.length - 2); k++) {
          if (!mesmoLugar(r.cenas[k - 1], r.cenas[k])) break;
          if (r.cenas[k].elementos.some((e) => e.id === id)) break;
          const volta = r.cenas[k + 1];
          if (mesmoLugar(r.cenas[k], volta) && volta.elementos.some((e) => e.id === id)) {
            aviso(r.cenas[k].numero, 'continuidade', `"${id}" está na cena ${a.numero}, some aqui e reaparece na cena ${volta.numero} (mesmo lugar) — deixe na cena, mostre a saída/volta, ou marque "momento"/"saiDeCena"/"salto"`);
            break;
          }
        }
      }
    }
  }

  // ---------- 3. mesmo sprite para personagens diferentes
  const porSprite = new Map();
  for (const c of r.cenas) for (const e of c.elementos) if (ehPessoa(e, tam) && !e.figurante) {   // "figurante": true = fundo, sem nome (pode repetir)
    if (!porSprite.has(e.sprite)) porSprite.set(e.sprite, new Set());
    porSprite.get(e.sprite).add(e.id.replace(/\d+$/, ''));
  }
  for (const [s, ids] of porSprite) if (ids.size > 1) aviso('-', 'elenco', `o sprite "${s}" faz ${ids.size} personagens: ${[...ids].join(', ')} — o público não diferencia; use outro sprite para um deles`);

  // ---------- 4. limites do lugar
  for (const c of r.cenas) {
    for (const e of c.elementos.filter((x) => ehPessoa(x, tam))) {
      for (const t of [0, c.duracao - 0.05]) {
        const st = estadoElemento(c, e, t), z = e.z ?? 0;
        if (c.comodo && (st.x < -9.2 || st.x > 9.2 || z < -0.3 || z > 4)) aviso(c.numero, 'fora', `"${e.id}" sai do cômodo (x ${st.x.toFixed(1)}, z ${z}) — vai parecer andando na parede`);
      }
    }
    const sombras = c.elementos.filter((e) => e.sombraPessoa).length;
    if (sombras > 4) aviso(c.numero, 'sombras', `${sombras} sombras de pessoa (o motor mostra no máximo 4)`);
  }

  // ---------- 5. quem segue algo e para antes do fim da fala (fica de frente para a câmera)
  for (const c of r.cenas) {
    const fimFala = c.narracaoInicio + (c.narracaoTexto || '').length * 0.065;
    const sombraAnda = c.acoes.some((a) => a.tipo === 'andar' && c.elementos.find((e) => e.id === a.alvo)?.sombraPessoa);
    if (!sombraAnda) continue;
    for (const a of c.acoes) {
      const e = c.elementos.find((x) => x.id === a.alvo);
      if (a.tipo === 'andar' && e && ehPessoa(e, tam) && a.inicio + a.duracao < fimFala - 0.8) aviso(c.numero, 'parado', `"${e.id}" para de andar ${(fimFala - a.inicio - a.duracao).toFixed(1)} s antes do fim da fala (vira de frente) — ande até o fim`);
    }
  }

  console.log(`\n▶ Conferência de ${nome}: ${r.cenas.length} cenas`);
  if (!av.length) console.log('  ✔ nenhum problema encontrado');
  for (const a of av) console.log(`  ⚠ cena ${String(a.n).padStart(2)} [${a.tipo}] ${a.msg}`);
  return av;
}
