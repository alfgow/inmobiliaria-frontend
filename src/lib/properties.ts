import { randomUUID } from "node:crypto";

import "server-only";

import { getPrismaClient } from "@/lib/prisma";
import {
  formatOperation,
  resolvePublicImageUrl,
  type FeaturedProperty,
  type ImageWithSignedUrl,
  type PropertyStatus,
  type PublicProperty,
} from "@/lib/property-types";

export interface GetPropertyBySlugParams {
  slug: string;
  id?: string | number | bigint;
}

type PrismaLikeProperty = {
  id: bigint | number | string;
  asesor_id?: bigint | number | string;
  titulo?: string | null;
  destacado?: boolean | null;
  descripcion?: string | null;
  precio?: unknown;
  direccion?: string | null;
  slug?: string | null;
  latitud?: unknown;
  longitud?: unknown;
  colonia?: string | null;
  municipio?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  codigo_postal?: string | null;
  tipo?: string | null;
  operacion?: string | null;
  estatusId?: number | null;
  seo_description?: string | null;
  estatus?: {
    id?: bigint | number | string;
    nombre?: string | null;
    color?: string | null;
  } | null;
  habitaciones?: unknown;
  banos?: unknown;
  estacionamientos?: unknown;
  superficie_cuadrados?: unknown;
  metros_cuadrados?: unknown;
  superficie_construida?: unknown;
  superficie_terreno?: unknown;
  anio_construccion?: unknown;
  video_url?: string | null;
  tour_virtual_url?: string | null;
  amenidades?: string | null;
  extras?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  imagenes?: PrismaLikeImage[] | null;
  metadata?: Record<string, unknown> | null;
};

type PrismaLikeImage = {
  id?: bigint | number | string;
  disk?: string | null;
  path?: string | null;
  url?: string | null;
  metadata?: unknown;
  inmuebleId?: bigint | number | string;
  s3Key?: string | null;
  orden?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.,-]+/g, "").replace(/,(?=\d{3})/g, "");
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  }

  if (value && typeof value === "object" && "toString" in value) {
    const parsed = Number((value as { toString(): string }).toString());

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const parseBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return ["1", "true", "yes", "si", "sí"].includes(normalized);
  }

  return false;
};

const parseDate = (value: unknown): string | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  return null;
};

const parseNullableString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return null;
};

const pickMetadataString = (
  metadata: Record<string, unknown> | null | undefined,
  candidatePaths: string[][],
): string | null => {
  if (!metadata) {
    return null;
  }

  for (const path of candidatePaths) {
    let current: unknown = metadata;

    for (const segment of path) {
      if (typeof current !== "object" || current === null) {
        current = null;
        break;
      }

      current = (current as Record<string, unknown>)[segment];
    }

    if (typeof current === "string") {
      const normalized = current.trim();

      if (normalized.length > 0) {
        return normalized;
      }
    }
  }

  return null;
};

const mapStatus = (
  status: PrismaLikeProperty["estatus"] | null | undefined,
  statusId?: number | null,
): PropertyStatus | null => {
  if (!status || typeof status !== "object") {
    if (typeof statusId === "number") {
      return {
        id: statusId,
        name: null,
        color: null,
      };
    }

    return null;
  }

  const id = status.id;
  const nombre = status.nombre ?? null;

  return {
    id: typeof id === "string" || typeof id === "number" ? id : statusId ?? "",
    name: parseNullableString(nombre),
    color: parseNullableString(status.color),
  };
};

const mapImage = (image: PrismaLikeImage): ImageWithSignedUrl => {
  const metadata =
    image.metadata && typeof image.metadata === "object" && !Array.isArray(image.metadata)
      ? (image.metadata as Record<string, unknown>)
      : null;

  const metadataUrl = pickMetadataString(metadata, [
    ["url"],
    ["publicUrl"],
    ["public_url"],
    ["urls", "default"],
    ["urls", "public"],
    ["file", "url"],
    ["variants", "original"],
    ["original"],
  ]);
  const metadataSignedUrl = pickMetadataString(metadata, [
    ["signedUrl"],
    ["signed_url"],
    ["signed-url"],
    ["presignedUrl"],
    ["presigned_url"],
    ["urls", "signed"],
    ["file", "signedUrl"],
    ["file", "signed_url"],
    ["link", "signed"],
  ]);
  const metadataPath = pickMetadataString(metadata, [
    ["path"],
    ["file", "path"],
    ["file", "key"],
    ["key"],
    ["s3Key"],
  ]);

  const rawUrl =
    parseNullableString(image.url) ??
    parseNullableString(metadataUrl) ??
    parseNullableString(metadataSignedUrl) ??
    parseNullableString(image.path) ??
    parseNullableString(image.s3Key) ??
    parseNullableString(metadataPath);
  const resolvedUrl = resolvePublicImageUrl(rawUrl);
  const path = parseNullableString(image.path) ?? parseNullableString(metadataPath);

  const idValue = image.id ?? randomUUID();
  const id = typeof idValue === "string" ? idValue : String(idValue);

  return {
    id,
    url: resolvedUrl,
    signedUrl: null,
    path,
    metadata,
    orden: typeof image.orden === "number" ? image.orden : null,
    isPublic: parseBoolean((metadata as Record<string, unknown> | null)?.isPublic),
  };
};

const mapProperty = (property: PrismaLikeProperty): PublicProperty => {
  const id = typeof property.id === "string" ? property.id : String(property.id);
  const title = parseNullableString(property.titulo);
  const slug = parseNullableString(property.slug) ?? (title ? slugify(title) : id);
  const price = parseNumber(property.precio);
  const latitude = parseNumber(property.latitud);
  const longitude = parseNumber(property.longitud);
  const statusId = typeof property.estatusId === "number" ? property.estatusId : null;
  const status = mapStatus(property.estatus, statusId);
  const isAvailable = statusId === 1;
  const images = (property.imagenes ?? [])
    .map(mapImage)
    .sort((left, right) => (left.orden ?? Number.POSITIVE_INFINITY) - (right.orden ?? Number.POSITIVE_INFINITY));
  const address = parseNullableString(property.direccion);
  const city = parseNullableString(property.municipio);
  const state = parseNullableString(property.estado);
  const neighborhood = parseNullableString(property.colonia);
  const postalCode = parseNullableString(property.codigo_postal) ?? parseNullableString(property.codigoPostal);
  const createdAt = parseDate(property.createdAt ?? property.created_at);
  const updatedAt = parseDate(property.updatedAt ?? property.updated_at);

  return {
    id,
    title,
    slug,
    price,
    priceFormatted: price !== null ? currencyFormatter.format(price) : null,
    operation: parseNullableString(property.operacion),
    status,
    city,
    state,
    address,
    neighborhood,
    postalCode,
    latitude,
    longitude,
    location:
      latitude !== null || longitude !== null
        ? {
            latitude,
            longitude,
          }
        : null,
    isAvailable,
    is_available: isAvailable,
    active: isAvailable,
    images,
    featured: parseBoolean(property.destacado),
    metadata:
      property.metadata && typeof property.metadata === "object" && !Array.isArray(property.metadata)
        ? (property.metadata as Record<string, unknown>)
        : null,
    description: parseNullableString(property.descripcion),
    seoDescription: parseNullableString(property.seo_description),
    amenities: parseNullableString(property.amenidades),
    extras: parseNullableString(property.extras),
    rooms: parseNumber(property.habitaciones),
    bathrooms: parseNumber(property.banos),
    parkingSpots: parseNumber(property.estacionamientos),
    landSizeM2: parseNumber(property.superficie_terreno) ?? parseNumber(property.metros_cuadrados),
    constructionSizeM2: parseNumber(property.superficie_construida),
    age: parseNumber(property.anio_construccion),
    createdAt,
    updatedAt,
    type: parseNullableString(property.tipo),
  };
};

const toFeaturedProperty = (property: PublicProperty): FeaturedProperty => {
  const coverImage = property.images.find((image) => image.isCover) ?? property.images[0] ?? null;

  const locationParts = [property.city, property.state].filter(Boolean) as string[];

  return {
    id: property.id,
    title: property.title ?? "Inmueble sin título",
    slug: property.slug ?? null,
    price: property.price ?? 0,
    operation: formatOperation(property.operation),
    status: property.status?.name ?? null,
    coverImageUrl: resolvePublicImageUrl(coverImage?.url ?? coverImage?.path ?? null),
    location: locationParts.length > 0 ? locationParts.join(", ") : null,
  };
};

const comparePricesDesc = (left: number | null, right: number | null) => {
  const leftValue = typeof left === "number" && Number.isFinite(left) ? left : Number.NEGATIVE_INFINITY;
  const rightValue = typeof right === "number" && Number.isFinite(right) ? right : Number.NEGATIVE_INFINITY;

  return rightValue - leftValue;
};

type PropertyQueryOptions = {
  limit?: number;
  featuredOnly?: boolean;
};

const getPropertyRepository = () => {
  const prisma = getPrismaClient() as unknown as {
    inmueble: {
      findMany: (args?: Record<string, unknown>) => Promise<PrismaLikeProperty[]>;
      findFirst: (args?: Record<string, unknown>) => Promise<PrismaLikeProperty | null>;
      findUnique: (args?: Record<string, unknown>) => Promise<PrismaLikeProperty | null>;
    };
  };

  return prisma.inmueble;
};

export const getPublicProperties = async ({
  limit = 100,
  featuredOnly = false,
}: PropertyQueryOptions = {}): Promise<PublicProperty[]> => {
  const repository = getPropertyRepository();
  const where = featuredOnly ? { destacado: true, estatusId: 1 } : undefined;
  const items = await repository.findMany({
    take: limit,
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      imagenes: true,
      estatus: true,
    },
  });

  return items.map(mapProperty);
};

export const getFeaturedProperties = async (
  limit = 12,
): Promise<FeaturedProperty[]> => {
  const properties = await getPublicProperties({ limit, featuredOnly: true });

  return properties
    .sort((left, right) => comparePricesDesc(left.price, right.price))
    .map(toFeaturedProperty);
};

export const getPropertyBySlug = async ({
  slug,
  id,
}: GetPropertyBySlugParams): Promise<PublicProperty | null> => {
  const repository = getPropertyRepository();

  if (id !== undefined) {
    const idValue = typeof id === "bigint" ? id : typeof id === "number" ? BigInt(id) : undefined;

    if (idValue !== undefined) {
      const byId = await repository.findUnique({
        where: { id: idValue },
        include: {
          imagenes: true,
          estatus: true,
        },
      });

      if (byId) {
        return mapProperty(byId);
      }
    }
  }

  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const directMatch = await repository.findFirst({
    where: {
      slug: normalizedSlug,
    },
    include: {
      imagenes: true,
      estatus: true,
    },
  });

  if (directMatch) {
    return mapProperty(directMatch);
  }

  const fallbackItems = await repository.findMany({
    take: 200,
    include: {
      imagenes: true,
      estatus: true,
    },
  });

  const normalizedTarget = normalizedSlug.toLowerCase();
  const candidate = fallbackItems.find((property) => {
    const propertyId = typeof property.id === "bigint" ? String(property.id) : String(property.id);
    const propertySlug =
      parseNullableString(property.slug) ?? (parseNullableString(property.titulo) ? slugify(property.titulo as string) : propertyId);

    return propertySlug.toLowerCase() === normalizedTarget;
  });

  return candidate ? mapProperty(candidate) : null;
};

export const getPropertySlugs = async (): Promise<string[]> => {
  const repository = getPropertyRepository();
  const items = await repository.findMany({
    take: 200,
    select: {
      id: true,
      slug: true,
      titulo: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items
    .map((item) => {
      if (typeof item.slug === "string" && item.slug.trim().length > 0) {
        return item.slug.trim();
      }

      if (typeof item.titulo === "string" && item.titulo.trim().length > 0) {
        return slugify(item.titulo);
      }

      return String(item.id);
    })
    .filter((value): value is string => Boolean(value));
};

export const mapPropertiesToFeaturedCards = (properties: PublicProperty[]): FeaturedProperty[] =>
  properties
    .filter((property) => property.featured && property.isAvailable)
    .sort((left, right) => comparePricesDesc(left.price, right.price))
    .map(toFeaturedProperty);
