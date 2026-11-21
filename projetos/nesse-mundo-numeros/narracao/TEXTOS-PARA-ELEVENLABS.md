# Narração — Nessa cidade, todo mundo tem um número na cabeça (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- nesse-mundo-numeros --verificar`.

São **12 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, todo mundo tem um número em cima da cabeça. |
| 2 | A cidade acredita que é o número de amigos de cada um. |
| 3 | Por isso, o prefeito Arlindo, com três mil, é o mais querido da cidade. |
| 4 | Em todo comício, ele faz a praça inteira gritar o nome dele. |
| 5 | Mas a rival da Bia sempre teve o número zero. |
| 6 | Ninguém sabe o nome dela. Na escola, ela é só a rival. |
| 7 | Até que, numa noite de neblina, uma voz começou a chamar nomes pela rua. |
| 8 | Primeiro, o maior número: Arlindo. E o prefeito abriu a porta, sorrindo. |
| 9 | Depois o padeiro, a professora, a rua inteira. Ninguém resiste ao próprio nome. |
| 10 | Ela congelou. O número não contava amigos. Contava quantas vezes disseram seu nome. |
| 11 | E o dela, ninguém nunca tinha dito. |
| 12 | Até que, do lado de fora da janela, a voz sussurrou: Nina. |

Depois rode `npm run rascunho -- nesse-mundo-numeros`: o terminal mostra em quantos trechos o áudio foi cortado.
