# Biblioteca de assets (compartilhada por todos os projetos)

**Lista de tudo que existe:** [`CATALOGO.md`](CATALOGO.md) (atualize com `npm run catalogo`).

## Onde cada coisa fica

| Pasta / arquivo | O quê | Status |
|---|---|---|
| `motor/assets/` | código de todos os sprites desenhados (um arquivo por grupo; índice em `motor/assets/index.js`) | cada sprite diz se é aprovado ou protótipo |
| `biblioteca/personagens.json` | personagens prontos: `{ "id": "joao", "personagem": "joao", "x": 2 }` | aprovados |
| `biblioteca/cenarios.json` | lugares prontos (vista + objetos fixos): `{ "cenario": "praca" }` | aprovados |
| `prototipos/personagens.json`, `prototipos/cenarios.json` | os mesmos formatos, para o que ainda está em teste | protótipos |
| `biblioteca/sprites/` | seus PNGs: `"sprite": "arquivo:joao.png"` | — |
| `biblioteca/sfx/` | seus sons: `sfx/moeda.wav` substitui o efeito gerado `moeda` | — |

Protótipos já funcionam em **qualquer projeto**, sem copiar nada. Quando aprovar, a entrada passa de
`prototipos/` para `biblioteca/` (o nome continua igual, nenhum roteiro muda).

## Prioridade (o primeiro que existir vence)
- personagens/cenários: `projetos/<nome>/personagens.json` e `cenarios.json` (opcionais) → `biblioteca/` → `prototipos/`
- sprites PNG: `projetos/<nome>/sprites/` → `biblioteca/sprites/`
- efeitos: `projetos/<nome>/sfx/` → `biblioteca/sfx/` → `sfx/`

## Ver os assets
- `npm run catalogo` — lista em texto (`CATALOGO.md`)
- `npm run sprites` — folha com todos os sprites (`sprites-disponiveis.png`)
- `npm run vitrine` — imagens das mudanças mais recentes (`projetos/vitrine/saida/fotos/`)
