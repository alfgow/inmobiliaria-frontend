ALTER TABLE "inmuebles"
  ADD COLUMN IF NOT EXISTS "slug" VARCHAR(200);

WITH slug_candidates AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(BTRIM("slug"), ''),
      NULLIF(
        LEFT(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              LOWER(
                TRANSLATE(
                  BTRIM(COALESCE("titulo", '')),
                  'ÁÀÂÄÃÅáàâäãåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÖÕØóòôöõøÚÙÛÜúùûüÑñÇçÝýÿ',
                  'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOOooooooUUUUuuuuNnCcYyy'
                )
              ),
              '[^a-z0-9]+', '-', 'g'
            ),
            '(^-+)|(-+$)', '', 'g'
          ),
          200
        ),
        ''
      ),
      "id"::TEXT
    ) AS "base_slug"
  FROM "inmuebles"
),
ranked_slugs AS (
  SELECT
    "id",
    "base_slug",
    COUNT(*) OVER (PARTITION BY "base_slug") AS "slug_count",
    ROW_NUMBER() OVER (PARTITION BY "base_slug" ORDER BY "id") AS "slug_rank"
  FROM slug_candidates
),
final_slugs AS (
  SELECT
    "id",
    CASE
      WHEN "slug_count" > 1 AND "slug_rank" > 1 THEN
        LEFT("base_slug", GREATEST(1, 200 - LENGTH('-' || "id"::TEXT))) || '-' || "id"::TEXT
      ELSE
        LEFT("base_slug", 200)
    END AS "slug"
  FROM ranked_slugs
)
UPDATE "inmuebles" AS "i"
SET "slug" = "f"."slug"
FROM final_slugs AS "f"
WHERE "i"."id" = "f"."id";

CREATE UNIQUE INDEX IF NOT EXISTS "inmuebles_slug_key" ON "inmuebles"("slug");
