// Monstros de SOMBRA em 3D "realista" (geometria + shaders), desenhados numa camada em ALTA resolução
// por cima do mundo em pixel art — o contraste faz parecer que vieram de outro mundo.
//   sombra-alta   — vulto alto e magro, braços compridos, olhos brancos que piscam, corpo fervendo em fumaça
//   tentaculos    — tentáculos de sombra saindo de uma poça escura no chão
//   massa-olhos   — massa de sombra viscosa com vários olhos que seguem um personagem
// Tudo é função do tempo (sem simulação): o mesmo roteiro gera sempre o mesmo vídeo.
import * as THREE from 'three';

// ---------------------------------------------------------------- GLSL comum
const RUIDO = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float s=0.0, a=0.5; for(int i=0;i<4;i++){ s+=a*snoise(p); p*=2.03; a*=0.5; } return s; }
`;

// Pele de sombra: quase preta, oleosa, borda que vira fumaça e materialização por ruído (com brasa na borda).
const FRAG_SOMBRA = /* glsl */ `
${RUIDO}
uniform float uTempo, uPresenca, uFase, uFundoY;
uniform vec3 uCor, uBorda, uBrasa;
varying vec3 vN, vPW, vL;
void main(){
  vec3 n = normalize(vN);
  vec3 q = vL*6.0 + vec3(0.0, -uTempo*1.4, uFase);
  float e = 0.08, n0 = snoise(q);
  vec3 g = vec3(snoise(q+vec3(e,0.0,0.0))-n0, snoise(q+vec3(0.0,e,0.0))-n0, snoise(q+vec3(0.0,0.0,e))-n0)/e;
  n = normalize(n - g*0.05);
  vec3 v = normalize(cameraPosition - vPW);
  float fres = pow(1.0 - abs(dot(n, v)), 2.2);
  float fum = fbm(vL*3.0 + vec3(0.0, -uTempo*1.1, uFase*2.0))*0.5 + 0.5;
  float a = 1.0 - smoothstep(0.45, 1.0, fres*1.2 + (fum - 0.5)*0.9);
  a *= smoothstep(uFundoY, uFundoY + 0.9, vL.y + (fum - 0.5)*0.6);
  float lim = uPresenca*1.25 - 0.05;
  if (fum > lim) discard;
  float brasa = smoothstep(lim - 0.08, lim, fum) * (1.0 - step(0.999, uPresenca));
  vec3 L = normalize(vec3(-0.45, 0.75, 0.5));
  float dif = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + v)), 0.0), 48.0);
  vec3 c = uCor*(0.35 + 0.65*dif) + vec3(0.6, 0.62, 0.8)*spec*0.18 + uBorda*fres*0.5 + uBrasa*brasa*1.5;
  a = clamp(a + brasa, 0.0, 1.0);
  if (a < 0.02) discard;
  gl_FragColor = vec4(c, a);
}`;

// TENTATIVAS 3D (PROTÓTIPO, o usuário achou o 3D "realista" esquisito): "estilo3d" no elemento
//   "toon"     — sombreado de desenho (3 tons chapados) e contorno roxo nítido; continua em HD
//   "pixel"    — o mesmo sombreado, desenhado NA RESOLUÇÃO do pixel art (combina com o resto), com pontilhado na luz
//   "silhueta" — preto chapado com só a borda roxa e os olhos acesos, na resolução do pixel art
// Sem transparência nem textura de fumaça no corpo (aparece/some em pontilhado).
const FRAG_TOON = /* glsl */ `
${RUIDO}
uniform float uTempo, uPresenca, uFase, uEstilo;
uniform vec3 uCor, uBorda, uBrasa;
varying vec3 vN, vPW, vL;
float bayer4(vec2 p){ int x=int(mod(p.x,4.0)), y=int(mod(p.y,4.0)), i=x+y*4;
  float m[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); return (m[i]+0.5)/16.0; }
void main(){
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vPW);
  float lim = uPresenca*1.25 - 0.05, fum = fbm(vL*2.0 + vec3(0.0, 0.0, uFase))*0.5 + 0.5;
  if (fum > lim) discard;                                           // aparece/some
  if (uPresenca < 0.999 && bayer4(gl_FragCoord.xy) > uPresenca) discard;
  vec3 L = normalize(vec3(-0.45, 0.75, 0.5));
  float dif = max(dot(n, L), 0.0), rim = 1.0 - abs(dot(n, v));
  vec3 c;
  if (uEstilo > 1.5) {                                              // silhueta
    c = uCor; if (rim > 0.78) c = uBorda * 0.55;
  } else {
    float d = uEstilo > 0.5 ? dif + (bayer4(gl_FragCoord.xy) - 0.5) * 0.25 : dif;   // pixel: pontilhado entre os tons
    float tom = d > 0.62 ? 1.0 : d > 0.25 ? 0.55 : 0.2;
    c = mix(uCor, uBorda * 0.45, tom * 0.55);
    if (rim > 0.74) c = uBorda * 0.8;                                // contorno roxo nítido
  }
  gl_FragColor = vec4(c, 1.0);
}`;
const ESTILOS_3D = { toon: 0, pixel: 1, silhueta: 2 };

const VERT_CORPO = /* glsl */ `
${RUIDO}
attribute float aBalanco;
uniform float uTempo, uAmp, uFase, uBalanco;
varying vec3 vN, vPW, vL;
void main(){
  vec3 p = position;
  float b = aBalanco*aBalanco;
  p.x += sin(uTempo*0.9 + uFase)*uBalanco*b;
  p.z += cos(uTempo*0.7 + uFase*1.3)*uBalanco*0.6*b;
  p += normal * fbm(p*2.2 + vec3(0.0, -uTempo*0.9, uFase)) * uAmp;
  vL = p;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vPW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const cor = (h) => new THREE.Color(h);

function materialSombra(U, extra = {}, vert = VERT_CORPO) {
  if (U.estilo != null) return new THREE.ShaderMaterial({   // tentativa 3D em desenho (toon / pixel / silhueta)
    uniforms: {
      uTempo: U.uTempo, uPresenca: U.uPresenca, uEstilo: { value: U.estilo },
      uAmp: { value: (extra.amp ?? 0.05) * 0.3 }, uFase: { value: extra.fase ?? 0 }, uBalanco: { value: extra.balanco ?? 0 },
      uCor: { value: cor(U.cor) }, uBorda: { value: cor(U.borda) }, uBrasa: { value: cor(U.brasa) }, ...(extra.uniforms || {}),
    },
    vertexShader: vert, fragmentShader: FRAG_TOON, transparent: false, depthWrite: true,
  });
  return new THREE.ShaderMaterial({
    uniforms: {
      uTempo: U.uTempo, uPresenca: U.uPresenca,
      uAmp: { value: extra.amp ?? 0.05 }, uFase: { value: extra.fase ?? 0 }, uBalanco: { value: extra.balanco ?? 0 },
      uFundoY: { value: extra.fundoY ?? -0.3 }, uCor: { value: cor(U.cor) }, uBorda: { value: cor(U.borda) }, uBrasa: { value: cor(U.brasa) },
      ...(extra.uniforms || {}),
    },
    vertexShader: vert, fragmentShader: FRAG_SOMBRA, transparent: true, depthWrite: true,
  });
}

// Fumaça: partículas escuras subindo (posições calculadas no shader a partir do tempo).
function fumaca(U, { n = 300, altura = 4, largura = 0.6, subida = 1.4, tam = 0.45, semente = 1 } = {}) {
  const sem = new Float32Array(n * 4);
  let a = semente * 9301 + 49297;
  const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n * 4; i++) sem[i] = r();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute('aSem', new THREE.BufferAttribute(sem, 4));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTempo: U.uTempo, uPresenca: U.uPresenca, uMeiaAltura: U.uMeiaAltura, uAltura: { value: altura }, uLarg: { value: largura }, uSubida: { value: subida }, uTam: { value: tam }, uEscala: U.uEscala },
    vertexShader: /* glsl */ `
      ${RUIDO}
      attribute vec4 aSem;
      uniform float uTempo, uPresenca, uMeiaAltura, uAltura, uLarg, uSubida, uTam, uEscala;
      varying float vA, vS;
      void main(){
        float vida = fract(uTempo*(0.16 + aSem.w*0.12) + aSem.x*7.13);
        float r = uLarg*(0.35 + aSem.z*0.65)*(1.0 - 0.45*aSem.y);
        float ang = aSem.x*6.2831;
        vec3 p = vec3(cos(ang)*r, aSem.y*uAltura + vida*uSubida, sin(ang)*r*0.5);
        p.x += snoise(vec3(aSem.xy*9.0, uTempo*0.4))*0.3*vida;
        vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_Position = clip;
        gl_PointSize = uTam*uEscala*(0.5 + vida*1.3)*projectionMatrix[1][1]*uMeiaAltura/clip.w;
        vA = sin(3.14159*vida)*uPresenca*(0.3 + 0.45*aSem.z);
        vS = aSem.w;
      }`,
    fragmentShader: /* glsl */ `
      ${RUIDO}
      varying float vA, vS;
      void main(){
        vec2 d = gl_PointCoord - 0.5;
        float a = smoothstep(0.5, 0.08, length(d) + snoise(vec3(d*5.0, vS*20.0))*0.15)*vA;
        if (a < 0.01) discard;
        gl_FragColor = vec4(0.02, 0.015, 0.03, a);
      }`,
    transparent: true, depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

// Poça escura no chão (elipse de frente para a câmera, na proporção do piso isométrico).
function poca(U, { rx = 1.6, ry = 0.7, fase = 0 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTempo: U.uTempo, uPresenca: U.uPresenca, uFase: { value: fase }, uBorda: { value: cor(U.borda) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      ${RUIDO}
      uniform float uTempo, uPresenca, uFase; uniform vec3 uBorda;
      varying vec2 vUv;
      void main(){
        vec2 d = (vUv - 0.5)*2.0;
        float ang = atan(d.y, d.x);
        float r = length(d) + fbm(vec3(cos(ang)*1.5, sin(ang)*1.5, uTempo*0.35 + uFase))*0.22;
        float raio = 0.25 + 0.75*smoothstep(0.0, 0.7, uPresenca);
        float a = smoothstep(raio, raio*0.7, r);
        float onda = smoothstep(0.08, 0.0, abs(fract(length(d)*2.0 - uTempo*0.25) - 0.5))*0.25*a;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uBorda*onda*0.4, a*0.92);
      }`,
    transparent: true, depthWrite: false,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, ry * 2), mat);
  m.renderOrder = -1;
  m.userData.poca = true;
  return m;
}

// Tubo afinado ao longo de uma curva (braços, dedos). aBalanco vai de b0 a b1 ao longo do tubo.
function tuboAfinado(curva, raio, { segs = 48, radial = 12, b0 = 0, b1 = 1 } = {}) {
  const fr = curva.computeFrenetFrames(segs, false);
  const pos = [], nor = [], bal = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const s = i / segs, c = curva.getPointAt(s), N = fr.normals[i], B = fr.binormals[i], r = raio(s);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a);
      const n = new THREE.Vector3().addScaledVector(N, cs).addScaledVector(B, sn).normalize();
      pos.push(c.x + n.x * r, c.y + n.y * r, c.z + n.z * r); nor.push(n.x, n.y, n.z); bal.push(b0 + (b1 - b0) * s);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aBalanco', new THREE.Float32BufferAttribute(bal, 1));
  g.setIndex(idx);
  return g;
}

const piscada = (t, fase, periodo) => {
  const f = ((t + fase) % periodo + periodo) % periodo;
  return f < 0.18 ? Math.abs(f - 0.09) / 0.09 : 1;   // 1 = aberto
};

// Olhos brilhantes (fenda luminosa com halo) — para o vulto.
function olhoBrilhante(U, corOlho) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPresenca: U.uPresenca, uAbertura: { value: 1 }, uCor: { value: cor(corOlho) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uPresenca, uAbertura; uniform vec3 uCor; varying vec2 vUv;
      void main(){
        vec2 d = vUv - 0.5;
        float ab = max(uAbertura, 0.02);
        float nucleo = smoothstep(0.13, 0.06, length(vec2(d.x, d.y/(0.32*ab))));
        float halo = exp(-length(d*vec2(1.0, 1.6))*9.0)*0.7*ab;
        float a = clamp(nucleo + halo, 0.0, 1.0)*uPresenca;
        gl_FragColor = vec4((vec3(1.0)*nucleo + uCor*halo)*uPresenca, a);
      }`,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), mat);
  m.renderOrder = 5;
  return m;
}

// Globo ocular "realista": esclera com veias, íris com pupila em fenda, brilho molhado e pálpebras.
function globoOcular(U, corIris) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPresenca: U.uPresenca, uAbertura: { value: 1 }, uIris: { value: cor(corIris) }, uPele: { value: cor(U.cor) } },
    vertexShader: /* glsl */ `
      varying vec3 vLN, vN, vPW;
      void main(){ vLN = normal; vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.0); vPW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */ `
      ${RUIDO}
      uniform float uPresenca, uAbertura; uniform vec3 uIris, uPele;
      varying vec3 vLN, vN, vPW;
      void main(){
        if (uPresenca < 0.02) discard;
        vec3 ln = normalize(vLN), n = normalize(vN), v = normalize(cameraPosition - vPW);
        vec3 L = normalize(vec3(-0.45, 0.75, 0.5));
        float dif = max(dot(n, L), 0.0);
        if (abs(ln.y) > uAbertura*(0.98 - 0.25*abs(ln.x)) || ln.z < -0.2) {
          gl_FragColor = vec4(uPele*(0.4 + 0.6*dif) + vec3(0.03, 0.025, 0.05), uPresenca);
          return;
        }
        vec3 c = vec3(0.86, 0.82, 0.72);
        float veia = 1.0 - abs(snoise(ln*11.0));
        c = mix(c, vec3(0.55, 0.08, 0.08), smoothstep(0.82, 0.97, veia)*(1.0 - ln.z)*0.9);
        float ir = 0.8;
        if (ln.z > ir) {
          float k = (ln.z - ir)/(1.0 - ir);
          c = mix(uIris*0.35, uIris*1.25, k) * (0.75 + 0.25*snoise(vec3(atan(ln.y, ln.x)*6.0, k*3.0, 1.0)));
          if (k < 0.12) c *= 0.35;
          if (abs(ln.x) < 0.06 && ln.z > ir + 0.02) c = vec3(0.01);
        }
        float spec = pow(max(dot(n, normalize(L + v)), 0.0), 90.0);
        c = c*(0.45 + 0.55*dif) + vec3(1.0)*spec*0.9 + uIris*0.06;
        float sombra = smoothstep(uAbertura*0.98, uAbertura*0.6, abs(ln.y));
        c *= 0.35 + 0.65*sombra;
        gl_FragColor = vec4(c, uPresenca);
      }`,
    transparent: true,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat);
  m.renderOrder = 4;
  return m;
}

// ---------------------------------------------------------------- VULTO
function sombraAlta(U, def) {
  const g = new THREE.Group();
  const H = 4.4;
  // corpo: perfil girado (cabeça, pescoço fino, ombros largos, base que vira fumaça)
  const perfil = [[0.6, 0], [0.42, 0.35], [0.3, 1.1], [0.33, 1.9], [0.42, 2.55], [0.52, 2.95], [0.24, 3.16], [0.15, 3.3],
    [0.26, 3.45], [0.33, 3.75], [0.3, 4.05], [0.17, 4.26], [0.0, 4.36]];
  const curva = new THREE.CatmullRomCurve3(perfil.map(([r, y]) => new THREE.Vector3(r, y, 0)));
  const geo = new THREE.LatheGeometry(curva.getPoints(70).map((p) => new THREE.Vector2(Math.max(0.001, p.x), p.y)), 48);
  const P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) {
    let x = P.getX(i), z = P.getZ(i); const y = P.getY(i);
    const ombro = Math.exp(-(((y - 2.85) / 0.45) ** 2));
    x *= 1 + 0.55 * ombro; z *= 0.62;
    if (y > 3.15) x += (y - 3.15) * 0.16;                       // cabeça inclinada
    P.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  geo.setAttribute('aBalanco', new THREE.Float32BufferAttribute(new Float32Array(P.count), 1));
  g.add(new THREE.Mesh(geo, materialSombra(U, { amp: 0.06, fase: 0.3, fundoY: -0.2 })));
  // braços compridos (quase até o chão) com dedos finos
  for (const lado of [-1, 1]) {
    const pts = [[0.7, 2.95, 0], [0.95, 2.05, 0.08], [0.9, 1.15, 0.14], [0.86, 0.82, 0.16]].map(([x, y, z]) => new THREE.Vector3(x * lado, y, z));
    const braco = new THREE.CatmullRomCurve3(pts);
    const fase = lado > 0 ? 0 : 2.1;
    g.add(new THREE.Mesh(tuboAfinado(braco, (s) => 0.12 - 0.07 * s + 0.03 * Math.exp(-(((s - 0.9) / 0.08) ** 2))), materialSombra(U, { amp: 0.03, fase, balanco: 0.16 })));
    const mao = pts[3];
    for (let k = 0; k < 4; k++) {
      const abre = (k - 1.5) * 0.06;
      const dedo = new THREE.CatmullRomCurve3([
        mao.clone(), new THREE.Vector3(mao.x + abre * lado + 0.02 * lado, mao.y - 0.25, mao.z + 0.03 * k),
        new THREE.Vector3(mao.x + abre * 1.6 * lado - 0.04 * lado, mao.y - 0.52 - (k % 2) * 0.08, mao.z + 0.05 * k),
      ]);
      g.add(new THREE.Mesh(tuboAfinado(dedo, (s) => 0.035 * (1 - s) + 0.004, { segs: 16, radial: 6, b0: 1, b1: 1.25 }), materialSombra(U, { amp: 0.01, fase, balanco: 0.16 })));
    }
  }
  // olhos
  const olhos = [-1, 1].map((lado) => { const o = olhoBrilhante(U, def.corOlhos || '#9ab8ff'); o.position.set(0.1 * lado + 0.1, 3.8, 0.27); g.add(o); return o; });
  g.add(fumaca(U, { n: 360, altura: H, largura: 0.55, subida: 1.2, tam: 0.5, semente: 3 }));
  g.add(poca(U, { rx: 1.3, ry: 0.55 }));
  return {
    grupo: g, altura: H,
    atualizar(t, est) { const ab = piscada(t, 0.7, 3.9) * est.olhosAbertos; for (const o of olhos) o.material.uniforms.uAbertura.value = ab; },
  };
}

// ---------------------------------------------------------------- TENTÁCULOS
const VERT_TENTACULO = /* glsl */ `
${RUIDO}
attribute float aS, aAng;
uniform float uTempo, uFase, uComp, uRaio, uCrescer, uInclina;
varying vec3 vN, vPW, vL;
vec3 centro(float s){
  float L = uComp*uCrescer, t = uTempo;
  vec3 c = vec3(0.0, s*L, 0.0);
  c.x += (sin(s*2.6 + t*1.1 + uFase)*0.55 + uInclina*s*1.4)*s*L*0.35;
  c.z += cos(s*2.1 + t*0.8 + uFase*1.7)*0.3*s*L*0.35;
  float k = smoothstep(0.55, 1.0, s);
  float ang = k*k*(2.2 + sin(t*0.7 + uFase)*1.2);
  c.x += sin(ang)*0.3*k*L*(uInclina >= 0.0 ? 1.0 : -1.0);
  c.y -= (1.0 - cos(ang))*0.22*k*L;
  return c;
}
void main(){
  float s = aS;
  vec3 c = centro(s);
  vec3 T = normalize(centro(min(s + 0.01, 1.0)) - centro(max(s - 0.01, 0.0)) + vec3(0.0, 1e-4, 0.0));
  vec3 Nn = normalize(cross(T, vec3(0.0, 0.0, 1.0)) + vec3(1e-4, 0.0, 0.0));
  vec3 B = cross(T, Nn);
  float r = uRaio*(pow(1.0 - s, 0.85)*0.95 + 0.05)*(1.0 + 0.14*snoise(vec3(s*9.0 - uTempo*1.5, aAng*1.3, uFase)));
  vec3 dir = Nn*cos(aAng) + B*sin(aAng);
  vec3 p = c + dir*r;
  vL = p;
  vec4 w = modelMatrix*vec4(p, 1.0);
  vPW = w.xyz;
  vN = normalize(mat3(modelMatrix)*dir);
  gl_Position = projectionMatrix*viewMatrix*w;
}`;

function geoTentaculo(segs = 72, radial = 14) {
  const s = [], a = [], idx = [];
  for (let i = 0; i <= segs; i++) for (let j = 0; j <= radial; j++) { s.push(i / segs); a.push((j / radial) * Math.PI * 2); }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) { const p = i * (radial + 1) + j, q = p + radial + 1; idx.push(p, q, p + 1, q, q + 1, p + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(s.length * 3), 3));
  g.setAttribute('aS', new THREE.Float32BufferAttribute(s, 1));
  g.setAttribute('aAng', new THREE.Float32BufferAttribute(a, 1));
  g.setIndex(idx);
  return g;
}

function tentaculos(U, def) {
  const g = new THREE.Group();
  const n = def.quantidade ?? 5, geo = geoTentaculo();
  const lista = [];
  for (let i = 0; i < n; i++) {
    const f = n > 1 ? i / (n - 1) - 0.5 : 0;
    const mat = materialSombra(U, { fase: i * 1.73 + 0.4, fundoY: -0.15, uniforms: {
      uComp: { value: 2.3 + ((i * 7) % 5) * 0.28 }, uRaio: { value: 0.17 + ((i * 3) % 4) * 0.025 }, uCrescer: { value: 0 }, uInclina: { value: 0 },
    } }, VERT_TENTACULO);
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false;
    m.position.set(f * 2.4, 0, -Math.abs(f) * 0.6 + ((i * 5) % 3) * 0.12);
    g.add(m);
    lista.push({ m, atraso: Math.abs(f) * 0.5 + (i % 2) * 0.12 });
  }
  g.add(poca(U, { rx: 2.1, ry: 0.8, fase: 2 }));
  g.add(fumaca(U, { n: 220, altura: 0.6, largura: 1.6, subida: 1.8, tam: 0.6, semente: 7 }));
  return {
    grupo: g, altura: 3,
    atualizar(t, est) {
      for (const { m, atraso } of lista) {
        const u = m.material.uniforms;
        u.uCrescer.value = Math.max(0, Math.min(1, (est.presenca - atraso * 0.6) / 0.6));
        u.uInclina.value = est.direcaoAlvo * 0.8;
      }
    },
  };
}

// ---------------------------------------------------------------- MASSA COM OLHOS
const DIRS_OLHOS = [[0, 0.3, 1, 0.24], [-0.48, 0.12, 0.88, 0.15], [0.52, 0.22, 0.84, 0.16], [-0.22, -0.28, 0.95, 0.11],
  [0.28, -0.3, 0.92, 0.12], [-0.68, 0.5, 0.55, 0.1], [0.72, -0.08, 0.68, 0.11], [0.08, 0.78, 0.62, 0.13]]
  .map(([x, y, z, r]) => ({ d: new THREE.Vector3(x, y, z).normalize(), r }));

const VERT_MASSA = /* glsl */ `
${RUIDO}
uniform float uTempo, uFase;
uniform vec3 uOlhos[8];
varying vec3 vN, vPW, vL;
vec3 forma(vec3 d){
  float n = fbm(d*1.7 + vec3(0.0, uTempo*0.25, uFase))*0.38 + sin(uTempo*1.3 + d.y*3.0)*0.04;
  for (int i = 0; i < 8; i++) n = mix(n, -0.03, smoothstep(0.93, 0.985, dot(d, uOlhos[i])));
  vec3 p = d*(1.0 + n);
  if (p.y < -0.72) p.y = -0.72 + (p.y + 0.72)*0.2;
  p.xz *= 1.0 + smoothstep(-0.3, -0.72, p.y)*0.3;
  return p;
}
void main(){
  vec3 d = normalize(position);
  vec3 t1 = normalize(cross(d, vec3(0.0, 1.0, 0.013)));
  vec3 t2 = cross(d, t1);
  vec3 p = forma(d), p1 = forma(normalize(d + t1*0.02)), p2 = forma(normalize(d + t2*0.02));
  vec3 n = normalize(cross(p1 - p, p2 - p));
  if (dot(n, d) < 0.0) n = -n;
  vL = p;
  vec4 w = modelMatrix*vec4(p, 1.0);
  vPW = w.xyz;
  vN = normalize(mat3(modelMatrix)*n);
  gl_Position = projectionMatrix*viewMatrix*w;
}`;

function massaOlhos(U, def) {
  const g = new THREE.Group();
  const R = 1.15, cy = 1.0;
  const corpo = new THREE.Group(); corpo.position.y = cy; corpo.scale.setScalar(R); g.add(corpo);
  const mat = materialSombra(U, { fase: 1.1, fundoY: -1.6, uniforms: { uOlhos: { value: DIRS_OLHOS.map((o) => o.d) } } }, VERT_MASSA);
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 28), mat);
  m.frustumCulled = false;
  corpo.add(m);
  const olhos = DIRS_OLHOS.map((o, i) => {
    const e = globoOcular(U, def.corOlhos || '#e0a020');
    e.position.copy(o.d).multiplyScalar(0.97);
    e.scale.setScalar(o.r);
    corpo.add(e);
    return { e, fase: i * 1.37, periodo: 2.6 + (i % 4) * 0.9, i };
  });
  g.add(poca(U, { rx: 1.9, ry: 0.75, fase: 4 }));
  g.add(fumaca(U, { n: 200, altura: 1.6, largura: 1.1, subida: 1.3, tam: 0.55, semente: 11 }));
  const alvo = new THREE.Vector3(), hash = (a) => { const s = Math.sin(a * 127.1) * 43758.5453; return s - Math.floor(s); };
  return {
    grupo: g, altura: 2.4,
    atualizar(t, est) {
      for (const o of olhos) {
        const ab = piscada(t, o.fase, o.periodo) * est.olhosAbertos * Math.min(1, Math.max(0, (est.presenca - 0.4 - o.i * 0.05) / 0.3));
        o.e.material.uniforms.uAbertura.value = ab;
        // olhar: o alvo (personagem) ou a câmera, com pequenos "saltos" de olhar
        const k = Math.floor(t * 1.4 + o.fase);
        alvo.copy(est.alvo).add(new THREE.Vector3((hash(k + o.i) - 0.5) * 0.6, (hash(k * 3 + o.i) - 0.5) * 0.4, 0));
        o.e.lookAt(alvo);
      }
    },
  };
}

// ---------------------------------------------------------------- RASTEJANTE (humano de sombra andando de quatro)
// Corpo de gente, mas de quatro: braços e pernas compridos demais, cotovelos e joelhos dobrados para CIMA,
// cabeça pendendo à frente que dá trancos de lado, olhos brilhando. Anda (andar/correr/mover) com passos nas
// diagonais (mão direita + pé esquerdo); parado, respira e vira a cabeça aos trancos.
function segmento(U, r0, r1, comp, fase) {
  const geo = new THREE.CylinderGeometry(r1, r0, comp, 10, 6).translate(0, comp / 2, 0);
  geo.setAttribute('aBalanco', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count), 1));
  return new THREE.Mesh(geo, materialSombra(U, { amp: 0.025, fase }));
}
const CIMA = new THREE.Vector3(0, 1, 0);
function apontar(m, A, B) {   // segmento com a base em A apontando para B
  m.position.copy(A);
  m.quaternion.setFromUnitVectors(CIMA, B.clone().sub(A).normalize());
}
function rastejante(U, def) {
  const g = new THREE.Group(), corpo = new THREE.Group();
  g.add(corpo);
  // tronco arqueado (corcunda) e pescoço comprido caindo para a frente
  const tronco = new THREE.CatmullRomCurve3([[-0.85, 1.15, 0], [-0.3, 1.62, 0], [0.25, 1.55, 0], [0.62, 1.32, 0]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  corpo.add(new THREE.Mesh(tuboAfinado(tronco, (s) => 0.24 + 0.1 * Math.sin(Math.PI * s), { segs: 40, radial: 14 }), materialSombra(U, { amp: 0.05, fase: 0.4 })));
  const pescoco = new THREE.CatmullRomCurve3([[0.55, 1.36, 0], [0.86, 1.3, 0], [1.08, 1.08, 0]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  corpo.add(new THREE.Mesh(tuboAfinado(pescoco, (s) => 0.13 - 0.04 * s, { segs: 16, radial: 10 }), materialSombra(U, { amp: 0.03, fase: 1.1 })));
  const cabeca = new THREE.Group(); cabeca.position.set(1.12, 1.02, 0); corpo.add(cabeca);
  const cg = new THREE.SphereGeometry(0.3, 24, 18); cg.scale(1.15, 1.0, 0.85);
  cg.setAttribute('aBalanco', new THREE.Float32BufferAttribute(new Float32Array(cg.attributes.position.count), 1));
  cabeca.add(new THREE.Mesh(cg, materialSombra(U, { amp: 0.04, fase: 2.2 })));
  const olhos = [-1, 1].map((k) => { const o = olhoBrilhante(U, def.corOlhos || '#ff5a6a'); o.scale.setScalar(0.55); o.position.set(0.16, -0.02 + k * 0.0, 0.3 + k * 0.06); o.position.x += k * 0.11; cabeca.add(o); return o; });
  // membros: [raiz, comprimentos, apoio no chão, fase do passo]
  const MEMB = [
    { raiz: [0.55, 1.3, 0.24], L: [0.85, 0.9], apoio: [1.25, 0, 0.36], fase: 0 },          // braço da frente
    { raiz: [0.55, 1.3, -0.24], L: [0.85, 0.9], apoio: [1.25, 0, -0.36], fase: Math.PI },   // braço de trás
    { raiz: [-0.8, 1.12, 0.22], L: [0.9, 0.95], apoio: [-1.45, 0, 0.34], fase: Math.PI },   // perna da frente
    { raiz: [-0.8, 1.12, -0.22], L: [0.9, 0.95], apoio: [-1.45, 0, -0.34], fase: 0 },       // perna de trás
  ].map((d, k) => ({ ...d, sup: segmento(U, 0.1, 0.075, d.L[0], k), inf: segmento(U, 0.075, 0.03, d.L[1], k + 0.5) }));
  for (const m of MEMB) { corpo.add(m.sup); corpo.add(m.inf); }
  // dedos/garras na ponta de cada mão
  const garras = MEMB.slice(0, 2).map((m, k) => { const gr = new THREE.Group(); for (let d = 0; d < 3; d++) { const s = segmento(U, 0.025, 0.004, 0.34, d); s.rotation.z = -1.25 - d * 0.18; s.rotation.y = (d - 1) * 0.35; gr.add(s); } corpo.add(gr); return gr; });
  g.add(fumaca(U, { n: 260, altura: 1.8, largura: 1.2, subida: 0.8, tam: 0.42, semente: 7 }));
  g.add(poca(U, { rx: 1.9, ry: 0.6 }));
  const R = new THREE.Vector3(), T = new THREE.Vector3(), J = new THREE.Vector3();
  let fasePasso = 0;
  return {
    grupo: g, altura: 2.0,
    atualizar(t, est) {
      const movendo = !!est.movendo;
      fasePasso = (est.xRoteiro ?? 0) * 2.6 * (def.passo ?? 1);    // passos presos à distância andada (sem patinar)
      const resp = Math.sin(t * 1.6) * 0.03;
      corpo.position.y = movendo ? Math.abs(Math.sin(fasePasso)) * 0.07 : resp;
      // cabeça: balança andando; parada, dá trancos de lado de vez em quando
      const tranco = Math.floor(t * 1.3) % 4 === 0 ? Math.sin(Math.floor(t * 7) * 2.3) * 0.5 : 0;
      cabeca.rotation.z = movendo ? Math.sin(fasePasso * 2) * 0.12 : tranco * 0.6;
      cabeca.rotation.y = movendo ? 0 : tranco;
      for (const [k, m] of MEMB.entries()) {
        R.set(...m.raiz); R.y += corpo.position.y;
        const ph = fasePasso + m.fase, passo = 0.5 * (def.passada ?? 1);
        T.set(m.apoio[0] + (movendo ? Math.sin(ph) * passo : 0), movendo ? Math.max(0, Math.cos(ph)) * 0.38 : 0, m.apoio[2]);
        // IK de 2 ossos: articulação dobrada para CIMA (joelho/cotovelo alto, jeito de aranha)
        const D = T.clone().sub(R), d = Math.min(D.length(), m.L[0] + m.L[1] - 0.02), dir = D.normalize();
        const a = (m.L[0] ** 2 - m.L[1] ** 2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, m.L[0] ** 2 - a * a));
        const perp = CIMA.clone().sub(dir.clone().multiplyScalar(CIMA.dot(dir))).normalize();
        if (k >= 2) perp.add(new THREE.Vector3(-0.35, 0, 0)).normalize();          // joelhos para trás
        J.copy(R).addScaledVector(dir, a).addScaledVector(perp, h);
        const fim = R.clone().addScaledVector(dir, d);
        apontar(m.sup, R, J); apontar(m.inf, J, fim);
        if (k < 2) { garras[k].position.copy(fim); }
      }
      const ab = piscada(t, 0.3, 3.2) * est.olhosAbertos;
      for (const o of olhos) o.material.uniforms.uAbertura.value = ab;
    },
  };
}

const TIPOS = { 'sombra-alta': sombraAlta, tentaculos, 'massa-olhos': massaOlhos, rastejante };
export const NOMES_MONSTROS = Object.keys(TIPOS);

// Cria um monstro para um elemento do roteiro: { "id": "vulto", "monstro": "sombra-alta", "x": 2 }
// monstros desenhados na resolução do pixel art (não precisam da camada em HD)
export const ehMonstroPixel = (def) => def.estilo3d === 'pixel' || def.estilo3d === 'silhueta';
export function criarMonstro(def, uTempo, uMeiaAltura) {
  const U = {
    uTempo, uMeiaAltura, uPresenca: { value: 1 }, uEscala: { value: def.escala ?? 1 },
    cor: def.cor || '#050308', borda: def.corBorda || '#5a4a8a', brasa: def.corBrasa || '#b89aff',
    estilo: ESTILOS_3D[def.estilo3d] ?? null,
  };
  const fab = TIPOS[def.monstro] || sombraAlta;
  const m = fab(U, def);
  if (U.estilo != null) m.grupo.traverse((o) => { if (o.isPoints || o.userData.poca) o.visible = U.estilo === 0 && o.isPoints; });   // sem a fumaça macia (e sem poça) nas tentativas em desenho
  return {
    ...m,
    atualizar(t, est) {
      U.uPresenca.value = est.presenca;
      m.grupo.visible = est.presenca > 0.001;
      m.grupo.position.copy(est.pos);
      const s = def.escala ?? 1;
      m.grupo.scale.set(s * (def.monstro === 'massa-olhos' ? 1 : est.virado), s, s);
      m.atualizar(t, est);
    },
  };
}

// ---------------------------------------------------------------- composição final (alta resolução)
// Junta: mundo pixel art (ampliado sem borrar) + monstros em HD. Perto dos monstros o mundo escurece em
// degraus pontilhados e "treme" em blocos de pixel. Balões, legendas e chuva continuam na frente.
export class Composicao {
  constructor(W, H) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tPixel: { value: null }, tMonstro: { value: null }, tUI: { value: null }, uRes: { value: new THREE.Vector2(W, H) },
        uTempo: { value: 0 }, uFade: { value: 0 }, uFlash: { value: 0 }, uTipo: { value: 0 }, uCentro: { value: new THREE.Vector2() },
        uAura: { value: [0, 1, 2, 3].map(() => new THREE.Vector4()) }, uNAura: { value: 0 },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform sampler2D tPixel, tMonstro, tUI; uniform vec2 uRes, uCentro; uniform float uTempo, uFade, uFlash; uniform int uTipo, uNAura;
        uniform vec4 uAura[4];
        varying vec2 vUv;
        float bayer4(vec2 p){ int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0)); int m[16] = int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5); return (float(m[y*4+x]) + 0.5)/16.0; }
        void main(){
          vec2 cel = floor(vUv*uRes);
          float ui = texture2D(tUI, (cel + 0.5)/uRes).a;
          float aura = 0.0;
          for (int i = 0; i < 4; i++) { if (i >= uNAura) break; float d = length(cel + 0.5 - uAura[i].xy); aura = max(aura, uAura[i].w*(1.0 - smoothstep(uAura[i].z*0.3, uAura[i].z, d))); }
          if (ui > 0.5) aura = 0.0;
          vec2 desl = aura > 0.1 ? floor(vec2(sin(cel.y*0.7 + uTempo*5.0), cos(cel.x*0.6 + uTempo*4.0))*aura*1.4 + 0.5) : vec2(0.0);
          vec3 pix = texture2D(tPixel, (clamp(cel + desl, vec2(0.0), uRes - 1.0) + 0.5)/uRes).rgb;
          float bay = bayer4(cel);
          float esc = floor(aura*4.0 + bay)/4.0;
          float l = dot(pix, vec3(0.299, 0.587, 0.114));
          pix = mix(pix, vec3(l)*vec3(0.55, 0.5, 0.72), esc*0.6)*(1.0 - esc*0.5);
          vec4 m = texture2D(tMonstro, vUv);
          float vis = 1.0;
          if (uFade > 0.0) {
            if (uTipo == 1) vis = 1.0 - uFade;
            else if (uTipo == 2) vis = bay < uFade*1.02 ? 0.0 : 1.0 - uFade*0.5;
            else if (uTipo == 3) vis = length(cel + 0.5 - uCentro) > (1.0 - uFade)*length(uRes)*0.62 ? 0.0 : 1.0;
            else if (uTipo == 4) vis = 1.0 - smoothstep(0.6, 1.0, uFade);
          }
          m *= vis;
          m.rgb = mix(m.rgb, vec3(m.a), uFlash);
          vec3 c = m.rgb + pix*(1.0 - m.a);
          if (ui > 0.5) c = pix;
          gl_FragColor = vec4(c, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.cena = new THREE.Scene();
    this.cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
}
export const TIPOS_TRANSICAO = { corte: 0, fade: 1, dither: 2, iris: 3, pixelizar: 4 };
