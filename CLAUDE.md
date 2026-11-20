# Canal Pixel Art — regras para o Claude

Gerador de vídeos pixel art (Three.js no Chrome/Edge com GPU → FFmpeg/NVENC). Leia o `README.md` e o
`FORMAS-DE-VIDEO.md` antes de mudar algo. Responda em português.

## Regras do usuário (sempre seguir)
1. **Não renderizar vídeos.** O usuário renderiza no PC dele (GTX 1050 Ti). Para conferir, use no máximo
   imagens paradas — e só quando for essencial.
2. **O estilo diorama é o padrão** (`"vista": "diorama"`): rua/praça sem `"comodo"`, cômodos com `"comodo"`.
   O antigo nome da rua, `diagonal`, ainda é aceito. Ao criar vídeos/roteiros, **todas as cenas usam diorama**.
   Outros estilos (`lateral`, `avenida`, `"movimentoReal"`, `3d` etc.) **só se o usuário pedir diretamente**. Se algo
   parece precisar de lateral, resolver no diorama (outro enquadramento, outro lugar, ou detalhe em close com `"tela": true`).
3. **Mostrar antes de colocar na biblioteca** (`biblioteca/`: personagens, cenários, sprites, sons).
   Protótipos ficam em `prototipos/` (a pasta temporária); só passar para `biblioteca/` depois do "pode salvar".
   **Organização dos assets (não espalhar pelo projeto):** código de sprite novo → um arquivo em `motor/assets/`
   (registrado em `motor/assets/index.js`, com `grupo` e `status: 'protótipo'`); personagens/cenários de protótipo →
   `prototipos/personagens.json` / `prototipos/cenarios.json` (valem para todos os projetos; nunca copiar para dentro
   de um projeto). Aprovado: mover a entrada para `biblioteca/` e tirar o `status: 'protótipo'`. Depois de mudar
   assets, rodar `npm run catalogo` (atualiza `biblioteca/CATALOGO.md`). Para o usuário conferir mudanças: cenas
   no projeto `projetos/vitrine` (com `"foto"` e `"legenda"`) e ele roda `npm run vitrine`.
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
11. **Roteiros de concorrentes** (`referencias/roteiros-concorrentes/`): só referência. **Não ler nem usar**
    ao criar roteiros, a menos que o usuário peça explicitamente; nunca copiar premissas, falas ou personagens.
12. **Modo 3D (`"vista": "3d"`) só quando o usuário pedir explicitamente.** Nunca usar por iniciativa própria em
    roteiros, cenas, testes ou sugestões de vídeo; o padrão continua o diorama (regra 2).

## Ritmo dos próximos vídeos (retenção)
- **Gancho nos 2 primeiros segundos:** abrir com algo acontecendo ou uma pergunta/mistério; o título entra depois.
- **Uma frase do narrador = uma cena curta** (2–4 s). Evitar "..." longos no texto do narrador.
- **Nada parado, mas com sentido:** a vida da cena vem de preferência dos **personagens** (expressões no rosto,
  ícone de emoção, alguém andando) e de partículas (`clima` do cenário: `poeira`, `neve`, `vagalumes`). Mover a câmera só quando ajudar a história; evitar
  pan/zoom que deixe os pixels estranhos (nada de zoom lento quebrado; se usar, curto e terminando em valor redondo).
- **Quebra de padrão a cada ~5 s:** `flash`, `tremer`, ícone de emoção ou SFX na palavra forte da narração.
- **Variar o visual dentro do diorama:** troque de lugar (rua, praça, cômodo) e de enquadramento, não de
  estilo. Lugares da cidade sem interior (escola, delegacia, padaria, mercado): a cena acontece na rua
  comercial, na calçada em frente ao prédio (`z` ~5.6; câmera `{ "x": <prédio>, "z": 2.2, "y": 2.4 }`; prédios em
  x ≈ padaria 0.6, escola 4.6, delegacia 10.4, mercado 16.2). Céu no diorama: câmera mais alta (`"y"` ~3.5) mostra
  o céu acima dos telhados.
- **Balões:** curtos (até ~4 palavras), poucos, servem de reação; quem conta a história é o narrador.
  Exceção: um balão maior é permitido quando o personagem tiver **algo interessante a dizer** (piada, revelação,
  fala marcante) — charme estilo Undertale.
  Projetos novos já vêm com `"volumeBaloes": 0.4` (som baixo, narrador em destaque).
- **Loop aberto no meio** ("mas o que ninguém sabia...") e **pergunta/voto só nos últimos ~3 s**.
- **Shorts:** até 60 s, enquadramento `vertical` em toda cena com personagem.
- Sugerir ao usuário narração no ElevenLabs um pouco mais rápida (velocidade ~1,1).

## Estilo "Nesse Mundo" (vídeos de regra absurda)
Usar quando o usuário pedir um vídeo "no estilo Nesse Mundo". Tem dois formatos: **curto** e **longo**
(se o usuário não disser qual, perguntar). Baseado em Shorts de referência (ver regra 11); as premissas devem ser
**nossas**, nunca as das referências.

**Formato comum (aparece nos curtos e no longo):**
`Regra → o que a cidade acredita → protagonista diferente → evento que testa a regra → a verdade da regra`.
- **1ª frase = regra absurda do mundo** — "Nesse mundo / Nessa cidade, ...". É o gancho e o título.
- **A cidade acredita em algo errado** sobre a regra (boa sorte, prêmio, "quem ri incha"); a virada desmente.
- **O protagonista é diferente dos outros** (sem guardião, bonzinho demais, ri escondido) e no fim
  a diferença dele é o que importa.
- **Regra visual:** tem que dar pra mostrar na tela (algo no ombro, relógio flutuando, gente inchando).
- **Virada justa:** plantar uma pista no começo que, depois da virada, passa a fazer sentido.
- **Narração:** terceira pessoa, frases curtas (8–15 palavras, ~3,5 s cada), uma frase = uma cena.
- **Protagonista:** "esse garoto / essa menina" ou um nome simples; pode ser personagem da biblioteca.
- Segue também as regras de ritmo acima (diorama, `vertical` no Shorts, sem pausa entre cenas).

### Nesse Mundo curto (um choque só, 30–45 s)
Extraído das 4 referências curtas (30–43 s, 9–14 frases). A virada fica no fim e o vídeo acaba nela.

**Linha do tempo (proporção do vídeo):**
| Parte | Tempo (~40 s) | O que acontece |
|---|---|---|
| 1. Regra | 0–12% (0–5 s) | "Nesse mundo, ..." — a regra em uma frase |
| 2. Crença | 12–25% (5–10 s) | Exemplo do dia a dia ou o que a sociedade acredita ("acreditam que trazem boa sorte") |
| 3. Protagonista | 25–45% (10–18 s) | "Mas esse garoto..." — é a exceção e **sofre** por isso (excluído, chamado de idiota) |
| 4. Evento | 45–80% (18–32 s) | "Até que um dia..." — alguém completa a regra, um forasteiro chega, um acidente acontece |
| 5. Virada | 80–100% (32–40 s) | A verdade da regra, em 1–2 frases, com uma imagem forte. Termina seco: sem moral, sem "comente" |

**Variações:**
- **Exceção sortuda** (guardiões, relógio): o protagonista excluído era o único a salvo; os outros estavam condenados.
- **Olhar de fora** (guardiões, jornal na TV): a verdade chega por alguém/algo de fora — forasteiro sussurrando, notícia.
- **Consequência inesperada** (dor transferível): a regra age no protagonista e o susto é **em quem** ela cai.
- **Lista de 3** (criaturas, cômico): regra + protagonista e depois 3 casos seguidos, cada um "ameaça → *Porém* ela vence
  de um jeito ridículo"; o 3º é o mais engraçado e fecha o vídeo.

**Técnicas:**
- **Conectores:** "Mas", "Porém", "Até que", "E de repente", "Então".
- **Reação antes da virada:** alguém congela, fica horrorizado ou fica sério ("ele congelou", "olhou seriamente").
- **Última frase concreta e visual** (esmagada no quarto, levou o homem vivo, "você foi o único que não foi consumido").
- **Balões:** quase nenhum. No máximo uma fala marcante na virada (ex.: sussurro do forasteiro).
- **Tons possíveis:** sombrio (virada de terror), cômico (lista de 3) ou emocional.

### Nesse Mundo longo (história completa, normalmente cômica, 1:30–2:30)
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
- Narração sem `<break>` (um parágrafo por cena). Com o áudio, o corte é automático **pelo que é falado**
  (`src/alinhar.js`: Whisper `whisper-base_timestamped` via `@huggingface/transformers`, roda no PC; palavras com tempo
  alinhadas ao texto do roteiro; cache em `narracao/.alinhamento.json`; modelo em `.modelos/`). Reserva: pelas pausas
  (limite de silêncio automático). O áudio fica **contínuo**: cada cena dura exatamente o seu trecho (vídeo = tamanho do
  áudio, sem silêncio extra). `--verificar` mostra o método usado ("alinhado pelo que é falado").
  Os tempos das ações de cada cena se ajustam à duração real da fala (`"sincronizarAcoes": false` desliga).
  O usuário não marca cortes à mão.

## Estado atual
- **Episódio 1** em `projetos/episodio-01` ("Nada acontece em Vila Serena"): protagonista **Bia**
  (`menina-capa`), padeiro **seu Tonho**; 9 cenas; final com o público decidindo (comentar 1 ou 2).
  Aguardando o usuário gravar a narração e renderizar.
- **Vídeos "Nesse Mundo" — rascunhos prontos, aguardando o usuário gravar a narração e renderizar** (o usuário aponta
  os problemas; ajustar só o que ele apontar). Todos só na diagonal:
  `projetos/nesse-mundo-estrelas` (curto, 13 cenas, ~53 s; usa `rua-estrelas` do próprio projeto; cenas na rua e
  cenas só de céu separadas), `projetos/nesse-mundo-caderno` (curto, 12 cenas, ~52 s — "Nessa cidade, toda noite
  alguém some": o caderno da Bia escolhe quem some; substituiu o dos monstros), `projetos/nesse-mundo-tempo` (longo,
  28 cenas, ~2:36 — a 1ª versão deu 3:04, foram tiradas 5 frases; usa `praca-seca`, `quarto-menina-noite-diorama` e `rua-alagada` do `cenarios.json` do projeto).
  Texto do ElevenLabs em `narracao/TEXTO-COMPLETO.txt` de cada um.
- **Recursos novos (protótipo, junto dos vídeos):** olhos das estrelas feitos em 3D (`motor/olho3d.js`, Three.js
  reduzido a pixel); ação `desaparecer` (some devagar, sem fumaça/som); elemento `"tela": true` (detalhe em close no
  centro, fundo escurecido com `"escurecer"`); `"rua": { "alagada": true }`; sprites `viatura-iso` (parado/sirene),
  `caderno` (fechado/aberto), `pagina-caderno` (cheia/ultima/bia). Postes da frente da praça foram para as laterais.
  `cao-policial` (PROTÓTIPO): versão detalhada do `cao-guarda`, no padrão dos moradores (com poses), usado no longo.
  Sentar no banco da praça: `"pose": "sentado"`, `"y": 0`, `"z": -4.05`.
- **Biblioteca aprovada:** personagens detalhados (`menina-capa`, `robo-semaforo`), moradores
  (`policial`, `prefeito`, `aluno`, `aluna`, `professora`, `padeiro`, `caixa`), estilo RPG
  (`pombo-fofoqueiro`, `cao-guarda`, `coruja-banca`...), cenários de cidade (`escola`, `delegacia`,
  `padaria`, `mercado`, `farmacia`, `rua-comercial`, `rua-comercial-noite`, `cidade-rpg`, `batalha`).
- **Protótipos aguardando aprovação** (após o "pode salvar", cadastrar personagens em `biblioteca/personagens.json`):
  - guardiões = **pequenas criaturas** (elmo, rostinho, asinhas, cauda de fumaça) que **flutuam ao lado da cabeça** de uma
    pessoa: `"personagem": "guardiao-azul"` (ou `guardia-verde`, `guardiao-chefe`, `guardiao-noturno` com lanterna) e
    `"sobre": { "id": "<pessoa>", "dx": 0.9, "dy": 1.55 }`; estados parado/feliz/alerta/dormindo (`motor/assets/guardioes.js`).
    Números sobre a cabeça **das pessoas**, sempre no estilo placa (não usar `"numeroEstilo": "solto"`; o usuário achou
    estranho); guardiões sem número. Teste: `projetos/vitrine` (cenas 1 e 1b).
  - fantasmas (`motor/assets/fantasmas.js`): `fantasma-lencol` (parado/assustar/timido), `fantasma-crianca`
    (parado/timido/acenar/assustar), `fantasma-vovo` (parado/rindo/acenar), `fantasma-sombra` (parado/assustar; use `escala` 2),
    `fantasma-cachorro` (parado/feliz), `fogo-fatuo` (azul/verde/roxo, com luz). Flutuam sozinhos; use `"y"` ~0.4.
  - `motor/assets/prototipos.js`: moradores `carteiro`, `vovo`, `sorveteiro`, `rival`, `menino-pijama` (andam e sentam);
    `gato-chapeu`; objetos `bilhete` (brilhando), `carta` (fechada/aberta), `mapa`, `cadeado` (fechado/aberto),
    `pegadas-brilhantes`, `cartaz-procura-se` (vazio/foto; bom com `"tela": true`); isométricos `relogio-praca`
    (h3/h6/h9/h12/h11-55), `caixa-correio`, `lixeira-praca`, `placa-praca`, `carrinho-sorvete`.
  - ações novas: `pensar`, `destaque`, `contador`, `placar`, `continua`; ícones `lampada`/`gota`/`raiva`/`nota`;
    sons `sino-relogio`, `cadeado`, `papel`, `miau`, `trovao`, `suspense`, `fantasma`. Teste: `projetos/vitrine`
    (personagens em `prototipos/personagens.json`).
  - barracas novas `barraca-sorvete`/`-frutas`/`-verduras`/`-flores`/`-vazia` (estados parado/acesa/fechada) e cenário
    `praca-feira` (em `prototipos/cenarios.json`).
  - 2ª leva: cenários `estrada-terra` (placa VILA SERENA 1 KM), `ponte-rio`/`-noite`, `beco` (cômodo; porta trancada
    com corrente e cadeado), `rua-junina`, `rua-chuva`/`-noite` (em `prototipos/cenarios.json`); opções da rua
    `"chao": "terra"`, `"rio": true`, `"semPredios": true`, `"pocas": true`, `"cerca": false`; sprites `ponte-madeira`
    (em cima `"y": 0.45`), `fogueira-junina` (animada, com luz), `caixote`, `cerca-madeira`, `mato`, `placa-saida`,
    `cadeado-numero` (fechado/tentando/aberto; close com `"tela": true`); som `sininho` (sorveteiro).
- **Praça melhorada (no motor/biblioteca):** toldo das barracas acima da cabeça das pessoas (vendedor aparece), placa com
  ícone em cima, barracas da `praca-decorada` mais espaçadas (x -6.0, -3.7, -1.4; vendedor x +0.8, z -2.4).
- **Casa (protótipo) — formato escolhido pelo usuário: cômodo ENCHENDO A TELA, igual ao quarto da Bia** (sistema de
  cômodos em diorama, `"vista": "diorama"` + `"comodo"`): sala = `sala-de-estar-diorama` (aprovado; noite:
  `sala-de-estar-noite-diorama`), quarto do menino = `quarto-menino-diorama` (aprovado), `cozinha-diorama` e
  `banheiro-diorama` (+ `-noite-diorama`) em `prototipos/cenarios.json`; móveis novos em `motor/assets/casa.js`
  (geladeira, fogao, balcao-pia, armario-alto, mesa-cozinha, banqueta, vaso, pia-banheiro, banheira; decor `espelho`,
  `azulejos`). Personagens `mae`, `mae-avental`, `menino-topete`. Teste: `projetos/vitrine` (cenas 17–21).
  **Não usar** os cômodos "de caixinha" (`casa-sala`... sobre fundo `diorama`) nem a `casa-corte`: o usuário preferiu o
  formato que enche a tela (ficam no código só como protótipo antigo).
- **Monstros de sombra 3D (protótipo, NÃO aprovado)** (`motor/monstros3d.js`): elemento `"monstro": "sombra-alta" |
  "tentaculos" | "massa-olhos" | "rastejante"`, em alta resolução sobre o pixel art. `rastejante` = humano de sombra
  andando de quatro (membros longos, joelhos/cotovelos para cima, cabeça aos trancos; anda com `andar`/`correr`/`mover`,
  `"passada"`). Teste: `projetos/prototipo-monstros` (cena 6; `npm run fotos -- prototipo-monstros`).
- **Sombra que se alastra (protótipo)**: ação `{ "tipo": "sombra", "origem": [x, z], "raio": 20, "inicio", "duracao",
  "recolher": s, "cor", "corBorda", "personagens": false }` — só no diorama de rua/praça: cobre o chão com borda
  esfiapada, sobe paredes/prédios pela altura de cada pixel e sobe pelos objetos e pessoas de baixo para cima; som `sombra`.
  Teste: `projetos/vitrine` (cena 24).
- **Interiores APROVADOS (na biblioteca):** lateral `sala-de-aula`, `quarto-menino`, `quarto-menino-noite`,
  `sala-de-estar` (fundos + móveis de `motor/assets/interiores.js`) e modo **`diorama`** (diagonal dos cômodos,
  `motor/cenarios/comodoDiagonal.js`): `sala-de-aula-diorama`, `quarto-menino-diorama`,
  `quarto-menino-noite-diorama`, `sala-de-estar-diorama`. O diorama aceita **ângulos**: padrão `"classico"`
  (diagonal clássica; não precisa escrever), `"espelhado"` e extras `tipo@angulo` (sala de aula: `lousa-fundo`).
  Ângulo inexistente → clássico com aviso. Sala de aula clássica (aprovada: lousa na parede da direita; alunos
  `sentado-lado` em x = -4.6, -1.6, 1.4 × z = 2.45 e 0.75; professora x 8.1, z 1.6 virada para a esquerda).
  Outros ângulos ainda NÃO desenhados (o usuário vai pedir depois).
- **Poses APROVADAS**: moradores e `menina-capa` têm `"pose": "sentado"` (de frente), `"sentado-lado"`, `"costas"`,
  `"sentado-costas"` e as ações `sentar`/`levantar` (`motor/sentado.js`). Assento a ~12 px do chão: em sofás da
  lateral use `"y": 0.25`, nas carteiras da lateral `"y": 0.2`.
- **Modo 3D GUARDADO — só usar se o usuário pedir (regra 12)** (o padrão continua o diorama).
  `"vista": "3d", "palco": { "tipo": "quarto-menino" | "quarto-menino-noite" | "sala-aula" | "sala-estar" |
  "praca" | "praca-noite" }` (`motor/cenarios/palco3d.js`, `objetos3d.js`; teste em `projetos/prototipo-3d`).
  Pendência: texto pequeno em objetos do fundo perde linhas de pixel.
- **Teste "mundo sombrio" (o usuário não gostou; não usar)** em `projetos/prototipo-mundo-sombrio`.
- Protótipos de teste: `projetos/prototipo-interiores`, `projetos/prototipo-sentados`.
- **Assets "Nesse Mundo" — APROVADOS (na biblioteca)** (`motor/assets/nesse-mundo.js`, variações `policial-oculos` e
  `prefeito-careca` em `motor/assets/moradores.js`; teste em `projetos/prototipo-nesse-mundo`, folha em `folha-assets.png`; personagens `policial-oculos`, `prefeito-careca`, `cone-monstro`).
  Para 3 roteiros: curto "estrelas que viram olhos", curto "cada rua tem um monstro" e longo "cada um carrega o
  próprio tempo". Sprites: `tempo-pessoal` (estados sol-pequeno/sol/sol-grande/sol-forte/nuvenzinha/garoa/chuva/
  aguaceiro/nada), `guarda-chuva` (aberto/fechando/fechado), `estrela-mentira`/`estrela-gigante` (parado/olho/
  olho-aberto), `palanque` (em cima: y 1.125), `bandeirinhas`, `fonte-praca` (cheia/seca), `canteiro` (verde/murcho),
  `placa-lei`, `bloco-multas`, `fogo-chapeu`, `peruca`, `sorvete` (derretendo), `agua-enchente`, `cerca-mirante`,
  `bueiro-monstro` (parado/agarrar/enjoado/fechado), `cone-monstro` (personagem; dormindo), `sanduiche`,
  `lista-compras` (abrindo), `malinha`. Cenários na biblioteca: `praca-festa`, `praca-festa-noite`, `rua-festa`
  (diagonal), `morro-mirante`, `rua-monstros`. Recursos novos do motor: ação `trocar`, `"sobre"`, `"balancar"`, clima `calor`.
- **Praça diagonal — APROVADA (na biblioteca)**: na rua comercial (opção `"rua": { "praca": { "x", "largura",
  "profundidade" } }` do `ruaDiagonal.js`, de frente para os mesmos prédios; câmera `"z": -8.5` foca a praça).
  **Padrão** (uso normal): `praca`, `praca-noite`. **Decorada** (festa): `praca-decorada`, `praca-decorada-noite`
  (bandeirinhas, palanque — em cima `"y": 0.75` — e barracas). Para decorar uma cena, troque só o nome do cenário.
  Objetos isométricos (`motor/assets/praca.js`): `fonte-iso` cheia/seca, `banco-iso`, `arvore-iso`/`-grande`
  verde/seca, `poste-iso`, `poste-iso-aceso`, `canteiro-iso` verde/murcho, `palanque-iso`, `bandeirinhas-iso`,
  `barraca-pipoca`/`-doces`/`-jogos` (parado/acesa); x/z = canto da frente; estado inicial com `"pose"`.
  Os postes de TODA a rua diagonal são o `poste-iso` (aceso à noite); `"rua": { "postes": "antigo" }` volta ao chapado.
- **Protótipos NÃO aprovados** (definidos em `prototipos/cenarios.json`; teste em `projetos/prototipo-diagonal`, `previa.png`, imagens em `praca/`):
  `praca-seca` (decorada com fonte seca etc., para a história do Dia do Sol) e `quarto-menina` / `quarto-menina-noite`
  (diorama e lateral; móveis `penteadeira`, `pufe`, `cavalete`). O modo `"exterior"` do diorama existe mas não é usado.
- **Arte do canal "Histórias em Pixel" (protótipo):** geradores de banner e ícone em `projetos/canal/arte/`
  (`banner.html`, `icone.html`, `gerar.mjs`); o `banner.png` ainda não foi substituído.
- **Branch de trabalho:** `ccr-20c16939-ytgzvu` (reúne `claude/modest-hamilton-4p4851`, que já tinha `jolly-archimedes`,
  `cool-noether`, `charming-mendel` e `epic-bardeen`, + diorama como padrão + guardiões/números) e `ccr-77868c41-s69pnw` (casa, mãe, menino-topete, monstros 3D).
