#!/bin/sh
set -eu

yarn exec prisma generate
yarn exec prisma migrate deploy
yarn prisma:seed
exec yarn start:dev
