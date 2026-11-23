// Centralização no diorama (Shorts e 16:9). A câmera NÃO fica em cima de quem tem o mesmo "x": a profundidade "z" também desloca
// a pessoa na tela (16 px por unidade, para a esquerda conforme o z cresce). Uma pessoa em (x, z) fica no meio da tela quando
//   rua / praça / mundo de blocos:  câmera.x = x − z + câmera.z + 2,75
//   cômodos (*-diorama):            câmera.x = x − z + câmera.z + 1,7
// (vem de motor/vistas.js: rua i = 6,25 − z e câmera i = 3,5 − câmera.z; cômodo i = 4,2 − z e câmera i = 2,5 − câmera.z; tela ∝ i + x)
export const K_CENTRO = { rua: 2.75, comodo: 1.7 };
export const xCentrado = (x, z, camZ = 0, comodo = false) => x - z + camZ + (comodo ? K_CENTRO.comodo : K_CENTRO.rua);
// deslocamento na tela (px internos; + = à direita do meio) de alguém em (x, z) com a câmera em (camX, camZ, zoom)
export const desvioPx = (x, z, cam, comodo = false) => (xCentrado(x, z, cam.z ?? 0, comodo) - (cam.x ?? 0)) * 16 * (cam.zoom ?? 1);

// Mede, na cena JÁ RESOLVIDA (resolverRoteiro), onde "quem" fica na tela ao longo do tempo (7 amostras).
// Devolve { m: desvio médio do meio do grupo em px (+ = à direita), larg: maior largura do grupo em px }, ou null.
// Usado pelo nm.mjs (centraliza sozinho ao salvar) e pelo src/conferir.js (aviso [centro]): os dois medem igual.
export function medirCentro(c, quem, cam, estadoElemento) {
  const meio = [], larg = [];
  for (let k = 0; k <= 6; k++) {
    const t = (c.duracao * k) / 6 * 0.98;
    const ds = quem.map((e) => [e, estadoElemento(c, e, t)]).filter(([, st]) => st.visivel && (st.alpha ?? 1) > 0.2)
      .map(([e, st]) => desvioPx(st.x, st.z ?? e.z ?? 0, cam, !!c.comodo));
    if (!ds.length) continue;
    meio.push((Math.min(...ds) + Math.max(...ds)) / 2); larg.push(Math.max(...ds) - Math.min(...ds));
  }
  if (!meio.length) return null;
  return { m: meio.reduce((a, b) => a + b, 0) / meio.length, larg: Math.max(...larg) };
}
