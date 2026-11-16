# Fundação da arquitetura do backend

Este documento organiza os itens transversais que precisam existir antes do
primeiro domínio (`auth`). Eles são usados por todos os domínios e servem de
padrão para os casos de uso que vierem depois.

A arquitetura de referência está em [`ARCHITECTURE.md`](../ARCHITECTURE.md).
Este documento acompanha a execução: cada item tem status, decisões e tarefas.

Branch de trabalho: `feat/backend-fundacao`.

## Ordem de execução

1. Configuração validada no boot.
2. Tratamento de erros padronizado.
3. Pasta `src/shared/` mínima.
4. ADRs em `docs/adr`.
5. Prefixo global de rotas.
6. Testes de integração com Prisma.

Os itens 1 e 2 vêm primeiro porque os demais dependem deles. Os testes de
integração ficam por último porque só passam a ter valor quando existir o
primeiro adaptador Prisma.

## Item 1 — Configuração validada no boot

Status: concluído.

Problema: o `PrismaService` lê `process.env` diretamente e, quando uma
variável falta, usa as credenciais de desenvolvimento (`bookmatch_dev`). Em
produção, uma variável esquecida passa sem aviso.

Proposta: um módulo de configuração tipado, validado na subida da aplicação.
Se alguma variável obrigatória faltar ou estiver inválida, a aplicação não
sobe e informa quais variáveis estão com problema.

- [x] Definir o esquema das variáveis (`PORT` e `DATABASE_*`).
- [x] Validar o esquema na subida e encerrar com erro legível quando falhar.
- [x] Expor a configuração tipada por injeção, sem leitura direta de
      `process.env` fora do módulo de configuração.
- [x] Remover os valores padrão de credenciais do `PrismaService`.
- [x] Atualizar `.env.example` e `deploy/env.production.example`.
- [x] Testes unitários da validação (variável ausente, vazia, inválida,
      limites de porta, vários problemas juntos, configuração imutável).

Como ficou:

- `src/config/environment.ts`: validação em TypeScript puro. Um leitor
  acumula os problemas de todas as variáveis e, se houver algum, lança um
  `ConfigurationValidationError` com a lista completa.
- `src/config/app-config.ts`: o tipo `AppConfig` e o token `APP_CONFIG`.
- `src/config/app-config.module.ts`: módulo global que carrega o `.env`,
  valida o ambiente e fornece `APP_CONFIG` por injeção.
- Testes e2e substituem `APP_CONFIG` com `overrideProvider`, sem depender de
  `.env`.

Para adicionar uma variável nova: incluir o campo em `AppConfig`, lê-la em
`validateEnvironment` com o leitor do tipo certo, cobrir com teste e
atualizar os dois arquivos de exemplo de ambiente.

`NODE_ENV` ficou de fora porque nada depende dele ainda. Entra quando o
primeiro comportamento precisar distinguir os ambientes.

## Item 2 — Tratamento de erros padronizado

Status: concluído.

Problema: o `ARCHITECTURE.md` diz que a infraestrutura traduz as exceptions da
aplicação para HTTP, mas esse mecanismo ainda não existe.

### Decisões

- **Modelo:** uma única classe base, `ApplicationException`, com `code` e
  `kind`. Cada domínio estende a base; a `kind` define a categoria da falha e
  o filtro global traduz a categoria para o status HTTP. Não há tabela de
  mapeamento por domínio.
- **Formato:** próprio, com três campos. O padrão RFC 9457 (Problem Details)
  foi avaliado e descartado: `type`, `title`, `detail` e `instance` não
  acrescentam informação para uma API com um único frontend.
- **Sem `requestId`, `fieldErrors` ou `success`.** O status HTTP já indica
  sucesso ou falha, e a validação por campo fica com o frontend.
- **Validação de DTO responde `422`**, e não o `400` padrão do NestJS. O `400`
  fica para requisições malformadas, como JSON inválido.
- **Mensagens em português**, seguras para exibir ao usuário. O cliente decide
  o comportamento pelo `code`, nunca pelo texto.

### Formato

```json
{
  "statusCode": 409,
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "Este e-mail já está cadastrado."
}
```

| Campo | Para quê |
|---|---|
| `statusCode` | O status HTTP, também disponível para quem só tem o corpo |
| `code` | Identificador estável, para o cliente decidir o que fazer |
| `message` | Texto seguro para exibir ao usuário |

### Tradução para HTTP

| Origem | Status | `code` |
|---|---|---|
| `kind: 'not_found'` | 404 | Do domínio |
| `kind: 'conflict'` | 409 | Do domínio |
| `kind: 'unauthenticated'` | 401 | Do domínio |
| `kind: 'forbidden'` | 403 | Do domínio |
| `kind: 'invalid_input'` | 422 | Do domínio |
| `kind: 'business_rule'` | 422 | Do domínio |
| Validação de DTO (`ValidationPipe`) | 422 | `VALIDATION_ERROR` |
| JSON malformado | 400 | `BAD_REQUEST` |
| Rota inexistente | 404 | `NOT_FOUND` |
| Outros `HttpException` 4xx do framework | O mesmo | Pelo status, ou `REQUEST_ERROR` |
| Qualquer outro erro, ou `HttpException` 5xx | 500 | `INTERNAL_ERROR` |

Nos erros do framework, a mensagem original (técnica e em inglês, como
`Cannot GET /rota`) é substituída por uma mensagem segura. No `500`, a
resposta é sempre genérica; a rota e o stack completo vão somente para o log.

### Tarefas

- [x] Criar a `ApplicationException` base sem dependência de NestJS.
- [x] Traduzir a `kind` para status HTTP no filtro global, com verificação de
      tipo garantindo que toda `kind` tenha um status.
- [x] Criar o filtro global e registrá-lo em `configure-app.ts`.
- [x] Padronizar os erros de validação do `ValidationPipe` no mesmo formato.
- [x] Tratar erros não esperados como `500` sem vazar detalhes internos.
- [x] Documentar o formato de erro no Swagger (schema `ApiErrorResponse`).
- [x] Testes unitários da exception e do filtro; testes e2e de exception da
      aplicação, erro inesperado, validação, JSON malformado, rota inexistente
      e Swagger.

### Como ficou

- `src/shared/application/exceptions/application.exception.ts`: a base
  `ApplicationException` e o tipo `ApplicationExceptionKind`.
- `src/shared/infra/http/global-exception.filter.ts`: o filtro global.
- `src/shared/infra/http/api-error-response.ts`: o formato único, com schema
  no Swagger.
- `test/support/test-app.ts`: sobe a aplicação completa para os testes e2e,
  agora compartilhado entre os arquivos de e2e.

Pendente para o frontend: o `frontend/docs/contrato-api.md` ainda descreve o
formato antigo (`fieldErrors` e `requestId`) e precisa ser alinhado a este.

## Item 3 — Pasta `src/shared/` mínima

Status: em andamento.

Proposta: conter somente o que já é comum a todos os domínios, seguindo a
regra do `ARCHITECTURE.md` de não antecipar abstrações.

- [x] Mover a `ApplicationException` base para `src/shared/application`
      (criada diretamente lá no item 2).
- [ ] Criar o contrato `IdGenerator` e sua implementação na infraestrutura.
- [ ] Criar o contrato `Clock` e sua implementação na infraestrutura.
- [ ] Criar implementações fixas (fakes) de `IdGenerator` e `Clock` para os
      testes, deixando-os determinísticos.
- [ ] Registrar no `ARCHITECTURE.md` o papel de `src/shared` e o que pode
      entrar nela.

## Item 4 — ADRs em `docs/adr`

Status: não iniciado.

O `ARCHITECTURE.md` prevê os ADRs, mas a pasta ainda não existe.

- [ ] Criar `docs/adr` com um modelo de ADR (contexto, decisão, alternativas,
      consequências).
- [ ] ADR-001: arquitetura em camadas por domínio, formalizando o que está no
      `ARCHITECTURE.md`.
- [ ] ADR-002: estratégia de IDs (candidato: UUID v7, ordenável por tempo e
      gerado pela aplicação).
- [ ] ADR-003: estratégia de sessão e autenticação. Fica para o início do
      domínio `auth`.

## Item 5 — Prefixo global de rotas

Status: não iniciado. Decisão pendente.

Hoje o Swagger está em `/api/docs`, mas as rotas não têm prefixo (`/health`).

Contexto: a API já tem domínio próprio (`api-bookmatch.galpao.tech`) no Caddy
de borda, então um prefixo `/api` não é necessário para separar o tráfego do
frontend. A decisão real é entre:

- sem prefixo, mantendo o Swagger em `/api/docs` ou movendo para `/docs`;
- prefixo de versão, como `/v1/...`.

Se o prefixo mudar, estes pontos dependem de `/health` e precisam ser
atualizados juntos:

- `deploy/compose.prod.yaml` (healthcheck);
- `deploy/smoke-test.sh`;
- `.github/workflows/backend-cd.yml`;
- `test/health.e2e-spec.ts`;
- `README.md` e `docs/deploy.md`.

Recomendação: manter `/health` sem prefixo em qualquer cenário, para não
acoplar a infraestrutura à versão da API.

- [ ] Decidir a estratégia de prefixo e registrar a decisão.
- [ ] Aplicar o prefixo em `configure-app.ts`, excluindo `/health` se for o
      caso.
- [ ] Atualizar os pontos listados acima.

## Item 6 — Testes de integração com Prisma

Status: não iniciado.

O `ARCHITECTURE.md` prevê testes de integração para os adaptadores Prisma, mas
ainda falta o ambiente.

- [ ] Definir o banco de teste (database separado no MariaDB do
      `compose.yaml`).
- [ ] Criar `vitest.config.integration.ts` e o script `test:integration`.
- [ ] Aplicar as migrations no banco de teste antes da suíte.
- [ ] Definir a estratégia de isolamento entre testes (limpeza por tabela ou
      transação).
- [ ] Incluir os testes de integração no `backend-ci.yml`.

## Fora do escopo

- Qualquer caso de uso de domínio (`RegisterUser`, login, recuperação).
- Autenticação, sessão e autorização. Ficam com o ADR-003.
- Logging estruturado, observabilidade e rate limiting. Entram quando houver
  necessidade concreta.

## Critério de conclusão

- Lint, build, testes unitários, e2e e de integração passando no CI.
- A aplicação não sobe com configuração inválida.
- Todo erro da API segue o formato único.
- `ARCHITECTURE.md` atualizado com `src/shared`, configuração e erros.
- ADR-001 e ADR-002 aceitos.
