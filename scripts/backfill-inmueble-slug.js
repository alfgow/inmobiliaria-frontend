#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const normalizeSlug = (value) => {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const buildSlug = (inmueble, usedSlugs) => {
  const baseSlug = normalizeSlug(inmueble.titulo);
  const fallback = inmueble.id.toString();
  const initialSlug = baseSlug || fallback;

  if (!usedSlugs.has(initialSlug)) {
    usedSlugs.add(initialSlug);
    return initialSlug;
  }

  let candidate = `${initialSlug}-${inmueble.id}`;
  let counter = 1;

  while (usedSlugs.has(candidate)) {
    counter += 1;
    candidate = `${initialSlug}-${inmueble.id}-${counter}`;
  }

  usedSlugs.add(candidate);
  return candidate;
};

async function main() {
  const inmuebles = await prisma.inmueble.findMany({
    select: { id: true, titulo: true, slug: true },
    orderBy: { id: "asc" },
  });

  const usedSlugs = new Set(
    inmuebles
      .map((item) => item.slug?.trim())
      .filter((slug) => typeof slug === "string" && slug.length > 0),
  );

  const updates = inmuebles
    .map((inmueble) => {
      const nextSlug = buildSlug(inmueble, usedSlugs);

      if (inmueble.slug === nextSlug) {
        return null;
      }

      return prisma.inmueble.update({
        where: { id: inmueble.id },
        data: { slug: nextSlug },
      });
    })
    .filter(Boolean);

  for (const update of updates) {
    await update;
  }
}

main()
  .catch((error) => {
    console.error("Failed to backfill inmueble slugs", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
