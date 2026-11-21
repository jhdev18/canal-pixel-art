// PROTÓTIPO — pose de espirro dos personagens detalhados (moradores e menina-capa).
// Dois quadros de frente: "espirro-antes" (inspira: cabeça sobe 1px, olhos semicerrados, boca em "o") e
// "espirro" (ATCHIM: curva 1px para a frente, olhos apertados > <, boca aberta e gotinhas saindo).
// Use a ação { "tipo": "espirrar", "alvo": "bia", "inicio": 1 } (duração padrão 1 s: 60% inspirando, 40% atchim),
// ou fixe a pose com "pose": "espirro-antes" / "espirro".

// gotinhas do espirro em volta da boca (cx, y = centro da boca, em pixels do quadro 28x44)
export function gotinhas(b, cx, y) {
  const claro = '#eaf8ff', azul = '#a8d4f0';
  const pts = [[-4, 1, claro], [4, 1, claro], [-6, 0, azul], [6, 0, azul], [-8, 2, claro], [8, 2, claro],
    [-3, 3, azul], [3, 3, azul], [0, 3, claro], [-10, -1, azul], [10, -1, azul], [-7, 4, azul], [7, 4, azul]];
  for (const [dx, dy, c] of pts) b.pinta(Math.round(cx + dx), y + dy, c);
}

// quadros: [antes, atchim] (desenhos de frente, mesmo tamanho do sprite)
export function adicionarEspirro(sprite, quadros) {
  const n = sprite.quadros.length;
  sprite.quadros.push(...quadros);
  sprite.anims['espirro-antes'] = { q: [n], fps: 1 };
  sprite.anims.espirro = { q: [n + 1], fps: 1 };
  return sprite;
}
