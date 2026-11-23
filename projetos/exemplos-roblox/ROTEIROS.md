# Exemplos de roteiro — tema Roblox (Shorts, diorama, vertical)

Dois roteiros de exemplo (texto + plano de cena), ainda **sem `roteiro.json`**. Duração estimada a ~0,065 s/letra
(no ElevenLabs a 1,1 fica ~10% mais curto).

**Cuidado com a marca:** "Roblox" só aparece **falado** (narração/título). Na tela **nada do jogo**: sem logo, sem avatar
quadrado, sem tela copiada, sem o som "oof". O jogo fica "fora de quadro"; o que se vê é Vila Serena (regra 6).

**Asset que falta (pedir aprovação antes de criar):** `celular` — celular pequeno na mão (`"sobre"`), estados
`apagado`/`jogando`, e um close `celular-tela` (`"tela": true`, estados `lista-amigos`/`neto-online`, desenho próprio,
sem interface do Roblox). Reuso: qualquer vídeo com mensagem, foto, notícia, ligação. **Substituto até lá:** sem celular
na mão (roteiro A) e `carta` aberta no close (roteiro B).

---

## A) Nesse Mundo curto — "O que você faz no jogo, seu corpo faz" (terror leve, de dia, ~34 s)

Premissa nova (não está na lista do CLAUDE.md). Crença como ação: **"É só apertar o botão, e o corpo obedece."** →
virada inverte: **"Era o jogo que jogava com eles."** Pista plantada: o seu Tonho pula *antes* de apertar (cena 4).

| # | Início | Narração | Cena (diorama, vertical) | Movimento / regra na tela |
|---|---|---|---|---|
| 1 | 0,0 | Nesse mundo, o que você faz no Roblox, seu corpo faz de verdade. | `rua-comercial`, padaria (câm. x 0.6, z 2.2, y 2.4). Seu Tonho x 0.6 z 5.0 | **0,2 s:** seu Tonho dá pulo duplo (`pular` ×2) + `tremer` leve; aluno passando para, `!` surpreso |
| 2 | 3,7 | Por isso, a cidade joga pulando, correndo e dançando na rua. | Calçada da frente (z 0.6), 4 moradores em faixas de z diferentes | Um pula, um corre em zigue-zague (`correr` ida e volta), dois "dançam" (`pular` curtos defasados); rostos `rindo` |
| 3 | 7,0 | É só apertar o botão, e o corpo obedece. | Close (`zoom` 2) aluna x ~3 | Aluna para, olha pra baixo (pose parado) e `pular` exatamente no fim de "obedece" + som `puf` |
| 4 | 9,1 | Só o seu Tonho, às vezes, pulava antes de apertar. | Padaria de novo, seu Tonho | Ele `pular` sozinho, depois `?` pensativo — **pista** |
| 5 | 11,8 | Mas a Bia nunca jogou. Chamam ela de travada. | Calçada da escola (câm. x 4.6). Nina, aluno, menino do topete pulando juntos; Bia x 4.4 z 5.0 parada | Contraste sem som: todos pulam, ela não. Nina balão **"Travada!"** (único balão); Bia `envergonhado` |
| 6 | 14,2 | Até que, num sábado, a cidade inteira entrou no mesmo jogo. | `praca` (z -8.5), `remover` arvore3/arvore4 | **36% do vídeo.** 6 pessoas chegam andando e começam a pular **no mesmo tempo** (`flash` curto em "mesmo jogo") |
| 7 | 17,3 | Na praça, todo mundo pulava junto. Sorrindo. Sem piscar. | Praça, câm. mais aberta, 8 pessoas | **Pico de movimento no meio.** Pulos sincronizados; `"pose": "rosto-feliz"` fixo (sorriso que assusta) |
| 8 | 20,5 | Ninguém estava segurando o celular. | Close numa fileira (`zoom` 2) | Pulam com braços vazios; som `suspense` |
| 9 | 22,5 | Primeiro a praça. Depois a rua. Depois a escola. | 3 cortes rápidos (ou 1 cena: rua comercial cheia) | Escalada: 8 → rua cheia pulando junto; `tremer` em "escola" |
| 10 | 25,1 | A Bia puxou o seu Tonho pelo braço. Ele não parava. | Praça; Bia corre até seu Tonho (faixa de z própria) | Bia **escolhe agir**: `correr` até ele; ele continua pulando, sorrindo |
| 11 | 27,7 | Ela olhou para a praça e congelou. | Close Bia (`zoom` 2) | Única cena parada (reação de propósito, já em 80%): `assustado` + `!` |
| 12 | 29,6 | Ninguém jogava o jogo. | Praça inteira pulando | `flash` + som `revelar` |
| 13 | 30,8 | Era o jogo que jogava com eles. | Mesma, câm. mais alta (y 3.5) | Todos param no mesmo frame e viram de frente juntos (`virar`) — arrepio |
| 14 | 32,4 | E o pé da Bia, sozinho, deu o primeiro pulinho. | Close Bia, rosto `assustado` | Bia dá um `pular` minúsculo (altura baixa) no fim; corte seco. **Regra ainda viva na última imagem** |

**Checklist sombras:** dia do começo ao fim ✅ · elemento da regra (corpos pulando sozinhos) se mexe em 13/14 cenas ✅ ·
1ª frase com "você" e algo que o público conhece ✅ · entende numa imagem (gente pulando sem motivo) ✅ · gancho antes de 0,6 s ✅ ·
diferença da Bia sem som (a única parada) ✅ · escalada 1 → 4 → 8 → rua → cidade ✅ · "Até que" a 36% ✅ · 2 frases curtíssimas na
virada ✅ · 1 balão ✅ · detalhe feliz sinistro ("sorrindo, sem piscar") ✅ · protagonista age (puxa o seu Tonho) ✅ · última imagem
com a regra agindo na Bia ✅ (o que a salvava — nunca ter jogado — acaba; termina inquietante, dá vontade de comentar).

---

## B) Livre — "O padeiro que virou o melhor jogador" (comédia → emocional, de dia, ~43 s)

Mistério aberto na 1ª frase ("ninguém sabe por quê") e só respondido aos 35 s. Lista de 3 cômica no começo (1º, 2º, 3º dia),
loop aberto no meio ("o que ninguém sabia"), virada emocional, callback leve no fim.

| # | Início | Narração | Cena (diorama, vertical) | Movimento / rosto |
|---|---|---|---|---|
| 1 | 0,0 | O padeiro mais velho da cidade virou o melhor jogador de Roblox. E ninguém sabe por quê. | Padaria. Seu Tonho x 0.6 z 5.0; 3 crianças | **0,2 s:** seu Tonho pula comemorando (`pular` + `fogos` pequenos dourados); crianças `surpreso` |
| 2 | 4,7 | Tudo começou numa terça, quando ele pediu para a Bia ensinar. | Calçada da padaria | Seu Tonho anda até a Bia; ela `feliz` + `coracao` |
| 3 | 8,0 | No primeiro dia, ele caiu do mesmo buraco quarenta e duas vezes. | Padaria, close | `contador` 1 → 42 subindo rápido; seu Tonho `piscar` vermelho a cada "queda"; termina `chorando` (cômico) |
| 4 | 11,4 | No segundo, queimou trinta pães. | Frente da padaria | `explosao` pequena + `poeira`; `pao` pulando para fora; seu Tonho `envergonhado` |
| 5 | 13,3 | No terceiro, o prefeito saiu da padaria sem pão, sem troco e sem peruca. | Prefeito sai andando da porta | Em "peruca": `peruca` voa (troca para `prefeito-careca`), `tremer`; prefeito `bravo` + `raiva` — **imagem cômica** |
| 6 | 17,1 | Em uma semana, ele já ganhava de todo mundo da escola. | Calçada da escola: Nina, menino do topete, aluno | Crianças `pular` de raiva, seu Tonho `rindo` passando |
| 7 | 20,0 | A Nina exigiu saber o segredo. | Close Nina × seu Tonho | Nina `bravo`; seu Tonho balão **"Treino. E pão."** (único balão, a piada) |
| 8 | 21,6 | Mas o que ninguém sabia é que ele entrava sempre no mesmo servidor. | Padaria; Bia observando | **Loop aberto (50%)**; Bia `?` pensativa; som `suspense` leve |
| 9 | 25,2 | E todo dia, às seis em ponto, fechava a padaria correndo. | Rua comercial | Seu Tonho `correr` pela calçada da frente (atravessa a tela); Bia vai atrás andando |
| 10 | 28,2 | A Bia espiou o celular por cima do ombro dele. | Close (`zoom` 2), Bia atrás do seu Tonho (ao lado, visível) | Bia chega na ponta dos pés (`andar` curto + `pular` baixo) |
| 11 | 30,6 | Na lista de amigos, só tinha um nome. O do neto. | `"tela": true` (substituto: `carta` aberta; ideal: `celular-tela`) | `destaque` no nome; som `papel` |
| 12 | 33,1 | O neto mora longe. E só conversa dentro do jogo. | Seu Tonho sozinho na calçada | `"pose": "rosto-triste"`; Bia ao fundo `triste` |
| 13 | 35,6 | O seu Tonho não queria ganhar. | Close seu Tonho | `triste` → som `revelar` |
| 14 | 37,2 | Ele treinava para conseguir acompanhar o neto. | Bia anda até ele | Bia `coracao`; seu Tonho `feliz` (gesto, sem discurso) |
| 15 | 39,8 | No sábado, o neto apareceu na padaria. E pediu revanche. | Padaria; neto = `menino-coroa` 🧪 chega andando | Neto aponta (`!`), seu Tonho `rindo` + `pular` — callback do "melhor jogador"; fim leve |

**Retenção:** gancho com movimento e mistério antes de 0,6 s ✅ · uma imagem cômica a cada ~4–5 s nas cenas 3–7 ✅ · movimento
em 13/15 cenas ✅ · loop aberto no meio ✅ · 1 balão ✅ · tudo de dia, lugares conhecidos (padaria, escola, rua) ✅ ·
objeto que volta 3× (o celular: cena 1 comemorando, cena 10–11 revelação, cena 15 revanche) ✅ — depende do asset `celular`.

---

**Assets usados:** aprovados — `menina-capa`, `padeiro`, `prefeito`/`prefeito-careca`, `peruca`, `aluno`, `aluna`, `rua-comercial`,
`praca`. Protótipos 🧪 — `nina`, `menino-topete`, `menino-coroa`, `pao`, `carta`, ações `expressao`, `contador`, `destaque`, `fogos`.

**Próximo passo (se aprovar):** montar `projetos/nesse-mundo-roblox` e `projetos/padeiro-roblox` com `roteiro.json`,
`ROTEIRO.md`, `PUBLICACAO.md`, `npm run narracao` e `npm run conferir` sem avisos.
