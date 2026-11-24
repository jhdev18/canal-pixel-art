# Narração — Nessa cidade, seu brinquedo cresce toda vez que você brinca (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- nesse-mundo-brinquedos --verificar`.

São **15 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, seu brinquedo cresce toda vez que você brinca. |
| 2 | Por isso, toda criança anda de mãos dadas com o seu. |
| 3 | A boneca da Nina já passou da altura da professora. |
| 4 | Só o soldadinho da Bia é pequeno. Ela quase não brinca. |
| 5 | No recreio, a turma ri do brinquedo de bebê. |
| 6 | Até que, num sábado, os brinquedos deram corda sozinhos. |
| 7 | E chamaram as crianças para brincar. |
| 8 | As crianças riam tanto que nem sentiram o abraço. |
| 9 | O soldadinho da Bia puxou a mão dela para longe. Com força. |
| 10 | A caixa-surpresa chegou e chamou a Bia para brincar. |
| 11 | E a Bia, pela primeira vez, disse não. |
| 12 | Os brinquedos pararam. Cada um carregava a sua criança. |
| 13 | Não era você que brincava com o brinquedo. |
| 14 | Era ele que brincava com você. |
| 15 | E o soldadinho da Bia, colado no pé dela, ainda dava corda sozinho. |

Depois rode `npm run rascunho -- nesse-mundo-brinquedos`: o terminal mostra em quantos trechos o áudio foi cortado.
