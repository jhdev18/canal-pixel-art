# Narração — Nada acontece em Vila Serena (narrado por Bia (a protagonista))

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O gerador corta o áudio nas pausas: deixe uma pausa clara (meio segundo ou mais) entre as falas de cada cena.
O texto já vem com `<break time="1.0s" />` entre as cenas — no ElevenLabs essa marcação cria a pausa (se a voz
ignorar a marcação, apague-a e deixe só a linha em branco, ou gere com reticências no fim de cada fala).

São **9 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Oi, eu sou a Bia. E essa é Vila Serena... a cidade mais calma do mundo. |
| 2 | Aqui, a grande notícia do dia é o pão saindo do forno. |
| 3 | Até a polícia tem tempo de sobra. E o prefeito adora isso. |
| 4 | As crianças correm pra escola... e é isso. É sempre isso. |
| 5 | Sério... eu não aguento mais tanta calmaria. |
| 6 | Naquela tarde, eu fiz um pedido. |
| 7 | E naquela mesma noite... algo aconteceu. |
| 8 | Uma luz estranha piscou dentro da escola. Uma escola que devia estar vazia. |
| 9 | E agora? Eu vou lá ver o que é? Comenta 1 pra eu verificar, ou 2 pra eu ficar em casa. Você decide o próximo episódio! |

Depois rode `npm run rascunho -- episodio-01`: o terminal mostra em quantos trechos o áudio foi cortado.
