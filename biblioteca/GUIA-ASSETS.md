# Guia dos assets — quem é quem e quando usar

Guia escrito à mão para quem cria roteiros (pessoas e o Claude). Diz **o que cada asset representa na história**,
**quando usar** e **como posicionar**. A lista completa e atualizada de nomes/estados fica no
[`CATALOGO.md`](CATALOGO.md) (gerado com `npm run catalogo`) — se um nome daqui não estiver lá, ele mudou.

Legenda: ✅ aprovado (biblioteca) · 🧪 protótipo (funciona em todo projeto, mas ainda espera o "pode salvar" do usuário;
avisar quando usar). Regra do canal: **todas as cenas no diorama** (rua, praça ou cômodo).

---

## 1. Elenco fixo (Vila Serena)

| Nome na história | Personagem | Status | Quem é / como usar |
|---|---|---|---|
| **Bia** | `menina-capa` | ✅ | Protagonista principal do canal, ~10 anos, capa de chuva amarela e galochas. Curiosa, sente que "nada acontece". Use na maioria dos vídeos. Poses: sentado, sentado-lado, costas, sentado-costas, espirro. Voz 1.2 |
| **Nina** | `nina` (= `rival`) | 🧪 | A rival da Bia: mesma idade, confiante, rabo de cavalo alto, jaqueta e capa roxas, sorriso de canto. **Também pode ser a protagonista**, dependendo da história (ex.: `nesse-mundo-numeros`, em que ninguém sabe o nome dela até o fim). Quando a Bia aparece junto, a Nina pode ser rival, competição ou aliada relutante |
| **Seu Tonho** | `padeiro` | ✅ | Padeiro gordinho de bigode e chapéu branco; coração da cidade. Ótimo "secundário marcante". Variação `padeiro-pregador` 🧪 (pregador no nariz) |
| **Prefeito Arlindo** | `prefeito` | ✅ | Grisalho, bigode, terno e faixa verde. Autoridade vaidosa, fácil de ridicularizar; às vezes usa a regra a favor (fama, poder). Variação `prefeito-careca` ✅ (depois que a peruca voa) |
| **Policial** | `policial` | ✅ | Policial da delegacia, dorme em pé (`zzz`). Variação `policial-oculos` ✅ (o policial Ronaldo, de óculos escuros) |
| **Bolota** | `cao-guarda` | ✅ | Cão da delegacia, de uniforme (estilo RPG, de frente). Mascote cômico |
| **Professora** | `professora` | ✅ | Coque ruivo, óculos, casaco verde, livro. Brava mas querida ("Sem correr, crianças!") |
| Menino da coroa | `menino-coroa` | 🧪 | Menino com coroa dourada (pedrinhas), capa vermelha, túnica azul-real e cinto dourado; sorriso de canto, confiante. Bom para "o menino que se acha rei", príncipe da festa, rival do menino do topete. Anda, corre, senta, fica de costas e espirra |
| **Léo** (menino do topete) | `menino-topete` | 🧪 | Protagonista masculino, colega de turma da Bia e da Nina; topete e cachecol azul |
| Aluno / aluna | `aluno`, `aluna` | ✅ | Colegas de escola (crianças com mochila). Servem de protagonista ("o Caio") ou de turma. **Não use o mesmo sprite para dois personagens diferentes no mesmo vídeo** |
| Caixa | `caixa` | ✅ | Moça do mercado, boné e avental verdes |
| Robô-semáforo | `robo-semaforo` | ✅ | Robô de trânsito detalhado (ainda pouco usado) |

**Outros moradores 🧪:** `vovo` (vovó de xale roxo; banco da praça), `carteiro`, `sorveteiro` (com `carrinho-sorvete`),
`menino-pijama` (cenas à noite), `menino-coroa` (coroa e capa), `mae`, `mae-avental`, `menino-topete` (família da casa), `cao-policial` (cão em pé,
de uniforme, com poses; v2 com focinho maior, manchas nos olhos, patas e rabo que abana), `motorista` (do ônibus, quepe), `gari`
(uniforme laranja; vassoura com `"sobre"`), `pipoqueiro` (avental, boné vermelho) e `medica` (jaleco branco, óculos). Todos os moradores andam,
correm, sentam, ficam de costas e espirram.

**Pessoas medievais 🧪** (só nos cenários medievais): `rei`, `rainha`, `princesa`, `cavaleiro`, `campones`, `camponesa`, `ferreiro`, `bruxa`, `mago`
(ver "Medieval" em Lugares). **Avatares de bloco 🧪** (só no jogo de blocos): ver "Jogo de blocos". **Manequins 🧪**: ver "Loja e fábrica".

**Bichos e criaturas:** `pombo-fofoqueiro` ✅ (fofoca, aparece em toda praça), `coruja-banca` ✅ (vende jornal),
`lixeira-timida` ✅, `fantasma-metro` ✅, `cone-agressivo`/`bueiro-olhos` ✅ (inimigos brancos de batalha),
`cone-monstro` ✅ e o sprite `bueiro-monstro` ✅ (monstros de rua), `gato-chapeu` 🧪.
Cachorros de estimação 🧪: `cachorro-caramelo`, `-preto`, `-branco`, `-cinza`, `-chique` (o do prefeito) e
`vira-lata` (sem coleira) — um para cada dono, para o público saber de quem é cada cão.

**Sobrenatural 🧪:**
- **Guardiões:** `guardiao-azul`, `guardia-verde`, `guardiao-chefe`, `guardiao-noturno`. Criaturinhas que flutuam ao lado
  da cabeça da pessoa: `"sobre": { "id": "<pessoa>", "dx": 0.9, "dy": 1.55 }`. Estados: parado, feliz, alerta, dormindo,
  tremendo e olhando-lado.
- **Fantasmas** (flutuam, use `"y": 0.4`): `fantasma-lencol`, `fantasma-crianca` (tímido, fofo), `fantasma-vovo`,
  `fantasma-sombra` (escala 2), `fantasma-cachorro` e `fogo-fatuo`.
- **Terror:** `vulto` (silhueta alta e escura em pé; estados parado e olhos). É o melhor para "algo atrás de você"; com `"escala": 2`
  fica bem mais assustador (câmera sem zoom para caber a cabeça). Entrada assustadora: luz piscando (`flash` curtos) e ele
  `aparecer` durante um clarão, depois `mover` mais perto no próximo.
  `sombraPessoa` é a sombra no chão, que sobe a parede (elemento `{ "sombraPessoa": { "tamanho": 2.6 } }`).
- **Animatrônicos de brinquedo 🧪** (`motor/assets/animatronicos.js`, terror de dia): brinquedos de corda gigantes, do tamanho de um
  adulto — `brinquedo-soldadinho` (madeira, barretina, bigode pintado, maxilar de quebra-nozes), `brinquedo-boneca` (pano, olhos de botão,
  boca costurada, remendos), `brinquedo-robo` (lata, antena, visor de luz, ferrugem) e `brinquedo-caixa` (caixa-surpresa; o bobo sai na mola).
  A chave de corda gira nas costas enquanto estão ligados. Estados: `parado`, `desligado` (sem corda, cabeça caída), `cantando`, `acenar`,
  `virado` (cabeça torta), `olhos` (buracos pretos com pontinho branco que brilha; o robô fica com o visor vermelho), `rachado` (o rosto
  racha e mostra engrenagem/enchimento), `falha`; andam travados e `olhos`/`virado`/`rachado` valem andando. Caixa: `fechada` (manivela
  girando), `parado` (aberta, balançando), anda aos pulinhos. Sons `corda` (catraca), `servo`, `caixinha-musica`, `falha-eletrica`.
  Truque de terror: mudam de estado na palavra forte (`trocar` + som); de dia, sem escuro.
  **Sem rosto (mais assustadores):** estado `sem-rosto` nos 4 (o rosto cai na hora, com `trocar`; vale andando) e versões que já vêm
  sem rosto em todas as poses — `brinquedo-soldadinho-sem-rosto`, `brinquedo-boneca-sem-rosto`, `brinquedo-robo-sem-rosto`,
  `brinquedo-caixa-sem-rosto`: buraco escuro com borda rasgada (lascas, enchimento, fios, cacos), engrenagem e dentinhos no fundo, dois
  pontinhos brancos (vermelhos no estado `olhos`), rasgo no peito e um braço caído; a `falha` pisca o rosto antigo de volta.

---

## 2. Lugares (cenários)

### Rua comercial (diorama) — o "centro" de Vila Serena
`rua-comercial` ✅ / `rua-comercial-noite` ✅. Prédios da esquerda para a direita: comum, **padaria (x 0.6)**,
**escola (x 4.6)**, **delegacia (x 10.4)**, **mercado (x 16.2)**, farmácia.
- Calçada dos prédios: `z` ~5.2–5.6, câmera `{ "x": <prédio>, "z": 2.2, "y": 2.4 }`. Use para "na frente da padaria" etc.
- Calçada da frente: `z` ~0.6, câmera `{ "x", "z": 0, "y": 2.4 }`. Use para caminhar e conversar.
- **Postes fixos:** calçada dos prédios em x = 6.5 + 8k, calçada da frente em x = 2.5 + 8k. Não pare ninguém logo à direita de um
  poste (o poste fica na frente e esconde); um pouco à esquerda ou longe, tudo bem.
- Close: `"zoom": 2` com `"z": 3.4, "y": 2.6`. Céu acima dos telhados: câmera `"y"` ~3.5.
- Variações 🧪: `rua-chuva`/`-noite` (poças), `rua-alagada`, `rua-junina` (fogueira + barracas, festa junina),
  `rua-estrelas` (palanque no meio da rua), `rua-festa` ✅ (bandeirinhas e fonte).

### Praça (diorama)
`praca` ✅ / `praca-noite` ✅ (uso normal) e `praca-decorada` ✅ / `praca-decorada-noite` ✅ (festas, discursos, eleição).
Câmera `{ "x", "z": -8.5 }`; pessoas na frente em `z` ~-8.6.
- **Palanque** (só na decorada): suba em `x` ~3.4–5, `z` -6.7, com `"y": 0.75`.
- **Sentar:** o usuário achou estranho — por enquanto, sem gente sentada em banco de praça (conversa em pé). Asset em teste: **`banco-frente`** 🧪 (banco visto de frente, no mesmo ângulo de quem senta). Banco em `z` = Z + 0.2 e as pessoas
  em `z` = Z, `"y": 0`, `"pose": "sentado"`, a ±0.75 do centro do banco (cabem 2 ou 3). Ex.: banco x -1, z -8.35; pessoas x -1.75 e -0.25, z -8.55.
  O banco isométrico do cenário (`banco1`/`banco2`) com gente sentada de frente fica estranho: tire com `"remover"`.
- **Árvores da frente** (`arvore3`, `arvore4`, z -10.25) cobrem quem está na fileira da frente: tire com `"remover"` quando houver gente ali.
- Fonte em x -0.9, z -6.9 (estados cheia/seca). Árvores, canteiros e postes já vêm no cenário.
- Variações 🧪: `praca-feira` (barracas de frutas, verduras, flores e sorvete) e `praca-seca` (Dia do Sol).

### Loja e fábrica de brinquedos (🧪, terror dos brinquedos — só nos vídeos que pedirem)
A rua comercial normal (`rua-comercial`) **não** tem a loja. Para os vídeos dos brinquedos:
- `rua-brinquedos`: a mesma rua, com a **loja de brinquedos** (fachada amarela, letreiro rosa, toldo azul e amarelo, vitrine com
  brinquedos nas prateleiras) no lugar do prédio comum da esquerda: x ≈ -6.4 a -1.4 (centro -3.9). Padaria, escola etc. no mesmo lugar.
  Calçada da loja z ~5.0, câmera `{ "x": -3.9, "z": 2.2, "y": 2.4 }`. Poste fixo em x -1.5: ninguém para logo à direita dele.
- `loja-brinquedos-diorama`: a loja por dentro (parede listrada rosa com varal de bandeirinhas, prateleira de parede e cartaz do
  soldadinho; vitrine de vidro com bonecas de porcelana, 2 prateleiras cheias de brinquedos, balcão com caixa registradora, presentes,
  baú, cavalinho de balanço e trenzinho no chão). Brinquedos em pé na frente das prateleiras (x -6.9, -3.4, 0; z ~2.6); pessoas z 0–1.6.
- `fabrica-brinquedos`: a **fábrica** sozinha no campo, na estrada de terra = **fábrica de tijolo com toques de castelo**, envelhecida (duas chaminés listradas com coroa
  de ameias, bandeirinha e **fumaça animada** automática; frontão de pedra com engrenagem dourada; ameias; portão de carga em arco; janelas
  industriais em arco com vidro em grade — uma quebrada, uma tampada —; cano com válvula; fuligem, ferrugem, musgo; faixa "FÁBRICA DE
  BRINQUEDOS"). O usuário achou as torres do castelo ridículas: sem torres, estética de fábrica); centro x ≈ 0.6; pessoas na estrada z ~1.4–4.4 ou na frente do portão z ~5.0; câmera alta `{ "x": 0.6, "z": 2.2, "y": 3.6 }`
  (a fumaça é o sprite `fumaca-chamine`, que o cenário põe sozinho; também serve como elemento comum).
- `fabrica-brinquedos-diorama`: a fábrica por dentro, com o mesmo tijolo de fora e faixa de pedra rosa (janelas industriais em arco —
  uma quebrada —, canos com válvula, engrenagens douradas, placa de aviso; máquina com luzes à esquerda, forno aceso, prateleira de cabeças
  de boneca, esteira com cabeças e corpos, caixotes de peças, bancada com um boneco pela metade). Brinquedos saem da máquina em x ~-6.2, z ~1.0 e andam para a direita.
- `loja-fundos-diorama`: a **sala dos fundos da loja** (oficina de conserto): o papel de parede listrado da loja, gasto e manchado;
  bancada (em cima dela, o sprite `boneco-conserto` 🧪: boneca de pano tombada com o peito aberto mostrando engrenagem e
  enchimento, um olho costurado em X e o braço solto preso por uma linha — `{ "sprite": "boneco-conserto", "x": -0.6, "z": 2.8, "y": 1.0 }`),
  prateleira de cabeças, caixotes de peças e caixas de papelão. Pessoas z 0–1.4.
- `sala-manequins-diorama`: o **depósito dos manequins** (cimento cinza rachado, janelinha alta, espelho velho, arara de cabides vazios,
  caixas de papelão). Manequins em fileira no fundo (z ~2.4–2.8, x -6.5 a 6.5); pessoas z 0–1.4.
- **Manequins 🧪** (personagens): `manequim` (cinza, sem roupa e sem rosto, juntas marcadas, em pé num suporte de metal; estados `parado`,
  `virado` = cabeça torta, `braco` = braço levantado, `torto` = corpo inclinado; `mover` desliza no suporte, sem passos) e `manequim-coberto`
  (com lençol branco; `parado`, `virado`). Vários iguais: marcar `"figurante": true`. Terror: mudam de pose/lugar de uma cena para outra.
- A **fábrica** (`fabrica-brinquedos` / `-diorama`) continua para outras histórias (ex.: de onde os brinquedos vêm).
Sugestão: a loja como base do vídeo (de dia, na rua) e a fábrica como revelação no fim, em 1–2 cenas.

### Cômodos (diorama, enchem a tela)
✅ `sala-de-aula-diorama`, `quarto-menino-diorama` (+ `-noite`), `sala-de-estar-diorama`.
🧪 **`quarto-menina-diorama` (+ `-noite`) = quarto da Bia/Nina**, `cozinha-diorama`, `banheiro-diorama`, `sala-de-estar-noite-diorama`, `beco`.
- `z` 0 = frente, ~3.8 = parede do fundo; câmera padrão `{ "x", "y": 3 }`.
- **Sala de aula:** turma fixa nas 6 carteiras — Bia, Nina, aluno, aluna e o menino do topete (nada de carteira vazia sem motivo).
  A lousa fica na parede da direita. Alunos `"pose": "sentado-lado"` em x = -4.6, -1.6, 1.4 × z = 2.45 e 0.75;
  professora em x 8.1, z 1.6, virada para a esquerda.

### Delegacia por dentro (diorama, 🧪)
`delegacia-diorama` / `delegacia-noite-diorama`: balcão com distintivo, mesa com computador, arquivos, bebedouro e **cela com
grade** (dá para ver quem está dentro). Policial atrás do balcão x ~0.6, z ~2.6; quem chega x ~0.6, z ~0.8; mesa x ~-4.4,
z ~2.4; dentro da cela x ~7.4, z ~2.6.

### Fora da cidade (diorama, 🧪)
`estrada-terra` (placa "VILA SERENA 1 KM"; pessoas z ~1.4–4.4), `ponte-rio` / `-noite` (em cima da ponte: `"y": 0.45`).

### Jogo de blocos (🧪, vídeos que falam de Roblox)
Estilo "jogo de bonecos de bloco" desenhado do nosso jeito. **Nunca** usar o logo, o nome em sprite, o avatar padrão (amarelo/azul/verde)
nem a moeda oficial do Roblox; o nome "Roblox" pode aparecer na narração/título.
- `mundo-bloco` (v2): o mundo DENTRO do jogo, de dia: chão cinza de "baseplate" com pinos (opção da rua `"chao": "baseplate"`) e, no fundo, um
  percurso de peças de plástico coloridas com pinos (plataforma de nascer em x -6.4 z 2.0, escada de peças, placa, bloco neon vermelho que
  "mata", torre com treliça, chegada xadrez, moedas). Pessoas z ~1.4–4.4. `mundo-bloco-grama`: o mapa antigo, com chão de ladrilhos de grama.
- Avatares (personagens): `avatar-bloco-vermelho`, `-roxo`, `-verde`, `-azul`, `avatar-bloco-capuz` (rosto no escuro, olhos vermelhos: o estranho
  do servidor) e o elenco em bloco `avatar-bia`, `avatar-nina`, `avatar-topete` (v2: proporção de bloco clássico — cabeça arredondada, tronco largo, braços e pernas em
  blocos, plástico brilhante, braços e pernas balançando ao andar; 30x50, um pouco maiores que as pessoas). Estados `parado`, `acenar`, `bug` (fatias e cores, travando),
  `sem-rosto`, `sorriso` (o sorriso pintado estica); andam travados e pulam; `bug`/`sem-rosto`/`sorriso` valem andando.
- Peças (sprites isométricos, 1 peça = `"y": 1` para empilhar): `peca-vermelha`, `-azul`, `-amarela`, `-verde` (com pinos), `placa-azul`/`-amarela`
  (finas, 2x2), `bloco-neon` (vermelho que brilha), `trelica` (torre de grade, 4 de altura), `cubo-pedra`, `cubo-grama`, `cubo-terra`, `cubo-madeira`,
  `cubo-lava`, `cubo-xadrez`, `plataforma-spawn` (círculo que brilha); `moeda-bloco` (moedinha quadrada nossa, gira).
- `tela-jogo`: monitor em close (`"tela": true`, `"escurecer"`) com interface de jogo (chat à esquerda, lista de jogadores à direita, barra no
  topo, baseplate e avatares); estados `jogando`, `chat` (mais mensagens, uma vermelha), `erro`.
- Sons: `entrar-jogo`, `pulo-bloco`, `ai` (o "ui!" de quando o avatar cai), `chat`, `bug-jogo`.
- Novos 🧪 (vitrine 65–68, teste em `projetos/teste-roblox`): `tela-jogo` ganhou `socorro` (avatar em close batendo no vidro, chorando, o vidro
  rachando; 2 quadros), `chat-nao-sai` (4 jogadores mandando NÃO SAI em vermelho), `chat-banho` (VAI TOMAR / BANHO!) e `pausado` (jogo cinza com
  o símbolo de pausa); `icone-pausa` (símbolo de pausa que flutua em quem congelou: `"sobre": { "id", "dy": 2.5 }`); rosto **`bug`** para as
  pessoas (olhos quadrados ciano e fatias do rosto deslocadas, piscando rápido — a criança "trocada"); sombra de avatar
  `"sombraPessoa": { "bloco": true }` (cabeça quadrada, braços e pernas retos, não tremula). Rosto macabro: em pele escura os olhos pretos aparecem
  menos — preferir `bug` ou zoom 2 nesses casos.
- **Lugares dos 3 vídeos de Roblox** 🧪: `quarto-leo-diorama` (quarto do Léo, o jogo aberto no monitor da escrivaninha — opção de móvel
  `"jogo": true`; cadeira gamer verde), `quarto-nina-diorama` (roxo, computador DESLIGADO: ela parou de jogar), `mundo-bloco-tarde` (o lobby
  ao pôr do sol: final do emocional), `parkour-campeonato` (v2: pilares em linha a cada 2,8 em x, z 2.6, alturas 1→4; o pilar verde é o checkpoint;
  `arco-largada` na beira de trás do bloco de início — avatares na frente dele, z 2.3–3.0, `"y": 1` — e outro arco na chegada, `"y": 4`). Junto com os já existentes: `mundo-bloco` (lobby), `cidade-bloco`, `parkour-bloco`, `escola-patio`, `rua-comercial`,
  `sala-de-estar-diorama`, `banheiro-diorama`, `quarto-menina-diorama` (Bia), `praca`/`praca-tarde`.
- **`avatar-leo-1` / `avatar-leo-2`** 🧪: o avatar do Léo virando ele aos poucos (1 = roupa dele com o cabelo/pele do avatar azul;
  2 = roupa + topete); o idêntico é o `avatar-topete`. **`celular-mao`** 🧪: celular aceso na mão de quem joga no mundo real
  (`"sobre": { "id", "dx": 0.35, "dy": 0.95 }`). **Ação `congelar`** 🧪 (`{ "tipo": "congelar", "alvo", "inicio" }`): o elemento para
  exatamente como estava (no meio do pulo, da corrida) — a "pausa" do jogo; use com um `pular` de verdade. **Spawn:** os avatares ficam
  NA FRENTE da `plataforma-spawn` (x ~-5.6, z ~1.5), não em cima (em cima o desenho piscava).
- **Andar e pular dos avatares (v2)** 🧪: o andar tem 6 quadros (perna da frente sobe aos poucos, a de trás fica atrás e mais escura, braço
  oposto balança junto, corpo sobe 1 px no meio do passo; 9 q/s andando, 14 correndo). O pulo tem fases escolhidas sozinhas pelo motor
  durante o `pular`: agacha (0–10%: corpo desce, braços para trás) → sobe (braços para cima, como no jogo) → desce (braços meio abertos, uma
  perna dobrada) → aterrissa (90–100%: braços e pernas abertos). Os outros personagens continuam com o `pulando` de sempre.
- **`cidade-bloco`** 🧪 — a cidade do jogo: rua de asfalto com faixa amarela (z 1.3–4.7), calçada dos prédios (z 5.0–6.5) e da frente
  (z -0.5–1.0), gramado; no fundo casas, `loja-bloco-azul`/`-rosa`/`-verde` (toldo listrado e letreiro), `predio-bloco`; `poste-bloco` (luz
  amarela) e `carro-bloco-vermelho`/`-azul`/`-amarelo`. Avatares andam nas calçadas (z ~5.2–6.0 ou ~0.2–0.8). Chão `"chao": "bloco-cidade"`.
- **`parkour-bloco`** 🧪 — mar de lava (`"chao": "lava"`, brilha) com `pilar-bloco-1`…`-5` (pilar cinza saindo da lava e plataforma colorida em
  cima; quem está em cima usa `"y": altura + 0.25`), `plataforma-inicio` (spawn; em cima `"y": 1`), `plataforma-chegada` (topo xadrez; em cima
  `"y": 4`) e checkpoint no meio (`"y": 3.25` em cima do pilar 3). Avatares pulam com `pular` + `"para": [x, y]`.
- **v5: dois lugares** 🧪 — `mundo-bloco` = o **lobby** (praça de baseplate, spawn, gramado, casinhas e árvores; sem peças soltas: o usuário
  perguntou "esses blocos estão fazendo o quê?") e `mundo-bloco-corrida` = o **percurso** (o mesmo lobby com a corrida montada na beira de trás).
  Use a corrida só quando a cena for de corrida/campeonato e os avatares estiverem pulando nas peças; o resto (chat, spawn, avatares
  esperando, socorro) no lobby.
- **`mundo-bloco` v4 (agora é o `mundo-bloco-corrida`)** 🧪 (pedido do usuário: "fundo e peças no nada" estavam estranhos): praça de baseplate (z -0.5 a 6.5)
  cercada de **gramado**; no fundo (grama, z 7.4–9) um bairro de 4 `casa-bloco` e árvores; o percurso fica na beira de trás da praça
  (z 5.4–6.2) e é **todo apoiado no chão** (escada de peças, 2 blocos neon, checkpoint, escada verde, chegada e
  checkpoint 2). Nada flutuando sem apoio. Avatares em z ~1.4–4.4.
- **`mundo-bloco` v3 — com referências dos jogos atuais** 🧪: peças de **plástico liso** (sem os pinos de LEGO; `{ pinos: true }` no código volta),
  baseplate **cinza com grade** que vai longe até o fundo (sem a borda do céu na diagonal; `"rua": { "baseplateClassica": true }` volta aos pinos),
  **checkpoints** verdes que brilham (`checkpoint-1`…`-5`, zona segura; vermelho neon = bloco que mata — o código de cores dos percursos).
- **`mundo-bloco` v3 (mais cheio)** 🧪: casinhas do lobby (`casa-bloco`, x -10.6 e 11), `arvore-bloco` (6 pelo mapa, inclusive nos cantos da
  frente x ±12), `torre-bloco` (peças coloridas empilhadas com luz no topo, ao fundo), `ponte-bloco` (passarela no ar), `bandeira-checkpoint`
  (x -0.8, z 4.9), `trampolim-bloco` (x 5.6, z 4.8), `placa-jogo` (seta, junto do spawn), plataformas flutuando (a `nuvem-bloco` existe, mas saiu do mapa: ficava em cima do chão), mais
  moedas. Os avatares continuam em z ~1.4–4.4 (a frente fica livre). Teste: vitrine 72.
- **Cenas de jogo acontecem DENTRO do `mundo-bloco`** (pedido do usuário): chat = balão `falar` em cima do avatar (como o chat de balão do
  jogo, com som `chat`); pausa = avatares parados no ar (`"y"` + `"pose": "pulando"`) com `icone-pausa` em cima (`"sobre"`, `dy` 3.0);
  socorro = avatares andando até a frente da câmera (zoom 2, câmera z ~1.2) em `bug`, pulando com `tremer`. O `tela-jogo` (o monitor) fica só para um
  close rápido e SEMPRE no mundo real, no quarto de quem joga (`quarto-leo-diorama`, `quarto-nina-diorama`...): nunca dentro do `mundo-bloco`
  (um monitor no meio do jogo não faz sentido — o usuário apontou). Teste: vitrine 69–71.
- Truque de terror: o avatar de uma pessoa da cidade faz algo no jogo e a pessoa faz igual na rua (ou o contrário); `bug` na palavra forte.

### Isekai do cogumelo Davi (🧪, série isekai — `motor/assets/isekai.js`)
- `floresta-isekai`: clareira de dia (chão `"chao": "floresta"` = grama com trilha de terra sinuosa e florzinhas; mata fechada de 4 fileiras
  no fundo (z 9.2–12.4) e, no lugar do céu, um fundo de copas escuras (`"rua": { "ceu": "mata" }`, serve para qualquer cena de mata:
  o usuário achou que o céu azul atrás da clareira parecia "flutuando/bugado"); árvores no fundo z ≥ 6.8,
  moitas `mato`, clima `polen`). Personagens na clareira em z ~1.2–4.6; câmera `{ "x", "z": 2.2, "y": 2.6 }`.
- **`cogumelo-davi`** (personagem, 24x28): o cogumelo protagonista (chapéu vermelho de bolinhas, caule creme, perninhas). Estados: `parado`,
  `andando`/`correndo` (passinhos), `pulando`, `assustado` (+`-andando`), `tremendo`, `sem-chapeu` (+`-andando`, `-tremendo`, `-inspira`,
  `-espirro`), `espirro-antes`/`espirro` (a ação `espirrar` funciona nele), `feliz`, `grande` (chapéu gigante dourado) e as expressões.
- `cogumelo-comum`, `cogumelo-roxo`, `cogumelo-verde`: os outros cogumelos da floresta (figurantes; `sumir` = "puf" quando o herói golpeia).
- **`goblin`** (personagem): o rival da série, um **goblin bruxo** (necromante) — chapéu pontudo de aba larga com fita verde e estrelinhas, manto roxo estrelado, grimório
  roxo com runas verdes, cajado com caveirinha e chama verde, olhos verdes que brilham. `parado` (anotando: a página vira), `feliz`, `rindo`,
  `alerta`, `conjurar` (cajado erguido, olhos acesos), andando. Combina com `fogo-fatuo` `verde` (as almas que ele junta) e `flash` com `cor` verde.
- Heróis (gerador de pessoas, com expressões): `heroi-aventureiro` (ruivo, capa vermelha), `heroi-aventureira` (rabo preto, capa azul),
  `heroi-grandao` (careca de bigode, capa amarela). Espada na mão: `{ "sprite": "espada-heroi", "sobre": { "id": "<herói>", "dx": 0.45, "dy": 0.8 } }`.
  Dormindo no chão: `heroi-*-dormindo` (deitado, olhos fechados) — troca com `sumir`/`aparecer` (`som: null`) no mesmo lugar + `emocao` `zzz`.
- `chapeu-davi` (`parado`/`grande`): o chapéu sozinho, para voar (`aparecer` + `pular` com `para`) e voltar para a cabeça.
- **Ações:** `golpe` (`alvo` = quem ataca, `"direcao": "direita" | "esquerda"`): arco branco nítido da espada + faíscas + som `espada`; a
  `espada-heroi` presa nele (`"sobre"`) gira sozinha para `golpe-dir`/`golpe-esq` por ~0,25 s e volta.
  `esporos` (`alvo` ou `posicao`, `"cor": "azul" | "amarelo" | "rosa"`, `"tamanho": "pequeno" | "grande" | "flutuando"`): espirrinho, nuvem que
  enche a tela ou esporos boiando sem parar (bom para a última imagem) + som `esporos`. Cores: azul = sono, amarelo = riso, rosa = amor.
- Nada copiado de jogos (nem herói de túnica verde, gorro pontudo ou espada famosa). Teste: `projetos/vitrine` (cenas 81–84).

### Medieval (🧪)
- `vila-medieval`: rua de pedras (opção `"chao": "pedras"`) com casas de enxaimel (pedra embaixo, reboco e vigas de madeira, telhado de
  telhas). Centros: casa (x -10.4), **taverna** (-5.4, placa TAVERNA, janelas acesas), casa de telhado cinza com chaminé e fumaça (-0.4),
  **ferreiro** (4.1, arco aberto com a forja acesa e a bigorna, placa com bigorna), casa (8.6). Já vem com poço, barraca de frutas,
  carroça, feno, barris e tochas. Calçada das casas z ~4.6–5.0; rua z 0.6–4.
- `castelo-medieval`: a muralha do castelo (portão em arco com grade levadiça, ameias, duas torres quadradas, estandartes vermelho e
  azul pintados e em mastro, tochas). Portão em x ~0.6; guardas em x -1.4 e 2.6, z 5.0; câmera alta (y 3.4).
- `salao-trono-diorama`: pedra, vitrais coloridos, estandartes, tochas e escudos na parede, trono dourado num degrau e tapete vermelho.
  Rei sentado: x 0, z ~3.0, `"pose": "sentado"`, `"y": 0.55`; guardas x ±2.6, z 2.4; visitantes z 0–1.2.
- `taverna-diorama`: madeira, lareira acesa, balcão com canecas, barris, 2 mesas com canecas e pão, banquetas. Atrás do balcão x ~5.6, z ~2.8.
- Pessoas (gerador de moradores, com expressões, andam e sentam): `rei`, `rainha`, `princesa`, `cavaleiro` (elmo com pluma, escudo,
  lança, capa), `campones`, `camponesa`, `ferreiro`, `bruxa` (chapéu de bruxa novo, pele esverdeada), `mago` (capuz novo, barba).
  O gerador ganhou `"chapeu": "bruxa"` e `"chapeu": "capuz"`.
- Objetos isométricos: `barril`, `feno`, `carroca`, `poco`, `barraca-medieval`, `estandarte` (`vermelho`/`azul`), `tocha` (fogo animado
  com luz).

### Cidade — melhorias (🧪, `motor/assets/cidade.js`)
- **Vida na rua** (`"vidaNaRua"` na cena ou no cenário; só rua/praça): `true` = 3 pedestres passando no fundo + 2 pombos que voam no meio da
  cena; ou `{ "pedestres": 3, "pombos": 2, "cachorro": true, "carros": 2, "onibus": true }`. Pedestres andam ATRÁS de quem está na calçada
  dos prédios (z 5.3/5.7; na praça z -6.9/-6.5), com sprites que a cena não usa; carros e ônibus passam no asfalto (z 2.6/3.6) **na frente**
  de quem está na calçada dos prédios — só use carros quando ninguém importante estiver ali. A conferência ignora esses figurantes.
- **Cenários prontos:** `rua-viva` (vida na rua), `rua-transito` (carros, ônibus, ponto de ônibus, semáforo, placa, bicicleta), `rua-tarde` e
  `praca-tarde` (**pôr do sol**, `"periodo": "tarde"`: luz alaranjada, céu laranja e rosa — final sem escuro), `rua-vento` (clima `vento`),
  `rua-neblina` (neblina de dia), `rua-chuva` (já existia), `praca-parquinho`, `rua-bairro` (edifício x -11.4, posto de saúde -5.4,
  biblioteca 0.1, casas 5.1 e 10.1), `casa-bia-fora` (casa amarela da Bia x 0.6 entre as dos vizinhos), `escola-patio` (pátio fechado: cimento, quadra verde no meio,
  muro baixo com grade `muro-escola` e portão na frente; `"chao": "patio"`), e os interiores `onibus-dentro-diorama`, `mercado-dentro-diorama`, `consultorio-diorama`, `biblioteca-diorama`.
- **Parquinho:** `escorregador`, `balanco` (`parado`, `balancando`, `sozinho` = um assento balança sem ninguém), `gira-gira` (`girando`),
  `gangorra` (`subindo`).
- **Rua:** `pombo-rua` (`parado` bicando, `voando`), `carro-vermelho`/`-azul`/`-amarelo`/`-branco`, `onibus`, `bicicleta`, `ponto-onibus`,
  `semaforo` (`verde`, `amarelo`, `vermelho`, `piscando`, `apagado`), `placa-rua` (`rua`, `pare`, `nao-olhe`, `vazia`), `relogio-digital`
  (`10-00`, `12-00`, `03-33` em vermelho, `00-00`, `piscando`), `cartaz-muda` (`circo`, `sorriso`, `olhos`, `vazio`), `janela-cortina` (para pôr
  na fachada com `"y"`: `fechada`, `aberta`, `balancando`, `acesa`, `vulto`), `varal` (roupas balançando), `mastro-bandeira` (tremulando),
  `portao-escola` (`aberto`/`fechado`), `muro-escola` (trechos de 4), `trave`, `bola`, `vassoura` (do gari, com `"sobre"`), `carrinho-compras`.
- **Telas em close** (`"tela": true`): `tv-noticia` (`jornal`, `urgente`, `chuvisco`, `desligada`) — o "olhar de fora" da virada — e
  `celular` (`inicio`, `notificacao`, `mensagem`, `chamada` de "???", `camera` com alguém atrás, `rachado`, `sem-sinal`).
- **Moradores:** `motorista` (do ônibus), `gari`, `pipoqueiro`, `medica`.

### Não usar sem pedido do usuário
Cenários laterais (`escola`, `padaria`, `cidade-rpg`, `vila`...), a avenida e o modo 3D. Eles existem, mas a regra
do canal é o diorama.

---

## 3. Objetos que contam história

| Objeto | Estados | Para quê |
|---|---|---|
| `relogio-praca` 🧪 (v2: base de pedra, coluna com anéis, 2 mostradores, cúpula) | h3, h6, h9, h12, h11-55 | hora marcada, meia-noite, relógio andando para trás (troque os estados em sequência) |
| `palanque-iso` / `bandeirinhas-iso` ✅ | — | festa, discurso, eleição (já vêm na `praca-decorada`) |
| `barraca-pipoca`/`-doces`/`-jogos` ✅, `-sorvete`/`-frutas`/`-verduras`/`-flores` 🧪 | parado, acesa, fechada | feira, festa |
| `fonte-iso` ✅ | cheia, seca | calor, seca, inundação |
| `arvore-iso`, `canteiro-iso` ✅ | verde/seca, verde/murcho | estações, calor |
| `tempo-pessoal` ✅ | sol... chuva, nada | "tempo em cima da cabeça" (vídeo do tempo) |
| `estrela-mentira` / `estrela-gigante` ✅ | parado, olho, olho-aberto | céu que observa (vídeo das estrelas) |
| `guarda-chuva` ✅ | aberto, fechando, fechado | segredo do policial; chuva (`"sobre"`) |
| `caderno` / `pagina-caderno` 🧪 | fechado/aberto | diário, lista de nomes |
| `carta`, `bilhete`, `mapa`, `cadeado`, `cadeado-numero`, `cartaz-procura-se` 🧪 | vários | mistério e pistas (close com `"tela": true`) |
| `sanduiche` ✅, `pao` 🧪, `sorvete` ✅ (derretendo) | — | comida, oferta, suborno |
| `saquinho-pimenta` 🧪 | fechado, aberto | provocar espirros |
| `alma` 🧪 | azul, rosa | almas trocando de corpo (sobem das cabeças, cruzam e entram no outro) |
| `banco-frente` 🧪 | — | banco de praça visto de frente para cenas sentadas |
| `peruca` ✅, `fogo-chapeu` ✅, `bloco-multas` ✅, `placa-lei` ✅ | — | piadas com autoridades |
| `viatura-iso` 🧪 | parado, sirene | polícia na rua |
| `fogueira-junina`, `ponte-madeira`, `cerca-madeira`, `caixote`, `mato` 🧪 | — | festa junina, campo, beco |

Números sobre a cabeça: campo `"numero"` no personagem e ação `numero` para trocar (sempre no estilo placa).

---

## 4. Efeitos que dão vida (ações e climas)

- **Expressão no rosto** 🧪 (moradores, Bia e cachorros de estimação; o cão policial não tem): ação `expressao` (`rosto`: feliz, rindo, triste,
  chorando, bravo, surpreso, assustado, envergonhado, pensativo, `macabro` 🧪 — dentes cerrados de ponta a ponta e olhos pretos com pupila branca, para terror; variações `macabro-fechado` e `macabro-boca`) ou fixa com `"pose": "rosto-triste"`. O ícone de `emocao` já muda o
  rosto junto (`!` surpreso, `?` pensativo, coração feliz, gota chorando, raiva bravo, `...` envergonhado). Guardiões e fantasmas usam o
  estado mais parecido. Só vale parado e sem `pose`. Triste = olho molhado (sem lágrima); choro forte = `chorando`. Usar em todo vídeo (ver CLAUDE.md, "Expressões no rosto").
- **Ícone de emoção:** `emocao` com `!`, `?`, `coracao`, `...` e `zzz` (✅); `lampada`, `gota`, `raiva` e `nota` (🧪). Balão: `falar`. Pensamento: `pensar` 🧪.
- **Corpo:** `andar`, `correr`, `pular`, `virar`, `sentar`/`levantar`, `espirrar` 🧪 ("ah... ah..." + ATCHIM com gotinhas).
- **Aparecer e sumir:** `aparecer`/`sumir` (com fumaça), `desaparecer` 🧪 (some devagar, ótimo no terror), `coletar`.
- **Trocar estado de objeto:** `trocar` (`"estado"`); estado inicial com `"pose"`. Preso em alguém: `"sobre"`.
- **Flash colorido:** `flash` com `"cor": "#5aa0f0"` tinge a tela daquela cor e volta (ex.: "a floresta ficou azul"; `durF` longo = o tom dura a frase).
- **Impacto:** `flash`, `tremer`, `explosao`, `piscar` (vermelho: dano ou vergonha), `magia` (faíscas: transformação ou troca), `fogos` 🧪.
- **Atenção:** `destaque` 🧪 (lupa), `contador` 🧪, `placar` 🧪 (votação), `continua` 🧪.
- **Climas:** `chuva`, `neve`, `vagalumes`, `brasas`, `poeira`, `folhas`, `calor`, `neblina` 🧪 (terror), `polen` 🧪 (primavera), `vento` 🧪
  (rajadas atravessando a tela).
- **Hora do dia (rua/praça):** `"periodo": "dia"`, `"tarde"` 🧪 (pôr do sol: luz alaranjada, céu laranja e rosa — final sem escuro) ou `"noite"`.
- **Vida na rua** 🧪: `"vidaNaRua": true` (gente passando no fundo e pombos voando) — ver "Cidade — melhorias".
- **Chão da rua** (`"rua": { "chao": ... }`): `terra`, `blocos`/`baseplate` (jogo de blocos), `pedras` (medieval), `patio` (pátio da escola);
  `"soPedidos": true` = só os prédios da lista (fábrica, castelo, casas).
- **Paletas por cena:** `sepia` (flashback), `fria`/`noir` (terror, virada), `quente` (calor).

**Combinações que funcionam:**
- Terror: `-noite` + `neblina` + `fria` + `vulto`/sombras + `desaparecer` + som `suspense`/`sombra-surge`.
- Alguém "engolido pela escuridão" (rua/praça): ação `sombra` com `origem` nos pés da pessoa e `raio` pequeno (~2–3,6) e, quando
  ela já estiver coberta, `desaparecer`. Só a última `sombra` iniciada aparece: para várias pessoas, uma depois da outra.
- Quem segue algo andando (sombra, cortejo): andar até o fim da fala; se parar antes, o personagem vira de frente para a câmera.
- Comédia: balão curto + `pular` + `!`/`?` + `tremer` leve + som `sucesso`/`puf`.
- Revelação: `flash` + som `revelar` + `emocao !`.

---

## 5. Sons úteis

Gerados automaticamente, sem arquivo: `passo`, `pulo`, `puf`, `explosao`, `tremor`, `surpresa`, `duvida`, `amor`, `dano`, `magia`,
`revelar`, `porta`, `sucesso`, `erro`, `sino`. Protótipos 🧪: `sino-relogio`, `papel`, `cadeado`, `sininho`, `miau`,
`trovao`, `suspense`, `fantasma`, `sombra`, `sombra-surge`/`-some`, `espirro`, `espirro-inspira`, `fogos`, `fogos-sobe`, `miau-monstro`;
brinquedos: `corda` (catraca de dar corda), `servo` (junta mexendo), `caixinha-musica` (desafina no fim), `falha-eletrica`; jogo de blocos:
`entrar-jogo`, `pulo-bloco`, `ai` (o "ui!" de quando o avatar cai), `chat`, `bug-jogo`.
Um arquivo com o mesmo nome em `biblioteca/sfx/` (ex.: `espirro.mp3` do ElevenLabs) substitui o som gerado.

---

**Passos de multidão:** com muita gente andando junto, só 3 pessoas fazem som de passo (ritmos diferentes, volume menor);
sombras andando (`sombraPessoa`) não fazem barulho. Para calar alguém: `"som": null` na ação `andar`.

**Caixotes do mercado** (desenho fixo da rua, não é elemento): x ≈ 13.3–14.4 na calçada do mercado. Ninguém para em x 13–14.6 ali.

**Gatos:** `gato-chapeu` (fofo; estado `monstro` mostra olhos vermelhos e presas, `pior` = 3 olhos e bocarra com baba — relance de terror: `trocar` para `monstro` e de volta para `parado`; funciona andando também) e `gato-monstro` (sempre monstruoso, também andando; tem `pior`). **Truque:** o gato fica monstro enquanto a pessoa que ele segue está de costas e volta ao normal quando ela vira de frente. Sons: `miau` (fofo) e `miau-monstro` (começa fofo e vira rosnado; usar só na transformação). Usados no `nesse-mundo-gatos`.

## Erros comuns (ver "Regras de cena" no `CLAUDE.md`)
Rode `npm run conferir -- <projeto>` antes de entregar: acusa gente coberta por árvore/objeto, gente que falta num `"momento"` (mesmo instante da
história; `"saiDeCena"` libera quem sai pela história), o mesmo sprite fazendo dois personagens, gente fora do cômodo, quem para de andar antes do fim da fala e `[altura]`: em `andar`/`mover`,
`"para": [x, y]` muda a ALTURA (a pessoa sai flutuando); a profundidade `z` não anda — para mudar de faixa, use outra cena ou outro `z` fixo.

**Figurantes (`"figurante": true` no elemento):** gente ou bicho de fundo, sem nome e sem papel na história (multidão, cães da
praça). Podem repetir sprite e a conferência não cobra o "mesmo sprite". Regras:
- Quem tem nome, fala algo importante ou é "o de alguém" (o cão da moça do caixa, a mãe do Caio) **não** é figurante: sprite próprio.
- Quem aparece ao lado de um dono já mostrado é o **mesmo personagem**: mesmo `id` e mesmo sprite da primeira aparição.
- Figurante pode reagir (ícone, balão curto de multidão), mas não pode ter o mesmo sprite de um personagem com nome na mesma cena.

## Como manter este guia
- Asset novo aprovado ou criado: acrescente uma linha aqui (o que é, quando usar, como posicionar) e rode `npm run catalogo`.
- Personagem ganhou nome ou papel fixo: atualize o "Elenco fixo".
- Asset que o usuário não gostou: marque "não usar" (ex.: `casa-corte`, cômodos de caixinha, modo "mundo sombrio").
- Recusados e apagados (não recriar sem pedido): animatrônicos mascotes de loja (pão, sapo, vaca, bailarina), torres de castelo na fábrica,
  monstros de sombra 2D novos e as tentativas 3D `toon`/`pixel`/`silhueta` (os monstros de sombra voltaram a ser só os antigos).
