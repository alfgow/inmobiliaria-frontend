ALTER TABLE "inmuebles"
  ADD COLUMN IF NOT EXISTS "slug" VARCHAR(200);

UPDATE "inmuebles"
SET "slug" = CASE
  WHEN "slug" IS NOT NULL AND BTRIM("slug") <> '' THEN BTRIM("slug")
  WHEN "titulo" IS NULL OR BTRIM("titulo") = '' THEN "id"::TEXT
  ELSE
    LEFT(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          LOWER(
            TRANSLATE(
              BTRIM("titulo"),
              'ÁÀÂÄÃÅáàâäãåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÖÕØóòôöõøÚÙÛÜúùûüÑñÇçÝýÿ',
              'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOOooooooUUUUuuuuNnCcYyy'
            )
          ),
          '[^a-z0-9]+', '-', 'g'
        ),
        '(^-+)|(-+$)', '', 'g'
      ),
      200
    )
END
WHERE "slug" IS NULL OR BTRIM("slug") = '';

CREATE UNIQUE INDEX IF NOT EXISTS "inmuebles_slug_key" ON "inmuebles"("slug");
