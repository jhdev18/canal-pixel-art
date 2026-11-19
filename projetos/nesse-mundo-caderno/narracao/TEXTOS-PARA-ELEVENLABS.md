# Narração — Nessa cidade, toda noite alguém some (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac). Sugestão: velocidade ~1,1 no ElevenLabs.

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- nesse-mundo-caderno --verificar`.

São **12 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, toda noite, alguém desaparece. |
| 2 | E de manhã, ninguém lembra que essa pessoa um dia existiu. |
| 3 | As casas ficam vazias, e a cidade acha que sempre foram assim. |
| 4 | Mas a Bia lembra. Ela é a única que lembra. |
| 5 | Toda noite, antes de dormir, ela escreve no caderno o nome de quem sumiu. |
| 6 | Na escola, a chamavam de louca. Ninguém nunca tinha ouvido aqueles nomes. |
| 7 | Até que, numa noite, o caderno chegou na última página. |
| 8 | Ela contou duzentos e doze nomes. E percebeu uma coisa. |
| 9 | Cada nome estava escrito na véspera do sumiço. Antes da pessoa sumir. |
| 10 | A Bia congelou. Ela não lembrava de ter escrito nenhum deles. |
| 11 | O caderno não guardava quem sumia. Ele escolhia. |
| 12 | E na última linha, com a letra dela, ainda molhada de tinta, estava escrito: Bia. |

Depois rode `npm run rascunho -- nesse-mundo-caderno`: o terminal mostra em quantos trechos o áudio foi cortado.
