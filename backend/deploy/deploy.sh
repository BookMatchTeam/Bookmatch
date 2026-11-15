#!/usr/bin/env bash
# Publica na VPS a versao do backend informada em IMAGE_TAG (o hash do commit).
#
# Executado pelo workflow de CD (.github/workflows/backend-cd.yml), que antes
# envia este arquivo e o compose.prod.yaml para ~/bookmatch e faz login no GHCR.
# A VPS nao tem o codigo-fonte: as imagens chegam prontas.
#
# Manualmente (com login no GHCR feito antes, se o pacote for privado):
#   IMAGE_TAG=<hash completo do commit> bash ~/bookmatch/deploy.sh
set -Eeuo pipefail

cd "$(dirname "$0")"

: "${IMAGE_TAG:?Informe a versao: IMAGE_TAG=<hash do commit> bash deploy.sh}"
export IMAGE_TAG

if [ ! -f .env ]; then
  echo "Arquivo .env nao encontrado em $(pwd). Use backend/deploy/env.production.example como modelo." >&2
  exit 1
fi

compose() {
  docker compose -f compose.prod.yaml --profile tools "$@"
}

# Se algo falhar, mostra a causa no log (inclusive no GitHub Actions).
on_error() {
  echo "==> Falhou. Ultimos logs da API e do banco:" >&2
  compose logs --no-color --tail=40 api mariadb >&2 || true
}
trap on_error ERR

echo "==> Backend: versao $IMAGE_TAG"

# Rede compartilhada com o Caddy de borda e o frontend. Quem chegar primeiro cria.
if ! docker network inspect bookmatch-edge > /dev/null 2>&1; then
  echo "==> Criando a rede bookmatch-edge"
  docker network create bookmatch-edge > /dev/null
fi

# So as imagens da API. O MariaDB tem versao fixa no compose e o "up" so a
# baixa se faltar: o deploy nao depende do Docker Hub a cada vez.
echo "==> Baixando as imagens da API e do migrate"
compose pull --quiet api migrate

echo "==> Subindo o banco"
compose up -d --wait mariadb

echo "==> Aplicando as migrations"
compose run --rm migrate

# Sem --remove-orphans de proposito: na migracao para o Caddy de borda, o Caddy
# antigo deste projeto continua no ar ate o deploy do infra/edge tira-lo.
echo "==> Subindo a API"
compose up -d --wait --wait-timeout 120 api

# Apaga as imagens do backend de outras versoes. Mantem as da versao atual
# (inclusive a do migrate, que nao fica rodando): assim o proximo deploy so
# baixa as camadas que mudaram. O filtro de label garante que nada do frontend
# nem de outros projetos seja removido. Para voltar versao, o CD baixa de novo.
echo "==> Removendo imagens antigas do backend"
docker image ls \
  --filter "label=com.bookmatch.app=backend" \
  --format '{{.Repository}}:{{.Tag}}' \
  | grep -v ":$IMAGE_TAG\$" \
  | xargs -r docker image rm > /dev/null || true
docker image prune -f > /dev/null

compose ps
echo "==> Deploy do backend concluido"
