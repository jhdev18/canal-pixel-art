# Músicas para a versão final COM música

Coloque aqui as suas músicas (.mp3, .wav, .m4a, .ogg, .flac). Elas servem para qualquer vídeo.
Para uma música só de um vídeo, use a pasta `projetos/<video>/musica/` (ela tem prioridade).

```
npm run final-musica -- nesse-mundo-pausa
npm run final-musica -- nesse-mundo-pausa --musica minha-musica.mp3 --volume 0.3
```

- Gera `saida/final-musica.mp4` (16:9) e `saida/final-shorts-musica.mp4` (Shorts). O `final.mp4` padrão (sem música) não muda.
- Se o `final.mp4` já existe, o vídeo é reaproveitado e só o áudio é refeito (leva segundos). `--renderizar` força renderizar de novo.
- A música entra no lugar da trilha gerada, em loop, com entrada suave, saída no fim e abaixando sozinha quando o narrador fala.
- `--volume` (0 a 1; padrão 0.25 ou `"volumeMusica"` no roteiro) e `--abaixar` (0 a 1: quanto abaixa na fala; padrão 0.5 ou `"abaixarMusica"`).
- Sem `--musica`, usa a primeira música (em ordem alfabética) da pasta do vídeo e, se não houver, a primeira daqui.
