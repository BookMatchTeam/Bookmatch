#!/usr/bin/env bash
# Deploy do frontend na VPS. Roda NA VPS, chamado pelo CD via SSH:
#   IMAGE_TAG=<hash do commit> bash ~/bookmatch-frontend/deploy.sh
# Tambem pode ser rodado na mao (ex.: voltar para uma versao anterior).
set -euo pipefail

: "${IMAGE_TAG:?Informe IMAGE_TAG, ex.: IMAGE_TAG=<hash> bash deploy.sh}"
export IMAGE_TAG

cd "$(dirname "$0")"
compose() { docker compose -f compose.prod.yaml "$@"; }

echo "==> Frontend: versao ${IMAGE_TAG}"

# Rede compartilhada com o Caddy de borda e o backend. Quem chegar primeiro (frontend, backend ou edge) cria.
if ! docker network inspect bookmatch-edge >/dev/null 2>&1; then
  echo "==> Criando a rede bookmatch-edge"
  docker network create bookmatch-edge
fi

echo "==> Baixando a imagem"
compose pull

echo "==> Subindo o container (espera o healthcheck)"
if ! compose up -d --remove-orphans --wait --wait-timeout 60; then
  echo "!! O frontend nao ficou saudavel. Logs:" >&2
  compose logs --tail 50 web >&2 || true
  exit 1
fi

compose ps

echo "==> Apagando imagens antigas do frontend"
docker image prune -af --filter "label=com.bookmatch.app=frontend" >/dev/null

echo "==> Deploy do frontend concluido"
