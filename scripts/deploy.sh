#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR="${APP_DIR:-/opt/inmobiliaria-frontend}"
readonly ENV_FILE="${ENV_FILE:-$APP_DIR/.env.local}"
readonly HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3004/api/health}"
readonly TARGET_REF="${1:-}"
readonly BASELINE_MIGRATION="20260731203000_baseline_current_production"
export BASELINE_MIGRATION

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
git fetch origin --prune '+refs/heads/*:refs/remotes/origin/*'

if ! git cat-file -e "${TARGET_REF}^{commit}" 2>/dev/null; then
  echo "Commit $TARGET_REF was not fetched from origin" >&2
  exit 1
fi

git checkout --detach "$TARGET_REF"

# Compose interpolation does not read env_file, so explicitly use the same file
# for build arguments and container runtime values.
compose=(docker compose --env-file "$ENV_FILE")
"${compose[@]}" build app

baseline_state() {
  "${compose[@]}" run --rm --no-deps -T --entrypoint node app - <<'NODE'
const { PrismaClient } = require("@prisma/client");

const baseline = process.env.BASELINE_MIGRATION;
const prisma = new PrismaClient();

async function main() {
  const [{ migration_table: migrationTable }] = await prisma.$queryRawUnsafe(`
    SELECT TO_REGCLASS('dbs14813645._prisma_migrations')::TEXT AS migration_table
  `);

  if (migrationTable) {
    const rows = await prisma.$queryRawUnsafe(
      `
        SELECT migration_name, finished_at, rolled_back_at
        FROM dbs14813645._prisma_migrations
        WHERE migration_name = $1
        ORDER BY started_at DESC
      `,
      baseline,
    );

    const latest = rows[0];

    if (latest?.finished_at) {
      console.log("APPLIED");
      return;
    }

    if (latest && !latest.rolled_back_at) {
      console.log("FAILED");
      return;
    }
  }

  const [{ object_count: objectCount }] = await prisma.$queryRawUnsafe(`
    SELECT
      (
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name <> '_prisma_migrations'
      ) +
      (
        SELECT COUNT(*)
        FROM pg_type AS t
        JOIN pg_namespace AS n ON n.oid = t.typnamespace
        WHERE n.nspname IN ('public', 'dbs14813645')
          AND t.typtype = 'e'
      ) AS object_count
  `);

  console.log(Number(objectCount) > 0 ? "NEEDS_BASELINE" : "EMPTY");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
NODE
}

mark_baseline_applied() {
  local state="$1"

  if [ "$state" = "FAILED" ]; then
    echo "Previous baseline attempt failed; marking it as rolled back before applying baseline resolution..."
    "${compose[@]}" run --rm --no-deps --entrypoint npx app prisma migrate resolve --rolled-back "$BASELINE_MIGRATION"
  fi

  local resolve_output
  if ! resolve_output="$("${compose[@]}" run --rm --no-deps --entrypoint npx app prisma migrate resolve --applied "$BASELINE_MIGRATION" 2>&1)"; then
    if grep -q 'P3008' <<<"$resolve_output"; then
      printf '%s\n' "$resolve_output"
      echo "Baseline was already marked as applied; continuing..."
    else
      printf '%s\n' "$resolve_output" >&2
      return 1
    fi
  else
    printf '%s\n' "$resolve_output"
  fi
}

state="$(baseline_state)"
case "$state" in
  APPLIED|EMPTY)
    ;;
  NEEDS_BASELINE|FAILED)
    echo "Existing database detected without an applied Prisma baseline; marking $BASELINE_MIGRATION as applied..."
    mark_baseline_applied "$state"
    ;;
  *)
    echo "Could not determine Prisma baseline state: $state" >&2
    exit 1
    ;;
esac

if ! migrate_output="$("${compose[@]}" run --rm --no-deps --entrypoint npx app prisma migrate deploy 2>&1)"; then
  printf '%s\n' "$migrate_output" >&2
  if grep -q 'P3005' <<<"$migrate_output"; then
    echo "Existing database has no Prisma migration history; marking the current production baseline as applied..."
    mark_baseline_applied "NEEDS_BASELINE"
    "${compose[@]}" run --rm --no-deps --entrypoint npx app prisma migrate deploy
  elif grep -Eq '42710|already exists' <<<"$migrate_output"; then
    echo "Baseline objects already exist; marking the current production baseline as applied and retrying..."
    mark_baseline_applied "FAILED"
    "${compose[@]}" run --rm --no-deps --entrypoint npx app prisma migrate deploy
  else
    exit 1
  fi
else
  printf '%s\n' "$migrate_output"
fi

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
