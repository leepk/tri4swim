#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is required."
  exit 1
fi

echo "Initializing Tri4Swim database..."
./node_modules/.bin/tsx scripts/init-db.ts

exec node server.js
