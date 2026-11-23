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
11. **Referências do estilo "Nesse Mundo"** (`referencias/roteiros-nesse-mundo.md` e `referencias/roteiros-concorrentes/`):
    ao criar um vídeo **Nesse Mundo**, **ler as referências** para pegar ritmo, estrutura e tipo de virada (ver a seção
    "Estilo Nesse Mundo"). Fora desse estilo, não usar. **Nunca copiar** premissas, falas, personagens ou viradas delas
    (nem trocar só os nomes); conferir também que a premissa nova não repete um vídeo nosso já feito.
12. **Modo 3D (`"vista": "3d"`) só quando o usuário pedir explicitamente.** Nunca usar por iniciativa própria em
    roteiros, cenas, testes ou sugestões de vídeo; o padrão continua o diorama (regra 2).

## Ritmo dos próximos vídeos (retenção)
- **Gancho nos 2 primeiros segundos:** abrir com algo acontecendo ou uma pergunta/mistério; o título entra depois.
- **Uma frase do narrador = uma cena curta** (2–4 s). Evitar "..." longos no texto do narrador.
- **Nada parado, mas com sentido:** a vida da cena vem de preferência dos **personagens** (expressões no rosto — ação
  `expressao` / `"pose": "rosto-<x>"`; o `emocao` já muda o rosto junto —,
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
- **1ª frase curta:** no máximo 12 palavras / ~65 letras (o ideal é ~8 palavras, ~2–3 s). O `npm run conferir` acusa `[gancho]`.
- **Silêncio no começo do áudio é cortado sozinho** (a voz começa no 1º quadro; o `--verificar` mostra quanto foi cortado).
- **Legenda palavra por palavra (padrão):** grupos de 2–3 palavras grandes, com a palavra falada em amarelo (tempo real das
  palavras pelo alinhamento; sem áudio, estimado). No Shorts fica a ~66% da altura, fora dos botões do YouTube.
  `"legendaEstilo": "caixa"` volta à legenda antiga; `"legendaLetras"` (padrão 16) muda o tamanho dos grupos.
- **Corte de enquadramento dentro da cena** (quebra de padrão a cada ~2 s sem trocar de lugar): ação
  `{ "tipo": "corte", "zoom": 2, "y": 1.5, "inicio" }` — troca instantânea (sem movimento lento), só com zoom redondo
  (1, 1.5, 2, 3); usar em cenas de 3–4 s, na palavra forte. Nos scripts do Claude: `a(0.5, 'corte', { zoom: 2, y: 1.5 })`.
- **Trilha de fundo em todo vídeo:** `"trilha": "suspense"` (terror), `"comedia"` ou `"emocional"` no roteiro (base chiptune
  baixa em loop, abaixa sozinha com a narração; só no final, como os outros sons; `"volumeTrilha"` padrão 0.7;
  `biblioteca/sfx/trilha-<nome>.mp3` substitui a gerada). Projetos novos já vêm com `"trilha": "suspense"`; o conferir acusa `[trilha]`.
- **Medir pela retenção real:** `npm run mapa -- <projeto>` mostra cada cena no tempo (início, fim, %, se tem movimento,
  corte, flash, noite) e salva `MAPA-CENAS.txt`. Quando o usuário mandar o gráfico de retenção do YouTube Studio, comparar
  os segundos em que a linha cai com o mapa, achar a cena culpada e anotar a regra nova aqui.

## Estilo "Nesse Mundo" (vídeos de regra absurda)
**O que é:** vídeos narrados (Shorts e longos) que começam com **uma regra absurda do mundo** — "Nesse mundo / Nessa
cidade, ..." — e mostram o que acontece por causa dela até uma **virada** que revela a verdade da regra. É o formato
principal do canal. Os personagens e lugares são os da biblioteca (Vila Serena, Bia, seu Tonho, prefeito...), mas
cada vídeo é **independente** (não depende do episódio 1 nem de outro vídeo).
Quando o usuário pedir "Nesse Mundo" sem dizer o formato, perguntar: **curto** (Shorts, 30–45 s) ou **longo** (1:30–2:30).

**Como criar (passo a passo):**
0. Ver "Regras de cena" (cobertura, continuidade com `momento`/`saiDeCena`, elenco) — valem para todo vídeo.
1. Ler as referências (regra 11) e os vídeos nossos já feitos (`projetos/nesse-mundo-*`, texto em
   `narracao/TEXTO-COMPLETO.txt`) — anotar as premissas usadas para **não repetir**.
2. Ler `biblioteca/GUIA-ASSETS.md` e `biblioteca/CATALOGO.md` (seção "Biblioteca de assets") e escolher uma regra que **dê pra mostrar** com o que já existe.
3. Escolher o **tom** (comédia, terror ou emocional) e se vai ter **alguém usando a regra a favor** (só às vezes).
   Escrever a narração frase a frase seguindo a linha do tempo do formato (abaixo). Uma frase = uma cena.
4. Se uma ideia boa pedir um asset que **não existe**, **falar com o usuário antes de criar** (o que é, onde seria reusado);
   enquanto isso, escrever a cena com o que existe (substituto) e marcar no `ROTEIRO.md`.
5. Montar `projetos/nesse-mundo-<tema>/`: `roteiro.json` (diorama, `vertical` em toda cena com personagem,
   `"volumeBaloes": 0.4`), `ROTEIRO.md` (resumo por cena + assets usados), `PUBLICACAO.md` (título, descrição, tags),
   e rodar `npm run narracao -- <projeto>`. Pôr **expressões no rosto** nas reações (ver "Expressões no rosto").
6. Conferir por texto: JSON válido, duração estimada total, regra 10 (ações terminam junto com a fala),
   **checklist de retenção do vídeo das sombras** (abaixo) e **`npm run conferir -- <projeto>`** sem avisos (ver "Regras de cena").

**Premissas já usadas (não repetir):** mentira acende estrela no céu (`nesse-mundo-estrelas`); toda noite alguém some /
caderno que escolhe (`nesse-mundo-caderno`); cada um carrega o próprio tempo na cabeça (`nesse-mundo-tempo`); cada rua tem
um monstro (`rua-monstros`, substituído); a sombra chega antes de você (`nesse-mundo-sombras`); todo fantasma precisa
de um grito (`nesse-mundo-fantasminha`); relógio da virada anda para trás (`nesse-mundo-relogio`); quem espirra troca de
corpo (`nesse-mundo-espirro`); cachorro fala o que o dono pensa (`nesse-mundo-cachorros`); guardião que só acorda no perigo — o da Bia nunca
dorme (`nesse-mundo-guardioes`); número na cabeça = quantas vezes disseram seu nome (`nesse-mundo-numeros`); gato que segue você é sorte — vinham buscar
(`nesse-mundo-gatos`); a comida que você deixa no prato foge — fugia de quem comia correndo (`nesse-mundo-comida`). Atualizar esta lista a cada vídeo novo.

**Formato comum (aparece nos curtos e no longo):**
`Regra → o que a cidade acredita → protagonista diferente → evento que testa a regra → a verdade da regra`.
- **1ª frase = regra absurda do mundo** — "Nesse mundo / Nessa cidade, ...". É o gancho e o título.
- **A cidade acredita em algo errado** sobre a regra (boa sorte, prêmio, "quem ri incha"); a virada desmente.
- **O protagonista é diferente dos outros** (sem guardião, bonzinho demais, ri escondido) e no fim
  a diferença dele é o que importa.
- **Regra visual:** tem que dar pra mostrar na tela (algo no ombro, relógio flutuando, gente inchando).
- **Virada justa:** plantar uma pista no começo que, depois da virada, passa a fazer sentido.
- **Narração:** terceira pessoa, frases curtas (8–15 palavras, ~3,5 s cada), uma frase = uma cena.
- **Protagonista:** "esse garoto / essa menina" ou um nome simples; pode ser personagem da biblioteca. Normalmente a Bia,
  mas a **Nina** também pode protagonizar quando a história pedir (ex.: alguém excluído, confiante demais, rival); variar.
- Segue também as regras de ritmo acima (diorama, `vertical` no Shorts, sem pausa entre cenas).

### Táticas de retenção do `nesse-mundo-sombras` (o vídeo de mais sucesso — usar em TODO "Nesse Mundo")
O usuário relatou que o vídeo das sombras foi o único com alta retenção. Comparado aos postados com retenção baixa
(`estrelas`, `caderno`), o roteiro dele fez isto (tratar como regras, até outro vídeo mostrar o contrário):
1. **A regra fala com o espectador e usa algo que todo mundo tem:** "a **sua** sombra chega antes de **você**". Objeto do
   dia a dia (sombra, nome, reflexo, voz, passos), não algo distante (estrela no céu, caderno de alguém). A 1ª frase usa
   "você/sua" e o espectador se imagina na hora.
2. **A regra aparece NA TELA em quase toda cena** (10 de 12 tinham sombra visível): o espectador vê a regra funcionando,
   não só ouve. Cada cena mostra o elemento da regra fazendo algo.
3. **Movimento em quase toda cena** (8 de 12 com gente/sombra andando; nos de baixa retenção, 2–3 de 12). Cena parada com
   narração é onde o público sai.
4. **Contraste visual simples do protagonista:** a sombra de todos vai para um lado, a da Bia para o outro — dá para
   entender a diferença dela **sem som**, só olhando.
5. **Escalada em números na tela:** 1 sombra → 2 → 4 → todas andando sozinhas → as pessoas somem → a praça cheia de sombras
   sem ninguém. Cada cena tem mais do elemento da regra que a anterior.
6. **Curto e uniforme:** ~45 s, 12 frases de 8–13 palavras (~3–4,5 s cada), sem frase longa. Duas frases curtíssimas na
   virada ("Elas levavam." / "Com força.") — o ritmo acelera quando a história esquenta.
7. **Quase sem balão** (1 no vídeo todo): a atenção fica na imagem e no narrador.
8. **A virada transforma o "defeito" do protagonista em salvação** (exceção sortuda): o que a cidade zombava (sombra do
   contra, "perdida") era o que a protegia. A pista é visual e aparece 2 vezes antes (cena 3 e "com força" na cena 7).
9. **Reação antes da virada** ("olhou para trás e congelou") e **última imagem com o elemento da regra ainda vivo** ("a sombra
   colada nos pés dela, ainda tremia"): termina inquietante, sem explicar, com o objeto da regra na tela — dá vontade de rever.
10. **Lugares conhecidos e poucos** (rua, escola, praça): nada de cenário novo para o público decifrar.
**Dados reais do canal (YouTube Studio, "Como os visitantes interagiram"):** sombras → **68,5% continuaram a ver**, duração média
0:43 de ~0:50 (gente revendo); guardiões → **só 34,4% continuaram** (65,6% passaram o vídeo). A perda é no **1º segundo**:
- **Sombras:** aos 0,3 s a sombra já está andando na frente do seu Tonho (a regra acontecendo na tela).
- **Guardiões:** abre com duas pessoas paradas e guardiões pequenos dormindo; a 1ª coisa só acontece aos 2,6 s.
→ **Regra do gancho:** na 1ª cena, o elemento da regra **se mexe antes de 0,6 s**, grande e visível, **de dia**. Nada de
abrir com gente parada, objeto pequeno dormindo ou cenário escuro. O `npm run conferir` acusa `[gancho]`.

**Duração média (dados reais):** sombras **0:43 de ~0:50** (86%); guardiões **0:26** (~52%) — o público dos guardiões saiu
justo quando o vídeo ficou parado e escuro (cenas 4–9, de 11 a 39 s). Cena por cena, o que segurou o público nas sombras:
1. **Nunca uma cena parada antes da virada.** As 8 primeiras cenas (0–32 s) têm gente ou sombra andando; a única parada é a
   reação "congelou", de propósito, já perto do fim. Guardiões: 5 cenas sem nada se mexendo (a 4ª sem NENHUMA ação).
2. **O elemento da regra muda em toda cena:** 1 sombra → 2 → a da Bia ao contrário → 4 sozinhas → 8 andando juntas → a da Bia
   puxando "com força" → engolindo → praça cheia. Guardiões: o guardião é o mesmo, parado, das cenas 3 a 6.
3. **O evento estranho chega cedo:** "Até que... as sombras saíram andando sozinhas" aos 16 s (35%). Guardiões: o perigo
   só aparece aos 39 s (87%), quando a maioria já saiu.
4. **O sofrimento do protagonista dura 1 cena** (a escola, 4 s). Guardiões: 3 cenas seguidas de exclusão (atravessam a rua,
   ninguém senta do lado) sem a regra agir.
5. **Pico de movimento no MEIO** (8 pessoas e sombras andando juntas aos 20 s), não só no fim: é a "segunda isca" para quem ia sair.
6. **Mistério que se vê, aberto aos 8 s e só respondido no fim:** a sombra da Bia vai para o lado errado. O espectador fica
   para saber por quê. Nos guardiões o mistério ("olhando para as costas dela") não tem imagem até o fim.
7. **Escuro nunca** (tudo de dia). Guardiões mudou para a noite aos 23 s, e a duração média é 0:26.
8. **A ameaça aparece em pedaços antes da virada** (sombras andando sozinhas no meio; gente sumindo antes da revelação). Não
   guardar o monstro/a ameaça para a última cena.
O `npm run conferir` acusa `[parada]`: cena sem nada se mexendo antes de 70% do vídeo, e o "Até que..." depois de 40%.

**Como a história é contada (texto da narração, sombras × guardiões/números/caderno):**
1. **Regra sobre algo que o público já conhece** (sombra): zero aprendizado, o cérebro aceita na hora. Guardião, número na
   cabeça, caderno mágico e relógio que rejuvenesce são **conceitos novos** que o público precisa aprender antes de se importar.
2. **A crença é um comportamento, não uma explicação:** "É só seguir a própria sombra" (o que as pessoas FAZEM). Nos outros, o
   narrador explica: "A cidade acredita que...", "A cidade decidiu que o perigo era ela" — é contar em vez de mostrar.
3. **Toda frase é uma ação** (chega, segue, vai, saíram andando, foram atrás, puxava, parou, seguiu, olhou, levavam, tremia).
   Nos outros, muitas frases são estado ("tem um guardião", "vive acordado", "é a mais velha", "ninguém sabe o nome").
4. **A anomalia é a própria regra agindo errado no protagonista** ("a sombra DELA vai para o lado contrário") — o mesmo objeto
   que o público acabou de aprender, se comportando diferente. Gera a pergunta "por quê?" em uma frase.
5. **O evento atinge a cidade inteira, não só o protagonista** ("TODAS as sombras saíram andando"; "os moradores foram atrás
   delas"): a aposta é grande e se vê. Nos guardiões, o perigo é só da Bia, no quarto, de noite.
6. **O protagonista ESCOLHE na hora H** ("A Bia parou na esquina. E, pela primeira vez, seguiu a própria sombra"): ela age e a
   escolha dela a salva. Nos guardiões e nos números ela só acorda, vê e congela (passiva).
7. **A virada repete a frase da crença ao contrário:** crença "É só seguir a própria sombra" → virada "As sombras não mostravam o
   caminho. Elas levavam." O público sente a virada na hora, sem explicação.
8. **Relógio da história andando:** "num domingo" → "na segunda". Começo, meio e fim claros, em poucos dias.
9. **Detalhe sinistro dentro de algo feliz:** "foram atrás delas, **sorrindo**, um atrás do outro" — a frase mais assustadora do
   vídeo não tem monstro nenhum.
10. **A última frase devolve o objeto da regra ao protagonista, ainda vivo e com emoção:** "a sombra da Bia, colada nos pés
    dela, ainda tremia". Ela também estava com medo: o defeito era carinho. Fecha o mistério e deixa um sentimento.
**Ao escrever:** regra sobre algo do dia a dia; crença como ação ("é só..."); cada frase com verbo de ação; o evento atinge todo
mundo; o protagonista toma uma decisão ativa antes da virada; a virada inverte a frase da crença; marcadores de tempo
("num domingo... na segunda"); um detalhe feliz que fica sinistro; a última frase mostra o objeto da regra com emoção.

**Comparação com os postados de baixa retenção** (`guardioes`, `numeros`, `relogio`, `caderno`, `estrelas` — mesma estrutura,
mesma duração ~45–48 s, mesma virada "exceção sortuda" em vários): a estrutura NÃO explica a diferença. O que só o das sombras tinha:
- **É de DIA do começo ao fim** (0 cenas de noite). Os outros tinham 4 a 11 cenas de noite: imagem escura no celular, pixel
  art apagado, menos coisa para ver. → **Preferir dia**; noite no máximo em 1–2 cenas no fim. O terror vem da situação
  (sorrisos indo embora, praça vazia em plena luz), não do escuro.
- **O elemento da regra SE MEXE sozinho** (sombras andando). Guardião dormindo, número parado, relógio na torre, caderno na
  mesa e estrela no céu ficam parados. → A regra precisa ser algo que **anda, cresce, puxa ou muda na tela**.
- **Muito mais movimento:** 8 de 12 cenas (os outros 2 a 4).
- **Só ele falou com "você"** na 1ª frase.
- **A regra se entende numa imagem**, sem explicação extra: os números precisaram de 3 frases (número, crença, prefeito);
  as sombras, de uma.

**Checklist ao escrever um "Nesse Mundo" novo:** é de dia (noite só em 1–2 cenas no fim)? O elemento da regra se mexe sozinho
na tela? A 1ª frase fala com "você" e usa algo do dia a dia? A regra se entende numa imagem? A regra aparece na tela
em ≥ 80% das cenas? ≥ 2/3 das cenas têm movimento? A diferença do protagonista se entende sem som? O elemento da regra
aumenta em quantidade até a virada? Frases de 8–13 palavras, 2 curtíssimas na virada? No máximo 1–2 balões? A última imagem
mostra o elemento da regra? Anotar no `ROTEIRO.md` como o vídeo cumpre cada item.

### Tons: comédia e terror
Cada vídeo escolhe **um tom principal** (dá para misturar um pouco do outro, mas um manda). Variar o tom entre
vídeos seguidos.

**Comédia** (a maioria dos longos e o curto "lista de 3"):
- A graça vem de **levar a regra a sério até o absurdo**: como a cidade se adapta ("fila de três quarteirões",
  "piada só com receita", "ninguém leva cachorro em entrevista").
- **Autoridade ridicularizada** (prefeito latindo, peruca voando, policial dormindo em pé), **exagero concreto**
  (números, comparações visuais) e **imagem cômica a cada ~10 s**.
- **Ritmo de piada:** a frase arma, a cena seguinte (ou o balão) entrega; o melhor fica no fim da lista ou no callback.
- Na tela: balões curtos com a reação errada, `pular`, ícones `!`/`?`/`...`, `tremer` leve, som `sucesso`/`puf`.
- Termina leve: última piada curta, sem moral e sem ninguém sair machucado de verdade.

**Terror** (curtos, normalmente; nunca gore):
- **Medo pela sugestão**, não pelo sangue: o que some, o que olha de volta, o que estava errado desde o começo.
- Começa **normal e até fofo** (a cidade gosta da regra) e vai esfriando: frases mais curtas, menos balões, silêncio.
- **Reação antes da virada** (alguém congela, fica sério) e **última frase concreta e gelada** — termina seco, sem explicar demais.
- Pode virar contra o protagonista (consequência inesperada) ou poupá-lo (exceção sortuda).
- Na tela: **de dia** (ver "Táticas de retenção": os terrores noturnos tiveram retenção baixa; noite só em 1–2 cenas no fim),
  **sem filtro de cor** (`paleta` fria/noir/sépia/quente: o usuário pediu para tirar de todos os
  vídeos por enquanto; só usar se ele pedir), `desaparecer`, sombras, `flash` + `tremer` na palavra forte,
  sons `suspense`/`revelar`/`sombra`/`trovao`; nada de sustos com sangue, morte explícita ou violência mostrada.

**Emocional** (às vezes, curto): a virada mostra um sacrifício ou um carinho escondido (a vovó que fica de fora); termina
num gesto simples, sem discurso.

### Quando alguém usa a regra a favor (só em algumas histórias)
Às vezes a história fica melhor com **alguém tirando vantagem da regra** — riqueza, poder, fama. **Geralmente é o
prefeito** (ou outra autoridade/rico da cidade), mas **não é obrigatório**: a maioria dos vídeos continua sem vilão,
com a regra como única ameaça. Usar em mais ou menos **1 a cada 3 ou 4 vídeos**, quando ajudar a virada.
- **Como aparece:** lei que se aproveita da regra ("Lei do Céu Limpo"), discurso que explora a crença da cidade, alguém que
  enriquece em segredo com ela.
- **Pista:** o abuso é plantado cedo como detalhe engraçado ou estranho ("o prefeito já acendeu metade do céu", "o homem
  mais rico da cidade").
- **Virada:** a regra **se volta contra quem abusou** (comédia: ele vira piada; terror: ele é o primeiro a pagar) ou
  revela que o "benefício" era o preço de outra pessoa.
- **Tom do abuso:** na comédia é um vilão bobo e ridículo, nunca cruel de verdade; no terror pode ser frio, mas o castigo
  continua sugerido, não mostrado.
- Não repetir o mesmo esquema seguido (prefeito mentiroso, prefeito com lei): variar quem abusa (comerciante, rival,
  a própria cidade inteira) ou deixar sem.

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
- **Tons possíveis:** sombrio (virada de terror), cômico (lista de 3) ou emocional — ver "Tons: comédia e terror".

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
- **Normalmente sem vilão:** a ameaça é a própria regra; o humor vem de autoridades ridicularizadas (prefeito, juiz).
  Às vezes alguém usa a regra a favor (ver "Quando alguém usa a regra a favor").
- **Elenco pequeno:** protagonista, 1 pessoa querida, 1 secundário marcante, 1 autoridade, multidão (pode usar moradores da biblioteca).
- **Conectores do narrador:** "Funciona assim", "Por isso", "Até que", "Bem na hora", "Primeiro... depois...",
  "Foi aí que... entendeu tudo", "Só faltava um".
- **Tom:** cômico com um momento de aperto (parte 5); termina leve, sem moral explícita.

## Objetos que contam a história (técnica aprovada pelo usuário no `nesse-mundo-espirro`)
O usuário gostou de como os itens foram usados no vídeo do espirro — usar essa técnica nos próximos vídeos:
- **Plantar cedo e mostrar na pessoa:** o objeto aparece logo no começo, preso a quem o carrega (`"sobre": { "id", "dx", "dy" }`),
  ex.: o saquinho de pimenta no bolso da Bia na cena da merenda; o pregador no nariz do seu Tonho.
- **Mudar de estado na hora certa:** `trocar` (fechado → aberto, cheio → seco) na palavra forte da narração, com som (`papel`).
- **Ser a arma da solução** e voltar no **callback** (a pimenta oferecida no fim; o pão que o pombo faz).
- **Mostrar o invisível com um objeto pequeno:** o que a regra faz e não se vê vira um sprite (as almas azul/rosa trocando de
  corpo, o número na cabeça, o guardião do lado).
- Cada objeto importante aparece **pelo menos 3 vezes**: apresentação, uso, fechamento. Objeto que aparece uma vez só, cortar.

## Expressões no rosto (usar em TODO vídeo — pedido do usuário)
Os personagens reagem com o rosto. Toda cena com gente tem pelo menos uma expressão na reação que a narração descreve.
- **Como:** ação `{ "tipo": "expressao", "alvo": "<id>", "rosto": "<x>", "inicio", "duracao" }` (termina junto com a fala — regra 10),
  ou a cena toda com `"pose": "rosto-<x>"`. O ícone de `emocao` já muda o rosto sozinho (`!` surpreso, `?` pensativo, `coracao`
  feliz, `gota` chorando, `raiva` bravo, `...` envergonhado; `"rosto": false` desliga). Nos scripts do Claude: `rostos(C, [[cena, id, rosto, f]])`
  do `nm.mjs` (f = fração da fala em que começa).
- **Rostos:** `feliz`, `rindo`, `triste` (olho molhado, sem lágrima), `chorando` (lágrimas; choro forte), `bravo`, `surpreso`, `assustado`,
  `envergonhado`, `pensativo` (olhar de lado).
- **Quem tem:** moradores, protótipos de pessoas, Bia, Nina e cachorros de estimação (`cachorro-*`, `vira-lata`). **O `cao-policial` não tem**
  (deformava o rosto; o usuário pediu o desenho antigo). Guardiões/fantasmas usam o estado parecido; RPG e robô não mudam.
- **Só aparece parado e sem `pose`:** andando, correndo, sentado ou com `pose` fixa o rosto não muda. Para reagir, a pessoa para antes
  (ou a reação fica para a cena seguinte).
- **Escolha pelo tom:** comédia → `rindo`/`envergonhado`/`bravo` em quem é ridicularizado, `surpreso` na entrega da piada; terror →
  começa `feliz` (a cidade gosta da regra) e vira `assustado` na virada; sorriso que continua enquanto algo ruim acontece também assusta;
  emocional → `triste` antes, `chorando` só no ponto mais forte, `feliz` no gesto final.
- **Bia:** não usar `"realce"` nela (estourava a pele de branco e apagava o rosto; foi tirado da biblioteca). O rosto é pequeno: nas
  reações importantes dela, enquadramento mais perto (`zoom` 2) ajuda.
- **Conferir:** ao mudar o desenho dos rostos, testar com fotos (`projetos/teste-rostos`, `projetos/teste-praca-rostos`:
  `npm run fotos -- <projeto>`) só quando o usuário permitir; procurar olho apagado, sobrancelha grudada no olho e lágrima que vira mancha.

## Regras de cena (erros que se repetiram — evitar em TODO vídeo)
Antes de entregar qualquer roteiro (novo ou ajustado), rodar **`npm run conferir -- <projeto>`** (`src/conferir.js`, não
renderiza) e corrigir cada aviso, ou explicar ao usuário por que ele não é um problema.
**O que o `npm run conferir` acusa** (cada aviso diz a cena, quem e o que fazer): `[coberto]` atrás de objeto alto ou poste fixo
da rua; `[em cima]` em pé em cima de objeto baixo (canteiro, fonte, banco, barraca) ou dos caixotes do mercado; `[continuidade]`
quem falta num `momento` ou some e reaparece; `[elenco]` mesmo sprite para dois personagens; `[fora]` fora do cômodo (andando na parede);
`[sombras]` mais de 4 `sombraPessoa`; `[parado]` quem segue algo e para antes do fim da fala; `[gancho]` a 1ª cena não
tem nada se mexendo antes de 0,6 s ou é de noite; `[parada]` cena sem nada se mexendo antes de 70% do vídeo ou "Até que..."
depois de 40%; `[trilha]` roteiro sem trilha; `[corte]` corte com zoom quebrado; `[atravessa]` pessoa/objeto que se mexe passando por dentro de outro (mesmo lugar ao mesmo tempo). **Ao criar um objeto novo desenhado
no fundo da rua** (que não é elemento, como postes e caixotes), acrescentar a área dele em `FIXOS_RUA` no `src/conferir.js`.
**Quando o usuário apontar um erro de cena que a conferência não pegou**, além de corrigir o vídeo, ensinar a conferência
(nova checagem em `src/conferir.js`) e anotar a regra aqui, para não repetir em vídeos futuros. Os erros abaixo aconteceram em
vários vídeos diferentes:

1. **Ninguém coberto por objeto alto.** No diorama de rua/praça fica na frente quem tem **`x + z` menor**. Árvores, barracas,
   fonte, palanque, relógio e postes na frente de alguém escondem o personagem.
   - Praça: as árvores da frente `arvore3`/`arvore4` (z -10.25) cobrem a fileira da frente → `"remover": ["arvore3", "arvore4"]`
     sempre que houver gente na frente (padrão do `nm.mjs`).
   - Personagem importante **nunca** atrás de algo: se a história pede "escondido atrás da árvore", ele fica **ao lado/na frente**
     da árvore, visível (o espectador precisa ver).
   - Quem sobe no palanque usa `"y": 0.75` (não conta como coberto).
   - **Postes da rua** não estão nos elementos e têm **lugar fixo no mundo** (iguais em todas as cenas e vídeos —
     `motor/cenarios/ruaDiagonal.js`): calçada dos prédios (z 5.35) em **x = 6.5 + 8k** (…-9.5, -1.5, 6.5, 14.5…) e calçada da
     frente (z 0) em **x = 2.5 + 8k** (…-5.5, 2.5, 10.5…). **Nunca mudar** `comprimento`/`distanciaPostes`/`fasePostes` cena a
     cena para "fugir" de poste (os postes pulariam de lugar entre cenas). Quem se ajusta é a pessoa: ela continua na calçada,
     só **não para atrás de um poste** (poste um pouco à esquerda dela, que fica na frente). Passar por um poste andando, ou
     ficar na frente dele, tudo bem. O `npm run conferir` calcula os postes e acusa.
   - **Objetos fixos desenhados na rua** (não estão nos elementos, como os postes): caixotes do mercado em x 13–14.6, calçada
     dos prédios. Ninguém para ali (parece estar dentro dos caixotes); o `npm run conferir` acusa.
   - **Ninguém em pé em cima de objeto baixo** (canteiro, fonte, banco, barraca): os pés ficam fora da base do objeto
     (`x`..`x + largura`, `z`..`z + profundidade`). O `npm run conferir` acusa ("em cima").
2. **Continuidade de elenco — escrever a intenção no roteiro.** A conferência não entende a história: ela só cobra o que
   o roteiro DECLARA. Por isso, todo roteiro marca a continuidade com três campos de cena:
   - **`"momento": "<nome>"`** — cenas que são o **mesmo instante da história** (a mesma festa, o mesmo debate, a mesma noite
     no quarto) recebem o mesmo nome, mesmo que haja outras cenas no meio (flashback, outro lugar). Dentro de um momento, quem
     já apareceu precisa estar **em todas as cenas seguintes desse momento**, como elemento na **mesma posição** (pode ficar
     fora do enquadramento). Cenas sem `momento` (montagem de exemplos, apresentação) não são comparadas.
   - **`"saiDeCena": ["id", ...]`** — na cena em que alguém **sai pela história** (foi embora, foi levado, foi engolido): a
     partir dela, ele não é mais cobrado. Mostrar a saída na tela também (andar para fora, `desaparecer`).
   - **`"salto": true`** — pulo de tempo/montagem (usado quando o roteiro não tem `momento`).
   Ao **escrever** um roteiro: definir os momentos antes das cenas e montar o elenco de cada momento com posições fixas
   numa função/lista única (como `FESTA()` no espirro; nos scripts do Claude, `marcar(C, { festa: [[10, 22]] })` do `nm.mjs`).
   Ao **corrigir** um aviso de continuidade, primeiro ler a narração da cena e decidir:
   (a) a pessoa deveria estar lá → incluir na mesma posição; (b) ela saiu pela história → marcar `saiDeCena` (e mostrar a
   saída); (c) a cena é outro instante → corrigir o `momento`. **Nunca** apagar alguém que a história precisa só para
   "limpar" o aviso, nem adicionar alguém que a história tirou.
   Quem se moveu (ex.: a Bia correu até o seu Tonho) fica na posição nova nas cenas seguintes do mesmo momento.
3. **Um sprite = um personagem por vídeo.** Dois personagens diferentes nunca usam o mesmo sprite (aluna "Duda" e Nina, Caio
   e o candidato). Figurantes iguais só no fundo, sem nome — marcar o elemento com `"figurante": true` (a conferência
   não cobra). Cuidado: bicho/pessoa que aparece ao lado de um dono já mostrado é o MESMO personagem (usar o mesmo id e sprite).
   Não é figurante quem tem nome, fala algo importante ou pertence a alguém da história. Ao ver o aviso "o sprite X faz N
   personagens", decidir: são figurantes de fundo → marcar `figurante`; é o mesmo personagem → mesmo id; são personagens
   diferentes → sprites diferentes. Nos scripts do Claude: lista `FIG` (como no `l2-cachorros.mjs`) que põe `figurante` sozinho.
4. **Dentro dos limites do lugar.** Cômodo: `x` entre -9 e 9 e `z` entre 0 e ~3.8 — nada de "andar na parede"; para fugir,
   pular/recuar dentro do cômodo ou cortar para outro lugar.
5. **Quem anda seguindo algo anda até o fim da fala.** Personagem que para fica de frente para a câmera (pose parado). Se
   precisar parar, parar no fim e na posição que faz sentido (atrás da própria sombra, na frente de quem chama).
6. **Coisas que acompanham cada pessoa existem para todas.** Ex.: cada pessoa que segue a sombra tem a SUA sombra (máx. 4
   `sombraPessoa` por cena); guardião para cada um que tem guardião; número para cada um, se a regra é de todos.
7. **Gênero e nome coerentes** com o sprite e com o que foi dito antes (a fantasminha é ela; a rival é a Nina).
8. **Sala de aula cheia (turma fixa).** Carteira vazia sem motivo parece erro. A turma é sempre a mesma: **Bia** (`menina-capa`),
   **Nina** (`rival`), **aluno**, **aluna** e o **menino do topete** (`menino-topete`, o protagonista masculino), nas 6 carteiras
   (x -4.6, -1.6, 1.4 × z 2.45 e 0.75, `"pose": "sentado-lado"`). Cada cena põe quem a história pede e completa o resto com a
   turma (`turma()` do `nm.mjs`, sem repetir sprite); carteira vazia só quando a história pede (ex.: "ninguém senta do lado
   da Bia" → `livres`). Se a regra do vídeo dá algo a cada pessoa (número, guardião), os colegas também recebem.
9. **Sentar em banco de praça:** o usuário achou estranho (tanto no banco isométrico quanto no `banco-frente`). Até o
   asset ser refeito, **não pôr gente sentada em banco**: encontros e conversas na praça acontecem em pé.
11. **Ninguém atravessa ninguém** (o usuário viu o pão passando por dentro do policial e gente correndo uma através da outra).
   Cada um anda na **sua faixa de `z`** (diferença ≥ 0,4 entre faixas: ex. calçada dos prédios 4.2 / 4.6 / 5.0 / 5.25 — na frente dos
   postes, que ficam em 5.35; praça -9.8 / -9.2 / -8.6 / -8.0 / -7.6), e na mesma faixa **quem sai na frente chega na frente**
   (ninguém ultrapassa). Objeto grande correndo (o pão gigante) vai pela rua/asfalto ou pela faixa mais da frente. **Comida e
   objetos que "fogem" pulam** (sequência de `pular` com `para`, como `saltos()` do `c12-comida.mjs`), não deslizam com `andar`.
   O `npm run conferir` acusa `[atravessa]`.
10. **Monstro/ameaça com presença:** tamanho grande (`"escala": 2`), entrada com luz piscando e câmera que mostre o rosto (sem
   zoom que corte a cabeça).

## Biblioteca de assets (o que é e como usar)
**O que é:** tudo o que se repete entre vídeos — personagens, cenários, sprites, objetos e sons — fica num lugar só e
serve para **qualquer projeto** pelo nome. Antes de escrever um roteiro, **ler `biblioteca/GUIA-ASSETS.md`** (escrito à mão:
quem é cada personagem, para que serve cada lugar/objeto, posições e combinações) e conferir nomes em `biblioteca/CATALOGO.md`
(gerado: nome, status ✅/🧪, estados e tamanho) — não inventar nomes de sprite/cenário. Asset novo, aprovado ou com papel
fixo → **atualizar o `GUIA-ASSETS.md`** junto.

| Onde | O quê |
|---|---|
| `motor/assets/*.js` (índice `motor/assets/index.js`) | código dos sprites (desenhados em Three.js/pixel), um arquivo por grupo, cada um com `status` |
| `biblioteca/personagens.json`, `biblioteca/cenarios.json` | personagens e cenários **aprovados** (✅) |
| `prototipos/personagens.json`, `prototipos/cenarios.json` | **protótipos** (🧪) — já funcionam em todo projeto |
| `biblioteca/sprites/`, `biblioteca/sfx/` | PNGs e sons do usuário (som com o mesmo nome substitui o gerado) |
| `projetos/<p>/cenarios.json` / `personagens.json` | só o que é exclusivo daquele vídeo (evitar; preferir a biblioteca) |

**Regras de uso:**
- Preferir assets **aprovados**. Protótipo pode entrar num roteiro, mas avisar o usuário quais foram usados.
- Uso no roteiro: personagem `{ "id": "bia", "personagem": "menina-capa" }`; objeto `{ "sprite": "fonte-iso", "pose": "seca" }`
  (estado inicial) e ação `trocar` para mudar de estado; cenário `{ "cenario": "praca-decorada" }` (+ `"remover"`/mesmo `id` para ajustar).
- **Asset novo:** primeiro propor ao usuário (o que é, para quais cenas e vídeos futuros serve); só criar depois do "pode".
  Criado → protótipo (regra 3) e mostrar na `projetos/vitrine`; aprovado ("pode salvar") → mover para `biblioteca/`,
  tirar o `status: 'protótipo'` e rodar `npm run catalogo`.
- Nada de assets copiados de jogos/filmes (regra 6); estilo próprio inspirado em Undertale/Deltarune.
- Referências rápidas: diorama de rua (`rua-comercial`, prédios em x ≈ padaria 0.6, escola 4.6, delegacia 10.4, mercado
  16.2; calçada dos prédios z ~5.6); praça (`praca`, `praca-decorada`: câmera `z` -8.5, pessoas na frente em z ~-8.6,
  palanque x 3.5 z -7.4 — em cima `"y": 0.75`); cômodos `*-diorama` (z 0 = frente, ~3.8 = parede do fundo).

## Dinâmica de trabalho (ajustes visuais)
1. O usuário renderiza no PC dele e diz o que ajustar, em texto, indicando **cena e momento**
   (ex.: "cena 3, ~0:22, a Bia está cortada no Shorts"), de preferência **vários ajustes numa só mensagem**.
2. Captura de tela só quando for difícil descrever.
3. O Claude ajusta **só o que foi apontado**, sem renderizar e sem abrir imagens.
4. Conteúdo novo (episódio novo, personagens novos) → **conversa nova** (este arquivo guarda as regras).

## Produção de um episódio
- Rascunho (16:9): `npm run rascunho -- <ep>`
- Final (gera `final.mp4` 16:9 e `final-shorts.mp4` 9:16): `npm run final -- <ep>`
- **Qualidade dos vídeos finais: Full HD** — Shorts **1080×1920** (pixels internos 180×320 × 6) e longo 1920×1080
  (320×180 × 6), 30 fps (`config.json` → `"final": { "resolucao": 1080, "fps": 30 }`). Não mudar sem o usuário pedir.
- Texto para o ElevenLabs: `npm run narracao -- <ep>` (usa `"narracaoTexto"` de cada cena)
- Conferir cortes da narração sem renderizar: `npm run narracao -- <ep> --verificar`
- Conferir erros de cena sem renderizar (gente coberta, continuidade, elenco, limites): `npm run conferir -- <ep>`
- Mapa das cenas no tempo (para comparar com o gráfico de retenção): `npm run mapa -- <ep>`
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
- **Leva 2 "Nesse Mundo" — roteiros prontos (diorama), aguardando narração/render:** curtos `nesse-mundo-sombras`
  (12 cenas, fala ~45 s; protótipo `sombraPessoa`), `nesse-mundo-fantasminha` (13 cenas, ~47 s; fantasmas protótipo),
  `nesse-mundo-relogio` (12 cenas, ~48 s; `vovo`/`relogio-praca` protótipo); longos `nesse-mundo-espirro` (33 cenas,
  ~2:22; só aprovados) e `nesse-mundo-cachorros` (32 cenas, ~2:24; cães = `cao-guarda`). Cada um tem `ROTEIRO.md`
  (os assets novos sugeridos já foram feitos como protótipo — leva 3 e espirro)
  e `PUBLICACAO.md`.
- **Leva 3 (feita com as táticas de retenção do vídeo das sombras), aguardando narração/render:** curtos `nesse-mundo-gatos`
  (terror de dia, 12 cenas, fala ~47 s; `gato-chapeu` figurantes que viram monstros só enquanto as pessoas estão de costas (cenas 1–2); todos viram `gato-monstro` depois que a Bia leva o prefeito; cena 11 = a sombra leva o prefeito; cena 12 = cara `pior` — o monstro 3D foi tirado, o usuário não gostou) e `nesse-mundo-comida` (comédia de dia, 12 cenas, ~48 s; `pao`,
  `cadeado`). Cada um tem `ROTEIRO.md` com o checklist de retenção cumprido e `PUBLICACAO.md`; `npm run conferir` sem avisos.
- **Terror com protótipos:** `nesse-mundo-guardioes` (curto, 11 cenas, fala ~45 s; guardiões + `fantasma-sombra`) e
  `nesse-mundo-numeros` (curto, 12 cenas, ~49 s; números placa + `fantasma-sombra`; prefeito usa a regra a favor).
- **Recursos novos (protótipo, junto dos vídeos):** olhos das estrelas feitos em 3D (`motor/olho3d.js`, Three.js
  reduzido a pixel); ação `desaparecer` (some devagar, sem fumaça/som); elemento `"tela": true` (detalhe em close no
  centro, fundo escurecido com `"escurecer"`); `"rua": { "alagada": true }`; sprites `viatura-iso` (parado/sirene),
  `caderno` (fechado/aberto), `pagina-caderno` (cheia/ultima/bia). Postes da frente da praça foram para as laterais.
  `cao-policial` (PROTÓTIPO): versão detalhada do `cao-guarda`, no padrão dos moradores (com poses), usado no longo.
  Sentar no banco da praça: `"pose": "sentado"`, `"y": 0`, `"z": -4.05`.
- **Elenco fixo:** Bia (`menina-capa`, protagonista principal), **Nina** (`rival`/`nina`, a rival da Bia — também pode ser a
  protagonista, dependendo da história), seu Tonho (`padeiro`),
  prefeito Arlindo (`prefeito`), Bolota (`cao-guarda`, cão da delegacia), o menino do topete (`menino-topete`, protótipo —
  protagonista masculino e colega de turma da Bia e da Nina; nome ainda não definido).
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
    `gato-chapeu` (estados `monstro` = cara monstruosa e `pior` = ainda mais assustadora, 3 olhos e bocarra; use `trocar` ida e volta; valem andando — o motor usa `<estado>-andando` quando o sprite tem) e `gato-monstro` (sempre monstruoso, anda também; também tem `pior`); objetos `bilhete` (brilhando), `carta` (fechada/aberta), `mapa`, `cadeado` (fechado/aberto),
    `pegadas-brilhantes`, `cartaz-procura-se` (vazio/foto; bom com `"tela": true`); isométricos `relogio-praca`
    (h3/h6/h9/h12/h11-55), `caixa-correio`, `lixeira-praca`, `placa-praca`, `carrinho-sorvete`.
  - ações novas: `pensar`, `destaque`, `contador`, `placar`, `continua`; ícones `lampada`/`gota`/`raiva`/`nota`;
    sons `sino-relogio`, `cadeado`, `papel`, `miau` (miado fofo "mi-aau", refeito), `miau-monstro` (miado que entorta num rosnado — só nos relances de gato virando monstro), `trovao`, `suspense`, `fantasma`. Teste: `projetos/vitrine`
    (personagens em `prototipos/personagens.json`).
  - barracas novas `barraca-sorvete`/`-frutas`/`-verduras`/`-flores`/`-vazia` (estados parado/acesa/fechada) e cenário
    `praca-feira` (em `prototipos/cenarios.json`).
  - 2ª leva: cenários `estrada-terra` (placa VILA SERENA 1 KM), `ponte-rio`/`-noite`, `beco` (cômodo; porta trancada
    com corrente e cadeado), `rua-junina`, `rua-chuva`/`-noite` (em `prototipos/cenarios.json`); opções da rua
    `"chao": "terra"`, `"rio": true`, `"semPredios": true`, `"pocas": true`, `"cerca": false`; sprites `ponte-madeira`
    (em cima `"y": 0.45`), `fogueira-junina` (animada, com luz), `caixote`, `cerca-madeira`, `mato`, `placa-saida`,
    `cadeado-numero` (fechado/tentando/aberto; close com `"tela": true`); som `sininho` (sorveteiro).
- **Espirro (PROTÓTIPO)** (`motor/espirro.js` + quadros em `moradores.js`/`personagens-detalhados.js`): todos os moradores e a
  `menina-capa` têm as poses `espirro-antes` (inspira: cabeça sobe, olhos semicerrados, boca em "o") e `espirro` (ATCHIM: curva
  para a frente, olhos > <, boca aberta e gotinhas). Ação `{ "tipo": "espirrar", "alvo", "inicio", "duracao": 1, "inspira": 0.6 }`
  (não aparece se o personagem estiver sentado) com sons sintetizados `espirro-inspira` e `espirro` (um `biblioteca/sfx/espirro.mp3`
  substitui). Usado no `nesse-mundo-espirro`. Teste: `projetos/vitrine` (cena 26).
- **Leva 3 (PROTÓTIPOS, aguardando "pode salvar")**: cachorros de estimação `cachorro-caramelo`/`-preto`/`-branco`/`-cinza`/
  `-chique` e `vira-lata` (`motor/assets/leva3.js`, personagens em `prototipos/personagens.json`); `vulto` (silhueta de terror,
  estados parado/olhos); objetos `pao` e `saquinho-pimenta` (fechado/aberto); `padeiro-pregador` (seu Tonho com pregador no
  nariz); guardiões com estados novos `tremendo` e `olhando-lado`; climas `neblina` e `polen`; ação `fogos`
  (`posicao` [x, y, z], `cor` dourado/rosa/azul/verde, `subida`) com sons `fogos-sobe`/`fogos`. Teste: `projetos/vitrine` (cenas 27–28).
  `menino-coroa` (PROTÓTIPO, leva 4): menino com coroa (novo `"chapeu": "coroa"` no gerador de moradores) e capa vermelha;
  teste na `projetos/vitrine` (cena 32).
  **Nina** = a rival da Bia (protótipo `rival`, também `"personagem": "nina"`): nome oficial, decidido pelo usuário. No vídeo dos
  números ninguém sabe o nome dela até o fim; nos outros vídeos pode ser chamada de Nina normalmente.
- **Leva 4 (PROTÓTIPOS, aguardando "pode salvar")**: interior da delegacia `delegacia-diorama`/`-noite-diorama`
  (`motor/assets/delegacia.js`: balcao-delegacia, mesa-escritorio, cadeira-escritorio, arquivo, cela, bebedouro); `relogio-praca`
  v2 (mais detalhado); `cao-policial` (v2 desfeita: o usuário pediu o desenho antigo de volta); `alma` (azul/rosa: troca de corpo do espirro) e `banco-frente` (banco visto de frente
  para cenas sentadas) em `motor/assets/leva3.js`. Teste: `projetos/vitrine` (cenas 29–31).
  Regras que vieram dos ajustes do usuário: praça → tirar `arvore3`/`arvore4` (árvores da frente) quando houver gente na frente
  (o `nm.mjs` do Claude já faz isso por padrão); sentar → `banco-frente`; continuidade → numa cena longa no mesmo lugar (festa),
  o mesmo público fica nas mesmas posições em todas as cenas; quem segue algo anda até o fim da fala.
- **Expressões faciais (PROTÓTIPO, v2 conferida com fotos)** (`motor/expressoes.js`): `rosto-feliz`, `rosto-rindo`, `rosto-triste`
  (olho aberto e molhado, sobrancelha caída), `rosto-chorando` (olho apertado + duas lágrimas escorrendo + boca aberta), `rosto-bravo`,
  `rosto-surpreso`, `rosto-assustado`, `rosto-envergonhado`, `rosto-pensativo` (olhar de lado). Têm: todos os moradores e o gerador
  de pessoas, a Bia e os cachorros de estimação (`cachorro-*`, `vira-lata`).
  O `cao-policial` NÃO tem (a expressão deformava o rosto; usuário não gostou). Guardiões, fantasmas e RPG usam o estado parecido que tiverem (feliz/tímido/alerta/tremendo...); sem nada parecido, ficam parados.
  Ação `expressao` (`rosto`, `duracao`), pose fixa `"pose": "rosto-x"`, e automático com o ícone de `emocao` (`gota` → chorando;
  `"rosto": false` desliga). Só aparece com o personagem parado e sem `pose` (andando/sentado não muda). **Usar em todo vídeo** nas
  reações da narração (já aplicado no episódio 1, no tempo e nos 7 da leva 2/terror; estrelas e caderno já foram postados — não mexer; nos scripts do Claude: `rostos(C, [[cena, id, rosto, f]])` do `nm.mjs`).
  Teste: `projetos/teste-rostos` e `teste-rostos2` (`npm run fotos -- teste-rostos`), `projetos/vitrine` (cena 33).
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
- **Decisão do usuário (guardiões):** o monstro do final continua o **`vulto` com `"escala": 2`** ("deixe como está por enquanto");
  o teste com os monstros 3D fica guardado em `projetos/teste-monstro-guardioes` (A vulto, B sombra-alta, C rastejante), sem uso.
- **Monstros de sombra 3D (protótipo, NÃO aprovado)** (`motor/monstros3d.js`): elemento `"monstro": "sombra-alta" |
  "tentaculos" | "massa-olhos" | "rastejante"`, em alta resolução sobre o pixel art. `rastejante` = humano de sombra
  andando de quatro (membros longos, joelhos/cotovelos para cima, cabeça aos trancos; anda com `andar`/`correr`/`mover`,
  `"passada"`). Teste: `projetos/prototipo-monstros` (cena 6; `npm run fotos -- prototipo-monstros`).
- **Sombra que se alastra (protótipo)**: ação `{ "tipo": "sombra", "origem": [x, z], "raio": 20, "inicio", "duracao",
  "recolher": s, "cor", "corBorda", "personagens": false }` — só no diorama de rua/praça: cobre o chão com borda
  esfiapada, sobe paredes/prédios pela altura de cada pixel e sobe pelos objetos e pessoas de baixo para cima; som `sombra`.
  Teste: `projetos/vitrine` (cena 24).
- **Sombra em forma de pessoa (protótipo)**: elemento `{ "id": "s1", "sombraPessoa": { "tamanho": 2.6, "direcao": 0, "olhos": false },
  "x", "z" }` (só no diorama de rua/praça; até 4 por cena): silhueta deitada no chão a partir dos pés que sobe a parede
  quando chega nela; `direcao` em graus (0 = para os prédios, 90 = ao longo de +x). Funciona com `andar`/`mover`,
  `aparecer` (surge em pontilhado), `sumir`/`desaparecer`, `"oculto"`. Teste: `projetos/vitrine` (cena 25).
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
  **Fachadas v2 (proporção, pedido do usuário):** as pessoas eram o dobro da porta; agora o térreo tem 58 px (porta ~46 px,
  vitrine 8–40, toldo/marquise 46–56, acima da cabeça), letreiro em 62–74, andares de 32 px a partir de 80; prédios comuns 112/144/176 px, escola 144, delegacia 112; padaria, mercado e farmácia são térreos (82 px, sem janelas em cima — pedido do usuário).
  As pessoas NÃO mudaram de tamanho. Caixotes do mercado no canto esquerdo da fachada (x ≈ 13.3–14.4, fora do lugar onde as pessoas param); **ninguém para em x 13–14.6 na calçada do mercado** (o `npm run conferir` acusa "caixotes do mercado"). Teste: `projetos/teste-escala`.
- **Protótipos NÃO aprovados** (definidos em `prototipos/cenarios.json`; teste em `projetos/prototipo-diagonal`, `previa.png`, imagens em `praca/`):
  `praca-seca` (decorada com fonte seca etc., para a história do Dia do Sol) e `quarto-menina` / `quarto-menina-noite`
  (diorama e lateral; móveis `penteadeira`, `pufe`, `cavalete`). O modo `"exterior"` do diorama existe mas não é usado.
- **Arte do canal "Histórias em Pixel" (protótipo):** geradores de banner e ícone em `projetos/canal/arte/`
  (`banner.html`, `icone.html`, `gerar.mjs`); o `banner.png` ainda não foi substituído.
- **Branch de trabalho atual:** `claude/happy-goldberg-q6y15g` (reúne TODOS os branches: `ccr-20c16939-ytgzvu`,
  `ccr-77868c41-s69pnw`, `claude/modest-hamilton-4p4851`, `jolly-archimedes`, `upbeat-mccarthy` e os anteriores).
  Antes: `ccr-20c16939-ytgzvu` (reúne `claude/modest-hamilton-4p4851`, que já tinha `jolly-archimedes`,
  `cool-noether`, `charming-mendel` e `epic-bardeen`, + diorama como padrão + guardiões/números) e `ccr-77868c41-s69pnw` (casa, mãe, menino-topete, monstros 3D).
