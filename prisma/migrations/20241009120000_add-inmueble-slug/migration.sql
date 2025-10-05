ALTER TABLE `inmuebles`
  ADD COLUMN `slug` VARCHAR(200) NULL;

UPDATE `inmuebles`
SET `slug` = CASE
  WHEN `slug` IS NOT NULL AND TRIM(`slug`) <> '' THEN TRIM(`slug`)
  WHEN `titulo` IS NULL OR TRIM(`titulo`) = '' THEN CAST(`id` AS CHAR(191))
  ELSE
    LEFT(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          LOWER(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
              TRIM(`titulo`),
              'Á', 'A'),
              'À', 'A'),
              'Â', 'A'),
              'Ä', 'A'),
              'Ã', 'A'),
              'Å', 'A'),
              'á', 'a'),
              'à', 'a'),
              'â', 'a'),
              'ä', 'a'),
              'ã', 'a'),
              'å', 'a'),
              'É', 'E'),
              'È', 'E'),
              'Ê', 'E'),
              'Ë', 'E'),
              'é', 'e'),
              'è', 'e'),
              'ê', 'e'),
              'ë', 'e'),
              'Í', 'I'),
              'Ì', 'I'),
              'Î', 'I'),
              'Ï', 'I'),
              'í', 'i'),
              'ì', 'i'),
              'î', 'i'),
              'ï', 'i'),
              'Ó', 'O'),
              'Ò', 'O'),
              'Ô', 'O'),
              'Ö', 'O'),
              'Õ', 'O'),
              'Ø', 'O'),
              'ó', 'o'),
              'ò', 'o'),
              'ô', 'o'),
              'ö', 'o'),
              'õ', 'o'),
              'ø', 'o'),
              'Ú', 'U'),
              'Ù', 'U'),
              'Û', 'U'),
              'Ü', 'U'),
              'ú', 'u'),
              'ù', 'u'),
              'û', 'u'),
              'ü', 'u'),
              'Ñ', 'N'),
              'ñ', 'n'),
              'Ç', 'C'),
              'ç', 'c'),
              'Ý', 'Y'),
              'ý', 'y'),
              'ÿ', 'y')
          ),
          '[^a-z0-9]+', '-'
        ),
        '(^-+)|(-+$)', ''
      ),
      200
    )
END
WHERE `slug` IS NULL OR TRIM(`slug`) = '';

CREATE UNIQUE INDEX `inmuebles_slug_key` ON `inmuebles`(`slug`);
