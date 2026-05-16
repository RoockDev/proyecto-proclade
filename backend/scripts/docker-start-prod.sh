#!/bin/sh
# Keep LF line endings: /bin/sh in Docker can fail on CRLF checkouts.
#
# Arranque del backend en MODO PRODUCCIÓN.
# Diferencias clave respecto a docker-start-dev.sh:
#   - Usa `prisma migrate deploy` (solo aplica migraciones existentes; nunca
#     genera nuevas migraciones ni hace prompts interactivos).
#   - Arranca el bundle compilado con `node dist/main` en lugar de
#     `nest start --watch`.
set -eu

echo "[prod] Aplicando migraciones de Prisma (migrate deploy)…"
yarn exec prisma migrate deploy

echo "[prod] Inicialización del sistema (roles, admin, KB chatbot)…"
yarn prisma:init-system

echo "[prod] Arrancando Nest (node dist/src/main)…"
exec node dist/src/main
