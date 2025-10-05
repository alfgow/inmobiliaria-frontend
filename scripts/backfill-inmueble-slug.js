#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const inmuebles = await prisma.inmueble.findMany({
    select: { id: true, titulo: true, slug: true },
    orderBy: { id: "asc" },
  });

  const updates = inmuebles
    .map((inmueble) => {
      const currentSlug = inmueble.slug?.trim();

      if (!currentSlug || currentSlug === inmueble.slug) {
        return null;
      }

      return prisma.inmueble.update({
        where: { id: inmueble.id },
        data: { slug: currentSlug },
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
