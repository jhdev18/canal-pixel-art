# Narração — Nessa cidade, toda mentira vira estrela (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac). Sugestão: velocidade ~1,1 no ElevenLabs.

O gerador corta o áudio nas pausas: deixe uma pausa clara (meio segundo ou mais) entre as falas de cada cena.
O texto já vem com `<break time="1.0s" />` entre as cenas — no ElevenLabs essa marcação cria a pausa (se a voz
ignorar a marcação, apague-a e deixe só a linha em branco, ou gere com reticências no fim de cada fala).

São **13 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, cada mentira que alguém conta acende uma estrela nova no céu. |
| 2 | Por isso, Vila Serena tem o céu mais bonito do mundo. |
| 3 | Só o prefeito já acendeu metade dele. E elas piscam muito. |
| 4 | Mas o Caio nunca contou uma mentira. Nem uma. |
| 5 | Na escola, chamavam ele de apagado. O garoto sem estrela. |
| 6 | Até que, na Noite das Estrelas, a cidade subiu o morro. |
| 7 | E o prefeito discursou: aqui, nunca acontece nada de ruim. |
| 8 | Na hora, acendeu a maior estrela já vista. |
| 9 | Todos aplaudiram. Menos o Caio, que congelou. |
| 10 | Porque a estrela piscou. Depois, devagar, ela abriu. |
| 11 | E o céu abriu junto. Mil olhos, cada um sobre quem mentiu. |
| 12 | Só em cima do Caio, o céu continuou escuro. |
| 13 | A cidade olhou para o céu. E o céu, pela primeira vez, olhou de volta. |

Depois rode `npm run rascunho -- nesse-mundo-estrelas`: o terminal mostra em quantos trechos o áudio foi cortado.
