// Vistas de cena. Todas mantêm a câmera de frente (nunca gira para os lados),
// para os pixels continuarem alinhados com a tela.
//   lateral  — cenário em camadas com paralaxe (padrão)
//   diorama  — estilo padrão, desenhado em diagonal 2:1 com câmera ortográfica:
//              sem "comodo" = rua (antigo nome "diagonal", ainda aceito); com "comodo": { "tipo", "angulo" } = cômodo
//   3d       — modo 3D (guardado para o futuro): sprites 2D num mundo 3D
//   avenida  — avenida em perspectiva indo para o fundo
import * as THREE from 'three';
import { criarFundo, ordemPorZ, NOMES_FUNDOS } from './fundos.js';
import { gerarRuaDiagonal, FAIXA } from './cenarios/ruaDiagonal.js';
import { gerarComodoDiagonal, COMODO, resolverAngulo } from './cenarios/comodoDiagonal.js';
import { gerarPalco3d } from './cenarios/palco3d.js';
import { gerarAvenida, ceuAvenida } from './cenarios/avenida.js';
import { estadoCamera, estadoElemento } from './compartilhado/linhaDoTempo.js';
import { obterSprite } from './sprites.js';
import { PIXELS_POR_UNIDADE as PPU, FOV } from './compartilhado/util.js';

const snap = (v) => Math.round(v * PPU) / PPU;
const tex = (canvas) => { const t = new THREE.CanvasTexture(canvas); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.NoColorSpace; return t; };

export const NOMES_VISTAS = ['lateral', 'diorama', '3d', 'avenida'];   // 'diagonal' = nome antigo do diorama de rua

export function criarVista(c, motor) {
  // "diorama" com "comodo" = interior; sem "comodo" (ou "diagonal") = rua
  if (c.vista === 'diorama' && c.comodo) return vistaComodo(c, motor);
  if (c.vista === 'diorama' || c.vista === 'diagonal') return vistaDiagonal(c, motor);
  if (c.vista === 'avenida') return vistaAvenida(c, motor);
  if (c.vista === '3d') return vista3d(c, motor);
  if (c.vista && c.vista !== 'lateral') motor.avisos.push(`Vista desconhecida "${c.vista}" (cena ${c.numero}); usando lateral.`);
  return vistaLateral(c, motor);
}

// Sprite decorativo (poste etc.) com luz opcional, usado pelas vistas que trazem objetos próprios.
function decoracao(nome) {
  const s = obterSprite(nome);
  const cv = s.quadros[0], w = cv.width / PPU, h = cv.height / PPU;
  const t = tex(cv);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0),
    new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color(0.12, 0.12, 0.12), transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide }));
  // camada que brilha sem depender da luz (lâmpada acesa)
  let br = null;
  if (s.brilho) {
    const tb = tex(s.brilho[0]);
    br = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0), new THREE.MeshBasicMaterial({ map: tb, transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide }));
  }
  return { m, s, br };
}

// ---------------------------------------------------------------- lateral
function vistaLateral(c, motor) {
  const { W, H, D } = motor;
  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 2000);
  camera.position.z = D;
  let xmin = Infinity, xmax = -Infinity, zoomMin = 1;
  for (let t = 0; t <= c.duracao; t += 0.2) {
    const s = estadoCamera(c, t);
    xmin = Math.min(xmin, s.x); xmax = Math.max(xmax, s.x); zoomMin = Math.min(zoomMin, s.zoom);
  }
  if (!NOMES_FUNDOS.includes(c.fundo)) motor.avisos.push(`Fundo desconhecido "${c.fundo}" (cena ${c.numero}); usando floresta-dia.`);
  const fundo = criarFundo(c.fundo, { W, H, D, camY: estadoCamera(c, 0).y, alcance: [xmin, xmax], zoomMin, semente: c.semente ?? c.numero * 13 }, c.fundoOpcoes || {});
  cena.background = fundo.ceu.textura;
  fundo.objetos.forEach((o) => cena.add(o));
  return {
    cena, camera, ambiente: fundo.ambiente, climaPadrao: fundo.clima,
    atualizar(t) {
      fundo.atualizar(t);
      // Paralaxe sem "arrastar" pixels: cada camada anda sempre um número inteiro de pixels na tela.
      const cx = camera.position.x;
      for (const o of fundo.objetos) {
        const ppu = o.userData?.ppu;
        if (!ppu) continue;
        if (o.userData.x0 == null) o.userData.x0 = o.position.x;
        o.position.x = cx + Math.round((o.userData.x0 - cx) * ppu) / ppu;
      }
    },
    liberar: () => fundo.ceu.textura.dispose(),
    ordemInicial: (el, i) => ordemPorZ(el.z ?? 0) + 2 + i * 2,
    paraMundo: (el, st, dy = 0) => new THREE.Vector3(snap(st.x), snap(st.y) + dy, st.z ?? el.z ?? 0),
    paraMundoSuave: (el, st) => new THREE.Vector3(st.x, st.y, st.z ?? el.z ?? 0),   // monstros 3D: sem prender à grade
    posicionar(e, st, bob) { e.malha.position.set(snap(st.x), snap(st.y) + bob, st.z ?? e.def.z ?? 0); },
    posicionarSombra(e, st) { e.sombra.position.set(snap(st.x), st.yBase + 1 / PPU, st.z ?? e.def.z ?? 0); },
    atualizarCamera(cam, ef) {
      camera.position.set(snap(cam.x) + ef.tremorX / PPU, snap(cam.y) + ef.tremorY / PPU, D);
      camera.zoom = cam.zoom;
    },
  };
}

// Céu da vista diorama: faixas de cor com dithering na transição (e estrelas à noite).
function ceuDiagonal(W, H, noite) {
  const cores = noite ? ['#05061a', '#0a0c26', '#141638', '#22204a'] : ['#4a8ad8', '#62a2e4', '#80baee', '#a4d0f4'];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < H; y++) {
    const f = (y / H) * (cores.length - 1), i = Math.min(cores.length - 1, Math.floor(f)), fr = f - i;
    for (let x = 0; x < W; x++) {
      const lim = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
      g.fillStyle = fr > 0.65 && (fr - 0.65) / 0.35 > lim ? cores[Math.min(cores.length - 1, i + 1)] : cores[i];
      g.fillRect(x, y, 1, 1);
    }
  }
  if (noite) {
    let sem = 7;
    const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < (W * H) / 300; k++) { g.fillStyle = rnd() > 0.7 ? '#ffffff' : '#8890c0'; g.fillRect(Math.floor(rnd() * W), Math.floor(rnd() * H * 0.7), 1, 1); }
  }
  return tex(cv);
}

// ---------------------------------------------------------------- diorama
// Coordenadas dos elementos: x = posição AO LONGO da rua (cresce para a direita/cima);
// z = distância a partir da calçada da frente (0 = calçada da frente, ~2.7 = meio da rua,
// ~5.3 = calçada dos prédios); y = altura (pulo).
function vistaDiagonal(c, motor) {
  if (c.comodo) return vistaComodo(c, motor);
  const { W, H } = motor;
  const op = c.rua || {};
  // Comprimento da rua calculado pelo caminho da câmera e dos personagens (com folga),
  // para a câmera nunca chegar ao fim do desenho.
  let alcance = 0;
  for (let t = 0; t <= c.duracao; t += 0.25) {
    alcance = Math.max(alcance, Math.abs(estadoCamera(c, t).x));
    for (const el of c.elementos) alcance = Math.max(alcance, Math.abs(estadoElemento(c, el, t).x));
  }
  const comprimento = Math.max(op.comprimento ?? 44, Math.ceil(2 * (alcance + 20)));
  const rua = gerarRuaDiagonal({ ...op, comprimento, semente: op.semente ?? c.semente ?? c.numero * 13 });
  const cena = new THREE.Scene();
  // Céu em degradê (pixel art) atrás de tudo: aparece acima dos prédios em vez de um fundo vazio.
  cena.background = ceuDiagonal(W, H, rua.noite);
  const cv = document.createElement('canvas'); cv.width = rua.W; cv.height = rua.H;
  cv.getContext('2d').putImageData(new ImageData(rua.imagem, rua.W, rua.H), 0, 0);
  const texMundo = tex(cv);
  // O chão e os prédios já vêm iluminados (luz pintada pixel a pixel): material sem iluminação.
  const plano = new THREE.Mesh(new THREE.PlaneGeometry(rua.W / PPU, rua.H / PPU), new THREE.MeshBasicMaterial({ map: texMundo, transparent: true, alphaTest: 0.5 }));
  plano.position.set(rua.W / PPU / 2, rua.H / PPU / 2, 0);
  cena.add(plano);

  const iDe = (el, st) => FAIXA.calcadaFrente - (st?.z ?? el.z ?? 0);
  const ponto = (i, j, altura = 0) => {
    const p = rua.proj(i, j);
    return new THREE.Vector3(Math.round(p.x) / PPU, (rua.H - Math.round(p.y)) / PPU + altura, 0.5);
  };
  const ordem = (i, j) => 2000 + Math.round((i + j) * 20);

  // postes da rua (sprites) + luz para iluminar os personagens que passam perto
  const decor = [];
  // postes: o mesmo poste isométrico da praça ("postes": "antigo" volta ao desenho chapado de antes)
  const nomePoste = op.postes === 'antigo' ? 'poste' : rua.noite ? 'poste-iso-aceso' : 'poste-iso';
  if (op.postes !== false) for (const p of rua.postes) {
    const { m, br } = decoracao(nomePoste);
    m.position.copy(ponto(p.i, p.j)); m.renderOrder = ordem(p.i - 0.15, p.j - 0.15);
    cena.add(m); decor.push(m);
    if (br) { br.position.copy(m.position); br.renderOrder = m.renderOrder + 1; cena.add(br); }
    if (rua.noite) { const L = new THREE.PointLight('#ffe0a0', 1.3 * Math.PI, 5, 1); L.position.copy(ponto(p.i, p.j, 2.5)).add(new THREE.Vector3(0, 0, 1)); cena.add(L); }
  }

  const camera = new THREE.OrthographicCamera(-W / 2 / PPU, W / 2 / PPU, H / 2 / PPU, -H / 2 / PPU, -100, 100);
  camera.position.z = 50;
  return {
    cena, camera,
    ambiente: rua.noite ? ['#9aa0d0', 0.78] : ['#ffffff', 1.0],
    climaPadrao: null,
    atualizar: () => {},
    liberar: () => { texMundo.dispose(); cena.background?.dispose?.(); },
    ordemInicial: (el) => ordem(iDe(el), -(el.x ?? 0)),
    paraMundo: (el, st, dy = 0) => ponto(iDe(el, st), -st.x, snap(st.y) + dy),
    posicionar(e, st, bob) {
      const i = iDe(e.def, st), j = -st.x;
      e.malha.position.copy(ponto(i, j, snap(st.y) + bob));
      // objetos isométricos (praça): a ordem usa o centro do objeto, não o canto da frente
      const c = e.sprite.isoCentro, ri = c ? (c.di ?? 1) / 2 : 0, rj = c ? (c.dj ?? 1) / 2 : 0;
      e.malha.renderOrder = ordem(i - ri, j - rj) + 1 + (e.def.sobre ? 2 : 0);   // o que está "sobre" alguém fica na frente dele
    },
    posicionarSombra(e, st) {
      const i = iDe(e.def, st), j = -st.x;
      e.sombra.position.copy(ponto(i, j, 1 / PPU)); e.sombra.renderOrder = ordem(i, j);
    },
    atualizarCamera(cam, ef) {
      const centro = ponto(FAIXA.meioRua - (cam.z ?? 0), -cam.x, cam.y);
      camera.position.set(snap(centro.x) + ef.tremorX / PPU, snap(centro.y) + ef.tremorY / PPU, 50);
      camera.zoom = cam.zoom;
    },
  };
}

// Fundo do "mundo sombrio": preto com um padrão de losangos bem apagado (fica parado na tela).
function fundoSombrio(W, H, tema) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = tema.fundo; g.fillRect(0, 0, W, H);
  g.fillStyle = tema.grade;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = (x + 2 * y) % 32, b = (x - 2 * y + 4096) % 32;
    if (a === 0 || b === 0) g.fillRect(x, y, 1, 1);
  }
  return tex(cv);
}

// ---------------------------------------------------------------- diagonal: interior (cômodo)
// Mesmas coordenadas da rua: x = ao longo do cômodo; z = distância a partir da frente (0 = perto da
// borda do piso, ~3.8 = encostado na parede do fundo); y = altura. Cada móvel é um plano próprio:
// o personagem que está na frente dele é desenhado por cima, o que está atrás fica escondido.
function vistaComodo(c, motor) {
  const { W, H } = motor;
  const op = typeof c.comodo === 'string' ? { tipo: c.comodo } : c.comodo;
  // o cômodo se estende para a esquerda até onde a câmera e os personagens chegam (com folga de uma tela)
  // "espelhar": o cômodo é desenhado pelo outro lado da diagonal (parede do fundo subindo para a esquerda).
  // A câmera continua de frente; só o desenho é espelhado. No espelhado, o x do roteiro = -x do desenho,
  // então andar para +x continua indo para a direita na tela.
  const ang = resolverAngulo(op);
  if (ang.aviso) motor.avisos.push(`${ang.aviso} (cena ${c.numero})`);
  const esp = ang.espelhar, xg = (x) => (esp ? -x : x);
  let minX = 0;
  for (let t = 0; t <= c.duracao; t += 0.25) {
    minX = Math.min(minX, xg(estadoCamera(c, t).x));
    for (const el of c.elementos) minX = Math.min(minX, xg(estadoElemento(c, el, t).x));
  }
  const extra = op.inicio == null ? { inicio: Math.min(-9, Math.floor(minX) - 14) } : {};
  const cm = gerarComodoDiagonal({ ...op, ...extra, semente: op.semente ?? c.semente ?? c.numero * 13 });
  if (esp) {
    const virar = (img, w, h) => { const o = new Uint8ClampedArray(img.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o.set(img.subarray((y * w + x) * 4, (y * w + x) * 4 + 4), (y * w + (w - 1 - x)) * 4); return o; };
    cm.imagem = virar(cm.imagem, cm.W, cm.H);
    for (const p of cm.pecas) { p.imagem = virar(p.imagem, p.w, p.h); p.x0 = cm.W - p.x0 - p.w; }
    const proj = cm.proj; cm.proj = (i, j, h) => { const p = proj(i, j, h); return { x: cm.W - p.x, y: p.y }; };
  }
  const jDe = (x) => (esp ? x : -x);
  const cena = new THREE.Scene();
  cena.background = cm.tema ? fundoSombrio(W, H, cm.tema) : cm.exterior ? ceuDiagonal(W, H, cm.noite) : new THREE.Color(op.fundo || (cm.noite ? '#0c0e1c' : '#1a1c2c'));
  const plano = (img, w, h, x0, y0, z) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    cv.getContext('2d').putImageData(new ImageData(img, w, h), 0, 0);
    const t = tex(cv);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w / PPU, h / PPU), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, depthWrite: false }));
    m.position.set((x0 + w / 2) / PPU, (cm.H - y0 - h / 2) / PPU, z);
    cena.add(m);
    return { m, t };
  };
  const base = plano(cm.imagem, cm.W, cm.H, 0, 0, 0);
  base.m.renderOrder = 1000;
  // móveis em ordem de profundidade (os de cima de outro móvel logo depois dele)
  const pecas = cm.pecas.map((p) => ({ ...p, chave: (p.i0 + p.i1) / 2 + (p.j0 + p.j1) / 2 + (p.sobre ? 0.3 : 0) })).sort((a, b) => a.chave - b.chave);
  pecas.forEach((p, n) => { p.ordem = 2000 + n * 10; p.malha = plano(p.imagem, p.w, p.h, p.x0, p.y0, 0.4); p.malha.m.renderOrder = p.ordem; });
  // personagem: logo depois do último móvel que está atrás dele
  // (só contam os móveis que encostam no personagem na tela: móveis longe não bagunçam a ordem)
  const ordemEm = (i, j) => {
    const pt = cm.proj(i, j), x0 = pt.x - 15, x1 = pt.x + 15, y0 = pt.y - 48, y1 = pt.y + 2;
    let o = 1990, frente = Infinity;
    for (const p of pecas) {
      if (p.x0 > x1 || p.x0 + p.w < x0 || p.y0 > y1 || p.y0 + p.h < y0) continue;
      if (i >= p.i1 - 0.12 || j >= p.j1 - 0.12) o = Math.max(o, p.ordem); else frente = Math.min(frente, p.ordem);
    }
    if (o >= frente) o = frente - 10;                   // na dúvida, o móvel da frente cobre o personagem
    return o + 5 + Math.max(0, Math.min(3.9, (i + j + 20) / 12));
  };
  for (const l of cm.noite ? cm.luzes : []) {
    const L = new THREE.PointLight(l.cor || '#ffe0a0', 1.1 * Math.PI, 4.5, 1);
    const p = cm.proj(l.i, l.j, l.h);
    L.position.set(Math.round(p.x) / PPU, (cm.H - Math.round(p.y)) / PPU, 1.5); cena.add(L);
  }
  const iDe = (el, st) => COMODO.frente - (st?.z ?? el.z ?? 0);
  const ponto = (i, j, altura = 0) => {
    const p = cm.proj(i, j);
    return new THREE.Vector3(Math.round(p.x) / PPU, (cm.H - Math.round(p.y)) / PPU + altura, 0.5);
  };
  const camera = new THREE.OrthographicCamera(-W / 2 / PPU, W / 2 / PPU, H / 2 / PPU, -H / 2 / PPU, -100, 100);
  camera.position.z = 50;
  return {
    cena, camera,
    ambiente: cm.noite && !cm.tema ? ['#7a84c0', 0.62] : ['#ffffff', 1.0],
    climaPadrao: cm.tema ? 'vagalumes' : null,
    atualizar: () => {},
    liberar: () => { base.t.dispose(); pecas.forEach((p) => p.malha.t.dispose()); },
    ordemInicial: (el) => ordemEm(iDe(el), jDe(el.x ?? 0)),
    paraMundo: (el, st, dy = 0) => ponto(iDe(el, st), jDe(st.x), snap(st.y) + dy),
    posicionar(e, st, bob) {
      const i = iDe(e.def, st), j = jDe(st.x);
      e.malha.position.copy(ponto(i, j, snap(st.y) + bob));
      e.malha.renderOrder = ordemEm(i, j) + (e.def.sobre ? 2 : 0);
    },
    posicionarSombra(e, st) {
      const i = iDe(e.def, st), j = jDe(st.x);
      e.sombra.position.copy(ponto(i, j, 1 / PPU)); e.sombra.renderOrder = ordemEm(i, j) - 0.5;
    },
    atualizarCamera(cam, ef) {
      const centro = ponto(COMODO.meio - (cam.z ?? 0), jDe(cam.x), cam.y);
      camera.position.set(snap(centro.x) + ef.tremorX / PPU, snap(centro.y) + ef.tremorY / PPU, 50);
      camera.zoom = cam.zoom;
    },
  };
}

// ---------------------------------------------------------------- 3d
// Personagens e objetos 2D (sprites) em pé num mundo 3D (chão, paredes e luz de verdade).
// A câmera fica fixa, só inclinada para baixo (nunca gira para os lados); ela desliza em x/z e aproxima (zoom).
// Coordenadas: x = lateral, z = profundidade (0 = meio do palco; negativo = fundo), y = altura.
// Câmera: x, z = ponto do chão que fica no centro; y = altura desse ponto; zoom.
// Os sprites ficam em pé (verticais) e um pouco mais altos (1/cos da inclinação), para aparecerem
// na tela com a proporção original.
function vista3d(c, motor) {
  const { W, H } = motor;
  const op = typeof c.palco === 'string' ? { tipo: c.palco } : (c.palco || {});
  const pal = gerarPalco3d({ ...op, semente: op.semente ?? c.semente ?? c.numero * 13 });
  const cena = new THREE.Scene();
  cena.background = pal.externo ? ceuDiagonal(W, H, pal.noite) : new THREE.Color(op.fundo || pal.fundo);
  if (pal.neblina) cena.fog = new THREE.Fog(...pal.neblina);
  cena.add(pal.grupo);
  const incl = ((op.inclinacao ?? (pal.externo ? 24 : 30)) * Math.PI) / 180;
  const dist = op.distancia ?? 21;
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 400);
  const k = 1 / Math.cos(incl);
  return {
    cena, camera, ambiente: pal.ambiente, climaPadrao: null, sombraDeitada: true, apoiarPeloPe: true, escalaY: k,
    atualizar: () => {},
    liberar: () => pal.grupo.traverse((o) => { o.geometry?.dispose(); for (const m of [].concat(o.material || [])) { m.map?.dispose(); m.dispose(); } }),
    ordemInicial: () => 1,
    paraMundo: (el, st, dy = 0) => new THREE.Vector3(st.x, (st.y + dy) * k, el.z ?? 0),
    posicionar(e, st, bob) { e.malha.position.set(st.x, (st.y + bob) * k, e.def.z ?? 0); e.malha.renderOrder = 1; },
    posicionarSombra(e, st) { e.sombra.position.set(st.x, 0.02, e.def.z ?? 0); e.sombra.renderOrder = 0; },
    atualizarCamera(cam, ef) {
      // nos cômodos o centro fica mais para o fundo e mais alto: cabe a parede inteira e os móveis do fundo
      // ficam perto do tamanho original (sprites longe da câmera encolhem e perdem linhas de pixel)
      const aj = pal.externo ? { y: 0, z: 0 } : { y: 0.7, z: -2 };
      const alvo = new THREE.Vector3(cam.x + ef.tremorX / PPU, cam.y + aj.y + ef.tremorY / PPU, (cam.z ?? 0) + aj.z);
      camera.position.set(alvo.x, alvo.y + Math.sin(incl) * dist, alvo.z + Math.cos(incl) * dist);
      camera.lookAt(alvo);                               // mesmo x: só inclina para baixo, sem girar para os lados
      camera.zoom = cam.zoom;
    },
  };
}

// ---------------------------------------------------------------- avenida
// Coordenadas: x = lateral (-6..6; |x|<3 é o asfalto), z = profundidade (positivo = perto da câmera),
// y = altura. Câmera: x lateral, y altura, z posição ao longo da avenida.
function vistaAvenida(c, motor) {
  const { W, H } = motor;
  const op = c.avenida || {};
  const av = gerarAvenida({ ...op, semente: op.semente ?? c.semente ?? c.numero * 13 });
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(av.ceu);
  cena.fog = new THREE.Fog(...av.neblina);
  cena.add(av.grupo);
  const lua = new THREE.DirectionalLight(av.noite ? '#b0b8ff' : '#fff4e0', (av.noite ? 0.4 : 0.6) * Math.PI); lua.position.set(-2, 6, 3); cena.add(lua);
  const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 300);
  const decor = [];
  if (op.postes !== false) for (const p of av.postes) {
    const { m } = decoracao('poste');
    m.position.set(p.x, 0, p.z); cena.add(m); decor.push(m);
    if (av.noite) { const L = new THREE.PointLight('#ffe0a0', 1.6 * Math.PI, 7, 1); L.position.set(p.x, 2.5, p.z + 0.4); cena.add(L); }
  }
  // A câmera 3D fica parada na posição base. Para acompanhar o protagonista, o ENQUADRAMENTO
  // desliza em pixels inteiros (setViewOffset): o cenário se move idêntico, sem pixels "tremendo".
  const base = c.camera;
  const FOLGA = 4;                                    // largura virtual = (1 + 2*FOLGA) telas
  const LARG = W * (1 + 2 * FOLGA);
  const focal = () => (H / 2) / Math.tan((camera.fov * Math.PI) / 360);
  const real = !!op.movimentoReal;                    // teste: câmera se move de verdade
  const camRef = () => (real ? camera.position : { x: base.x, z: base.z ?? 11 });
  const ppuEm = (z) => focal() / Math.max(0.6, camRef().z - z);       // pixels por unidade nessa profundidade
  const zRef = () => { const el = c.seguir && c.elementos.find((e) => e.id === c.seguir); return el?.z ?? 3; };
  const presoX = (x, z) => { const k = ppuEm(z), cx = camRef().x; return cx + Math.round((x - cx) * k) / k; };
  const presoY = (y, z) => { const k = ppuEm(z); return Math.round(y * k) / k; };
  camera.fov = 52 / (base.zoom ?? 1);
  camera.aspect = LARG / H;
  camera.position.set(base.x, base.y, base.z ?? 11);
  camera.lookAt(base.x, base.y - 1.2, (base.z ?? 11) - 12);
  for (const d of decor) d.quaternion.copy(camera.quaternion);
  camera.updateMatrixWorld();
  const ceu = ceuAvenida(camera, { larg: LARG, alt: Math.ceil(H * 1.15), focal: focal(), noite: av.noite, semente: (op.semente ?? c.numero * 13) + 1 });
  cena.add(ceu);
  return {
    cena, camera, ambiente: av.ambiente, climaPadrao: null, sombraDeitada: true,
    caminhadaSincronizada: true, apoiarPeloPe: true,   // caminhada nova só na avenida
    atualizar: (t) => av.atualizar(t),
    liberar: () => { av.liberar(); ceu.userData.textura.dispose(); },
    ordemInicial: () => 0,
    paraMundo: (el, st, dy = 0) => { const z = el.z ?? 3; return new THREE.Vector3(presoX(st.x, z), presoY(st.y + dy, z), z); },
    posicionar(e, st, bob) {
      const z = e.def.z ?? 3;
      e.malha.position.set(presoX(st.x, z), presoY(st.y + bob, z), z);   // preso à grade de pixels
      e.malha.quaternion.copy(camera.quaternion);       // sprites sempre de frente para a câmera
    },
    posicionarSombra(e, st) { const z = e.def.z ?? 3; e.sombra.position.set(presoX(st.x, z), 0.02, z); },
    atualizarCamera(cam, ef) {
      if (real) {
        // a câmera anda de verdade; o passo lateral é ajustado para o plano dos personagens
        // andar pixels inteiros. O céu acompanha a câmera (fica "no infinito").
        const z = cam.z ?? base.z ?? 11;
        camera.position.z = z;
        const k = ppuEm(zRef());
        camera.position.set(base.x + Math.round((cam.x - base.x) * k) / k + ef.tremorX / k, cam.y + ef.tremorY / k, z);
        camera.fov = 52 / (cam.zoom ?? 1);
        camera.setViewOffset(LARG, H, W * FOLGA, 0, W, H);
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        ceu.position.copy(camera.position).addScaledVector(dir, 150);
        return;
      }
      const dx = Math.round((cam.x - base.x) * ppuEm(zRef())) + ef.tremorX;
      camera.setViewOffset(LARG, H, W * FOLGA + dx, -ef.tremorY, W, H);
    },
  };
}
