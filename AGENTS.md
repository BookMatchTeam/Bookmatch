# AGENTS.md

Instruções para agentes de código (Claude Code, Codex, Cursor etc.) que
trabalham no monorepo do BookMatch.

## Mapa do repositório

| Pasta | O que é | Leia antes de mexer |
|---|---|---|
| `backend/` | API REST: NestJS 12, ESM, Prisma 7, MariaDB, Vitest | `backend/ARCHITECTURE.md`, `backend/README.md` |
| `frontend/` | App React 19 + Vite, PWA, Tailwind, shadcn | `frontend/README.md`, `frontend/docs/contrato-api.md` |
| `infra/edge/` | Caddy de borda (HTTPS e domínios) | `infra/edge/README.md` |
| `docs/` | Specs, relatórios e modelos de tabelas | `docs/specs/molde-spec.md`, `docs/modelos-tabelas.md` |
| `.github/workflows/` | CI/CD separado por parte (backend, frontend, edge) | `README.md` da raiz |

Cada parte tem seu próprio `package.json`. Rode os comandos de dentro da pasta
da parte, nunca da raiz.

## Comandos

Backend (`cd backend`, Node 22.22.3+ ou 24.15+):

```bash
npm run db:up            # sobe o MariaDB local (Docker)
npm run prisma:generate  # gera o client do Prisma
npm run start:dev
npm run lint && npm run build && npm test && npm run test:e2e
```

Frontend (`cd frontend`, Node 24, veja `.nvmrc`):

```bash
npm run dev
npm run lint && npm run build
```

## Antes de concluir uma tarefa

- Rode lint, build e testes da parte que você alterou. É o mesmo que o CI roda.
- Se algo falhar, conserte ou informe a falha com a saída. Não diga que está
  pronto sem ter verificado.

## Backend

- Siga `backend/ARCHITECTURE.md`. Ele é a fonte única das regras de
  arquitetura: domínios, casos de uso verticais, value objects, entidades,
  regra de dependência e testes. Não repita essas regras em outros arquivos.
- Desenvolva com TDD: escreva o teste que falha antes da implementação.
- Respeite `frontend/docs/contrato-api.md`, que define o que a API deve
  cumprir: cookie de sessão, CORS, proteção CSRF e formato das respostas de
  erro.
- Mudanças no schema do Prisma exigem uma migration
  (`npm run prisma:migrate -- --name <nome>`). Nunca edite uma migration já
  commitada.
- Não edite código gerado (`src/generated/prisma`) nem `dist/`.

## Frontend

- O contrato com a API (rotas, cookies, erros) fica em
  `frontend/docs/contrato-api.md`. Mantenha-o em dia ao integrar um endpoint.
- Formulários usam react-hook-form + zod. Use o `FormField` genérico de
  `src/shared/components/form` em vez de criar campos do zero.

## Fluxo de uma funcionalidade

1. **Spec**: copie `docs/specs/molde-spec.md` para
   `docs/specs/<funcionalidade>/spec.md`. A spec contém só decisões tomadas.
2. **Implementação**: uma branch por funcionalidade, seguindo a spec. Se a
   implementação exigir uma decisão que a spec não cobre, pergunte em vez de
   inventar.
3. **Relatório**: ao terminar, preencha `docs/specs/molde-relatorio.md` em
   `docs/specs/<funcionalidade>/relatorio.md`. Ele é lido pelo agente da etapa
   seguinte (por exemplo, o do frontend ao integrar o backend).

## Git

- Nunca commite direto na `main`. Branches: `feat/<assunto>`, `fix/<assunto>`,
  `docs/<assunto>`, `chore/<assunto>`.
- Commits no padrão Conventional Commits, em português, com escopo quando a
  mudança é de uma parte só: `feat(backend): ...`, `fix(frontend): ...`,
  `docs: ...`.
- Um commit por mudança lógica. Não misture backend e frontend no mesmo commit.
- O merge na `main` dispara deploy automático em produção. Não rode os scripts
  de `deploy/` nem os workflows de CD manualmente sem pedido explícito.

## Convenções gerais

- Documentação, specs, commits e PRs em português. Código (nomes de classes,
  funções, variáveis e arquivos) em inglês.
- Nunca commite `.env` nem secrets. Use os arquivos `.env.example` como
  referência.
- Não adicione dependências sem necessidade clara. Quando adicionar, explique o
  motivo no PR.
