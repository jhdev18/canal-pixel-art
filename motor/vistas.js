// Vistas de cena. Todas mantêm a câmera de frente (nunca gira para os lados),
// para os pixels continuarem alinhados com a tela.
//   lateral  — cenário em camadas com paralaxe (padrão)
//   diorama  — estilo padrão, desenhado em diagonal 2:1 com câmera ortográfica:
//              sem "comodo" = rua (antigo nome "diagonal", ainda aceito); com "comodo": { "tipo", "angulo" } = cômodo
//   3d       — modo 3D (guardado para o futuro): sprites 2D num mundo 3D
//   avenida  — avenida em perspectiva indo para o fundo
import * as THREE from 'three';
import { criarFundo, ordemPorZ, NOMES_FUNDOS } from './fundos.js';
import { gerarRuaDiagonal, FAIXA, nevoaCor, nevoaZ } from './cenarios/ruaDiagonal.js';
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
function ceuDiagonal(W, H, noite, tarde = false) {
  const cores = noite ? ['#05061a', '#0a0c26', '#141638', '#22204a'] : tarde ? ['#6a5aa8', '#c86a8a', '#f08a5a', '#f8c070'] : ['#4a8ad8', '#62a2e4', '#80baee', '#a4d0f4'];
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

// PROTÓTIPO (isekai): fundo de MATA FECHADA no lugar do céu ("rua": { "ceu": "mata" }): fileiras de copas de árvore escuras
// (mais escuras embaixo, com brilho de folha em cima), para a clareira não parecer uma ilha flutuando no céu azul.
function mataDiagonal(W, H) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  let sem = 11;
  const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  g.fillStyle = '#16341e'; g.fillRect(0, 0, W, H);
  const FILEIRAS = [['#1e4426', '#265030', '#2e5e36'], ['#24502c', '#2e6036', '#3a7040'], ['#2a5a30', '#36683a', '#447a46']];
  const passo = Math.max(10, Math.round(H / 9));
  for (let lin = -1; lin * passo < H + passo; lin++) {
    const cores = FILEIRAS[((lin % 3) + 3) % 3];
    for (let x0 = -12 + (lin % 2) * 9; x0 < W + 12; x0 += 14 + Math.floor(rnd() * 6)) {
      const r = 9 + Math.floor(rnd() * 5), cx = x0, cy = lin * passo + Math.floor(rnd() * 4);
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
        if (x * x + y * y > r * r) continue;
        const luz = (-x - y) / (r * 1.6);   // luz vindo de cima à esquerda
        g.fillStyle = luz > 0.45 ? cores[2] : luz > -0.2 ? cores[1] : cores[0];
        g.fillRect(cx + x, cy + y, 1, 1);
      }
      for (let k = 0; k < 3; k++) { g.fillStyle = '#4e8a4c'; g.fillRect(cx - Math.floor(rnd() * r * 0.6), cy - Math.floor(rnd() * r * 0.6), 1, 1); }   // folhinhas claras
    }
  }
  return tex(cv);
}

// ---------------------------------------------------------------- sombra que se alastra (diorama de rua)
export const GLSL_BAYER = /* glsl */ `
float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0)), i = x + y * 4;
  float m[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  for (int k = 0; k < 16; k++) if (k == i) return (m[k] + 0.5) / 16.0;
  return 0.5;
}`;
function criarSombraChao(rua) {
  const { W, H, pi, pj, ph, tipo } = rua;
  const dados = new Float32Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x, d = ((H - 1 - y) * W + x) * 4;   // textura de baixo para cima
    if (!tipo[k]) continue;
    dados[d] = pi[k]; dados[d + 1] = pj[k]; dados[d + 2] = ph[k]; dados[d + 3] = 1;
  }
  const tPos = new THREE.DataTexture(dados, W, H, THREE.RGBAFormat, THREE.FloatType);
  tPos.magFilter = tPos.minFilter = THREE.NearestFilter; tPos.needsUpdate = true;
  const u = { tPos: { value: tPos }, uTam: { value: new THREE.Vector2(W, H) }, uO: { value: new THREE.Vector3(0, 0, -1) }, uT: { value: 0 },
    uPes: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, 0, 0, 0)) }, uDir: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(-1, 0, 2.6, 0)) },
    uCor: { value: new THREE.Color('#0c0816') }, uBorda: { value: new THREE.Color('#4a2a7a') } };
  const mat = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, depthTest: false,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: GLSL_BAYER + `
      uniform sampler2D tPos; uniform vec2 uTam; uniform vec3 uO; uniform float uT; uniform vec3 uCor, uBorda; varying vec2 vUv;
      uniform vec4 uPes[4]; uniform vec4 uDir[4];   // pessoa k: pés (i, j), alpha, olhos | direção (di, dj), tamanho
      // silhueta de pessoa em coordenadas normalizadas: u = 0 (pés) .. 1 (cabeça), w = lado
      float silhueta(float u, float w, float t) {
        w += sin(t * 3.0 + u * 9.0) * 0.006;                       // tremula de leve (está viva)
        float aw = abs(w);
        if (u < 0.0 || u > 1.0) return 0.0;
        if (length(vec2(w, (u - 0.9) * 0.9)) < 0.075) return 1.0;   // cabeça
        if (u > 0.8 && u < 0.84 && aw < 0.035) return 1.0;           // pescoço
        if (u > 0.44 && u < 0.81 && aw < mix(0.085, 0.12, smoothstep(0.6, 0.8, u))) return 1.0;   // tronco e ombros
        if (u > 0.47 && u < 0.79 && aw > 0.125 && aw < 0.165 - (0.79 - u) * 0.05) return 1.0;      // braços
        if (u < 0.46 && aw > 0.012 && aw < 0.072 - u * 0.03) return 1.0;                            // pernas
        return 0.0;
      }
      // PROTÓTIPO: silhueta de avatar de bloco (cabeça quadrada, tronco largo, braços e pernas retos; não tremula)
      float silhuetaBloco(float u, float w) {
        float aw = abs(w);
        if (u < 0.0 || u > 1.0) return 0.0;
        if (u > 0.8 && aw < 0.085) return 1.0;                                   // cabeça quadrada
        if (u > 0.45 && u < 0.79 && aw < 0.125) return 1.0;                      // tronco
        if (u > 0.46 && u < 0.79 && aw > 0.135 && aw < 0.195) return 1.0;        // braços
        if (u < 0.45 && aw > 0.006 && aw < 0.125) return 1.0;                    // pernas (com o vão no meio)
        return 0.0;
      }
      void main() {
        vec2 px = floor(vUv * uTam);
        vec4 p = texture2D(tPos, (px + 0.5) / uTam);
        if (p.a < 0.5) discard;
        // sombras em forma de pessoa (deitadas no chão a partir dos pés; sobem a parede quando chegam nela)
        for (int k = 0; k < 4; k++) {
          if (uPes[k].z <= 0.0) continue;
          vec2 v = p.xy - uPes[k].xy, d = uDir[k].xy, n = vec2(-d.y, d.x);
          float L = uDir[k].z, u = (dot(v, d) + p.z / 16.0) / L, w = dot(v, n) / L;
          if ((uDir[k].w > 0.5 ? silhuetaBloco(u, w) : silhueta(u, w, uT)) > 0.5) {
            if (uPes[k].z < 0.999 && bayer4(px) > uPes[k].z) continue;       // aparecendo/sumindo em pontilhado
            if (uPes[k].w > 0.5 && abs(u - 0.915) < 0.012 && abs(abs(w) - 0.03) < 0.014) { gl_FragColor = vec4(1.0, 0.35, 0.42, 1.0); return; }
            gl_FragColor = vec4(uCor, 0.88); return;
          }
        }
        if (uO.z <= 0.0) discard;
        vec2 dd = p.xy - uO.xy; float d = length(dd), ang = atan(dd.y, dd.x);
        float rr = uO.z * (0.8 + 0.14 * sin(ang * 5.0 + 1.3) + 0.06 * sin(ang * 13.0 + uT * 1.7));
        float m = rr - (d + p.z / 24.0);            // altura: a sombra precisa avançar mais para subir a parede
        if (m < 0.0) discard;
        if (m < 0.55 && bayer4(px) > m / 0.55) discard;   // borda esfiapada (pontilhado)
        float veia = step(0.93, fract(sin(dot(floor(px / 3.0), vec2(12.9898, 78.233))) * 43758.5453 + uT * 0.15));
        vec3 c = m < 0.3 ? uBorda : mix(uCor, uBorda, veia * 0.45);
        gl_FragColor = vec4(c, m < 0.3 ? 0.95 : 0.9);
      }` });
  const malha = new THREE.Mesh(new THREE.PlaneGeometry(W / PPU, H / PPU), mat);
  return {
    malha,
    atualizar(s) {
      if (!s) { u.uO.value.z = -1; return; }
      u.uO.value.set(s.i, s.j, s.R); u.uT.value = s.t;
      if (s.cor) u.uCor.value.set(s.cor); if (s.borda) u.uBorda.value.set(s.borda);
    },
    pessoas(lista, t) {
      u.uT.value = t;
      for (let k = 0; k < 4; k++) {
        const p = lista[k];
        if (!p) { u.uPes.value[k].set(0, 0, 0, 0); continue; }
        u.uPes.value[k].set(p.i, p.j, p.alpha, p.olhos ? 1 : 0); u.uDir.value[k].set(p.di, p.dj, p.L, p.bloco ? 1 : 0);
      }
    },
    liberar() { tPos.dispose(); mat.dispose(); },
  };
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
  // PROTÓTIPO "angulo": "espelhado" (no cenário/cena, dentro de "rua" ou na cena): o diorama pelo outro lado da diagonal.
  // No espelhado, j = +x (andar para +x continua indo para a direita na tela) e os prédios ficam na ordem contrária.
  const ang = op.angulo ?? c.angulo, esp = ang === 'espelhado', rpg = ang === 'rpg';   // "rpg": visto de cima e de frente
  const J = (x) => (esp ? x : -x);
  const rua = gerarRuaDiagonal({ ...op, comprimento, semente: op.semente ?? c.semente ?? c.numero * 13, visual: c.visual, espelhar: esp, rpg });
  const cena = new THREE.Scene();
  // Céu em degradê (pixel art) atrás de tudo: aparece acima dos prédios em vez de um fundo vazio.
  cena.background = op.ceu === 'mata' ? mataDiagonal(W, H) : ceuDiagonal(W, H, rua.noite, rua.tarde);
  const cv = document.createElement('canvas'); cv.width = rua.W; cv.height = rua.H;
  cv.getContext('2d').putImageData(new ImageData(rua.imagem, rua.W, rua.H), 0, 0);
  const texMundo = tex(cv);
  // O chão e os prédios já vêm iluminados (luz pintada pixel a pixel): material sem iluminação.
  const plano = new THREE.Mesh(new THREE.PlaneGeometry(rua.W / PPU, rua.H / PPU), new THREE.MeshBasicMaterial({ map: texMundo, transparent: true, alphaTest: 0.5 }));
  plano.position.set(rua.W / PPU / 2, rua.H / PPU / 2, 0);
  cena.add(plano);

  const iDe = (el, st) => FAIXA.calcadaFrente - (st?.z ?? el.z ?? 0);
  // Sombra que se alastra (ação "sombra"): camada por cima do chão/prédios que usa a posição 3D de cada pixel,
  // então a sombra cobre o chão e SOBE pelas paredes conforme passa.
  const sombraChao = (c.acoes.some((a) => a.tipo === 'sombra') || c.elementos.some((el) => el.sombraPessoa)) ? criarSombraChao(rua) : null;
  if (sombraChao) { sombraChao.malha.position.copy(plano.position); sombraChao.malha.position.z = 0.01; sombraChao.malha.renderOrder = 1; cena.add(sombraChao.malha); }
  const ponto = (i, j, altura = 0) => {
    const p = rua.proj(i, j);
    return new THREE.Vector3(Math.round(p.x) / PPU, (rua.H - Math.round(p.y)) / PPU + altura, 0.5);
  };
  const ordem = rpg ? (i, j) => 2000 + Math.round(i * 40 + j * 0.01) : (i, j) => 2000 + Math.round((i + j) * 20);   // no RPG: quem está mais perto (i maior) fica na frente

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

  // fumaça animada das chaminés (fábrica de brinquedos): troca o quadro do sprite com o tempo
  const fumacas = (rua.fumacas || []).map((f) => {
    const { m, s } = decoracao('fumaca-chamine');
    m.position.copy(ponto(f.i, f.j, f.h / PPU)); m.renderOrder = ordem(f.i, f.j);
    cena.add(m);
    return { m, texs: s.quadros.map((q) => tex(q)), fps: s.anims.parado.fps };
  });
  const camera = new THREE.OrthographicCamera(-W / 2 / PPU, W / 2 / PPU, H / 2 / PPU, -H / 2 / PPU, -100, 100);
  camera.position.z = 50;
  return {
    cena, camera,
    ambiente: rua.noite ? ['#9aa0d0', 0.78] : rua.tarde ? ['#ffd8b8', 1.0] : ['#ffffff', 1.0],
    climaPadrao: null,
    visual: rua.VIS,
    nevoa: rua.VIS?.profundidade ? { cor: nevoaCor(rua.noite, rua.tarde), f: (z) => nevoaZ(z, rua.noite) } : null,
    atualizar: (t) => { for (const f of fumacas) { const k = Math.floor((t || 0) * f.fps) % f.texs.length; if (f.m.material.map !== f.texs[k]) { f.m.material.map = f.texs[k]; f.m.material.emissiveMap = f.texs[k]; f.m.material.needsUpdate = true; } } },
    liberar: () => { texMundo.dispose(); cena.background?.dispose?.(); sombraChao?.liberar(); fumacas.forEach((f) => f.texs.forEach((t) => t.dispose())); },
    ordemInicial: (el) => ordem(iDe(el), J(el.x ?? 0)),
    // sombra: posição (i, j) do centro do elemento e o estado da sombra no chão
    centroIJ: (e, st) => { const c = e.sprite.isoCentro; return [iDe(e.def, st) - (c ? (c.di ?? 1) / 2 : 0), J(st.x) - (c ? (c.dj ?? 1) / 2 : 0)]; },
    sombraIJ: (s) => [FAIXA.calcadaFrente - s.z, J(s.x)],
    atualizarSombra: (s) => sombraChao?.atualizar(s ? { i: FAIXA.calcadaFrente - s.z, j: J(s.x), R: s.R, t: s.t, cor: s.cor, borda: s.borda } : null),
    // sombras em forma de pessoa: [{ x, z, alpha, def }] (def.sombraPessoa: { tamanho, direcao, olhos, bloco })
    atualizarSombrasPessoa: (lista, t) => sombraChao?.pessoas(lista.map((p) => {
      const o = typeof p.def.sombraPessoa === 'object' ? p.def.sombraPessoa : {};
      const a = ((o.direcao ?? 0) * Math.PI) / 180;
      return { i: FAIXA.calcadaFrente - p.z, j: J(p.x), di: -Math.cos(a), dj: esp ? Math.sin(a) : -Math.sin(a), L: o.tamanho ?? 2.6, alpha: p.alpha, olhos: !!o.olhos, bloco: !!o.bloco };
    }), t),
    paraMundo: (el, st, dy = 0) => ponto(iDe(el, st), J(st.x), snap(st.y) + dy),
    posicionar(e, st, bob) {
      const i = iDe(e.def, st), j = J(st.x);
      e.malha.position.copy(ponto(i, j, snap(st.y) + bob));
      // objetos isométricos (praça): a ordem usa o centro do objeto, não o canto da frente
      const c = e.sprite.isoCentro, ri = c ? (c.di ?? 1) / 2 : 0, rj = c ? (c.dj ?? 1) / 2 : 0;
      e.malha.renderOrder = ordem(i - ri, j - rj) + 1 + (e.def.sobre ? 2 : 0);   // o que está "sobre" alguém fica na frente dele
    },
    posicionarSombra(e, st) {
      const i = iDe(e.def, st), j = J(st.x);
      e.sombra.position.copy(ponto(i, j, 1 / PPU)); e.sombra.renderOrder = ordem(i, j);
    },
    atualizarCamera(cam, ef) {
      const centro = ponto(FAIXA.meioRua - (cam.z ?? 0), J(cam.x), cam.y);
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
