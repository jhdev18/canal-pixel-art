# Biblioteca de assets (compartilhada por todos os projetos)

| Arquivo / pasta | Para quê | Como usar no roteiro |
|---|---|---|
| `personagens.json` | personagens do canal, definidos uma vez | `{ "id": "joao", "personagem": "joao", "x": 2 }` |
| `cenarios.json` | lugares que se repetem (fundo + objetos fixos) | `{ "cenario": "acampamento", ... }` |
| `sprites/` | seus PNGs | `"sprite": "arquivo:joao.png"` |
| `sfx/` | seus efeitos sonoros | `sfx/moeda.wav` substitui o efeito gerado `moeda` |

Prioridade (o primeiro que existir vence):
- sprites: `projetos/<nome>/sprites/` → `biblioteca/sprites/`
- efeitos: `projetos/<nome>/sfx/` → `biblioteca/sfx/` → `sfx/`
- personagens/cenários: `projetos/<nome>/personagens.json` e `cenarios.json` (opcionais) → `biblioteca/`

Veja o que está disponível com `npm run lista`.
