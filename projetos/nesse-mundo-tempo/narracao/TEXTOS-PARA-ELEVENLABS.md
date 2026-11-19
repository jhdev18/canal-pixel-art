# Narração — Nessa cidade, cada um carrega o próprio tempo (narrado por Narrador)

Gere **um único áudio** com todo o texto de `TEXTO-COMPLETO.txt` e salve nesta pasta como
**`narracao-completa.mp3`** (também serve .wav, .m4a, .ogg ou .flac). Sugestão: velocidade ~1,1 no ElevenLabs.

O gerador corta o áudio nas pausas: deixe uma pausa clara (meio segundo ou mais) entre as falas de cada cena.
O texto já vem com `<break time="1.0s" />` entre as cenas — no ElevenLabs essa marcação cria a pausa (se a voz
ignorar a marcação, apague-a e deixe só a linha em branco, ou gere com reticências no fim de cada fala).

São **33 falas** (uma por cena com narração):

| Cena | Fala |
|---|---|
| 1 | Nessa cidade, cada pessoa carrega o próprio tempo em cima da cabeça. |
| 2 | Funciona assim: quem está feliz anda com um solzinho. Quem está triste, com uma nuvem de chuva. |
| 3 | Por isso, ninguém consegue dizer que está bem. A garoa entrega na hora. |
| 4 | Casamento aqui termina com todo mundo bronzeado. Velório termina com a rua alagada. |
| 5 | E o prefeito criou a Lei do Céu Limpo: andar nublado em público dá multa. |
| 6 | O policial Ronaldo nunca mostrou o tempo dele. Anda com um guarda-chuva aberto há trinta anos. |
| 7 | E o único canteiro verde da cidade fica bem do lado da delegacia. |
| 8 | E tinha a Bia, de dez anos, uma menina com um sol bem pequenininho. |
| 9 | Toda noite, ela chorava escondida vendo desenho. E a planta do quarto dela era a mais verde da rua. |
| 10 | E contava histórias tão tristes que até o cachorro da praça chorava. Escondido, claro. |
| 11 | Até que chegou o Dia do Sol, a festa mais importante de Vila Serena. |
| 12 | O prefeito subiu no palanque e decretou: hoje, ninguém fica triste. |
| 13 | A praça inteira forçou o maior sorriso da vida. |
| 14 | Primeiro, o sorvete do mercado derreteu. Depois, a fonte da praça secou. |
| 15 | Em uma hora, o asfalto estava mole feito chiclete e o prefeito, vermelho feito camarão. |
| 16 | O seu Tonho sorria tanto que o chapéu de padeiro dele pegou fogo. |
| 17 | As flores da praça murcharam. Todas, menos as do canteiro da delegacia. |
| 18 | Então o seu Tonho caiu sentado, tonto de calor, no meio da praça. |
| 19 | A Bia não aguentou. O sol dela apagou, e uma nuvenzinha apareceu. |
| 20 | O policial Ronaldo já vinha correndo com o bloco de multas. |
| 21 | Mas, onde a garoa da Bia caía, a grama voltava a ficar verde. |
| 22 | E o seu Tonho abriu os olhos, molhadinho, e sorriu de verdade. |
| 23 | Foi aí que a Bia entendeu tudo: a tristeza não estragava o tempo. Era ela que regava a cidade. |
| 24 | E o policial Ronaldo não escondia mau humor. Toda noite, ele regava o canteiro chorando escondido. |
| 25 | A Bia subiu no palanque e pegou o microfone. |
| 26 | E contou a história mais triste que ela sabia: a do pãozinho que ninguém quis comprar. |
| 27 | O cachorro foi o primeiro a chorar. Depois, a professora. Depois, o seu Tonho. |
| 28 | Choveu na praça inteira. A fonte encheu, as flores levantaram e o asfalto esfriou. |
| 29 | Até o prefeito chorou, e a chuva dele levou a peruca para dentro da fonte. |
| 30 | Só faltava um. |
| 31 | O policial Ronaldo olhou para a Bia, respirou fundo e fechou o guarda-chuva. |
| 32 | Trinta anos de chuva caíram de uma vez só. |
| 33 | E a viatura saiu boiando por três quarteirões. |

Depois rode `npm run rascunho -- nesse-mundo-tempo`: o terminal mostra em quantos trechos o áudio foi cortado.
