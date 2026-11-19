# Narração — Nessa cidade, cada rua tem um monstro (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac). Sugestão: velocidade ~1,1 no ElevenLabs.

O gerador corta o áudio nas pausas: deixe uma pausa clara (meio segundo ou mais) entre as falas de cada cena.
O texto já vem com `<break time="1.0s" />` entre as cenas — no ElevenLabs essa marcação cria a pausa (se a voz
ignorar a marcação, apague-a e deixe só a linha em branco, ou gere com reticências no fim de cada fala).

São **9 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, cada rua tem um monstro. E criança não passa sozinha por nenhuma. |
| 2 | Porém, essa menina vai sozinha para a escola todo dia. E chega adiantada. |
| 3 | O primeiro monstro mora no bueiro e agarra o pé de quem pisa na tampa. |
| 4 | Porém, a Bia joga lá dentro o sanduíche de sardinha da merenda. Ele passa a semana enjoado. |
| 5 | O segundo é um cone que persegue quem anda rápido demais. |
| 6 | Porém, a Bia anda tão devagar, mas tão devagar, que o cone dorme esperando. |
| 7 | O terceiro é um pombo que conta o seu segredo para a cidade inteira. |
| 8 | Porém, a Bia conta para ele a lista de compras do seu Tonho. Inteira. Por quarenta minutos. |
| 9 | No dia seguinte, o pombo pediu demissão e se mudou de cidade. |

Depois rode `npm run rascunho -- nesse-mundo-monstros`: o terminal mostra em quantos trechos o áudio foi cortado.
