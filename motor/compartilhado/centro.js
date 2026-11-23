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

// Centraliza UMA cena resolvida (c) do roteiro bruto (cb) no Shorts. Em quem: cb.vertical.centrarEm, senão todos com papel
// (sem figurantes/"sobre"/"tela"; só figurantes → neles). Grupo largo demais (> 170 px) → fica com quem a câmera atual já
// mostrava mais no meio e os vizinhos que cabem junto (até 150 px). Devolve { x, centrarEm?, desvio, nota } ou null.
export function centrarCena(c, cb, estadoElemento) {
  if (c.vista !== 'diorama' && c.vista !== 'diagonal') return null;
  if (temPanoramica(cb)) return null;   // câmera que anda (cameraFim / ação camera): quem escreveu escolheu o caminho
  const em = cb.vertical?.centrarEm;
  const pessoas = (cb.elementos || []).filter((e) => e.personagem && !e.sobre && !e.tela);
  let ids = em || pessoas.filter((e) => !e.figurante).map((e) => e.id);
  if (!ids.length) ids = pessoas.map((e) => e.id);
  const quem = c.elementos.filter((e) => ids.includes(e.id));
  if (!quem.length) return null;
  const cam = { ...(c.camera || {}), ...(cb.vertical?.camera || {}) };
  let med = medirCentro(c, quem, cam, estadoElemento), centrarEm, nota = ids.join(', ');
  if (med && med.larg > 170 && !em) {
    const um = quem.map((e) => [e, medirCentro(c, [e], cam, estadoElemento)]).filter(([, m]) => m).sort((a, b) => Math.abs(a[1].m) - Math.abs(b[1].m));
    const sub = [um[0]];
    for (const par of um.slice(1)) { const ms = [...sub, par].map(([, m]) => m.m); if (Math.max(...ms) - Math.min(...ms) <= 150) sub.push(par); }
    centrarEm = sub.map(([e]) => e.id);
    med = medirCentro(c, sub.map(([e]) => e), cam, estadoElemento);
    nota = `grupo não cabe: centrado em ${centrarEm.join(', ')}, perto do foco anterior`;
  }
  if (!med) return null;
  return { x: +((cam.x ?? 0) + med.m / (16 * (cam.zoom ?? 1))).toFixed(2), centrarEm, desvio: med.m, nota, xAntes: cam.x ?? 0 };
}

// a câmera da cena se mexe sozinha (panorâmica): não dá para centrar com um x só
export const temPanoramica = (cb) => !!(cb.cameraFim || cb.vertical?.cameraFim || (cb.acoes || []).some((a) => a.tipo === 'camera'));

// Altura na TELA (px a partir do topo, resolução interna) de um ponto do diorama: chão em (x, z) + "alt" unidades de altura.
// Mesma projeção 2:1 do motor (motor/vistas.js: rua i = 6,25 − z, câmera i = 3,5 − câmera.z; cômodo 4,2 / 2,5; j = −x).
export function yTela(x, z, alt, cam, comodo = false, H = 320) {
  const i = (comodo ? 4.2 : 6.25) - z, ic = (comodo ? 2.5 : 3.5) - (cam.z ?? 0);
  const d = -((i - x) - (ic - (cam.x ?? 0))) / 2 + alt - (cam.y ?? 0);
  return H / 2 - d * 16 * (cam.zoom ?? 1);
}
