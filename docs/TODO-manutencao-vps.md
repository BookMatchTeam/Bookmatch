# TODO: manutenção da VPS

Tarefas pendentes de limpeza na VPS, que sobraram da migração do backend para o
monorepo (PR #1, 15/11/2026). **Nada aqui afeta o funcionamento atual**: são
arquivos, imagens e volumes que deixaram de ser usados. Dá para fazer quando
houver tempo, mas não adie muito: as imagens antigas ocupam disco.

Todos os comandos rodam **na VPS, como o usuário `deploy`**.

Marque cada item ao concluir. Quando todos estiverem feitos, apague este arquivo.

---

## Antes de começar

Confira que tudo está no ar. Se algo estiver fora, **não faça a limpeza**:
resolva o problema primeiro.

```bash
curl -sS https://api-bookmatch.galpao.tech/health   # {"status":"ok",...}
curl -sS -o /dev/null -w '%{http_code}\n' https://bookmatch.galpao.tech/   # 200
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

Devem aparecer, todos `Up` / `healthy`:

| Container | Projeto |
|---|---|
| `bookmatch-edge-caddy-1` | Caddy de borda |
| `bookmatch-prod-api-1` | backend |
| `bookmatch-prod-mariadb-1` | banco |
| `bookmatch-frontend-web-1` | frontend |

Se aparecer um `bookmatch-prod-caddy-1`, a migração do Caddy não terminou. Não
siga adiante; rode o Edge CD de novo (*Actions → Edge CD → Run workflow*).

---

## 1. [ ] Pasta `deploy/` antiga do backend

Antes do monorepo, o CD do backend enviava `deploy/Caddyfile` e
`deploy/deploy.sh` para `~/bookmatch/deploy/`. Agora o `deploy.sh` fica direto
em `~/bookmatch/` e o Caddyfile mora em `~/bookmatch-edge/config/`.

```bash
ls ~/bookmatch/deploy        # deve mostrar Caddyfile e deploy.sh antigos
rm -r ~/bookmatch/deploy
ls ~/bookmatch               # deve sobrar: compose.prod.yaml, deploy.sh, .env
```

## 2. [ ] Linha `API_DOMAIN` do `.env` do backend

Era usada pelo Caddy antigo. Hoje os domínios ficam em
`infra/edge/config/Caddyfile`.

```bash
grep -n API_DOMAIN ~/bookmatch/.env
sed -i '/^API_DOMAIN=/d' ~/bookmatch/.env
sed -E 's/(PASSWORD=).*/\1********/' ~/bookmatch/.env   # confere o resto, sem mostrar senhas
```

**Não mexa nas outras linhas**: as senhas do banco precisam continuar iguais.

## 3. [ ] Imagens antigas do backend (`ghcr.io/rotiivv/*`)

Eram publicadas pelo repositório antigo (`Rotiivv/bookmatch-backend`). O
`deploy.sh` novo só apaga as imagens com o label `com.bookmatch.app=backend`, e
as antigas não têm esse label, então nunca vão sair sozinhas.

```bash
docker image ls 'ghcr.io/rotiivv/*'
docker image ls -q 'ghcr.io/rotiivv/*' | sort -u | xargs -r docker image rm
docker image prune -f
```

## 4. [ ] Volumes do Caddy antigo

O Caddy antigo guardava os certificados em volumes do projeto
`bookmatch-prod`. O Caddy de borda usa os seus próprios
(`bookmatch-edge_caddy_data` e `bookmatch-edge_caddy_config`).

```bash
docker volume ls --filter name=bookmatch
docker volume rm bookmatch-prod_caddy_data bookmatch-prod_caddy_config
```

> ⚠️ **Nunca apague `bookmatch-prod_mariadb_data`**: é o banco de dados de
> produção. Nem `bookmatch-edge_caddy_data`: são os certificados em uso.

## 5. [ ] Restos do formato ainda mais antigo (se existirem)

Antes do PR #4 do repositório antigo, a VPS tinha um clone do código e montava
as imagens localmente. Verifique se ainda sobrou algo disso:

```bash
ls -d ~/bookmatch-backend 2>/dev/null && echo "existe a pasta do clone antigo"
docker image ls bookmatch-backend
docker image ls bookmatch-backend-build
```

Se existirem:

```bash
rm -rf ~/bookmatch-backend
docker image rm bookmatch-backend:latest bookmatch-backend-build:latest
docker builder prune -f      # cache de build, que não é mais usado na VPS
```

---

## Depois da limpeza

1. Rode de novo as conferências de **Antes de começar**.
2. Veja quanto espaço foi liberado: `docker system df` e `df -h /`.

## Fora da VPS (opcional, também pendente)

- [ ] **Remover a migração única do `infra/edge/deploy.sh`.** É o bloco entre
  `--- Migracao unica` e a linha de traços seguinte. Ele já cumpriu o papel
  (remover o Caddy antigo) e hoje não faz nada. Mexa só depois de concluir o
  item 4, via PR: o Edge CD aplica sozinho.
- [ ] **Arquivar o repositório antigo** `Rotiivv/bookmatch-backend`
  (*Settings → Danger Zone → Archive this repository*). O CD dele já está
  desligado; arquivar deixa claro que o código agora vive aqui.
- [ ] **Pacotes antigos no GHCR** (`github.com/Rotiivv?tab=packages`):
  `bookmatch-backend` e `bookmatch-backend-migrate`. Podem ser apagados depois
  de arquivar o repositório. Antes, confirme que nenhum rollback vai precisar
  deles: commits anteriores ao monorepo não podem mais ser publicados pelo
  Backend CD.
