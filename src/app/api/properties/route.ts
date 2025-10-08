import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { PUBLIC_BUCKET, s3Client } from '@/lib/s3';

const normalizeSlug = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

type ImageMetadata = {
  title: string | null;
  description: string | null;
  isCover: boolean;
  isPublic: boolean;
};

const parseImageMetadata = (metadata: Prisma.JsonValue | null | undefined): ImageMetadata => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {
      title: null,
      description: null,
      isCover: false,
      isPublic: true,
    };
  }

  const data = metadata as Record<string, unknown>;

  const title = typeof data.title === 'string' ? data.title : null;
  const description = typeof data.description === 'string' ? data.description : null;
  const isCover = typeof data.isCover === 'boolean' ? data.isCover : false;
  const isPublic = typeof data.isPublic === 'boolean' ? data.isPublic : true;

  return {
    title,
    description,
    isCover,
    isPublic,
  };
};

export async function GET() {
  try {
    const inmuebles = await prisma.inmueble.findMany({
      include: {
        estatus: true,
        imagenes: {
          orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: [
        { destacado: 'desc' },
        { createdAt: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    const properties = await Promise.all(
      inmuebles.map(async (inmueble) => {
        const images = await Promise.all(
          (inmueble.imagenes ?? []).map(async (imagen) => {
            let signedUrl: string | null = null;
            const metadata = parseImageMetadata(imagen.metadata);

            if (imagen.s3Key && PUBLIC_BUCKET) {
              try {
                signedUrl = await getSignedUrl(
                  s3Client,
                  new GetObjectCommand({
                    Bucket: PUBLIC_BUCKET,
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

            return {
              id: imagen.id.toString(),
              title: metadata.title,
              description: metadata.description,
              order: imagen.orden,
              isCover: metadata.isCover,
              isPublic: metadata.isPublic,
              s3Key: imagen.s3Key,
              signedUrl,
            };
          }),
        );

        const slug =
          inmueble.slug?.trim() || normalizeSlug(inmueble.titulo) || inmueble.id.toString();

        return {
          id: inmueble.id.toString(),
          title: inmueble.titulo,
          slug,
          description: inmueble.descripcion,
          price: inmueble.precio.toNumber(),
          address: inmueble.direccion,
          neighborhood: inmueble.colonia,
          city: inmueble.municipio,
          state: inmueble.estado,
          postalCode: inmueble.codigoPostal,
          location: {
            latitude: inmueble.latitud?.toNumber() ?? null,
            longitude: inmueble.longitud?.toNumber() ?? null,
          },
          rooms: inmueble.habitaciones ?? null,
          bathrooms: inmueble.banos ?? null,
          halfBathrooms: null,
          parkingSpots: inmueble.estacionamientos ?? null,
          landSizeM2: inmueble.superficie_terreno?.toNumber() ?? null,
          constructionSizeM2: inmueble.superficie_construida?.toNumber() ?? null,
          age: inmueble.anio_construccion ?? null,
          furnished: null,
          featured: inmueble.destacado,
          active: inmueble.estatusId === 1,
          type: inmueble.tipo,
          operation: inmueble.operacion,
          status: inmueble.estatus
            ? {
                id: inmueble.estatus.id,
                name: inmueble.estatus.nombre,
                color: inmueble.estatus.color,
              }
            : null,
          images,
          createdAt: inmueble.createdAt
            ? inmueble.createdAt.toISOString()
            : null,
          updatedAt: inmueble.updatedAt
            ? inmueble.updatedAt.toISOString()
            : null,
        };
      }),
    );

    return NextResponse.json({ data: properties });
  } catch (error) {
    console.error('Error fetching properties', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch properties',
      },
      { status: 500 },
    );
  }
}
