// Utilidades puras (usadas no navegador e no Node).

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const suave = (t) => t * t * (3 - 2 * t);
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const EASINGS = { linear: (t) => t, suave: easeInOut, saida: easeOut, elastico: easeOutBack };

// PRNG determinístico.
export function rng(semente = 1) {
  let a = (typeof semente === 'string' ? hashTexto(semente) : semente) >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashTexto(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Ruído suave determinístico em 1D (para tremor/cintilação).
export function ruido1(x, semente = 0) {
  const i = Math.floor(x), f = x - i;
  const h = (n) => { const s = Math.sin((n + semente * 57.31) * 127.1) * 43758.5453; return s - Math.floor(s); };
  return lerp(h(i), h(i + 1), suave(f)) * 2 - 1;
}

export const PIXELS_POR_UNIDADE = 16;
export const FOV = 30;

// Distância da câmera tal que, no plano z=0, 1 unidade = 16 pixels internos.
export function distanciaCamera(alturaInterna) {
  return (alturaInterna / PIXELS_POR_UNIDADE) / (2 * Math.tan((FOV * Math.PI) / 360));
}
