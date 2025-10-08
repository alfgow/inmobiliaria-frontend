import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Prisma } from "@prisma/client";
import type { InmuebleImagen, PrismaClient } from "@prisma/client";

import { prisma } from "./prisma";
import { PUBLIC_BUCKET, s3Client } from "@/lib/s3";

export interface GetPropertyBySlugParams {
        slug: string;
        id?: string | number | bigint;
}

const propertyInclude = Prisma.validator<Prisma.InmuebleInclude>()({
        estatus: true,
        imagenes: {
                orderBy: [
                        { orden: "asc" as const },
                        { createdAt: "asc" as const },
                ],
        },
});

export type PropertyWithRelations = Prisma.InmuebleGetPayload<{ include: typeof propertyInclude }>;
export type MetadataRecord = Record<string, unknown>;
type PropertyWithMetadata = PropertyWithRelations & { metadata?: MetadataRecord[] };
export type ImageWithSignedUrl = Omit<InmuebleImagen, "url"> & {
        url: string | null;
        signedUrl: string | null;
};
export type PropertyWithSignedImages = Omit<PropertyWithMetadata, "imagenes"> & {
        imagenes: ImageWithSignedUrl[];
};

type MetadataOrderBy = { orden?: "asc" | "desc"; createdAt?: "asc" | "desc" };
type MetadataDelegate = {
        findMany?: (args: { where: { inmuebleId: bigint }; orderBy?: MetadataOrderBy[] }) => Promise<MetadataRecord[]>;
};

const normalizeId = (id: string | number | bigint) => {
        if (typeof id === "bigint") {
                return id;
        }

        if (typeof id === "number") {
                return BigInt(id);
        }

        return BigInt(id);
};

const attachMetadata = async (
        property: PropertyWithRelations | null
): Promise<PropertyWithMetadata | null> => {
        if (!property) {
                return property;
        }

        const metadataDelegate = (prisma as PrismaClient & { inmuebleMetadata?: MetadataDelegate }).inmuebleMetadata;

        if (!metadataDelegate?.findMany) {
                return property;
        }

        try {
                const metadata = await metadataDelegate.findMany({
                        where: { inmuebleId: property.id },
                        orderBy: [{ orden: "asc" }],
                });

                return {
                        ...property,
                        metadata,
                };
        } catch (error) {
                console.error(
                        `Error fetching metadata for property ${property.id?.toString?.() ?? "unknown"}`,
                        error
                );

                return property;
        }
};

const attachSignedUrls = async (
        property: PropertyWithMetadata | null
): Promise<PropertyWithSignedImages | null> => {
        if (!property) {
                return property;
        }

        const imagenesWithSignedUrls: ImageWithSignedUrl[] = await Promise.all(
                (property.imagenes ?? []).map(async (imagen) => {
                        let signedUrl: string | null = null;

                        if (imagen.s3Key && PUBLIC_BUCKET) {
                                try {
                                        signedUrl = await getSignedUrl(
                                                s3Client,
                                                new GetObjectCommand({
                                                        Bucket: PUBLIC_BUCKET,
                                                        Key: imagen.s3Key,
                                                }),
                                                { expiresIn: 3600 }
                                        );
                                } catch (error) {
                                        console.error(
                                                `Error generating signed URL for image ${imagen.id} with key ${imagen.s3Key}`,
                                                error
                                        );
                                }
                        }

                        const url = signedUrl ?? imagen.url ?? imagen.path ?? null;

                        return {
                                ...imagen,
                                signedUrl,
                                url,
                        };
                })
        );

        return {
                ...property,
                imagenes: imagenesWithSignedUrls,
        };
};

export const getPropertyBySlug = async ({ slug, id }: GetPropertyBySlugParams): Promise<PropertyWithSignedImages | null> => {
        try {
                const propertyBySlug = await prisma.inmueble.findUnique({
                        where: { slug },
                        include: propertyInclude,
                });

                if (propertyBySlug || id === undefined) {
                        const propertyWithMetadata = await attachMetadata(propertyBySlug);

                        return attachSignedUrls(propertyWithMetadata);
                }

                const normalizedId = normalizeId(id);
                const propertyById = await prisma.inmueble.findUnique({
                        where: { id: normalizedId },
                        include: propertyInclude,
                });

                const propertyWithMetadata = await attachMetadata(propertyById);

                return attachSignedUrls(propertyWithMetadata);
        } catch (error) {
                console.error(
                        `Error fetching property data for slug "${slug}"${
                                id !== undefined ? ` or id "${id}"` : ""
                        }`,
                        error
                );

                return null;
        }
};
