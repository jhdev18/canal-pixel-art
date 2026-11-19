// Gera biblioteca/CATALOGO.md: TODOS os assets (sprites, personagens, cenários, ações, sons) num lugar só,
// com status (aprovado / protótipo), estados e onde ficam. Roda no Node, sem navegador: npm run catalogo
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './config.js';
import { carregarBiblioteca, lerJsonFlexivel, PASTA_BIBLIOTECA, PASTA_PROTOTIPOS } from './biblioteca.js';

const OCULTOS = new Set(['andando', 'correndo', 'pulando']);   // animações automáticas (não são "estados")

export async function gerarCatalogo() {
  const { Pix } = await import('../motor/pixel.js');
  Pix.prototype.paraCanvas = function () { return { width: this.w, height: this.h }; };   // só o tamanho
  const { obterSprite, NOMES_SPRITES, INFO_SPRITES } = await import('../motor/sprites.js');
  await import('../motor/assets/index.js');
  const { DURACAO_PADRAO } = await import('../motor/compartilhado/linhaDoTempo.js');
  const { NOMES_SONS, AMBIENTES } = await import('./audio/sintetizador.js');

  const ler = (arq) => (fs.existsSync(arq) ? lerJsonFlexivel(arq) : {});
  const aprov = { p: ler(path.join(PASTA_BIBLIOTECA, 'personagens.json')), c: ler(path.join(PASTA_BIBLIOTECA, 'cenarios.json')) };
  const proto = { p: ler(path.join(PASTA_PROTOTIPOS, 'personagens.json')), c: ler(path.join(PASTA_PROTOTIPOS, 'cenarios.json')) };
  const st = (s) => (s === 'protótipo' ? '🧪 protótipo' : '✅');

  let md = `# Catálogo de assets\n\nGerado por \`npm run catalogo\` (não edite à mão). ✅ = aprovado · 🧪 = protótipo (aguardando o "pode salvar").\n\n`;
  md += `| Onde fica | O quê |\n|---|---|\n| \`motor/assets/\` | todo sprite desenhado em código (um arquivo por grupo; índice em \`motor/assets/index.js\`) |\n`;
  md += `| \`biblioteca/personagens.json\`, \`biblioteca/cenarios.json\` | personagens e cenários **aprovados** |\n| \`prototipos/personagens.json\`, \`prototipos/cenarios.json\` | **protótipos**, já disponíveis em todos os projetos |\n`;
  md += `| \`biblioteca/sprites/\`, \`biblioteca/sfx/\` | PNGs e sons seus |\n\nPrioridade quando o nome se repete: projeto > biblioteca > protótipos.\n\n`;

  // ---- sprites por grupo
  const grupos = {};
  for (const n of NOMES_SPRITES) { const i = INFO_SPRITES[n] || { grupo: 'Outros', status: 'aprovado' }; (grupos[i.grupo] ??= []).push([n, i]); }
  md += `## Sprites (${NOMES_SPRITES.length})\n\nUso: \`{ "sprite": "nome" }\`; estado com \`"pose"\` ou ação \`trocar\`.\n\n`;
  for (const [g, lista] of Object.entries(grupos)) {
    md += `### ${g}\n\n| Sprite | Status | Estados | Tamanho |\n|---|---|---|---|\n`;
    for (const [n, i] of lista) {
      let est = '', tam = '';
      try { const s = obterSprite(n); est = Object.keys(s.anims || {}).filter((a) => !OCULTOS.has(a)).join(', '); tam = `${s.quadros[0].width}×${s.quadros[0].height}`; }
      catch (e) { est = `(gerado no navegador)`; }
      md += `| \`${n}\` | ${st(i.status)} | ${est} | ${tam} |\n`;
    }
    md += '\n';
  }
  // ---- personagens
  md += `## Personagens\n\nUso: \`{ "id": "x", "personagem": "nome" }\`\n\n| Personagem | Status | Sprite | Voz |\n|---|---|---|---|\n`;
  for (const [k, v] of Object.entries({ ...proto.p, ...aprov.p })) md += `| \`${k}\` | ${aprov.p[k] ? '✅' : '🧪 protótipo'} | \`${v.sprite}\` | ${v.voz ?? ''} |\n`;
  // ---- cenários
  md += `\n## Cenários\n\nUso: \`{ "cenario": "nome" }\`\n\n| Cenário | Status | Vista | Objetos |\n|---|---|---|---|\n`;
  for (const [k, v] of Object.entries({ ...proto.c, ...aprov.c })) {
    const vista = v.vista ? (v.comodo ? `${v.vista} (cômodo ${v.comodo.tipo || ''})` : v.vista) : `lateral${v.fundo ? ` (${v.fundo})` : ''}`;
    md += `| \`${k}\` | ${aprov.c[k] ? '✅' : '🧪 protótipo'} | ${vista} | ${(v.elementos || []).length} |\n`;
  }
  // ---- ações e sons
  md += `\n## Ações\n\n${Object.keys(DURACAO_PADRAO).map((a) => `\`${a}\``).join(', ')} (detalhes no README).\n\n`;
  md += `## Sons\n\nEfeitos: ${NOMES_SONS.filter((s) => !AMBIENTES.includes(s)).map((s) => `\`${s}\``).join(', ')}\n\nAmbientes: ${AMBIENTES.map((s) => `\`${s}\``).join(', ')}\n`;
  const arq = path.join(PASTA_BIBLIOTECA, 'CATALOGO.md');
  fs.writeFileSync(arq, md);
  return { arq, sprites: NOMES_SPRITES.length, personagens: Object.keys({ ...proto.p, ...aprov.p }).length, cenarios: Object.keys({ ...proto.c, ...aprov.c }).length };
}
