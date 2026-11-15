# Deploy do frontend

O frontend segue o mesmo modelo do backend: o GitHub monta a imagem, publica no GHCR
e manda a VPS baixar essa versao via SSH. Nada e compilado na VPS.

```
 PR / push ──▶ Frontend CI ─────────────────────────────────────────────┐
               ├ lint (oxlint)                                           │
               ├ tipos + build (tsc -b && vite build)                    │
               └ smoke test: monta a imagem, sobe, testa /, rota SPA,   │
                 cache dos assets                                        │
                                                                         │ passou na main
                                                                         ▼
               Frontend CD · job 1 "Montar e publicar a imagem"
                 docker build → push ghcr.io/bookmatchteam/bookmatch-frontend:<hash>
                                                                         │
                                                                         ▼
               Frontend CD · job 2 "Deploy na VPS"
                 tar (compose.prod.yaml + deploy.sh) ── SSH ──▶ ~/bookmatch-frontend/
                 SSH: login GHCR (token temporario)
                      IMAGE_TAG=<hash> bash deploy.sh ──▶ pull, sobe o container, espera healthcheck,
                                                          apaga imagens antigas do frontend
```

## Como o trafego chega no frontend

```
navegador ──HTTPS──▶ Caddy de borda (infra/edge, portas 80/443, certificados)
                       ├ api-bookmatch.galpao.tech ──▶ api
                       └ bookmatch.galpao.tech     ──▶ bookmatch-frontend:80   (rede "bookmatch-edge")
                                                         └ Caddy interno: serve o dist/ estatico
```

- O container do frontend **nao publica porta** na VPS. So o Caddy de borda o alcanca,
  pela rede Docker compartilhada `bookmatch-edge`.
- O Caddy de dentro da imagem (`frontend/docker/Caddyfile`) so serve arquivos em HTTP:
  fallback de SPA para o `index.html`, cache longo em `/assets/*`, `no-cache` no resto, gzip/zstd.

## Arquivos

| Arquivo | Papel |
|---|---|
| `frontend/Dockerfile` | Build do Vite com Node 24 → imagem final so com Caddy + `dist/` |
| `frontend/docker/Caddyfile` | Servidor estatico dentro da imagem |
| `frontend/deploy/compose.prod.yaml` | Compose de producao (`~/bookmatch-frontend` na VPS). Reenviado a cada deploy |
| `frontend/deploy/deploy.sh` | Passos executados na VPS. Reenviado a cada deploy |
| `.github/workflows/frontend-ci.yml` | CI (so roda quando algo em `frontend/` muda) |
| `.github/workflows/frontend-cd.yml` | CD (depois do CI verde na `main`, ou manual) |

Mesma regra do backend: **nao edite `compose.prod.yaml` nem `deploy.sh` direto na VPS**, o proximo deploy sobrescreve.

## Configuracao (uma vez so)

### 1. DNS

Registro **A** `bookmatch.galpao.tech` → IP da VPS (o mesmo da API).

### 2. Secrets no repositorio `BookMatchTeam/Bookmatch`

*Settings → Secrets and variables → Actions → New repository secret*

| Secret | Valor |
|---|---|
| `VPS_HOST` | IP ou nome da VPS |
| `VPS_PORT` | Porta do SSH na VPS (normalmente `22`) |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Chave **privada** SSH que entra como `deploy` (o mesmo secret usado pelo backend e pelo edge) |

Os quatro sao obrigatorios: sem algum deles, o CD falha no passo "Conferir secrets da VPS"
dizendo qual falta. A identidade da VPS e lida pelo CD a cada deploy (`ssh-keyscan`), sem secret proprio.

### 3. Caddy de borda

Nada a fazer no frontend. O dominio `bookmatch.galpao.tech` ja esta no Caddy de borda
(`infra/edge/config/Caddyfile`, que vem com a branch `chore/backend-setup`), apontando para
`bookmatch-frontend:80` na rede `bookmatch-edge`. Para mudar dominio ou rota, edite esse
arquivo: o **Edge CD** aplica com `caddy reload`. Detalhes em `infra/edge/README.md`.

Enquanto o frontend nao subir, o Caddy responde 502 para esse dominio; quando ele subir,
volta ao normal sozinho, sem redeploy do Caddy.

### 4. GHCR

O primeiro deploy cria o pacote `bookmatch-frontend` na organizacao `BookMatchTeam`.
Depois, deixe-o **publico** (*Package settings → Danger Zone → Change visibility*), pelo mesmo motivo
do backend: pacote privado conta no limite gratuito de armazenamento.

Se o push for recusado com `permission_denied`, confira em *Organization settings → Packages*
se membros/Actions podem criar pacotes.

## Operacao

- **Deploy normal:** merge na `main` com mudanca em `frontend/`.
- **Voltar de versao:** *Actions → Frontend CD → Run workflow*, preencha `image_tag` com o hash de um commit
  que ja foi publicado. O build e pulado e so o deploy roda.
- **Republicar o commit atual:** *Run workflow* com `image_tag` vazio.
- **Na mao, na VPS:** `IMAGE_TAG=<hash> bash ~/bookmatch-frontend/deploy.sh`
  (precisa de `docker login ghcr.io` se o pacote ainda for privado).
