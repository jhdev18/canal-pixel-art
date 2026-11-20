# Canal Pixel Art — gerador de vídeos

Gera vídeos em **pixel art** a partir de um roteiro em JSON, usando **Three.js** para a cena
(câmera 3D com paralaxe, luzes, partículas) e renderizando **localmente na sua placa de vídeo**
(GTX 1050 Ti):

- **Cena 3D / WebGL** → roda no Chrome ou Edge com aceleração da GPU (ANGLE/Direct3D 11).
- **Codificação do vídeo** → FFmpeg com **NVENC** (o codificador H.264 da placa NVIDIA).
- **Áudio** → a sua narração do **ElevenLabs** + efeitos sonoros 8-bit gerados automaticamente.
  **Sem música.**

O fluxo tem duas etapas:

| Etapa | Comando | O que sai |
|---|---|---|
| 1. Rascunho | `npm run rascunho -- meu-video` | `rascunho.mp4` (960×540, 15 fps, só narração, marca d'água com cena e tempo) + `storyboard.png` (uma miniatura por cena) |
| 2. Final | `npm run final -- meu-video` | **duas versões**: `final.mp4` (1920×1080, vídeo longo) e `final-shorts.mp4` (1080×1920, Shorts) — 30 fps, efeitos visuais + efeitos sonoros + ambiente + narração, áudio normalizado para -14 LUFS |

---

## Instalação (Windows)

1. **Node.js 18+**: https://nodejs.org (versão LTS).
2. **FFmpeg com NVENC** (a build da gyan.dev inclui):
   ```bash
   winget install Gyan.FFmpeg
   ```
   Feche e reabra o terminal depois.
3. **Driver NVIDIA atualizado** (GeForce Experience ou nvidia.com).
4. **Google Chrome** ou **Microsoft Edge** (o Edge já vem no Windows).
5. No diretório do projeto:
   ```bash
   npm install
   ```
6. Verifique se a GPU está sendo usada:
   ```bash
   npm run gpu
   ```
   O esperado é algo como `WebGL: ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Ti ...) ✔ GPU`
   e `Codificador de vídeo: h264_nvenc ✔`.

> **Notebook com duas placas de vídeo?** Em *Configurações > Sistema > Tela > Gráficos*, adicione
> o Chrome/Edge e escolha **Alto desempenho**. Se o WebGL continuar na CPU, coloque
> `"mostrarJanela": true` no `config.json`.

---

## Uso

```bash
npm run novo -- meu-video
```

Cria `projetos/meu-video/`:

```
projetos/meu-video/
├── roteiro.json      ← o roteiro do vídeo
├── narracao/         ← os áudios do ElevenLabs (01.mp3, 02.mp3, ...)
├── sfx/              ← (opcional) efeitos só deste projeto
├── sprites/          ← (opcional) sprites PNG só deste projeto
└── saida/            ← rascunho.mp4, storyboard.png, final.mp4
```

### Narração do ElevenLabs

**Opção 1 — um único áudio (recomendado):** escreva a fala de cada cena em `"narracaoTexto"` no roteiro e rode
`npm run narracao -- meu-video`. Ele cria `narracao/TEXTO-COMPLETO.txt` (um parágrafo por cena, sem marcações de
pausa, para a fala fluir) para colar no ElevenLabs. Salve o áudio gerado como **`narracao/narracao-completa.mp3`**: o
gerador **ouve o áudio** (reconhecimento de fala no próprio PC; na primeira vez baixa um modelo de ~75 MB) e corta
exatamente entre a última palavra de uma cena e a primeira da seguinte; cada cena dura o seu trecho de áudio. Se o
reconhecimento não estiver instalado, corta pelas pausas naturais.

**Conferir os cortes sem renderizar:** `npm run narracao -- meu-video --verificar` mostra de que segundo a que
segundo vai a fala de cada cena (e salva em `narracao/CORTES.txt`). O corte leva em conta o tamanho do texto de
cada cena, então uma pausa no meio de uma frase (reticências) não desloca as falas.

**Transições:** duram 0,2 s por padrão; mude com `"transicaoDuracao": 0.4` no roteiro ou numa cena.

**Legenda do narrador:** o texto de `"narracaoTexto"` aparece automaticamente como legenda na parte de baixo,
em frases curtas sincronizadas com a fala (pela duração real do áudio, ou estimada antes de gravar). Para desligar:
`"legendasNarracao": false` no roteiro, ou `"legendaNarracao": false` numa cena.

**Opção 2 — um arquivo por cena:**

Gere **um áudio por cena** e salve na pasta `narracao/` com o **número da cena** no nome:

```
narracao/01.mp3   → cena 1
narracao/02.mp3   → cena 2
narracao/cena03.mp3, narracao/cena-4.wav, narracao/5.m4a  → também funcionam
```

- A **duração da cena aumenta sozinha** para caber a narração (que começa em `narracaoInicio`, padrão 0,3 s).
- Para outro nome de arquivo: `"narracao": "abertura.mp3"` na cena. Para não usar áudio: `"narracao": false`.
- Cenas sem narração aparecem marcadas em laranja no `storyboard.png`.
- Enquanto há narração, efeitos e ambiente abaixam automaticamente (*ducking*).

Depois:

```bash
npm run rascunho -- meu-video
```

```bash
npm run final -- meu-video
```

Outros comandos:

| Comando | Para quê |
|---|---|
| `npm run previa -- meu-video` | Prévia em tempo real no navegador (sem áudio); recarrega quando o `roteiro.json` muda |
| `npm run lista` | Lista fundos, sprites, ações, efeitos sonoros, paletas e a biblioteca |
| `npm run sprites` | Gera `sprites-disponiveis.png` com todos os sprites |
| `npm run fotos -- meu-video` | Imagens paradas de cada cena (sem vídeo) em `saida/fotos/` + `folha.png`. Na cena, `"foto": 2.5` (ou `[1, 4]`) escolhe o momento |
| `npm run vitrine` | Imagens das principais mudanças (projeto `vitrine`) |
| `npm run catalogo` | Lista todos os assets (sprites com estados, personagens, cenários, ações, sons) em `biblioteca/CATALOGO.md` |
| `npm run sfx` | Exporta todos os efeitos sonoros para `biblioteca/sfx/_gerados/` (para ouvir) |
| `npm run gpu` | Diagnóstico de GPU e NVENC |

Opções: `--fps 60`, `--crt` (linhas de varredura de TV antiga), `--escala 4`, `--formato normal|vertical|ambos`
(o rascunho sai no formato normal; o final gera os dois — use `--formato normal` para gerar só o vídeo longo).

**Ajustes só para o Shorts:** cada cena pode ter um bloco `"vertical"` com o que muda no formato 9:16 — normalmente o
enquadramento: `"vertical": { "camera": { "x": -1, "zoom": 2 }, "cameraFim": { "x": 1 } }`. Na vista diorama, use
`"camera": { "z": -2.75 }` para a câmera mirar a calçada da frente. Veja `projetos/episodio-01`.
Exemplo: `npm run final -- meu-video --fps 60`.

Há um projeto completo de exemplo em `projetos/exemplo` (`npm run rascunho -- exemplo`).

**Guia das formas de fazer o vídeo** (vistas, estilos de personagem, formatos, modos, acabamento e som), com
modelos prontos: [FORMAS-DE-VIDEO.md](FORMAS-DE-VIDEO.md). Comece de um modelo com `npm run novo -- meu-video --modelo diorama`.

---

## Biblioteca de assets reutilizáveis (`biblioteca/`)

Tudo o que se repete entre vídeos do canal fica em `biblioteca/`, compartilhado por todos os projetos:

```
biblioteca/
├── personagens.json   ← personagens do canal (definidos uma vez)
├── cenarios.json      ← lugares que se repetem (fundo + objetos fixos)
├── sprites/           ← seus PNGs
└── sfx/               ← seus efeitos sonoros (substituem os gerados com o mesmo nome)
```

**Personagens** — em `biblioteca/personagens.json`:

```jsonc
{
  "joao":  { "sprite": "arquivo:joao.png", "quadros": 4, "fps": 8, "sombra": true,
             "animacoes": { "parado": [0], "andando": [1, 2, 3, 2] }, "voz": 1.1 },
  "vilao": { "sprite": "pessoa", "voz": 0.65, "cores": { "h": "#1a1a22", "r": "#4a2a6a" } }
}
```

Na cena, só o que muda:

```json
{ "id": "joao", "personagem": "joao", "x": -2, "virado": "esquerda" }
```

**Cenários** — em `biblioteca/cenarios.json` (fundo, clima, elementos, ações, sons, câmera):

```json
{ "acampamento": { "fundo": "floresta-noite",
    "elementos": [ { "id": "fogo", "sprite": "fogueira", "x": 0 }, { "id": "pinheiro", "sprite": "pinheiro", "x": -7, "z": -2 } ] } }
```

Na cena:

```jsonc
{
  "cenario": "acampamento",
  "remover": ["pinheiro"],                  // tira elementos do cenário só nesta cena
  "elementos": [
    { "id": "fogo", "x": 1.5 },             // mesmo id = ajusta o elemento do cenário
    { "id": "joao", "personagem": "joao", "x": -2 }
  ],
  "acoes": [ { "tipo": "falar", "alvo": "joao", "texto": "Que frio!", "inicio": 1 } ]
}
```

Campos da cena vencem os do cenário; as ações e os sons do cenário são somados aos da cena.

**Prioridade** (o primeiro que existir vence):

| Asset | Ordem de busca |
|---|---|
| Sprites PNG | `projetos/<nome>/sprites/` → `biblioteca/sprites/` |
| Efeitos sonoros | `projetos/<nome>/sfx/` → `biblioteca/sfx/` |
| Personagens / cenários | `projetos/<nome>/personagens.json` / `cenarios.json` (opcionais) → `biblioteca/` |

A biblioteca já vem com personagens (`protagonista`, `companheira`, `anciao`, `crianca`, `guarda`,
`mestre`, `vilao`, `mascote`, `monstro`) e cenários (`acampamento`, `vila`, `vila-noite`, `masmorra`,
`rua-chuvosa`, `oasis`).

**Estilo RPG indie** (personagens originais de frente, contorno grosso, olhos que piscam): `menina-capa`,
`robo-semaforo`, `pombo-fofoqueiro`, `lixeira-timida`, `cao-guarda`, `fantasma-metro`, `coruja-banca` e os
inimigos brancos `cone-agressivo` e `bueiro-olhos`. `menina-capa` e `robo-semaforo` são as versões
**detalhadas** (28×44 px, contorno colorido, sombreamento em 3 tons, respiração e piscar de frente, andar de lado
em 4 quadros e correr em 6). As versões antigas, mais simples, ficaram como `menina-capa-antigo` e
`robo-semaforo-antigo`.

**Moradores da cidade** (detalhados, andar e correr): `policial`, `prefeito`, `aluno`, `aluna`, `professora`,
`padeiro`, `caixa`. **Estabelecimentos** (vista lateral): `escola`, `delegacia`, `padaria`, `mercado`, `farmacia`,
mais `carro-policia`, `banco-praca`, `ponto-onibus` e `hidrante`; fundo `cidade-dia`. Cenários prontos na biblioteca:
`escola`, `delegacia`, `padaria`, `mercado`, `farmacia` (lateral) e `rua-comercial` / `rua-comercial-noite`
(diorama com os estabelecimentos).

Na vista diorama dá para escolher os prédios da rua, da esquerda para a direita:

```json
"rua": { "periodo": "dia", "predios": [ { "tipo": "padaria", "largura": 4 }, { "tipo": "comum" }, { "tipo": "escola", "largura": 6 } ] }
```
Tipos: `escola`, `delegacia`, `padaria`, `mercado`, `farmacia` e `comum` (prédio residencial aleatório). Use com os cenários `cidade-rpg`, `cidade-rpg-chuva`
(câmera com zoom 2×) e `batalha` (fundo preto):

```json
{ "cenario": "cidade-rpg-chuva",
  "elementos": [ { "id": "menina", "personagem": "menina-capa", "x": -2 },
                 { "id": "robo", "personagem": "robo-semaforo", "x": 1.5 } ],
  "acoes": [ { "tipo": "falar", "alvo": "robo", "texto": "* Pode atravessar.", "inicio": 1 } ] }
``` Veja tudo com `npm run lista` (ou `npm run lista -- meu-video` para incluir
os do projeto). O projeto `exemplo` usa a biblioteca.

---

## O roteiro (`roteiro.json`)

Comentários com `//` são permitidos.

```jsonc
{
  "titulo": "A Moeda Perdida",
  "resolucao": [320, 180],        // pixels internos; 320x180 → 1080p (6x). Vertical/Shorts: [180, 320]
  "paleta": "nenhuma",            // nenhuma | posterizar | retro32 | verde4 | sepia | noir | quente | fria
  "volumeBaloes": 0.4,            // som das falas dos balões (1 = antigo; projetos novos já vêm com 0.4)
  "efeitos": { "bloom": 0.8, "vinheta": 0.3, "aberracao": true },
  "cenas": [
    {
      "fundo": "floresta-dia",
      "duracao": 6,               // mínimo; cresce com a narração
      "transicao": "iris",        // como a cena ENTRA: dither | fade | iris | pixelizar | corte
      "clima": "chuva",           // chuva | neve | vagalumes | brasas | poeira | folhas | nenhum
      "titulo": "CAPÍTULO 1", "subtitulo": "O COMEÇO",
      "legenda": "Texto fixo na parte de baixo da tela.",
      "camera": { "x": 0, "zoom": 1 },
      "cameraFim": { "x": 4 },    // a câmera desliza até aqui durante a cena
      "seguir": "heroi",          // a câmera acompanha um elemento
      "paleta": "sepia",          // (opcional) paleta só desta cena — ótimo para flashback
      "elementos": [
        { "id": "heroi", "sprite": "heroi", "x": -4 },
        { "id": "arv", "sprite": "arvore", "x": 3, "z": -2, "semente": 4 },
        { "id": "eu", "sprite": "arquivo:personagem.png", "quadros": 4, "fps": 8 }
      ],
      "acoes": [
        { "tipo": "andar", "alvo": "heroi", "para": 1, "inicio": 0.5, "duracao": 2 },
        { "tipo": "falar", "alvo": "heroi", "texto": "Olá!", "inicio": 2.6 }
      ],
      "sons": [ { "som": "porta", "inicio": 1.2 } ]
    }
  ]
}
```

**Coordenadas:** 1 unidade = 16 pixels. `x` horizontal, `y` altura (0 = chão), `z` profundidade
(negativo = mais ao fundo, positivo = na frente).

### Elementos

| Campo | Descrição |
|---|---|
| `sprite` | Nome de um sprite pronto (veja `npm run sprites`) ou `arquivo:nome.png` (de `sprites/` do projeto ou `biblioteca/sprites/`) |
| `personagem` | Usa um personagem da biblioteca (os outros campos ajustam) |
| `x`, `y`, `z` | Posição |
| `escala` | Tamanho (use inteiros: 1, 2, 3 para manter o pixel perfeito) |
| `virado` | `"esquerda"` ou `"direita"` |
| `oculto` | Começa invisível (automático se houver `aparecer`) |
| `cores` | Recolorir personagens: `{ "h": "#cabelo", "r": "#camisa", "b": "#calça" }` |
| `voz` | Tom dos "blips" de fala (1 = normal, 1.3 = mais agudo) |
| `luz` | `{ "cor": "#ff9933", "intensidade": 2, "alcance": 6 }` — ou `false` para tirar a luz da fogueira/tocha/poste |
| `semente` | Variação de árvores/arbustos procedurais |
| `sombraPessoa` | (diorama de rua) em vez de sprite: sombra em forma de pessoa no chão/parede. `{ "tamanho": 2.6, "direcao": 0, "olhos": true }` |
| `numero` | Número sobre a cabeça a cena toda (`1`, `10`, `"?"`, `"#"`, `"-"`); acompanha o personagem. `numeroCor` (`"#f8d040"`) e `numeroEstilo` (`"placa"` padrão ou `"solto"`, algarismos grandes sem placa) |

Sprites PNG próprios: fundo transparente, quadros lado a lado; `"quadros": 4`, `"fps": 8` e, para
personagens, `"animacoes": { "parado": [0], "andando": [1, 2, 3] }`.

### Ações

Toda ação tem `inicio` (segundos desde o começo da cena) e, opcionalmente, `duracao`, `som`
(trocar o efeito) e `volume`. Use `"som": null` para silenciar.

| Ação | Campos | Efeito visual | Som automático |
|---|---|---|---|
| `andar` / `correr` | `alvo`, `para` (x ou [x, y]) | anima os passos, vira para o lado certo | passos |
| `mover` | `alvo`, `para`, `easing` | desliza suave (voar, flutuar) | — |
| `pular` | `alvo`, `altura`, `para` | pulo em arco + poeira ao cair | pulo + aterrissar |
| `virar` | `alvo`, `direcao` | — | — |
| `sentar` | `alvo`, `lado` (true = de lado) ou `pose` (`sentado`, `sentado-lado`, `sentado-costas`) | personagem fica sentado (de frente ou de lado) | — |
| `levantar` | `alvo` | volta a ficar em pé | — |
| `trocar` | `alvo`, `estado` | muda o estado de um objeto (ex.: `tempo-pessoal` de `sol` para `chuva`; estrela vira `olho`) | — |
| `falar` | `alvo`, `texto`, `velocidade` | balão com texto letra a letra | "blips" de fala |
| `emocao` | `alvo`, `icone`: `!` `?` `coracao` `...` `zzz` `lampada` `gota` `raiva` `nota` | ícone sobre a cabeça | surpresa/dúvida/amor |
| `numero` | `alvo`, `valor` (`null` tira), `cor`, `estilo` | troca o número sobre a cabeça (com pulinho); vale até o fim da cena | clique |
| `pensar` | `alvo`, `texto` | balão de pensamento (nuvem com bolinhas) | — |
| `destaque` | `alvo` (ou `posicao` [x, y] px), `raio`, `dy`, `escurecer`, `cor` | lupa: escurece a tela e ilumina um círculo | revelar |
| `contador` | `de` (padrão = duração), `cor`, `y` | contagem regressiva grande no alto (vermelha nos 3 últimos) | tique + sino |
| `placar` | `opcoes` (["AJUDAR", "FUGIR"]), `votos` ([62, 38], opcional), `cores` | placar de votação (1, 2...) com barras enchendo | — |
| `continua` | `texto` (padrão "CONTINUA...") | selo no canto para o gancho do fim | suspense |
| `sombra` | `origem` [x, z], `raio`, `recolher`, `cor`, `corBorda`, `personagens` | (diorama de rua) sombra que se alastra pelo chão e sobe paredes, objetos e pessoas | sombra |
| `aparecer` / `sumir` | `alvo` | "puf" de fumaça | puf |
| `coletar` | `alvo` | item sobe com brilho e some | moeda/vida/powerup/item |
| `piscar` | `alvo` | pisca vermelho (dano) | dano |
| `explosao` | `alvo` ou `posicao` [x, y], `intensidade` | partículas + flash + tremor | explosão |
| `magia` | `alvo` ou `posicao` | faíscas coloridas | magia |
| `tremer` | `intensidade` | tremor de tela | tremor |
| `flash` | `intensidade` | tela branca rápida | — |
| `camera` | `para`: `{ x, y, zoom }`, `easing` | move a câmera | — |
| `som` | `som`, `volume`, `pan` (-1 a 1), `taxa` | — | o som escolhido |

Os efeitos ficam no **estéreo** de acordo com a posição do personagem na tela.

### Efeitos sonoros (sem música)

Gerados por síntese, no estilo 8/16-bit:
`passo, pulo, aterrissar, moeda, item, vida, powerup, puf, explosao, tremor, blip, surpresa, duvida,
amor, dano, magia, revelar, transicao, porta, clique, sucesso, erro, soco, espada, sino` e (protótipo)
`sino-relogio, cadeado, papel, miau, trovao, suspense, fantasma`.

Ambientes (em loop, escolhidos pelo fundo/clima automaticamente):
`chuva, vento, grilos, passaros, fogo, caverna, espaco, cidade`.
Na cena: `"ambiente": ["chuva", ["vento", 0.3]]` ou `"ambiente": false`.

**Quer usar seus próprios efeitos** (do ElevenLabs Sound Effects, por exemplo)? Salve com o mesmo
nome em `projetos/meu-video/sfx/` (só nesse projeto) ou em `biblioteca/sfx/` (todos os projetos):
`biblioteca/sfx/explosao.mp3`, `biblioteca/sfx/moeda.wav`... Pode inventar nomes novos e usar com `{ "tipo": "som", "som": "meu-efeito" }`.

### Vistas (`"vista"` na cena)

A câmera **nunca gira para os lados** — assim os pixels continuam alinhados com a tela e a pixel art fica nítida.

| Vista | Como é | Coordenadas dos elementos |
|---|---|---|
| `lateral` (padrão) | cenário em camadas com paralaxe, usando `fundo` | `x` horizontal, `y` altura, `z` profundidade |
| `diorama` (rua; **padrão**) — antiga `diagonal`, ainda aceita | rua **desenhada** em diagonal (pixel art 2:1): prédios com vitrines, toldos e letreiros, calçadas, faixa de pedestre, postes; luz pintada pixel a pixel. A câmera desliza acompanhando (`seguir`) | `x` = posição **ao longo da rua**; `z` = distância da calçada da frente (0 = calçada da frente, ~2.7 = meio da rua, ~5.3 = calçada dos prédios) |
| `diorama` + `"comodo"` (cômodos) | **cômodos** (interiores) desenhados em diagonal 2:1, em corte, com **ângulos**: `"comodo": { "tipo": "sala-aula", "angulo": "espelhado" }`. Padrão: `classico` (a diagonal clássica, não precisa escrever); `espelhado` (visto pelo outro lado da diagonal); ângulos extras quando o cômodo tem (sala de aula: `lousa-fundo`), combináveis (`lousa-fundo-espelhado`). Ângulo que não existe usa o clássico, com aviso. Tipos: `sala-aula`, `quarto-menino`, `quarto-menino-noite`, `sala-estar` | `x` ao longo do cômodo; `z` = 0 perto da frente, ~3.8 encostado na parede do fundo. No ângulo espelhado o `x` troca de sinal |
| `3d` (**modo 3D**, guardado para o futuro) | personagens 2D (sprites) num mundo 3D: chão, paredes, móveis e prédios em 3D com textura pixel art; câmera fixa só inclinada para baixo. `"palco": { "tipo": "quarto-menino" \| "quarto-menino-noite" \| "sala-aula" \| "sala-estar" \| "praca" \| "praca-noite" }` | `x` lateral, `z` profundidade (fundo dos cômodos em −6), `y` altura |
| `avenida` | avenida em **perspectiva** indo para o fundo, prédios dos dois lados, postes e carros | `x` lateral (−3 a 3 é o asfalto), `z` profundidade (maior = mais perto da câmera) |

```jsonc
{ "vista": "diorama", "seguir": "menina",
  "rua": { "periodo": "noite", "faixaPedestre": 0, "comprimento": 44, "distanciaPostes": 8, "semente": 3 },
  "elementos": [ { "id": "menina", "personagem": "menina-capa", "x": -6, "z": 0 } ],
  "acoes": [ { "tipo": "andar", "alvo": "menina", "para": 2, "inicio": 0.3, "duracao": 4 } ] }
```

```jsonc
{ "vista": "avenida",
  "avenida": { "periodo": "noite", "carros": true, "comprimento": 80, "faixaPedestre": -12 },
  "seguir": "menina",                                     // a câmera só se move quando ela se move
  "elementos": [ { "id": "menina", "personagem": "menina-capa", "x": 1.2, "z": 3.4 } ] }
```

A avenida é desenhada pixel a pixel na GPU (shaders): linhas sempre com 1 pixel e detalhe que se
simplifica com a distância, sem texturas esticadas pela perspectiva. `"periodo": "dia"` também funciona nas duas. No `diorama` a câmera usa `x` (ao longo da rua), `y` (altura do
enquadramento) e `zoom`; na `avenida`, `x`, `y` (altura), `z` (posição na avenida) e `zoom`. Na `avenida` a câmera fica **parada**:
`cameraFim` e ações de câmera são ignorados, e ela só acompanha o protagonista (`seguir`) enquanto ele se move.

*Experimental:* `"avenida": { "movimentoReal": true }` faz a câmera se mover de verdade (acompanhar de lado com
paralaxe real e avançar com `cameraFim`/ação `camera` em `z`). Usa um desenho mais simples (linhas de 2 px, sem
grão nem fiadas) para reduzir o tremido, que mesmo assim pode aparecer de leve no avanço.

Cenários prontos de interiores: `sala-de-aula`, `quarto-menino`, `quarto-menino-noite`, `sala-de-estar` (lateral) e
`sala-de-aula-diorama`, `quarto-menino-diorama`, `quarto-menino-noite-diorama`, `sala-de-estar-diorama` (diorama).
Poses dos personagens (moradores e `menina-capa`): `"pose": "sentado"` (de frente), `"sentado-lado"`, `"costas"` e
`"sentado-costas"`; ações `sentar` / `levantar`.

Elemento preso em outro: `"sobre": { "id": "bia", "dx": 0.45, "dy": 2.75 }` — acompanha o dono (posição, lado e
visibilidade); `dx` segue o lado para onde ele olha. Usado para o tempo na cabeça, guarda-chuva, fogo no chapéu etc.
Praça (diagonal): `praca` / `praca-noite` (padrão) e `praca-decorada` / `praca-decorada-noite` (festa: bandeirinhas,
palanque e barracas). Os objetos da praça (`fonte-iso`, `banco-iso`, `barraca-pipoca`...) usam x/z = canto da frente.
`"balancar": true` faz o elemento boiar (sobe e desce devagar). Clima `"calor"`: ar quente subindo.

### Fundos

`floresta-dia`, `floresta-noite`, `por-do-sol`, `caverna`, `deserto`, `espaco`, `cidade-noite`, `neve`,
`sala-aula`, `quarto-menino`, `quarto-menino-noite`, `sala-estar` (interiores),
`preto` (sem chão, para telas de batalha). Todos são procedurais, em camadas de profundidade (montanhas, colinas, árvores, prédios...), então
o movimento de câmera gera paralaxe real.

---

## Configuração (`config.json`)

```jsonc
{
  "ffmpeg": "ffmpeg",                 // ou o caminho completo: "C:\\ffmpeg\\bin\\ffmpeg.exe"
  "encoder": "auto",                  // auto | nvenc | cpu
  "navegador": "auto",                // auto (Chrome → Edge → Chromium) | chrome | msedge | chromium
  "caminhoNavegador": "",
  "mostrarJanela": false,             // true se a GPU não for usada no modo invisível
  "permitirRenderizacaoCPU": false,   // true = aceita renderizar sem GPU (bem mais lento)
  "rascunho": { "fps": 15, "resolucao": 540 },
  "final":    { "fps": 30, "resolucao": 1080, "qualidade": 18, "crt": false },
  "audio": {
    "volumeNarracao": 1.0, "volumeEfeitos": 0.7, "volumeAmbiente": 0.35,
    "abaixarEfeitosNaNarracao": 0.45, "normalizar": true, "lufs": -14
  }
}
```

`qualidade` é o CQ do NVENC (menor = melhor/maior arquivo; 16–22 é uma boa faixa).

---

## Como funciona

1. O Node lê o roteiro, mede a duração das narrações e calcula a linha do tempo.
2. Um servidor local entrega o motor (Three.js) ao Chrome/Edge, aberto sem janela e com aceleração de GPU.
3. Cada quadro é renderizado em **320×180** num *render target* (cena 3D → partículas/textos →
   pós-processamento com bloom, vinheta, transições), lido com `readPixels` e enviado ao FFmpeg.
4. O FFmpeg amplia com *nearest neighbor* (pixels nítidos, sem borrão) e codifica com NVENC.
5. O áudio (narração + efeitos + ambiente) é mixado em estéreo, com limitador, e unido ao vídeo.

Tudo é função do tempo (sem simulação), então o mesmo roteiro sempre gera exatamente o mesmo vídeo.
