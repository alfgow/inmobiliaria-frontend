import { prisma } from "./prisma";

export interface GetPropertyBySlugParams {
  slug: string;
  id?: string | number | bigint;
}

const propertyInclude = {
  estatus: true,
  imagenes: {
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
  },
} as const;

const normalizeId = (id: string | number | bigint) => {
  if (typeof id === "bigint") {
    return id;
  }

  if (typeof id === "number") {
    return BigInt(id);
  }

  return BigInt(id);
};

const attachMetadata = async <T extends { id: bigint } | null>(property: T) => {
  if (!property) {
    return property;
  }

  const metadataDelegate = (prisma as any).inmuebleMetadata;

  if (metadataDelegate?.findMany) {
    const metadata = await metadataDelegate.findMany({
      where: { inmuebleId: property.id } as any,
      orderBy: { orden: "asc" } as any,
    });

    return {
      ...property,
      metadata,
    };
  }

  return property;
};

export const getPropertyBySlug = async ({ slug, id }: GetPropertyBySlugParams) => {
  const propertyBySlug = await prisma.inmueble.findUnique({
    where: { slug } as any,
    include: propertyInclude,
  } as any);

  if (propertyBySlug || id === undefined) {
    return attachMetadata(propertyBySlug as any);
  }

  const normalizedId = normalizeId(id);
  const propertyById = await prisma.inmueble.findUnique({
    where: { id: normalizedId } as any,
    include: propertyInclude,
  } as any);

  return attachMetadata(propertyById as any);
};
