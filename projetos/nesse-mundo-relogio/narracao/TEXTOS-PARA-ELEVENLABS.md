# Narração — Nessa cidade, o relógio da virada anda para trás (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac).

O texto vem com um parágrafo por cena. O gerador corta o áudio nas pausas naturais entre as frases (0,2 s ou mais)
e escolhe as que combinam com cada cena; confira com `npm run narracao -- nesse-mundo-relogio --verificar`.

São **12 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, na virada do ano, o relógio da praça anda para trás. |
| 2 | E quem estiver na praça fica um ano mais novo. |
| 3 | Por isso, a festa vive lotada. O prefeito tem noventa anos e cara de quarenta. |
| 4 | Mas a vovó da Bia nunca foi na festa. Nem uma vez. |
| 5 | Ela é a mais velha da cidade, e as crianças riem das rugas dela. |
| 6 | Até que, nesse ano, a Bia puxou a vovó pela mão até a festa. |
| 7 | Mas, na beirada da praça, a vovó parou. E não quis entrar. |
| 8 | O relógio bateu meia-noite, e os ponteiros giraram para trás. |
| 9 | A cidade inteira ficou mais nova. E a vovó ganhou mais uma ruga. |
| 10 | Foi aí que a Bia entendeu: o ano que a cidade perde, alguém leva. |
| 11 | A vovó sempre ficou de fora de propósito. Há cento e oitenta anos. |
| 12 | E, nesse ano, pela primeira vez, ela não ficou sozinha na calçada. |

Depois rode `npm run rascunho -- nesse-mundo-relogio`: o terminal mostra em quantos trechos o áudio foi cortado.
