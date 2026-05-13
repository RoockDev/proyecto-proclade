#!/bin/sh
# Keep LF line endings: /bin/sh in Docker can fail on CRLF checkouts.
set -eu

yarn exec prisma generate
yarn exec prisma migrate deploy
yarn prisma:init-system

# En Docker evitamos el modo watch de Nest para no dejar procesos huérfanos
# escuchando en el puerto 3000 tras recargas de archivos montados.
exec yarn start
