# syntax=docker/dockerfile:1

# ---------- Etapa 1: build do Vite ----------
FROM node:24-slim AS build
WORKDIR /app

# Instala dependencias primeiro para aproveitar o cache de camadas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: servidor estatico ----------
# So o resultado do build (dist/) vai para a imagem final: sem Node, sem node_modules.
FROM caddy:2-alpine

# Etiqueta usada pelo deploy.sh para apagar imagens antigas do frontend na VPS
LABEL com.bookmatch.app="frontend"

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
