#!/usr/bin/env bash
# Teste de fumaca do pacote de producao.
#
# Executa o mesmo roteiro do deploy.sh numa copia descartavel:
# monta as imagens (em vez de baixar do GHCR), sobe o banco, aplica as
# migrations, sobe a API e chama o /health. O Caddy de borda fica de fora
# (nao ha dominio nem certificado) e tudo e apagado no fim.
#
# Roda no CI, antes do merge, e tambem manualmente:
#   bash backend/deploy/smoke-test.sh
#
# Usa um projeto Compose proprio (bookmatch-smoke), um .env temporario e uma
# rede "edge" propria, entao nao toca nos containers, volumes, redes nem no
# .env de producao.
set -Eeuo pipefail

cd "$(dirname "$0")"

PROJECT=bookmatch-smoke
ENV_FILE="$(mktemp)"
# O compose.prod.yaml usa uma rede externa (a do Caddy de borda). Aqui ela e
# trocada por uma rede descartavel, criada e apagada por este script.
export EDGE_NETWORK=bookmatch-smoke-edge

compose() {
  docker compose -p "$PROJECT" --env-file "$ENV_FILE" \
    -f compose.prod.yaml -f compose.build.yaml --profile tools "$@"
}

cleanup() {
  compose down -v --remove-orphans > /dev/null 2>&1 || true
  docker network rm "$EDGE_NETWORK" > /dev/null 2>&1 || true
  rm -f "$ENV_FILE"
}
trap cleanup EXIT

on_error() {
  echo "==> Falhou. Ultimos logs da API e do banco:" >&2
  compose logs --no-color --tail=40 api mariadb >&2 || true
}
trap on_error ERR

cat > "$ENV_FILE" <<EOF
IMAGE_TAG=smoke
MARIADB_DATABASE=bookmatch
MARIADB_USER=bookmatch
MARIADB_PASSWORD=smoketest-$RANDOM$RANDOM
MARIADB_ROOT_PASSWORD=smoketest-root-$RANDOM$RANDOM
TERMS_VERSION=1
CORS_ORIGINS=https://bookmatch.galpao.tech
VERIFICATION_CODE_SECRET=smoketest-$RANDOM$RANDOM-com-pelo-menos-32-caracteres
# Nenhum e-mail e enviado: o /health nao usa SMTP, e o transporte so conecta
# no primeiro envio.
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM=BookMatch <nao-responda@bookmatch.local>
EOF

docker network inspect "$EDGE_NETWORK" > /dev/null 2>&1 \
  || docker network create "$EDGE_NETWORK" > /dev/null

echo "==> Construindo as imagens"
compose build api migrate

echo "==> Subindo o banco"
compose up -d --wait mariadb

echo "==> Aplicando as migrations"
if ! migrate_log="$(compose run --rm migrate 2>&1)"; then
  echo "$migrate_log"
  false
fi
echo "$migrate_log"
# A CLI do Prisma so avisa (nao falha) quando falta o OpenSSL, mas as
# migrations podem quebrar depois. Tratamos o aviso como erro.
if grep -q "failed to detect the libssl/openssl version" <<< "$migrate_log"; then
  echo "==> A imagem migrate esta sem OpenSSL (exigido pela CLI do Prisma)." >&2
  false
fi

echo "==> Subindo a API"
compose up -d --wait --wait-timeout 120 api

echo "==> Chamando /health"
compose exec -T api node -e "
  fetch('http://localhost:3000/health')
    .then(async (r) => { console.log(r.status, await r.text()); process.exit(r.ok ? 0 : 1); })
    .catch((e) => { console.error(e); process.exit(1); });
"

echo "==> Smoke test concluido"
