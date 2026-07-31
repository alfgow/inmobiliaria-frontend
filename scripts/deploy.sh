#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR="${APP_DIR:-/opt/inmobiliaria-frontend}"
readonly ENV_FILE="${ENV_FILE:-$APP_DIR/.env.local}"
readonly HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3004/api/health}"
readonly TARGET_REF="${1:-}"

if [[ ! "$TARGET_REF" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "Usage: $0 <40-character-git-sha>" >&2
  exit 2
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing production environment file: $ENV_FILE" >&2
  exit 1
fi

if ! grep -Eq '^DATABASE_URL=.+$' "$ENV_FILE"; then
  echo "DATABASE_URL must have a non-empty value in $ENV_FILE" >&2
  exit 1
fi

cd "$APP_DIR"
git fetch origin main --prune

if ! git cat-file -e "${TARGET_REF}^{commit}" 2>/dev/null; then
  echo "Commit $TARGET_REF was not fetched from origin" >&2
  exit 1
fi

git checkout --detach "$TARGET_REF"

# Compose interpolation does not read env_file, so explicitly use the same file
# for build arguments and container runtime values.
compose=(docker compose --env-file "$ENV_FILE")
"${compose[@]}" build app
"${compose[@]}" run --rm --no-deps --entrypoint npx app prisma migrate deploy
"${compose[@]}" up -d --remove-orphans app

echo "Checking PostgreSQL from the application container..."
"${compose[@]}" exec -T app node -e \
  'const { PrismaClient } = require("@prisma/client"); const p = new PrismaClient(); p.$queryRawUnsafe("SELECT 1").then(() => p.$disconnect()).catch(async (error) => { console.error(error); await p.$disconnect(); process.exit(1); });'

echo "Waiting for $HEALTH_URL..."
for attempt in {1..12}; do
  if curl --fail --silent --show-error "$HEALTH_URL" >/dev/null; then
    echo "Deployment of $TARGET_REF completed successfully."
    exit 0
  fi
  echo "Health check attempt $attempt/12 failed; retrying in 5 seconds..."
  sleep 5
done

"${compose[@]}" logs --tail=100 app >&2
echo "Deployment failed: application did not become healthy." >&2
exit 1
