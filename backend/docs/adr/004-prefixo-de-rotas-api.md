# ADR-004: Prefixo `/api` nas rotas da aplicação

- **Status:** Aceito
- **Data:** 2026-11-16

## Contexto

As rotas estavam inconsistentes: o health check respondia em `/health`, sem
prefixo, e o Swagger em `/api/docs`. Antes da primeira rota de negócio era
preciso definir como as URLs começam, porque depois que o frontend passa a
chamá-las, mudar o prefixo quebra os clientes. Como o frontend é um PWA,
versões antigas podem continuar em uso nos dispositivos por algum tempo.

A API já tem domínio próprio (`api-bookmatch.galpao.tech`), separado do
frontend no Caddy de borda.

## Decisão

As rotas da aplicação ficam sob o prefixo global `/api`, configurado em
`configure-app.ts` (`API_PREFIX`):

```text
POST /api/auth/register     rotas da aplicação
GET  /api/docs              Swagger
GET  /health                infraestrutura, fora do prefixo
```

O `/health` fica fora do prefixo porque o healthcheck do Docker, o smoke test
e o CD dependem dele, e não devem mudar junto com as rotas da aplicação.

## Alternativas consideradas

- **Sem prefixo** (`/auth/register`): o mais simples, já que a API tem domínio
  próprio. Descartado em favor da consistência com o Swagger em `/api/docs` e
  de um espaço de rotas da aplicação claramente delimitado.
- **Prefixo de versão** (`/v1/auth/register`): permitiria manter uma versão
  antiga de uma rota no ar enquanto PWAs desatualizados ainda a chamam.
  Descartado por ora. Se o versionamento se tornar necessário, um novo ADR
  pode adotá-lo dentro do prefixo atual (`/api/v1/...`).

## Consequências

- O frontend usa `https://api-bookmatch.galpao.tech/api` como base das
  chamadas.
- As URLs ficam com o trecho `api` duas vezes (`api-bookmatch...`/`api/...`).
- Não há versionamento: mudanças incompatíveis em uma rota exigem coordenação
  com a atualização do frontend.
- O tratamento de rota inexistente do NestJS só é registrado dentro do
  prefixo. Fora de `/api` (exceto `/health`), uma rota inexistente recebe o
  404 em texto puro do adaptador HTTP (`Cannot GET /caminho`), fora do formato
  do [ADR-003](003-formato-unico-de-erro.md). A resposta não contém dados
  sensíveis, e o frontend só chama rotas sob `/api`.
