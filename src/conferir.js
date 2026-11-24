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
//   6. gancho: a 1ª cena precisa ter algo se mexendo antes de 0,6 s, título na tela até 0,3 s e não ser de noite
//   8. atravessa: pessoa/objeto que se mexe passando por dentro de outro (mesmo lugar ao mesmo tempo)
//   7. retenção no meio: cena parada antes de 70% do vídeo; "Até que..." depois de 40% do vídeo
//   9. 1ª frase longa demais (gancho), roteiro sem "trilha", "corte" com zoom quebrado
// São avisos (heurística): conferir cada um e corrigir ou justificar.
import { lerRoteiro, caminhoProjeto } from './projeto.js';
import { lerJsonFlexivel } from './biblioteca.js';
import { resolverRoteiro, estadoElemento, estadoCamera } from '../motor/compartilhado/linhaDoTempo.js';
import { centrarCena, yTela } from '../motor/compartilhado/centro.js';
import { larguraTexto } from '../motor/fonte.js';
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
  // vídeo já postado ("postado": true no roteiro): não mexer mais nele, então a conferência não dá avisos
  if (bruto.postado) { console.log(`\n▶ ${nome}: vídeo já postado — conferência pulada (tire "postado" do roteiro para conferir de novo)`); return []; }
  const r = resolverRoteiro(lerRoteiro(dir), new Map(), { fps: 30 });
  r.cenas.forEach((c, i) => { c.cenarioBruto = bruto.cenas[i].cenario; });
  // "vidaNaRua": figurantes automáticos do fundo (pedestres, pombos, carros) não entram na conferência
  for (const c of r.cenas) { const vida = new Set(c.elementos.filter((e) => e.vida).map((e) => e.id)); if (vida.size) { c.elementos = c.elementos.filter((e) => !vida.has(e.id)); c.acoes = c.acoes.filter((a) => !vida.has(a.alvo)); } }
  const tam = await tamanhos();
  const av = [];
  const aviso = (n, tipo, msg) => av.push({ n, tipo, msg });

  // ---------- 0. cenários só de teste/referência (pedido do usuário): mapa-vila, mapa de RPG e o ângulo "rpg" nunca numa cena de vídeo
  if (!/^teste-/.test(nome)) bruto.cenas.forEach((cb, i) => {
    const ang = cb.angulo ?? cb.rua?.angulo;
    if (cb.cenario === 'mapa-vila' || cb.rua?.mapa || ang === 'mapa-rpg' || ang === 'rpg')
      aviso(i + 1, 'teste', `cenário/ângulo só de teste ("${cb.cenario === 'mapa-vila' || cb.rua?.mapa ? 'mapa-vila' : ang}") — serve só como referência; use o diorama normal (rua, praça, cômodo)`);
  });

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
      for (let t = 0; t < c.duracao; t += 0.2) {   // amostrado na cena inteira: pega também quem PASSA por dentro do objeto andando/correndo
        const sp = estadoElemento(c, p, t);
        if (!sp.visivel || sp.yBase > 0.3) continue;                       // em cima de propósito (palanque, banco) usa "y"
        const o = objs.find((o) => { const b = tam(o.sprite).iso; const pz = sp.z ?? p.z ?? 0, m = /^(canteiro|fonte)/.test(o.sprite) ? 0.05 : -0.1;   // canteiro/fonte: pés encostando na borda já parecem dentro; barraca/banco: o vendedor fica colado de propósito
          return sp.x > o.x - m && sp.x < o.x + (b.dj ?? 1) + m && pz > o.z - m && pz < o.z + (b.di ?? 1) + m; });
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

  // ---------- 8. ATRAVESSA: duas coisas no chão ocupando o mesmo lugar ao mesmo tempo (o pão passando "por dentro" do policial,
  // alguém correndo através de outro). Compara pessoas e objetos que se mexem, de 0,25 em 0,25 s.
  for (const c of r.cenas) {
    if ((c.vista !== 'diorama' && c.vista !== 'diagonal')) continue;
    const mexe = new Set((c.acoes || []).filter((a) => ['andar', 'correr', 'mover'].includes(a.tipo) || (a.tipo === 'pular' && a.para != null)).map((a) => a.alvo));   // pulo no lugar não conta
    const corpos = c.elementos.filter((e) => e.sprite && !e.sobre && !e.oculto !== undefined && tam(e.sprite) && (ehPessoa(e, tam) || mexe.has(e.id)) && !tam(e.sprite).iso);
    const ja = new Set();
    for (let t = 0; t < c.duracao; t += 0.25) {
      const st = corpos.map((e) => ({ e, s: estadoElemento(c, e, t) })).filter(({ s }) => s.visivel && (s.yBase ?? 0) < 0.5);
      for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) {
        const A = st[i], B = st[j];
        if (!mexe.has(A.e.id) && !mexe.has(B.e.id)) continue;             // dois parados juntos = posição de propósito
        const chave = A.e.id + '|' + B.e.id;
        if (ja.has(chave)) continue;
        const wa = tam(A.e.sprite).w * (A.e.escala || 1) / PPU, wb = tam(B.e.sprite).w * (B.e.escala || 1) / PPU;
        if (Math.abs(A.s.x - B.s.x) < (wa + wb) * 0.3 && Math.abs((A.e.z ?? 0) - (B.e.z ?? 0)) < 0.35) {
          ja.add(chave); aviso(c.numero, 'atravessa', `"${A.e.id}" e "${B.e.id}" ocupam o mesmo lugar em ~${t.toFixed(1)} s (um passa por dentro do outro) — use outra faixa de "z" ou outro caminho`);
        }
      }
    }
  }

  // ---------- 6. GANCHO: o 1º segundo decide se o público passa o vídeo (dados do canal: sombras abriu com a sombra andando
  // aos 0,3 s → 68,5% continuaram; guardiões abriu parado, 1ª ação aos 2,6 s → só 34,4% continuaram)
  {
    const c = r.cenas[0], MEXE = ['andar', 'correr', 'mover', 'pular', 'trocar', 'aparecer', 'sombra', 'tremer', 'flash', 'magia', 'explosao', 'fogos', 'espirrar', 'desaparecer', 'golpe', 'esporos', 'crescer'];
    const prim = (c?.acoes || []).filter((a) => MEXE.includes(a.tipo)).sort((a, b) => a.inicio - b.inicio)[0];
    if (c && (!prim || prim.inicio > 0.6)) aviso(1, 'gancho', `a 1ª cena não tem nada se mexendo até ${prim ? prim.inicio.toFixed(1) + ' s' : 'o fim'} — o elemento da regra precisa se mexer na tela antes de 0,6 s (o público decide se passa o vídeo no 1º segundo)`);
    // texto na tela no 1º segundo (avatar-v2: título só na cena 2, aos ~3,5 s → 59% passaram; muita gente rola o feed sem som)
    if (c && (!c.titulo || (c.tituloInicio ?? 0.15) > 0.3)) aviso(1, 'gancho', `a 1ª cena ${c.titulo ? 'mostra o título só aos ' + c.tituloInicio + ' s' : 'não tem título'} — pôr o "titulo" (a regra, curta) na cena 1 com "tituloInicio" ≤ 0,3 s: quem rola o feed sem som precisa entender no 1º segundo`);
    if (c && /noite/.test(c.cenarioBruto || c.cenario || '')) aviso(1, 'gancho', 'a 1ª cena é de noite — abrir de dia (imagem escura no celular perde o público no 1º segundo)');
    // 1ª frase curta: a regra precisa estar entendida antes de o polegar passar (sombras: 12 palavras, 64 letras — não passar disso)
    const f1 = (c?.narracaoTexto || '').match(/^[^.!?…]+[.!?…]?/)?.[0].trim() || '';
    const pal = f1.split(/\s+/).filter(Boolean).length;
    if (f1 && (f1.length > 66 || pal > 12)) aviso(1, 'gancho', `a 1ª frase tem ${pal} palavras (${f1.length} letras, ~${(f1.length * 0.065).toFixed(1)} s) — encurtar para no máximo 12 palavras / ~65 letras (o ideal é ~8): "${f1}"`);
  }

  // ---------- 9. RITMO: trilha de fundo (o som nunca fica vazio) e cortes de enquadramento com zoom redondo
  // ---------- [altura] "para": [x, y] em andar/correr/mover muda a ALTURA (y), não a profundidade (z não anda): a pessoa sai flutuando
  for (const c of r.cenas) for (const a of c.acoes) {
    if (!['andar', 'correr', 'mover'].includes(a.tipo) || !Array.isArray(a.para) || !(a.para[1] > 0.3)) continue;
    const e = c.elementos.find((x) => x.id === a.alvo);
    if (e && ehPessoa(e, tam) && !(e.y > 0)) aviso(c.numero, 'altura', `"${a.alvo}" ${a.tipo} com "para": [${a.para}] — o 2º número é a ALTURA (sobe no ar), não a profundidade; para mudar de faixa, use outra cena ou outro "z" fixo`);
  }
  // (sem aviso de "trilha": o usuário pediu vídeos SEM música de fundo por padrão — só quando ele escolher)
  for (const c of r.cenas) for (const a of c.acoes) {
    if (a.tipo === 'camera' && a.corte && a.para?.zoom != null && Math.round(a.para.zoom * 2) !== a.para.zoom * 2) aviso(c.numero, 'corte', `corte com zoom ${a.para.zoom} — usar valores redondos (1, 1.5, 2, 3) para os pixels ficarem alinhados`);
  }

  // ---------- 7. RETENÇÃO NO MEIO (dados do canal: sombras segurou 0:43 de 0:50; guardiões só 0:26 — o público saiu nas cenas
  // paradas e no evento que demorou): cena sem nada se mexendo antes da virada, e o "Até que..." tarde demais
  {
    const MEXE = ['andar', 'correr', 'mover', 'pular', 'trocar', 'aparecer', 'sombra', 'tremer', 'flash', 'magia', 'explosao', 'fogos', 'espirrar', 'desaparecer', 'sumir', 'coletar', 'golpe', 'esporos', 'crescer'];
    const total = r.cenas.reduce((a, c) => a + c.duracao, 0);
    let t0 = 0;
    for (const c of r.cenas) {
      if (t0 < total * 0.7 && !/congel/i.test(c.narracaoTexto || '') && !(c.acoes || []).some((a) => MEXE.includes(a.tipo)))   // "congelou" parado é de propósito
        aviso(c.numero, 'parada', `cena sem nada se mexendo aos ${Math.round(t0)} s (antes da virada) — é onde o público sai; faça o elemento da regra ou alguém se mexer`);
      t0 += c.duracao;
    }
    let t1 = 0; const ev = r.cenas.find((c) => { if (/^\s*Até que/i.test(c.narracaoTexto || '')) return true; t1 += c.duracao; return false; });
    if (ev && t1 > total * 0.4) aviso(ev.numero, 'parada', `o evento ("Até que...") só começa aos ${Math.round(t1)} s (${Math.round(100 * t1 / total)}% do vídeo) — traga para antes de 40% (no das sombras foi aos 35%)`);
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

  // ---------- 4b. [centro] Shorts: quem conta a história fora do meio da tela (a câmera do diorama não fica em cima do mesmo "x").
  // Mesma conta do nm.mjs e do ferramentas/roteiros/centrar-shorts.mjs (centrarCena em motor/compartilhado/centro.js).
  for (const [i, c] of r.cenas.entries()) {
    const cb = bruto.cenas[i], res = cb && centrarCena(c, cb, estadoElemento);
    if (!res) continue;
    const quem = res.centrarEm || cb.vertical?.centrarEm || (cb.elementos || []).filter((e) => e.personagem && !e.figurante).map((e) => e.id);
    const movem = c.acoes.some((a) => ['andar', 'correr'].includes(a.tipo) && quem.includes(a.alvo)
      && Math.abs((typeof a.para === 'number' ? a.para : 0) - (c.elementos.find((e) => e.id === a.alvo)?.x ?? 0)) > 5);
    if (movem) continue;
    if (res.centrarEm) aviso(c.numero, 'centro', `no Shorts, o grupo não cabe nos 180 px (${res.nota}) — rode node ferramentas/roteiros/centrar-shorts.mjs <projeto> ou escolha em quem centrar (foco no nm.mjs / "vertical.centrarEm")`);
    else if (Math.abs(res.desvio) > 20) aviso(c.numero, 'centro', `no Shorts, ${res.nota} ficam ${Math.round(Math.abs(res.desvio))} px à ${res.desvio > 0 ? 'direita' : 'esquerda'} do meio — use "x": ${res.x} na câmera do "vertical" (ou rode node ferramentas/roteiros/centrar-shorts.mjs <projeto>)`);
  }

  // ---------- 4c. [legenda] Shorts: a legenda (palavra por palavra, posição fixa) passando por cima de quem importa para a história.
  // Só conta personagem com papel (não figurante, não "tela") e objeto que age na cena (alvo de alguma ação), e só enquanto a
  // legenda está na tela. Mesma conta de posição do motor (yTela) e mesmo lugar da legenda (motor/ui.js: 76%; 80% com zoom ≥ 1,5).
  if ((r.legendaEstilo || 'palavra') === 'palavra') {
    const rv = JSON.parse(JSON.stringify(lerRoteiro(dir)));
    rv.resolucao = rv.resolucaoVertical || [180, 320];
    for (const c of rv.cenas) {
      for (const [k, v] of Object.entries(c.vertical || {})) c[k] = v && typeof v === 'object' && !Array.isArray(v) && c[k] && typeof c[k] === 'object' && !Array.isArray(c[k]) ? { ...c[k], ...v } : v;
      delete c.vertical;
      c.acoes = (c.acoes || []).map(({ vertical: va, ...ac }) => (va ? { ...ac, ...va } : ac));
    }
    const V = resolverRoteiro(rv, new Map(), { fps: 30 });
    const [W, H] = V.resolucao;
    for (const c of V.cenas) {
      if ((c.vista !== 'diorama' && c.vista !== 'diagonal') || !c.legendasNarracao?.length) continue;
      const posFixa = c.legendaPosicao ?? V.legendaPosicao;
      if (posFixa === 'auto') continue;
      const alvos = new Set(c.acoes.map((ac) => ac.alvo).filter(Boolean));
      const quem = c.elementos.filter((e) => e.sprite && !e.tela && !e.figurante && !e.vida && !e.sobre && !e.sombraPessoa && tam(e.sprite) && (ehPessoa(e, tam) || alvos.has(e.id)));
      const vezes = new Map();
      for (let t = 0; t < c.duracao; t += 0.1) {
        const g = c.legendasNarracao.find((l) => t >= l.ini && t < l.fim);
        if (!g) continue;
        const cam = estadoCamera(c, t), zoom = cam.zoom ?? 1;
        const esc = (g.palavras || []).some((p) => larguraTexto(p.w, 2) > W - 12) ? 1 : 2;
        const larg = larguraTexto(g.texto, esc), linhas = larg > W - 12 ? 2 : 1, wTxt = Math.min(larg, W - 12);
        const centro = H * (typeof posFixa === 'number' ? posFixa : zoom >= 1.5 ? 0.8 : 0.76);
        const L0 = centro - (11 * esc * linhas) / 2, L1 = centro + (11 * esc * linhas) / 2, X0 = (W - wTxt) / 2, X1 = (W + wTxt) / 2;
        for (const e of quem) {
          const st = estadoElemento(c, e, t);
          if (!st.visivel || (st.alpha ?? 1) < 0.2) continue;
          const tm = tam(e.sprite), esE = (e.escala || 1) * (st.escala || 1), z = st.z ?? e.z ?? 0;
          const pe = yTela(st.x, z, st.y, cam, !!c.comodo, H), topo = pe - tm.h * esE * zoom;
          const xc = W / 2 + (st.x - z - ((cam.x ?? 0) - (cam.z ?? 0)) + (c.comodo ? 1.7 : 2.75)) * 16 * zoom, meiaL = (tm.w * esE * zoom) / 4;   // só o miolo do sprite (as bordas têm vazio)
          if (pe < 0 || topo > H || xc + meiaL < 0 || xc - meiaL > W) continue;                     // fora da tela
          const cobreY = Math.min(pe - 2, L1) - Math.max(topo, L0), cobreX = Math.min(xc + meiaL, X1) - Math.max(xc - meiaL, X0);
          if (cobreY > 3 && cobreX > 2 && pe - 2 - L0 > 6) vezes.set(e.id, [...(vezes.get(e.id) || []), { t, pe: Math.round(pe), dy: Math.round(pe - 2 - L0) }]);
        }
      }
      const ruins = [...vezes].filter(([, l]) => l.length >= 3);                                        // só encostou de passagem: ignora
      if (ruins.length) {
        const pior = ruins.flatMap(([, l]) => l).reduce((x, y) => (y.dy > x.dy ? y : x));
        const z = estadoCamera(c, pior.t).zoom ?? 1, passo = (Math.ceil(pior.dy / (4 * z)) * 0.25).toFixed(2);
        aviso(c.numero, 'legenda', `no Shorts, a legenda fica em cima de ${ruins.map(([id]) => `"${id}"`).join(', ')} (pior: ~${pior.t.toFixed(1)} s, ${pior.dy} px acima dos pés) — abaixe a câmera do Shorts ~${passo} (alturaShorts no nm.mjs) ou, se for depois de um corte de zoom, dê a ele um "vertical": { "y" } menor`);
      }
    }
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
  for (const a of av) console.log(`  ⚠ ${a.n ? `cena ${String(a.n).padStart(2)}` : 'vídeo  '} [${a.tipo}] ${a.msg}`);
  return av;
}
