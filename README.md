# Bookmatch

Monorepo do BookMatch.

```
bookmatch/
├── backend/          API NestJS + Prisma + MariaDB        → backend/README.md
│   └── deploy/       compose de produção, deploy.sh, smoke test
├── frontend/         app React (Vite)                     → frontend/README.md
│   └── deploy/       compose de produção, deploy.sh
├── infra/
│   └── edge/         Caddy de borda: HTTPS e domínios     → infra/edge/README.md
└── .github/workflows/
    ├── backend-ci.yml  / backend-cd.yml
    ├── frontend-ci.yml / frontend-cd.yml
    └── edge-ci.yml     / edge-cd.yml
```

## CI/CD

Cada parte tem seu próprio CI e CD. Os workflows ficam na raiz, porque o GitHub
só lê os de `.github/workflows`, e cada um só roda quando algo muda na pasta
dele (filtro `paths`). Um merge que só mexe no frontend não faz deploy do
backend, e o contrário também vale.

O CD de cada parte roda depois que o CI dela passa na `main`, ou na mão em
*Actions → Run workflow*. Cada uma tem sua pasta na VPS:

| Parte | Imagem | Pasta na VPS |
|---|---|---|
| backend | `ghcr.io/bookmatchteam/bookmatch-backend[-migrate]` | `~/bookmatch` |
| frontend | `ghcr.io/bookmatchteam/bookmatch-frontend` | `~/bookmatch-frontend` |
| edge | `caddy` (Docker Hub, versão fixa) | `~/bookmatch-edge` |

## Produção

```
navegador ──HTTPS──▶ Caddy de borda (80/443)
                       ├ api-bookmatch.galpao.tech ──▶ bookmatch-backend:3000 ──▶ MariaDB
                       └ bookmatch.galpao.tech     ──▶ bookmatch-frontend:80
```

Os serviços se encontram pela rede Docker `bookmatch-edge`. Só o Caddy de borda
publica portas. Os secrets da VPS (`VPS_HOST`, `VPS_PORT`, `VPS_USER`,
`VPS_SSH_KEY` e `VPS_KNOWN_HOSTS`, todos obrigatórios) são os mesmos para os
três CDs.
O passo a passo está em [`backend/docs/deploy.md`](backend/docs/deploy.md).
