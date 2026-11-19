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
5. **A câmera nunca gira para os lados, em qualquer vista** (pixels precisam ficar alinhados à tela).
6. Personagens e cenários são **originais** (estilo inspirado em Undertale/Deltarune, sem copiar).
7. Usar Three.js para tudo que for visual (os assets precisam funcionar no motor).
8. Economizar tokens: respostas objetivas.
9. **Não gerar nem abrir imagens para conferir, a menos que o usuário peça** (ex.: "confere antes de me
   mostrar"). Conferir por texto: sintaxe, roteiro válido, durações calculadas, cortes da narração
   (`--verificar`), medições simples.
10. **Sem pausa entre cenas** (retenção): ao escrever roteiros novos, todas as ações e balões de cada cena
    terminam antes (ou junto) do fim da fala do narrador — nada de tempo parado sem narração. Conferir pelas
    durações calculadas (fala estimada ≈ 0,065 s por letra) antes de entregar.

## Ritmo dos próximos vídeos (retenção)
- **Gancho nos 2 primeiros segundos:** abrir com algo acontecendo ou uma pergunta/mistério; o título entra depois.
- **Uma frase do narrador = uma cena curta** (2–4 s). Evitar "..." longos no texto do narrador.
- **Nada parado:** toda cena tem movimento (`cameraFim` com pan/zoom leve, alguém andando, partículas).
- **Quebra de padrão a cada ~5 s:** `flash`, `tremer`, ícone de emoção ou SFX na palavra forte da narração.
- **Alternar vistas** `lateral` ↔ `diagonal` entre cenas seguidas para variar o visual.
- **Balões:** curtos (até ~4 palavras), poucos, servem de reação; quem conta a história é o narrador.
  Projetos novos já vêm com `"volumeBaloes": 0.4` (som baixo, narrador em destaque).
- **Loop aberto no meio** ("mas o que ninguém sabia...") e **pergunta/voto só nos últimos ~3 s**.
- **Shorts:** até 60 s, enquadramento `vertical` em toda cena com personagem.
- Sugerir ao usuário narração no ElevenLabs um pouco mais rápida (velocidade ~1,1).

## Dinâmica de trabalho (ajustes visuais)
1. O usuário renderiza no PC dele e diz o que ajustar, em texto, indicando **cena e momento**
   (ex.: "cena 3, ~0:22, a Bia está cortada no Shorts"), de preferência **vários ajustes numa só mensagem**.
2. Captura de tela só quando for difícil descrever.
3. O Claude ajusta **só o que foi apontado**, sem renderizar e sem abrir imagens.
4. Conteúdo novo (episódio novo, personagens novos) → **conversa nova** (este arquivo guarda as regras).

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
- **Protótipos NÃO aprovados (já no motor, fora da `biblioteca/`):**
  - Casa em diorama (`motor/casa-diorama.js`): `casa-sala`, `casa-cozinha`, `casa-quarto`, `casa-banheiro`
    (+ `-noite`), personagens `mae`, `mae-avental`, `menino-topete`; fundos `diorama`/`diorama-noite`.
    Prévia: `npm run previa -- prototipo-casa`.
  - Monstros de sombra 3D (`motor/monstros3d.js`): elemento `"monstro": "sombra-alta" | "tentaculos" | "massa-olhos"`,
    desenhados em alta resolução sobre o pixel art (o quadro sai em HD quando o roteiro tem monstro).
    Prévia: `npm run previa -- prototipo-monstros`.
  - Depois do "pode salvar": cadastrar em `biblioteca/` (personagens/cenários) e documentar no README.
- Branch de trabalho: `claude/cool-noether-ai5egq`.
