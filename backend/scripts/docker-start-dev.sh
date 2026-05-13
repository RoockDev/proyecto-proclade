#!/bin/sh
# Keep LF line endings: /bin/sh in Docker can fail on CRLF checkouts.
set -eu

yarn exec prisma generate
yarn exec prisma migrate deploy
yarn prisma:init-system
exec yarn start:dev
