// Pós-processamento em resolução interna: bloom, vinheta, aberração, flash,
// transições (fade, dither, íris, pixelizar) e quantização com dithering Bayer.
import * as THREE from 'three';
import { hexParaRgb } from './pixel.js';

export const PALETAS = {
  retro32: ['#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179', '#29366f', '#3b5dc9', '#41a6f6', '#73eff7',
    '#f4f4f4', '#94b0c2', '#566c86', '#333c57', '#0b0a14', '#3a1c24', '#7a3a2a', '#c87a40', '#e8c890', '#6a4a8a', '#a07ac8', '#e090c0',
    '#2a5a3a', '#5a8a3a', '#9ab840', '#f0e060', '#8a2a3a', '#d84a4a', '#4a2a1a', '#8a5a32'],
  verde4: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  sepia: ['#1e140c', '#3c2a1a', '#5e4428', '#82623a', '#a8844e', '#ccaa6e', '#ead098', '#fff0d0'],
  noir: ['#0a0a0a', '#2a2a2a', '#4a4a4a', '#6e6e6e', '#949494', '#bcbcbc', '#e4e4e4'],
  quente: ['#1a0c14', '#3a1424', '#6a1e2a', '#a8322c', '#d85a30', '#f08a3a', '#f8b850', '#ffe08a', '#fff8d8', '#4a2a40', '#7a4a5a', '#b87a6a'],
  fria: ['#06081a', '#101838', '#1a2a5a', '#244080', '#2e5aa8', '#4a80c8', '#70a8e0', '#a0d0f0', '#e0f4ff', '#3a3060', '#5a5090', '#8a80c0'],
};

const TIPOS = { corte: 0, fade: 1, dither: 2, iris: 3, pixelizar: 4 };

const FRAG = /* glsl */ `
uniform sampler2D tCena;
uniform vec2 uRes;
uniform int uFinal, uTipo, uUsaPaleta, uNumCores;
uniform float uFade, uFlash, uBloom, uVinheta, uAberracao, uNiveis, uSaturacao;
uniform vec2 uCentro;
uniform vec3 uPaleta[32];
varying vec2 vUv;

float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  int i = y * 4 + x;
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[i]) + 0.5) / 16.0;
}
vec3 amostra(vec2 px) { return texture2D(tCena, (clamp(px, vec2(0.0), uRes - 1.0) + 0.5) / uRes).rgb; }

void main() {
  vec2 px = floor(vUv * uRes);
  if (uTipo == 4 && uFade > 0.0) {
    float b = floor(1.0 + uFade * uFade * 18.0);
    px = floor(px / b) * b + floor(b * 0.5);
  }
  vec3 c = amostra(px);
  if (uFinal == 1) {
    if (uAberracao > 0.0) {
      c.r = amostra(px + vec2(uAberracao, 0.0)).r;
      c.b = amostra(px - vec2(uAberracao, 0.0)).b;
    }
    if (uBloom > 0.0) {
      vec3 b = vec3(0.0);
      for (int i = 0; i < 12; i++) {
        float a = float(i) * 0.5236;
        float r = i % 2 == 0 ? 1.0 : 2.0;
        vec3 s = amostra(px + floor(vec2(cos(a), sin(a)) * r + 0.5));
        float l = dot(s, vec3(0.299, 0.587, 0.114));
        b += s * smoothstep(0.78, 1.0, l) * (s.r + 0.2 > s.b ? 1.0 : 0.3);
      }
      c += b * uBloom / 12.0;
    }
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, uSaturacao);
    if (uVinheta > 0.0) {
      vec2 d = (px + 0.5) / uRes - 0.5;
      d.x *= uRes.x / uRes.y;
      c *= 1.0 - uVinheta * smoothstep(0.35, 1.0, length(d) * 1.25);
    }
  }
  c = mix(c, vec3(1.0), uFlash);

  float bay = bayer4(px);
  if (uFade > 0.0) {
    if (uTipo == 1) c *= 1.0 - uFade;
    else if (uTipo == 2) { if (bay < uFade * 1.02) c = vec3(0.0); else c *= 1.0 - uFade * 0.5; }
    else if (uTipo == 3) {
      float raio = (1.0 - uFade) * length(uRes) * 0.62;
      if (length(px + 0.5 - uCentro) > raio) c = vec3(0.0);
    }
    else if (uTipo == 4) c *= 1.0 - smoothstep(0.6, 1.0, uFade);
  }

  if (uFinal == 1 && uUsaPaleta > 0) {
    if (uUsaPaleta == 1) {
      vec3 alvo = clamp(c + (bay - 0.5) * 0.14, 0.0, 1.0);
      float melhor = 1e9; vec3 escolha = alvo;
      for (int i = 0; i < 32; i++) {
        if (i >= uNumCores) break;
        vec3 d = (alvo - uPaleta[i]) * vec3(0.30, 0.59, 0.11);
        float dist = dot(d, d);
        if (dist < melhor) { melhor = dist; escolha = uPaleta[i]; }
      }
      c = escolha;
    } else {
      float n = uNiveis - 1.0;
      c = floor(clamp(c, 0.0, 1.0) * n + bay) / n;
    }
  }
  gl_FragColor = vec4(c, 1.0);
}`;

export class PosProcessamento {
  constructor(W, H) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tCena: { value: null }, uRes: { value: new THREE.Vector2(W, H) }, uFinal: { value: 0 }, uTipo: { value: 0 },
        uUsaPaleta: { value: 0 }, uNumCores: { value: 0 }, uFade: { value: 0 }, uFlash: { value: 0 }, uBloom: { value: 0 },
        uVinheta: { value: 0 }, uAberracao: { value: 0 }, uNiveis: { value: 8 }, uSaturacao: { value: 1 },
        uCentro: { value: new THREE.Vector2(W / 2, H / 2) },
        uPaleta: { value: Array.from({ length: 32 }, () => new THREE.Vector3()) },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FRAG, depthTest: false, depthWrite: false,
    });
    this.cena = new THREE.Scene();
    this.cena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  definirPaleta(nome) {
    const u = this.material.uniforms;
    const pal = Array.isArray(nome) ? nome : PALETAS[nome];
    if (nome === 'posterizar') { u.uUsaPaleta.value = 2; return; }
    if (!pal) { u.uUsaPaleta.value = 0; return; }
    u.uUsaPaleta.value = 1;
    u.uNumCores.value = Math.min(32, pal.length);
    pal.slice(0, 32).forEach((h, i) => u.uPaleta.value[i].set(...hexParaRgb(h).map((v) => v / 255)));
  }

  configurar(o) {
    const u = this.material.uniforms;
    u.tCena.value = o.textura;
    u.uFinal.value = o.final ? 1 : 0;
    u.uTipo.value = TIPOS[o.transicao] ?? 0;
    u.uFade.value = o.fade;
    u.uFlash.value = o.flash;
    u.uBloom.value = o.bloom ?? 0;
    u.uVinheta.value = o.vinheta ?? 0;
    u.uAberracao.value = o.aberracao ?? 0;
    u.uNiveis.value = o.niveis ?? 8;
    u.uSaturacao.value = o.saturacao ?? 1;
    if (o.centro) u.uCentro.value.set(o.centro.x, o.centro.y);
  }
}
