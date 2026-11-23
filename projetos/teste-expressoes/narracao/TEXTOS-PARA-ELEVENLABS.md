# Narração — Teste — expressões no rosto (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- teste-expressoes --verificar`.

São **6 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | A Bia encontrou um pão quentinho na padaria do seu Tonho. |
| 2 | Mas o pombo roubou o pão bem na frente dela. |
| 3 | Na escola, a professora perguntou quem tinha feito a lição. |
| 4 | A Nina fingiu que fez. O aluno ficou com vergonha. E a Bia pensou numa desculpa. |
| 5 | Depois da aula, todo mundo correu para a praça. |
| 6 | Até que o céu escureceu, e a Bia ficou triste de verdade. |

Depois rode `npm run rascunho -- teste-expressoes`: o terminal mostra em quantos trechos o áudio foi cortado.
