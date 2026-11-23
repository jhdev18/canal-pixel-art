# Narração — Nessa cidade, a comida que você deixa no prato foge (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- nesse-mundo-comida --verificar`.

São **12 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, a comida que você deixa no prato sai correndo. |
| 2 | Por isso, ninguém deixa resto. A merenda da escola dura quatro segundos. |
| 3 | E o seu Tonho tranca os pães com cadeado. |
| 4 | Mas a Bia come devagarinho. E o lanche dela nunca fugiu. |
| 5 | Até que, num domingo, o seu Tonho assou o maior pão da história. |
| 6 | E o pão pulou da vitrine e saiu quicando rua abaixo. |
| 7 | Primeiro o padeiro. Depois a professora. Em um minuto, a cidade inteira. |
| 8 | E quanto mais gente corria, mais rápido o pão fugia. |
| 9 | Só a Bia não correu. Ela parou no meio da praça e abriu a mão. |
| 10 | E o pão gigante freou, deu meia-volta e deitou do lado dela. |
| 11 | A comida nunca fugiu do prato. Fugia da pressa. |
| 12 | Hoje, a cidade inteira almoça devagar. E a merenda dura quatro horas. |

Depois rode `npm run rascunho -- nesse-mundo-comida`: o terminal mostra em quantos trechos o áudio foi cortado.
