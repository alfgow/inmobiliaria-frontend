import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { S3_PUBLIC_BUCKET, s3Client } from '@/lib/s3';

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

            if (imagen.s3Key && S3_PUBLIC_BUCKET) {
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

            return {
              id: imagen.id.toString(),
              title: imagen.titulo,
              description: imagen.descripcion,
              order: imagen.orden,
              isCover: imagen.esPortada,
              isPublic: imagen.esPublica,
              s3Key: imagen.s3Key,
              signedUrl,
            };
          }),
        );

        return {
          id: inmueble.id.toString(),
          title: inmueble.titulo,
          slug: inmueble.slug,
          description: inmueble.descripcion,
          price: inmueble.precio.toNumber(),
          address: inmueble.direccion,
          neighborhood: inmueble.colonia,
          city: inmueble.ciudad,
          state: inmueble.estado,
          postalCode: inmueble.codigoPostal,
          location: {
            latitude: inmueble.latitud?.toNumber() ?? null,
            longitude: inmueble.longitud?.toNumber() ?? null,
          },
          rooms: inmueble.recamaras,
          bathrooms: inmueble.banos ?? null,
          halfBathrooms: inmueble.mediosBanos,
          parkingSpots: inmueble.estacionamientos,
          landSizeM2: inmueble.m2Terreno?.toNumber() ?? null,
          constructionSizeM2: inmueble.m2Construccion?.toNumber() ?? null,
          age: inmueble.antiguedad,
          furnished: inmueble.amueblado,
          featured: inmueble.destacado,
          active: inmueble.estaActivo,
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
          createdAt: inmueble.createdAt.toISOString(),
          updatedAt: inmueble.updatedAt.toISOString(),
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
