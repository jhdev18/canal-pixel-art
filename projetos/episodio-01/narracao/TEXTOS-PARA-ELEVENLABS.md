# Narração — Nada acontece em Vila Serena (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- episodio-01 --verificar`.

São **9 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Esta é a Bia. E esta é Vila Serena... a cidade mais calma do mundo. |
| 2 | Em Vila Serena, a grande notícia do dia era o pão saindo do forno. |
| 3 | Até a polícia tinha tempo de sobra. E o prefeito adorava isso. |
| 4 | As crianças corriam para a escola... e era só isso. Era sempre isso. |
| 5 | A Bia já não aguentava mais tanta calmaria. |
| 6 | Naquela tarde, ela fez um pedido. |
| 7 | E naquela mesma noite... algo aconteceu. |
| 8 | Uma luz estranha piscou dentro da escola. Uma escola que deveria estar vazia. |
| 9 | E agora? A Bia deve ir verificar? Comente 1 para ela verificar, ou 2 para ela ficar em casa. Você decide o próximo episódio! |

Depois rode `npm run rascunho -- episodio-01`: o terminal mostra em quantos trechos o áudio foi cortado.
