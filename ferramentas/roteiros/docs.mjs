import fs from 'node:fs';
import { caminhoProjeto } from '../../src/projeto.js';
import { lerJsonFlexivel } from '../../src/biblioteca.js';
const lerRoteiro = (d) => lerJsonFlexivel(d + '/roteiro.json');
const P = {
  'nesse-mundo-guardioes': { fmt: 'curto (Shorts), terror — variação "olhar invertido" (a excluída era a única em perigo de verdade)',
    ideia: 'Cada pessoa tem um guardião que dorme ao lado da cabeça e só acorda no perigo. O da Bia nunca dormiu, e a cidade decide que o perigo é ela. Numa noite, todos os guardiões da rua acordam olhando para a casa dela. A virada: o perigo nunca foi ela; havia alguém em pé atrás dela há dez anos.',
    pista: 'cena 4 (o guardião olha fixo para as costas dela).',
    assets: 'protótipos: guardiões (`guardiao-azul`, `guardia-verde`, `guardiao-noturno`, `guardiao-chefe`, estados dormindo/alerta/feliz) , estados novos `olhando-lado` e `tremendo`, `vulto` como a presença e `quarto-menina-noite-diorama`; resto aprovado.',
    novos: '—',
    pub: { t: 'Nessa cidade, o guardião só acorda no perigo 👁️ #shorts', d: 'Todo mundo em Vila Serena tem um guardião que dorme ao lado da cabeça. Ele só acorda no perigo. O da Bia nunca dormiu. Nem uma noite.', tags: '#shorts #pixelart #animação #nessemundo #terror #historiasempixel' } },
  'nesse-mundo-numeros': { fmt: 'curto (Shorts), terror — "exceção sortuda" com final que vira, e o prefeito usando a regra a favor',
    ideia: 'Todo mundo tem um número na cabeça; a cidade acha que são os amigos. O prefeito Arlindo faz a praça gritar o nome dele em todo comício (3 mil). A rival da Bia tem o número zero: ninguém sabe o nome dela, todos a chamam só de "a rival". Numa noite de neblina, uma voz chama nomes pela rua, do maior número para o menor, e quem é chamado abre a porta e some. A virada: o número conta quantas vezes disseram o seu nome. O dela ninguém nunca disse... até a voz sussurrar "Nina" (o nome da rival, revelado só no final) e o número virar 1.',
    pista: 'cena 2 (o aluno diz "Oi, Bia!" e o número dela sobe de 9 para 10) e cena 4 (a praça grita o nome do prefeito e o número dele sobe).',
    assets: 'números no estilo placa (`numero` + ação `numero`); protótipos `rival` (a Nina), `vulto` (a voz), clima `neblina` e `quarto-menina-noite-diorama`; resto aprovado.',
    novos: '—',
    pub: { t: 'Nessa cidade, todo mundo tem um número na cabeça 🔢 #shorts', d: 'Em Vila Serena, o número em cima da cabeça mostra quantos amigos você tem. O prefeito tem três mil. A menina zero, nenhum. Até a noite da neblina.', tags: '#shorts #pixelart #animação #nessemundo #terror #historiasempixel' } },
  'nesse-mundo-sombras': { fmt: 'curto (Shorts), sombrio — variação "exceção sortuda"',
    ideia: 'A sombra de todo mundo chega um minuto antes da pessoa e a cidade a segue cegamente. A da Bia vai sempre para o lado contrário. A virada: as sombras não guiam, elas levam — e a da Bia estava tentando salvá-la.',
    pista: 'cena 3 (a sombra dela puxa para o outro lado) e cena 7 ("com força").',
    assets: 'protótipos `sombraPessoa` (sombras sem dono) e ação `sombra` (cena 10: a escuridão nasce no meio do grupo, sobe pelas pessoas e elas desaparecem). Das cenas 9 a 12 a Bia fica escondida atrás de uma árvore (`arvore-iso-grande` em x -7.4, z -9.9; Bia em x -5.7, z -8.5); resto aprovado.',
    novos: '—',
    pub: { t: 'Nessa cidade, a sua sombra chega antes de você 👣 #shorts', d: 'Em Vila Serena, todo mundo segue a própria sombra. Menos a Bia: a dela sempre vai para o lado contrário... até o domingo em que todas as sombras saíram andando.', tags: '#shorts #pixelart #animação #nessemundo #terror #historiasempixel' } },
  'nesse-mundo-fantasminha': { fmt: 'curto (Shorts), cômico — variação "lista de 3"',
    ideia: 'Todo fantasma precisa arrancar um grito até a meia-noite ou some. A fantasminha tímida tenta 3 vezes: o seu Tonho dá um pão, o policial dorme em pé, e a Bia grita... de fofura. Grito é grito.',
    pista: 'cena 2 (a regra diz "um grito", não "um susto").',
    assets: 'protótipos `fantasma-crianca`, `fantasma-lencol`, `fantasma-vovo`, `relogio-praca`, `pao` e `quarto-menina-(noite-)diorama`; resto aprovado.',
    novos: '—',
    pub: { t: 'Nessa cidade, todo fantasma precisa de um grito 👻 #shorts', d: 'Se um fantasma não arranca um grito até a meia-noite, ele some para sempre. E essa fantasminha é tímida demais...', tags: '#shorts #pixelart #animação #nessemundo #comedia #historiasempixel' } },
  'nesse-mundo-relogio': { fmt: 'curto (Shorts), emocional — variação "consequência inesperada"',
    ideia: 'Na virada do ano, o relógio da praça anda para trás e quem está na praça fica um ano mais novo. A vovó da Bia, a mais velha da cidade, nunca vai. A virada: o ano que a cidade perde, alguém leva — e ela fica de fora de propósito há 180 anos. No fim a Bia fica com ela na calçada.',
    pista: 'cena 4 e 5 (ela nunca foi e é a mais velha da cidade).',
    assets: 'protótipos `vovo` e `relogio-praca` (estados h12 → h11-55 → h9 → h6 → h3 fazem os ponteiros "voltarem"); resto aprovado.',
    novos: 'FEITO (protótipo): ação `fogos` na meia-noite e no final.',
    pub: { t: 'Nessa cidade, o relógio da virada anda para trás ⏳ #shorts', d: 'Na virada do ano, quem está na praça fica um ano mais novo. Mas a vovó da Bia nunca foi na festa. Nem uma vez.', tags: '#shorts #pixelart #animação #nessemundo #emocionante #historiasempixel' } },
  'nesse-mundo-espirro': { fmt: 'longo (1:30–2:30), cômico — 8 partes',
    ideia: 'Quem espirra troca de corpo com quem está mais perto. A Bia, alérgica, espirra sempre duas vezes e nunca trocou com ninguém ("sorte"). Na Festa da Primavera o pólen espalha trocas pela praça (prefeito latindo, policial multando com voz fininha). A virada: o 2º espirro desfaz a troca; e o seu Tonho é, na verdade, o pombo da padaria (espirrou uma vez só, 30 anos atrás). A Bia sopra a pimenta da merenda e desfaz tudo — menos Tonho e o pombo, que preferem ficar assim.',
    pista: 'Tonho cisca migalhas (cena 5) e o pombo olha o forno com saudade (cena 6); Bia espirra duas vezes (cena 8); a pimenta no bolso (cena 9).',
    assets: 'só aprovados (`praca-decorada`, `rua-comercial`, `sala-de-aula-diorama`, `quarto-menino-diorama`, moradores, `menina-capa`, `pombo-fofoqueiro`, `cao-guarda`, `sanduiche`). Troca de corpo = flash + faíscas + "?" nos dois e balões com a fala do outro.',
    novos: 'FEITO (protótipo): pose de espirro (`espirro-antes`/`espirro`), ação `espirrar` e sons `espirro-inspira`/`espirro` (um `biblioteca/sfx/espirro.mp3` do ElevenLabs substitui o sintetizado). Também FEITOS (protótipo): clima `polen`, `saquinho-pimenta`, `pao`, `padeiro-pregador` e o quarto da Bia em `quarto-menina-diorama`.',
    pub: { t: 'Nessa cidade, quem espirra troca de corpo 🤧 | Nesse Mundo', d: 'Em Vila Serena, um espirro troca você de corpo com quem estiver mais perto. Por isso a fila do mercado tem três quarteirões. Mas a Bia, alérgica a quase tudo, nunca trocou com ninguém...', tags: '#pixelart #animação #nessemundo #comedia #historiasempixel' } },
  'nesse-mundo-cachorros': { fmt: 'longo (1:30–2:30), cômico — 8 partes',
    ideia: 'Todo cachorro fala em voz alta o que o dono pensa. O Caio, único menino sem cachorro, conversa com os cachorros dos outros. No debate da eleição, o cachorro do prefeito late "quero ir para casa dormir" e os segredos explodem pela praça; o prefeito manda prender os cães. A virada: cachorro fala o que ELE pensa, e os donos sempre concordaram de vergonha (o Bolota só está com fome há 15 anos). O Caio usa o latido imitado e pergunta a cada cão o que quer. Callback: "Agora, hora da janta."',
    pista: 'os cachorros respondem ao Caio coisas que ninguém entende (cena 10); o Bolota e o "hora do lanche" (cenas 5–6).',
    assets: 'cada dono tem seu cão (protótipos `cachorro-caramelo`/`-preto`/`-branco`/`-cinza`/`-chique` e `vira-lata`); o Bolota é o `cao-guarda` (de uniforme, da delegacia). Protótipos também: ícone `gota` e ação `pensar`.',
    novos: 'FEITO (protótipo): variações de cachorro.',
    pub: { t: 'Nessa cidade, o seu cachorro fala o que você pensa 🐶 | Nesse Mundo', d: 'Em Vila Serena, todo cachorro late em voz alta o que o dono está pensando. Por isso ninguém leva cachorro em entrevista de emprego. Até o dia do debate da eleição...', tags: '#pixelart #animação #nessemundo #comedia #historiasempixel' } },
};
for (const [nome, info] of Object.entries(P)) {
  const dir = caminhoProjeto(nome);
  const r = lerRoteiro(dir);
  const linhas = [`# ${r.titulo}`, '', `**Formato:** ${info.fmt}. **Vista:** diorama em todas as cenas. **Narração:** narrador em 3ª pessoa, um único áudio.`, '',
    `**Ideia:** ${info.ideia}`, '', `**Pista plantada:** ${info.pista}`, '', `**Assets usados:** ${info.assets}`, '', `**Assets novos (protótipos, aguardando o "pode salvar"):** ${info.novos}`, '', '---', ''];
  r.cenas.forEach((c, i) => {
    const bal = (c.acoes || []).filter((a) => a.tipo === 'falar').map((a) => `${a.alvo}: "${a.texto.replace(/^\* /, '')}"`);
    linhas.push(`**${i + 1}.** \`${c.cenario}\` — ${c.narracaoTexto}${bal.length ? `  \n   _Balões:_ ${bal.join(' · ')}` : ''}`);
  });
  linhas.push('', '**Texto para o ElevenLabs:** `narracao/TEXTO-COMPLETO.txt` → salve o áudio como `narracao/narracao-completa.mp3` (velocidade ~1,1).');
  fs.writeFileSync(dir + '/ROTEIRO.md', linhas.join('\n') + '\n');
  const curto = info.fmt.startsWith('curto');
  fs.writeFileSync(dir + '/PUBLICACAO.md', [`# Publicação — ${r.titulo}${curto ? ' (Short)' : ''}`, '', '## Arquivos', '- Narração (ElevenLabs): `narracao/narracao-completa.mp3`',
    curto ? '- Vídeo para publicar (9:16): `saida/final-shorts.mp4`' : '- Vídeo longo (16:9): `saida/final.mp4`  ·  Shorts (9:16): `saida/final-shorts.mp4`', '',
    '## Título', info.pub.t, '', '## Descrição', info.pub.d, '', info.pub.tags, ''].join('\n'));
}
