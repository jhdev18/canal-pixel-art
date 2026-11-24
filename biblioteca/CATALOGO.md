# Catálogo de assets

Gerado por `npm run catalogo` (não edite à mão). ✅ = aprovado · 🧪 = protótipo (aguardando o "pode salvar").

| Onde fica | O quê |
|---|---|
| `motor/assets/` | todo sprite desenhado em código (um arquivo por grupo; índice em `motor/assets/index.js`) |
| `biblioteca/personagens.json`, `biblioteca/cenarios.json` | personagens e cenários **aprovados** |
| `prototipos/personagens.json`, `prototipos/cenarios.json` | **protótipos**, já disponíveis em todos os projetos |
| `biblioteca/sprites/`, `biblioteca/sfx/` | PNGs e sons seus |

Prioridade quando o nome se repete: projeto > biblioteca > protótipos.

## Sprites (315)

Uso: `{ "sprite": "nome" }`; estado com `"pose"` ou ação `trocar`.

### Básicos (simples)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `heroi` | ✅ | parado | 16×16 |
| `amiga` | ✅ | parado | 16×16 |
| `velho` | ✅ | parado | 16×16 |
| `guarda` | ✅ | parado | 16×16 |
| `crianca` | ✅ | parado | 16×16 |
| `pessoa` | ✅ | parado | 16×16 |
| `slime` | ✅ | parado | 16×11 |
| `morcego` | ✅ | parado | 15×7 |
| `moeda` | ✅ | parado | 8×8 |
| `coracao` | ✅ | parado | 9×8 |
| `estrela` | ✅ | parado | 9×9 |
| `gema` | ✅ | parado | 7×7 |
| `bau` | ✅ | parado | 14×10 |
| `chave` | ✅ | parado | 11×6 |
| `arvore` | ✅ | parado | 34×44 |
| `pinheiro` | ✅ | parado | 26×46 |
| `pinheiro-neve` | ✅ | parado | 26×46 |
| `arbusto` | ✅ | parado | 22×13 |
| `pedra` | ✅ | parado | 16×10 |
| `casa` | ✅ | parado | 50×44 |
| `casa-noite` | ✅ | parado | 50×44 |
| `nuvem` | ✅ | parado | 34×14 |
| `cacto` | ✅ | parado | 16×26 |
| `poste` | ✅ | parado | 12×44 |
| `placa` | ✅ | parado | 16×16 |
| `fogueira` | ✅ | parado | 18×18 |

### Medieval (vila, castelo, taverna)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `mago` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `tocha` | 🧪 protótipo | parado | 13×50 |
| `rei` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `rainha` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `princesa` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `cavaleiro` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `campones` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `camponesa` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `ferreiro` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `bruxa` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `barril` | 🧪 protótipo | parado | 21×26 |
| `feno` | 🧪 protótipo | parado | 41×28 |
| `carroca` | 🧪 protótipo | parado | 69×43 |
| `poco` | 🧪 protótipo | parado | 47×58 |
| `barraca-medieval` | 🧪 protótipo | parado | 75×71 |
| `estandarte` | 🧪 protótipo | parado, vermelho, azul | 33×63 |

### Personagens RPG (estilo indie)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `menina-capa-antigo` | ✅ | parado | 20×25 |
| `robo-semaforo-antigo` | ✅ | parado | 20×28 |
| `pombo-fofoqueiro` | ✅ | parado | 20×17 |
| `lixeira-timida` | ✅ | parado | 20×18 |
| `cao-guarda` | ✅ | parado | 20×19 |
| `fantasma-metro` | ✅ | parado | 20×16 |
| `coruja-banca` | ✅ | parado | 20×20 |
| `cone-agressivo` | ✅ | parado | 20×15 |
| `bueiro-olhos` | ✅ | parado | 20×12 |

### Personagens principais (detalhados)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `menina-capa` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `robo-semaforo` | ✅ | parado | 28×44 |
| `menina-capa-detalhada` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `robo-semaforo-detalhado` | ✅ | parado | 28×44 |

### Moradores da cidade

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `policial` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `prefeito` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `aluno` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `aluna` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `professora` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `padeiro` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `caixa` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `policial-oculos` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `prefeito-careca` | ✅ | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `padeiro-pregador` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `cao-policial` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro | 28×44 |

### Cidade (vista lateral)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `escola` | ✅ | (gerado no navegador) |  |
| `delegacia` | ✅ | (gerado no navegador) |  |
| `padaria` | ✅ | (gerado no navegador) |  |
| `mercado` | ✅ | (gerado no navegador) |  |
| `farmacia` | ✅ | (gerado no navegador) |  |
| `carro-policia` | ✅ | (gerado no navegador) |  |
| `banco-praca` | ✅ | parado | 30×14 |
| `hidrante` | ✅ | parado | 10×14 |

### Cidade (melhorias)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `ponto-onibus` | 🧪 protótipo | parado | 85×65 |
| `bola` | 🧪 protótipo | parado | 8×8 |
| `carro-vermelho` | 🧪 protótipo | parado | 63×34 |
| `carro-azul` | 🧪 protótipo | parado | 63×34 |
| `carro-amarelo` | 🧪 protótipo | parado | 63×34 |
| `carro-branco` | 🧪 protótipo | parado | 63×34 |
| `onibus` | 🧪 protótipo | parado | 149×73 |
| `bicicleta` | 🧪 protótipo | parado | 37×16 |
| `escorregador` | 🧪 protótipo | parado | 91×63 |
| `carrinho-compras` | 🧪 protótipo | parado | 27×30 |
| `trave` | 🧪 protótipo | parado | 59×40 |
| `muro-escola` | 🧪 protótipo | parado | 131×56 |
| `varal` | 🧪 protótipo | parado | 85×58 |
| `mastro-bandeira` | 🧪 protótipo | parado | 41×81 |
| `semaforo` | 🧪 protótipo | verde, amarelo, vermelho, apagado, parado, piscando | 13×59 |
| `portao-escola` | 🧪 protótipo | fechado, aberto, parado | 103×66 |
| `balanco` | 🧪 protótipo | parado, balancando, sozinho | 79×62 |
| `gira-gira` | 🧪 protótipo | parado, girando | 47×36 |
| `gangorra` | 🧪 protótipo | parado, subindo | 85×40 |
| `pombo-rua` | 🧪 protótipo | parado, voando | 14×12 |
| `placa-rua` | 🧪 protótipo | parado, rua, pare, nao-olhe, vazia | 30×44 |
| `relogio-digital` | 🧪 protótipo | 10-00, 12-00, 03-33, 00-00, parado, piscando | 32×46 |
| `tv-noticia` | 🧪 protótipo | parado, jornal, urgente, chuvisco, desligada | 96×64 |
| `cartaz-muda` | 🧪 protótipo | parado, circo, sorriso, olhos, vazio | 32×40 |
| `janela-cortina` | 🧪 protótipo | fechada, aberta, acesa, vulto, parado, balancando | 20×24 |
| `celular` | 🧪 protótipo | inicio, mensagem, notificacao, chamada, camera, rachado, sem-sinal, parado | 48×88 |
| `vassoura` | 🧪 protótipo | parado | 8×24 |
| `motorista` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `gari` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `pipoqueiro` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `medica` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |

### Interiores (móveis e cômodos)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `lousa` | ✅ | (gerado no navegador) |  |
| `carteira` | ✅ | parado | 36×28 |
| `mesa-professor` | ✅ | parado | 56×30 |
| `estante-livros` | ✅ | parado | 38×60 |
| `relogio-parede` | ✅ | parado | 16×16 |
| `globo` | ✅ | parado | 18×24 |
| `cartaz-alfabeto` | ✅ | (gerado no navegador) |  |
| `cama` | ✅ | parado | 68×34 |
| `escrivaninha` | ✅ | parado | 48×44 |
| `escrivaninha-desligada` | ✅ | parado | 48×44 |
| `cadeira-gamer` | ✅ | parado | 20×34 |
| `guarda-roupa` | ✅ | parado | 44×72 |
| `bau-brinquedos` | ✅ | parado | 34×26 |
| `abajur` | ✅ | parado | 16×30 |
| `abajur-apagado` | ✅ | parado | 16×30 |
| `criado-mudo` | ✅ | parado | 20×22 |
| `sofa` | ✅ | parado | 78×34 |
| `poltrona` | ✅ | parado | 32×32 |
| `tv-rack` | ✅ | parado | 64×44 |
| `tv-rack-desligada` | ✅ | parado | 64×44 |
| `mesa-centro` | ✅ | parado | 44×16 |
| `tapete` | ✅ | parado | 88×6 |
| `planta-vaso` | ✅ | parado | 22×38 |
| `luminaria-pe` | ✅ | parado | 18×56 |
| `luminaria-pe-apagada` | ✅ | parado | 18×56 |
| `estante-sala` | ✅ | parado | 40×46 |

### Nesse Mundo (objetos de história)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `caderno` | 🧪 protótipo | fechado, aberto, parado | 16×10 |
| `pagina-caderno` | 🧪 protótipo | (gerado no navegador) |  |
| `tempo-pessoal` | ✅ | sol, sol-pequeno, sol-grande, sol-forte, nuvenzinha, garoa, chuva, aguaceiro, nada, parado | 34×40 |
| `guarda-chuva` | ✅ | aberto, fechando, fechado, parado | 30×40 |
| `estrela-mentira` | ✅ | (gerado no navegador) |  |
| `estrela-gigante` | ✅ | (gerado no navegador) |  |
| `palanque` | ✅ | parado | 58×40 |
| `bandeirinhas` | ✅ | parado | 112×18 |
| `fonte-praca` | ✅ | cheia, seca, parado | 48×36 |
| `canteiro` | ✅ | verde, murcho, parado | 34×16 |
| `placa-lei` | ✅ | (gerado no navegador) |  |
| `bloco-multas` | ✅ | parado | 7×9 |
| `fogo-chapeu` | ✅ | parado | 16×16 |
| `peruca` | ✅ | parado | 14×6 |
| `sorvete` | ✅ | parado, derretendo, derretido | 14×16 |
| `agua-enchente` | ✅ | parado | 128×16 |
| `cerca-mirante` | ✅ | parado | 64×16 |
| `bueiro-monstro` | ✅ | parado, agarrar, enjoado, fechado | 30×34 |
| `cone-monstro` | ✅ | parado, dormindo | 18×28 |
| `sanduiche` | ✅ | parado | 12×7 |
| `lista-compras` | ✅ | enrolada, abrindo, aberta, parado | 16×22 |
| `malinha` | ✅ | parado | 10×9 |

### Praça e rua (diorama, isométricos)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `fonte-iso` | ✅ | cheia, seca, parado | 61×56 |
| `banco-iso` | ✅ | parado | 57×34 |
| `arvore-iso` | ✅ | verde, seca, parado | 57×69 |
| `arvore-iso-grande` | ✅ | verde, seca, parado | 69×81 |
| `poste-iso` | ✅ | apagado, parado | 13×68 |
| `poste-iso-aceso` | ✅ | aceso, parado | 13×68 |
| `canteiro-iso` | ✅ | verde, murcho, parado | 79×31 |
| `palanque-iso` | ✅ | parado | 99×62 |
| `bandeirinhas-iso` | ✅ | parado | 193×96 |
| `viatura-iso` | 🧪 protótipo | parado, sirene | 75×41 |
| `barraca-pipoca` | ✅ | parado, acesa, fechada | 61×83 |
| `barraca-doces` | ✅ | parado, acesa, fechada | 61×83 |
| `barraca-jogos` | ✅ | parado, acesa, fechada | 61×83 |
| `barraca-sorvete` | 🧪 protótipo | parado, acesa, fechada | 61×83 |
| `barraca-frutas` | 🧪 protótipo | parado, acesa, fechada | 61×83 |
| `barraca-verduras` | 🧪 protótipo | parado, acesa, fechada | 61×83 |
| `barraca-flores` | 🧪 protótipo | parado, acesa, fechada | 61×83 |
| `barraca-vazia` | 🧪 protótipo | parado, acesa, fechada | 61×83 |

### Guardiões

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `guardiao-azul` | 🧪 protótipo | parado, feliz, alerta, dormindo, tremendo, olhando-lado | 18×20 |
| `guardia-verde` | 🧪 protótipo | parado, feliz, alerta, dormindo, tremendo, olhando-lado | 18×20 |
| `guardiao-chefe` | 🧪 protótipo | parado, feliz, alerta, dormindo, tremendo, olhando-lado | 18×20 |
| `guardiao-noturno` | 🧪 protótipo | parado, feliz, alerta, dormindo, tremendo, olhando-lado | 18×20 |

### Fantasmas

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `fantasma-lencol` | 🧪 protótipo | parado, assustar, timido | 24×32 |
| `fantasma-crianca` | 🧪 protótipo | parado, timido, acenar, assustar | 24×32 |
| `fantasma-vovo` | 🧪 protótipo | parado, rindo, acenar | 24×32 |
| `fantasma-sombra` | 🧪 protótipo | parado, assustar | 24×32 |
| `fantasma-cachorro` | 🧪 protótipo | parado, feliz | 24×20 |
| `fogo-fatuo` | 🧪 protótipo | azul, verde, roxo, parado | 12×16 |

### Novos (personagens, objetos, praça)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `carteiro` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `vovo` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `sorveteiro` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `rival` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `menino-coroa` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `menino-pijama` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `gato-chapeu` | 🧪 protótipo | parado, monstro, monstro-andando, monstro-correndo, pior, pior-andando, pior-correndo | 20×16 |
| `gato-monstro` | 🧪 protótipo | parado, monstro, monstro-andando, monstro-correndo, pior, pior-andando, pior-correndo | 20×16 |
| `bilhete` | 🧪 protótipo | parado, brilhando | 9×7 |
| `carta` | 🧪 protótipo | parado, fechada, aberta | 11×6 |
| `mapa` | 🧪 protótipo | parado | 12×9 |
| `cadeado` | 🧪 protótipo | parado, fechado, aberto | 8×9 |
| `pegadas-brilhantes` | 🧪 protótipo | parado | 40×14 |
| `cartaz-procura-se` | 🧪 protótipo | parado, vazio, foto | 48×56 |
| `relogio-praca` | 🧪 protótipo | h3, h6, h9, h12, h11-55, parado | 29×89 |
| `caixa-correio` | 🧪 protótipo | parado | 21×37 |
| `lixeira-praca` | 🧪 protótipo | parado | 19×24 |
| `placa-praca` | 🧪 protótipo | parado | 83×49 |
| `carrinho-sorvete` | 🧪 protótipo | parado | 49×65 |
| `caixote` | 🧪 protótipo | parado | 25×23 |
| `ponte-madeira` | 🧪 protótipo | parado | 157×70 |
| `cerca-madeira` | 🧪 protótipo | parado | 131×50 |
| `mato` | 🧪 protótipo | parado | 33×21 |
| `placa-saida` | 🧪 protótipo | parado | 193×77 |
| `fogueira-junina` | 🧪 protótipo | parado | 35×40 |
| `cadeado-numero` | 🧪 protótipo | parado, fechado, tentando, aberto | 40×44 |

### Casa (cômodos em diorama) e família

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `casa-sala` | 🧪 protótipo | parado | 212×174 |
| `casa-sala-noite` | 🧪 protótipo | parado | 212×174 |
| `casa-cozinha` | 🧪 protótipo | parado | 212×174 |
| `casa-cozinha-noite` | 🧪 protótipo | parado | 212×174 |
| `casa-quarto` | 🧪 protótipo | parado | 212×174 |
| `casa-quarto-noite` | 🧪 protótipo | parado | 212×174 |
| `casa-banheiro` | 🧪 protótipo | parado | 212×174 |
| `casa-banheiro-noite` | 🧪 protótipo | parado | 212×174 |
| `casa-corte` | 🧪 protótipo | parado | 452×472 |
| `casa-corte-noite` | 🧪 protótipo | parado | 452×472 |
| `mae` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `mae-avental` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `menino-topete` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |

### Cachorros (leva 3)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `cachorro-caramelo` | 🧪 protótipo | parado, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 20×19 |
| `cachorro-preto` | 🧪 protótipo | parado, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 20×19 |
| `cachorro-branco` | 🧪 protótipo | parado, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 20×19 |
| `cachorro-cinza` | 🧪 protótipo | parado, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 20×19 |
| `cachorro-chique` | 🧪 protótipo | parado, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 20×19 |
| `vira-lata` | 🧪 protótipo | parado, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 20×19 |

### Terror e objetos (leva 3)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `vulto` | 🧪 protótipo | parado, olhos | 24×56 |
| `pao` | 🧪 protótipo | parado | 14×7 |
| `alma` | 🧪 protótipo | azul, rosa | 12×15 |
| `banco-frente` | 🧪 protótipo | parado | 50×28 |
| `saquinho-pimenta` | 🧪 protótipo | parado, fechado, aberto | 10×12 |

### Animatrônicos de brinquedo (terror)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `brinquedo-soldadinho` | 🧪 protótipo | parado, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, olhos-andando, olhos-correndo, virado-andando, virado-correndo, rachado-andando, rachado-correndo | 30×50 |
| `brinquedo-boneca` | 🧪 protótipo | parado, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, olhos-andando, olhos-correndo, virado-andando, virado-correndo, rachado-andando, rachado-correndo | 30×50 |
| `brinquedo-robo` | 🧪 protótipo | parado, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, olhos-andando, olhos-correndo, virado-andando, virado-correndo, rachado-andando, rachado-correndo | 30×50 |
| `brinquedo-caixa` | 🧪 protótipo | parado, fechada, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, fechada-andando, fechada-correndo, olhos-andando, olhos-correndo, rachado-andando, rachado-correndo | 30×50 |
| `brinquedo-soldadinho-sem-rosto` | 🧪 protótipo | parado, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, olhos-andando, olhos-correndo, virado-andando, virado-correndo, rachado-andando, rachado-correndo | 30×50 |
| `brinquedo-boneca-sem-rosto` | 🧪 protótipo | parado, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, olhos-andando, olhos-correndo, virado-andando, virado-correndo, rachado-andando, rachado-correndo | 30×50 |
| `brinquedo-robo-sem-rosto` | 🧪 protótipo | parado, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, olhos-andando, olhos-correndo, virado-andando, virado-correndo, rachado-andando, rachado-correndo | 30×50 |
| `brinquedo-caixa-sem-rosto` | 🧪 protótipo | parado, fechada, desligado, cantando, acenar, virado, olhos, rachado, falha, sem-rosto, sem-rosto-andando, sem-rosto-correndo, fechada-andando, fechada-correndo, olhos-andando, olhos-correndo, rachado-andando, rachado-correndo | 30×50 |

### Loja e fábrica de brinquedos

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `boneco-conserto` | 🧪 protótipo | parado | 28×24 |
| `manequim` | 🧪 protótipo | parado, virado, braco, torto, virado-andando | 26×50 |
| `manequim-coberto` | 🧪 protótipo | parado, virado | 26×50 |
| `fumaca-chamine` | 🧪 protótipo | parado | 28×60 |

### Jogo de blocos (vídeos sobre Roblox)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `avatar-bloco-vermelho` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-bloco-roxo` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-bloco-verde` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-bloco-azul` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-bloco-capuz` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-bia` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-nina` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-topete` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-leo-1` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `avatar-leo-2` | 🧪 protótipo | parado, acenar, pulando-agacha, pulando-sobe, pulando-desce, pulando-cai, bug, bug-andando, bug-correndo, sem-rosto, sem-rosto-andando, sem-rosto-correndo, sorriso, sorriso-andando, sorriso-correndo | 30×50 |
| `cubo-grama` | 🧪 protótipo | parado | 35×33 |
| `cubo-terra` | 🧪 protótipo | parado | 35×33 |
| `cubo-pedra` | 🧪 protótipo | parado | 35×33 |
| `cubo-madeira` | 🧪 protótipo | parado | 35×33 |
| `cubo-lava` | 🧪 protótipo | parado | 35×33 |
| `cubo-xadrez` | 🧪 protótipo | parado | 35×33 |
| `plataforma-spawn` | 🧪 protótipo | parado | 55×29 |
| `peca-vermelha` | 🧪 protótipo | parado | 35×33 |
| `peca-azul` | 🧪 protótipo | parado | 35×33 |
| `peca-amarela` | 🧪 protótipo | parado | 35×33 |
| `peca-verde` | 🧪 protótipo | parado | 35×33 |
| `placa-azul` | 🧪 protótipo | parado | 67×37 |
| `placa-amarela` | 🧪 protótipo | parado | 67×37 |
| `bloco-neon` | 🧪 protótipo | parado | 67×31 |
| `trelica` | 🧪 protótipo | parado | 19×73 |
| `arvore-bloco` | 🧪 protótipo | parado | 41×65 |
| `casa-bloco` | 🧪 protótipo | parado | 117×93 |
| `placa-jogo` | 🧪 protótipo | parado | 61×54 |
| `bandeira-checkpoint` | 🧪 protótipo | parado | 45×55 |
| `trampolim-bloco` | 🧪 protótipo | parado | 41×26 |
| `ponte-bloco` | 🧪 protótipo | parado | 131×45 |
| `torre-bloco` | 🧪 protótipo | parado | 47×120 |
| `nuvem-bloco` | 🧪 protótipo | parado | 97×48 |
| `loja-bloco-azul` | 🧪 protótipo | parado | 119×80 |
| `loja-bloco-rosa` | 🧪 protótipo | parado | 119×80 |
| `loja-bloco-verde` | 🧪 protótipo | parado | 119×80 |
| `predio-bloco` | 🧪 protótipo | parado | 105×144 |
| `poste-bloco` | 🧪 protótipo | parado | 15×58 |
| `carro-bloco-vermelho` | 🧪 protótipo | parado | 79×42 |
| `carro-bloco-azul` | 🧪 protótipo | parado | 79×42 |
| `carro-bloco-amarelo` | 🧪 protótipo | parado | 79×42 |
| `pilar-bloco-1` | 🧪 protótipo | parado | 55×46 |
| `pilar-bloco-2` | 🧪 protótipo | parado | 55×62 |
| `pilar-bloco-3` | 🧪 protótipo | parado | 55×78 |
| `pilar-bloco-4` | 🧪 protótipo | parado | 55×94 |
| `pilar-bloco-5` | 🧪 protótipo | parado | 55×110 |
| `plataforma-inicio` | 🧪 protótipo | parado | 99×65 |
| `plataforma-chegada` | 🧪 protótipo | parado | 99×113 |
| `arco-largada` | 🧪 protótipo | parado | 95×75 |
| `checkpoint-1` | 🧪 protótipo | parado | 61×32 |
| `checkpoint-2` | 🧪 protótipo | parado | 61×32 |
| `checkpoint-3` | 🧪 protótipo | parado | 61×32 |
| `checkpoint-4` | 🧪 protótipo | parado | 61×32 |
| `checkpoint-5` | 🧪 protótipo | parado | 61×32 |
| `tela-jogo` | 🧪 protótipo | parado, jogando, chat, erro, socorro, chat-nao-sai, chat-banho, pausado | 96×64 |
| `celular-mao` | 🧪 protótipo | parado | 8×12 |
| `icone-pausa` | 🧪 protótipo | parado | 12×12 |
| `moeda-bloco` | 🧪 protótipo | parado | 10×10 |

### Isekai (o cogumelo Davi)

| Sprite | Status | Estados | Tamanho |
|---|---|---|---|
| `cogumelo-davi` | 🧪 protótipo | parado, assustado, assustado-andando, assustado-correndo, assustado-pulando, tremendo, sem-chapeu, sem-chapeu-andando, sem-chapeu-correndo, sem-chapeu-pulando, sem-chapeu-tremendo, sem-chapeu-inspira, sem-chapeu-espirro, espirro-antes, espirro, feliz, feliz-andando, feliz-correndo, feliz-pulando, grande, grande-andando, grande-correndo, grande-pulando, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 24×28 |
| `cogumelo-comum` | 🧪 protótipo | parado | 18×20 |
| `cogumelo-roxo` | 🧪 protótipo | parado | 18×20 |
| `cogumelo-verde` | 🧪 protótipo | parado | 18×20 |
| `goblin` | 🧪 protótipo | parado, anotando, feliz, rindo, alerta, conjurar | 30×48 |
| `goblin-mago` | 🧪 protótipo | parado, anotando, feliz, rindo, alerta, conjurar | 30×48 |
| `heroi-aventureiro` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `heroi-aventureira` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `heroi-grandao` | 🧪 protótipo | parado, sentado, sentado-lado, costas, sentado-costas, espirro-antes, espirro, rosto-macabro-cresce, rosto-macabro-range, rosto-macabro-abre, rosto-feliz, rosto-rindo, rosto-triste, rosto-chorando, rosto-bravo, rosto-surpreso, rosto-assustado, rosto-envergonhado, rosto-pensativo, rosto-macabro, rosto-macabro-fechado, rosto-macabro-boca, rosto-macabro-a, rosto-macabro-b, rosto-macabro-c, rosto-macabro-v2, rosto-bug | 28×44 |
| `heroi-aventureiro-dormindo` | 🧪 protótipo | parado | 44×25 |
| `heroi-aventureira-dormindo` | 🧪 protótipo | parado | 44×25 |
| `heroi-grandao-dormindo` | 🧪 protótipo | parado | 44×26 |
| `espada-heroi` | 🧪 protótipo | parado, golpe-dir, golpe-esq | 40×20 |
| `chapeu-davi` | 🧪 protótipo | parado, grande | 24×14 |

## Personagens

Uso: `{ "id": "x", "personagem": "nome" }`

| Personagem | Status | Sprite | Voz |
|---|---|---|---|
| `vovo` | 🧪 protótipo | `vovo` | 0.8 |
| `carteiro` | 🧪 protótipo | `carteiro` | 1.1 |
| `sorveteiro` | 🧪 protótipo | `sorveteiro` | 0.9 |
| `rival` | 🧪 protótipo | `rival` | 1.35 |
| `nina` | 🧪 protótipo | `rival` | 1.35 |
| `menino-pijama` | 🧪 protótipo | `menino-pijama` | 1.45 |
| `menino-coroa` | 🧪 protótipo | `menino-coroa` | 1.3 |
| `gato-chapeu` | 🧪 protótipo | `gato-chapeu` | 1.8 |
| `gato-monstro` | 🧪 protótipo | `gato-monstro` | 0.7 |
| `guardiao-azul` | 🧪 protótipo | `guardiao-azul` | 1 |
| `guardia-verde` | 🧪 protótipo | `guardia-verde` | 1.25 |
| `guardiao-chefe` | 🧪 protótipo | `guardiao-chefe` | 0.75 |
| `guardiao-noturno` | 🧪 protótipo | `guardiao-noturno` | 0.85 |
| `fantasma-lencol` | 🧪 protótipo | `fantasma-lencol` | 0.9 |
| `fantasma-crianca` | 🧪 protótipo | `fantasma-crianca` | 1.5 |
| `fantasma-vovo` | 🧪 protótipo | `fantasma-vovo` | 0.8 |
| `fantasma-sombra` | 🧪 protótipo | `fantasma-sombra` | 0.5 |
| `fantasma-cachorro` | 🧪 protótipo | `fantasma-cachorro` | 1.3 |
| `cachorro-caramelo` | 🧪 protótipo | `cachorro-caramelo` | 1.3 |
| `cachorro-preto` | 🧪 protótipo | `cachorro-preto` | 1 |
| `cachorro-branco` | 🧪 protótipo | `cachorro-branco` | 1.4 |
| `cachorro-cinza` | 🧪 protótipo | `cachorro-cinza` | 1.1 |
| `cachorro-chique` | 🧪 protótipo | `cachorro-chique` | 1.6 |
| `vira-lata` | 🧪 protótipo | `vira-lata` | 1.2 |
| `padeiro-pregador` | 🧪 protótipo | `padeiro-pregador` | 0.85 |
| `cao-policial` | 🧪 protótipo | `cao-policial` | 1.2 |
| `mae` | 🧪 protótipo | `mae` | 1.1 |
| `mae-avental` | 🧪 protótipo | `mae-avental` | 1.1 |
| `menino-topete` | 🧪 protótipo | `menino-topete` | 1.4 |
| `brinquedo-soldadinho` | 🧪 protótipo | `brinquedo-soldadinho` | 0.8 |
| `brinquedo-boneca` | 🧪 protótipo | `brinquedo-boneca` | 1.4 |
| `brinquedo-robo` | 🧪 protótipo | `brinquedo-robo` | 0.6 |
| `brinquedo-caixa` | 🧪 protótipo | `brinquedo-caixa` | 1.6 |
| `brinquedo-soldadinho-sem-rosto` | 🧪 protótipo | `brinquedo-soldadinho-sem-rosto` | 0.7 |
| `brinquedo-boneca-sem-rosto` | 🧪 protótipo | `brinquedo-boneca-sem-rosto` | 1.2 |
| `brinquedo-robo-sem-rosto` | 🧪 protótipo | `brinquedo-robo-sem-rosto` | 0.5 |
| `brinquedo-caixa-sem-rosto` | 🧪 protótipo | `brinquedo-caixa-sem-rosto` | 1.4 |
| `motorista` | 🧪 protótipo | `motorista` | 0.85 |
| `gari` | 🧪 protótipo | `gari` | 0.95 |
| `pipoqueiro` | 🧪 protótipo | `pipoqueiro` | 0.9 |
| `medica` | 🧪 protótipo | `medica` | 1.1 |
| `rei` | 🧪 protótipo | `rei` | 0.8 |
| `rainha` | 🧪 protótipo | `rainha` | 1.1 |
| `princesa` | 🧪 protótipo | `princesa` | 1.4 |
| `cavaleiro` | 🧪 protótipo | `cavaleiro` | 0.9 |
| `campones` | 🧪 protótipo | `campones` | 1 |
| `camponesa` | 🧪 protótipo | `camponesa` | 1.15 |
| `ferreiro` | 🧪 protótipo | `ferreiro` | 0.8 |
| `bruxa` | 🧪 protótipo | `bruxa` | 1.25 |
| `mago` | 🧪 protótipo | `mago` | 0.85 |
| `avatar-bloco-vermelho` | 🧪 protótipo | `avatar-bloco-vermelho` | 1.3 |
| `avatar-bloco-roxo` | 🧪 protótipo | `avatar-bloco-roxo` | 1.4 |
| `avatar-bloco-verde` | 🧪 protótipo | `avatar-bloco-verde` | 1.2 |
| `avatar-bloco-azul` | 🧪 protótipo | `avatar-bloco-azul` | 1.3 |
| `avatar-bloco-capuz` | 🧪 protótipo | `avatar-bloco-capuz` | 0.6 |
| `avatar-bia` | 🧪 protótipo | `avatar-bia` | 1.2 |
| `avatar-nina` | 🧪 protótipo | `avatar-nina` | 1.3 |
| `avatar-topete` | 🧪 protótipo | `avatar-topete` | 1.4 |
| `avatar-leo-1` | 🧪 protótipo | `avatar-leo-1` | 1.4 |
| `avatar-leo-2` | 🧪 protótipo | `avatar-leo-2` | 1.4 |
| `manequim` | 🧪 protótipo | `manequim` | 0.9 |
| `manequim-coberto` | 🧪 protótipo | `manequim-coberto` | 0.9 |
| `cogumelo-davi` | 🧪 protótipo | `cogumelo-davi` | 1.5 |
| `cogumelo-comum` | 🧪 protótipo | `cogumelo-comum` | 1.6 |
| `cogumelo-roxo` | 🧪 protótipo | `cogumelo-roxo` | 1.6 |
| `cogumelo-verde` | 🧪 protótipo | `cogumelo-verde` | 1.6 |
| `goblin` | 🧪 protótipo | `goblin` | 1.3 |
| `goblin-mago` | 🧪 protótipo | `goblin-mago` | 1.3 |
| `heroi-aventureiro` | 🧪 protótipo | `heroi-aventureiro` | 1 |
| `heroi-aventureira` | 🧪 protótipo | `heroi-aventureira` | 1.15 |
| `heroi-grandao` | 🧪 protótipo | `heroi-grandao` | 0.8 |
| `heroi-aventureiro-dormindo` | 🧪 protótipo | `heroi-aventureiro-dormindo` |  |
| `heroi-aventureira-dormindo` | 🧪 protótipo | `heroi-aventureira-dormindo` |  |
| `heroi-grandao-dormindo` | 🧪 protótipo | `heroi-grandao-dormindo` |  |
| `protagonista` | ✅ | `heroi` | 1 |
| `companheira` | ✅ | `amiga` | 1.3 |
| `anciao` | ✅ | `velho` | 0.8 |
| `crianca` | ✅ | `crianca` | 1.5 |
| `guarda` | ✅ | `guarda` | 0.9 |
| `mestre` | ✅ | `mago` | 0.75 |
| `vilao` | ✅ | `pessoa` | 0.65 |
| `mascote` | ✅ | `slime` | 1.7 |
| `monstro` | ✅ | `slime` | 0.6 |
| `menina-capa` | ✅ | `menina-capa` | 1.2 |
| `robo-semaforo` | ✅ | `robo-semaforo` | 0.7 |
| `pombo-fofoqueiro` | ✅ | `pombo-fofoqueiro` | 1.6 |
| `lixeira-timida` | ✅ | `lixeira-timida` | 1.2 |
| `cao-guarda` | ✅ | `cao-guarda` | 0.9 |
| `fantasma-metro` | ✅ | `fantasma-metro` | 1.4 |
| `coruja-banca` | ✅ | `coruja-banca` | 0.6 |
| `cone-agressivo` | ✅ | `cone-agressivo` | 0.8 |
| `bueiro-olhos` | ✅ | `bueiro-olhos` | 0.5 |
| `policial` | ✅ | `policial` | 0.9 |
| `prefeito` | ✅ | `prefeito` | 0.7 |
| `aluno` | ✅ | `aluno` | 1.4 |
| `aluna` | ✅ | `aluna` | 1.5 |
| `professora` | ✅ | `professora` | 1.15 |
| `padeiro` | ✅ | `padeiro` | 0.85 |
| `caixa` | ✅ | `caixa` | 1.1 |
| `policial-oculos` | ✅ | `policial-oculos` | 0.9 |
| `prefeito-careca` | ✅ | `prefeito-careca` | 0.7 |
| `cone-monstro` | ✅ | `cone-monstro` | 0.6 |

## Cenários

Uso: `{ "cenario": "nome" }`

| Cenário | Status | Vista | Objetos |
|---|---|---|---|
| `praca-feira` | 🧪 protótipo | diorama | 14 |
| `praca-seca` | 🧪 protótipo | diagonal | 15 |
| `rua-alagada` | 🧪 protótipo | diagonal | 0 |
| `rua-estrelas` | 🧪 protótipo | diagonal | 3 |
| `quarto-menina-diorama` | 🧪 protótipo | diorama (cômodo quarto-menina) | 0 |
| `quarto-leo-diorama` | 🧪 protótipo | diorama (cômodo quarto-leo) | 0 |
| `quarto-nina-diorama` | 🧪 protótipo | diorama (cômodo quarto-nina) | 0 |
| `quarto-menina-noite-diorama` | 🧪 protótipo | diorama (cômodo quarto-menina-noite) | 0 |
| `quarto-menina` | 🧪 protótipo | lateral (quarto-menina) | 7 |
| `quarto-menina-noite` | 🧪 protótipo | lateral (quarto-menina-noite) | 7 |
| `quarto-menino-3d` | 🧪 protótipo | 3d | 0 |
| `quarto-menino-noite-3d` | 🧪 protótipo | 3d | 0 |
| `sala-de-aula-3d` | 🧪 protótipo | 3d | 0 |
| `sala-de-estar-3d` | 🧪 protótipo | 3d | 0 |
| `praca-3d` | 🧪 protótipo | 3d | 7 |
| `estrada-terra` | 🧪 protótipo | diorama | 11 |
| `ponte-rio` | 🧪 protótipo | diorama | 6 |
| `ponte-rio-noite` | 🧪 protótipo | diorama | 3 |
| `beco` | 🧪 protótipo | diorama (cômodo beco) | 0 |
| `rua-junina` | 🧪 protótipo | diorama | 7 |
| `rua-chuva` | 🧪 protótipo | diorama | 0 |
| `rua-chuva-noite` | 🧪 protótipo | diorama | 0 |
| `delegacia-diorama` | 🧪 protótipo | diorama (cômodo delegacia) | 0 |
| `delegacia-noite-diorama` | 🧪 protótipo | diorama (cômodo delegacia-noite) | 0 |
| `cozinha-diorama` | 🧪 protótipo | diorama (cômodo cozinha) | 0 |
| `cozinha-noite-diorama` | 🧪 protótipo | diorama (cômodo cozinha-noite) | 0 |
| `banheiro-diorama` | 🧪 protótipo | diorama (cômodo banheiro) | 0 |
| `banheiro-noite-diorama` | 🧪 protótipo | diorama (cômodo banheiro-noite) | 0 |
| `sala-de-estar-noite-diorama` | 🧪 protótipo | diorama (cômodo sala-estar-noite) | 0 |
| `rua-brinquedos` | 🧪 protótipo | diorama | 0 |
| `fabrica-brinquedos` | 🧪 protótipo | diorama | 0 |
| `loja-brinquedos-diorama` | 🧪 protótipo | diorama (cômodo loja-brinquedos) | 0 |
| `fabrica-brinquedos-diorama` | 🧪 protótipo | diorama (cômodo fabrica-brinquedos) | 0 |
| `loja-fundos-diorama` | 🧪 protótipo | diorama (cômodo loja-fundos) | 0 |
| `sala-manequins-diorama` | 🧪 protótipo | diorama (cômodo sala-manequins) | 0 |
| `mundo-bloco` | 🧪 protótipo | diorama | 12 |
| `mundo-bloco-tarde` | 🧪 protótipo | diorama | 12 |
| `mundo-bloco-corrida` | 🧪 protótipo | diorama | 30 |
| `cidade-bloco` | 🧪 protótipo | diorama | 18 |
| `parkour-bloco` | 🧪 protótipo | diorama | 17 |
| `parkour-campeonato` | 🧪 protótipo | diorama | 17 |
| `mundo-bloco-grama` | 🧪 protótipo | diorama | 14 |
| `vila-medieval` | 🧪 protótipo | diorama | 8 |
| `castelo-medieval` | 🧪 protótipo | diorama | 4 |
| `salao-trono-diorama` | 🧪 protótipo | diorama (cômodo salao-trono) | 0 |
| `taverna-diorama` | 🧪 protótipo | diorama (cômodo taverna) | 0 |
| `rua-viva` | 🧪 protótipo | diorama | 0 |
| `rua-transito` | 🧪 protótipo | diorama | 4 |
| `rua-tarde` | 🧪 protótipo | diorama | 0 |
| `praca-tarde` | 🧪 protótipo | diorama | 7 |
| `rua-vento` | 🧪 protótipo | diorama | 0 |
| `rua-neblina` | 🧪 protótipo | diorama | 0 |
| `praca-parquinho` | 🧪 protótipo | diorama | 10 |
| `rua-bairro` | 🧪 protótipo | diorama | 0 |
| `casa-bia-fora` | 🧪 protótipo | diorama | 5 |
| `escola-patio` | 🧪 protótipo | diorama | 11 |
| `onibus-dentro-diorama` | 🧪 protótipo | diorama (cômodo onibus-dentro) | 0 |
| `mercado-dentro-diorama` | 🧪 protótipo | diorama (cômodo mercado-dentro) | 0 |
| `consultorio-diorama` | 🧪 protótipo | diorama (cômodo consultorio) | 0 |
| `biblioteca-diorama` | 🧪 protótipo | diorama (cômodo biblioteca) | 0 |
| `floresta-isekai` | 🧪 protótipo | diorama | 77 |
| `acampamento` | ✅ | lateral (floresta-noite) | 4 |
| `vila` | ✅ | lateral (floresta-dia) | 4 |
| `vila-noite` | ✅ | lateral (floresta-noite) | 3 |
| `masmorra` | ✅ | lateral (caverna) | 3 |
| `rua-chuvosa` | ✅ | lateral (cidade-noite) | 2 |
| `oasis` | ✅ | lateral (deserto) | 3 |
| `cidade-rpg` | ✅ | lateral (cidade-noite) | 2 |
| `cidade-rpg-chuva` | ✅ | lateral (cidade-noite) | 2 |
| `batalha` | ✅ | lateral (preto) | 0 |
| `escola` | ✅ | lateral (cidade-dia) | 2 |
| `delegacia` | ✅ | lateral (cidade-dia) | 3 |
| `padaria` | ✅ | lateral (cidade-dia) | 2 |
| `mercado` | ✅ | lateral (cidade-dia) | 2 |
| `farmacia` | ✅ | lateral (cidade-dia) | 2 |
| `rua-comercial` | ✅ | diorama | 0 |
| `rua-comercial-noite` | ✅ | diorama | 0 |
| `sala-de-aula` | ✅ | lateral (sala-aula) | 9 |
| `quarto-menino` | ✅ | lateral (quarto-menino) | 9 |
| `quarto-menino-noite` | ✅ | lateral (quarto-menino-noite) | 9 |
| `sala-de-estar` | ✅ | lateral (sala-estar) | 8 |
| `sala-de-aula-diorama` | ✅ | diorama (cômodo sala-aula) | 0 |
| `quarto-menino-diorama` | ✅ | diorama (cômodo quarto-menino) | 0 |
| `quarto-menino-noite-diorama` | ✅ | diorama (cômodo quarto-menino-noite) | 0 |
| `sala-de-estar-diorama` | ✅ | diorama (cômodo sala-estar) | 0 |
| `praca-festa` | ✅ | lateral (cidade-dia) | 7 |
| `praca-festa-noite` | ✅ | lateral (cidade-noite) | 5 |
| `rua-festa` | ✅ | diorama | 4 |
| `morro-mirante` | ✅ | lateral (floresta-noite) | 3 |
| `rua-monstros` | ✅ | lateral (cidade-dia) | 3 |
| `praca` | ✅ | diorama | 11 |
| `praca-noite` | ✅ | diorama | 11 |
| `praca-decorada` | ✅ | diorama | 15 |
| `praca-decorada-noite` | ✅ | diorama | 15 |

## Ações

`andar`, `correr`, `mover`, `pular`, `virar`, `falar`, `coletar`, `aparecer`, `sumir`, `explosao`, `tremer`, `flash`, `emocao`, `piscar`, `camera`, `magia`, `som`, `congelar`, `sentar`, `levantar`, `espirrar`, `fogos`, `expressao`, `trocar`, `desaparecer`, `numero`, `golpe`, `esporos`, `pensar`, `destaque`, `sombra`, `contador`, `placar`, `continua` (detalhes no README).

## Sons

Efeitos: `passo`, `pulo`, `aterrissar`, `moeda`, `item`, `vida`, `powerup`, `puf`, `explosao`, `tremor`, `blip`, `surpresa`, `duvida`, `amor`, `dano`, `magia`, `revelar`, `transicao`, `porta`, `clique`, `sucesso`, `erro`, `soco`, `espada`, `sombra-surge`, `sombra-some`, `sino`, `sino-relogio`, `cadeado`, `papel`, `sininho`, `sombra`, `espirro-inspira`, `espirro`, `esporos`, `fogos-sobe`, `fogos`, `guardiao-susto`, `miau`, `miau-monstro`, `trovao`, `suspense`, `fantasma`, `servo`, `corda`, `caixinha-musica`, `falha-eletrica`, `entrar-jogo`, `pulo-bloco`, `ai`, `chat`, `bug-jogo`, `trilha-suspense`, `trilha-comedia`, `trilha-emocional`

Ambientes: `chuva`, `vento`, `grilos`, `passaros`, `fogo`, `caverna`, `espaco`, `cidade`
