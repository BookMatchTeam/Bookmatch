# BookMatch Backend

API REST modular do BookMatch, construída com NestJS 12, ESM, Vitest,
NodeAdapter, Prisma ORM 7 e MariaDB.

## Pré-requisitos

- Node.js 22.22.3+ na linha 22, ou Node.js 24.15+
- npm
- Docker com Docker Compose para o banco local

## Preparação

```bash
cp .env.example .env
npm install
npm run db:up
npm run prisma:generate
```

Os modelos de domínio ainda não foram definidos. Por isso, a migration inicial
deve ser criada somente depois da inclusão dos primeiros modelos em
`prisma/schema.prisma`:

```bash
npm run prisma:migrate -- --name init
```

## Execução

```bash
npm run start:dev
```

- Saúde: `GET http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/api/docs`

## Verificações

```bash
npm run build
npm test
npm run test:e2e
npm run lint
```

## Integração contínua

Este backend fica em `backend/` no monorepo `BookMatchTeam/Bookmatch`.

O workflow `.github/workflows/backend-ci.yml` (na raiz do repositório) executa
lint, build, testes unitários, testes e2e e um smoke test do pacote de produção
(`deploy/smoke-test.sh`) em todo pull request e push na `main` que mude algo em
`backend/`.

Quando o CI passa na `main`, o workflow `.github/workflows/backend-cd.yml` monta
as imagens Docker da API, publica no GitHub Container Registry (GHCR) e coloca a
nova versão em produção. Ele também pode ser disparado manualmente, para
republicar ou voltar para um commit anterior da `main`.

## Deploy

A API roda numa VPS com Docker Compose (`deploy/compose.prod.yaml`): API e
MariaDB. HTTPS e domínio ficam com o Caddy de borda do monorepo
([`infra/edge`](../infra/edge/README.md)). A VPS não tem o código-fonte: recebe
só as imagens prontas do GHCR e os arquivos de implantação. O passo a passo
está em [`docs/deploy.md`](docs/deploy.md).
