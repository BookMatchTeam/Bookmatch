# Relatório: <Nome da funcionalidade>

- **Spec:** [spec.md](./spec.md)
- **Escopo:** backend | frontend
- **Status:** concluída | parcial
- **Branch:** <feat/...>

<!--
Molde de relatório do BookMatch.

Para que serve:
- Registra o que a implementação entregou em relação à spec. Quem lê é o
  agente da etapa seguinte (por exemplo, o do frontend ao integrar o backend).
- Traz só o que o código e a spec não contam sozinhos. Não liste arquivos
  criados ou alterados: o diff já mostra isso.

Como preencher:
- Copie este arquivo para `docs/specs/<funcionalidade>/relatorio.md`.
- Antes de escrever, rode `git diff main...HEAD --stat`, leia os DTOs,
  controllers e exceptions alterados e rode os testes. Copie rotas, campos e
  `code` de erro do código. Não escreva nada de memória.
- Se a sessão de implementação foi compactada, gere o relatório numa sessão
  nova (`/clear`).
- Seção sem conteúdo recebe "Nenhum." e não é apagada.
- Limite: cerca de 50 linhas preenchidas.
- Apague estes comentários ao preencher.
-->

## Resumo

<!-- 2 ou 3 linhas: o que passou a funcionar. -->

## Desvios da spec

<!--
Tudo que ficou diferente do combinado: regra, fluxo, rota, campo, status ou
code de erro. A referência aponta para o item da spec (RN-xx, CA-xx, rota).
-->

| Referência | O que mudou | Motivo |
|---|---|---|
| <RN-03> | <...> | <...> |

## Decisões fora da spec

<!--
Escolhas que a spec não cobria e que afetam quem vai consumir esta entrega.
Detalhes internos (nome de classe, biblioteca de hash) não entram.
-->

## Critérios de aceite

<!--
Um critério por linha, na ordem da spec. Todo CA da spec aparece aqui.
"Teste" é o arquivo e o nome do teste que comprova o critério.
-->

| CA | Situação | Teste |
|---|---|---|
| CA-01 | coberto \| não implementado | <test/auth/register.e2e-spec.ts › "..."> |

## Para quem integra

<!--
O que o OpenAPI (/api/docs) não mostra e a etapa seguinte precisa saber:
sessão e cookies, ordem das telas, erros que cada tela deve tratar,
limites (tamanho de arquivo, rate limit), e-mails enviados.
-->

## Pendências

<!-- O que ficou para depois e o próximo passo de cada item. -->
