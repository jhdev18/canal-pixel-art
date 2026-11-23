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
| Menino do topete | `menino-topete` | 🧪 | Protagonista masculino (nome a definir), colega de turma da Bia e da Nina; topete e cachecol azul |
| Aluno / aluna | `aluno`, `aluna` | ✅ | Colegas de escola (crianças com mochila). Servem de protagonista ("o Caio") ou de turma. **Não use o mesmo sprite para dois personagens diferentes no mesmo vídeo** |
| Caixa | `caixa` | ✅ | Moça do mercado, boné e avental verdes |
| Robô-semáforo | `robo-semaforo` | ✅ | Robô de trânsito detalhado (ainda pouco usado) |

**Outros moradores 🧪:** `vovo` (vovó de xale roxo; banco da praça), `carteiro`, `sorveteiro` (com `carrinho-sorvete`),
`menino-pijama` (cenas à noite), `menino-coroa` (coroa e capa), `mae`, `mae-avental`, `menino-topete` (família da casa), `cao-policial` (cão em pé,
de uniforme, com poses; v2 com focinho maior, manchas nos olhos, patas e rabo que abana). Todos os moradores andam, correm, sentam, ficam de costas e espirram.

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
- `loja-brinquedos-diorama`: a loja por dentro (parede listrada rosa, 2 prateleiras cheias de brinquedos, balcão com caixa
  registradora, presentes, baú). Brinquedos em pé na frente das prateleiras (x -6.9, -3.4, 0; z ~2.6); pessoas z 0–1.6.
- `fabrica-brinquedos`: a **fábrica** sozinha no campo, na estrada de terra = **castelo de brinquedo envelhecido** (pedra rosa-lilás
  desbotada, duas torres com telhado cônico azul e telhas faltando, ameias quebradas, bandeiras rasgadas, portão em arco, janelas em arco
  — uma tampada com tábuas —, musgo, rachaduras, faixa "FÁBRICA DE BRINQUEDOS"; pedido do usuário); centro x ≈ 0.6; câmera alta (y 3.6); pessoas na estrada z ~1.4–4.4 ou na frente do portão z ~5.0; câmera `{ "x": 0.6, "z": 2.2, "y": 2.8 }`.
- `fabrica-brinquedos-diorama`: a fábrica por dentro (máquina com luzes à esquerda, esteira com cabeças e corpos de brinquedo no meio,
  prateleira de cabeças de boneca, caixotes de peças). Brinquedos saem da máquina em x ~-6.2, z ~1.0 e andam para a direita.
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
  chorando, bravo, surpreso, assustado, envergonhado, pensativo) ou fixa com `"pose": "rosto-triste"`. O ícone de `emocao` já muda o
  rosto junto (`!` surpreso, `?` pensativo, coração feliz, gota chorando, raiva bravo, `...` envergonhado). Guardiões e fantasmas usam o
  estado mais parecido. Só vale parado e sem `pose`. Triste = olho molhado (sem lágrima); choro forte = `chorando`. Usar em todo vídeo (ver CLAUDE.md, "Expressões no rosto").
- **Ícone de emoção:** `emocao` com `!`, `?`, `coracao`, `...` e `zzz` (✅); `lampada`, `gota`, `raiva` e `nota` (🧪). Balão: `falar`. Pensamento: `pensar` 🧪.
- **Corpo:** `andar`, `correr`, `pular`, `virar`, `sentar`/`levantar`, `espirrar` 🧪 ("ah... ah..." + ATCHIM com gotinhas).
- **Aparecer e sumir:** `aparecer`/`sumir` (com fumaça), `desaparecer` 🧪 (some devagar, ótimo no terror), `coletar`.
- **Trocar estado de objeto:** `trocar` (`"estado"`); estado inicial com `"pose"`. Preso em alguém: `"sobre"`.
- **Impacto:** `flash`, `tremer`, `explosao`, `piscar` (vermelho: dano ou vergonha), `magia` (faíscas: transformação ou troca), `fogos` 🧪.
- **Atenção:** `destaque` 🧪 (lupa), `contador` 🧪, `placar` 🧪 (votação), `continua` 🧪.
- **Climas:** `chuva`, `neve`, `vagalumes`, `brasas`, `poeira`, `folhas`, `calor`, `neblina` 🧪 (terror), `polen` 🧪 (primavera).
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
`trovao`, `suspense`, `fantasma`, `sombra`, `sombra-surge`/`-some`, `espirro`, `espirro-inspira`, `fogos`, `fogos-sobe`.
Um arquivo com o mesmo nome em `biblioteca/sfx/` (ex.: `espirro.mp3` do ElevenLabs) substitui o som gerado.

---

**Passos de multidão:** com muita gente andando junto, só 3 pessoas fazem som de passo (ritmos diferentes, volume menor);
sombras andando (`sombraPessoa`) não fazem barulho. Para calar alguém: `"som": null` na ação `andar`.

**Caixotes do mercado** (desenho fixo da rua, não é elemento): x ≈ 13.3–14.4 na calçada do mercado. Ninguém para em x 13–14.6 ali.

**Gatos:** `gato-chapeu` (fofo; estado `monstro` mostra olhos vermelhos e presas, `pior` = 3 olhos e bocarra com baba — relance de terror: `trocar` para `monstro` e de volta para `parado`; funciona andando também) e `gato-monstro` (sempre monstruoso, também andando; tem `pior`). **Truque:** o gato fica monstro enquanto a pessoa que ele segue está de costas e volta ao normal quando ela vira de frente. Sons: `miau` (fofo) e `miau-monstro` (começa fofo e vira rosnado; usar só na transformação). Usados no `nesse-mundo-gatos`.

## Erros comuns (ver "Regras de cena" no `CLAUDE.md`)
Rode `npm run conferir -- <projeto>` antes de entregar: acusa gente coberta por árvore/objeto, gente que falta num `"momento"` (mesmo instante da
história; `"saiDeCena"` libera quem sai pela história), o mesmo sprite fazendo dois personagens, gente fora do cômodo e quem para de andar antes do fim da fala.

**Figurantes (`"figurante": true` no elemento):** gente ou bicho de fundo, sem nome e sem papel na história (multidão, cães da
praça). Podem repetir sprite e a conferência não cobra o "mesmo sprite". Regras:
- Quem tem nome, fala algo importante ou é "o de alguém" (o cão da moça do caixa, a mãe do Caio) **não** é figurante: sprite próprio.
- Quem aparece ao lado de um dono já mostrado é o **mesmo personagem**: mesmo `id` e mesmo sprite da primeira aparição.
- Figurante pode reagir (ícone, balão curto de multidão), mas não pode ter o mesmo sprite de um personagem com nome na mesma cena.

## Como manter este guia
- Asset novo aprovado ou criado: acrescente uma linha aqui (o que é, quando usar, como posicionar) e rode `npm run catalogo`.
- Personagem ganhou nome ou papel fixo: atualize o "Elenco fixo".
- Asset que o usuário não gostou: marque "não usar" (ex.: `casa-corte`, cômodos de caixinha, modo "mundo sombrio").
