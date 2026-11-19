// Motor de renderização pixel art em Three.js. Roda no Chrome/Edge (WebGL na GPU).
// Exposto como window.motor para o orquestrador em Node (Playwright).
import * as THREE from 'three';
import { obterSprite, spriteDeArquivo } from './sprites.js';
import './sprites-rpg.js';
import './sprites-detalhados.js';
import './sprites-cidade.js';
import './estabelecimentos.js';
import { criarVista } from './vistas.js';
import { criarClima, criarRajada } from './particulas.js';
import { UI } from './ui.js';
import { PosProcessamento } from './pos.js';
import { Pix } from './pixel.js';
import { desenharTexto } from './fonte.js';
import { distanciaCamera, FOV, PIXELS_POR_UNIDADE as PPU } from './compartilhado/util.js';
import { cenaNoTempo, estadoCamera, estadoElemento, efeitosTela, elementoPorId } from './compartilhado/linhaDoTempo.js';
import { ruido1, hashTexto } from './compartilhado/util.js';

THREE.ColorManagement.enabled = false;

const snap = (v) => Math.round(v * PPU) / PPU;

function texturaCanvas(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.colorSpace = THREE.NoColorSpace;
  t.userData.compartilhada = true;
  return t;
}

// Quantas linhas transparentes existem embaixo do desenho (o menor valor entre os quadros).
function linhasVaziasEmbaixo(texturas) {
  let menor = Infinity;
  for (const t of texturas) {
    const c = t.image, g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let vazio = 0;
    for (let y = c.height - 1; y >= 0; y--) {
      let tem = false;
      for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { tem = true; break; }
      if (tem) break;
      vazio++;
    }
    menor = Math.min(menor, vazio);
  }
  return Number.isFinite(menor) ? menor : 0;
}

function paraBase64(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}

function formatarTempo(T) {
  const m = Math.floor(T / 60), s = (T % 60).toFixed(1).padStart(4, '0');
  return `${String(m).padStart(2, '0')}:${s}`;
}

class Motor {
  constructor() { this.avisos = []; }

  async iniciar(roteiro, opcoes = {}) {
    this.r = roteiro;
    this.final = opcoes.modo === 'final';
    this.rascunho = !this.final;
    const [W, H] = roteiro.resolucao;
    this.W = W; this.H = H; this.D = distanciaCamera(H);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(W, H, false);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const cv = this.renderer.domElement;
    cv.style.imageRendering = 'pixelated';
    cv.style.width = opcoes.larguraTela ? `${opcoes.larguraTela}px` : `${W * 3}px`;
    document.body.appendChild(cv);

    const rtOpc = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false };
    this.rtCena = new THREE.WebGLRenderTarget(W, H, rtOpc);
    this.rtSaida = new THREE.WebGLRenderTarget(W, H, { ...rtOpc, depthBuffer: false });
    this.buffer = new Uint8Array(W * H * 4);

    this.pos = new PosProcessamento(W, H);
    this.ui = new UI(W, H);
    this.camOrto = new THREE.OrthographicCamera(0, W, H, 0, -10, 10);
    this.cacheSprites = new Map();
    this.cenas = new Map();

    await this.carregarArquivos();
    return { gpu: this.infoGpu(), avisos: this.avisos };
  }

  infoGpu() {
    const gl = this.renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      renderizador: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      fabricante: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      webgl2: this.renderer.capabilities.isWebGL2,
    };
  }

  async carregarArquivos() {
    for (const c of this.r.cenas) {
      for (const el of c.elementos) {
        if (!String(el.sprite || '').startsWith('arquivo:')) continue;
        const nome = el.sprite.slice(8);
        const chave = this.chaveSprite(el);
        if (this.cacheSprites.has(chave)) continue;
        try {
          const s = await spriteDeArquivo(`/sprites/${encodeURIComponent(nome)}`, el);
          this.cacheSprites.set(chave, { sprite: s, texturas: s.quadros.map(texturaCanvas) });
        } catch (e) {
          this.avisos.push(`Sprite "${nome}" não encontrado em sprites/ do projeto nem em biblioteca/sprites/ (cena ${c.numero}).`);
        }
      }
    }
  }

  chaveSprite(el) { return `${el.sprite}|${el.semente ?? 1}|${JSON.stringify(el.cores || {})}|${el.quadros || 1}`; }

  sprite(el, cena) {
    const chave = this.chaveSprite(el);
    if (!this.cacheSprites.has(chave)) {
      let s = obterSprite(el.sprite, el);
      if (!s) {
        this.avisos.push(`Sprite desconhecido "${el.sprite}" (cena ${cena.numero}); usando quadrado rosa.`);
        const p = new Pix(16, 16); p.ret(0, 0, 16, 16, '#ff00ff');
        s = { quadros: [p.paraCanvas()], anims: { parado: { q: [0] } } };
      }
      this.cacheSprites.set(chave, { sprite: s, texturas: s.quadros.map(texturaCanvas) });
    }
    return this.cacheSprites.get(chave);
  }

  construirCena(c) {
    const { W, H } = this;
    // A vista (lateral, diorama ou avenida) monta o cenário, a câmera e o posicionamento.
    const vista = criarVista(c, this);
    const { cena, camera } = vista;
    const fundo = vista;
    const amb = c.luzAmbiente || {};
    // Three.js usa iluminação física (Lambert = albedo/π): multiplicamos por π para que
    // intensidade 1 mostre exatamente as cores desenhadas.
    const intAmb = amb.intensidade ?? fundo.ambiente[1];
    const ambLuz = new THREE.AmbientLight(amb.cor || fundo.ambiente[0], intAmb * Math.PI);
    cena.add(ambLuz);
    // Em cenas escuras, personagens e objetos ganham um "realce" para continuarem legíveis.
    const ca = ambLuz.color, lumAmb = (0.3 * ca.r + 0.59 * ca.g + 0.11 * ca.b) * intAmb;
    const realce = c.realce ?? Math.max(0, Math.min(0.55, 0.95 - lumAmb));

    const overlay = new THREE.Scene();
    const elementos = c.elementos.map((el, i) => {
      const { sprite, texturas } = this.sprite(el, c);
      const esc = el.escala ?? 1;
      const w = texturas[0].image.width / PPU, h = texturas[0].image.height / PPU;
      // Apoia o sprite pela linha mais baixa que tem desenho (os pés tocam o chão de verdade).
      // (só nas vistas que pedem; a lateral e o diorama mantêm o apoio de antes)
      const vazio = vista.apoiarPeloPe ? (sprite._vazioBaixo ?? (sprite._vazioBaixo = linhasVaziasEmbaixo(texturas))) : 0;
      const geo = new THREE.PlaneGeometry(w, h).translate(0, h / 2 - vazio / PPU, 0);
      // 'semLuz' (sprite ou elemento): não recebe luz da cena — ex.: uma sombra continua preta perto do fogo
      const semLuz = el.semLuz ?? sprite.semLuz;
      const mat = semLuz
        ? new THREE.MeshBasicMaterial({ map: texturas[0], transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide })
        : new THREE.MeshLambertMaterial({ map: texturas[0], emissiveMap: texturas[0], transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide });
      const malha = new THREE.Mesh(geo, mat);
      malha.renderOrder = vista.ordemInicial(el, i);
      cena.add(malha);
      const obj = { def: el, sprite, texturas, malha, mat, h: h * esc, esc, realce: el.realce ?? realce };
      // Camada de brilho: pixels que emitem luz (lanterna, olhos, telas) ficam fora da iluminação.
      if (sprite.brilho) {
        if (!sprite._texBrilho) sprite._texBrilho = sprite.brilho.map(texturaCanvas);
        const mb = new THREE.MeshBasicMaterial({ map: sprite._texBrilho[0], transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide });
        const brilho = new THREE.Mesh(geo, mb);
        brilho.renderOrder = malha.renderOrder + 1;
        cena.add(brilho);
        obj.brilho = { malha: brilho, mat: mb, texturas: sprite._texBrilho };
      }
      if (sprite.sombra && el.sombra !== false) {
        const p = new Pix(Math.max(6, texturas[0].image.width - 4), 4);
        p.elipse(p.w / 2, 2, p.w / 2, 2, '#000000');
        const sm = new THREE.Mesh(new THREE.PlaneGeometry(p.w / PPU, p.h / PPU),
          new THREE.MeshBasicMaterial({ map: texturaCanvas(p.paraCanvas()), transparent: true, opacity: 0.3, depthWrite: false }));
        sm.renderOrder = malha.renderOrder - 1;
        if (vista.sombraDeitada) sm.rotation.x = -Math.PI / 2;
        cena.add(sm);
        obj.sombra = sm;
      }
      const luz = el.luz === false ? null : { ...(sprite.luz || {}), ...(el.luz || {}) };
      if (luz && luz.cor) {
        const L = new THREE.PointLight(luz.cor, (luz.intensidade ?? 2) * Math.PI, luz.alcance ?? 6, 1);
        cena.add(L);
        obj.luz = { L, cfg: luz, base: (luz.intensidade ?? 2) * Math.PI };
      }
      if (sprite.brasas && this.final && el.brasas !== false) {
        const raj = criarRajada('brasas', 50 + i);
        overlay.add(raj.objeto);
        obj.brasas = raj;
      }
      return obj;
    });
    const porId = new Map(elementos.map((e) => [e.def.id, e]));

    // Rajadas de partículas ligadas a ações.
    const rajadas = [];
    const centroEl = (id, t) => {
      const e = porId.get(id);
      if (!e) return null;
      const st = estadoElemento(c, e.def, t);
      return vista.paraMundo(e.def, st, e.h * st.escala / 2);
    };
    c.acoes.forEach((a, k) => {
      const add = (tipo, t0, posFn, mult = 1) => {
        const r = criarRajada(tipo, 300 + k * 7, this.rascunho ? 0.5 : mult);
        overlay.add(r.objeto);
        rajadas.push({ r, t0, pos: posFn });
      };
      const fixo = (p) => () => p;
      const daPosicao = (a) => a.posicao ? fixo({ x: a.posicao[0], y: a.posicao[1] ?? 0.5, z: a.posicao[2] ?? 0 }) : null;
      switch (a.tipo) {
        case 'explosao': add('explosao', a.inicio, daPosicao(a) || fixo(centroEl(a.alvo, a.inicio) || { x: 0, y: 0.5, z: 0 }), a.intensidade ?? 1); break;
        case 'aparecer': case 'sumir': if (a.alvo) add('puf', a.inicio, fixo(centroEl(a.alvo, a.inicio))); break;
        case 'coletar': if (a.alvo) add('brilho', a.inicio + 0.1, fixo(centroEl(a.alvo, a.inicio))); break;
        case 'magia': add('magia', a.inicio, daPosicao(a) || fixo(centroEl(a.alvo, a.inicio) || { x: 0, y: 1, z: 0 })); break;
        case 'pular': if (a.alvo && porId.get(a.alvo)?.sprite.personagem) {
          const fim = a.inicio + a.duracao;
          add('poeira', fim, () => { const d = porId.get(a.alvo).def, st = estadoElemento(c, d, fim); return vista.paraMundo(d, { ...st, y: st.yBase }, 0.1); });
        } break;
        case 'emocao': if (a.icone === 'coracao' && a.alvo) add('coracoes', a.inicio, fixo(centroEl(a.alvo, a.inicio))); break;
        default: break;
      }
    });
    rajadas.forEach((rj) => { const p = rj.pos(); rj.posFixa = p && { ...p }; });

    const tipoClima = c.clima === 'nenhum' ? null : (c.clima || vista.climaPadrao);
    const clima = tipoClima ? criarClima(tipoClima, W, H) : null;
    if (c.clima && c.clima !== 'nenhum' && !clima) this.avisos.push(`Clima desconhecido "${c.clima}" (cena ${c.numero}).`);
    if (clima) overlay.add(clima.objeto);

    return { def: c, cena, camera, overlay, fundo, vista, elementos, porId, rajadas, clima };
  }

  liberar(obj) {
    obj.cena.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      for (const m of [o.material].flat().filter(Boolean)) {   // caixas 3D têm vários materiais
        for (const t of [m.map, m.emissiveMap]) if (t && !t.userData.compartilhada) t.dispose();
        m.dispose();
      }
    });
    obj.overlay.traverse((o) => { if (o !== this.ui.malha) { o.geometry?.dispose(); o.material?.dispose(); } });
    obj.vista.liberar();
  }

  obterCena(c) {
    if (this.atual?.def === c) return this.atual;
    if (this.atual && !this.manterCenas) this.liberar(this.atual);
    this.atual = this.cenas.get(c.indice) || this.construirCena(c);
    if (this.manterCenas) this.cenas.set(c.indice, this.atual);
    return this.atual;
  }

  projetar(obj, p) {
    const v = new THREE.Vector3(p.x, p.y, p.z ?? 0).project(obj.camera);
    return { x: (v.x + 1) / 2 * this.W, y: (v.y + 1) / 2 * this.H };
  }

  atualizar(obj, t) {
    const c = obj.def;
    const cam = estadoCamera(c, t);
    const ef = efeitosTela(c, t);
    const vista = obj.vista;
    vista.atualizarCamera(cam, ef);
    obj.camera.updateProjectionMatrix();
    obj.camera.updateMatrixWorld();

    for (const e of obj.elementos) {
      const st = estadoElemento(c, e.def, t);
      const vis = st.visivel && st.alpha > 0.01 && st.escala > 0.01;
      e.malha.visible = vis;
      if (e.sombra) e.sombra.visible = vis;
      if (e.brilho) e.brilho.malha.visible = vis;
      if (e.luz) e.luz.L.visible = vis;
      if (!vis) continue;
      // A caminhada nova (passada sincronizada) só vale nas vistas que pedem (avenida);
      // nas outras o sprite usa a caminhada clássica, se tiver.
      const conjunto = !vista.caminhadaSincronizada && e.sprite.animsClassicas?.[st.anim] ? e.sprite.animsClassicas : e.sprite.anims;
      const anim = conjunto[st.anim] || e.sprite.anims.parado;
      const fps = anim.fps || 8;
      const tAnim = t + (e.def.fase ?? (hashTexto(String(e.def.id)) % 1000) / 1000 * 2.3); // cada um pisca/anda em fase própria
      let idx = Math.floor(tAnim * fps);
      // Com 'passada' definida, os passos seguem a distância percorrida: sem pés escorregando.
      if (anim.passada && (st.anim === 'andando' || st.anim === 'correndo')) {
        const a = c.acoes.find((ac) => ac.alvo === e.def.id && (ac.tipo === 'andar' || ac.tipo === 'correr') && t >= ac.inicio && t < ac.inicio + ac.duracao);
        if (a) {
          const x0 = estadoElemento(c, e.def, a.inicio).x;
          const passoQuadro = (anim.passada * e.esc) / anim.q.length / PPU;   // avanço por quadro (mundo)
          const n = Math.floor(Math.abs(st.x - x0) / passoQuadro);
          idx = n;
          // o corpo avança em degraus, junto com a troca de quadro: o pé apoiado não patina
          if (Math.abs(st.x - x0) < Math.abs(a.duracao ? estadoElemento(c, e.def, a.inicio + a.duracao).x - x0 : 0) - 1e-6) {
            st.x = x0 + Math.sign(st.x - x0) * n * passoQuadro;
          }
        }
      }
      const q = anim.q[((idx % anim.q.length) + anim.q.length) % anim.q.length] ?? 0;
      let bob = 0;
      // balanço genérico só para sprites simples (os detalhados já sobem e descem nos próprios quadros)
      if (e.sprite.personagem && !anim.passada && (st.anim === 'andando' || st.anim === 'correndo')) bob = idx % 2 ? 1 / PPU : 0;
      if (e.sprite.flutua && e.def.flutuar !== false && st.anim === 'parado') bob = Math.round(Math.sin(tAnim * 3) * 1.5) / PPU;
      if (e.sprite.voa) bob = Math.round(Math.sin(tAnim * 4) * 3) / PPU;
      e.mat.map = e.texturas[q] || e.texturas[0]; if ('emissiveMap' in e.mat) e.mat.emissiveMap = e.mat.map;
      vista.posicionar(e, st, bob);
      const s = e.esc * st.escala;
      e.malha.scale.set(st.virado * s, s, 1);
      e.mat.opacity = st.alpha;
      if (e.brilho) {
        e.brilho.mat.map = e.brilho.texturas[q] || e.brilho.texturas[0];
        e.brilho.malha.position.copy(e.malha.position); e.brilho.malha.scale.copy(e.malha.scale);
        e.brilho.malha.quaternion.copy(e.malha.quaternion); e.brilho.malha.renderOrder = e.malha.renderOrder + 1;
        e.brilho.mat.opacity = st.alpha;
      }
      if (e.mat.emissive) e.mat.emissive.setRGB(e.realce + st.vermelho * 0.9, e.realce * (1 - st.vermelho), e.realce * (1 - st.vermelho));
      else e.mat.color.setRGB(1, 1 - st.vermelho * 0.6, 1 - st.vermelho * 0.6);
      if (e.sombra) {
        const enc = Math.max(0.4, 1 - st.alturaPulo * 0.25);
        vista.posicionarSombra(e, st);
        e.sombra.scale.set(enc * e.esc, e.esc, 1);
      }
      if (e.luz) {
        const { cfg, L, base } = e.luz;
        L.position.copy(vista.paraMundo(e.def, st, (cfg.dy ?? 0.5) * e.esc)); L.position.z += cfg.dz ?? 1;
        L.intensity = cfg.cintila ? base * (1 + 0.18 * ruido1(t * 9, 3) + 0.08 * ruido1(t * 23, 5)) : base;
      }
      if (e.brasas) e.brasas.atualizar(t, this.projetar(obj, vista.paraMundo(e.def, st, 0.5)));
    }
    for (const rj of obj.rajadas) {
      const dt = t - rj.t0;
      rj.r.atualizar(dt, rj.posFixa ? this.projetar(obj, rj.posFixa) : { x: -99, y: -99 });
    }
    if (obj.clima) obj.clima.atualizar(t, { x: cam.x * PPU, y: cam.y * PPU });
    obj.fundo.atualizar(t);
    return { cam, ef };
  }

  focoTransicao(obj, t) {
    const c = obj.def;
    const id = c.foco || c.seguir || obj.elementos.find((e) => e.sprite.personagem)?.def.id;
    const e = id && obj.porId.get(id);
    if (!e) return { x: this.W / 2, y: this.H / 2 };
    const st = estadoElemento(c, e.def, t);
    return this.projetar(obj, obj.vista.paraMundo(e.def, st, e.h / 2));
  }

  renderizarTempo(T, paraTela = false) {
    const loc = cenaNoTempo(this.r, T);
    if (!loc) return;
    const { cena: c, t } = loc;
    const obj = this.obterCena(c);
    const { ef } = this.atualizar(obj, t);
    const R = this.renderer;

    R.setRenderTarget(this.rtCena);
    R.clear();
    R.render(obj.cena, obj.camera);

    this.ui.desenhar({
      cena: c, t, rascunho: this.rascunho,
      info: `RASCUNHO - CENA ${c.numero}/${this.r.cenas.length} - ${formatarTempo(T)}`,
      cabeca: (id, tt) => {
        const e = obj.porId.get(id);
        if (!e) return null;
        const st = estadoElemento(c, e.def, tt);
        const p = this.projetar(obj, obj.vista.paraMundo(e.def, st, e.h * st.escala));
        return { x: p.x, y: this.H - p.y };
      },
    });
    if (this.ui.malha.parent !== obj.overlay) obj.overlay.add(this.ui.malha);
    R.autoClear = false;
    R.render(obj.overlay, this.camOrto);
    R.autoClear = true;

    const fx = this.r.efeitos;
    const paleta = c.paleta || this.r.paleta;
    if (paleta !== this.paletaAtual) { this.pos.definirPaleta(paleta); this.paletaAtual = paleta; }
    this.pos.configurar({
      textura: this.rtCena.texture, final: this.final, transicao: ef.transicao, fade: ef.fade, flash: ef.flash,
      bloom: fx.bloom, vinheta: fx.vinheta, aberracao: fx.aberracao && ef.tremor > 0.25 ? 1 : 0,
      niveis: this.r.niveis, saturacao: c.saturacao ?? fx.saturacao ?? 1, centro: this.focoTransicao(obj, t),
    });
    R.setRenderTarget(this.rtSaida);
    R.render(this.pos.cena, this.pos.camera);
    if (paraTela) { R.setRenderTarget(null); R.render(this.pos.cena, this.pos.camera); }
  }

  // Renderiza o quadro i e devolve os pixels RGBA (de baixo p/ cima) em base64.
  quadro(i) {
    this.renderizarTempo(i / this.r.fps);
    this.renderer.readRenderTargetPixels(this.rtSaida, 0, 0, this.W, this.H, this.buffer);
    return paraBase64(this.buffer);
  }

  quadros(inicio, n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(this.quadro(inicio + i));
    return out;
  }

  // Folha com uma miniatura por cena (para revisar o rascunho rapidamente).
  storyboard(colunas = 4) {
    const { W, H } = this;
    const n = this.r.cenas.length;
    const cols = Math.min(colunas, n), linhas = Math.ceil(n / cols);
    const cv = document.createElement('canvas');
    const leg = 14;
    cv.width = cols * (W + 4) + 4; cv.height = linhas * (H + leg + 4) + 4;
    const g = cv.getContext('2d');
    g.fillStyle = '#101018'; g.fillRect(0, 0, cv.width, cv.height);
    const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
    const tg = tmp.getContext('2d');
    const rasc = this.rascunho; this.rascunho = false;
    this.r.cenas.forEach((c, i) => {
      this.renderizarTempo(c.inicio + Math.min(c.duracao * 0.55, c.duracao - 0.5));
      this.renderer.readRenderTargetPixels(this.rtSaida, 0, 0, W, H, this.buffer);
      const img = new ImageData(W, H);
      for (let y = 0; y < H; y++) img.data.set(this.buffer.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
      tg.putImageData(img, 0, 0);
      const x = 4 + (i % cols) * (W + 4), y = 4 + Math.floor(i / cols) * (H + leg + 4);
      g.drawImage(tmp, x, y);
      desenharTexto(g, `CENA ${c.numero} - ${c.duracao.toFixed(1)}S - ${c.fundo || c.vista || 'lateral'}${c.narracao ? '' : ' - SEM NARRACAO'}`, x + 1, y + H + 1, c.narracao ? '#e0e0e0' : '#ff8060');
    });
    this.rascunho = rasc;
    return cv.toDataURL('image/png');
  }

  // Modo prévia: reproduz em tempo real no navegador.
  tocar(inicio = 0) {
    this.manterCenas = false;
    let t0 = performance.now() - inicio * 1000, pausado = false, tp = inicio;
    addEventListener('keydown', (e) => {
      if (e.code === 'Space') { pausado = !pausado; t0 = performance.now() - tp * 1000; }
      if (e.code === 'ArrowRight') t0 -= 5000;
      if (e.code === 'ArrowLeft') t0 += 5000;
      if (e.code === 'Home') t0 = performance.now();
    });
    const loop = () => {
      if (!pausado) tp = ((performance.now() - t0) / 1000) % this.r.duracaoTotal;
      if (tp < 0) { t0 = performance.now(); tp = 0; }
      this.renderizarTempo(tp, true);
      requestAnimationFrame(loop);
    };
    loop();
  }
}

window.motor = new Motor();
window.motorPronto = true;
