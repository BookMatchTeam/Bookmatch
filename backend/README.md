# BookMatch Backend

API REST modular do BookMatch, construída com NestJS 12, ESM, Vitest,
NodeAdapter, Prisma ORM 7 e MariaDB.

## Pré-requisitos

- Node.js 22.22.3+ na linha 22, ou Node.js 24.15+
- npm
- Docker com Docker Compose para o banco local

## Preparação

```bash
cp .env.example .env   # gere o VERIFICATION_CODE_SECRET: openssl rand -hex 32
npm install
npm run db:up          # MariaDB e Mailpit
npm run prisma:generate
npx prisma migrate deploy
```

O `db:up` também sobe o Mailpit, que recebe os e-mails enviados pela API (os
códigos de verificação do cadastro) sem entregá-los. A caixa de entrada fica
em `http://localhost:8025`.

Para alterar o schema, crie uma migration nova:

```bash
npm run prisma:migrate -- --name <nome>
```

## Execução

```bash
npm run start:dev
```

- Rotas da aplicação: `http://localhost:3000/api/...`
- Saúde: `GET http://localhost:3000/health` (fora do prefixo `/api`)
- Swagger UI: `http://localhost:3000/api/docs`

## Verificações

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm run test:e2e
```

Os testes de integração usam um MariaDB próprio, separado do de
desenvolvimento:

```bash
npm run db:test:up
npm run test:integration
npm run db:test:down
```

## Integração contínua

Este backend fica em `backend/` no monorepo `BookMatchTeam/Bookmatch`.

O workflow `.github/workflows/backend-ci.yml` (na raiz do repositório) executa
lint, verificação de tipos, build, testes unitários, e2e e de integração e um smoke test do pacote de produção
(`deploy/smoke-test.sh`) em todo pull request e push na `main` que mude algo em
`backend/`.

Quando o CI passa na `main`, o workflow `.github/workflows/backend-cd.yml` monta
as imagens Docker da API, publica no GitHub Container Registry (GHCR) e coloca a
nova versão em produção. Ele também pode ser disparado manualmente, para
republicar ou voltar para um commit anterior da `main`.

## Decisões de arquitetura

A arquitetura vigente está no [`ARCHITECTURE.md`](ARCHITECTURE.md). As
decisões que levaram a ela estão nos ADRs, em [`docs/adr`](docs/adr/README.md).

## Deploy

A API roda numa VPS com Docker Compose (`deploy/compose.prod.yaml`): API e
MariaDB. HTTPS e domínio ficam com o Caddy de borda do monorepo
([`infra/edge`](../infra/edge/README.md)). A VPS não tem o código-fonte: recebe
só as imagens prontas do GHCR e os arquivos de implantação. O passo a passo
está em [`docs/deploy.md`](docs/deploy.md).
