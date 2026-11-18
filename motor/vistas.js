// Vistas de cena. Todas mantêm a câmera de frente (nunca gira para os lados),
// para os pixels continuarem alinhados com a tela.
//   lateral  — cenário em camadas com paralaxe (padrão)
//   diagonal — rua desenhada em diagonal 2:1, câmera ortográfica deslizando
//   avenida  — avenida em perspectiva indo para o fundo
import * as THREE from 'three';
import { criarFundo, ordemPorZ, NOMES_FUNDOS } from './fundos.js';
import { gerarRuaDiagonal, FAIXA } from './cenarios/ruaDiagonal.js';
import { gerarAvenida, ceuAvenida } from './cenarios/avenida.js';
import { estadoCamera } from './compartilhado/linhaDoTempo.js';
import { obterSprite } from './sprites.js';
import { PIXELS_POR_UNIDADE as PPU, FOV } from './compartilhado/util.js';

const snap = (v) => Math.round(v * PPU) / PPU;
const tex = (canvas) => { const t = new THREE.CanvasTexture(canvas); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.NoColorSpace; return t; };

export const NOMES_VISTAS = ['lateral', 'diagonal', 'avenida'];

export function criarVista(c, motor) {
  if (c.vista === 'diagonal') return vistaDiagonal(c, motor);
  if (c.vista === 'avenida') return vistaAvenida(c, motor);
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
  return { m, s };
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
    paraMundo: (el, st, dy = 0) => new THREE.Vector3(snap(st.x), snap(st.y) + dy, el.z ?? 0),
    posicionar(e, st, bob) { e.malha.position.set(snap(st.x), snap(st.y) + bob, e.def.z ?? 0); },
    posicionarSombra(e, st) { e.sombra.position.set(snap(st.x), st.yBase + 1 / PPU, e.def.z ?? 0); },
    atualizarCamera(cam, ef) {
      camera.position.set(snap(cam.x) + ef.tremorX / PPU, snap(cam.y) + ef.tremorY / PPU, D);
      camera.zoom = cam.zoom;
    },
  };
}

// ---------------------------------------------------------------- diagonal
// Coordenadas dos elementos: x = posição AO LONGO da rua (cresce para a direita/cima);
// z = distância a partir da calçada da frente (0 = calçada da frente, ~2.7 = meio da rua,
// ~5.3 = calçada dos prédios); y = altura (pulo).
function vistaDiagonal(c, motor) {
  const { W, H } = motor;
  const op = c.rua || {};
  const rua = gerarRuaDiagonal({ ...op, semente: op.semente ?? c.semente ?? c.numero * 13 });
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(rua.noite ? '#0c0c22' : '#9ac8ec');
  const cv = document.createElement('canvas'); cv.width = rua.W; cv.height = rua.H;
  cv.getContext('2d').putImageData(new ImageData(rua.imagem, rua.W, rua.H), 0, 0);
  const texMundo = tex(cv);
  // O chão e os prédios já vêm iluminados (luz pintada pixel a pixel): material sem iluminação.
  const plano = new THREE.Mesh(new THREE.PlaneGeometry(rua.W / PPU, rua.H / PPU), new THREE.MeshBasicMaterial({ map: texMundo }));
  plano.position.set(rua.W / PPU / 2, rua.H / PPU / 2, 0);
  cena.add(plano);

  const iDe = (el) => FAIXA.calcadaFrente - (el.z ?? 0);
  const ponto = (i, j, altura = 0) => {
    const p = rua.proj(i, j);
    return new THREE.Vector3(Math.round(p.x) / PPU, (rua.H - Math.round(p.y)) / PPU + altura, 0.5);
  };
  const ordem = (i, j) => 2000 + Math.round((i + j) * 20);

  // postes da rua (sprites) + luz para iluminar os personagens que passam perto
  const decor = [];
  if (op.postes !== false) for (const p of rua.postes) {
    const { m } = decoracao('poste');
    m.position.copy(ponto(p.i, p.j)); m.renderOrder = ordem(p.i, p.j);
    cena.add(m); decor.push(m);
    if (rua.noite) { const L = new THREE.PointLight('#ffe0a0', 1.3 * Math.PI, 5, 1); L.position.copy(ponto(p.i, p.j, 2.5)).add(new THREE.Vector3(0, 0, 1)); cena.add(L); }
  }

  const camera = new THREE.OrthographicCamera(-W / 2 / PPU, W / 2 / PPU, H / 2 / PPU, -H / 2 / PPU, -100, 100);
  camera.position.z = 50;
  return {
    cena, camera,
    ambiente: rua.noite ? ['#9aa0d0', 0.78] : ['#ffffff', 1.0],
    climaPadrao: null,
    atualizar: () => {},
    liberar: () => { texMundo.dispose(); },
    ordemInicial: (el) => ordem(iDe(el), -(el.x ?? 0)),
    paraMundo: (el, st, dy = 0) => ponto(iDe(el), -st.x, snap(st.y) + dy),
    posicionar(e, st, bob) {
      const i = iDe(e.def), j = -st.x;
      e.malha.position.copy(ponto(i, j, snap(st.y) + bob));
      e.malha.renderOrder = ordem(i, j) + 1;
    },
    posicionarSombra(e, st) {
      const i = iDe(e.def), j = -st.x;
      e.sombra.position.copy(ponto(i, j, 1 / PPU)); e.sombra.renderOrder = ordem(i, j);
    },
    atualizarCamera(cam, ef) {
      const centro = ponto(FAIXA.meioRua - (cam.z ?? 0), -cam.x, cam.y);
      camera.position.set(snap(centro.x) + ef.tremorX / PPU, snap(centro.y) + ef.tremorY / PPU, 50);
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
