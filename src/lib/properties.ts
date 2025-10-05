import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { prisma } from "./prisma";
import { S3_PUBLIC_BUCKET, s3Client } from "@/lib/s3";

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

const attachSignedUrls = async <
  T extends { imagenes?: Array<Record<string, any>> } | null,
>(property: T) => {
  if (!property) {
    return property;
  }

  const imagenes = await Promise.all(
    (property.imagenes ?? []).map(async (imagen) => {
      let signedUrl: string | null = null;

      if (imagen?.s3Key && S3_PUBLIC_BUCKET) {
        try {
          signedUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
              Bucket: S3_PUBLIC_BUCKET,
              Key: imagen.s3Key,
            }),
            { expiresIn: 3600 },
          );
        } catch (error) {
          console.error(
            `Error generating signed URL for image ${imagen.id} with key ${imagen.s3Key}`,
            error,
          );
        }
      }

      const url = signedUrl ?? imagen?.url ?? imagen?.path ?? null;

      return {
        ...imagen,
        signedUrl,
        url,
      };
    }),
  );

  return {
    ...(property as Record<string, any>),
    imagenes,
  } as T;
};

export const getPropertyBySlug = async ({ slug, id }: GetPropertyBySlugParams) => {
  const propertyBySlug = await prisma.inmueble.findUnique({
    where: { slug } as any,
    include: propertyInclude,
  } as any);

  if (propertyBySlug || id === undefined) {
    const propertyWithMetadata = await attachMetadata(propertyBySlug as any);

    return attachSignedUrls(propertyWithMetadata as any);
  }

  const normalizedId = normalizeId(id);
  const propertyById = await prisma.inmueble.findUnique({
    where: { id: normalizedId } as any,
    include: propertyInclude,
  } as any);

  const propertyWithMetadata = await attachMetadata(propertyById as any);

  return attachSignedUrls(propertyWithMetadata as any);
};
