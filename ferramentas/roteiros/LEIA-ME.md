# Scripts do Claude para montar roteiros "Nesse Mundo"

Geram `projetos/<nome>/roteiro.json` com os tempos calculados pela fala estimada (0,065 s por letra).
Rodar da raiz do repositório: `node ferramentas/roteiros/c12-comida.mjs` e depois `npm run conferir -- nesse-mundo-comida`.

- `nm.mjs` — helpers: `P` (pessoa), `S` (sprite), `RUA`/`FRENTE`/`PRACA` (câmeras), `a(f, tipo, {...})` (ação na fração f
  da fala; `durF` = duração em fração), `cena`, `salvar`, `base(titulo, trilha)`, `marcar` (momentos), `rostos`, `turma`.
- `c*-*.mjs` — curtos; `l*-*.mjs` — longos. `docs.mjs`/`docs-novos.mjs` escrevem `ROTEIRO.md`/`PUBLICACAO.md`.

**Cuidado:** os vídeos já postados (estrelas, caderno, sombras, guardiões, números, relógio) NÃO devem ser regenerados:
os roteiros deles receberam ajustes à mão depois do script. Para um vídeo novo, copie um script parecido (ex.: `c12-comida.mjs`).
