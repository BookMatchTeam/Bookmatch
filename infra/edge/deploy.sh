#!/usr/bin/env bash
# Deploy do Caddy de borda na VPS. Roda NA VPS, chamado pelo CD via SSH:
#   bash ~/bookmatch-edge/deploy.sh
# Tambem pode ser rodado na mao.
set -Eeuo pipefail

cd "$(dirname "$0")"
compose() { docker compose -f compose.prod.yaml "$@"; }

on_error() {
  echo "==> Falhou. Ultimos logs do Caddy:" >&2
  compose logs --no-color --tail=40 caddy >&2 || true
}
trap on_error ERR

# Rede compartilhada com o backend e o frontend. Quem chegar primeiro cria.
if ! docker network inspect bookmatch-edge > /dev/null 2>&1; then
  echo "==> Criando a rede bookmatch-edge"
  docker network create bookmatch-edge > /dev/null
fi

echo "==> Validando o Caddyfile"
compose run --rm --no-deps -T caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

# --- Migracao unica (pode ser apagada depois que rodar uma vez) ----------------
# Antes do monorepo, o Caddy morava no projeto Compose do backend
# ("bookmatch-prod") e ocupava as portas 80/443. Ele precisa sair para o Caddy
# de borda subir. Se a API ainda for a versao antiga (fora da rede edge), ela e
# ligada a rede aqui, para nao ficar fora do ar ate o proximo deploy do backend.
antigo_caddy="$(docker ps -aq \
  --filter label=com.docker.compose.project=bookmatch-prod \
  --filter label=com.docker.compose.service=caddy)"
if [ -n "$antigo_caddy" ]; then
  echo "==> Migracao: removendo o Caddy antigo do projeto bookmatch-prod"
  api="$(docker ps -q \
    --filter label=com.docker.compose.project=bookmatch-prod \
    --filter label=com.docker.compose.service=api)"
  if [ -n "$api" ] && ! docker inspect -f '{{json .NetworkSettings.Networks}}' "$api" | grep -q '"bookmatch-edge"'; then
    echo "==> Migracao: ligando a API atual a rede bookmatch-edge"
    docker network connect --alias bookmatch-backend bookmatch-edge "$api"
  fi
  docker rm -f $antigo_caddy > /dev/null
fi
# -----------------------------------------------------------------------------

echo "==> Subindo o Caddy de borda"
compose up -d --remove-orphans --wait --wait-timeout 60 caddy

# "up" nao reinicia o container quando so o Caddyfile mudou: recarrega a
# configuracao sem derrubar as conexoes abertas.
echo "==> Recarregando a configuracao"
compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

compose ps
echo "==> Deploy do Caddy de borda concluido"
