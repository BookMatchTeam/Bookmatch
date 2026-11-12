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
navegador ──HTTPS──▶ Caddy de borda (container do backend, portas 80/443, certificados)
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
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Chave **privada** SSH que entra como `deploy` (pode ser a mesma do backend) |
| `VPS_KNOWN_HOSTS` | Saida de `ssh-keyscan -H <host da VPS>` (confira a impressao digital) |
| `VPS_PORT` | Opcional. So se o SSH nao estiver na porta 22 |

### 3. Mudanca no repositorio do backend (`Rotiivv/bookmatch-backend`)

O Caddy de borda mora no backend, entao ele precisa conhecer o novo dominio e entrar na rede compartilhada.
Tres ajustes, via branch → PR → merge (o CD do backend aplica):

**`deploy/Caddyfile`** — novo bloco:

```caddyfile
bookmatch.galpao.tech {
	reverse_proxy bookmatch-frontend:80
}
```

**`compose.prod.yaml`** — o servico `caddy` entra tambem na rede `bookmatch-edge`
(mantenha as redes que ele ja usa; se ele nao declara nenhuma, ele esta na `default`):

```yaml
services:
  caddy:
    # ...o que ja existe...
    networks:
      - default
      - edge

networks:
  edge:
    external: true
    name: bookmatch-edge
```

**`deploy/deploy.sh`** — antes do `docker compose up`, garantir que a rede existe
(quem fizer deploy primeiro, frontend ou backend, cria):

```bash
docker network inspect bookmatch-edge >/dev/null 2>&1 || docker network create bookmatch-edge
```

Quando o backend vier para este repositorio, isso vira um compose so e a rede compartilhada deixa de ser necessaria.

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
