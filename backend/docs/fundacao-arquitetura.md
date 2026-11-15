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

Status: não iniciado.

Problema: o `ARCHITECTURE.md` diz que a infraestrutura traduz as exceptions da
aplicação para HTTP, mas esse mecanismo ainda não existe.

Proposta:

- uma `ApplicationException` base, em TypeScript puro, com um `code` estável
  (ex.: `EMAIL_ALREADY_REGISTERED`);
- um filtro global que mapeia `code` para status HTTP;
- um formato único de resposta de erro, para o frontend tratar todos os erros
  do mesmo jeito.

Formato de resposta a validar:

```json
{
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "E-mail já cadastrado",
  "details": []
}
```

- [ ] Criar a `ApplicationException` base sem dependência de NestJS.
- [ ] Definir como cada domínio registra o mapeamento `code -> status HTTP`.
- [ ] Criar o filtro global e registrá-lo em `configure-app.ts`.
- [ ] Padronizar os erros de validação do `ValidationPipe` no mesmo formato
      (ex.: `code: "VALIDATION_FAILED"` com os campos em `details`).
- [ ] Tratar erros não esperados como `500` sem vazar detalhes internos.
- [ ] Documentar o formato de erro no Swagger.
- [ ] Testes unitários do filtro e teste e2e de um erro de validação.

## Item 3 — Pasta `src/shared/` mínima

Status: não iniciado.

Proposta: conter somente o que já é comum a todos os domínios, seguindo a
regra do `ARCHITECTURE.md` de não antecipar abstrações.

- [ ] Mover a `ApplicationException` base para `src/shared/application`.
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
