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
- **Nada parado, mas com sentido:** a vida da cena vem de preferência dos **personagens** (expressões no rosto,
  ícone de emoção, alguém andando) e de partículas (`clima` do cenário: `poeira`, `neve`, `vagalumes`). Mover a câmera só quando ajudar a história; evitar
  pan/zoom que deixe os pixels estranhos (nada de zoom lento quebrado; se usar, curto e terminando em valor redondo).
- **Quebra de padrão a cada ~5 s:** `flash`, `tremer`, ícone de emoção ou SFX na palavra forte da narração.
- **Alternar vistas** `lateral` ↔ `diagonal` entre cenas seguidas para variar o visual.
- **Balões:** curtos (até ~4 palavras), poucos, servem de reação; quem conta a história é o narrador.
  Exceção: um balão maior é permitido quando o personagem tiver **algo interessante a dizer** (piada, revelação,
  fala marcante) — charme estilo Undertale.
  Projetos novos já vêm com `"volumeBaloes": 0.4` (som baixo, narrador em destaque).
- **Loop aberto no meio** ("mas o que ninguém sabia...") e **pergunta/voto só nos últimos ~3 s**.
- **Shorts:** até 60 s, enquadramento `vertical` em toda cena com personagem.
- Sugerir ao usuário narração no ElevenLabs um pouco mais rápida (velocidade ~1,1).

## Estilo "Mundo Torto" (Shorts de regra absurda)
Usar quando o usuário pedir um vídeo "no estilo Mundo Torto". Baseado em Shorts de referência
("Nesse mundo, quem ri vira balão" etc.); as premissas devem ser **nossas**, nunca as das referências.
- **Duração:** 30–45 s (8–10 frases do narrador). Versão longa: até ~2:30, com escalada (ver abaixo).
- **Estrutura (5 partes):**
  1. **Regra** (0–4 s): a 1ª frase é a regra absurda do mundo — "Nesse mundo / Nessa cidade, ...". É o gancho e o título.
  2. **Exemplo** (4–10 s): 1–2 frases mostrando a regra funcionando no dia a dia.
  3. **Exceção** (10–18 s): "Mas esse garoto / essa menina..." — o protagonista que não se encaixa na regra.
  4. **Evento** (18–30 s): "Até que um dia..." — algo põe a regra à prova (acidente, festa, forasteiro chegando).
  5. **Virada** (últimos 3–6 s): revelação que muda o sentido da regra. Termina seco na virada:
     sem moral, sem "comente", sem tela final.
- **Regra visual:** tem que dar pra mostrar na tela (algo no ombro, relógio flutuando, gente inchando).
- **Virada justa:** plantar uma pista na parte 1 ou 2 que, depois da virada, passa a fazer sentido.
- **Narração:** terceira pessoa, frases curtas (8–15 palavras), uma frase = uma cena. Conectores fortes
  nas mudanças: "Mas", "Porém", "Até que", "E de repente".
- **Protagonista:** "esse garoto / essa menina" ou um nome simples; pode ser personagem da biblioteca.
- **Balões:** quase nenhum. No máximo uma fala marcante na virada (ex.: sussurro do forasteiro).
- **Tons possíveis:** sombrio (virada de terror), cômico (protagonista que humilha a regra) ou emocional.
- **Versão longa (1:30–2:30) funciona diferente** — ver a seção "Mundo Torto longo" abaixo.
- Segue também as regras de ritmo acima (vistas lateral/diagonal, `vertical` no Shorts, sem pausa entre cenas).

### Mundo Torto longo (história completa, normalmente cômica)
Extraído da referência "quem ri vira balão" (2:15, ~38 frases, ~3,5 s por frase). Não é um choque só:
a virada vem a **~70%** e o resto é a solução e o fechamento.

**Linha do tempo (proporção do vídeo):**
| Parte | Tempo (~2:15) | O que acontece |
|---|---|---|
| 1. Regra + mundo | 0–18% (0–24 s) | Regra + 2–3 piadas de como a sociedade vive com ela + **secundário marcante** com detalhe estranho |
| 2. Protagonista | 18–28% (24–38 s) | Nome, idade, **2 manias** que parecem bobas (uma delas é a pista escondida) |
| 3. Evento | 28–36% (38–48 s) | "Até que chegou..." — algo ridículo em público dispara a regra |
| 4. Escalada | 36–49% (48–66 s) | "Primeiro... depois... em um minuto já eram..." (1 → 5 → 12); o secundário e alguém querido são atingidos |
| 5. Protagonista atingido | 49–64% (66–86 s) | Tenta ajudar, não aguenta e a regra pega ele também |
| 6. Descoberta (virada) | 64–75% (86–102 s) | "Foi aí que ela entendeu tudo": a regra funciona **ao contrário** do que todos achavam; revela também o segredo do secundário |
| 7. Solução | 75–92% (102–124 s) | Usa a mania + a descoberta como arma; um por um, todos são salvos ("só faltava um") |
| 8. Callback | 92–100% (124–135 s) | O secundário da parte 1 fecha com a última piada, curta e exagerada |

**Técnicas:**
- **A cidade entende a regra errado.** A virada não cria regra nova: revela o que ela sempre foi ("não é quem ri, é quem segura").
- **Pistas disfarçadas de piada:** a mania do protagonista prova a verdade sem ninguém notar (ela ria escondida e nunca inchava);
  o detalhe do secundário também (o juiz "redondo" não ria escondido, segurava a risada).
- **Nada solto:** cada mania, personagem e objeto do começo volta no fim (sacos de areia, imitar o andar, o pombo).
- **Concreto e exagerado:** números e datas ("preso desde 2023", "12 pessoas", "40 anos", "três quarteirões")
  e comparações visuais ("redondas feito melancia", "feito bexiga solta").
- **Uma imagem cômica a cada ~10 s** (peruca voando, gente boiando, choveu gente, pouso na barraca de pipoca) — é a quebra de padrão.
- **Sem vilão:** a ameaça é a própria regra; o humor vem de autoridades ridicularizadas (prefeito, juiz).
- **Elenco pequeno:** protagonista, 1 pessoa querida, 1 secundário marcante, 1 autoridade, multidão (pode usar moradores da biblioteca).
- **Conectores do narrador:** "Funciona assim", "Por isso", "Até que", "Bem na hora", "Primeiro... depois...",
  "Foi aí que... entendeu tudo", "Só faltava um".
- **Tom:** cômico com um momento de aperto (parte 5); termina leve, sem moral explícita.

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
- **Protótipos NÃO aprovados (fora do projeto):** `monstro-sombra` e tentáculos de sombra em 3D.
  Se o usuário aprovar, precisam ser recriados no motor (não estão no repositório).
- Branch de trabalho: `claude/cool-noether-ai5egq`.
