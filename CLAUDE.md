# Canal Pixel Art — regras para o Claude

Gerador de vídeos pixel art (Three.js no Chrome/Edge com GPU → FFmpeg/NVENC). Leia o `README.md` e o
`FORMAS-DE-VIDEO.md` antes de mudar algo. Responda em português.

## Regras do usuário (sempre seguir)
1. **Não renderizar vídeos.** O usuário renderiza no PC dele (GTX 1050 Ti). Para conferir, use no máximo
   imagens paradas — e só quando for essencial.
2. **Só vistas `lateral` e `diagonal`** ao criar vídeos/roteiros, a menos que o usuário peça outra.
   A vista `avenida` e o `"movimentoReal"` existem, mas não usar (e nunca o tempo todo).
3. **Mostrar antes de colocar na biblioteca** (`biblioteca/`: personagens, cenários, sprites, sons).
   Protótipos ficam na pasta temporária; só cadastrar depois do "pode salvar".
4. **Narração por um narrador em terceira pessoa**, em **um único áudio**
   (`projetos/<ep>/narracao/narracao-completa.mp3`), com legenda automática do texto do narrador.
5. **Câmera nunca gira** para os lados (pixels precisam ficar alinhados à tela) — esta regra vale
   para vídeos novos que usem uma vista **diferente de lateral e diagonal**.
6. Personagens e cenários são **originais** (estilo inspirado em Undertale/Deltarune, sem copiar).
7. Usar Three.js para tudo que for visual (os assets precisam funcionar no motor).
8. Economizar tokens: respostas objetivas, evitar abrir imagens sem necessidade.

## Produção de um episódio
- Rascunho (16:9): `npm run rascunho -- <ep>`
- Final (gera `final.mp4` 16:9 e `final-shorts.mp4` 9:16): `npm run final -- <ep>`
- Texto para o ElevenLabs: `npm run narracao -- <ep>` (usa `"narracaoTexto"` de cada cena)
- Conferir cortes da narração sem renderizar: `npm run narracao -- <ep> --verificar`
- Cada cena pode ter um bloco `"vertical"` com o enquadramento do Shorts.
- Transições curtas (0,2 s); cenas sem duração fixa (duram o tempo da fala/ações).

## Estado atual
- **Episódio 1** em `projetos/episodio-01` ("Nada acontece em Vila Serena"): protagonista **Bia**
  (`menina-capa`), padeiro **seu Tonho**; 9 cenas; final com o público decidindo (comentar 1 ou 2).
  Aguardando o usuário gravar a narração e renderizar.
- **Biblioteca aprovada:** personagens detalhados (`menina-capa`, `robo-semaforo`), moradores
  (`policial`, `prefeito`, `aluno`, `aluna`, `professora`, `padeiro`, `caixa`), estilo RPG
  (`pombo-fofoqueiro`, `cao-guarda`, `coruja-banca`...), cenários de cidade (`escola`, `delegacia`,
  `padaria`, `mercado`, `farmacia`, `rua-comercial`, `rua-comercial-noite`, `cidade-rpg`, `batalha`).
- **Protótipos NÃO aprovados (fora do projeto):** `monstro-sombra` e tentáculos de sombra em 3D.
  Se o usuário aprovar, precisam ser recriados no motor (não estão no repositório).
- Branch de trabalho: `claude/cool-noether-ai5egq`.
