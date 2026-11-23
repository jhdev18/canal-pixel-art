# Narração — Teste — monstro do final dos guardiões (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- teste-monstro-guardioes --verificar`.

São **6 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Ela nunca foi o perigo. O perigo estava atrás dela. |
| 2 | Em pé, quietinho, há dez anos. E agora ele sabia que ela tinha visto. |
| 3 | Ela nunca foi o perigo. O perigo estava atrás dela. |
| 4 | Em pé, quietinho, há dez anos. E agora ele sabia que ela tinha visto. |
| 5 | Ela nunca foi o perigo. O perigo estava atrás dela. |
| 6 | Em pé, quietinho, há dez anos. E agora ele sabia que ela tinha visto. |

Depois rode `npm run rascunho -- teste-monstro-guardioes`: o terminal mostra em quantos trechos o áudio foi cortado.
