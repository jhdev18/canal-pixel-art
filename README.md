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
| 2. Final | `npm run final -- meu-video` | `final.mp4` (1920×1080, 30 fps, efeitos visuais + efeitos sonoros + ambiente + narração, áudio normalizado para -14 LUFS) |

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
| `npm run sfx` | Exporta todos os efeitos sonoros para `biblioteca/sfx/_gerados/` (para ouvir) |
| `npm run gpu` | Diagnóstico de GPU e NVENC |

Opções: `--fps 60`, `--crt` (linhas de varredura de TV antiga), `--escala 4`.
Exemplo: `npm run final -- meu-video --fps 60`.

Há um projeto completo de exemplo em `projetos/exemplo` (`npm run rascunho -- exemplo`).

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
`robo-semaforo-antigo`. Use com os cenários `cidade-rpg`, `cidade-rpg-chuva`
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
| `falar` | `alvo`, `texto`, `velocidade` | balão com texto letra a letra | "blips" de fala |
| `emocao` | `alvo`, `icone`: `!` `?` `coracao` `...` `zzz` | ícone sobre a cabeça | surpresa/dúvida/amor |
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
amor, dano, magia, revelar, transicao, porta, clique, sucesso, erro, soco, espada, sino`.

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
| `diagonal` | rua **desenhada** em diagonal (pixel art 2:1): prédios com vitrines, toldos e letreiros, calçadas, faixa de pedestre, postes; luz pintada pixel a pixel. A câmera desliza acompanhando (`seguir`) | `x` = posição **ao longo da rua**; `z` = distância da calçada da frente (0 = calçada da frente, ~2.7 = meio da rua, ~5.3 = calçada dos prédios) |
| `avenida` | avenida em **perspectiva** indo para o fundo, prédios dos dois lados, postes e carros | `x` lateral (−3 a 3 é o asfalto), `z` profundidade (maior = mais perto da câmera) |

```jsonc
{ "vista": "diagonal", "seguir": "menina",
  "rua": { "periodo": "noite", "faixaPedestre": 0, "comprimento": 44, "distanciaPostes": 8, "semente": 3 },
  "elementos": [ { "id": "menina", "personagem": "menina-capa", "x": -6, "z": 0 } ],
  "acoes": [ { "tipo": "andar", "alvo": "menina", "para": 2, "inicio": 0.3, "duracao": 4 } ] }
```

```jsonc
{ "vista": "avenida",
  "avenida": { "periodo": "noite", "carros": true, "comprimento": 80 },
  "camera": { "z": 11.5 }, "cameraFim": { "z": 9.5 },     // a câmera avança pela avenida
  "elementos": [ { "id": "menina", "personagem": "menina-capa", "x": 1.2, "z": 3.4 } ] }
```

`"periodo": "dia"` também funciona nas duas. Na `diagonal` a câmera usa `x` (ao longo da rua), `y` (altura do
enquadramento) e `zoom`; na `avenida`, `x`, `y` (altura), `z` (posição na avenida) e `zoom`.

### Fundos

`floresta-dia`, `floresta-noite`, `por-do-sol`, `caverna`, `deserto`, `espaco`, `cidade-noite`, `neve`,
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
