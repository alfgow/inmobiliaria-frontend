import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

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

    const properties = inmuebles.map((inmueble) => ({
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
      bathrooms: inmueble.banos?.toNumber() ?? null,
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
      images:
        inmueble.imagenes?.map((imagen) => ({
          id: imagen.id.toString(),
          title: imagen.titulo,
          description: imagen.descripcion,
          order: imagen.orden,
          isCover: imagen.esPortada,
          isPublic: imagen.esPublica,
          s3Key: imagen.s3Key,
        })) ?? [],
      createdAt: inmueble.createdAt.toISOString(),
      updatedAt: inmueble.updatedAt.toISOString(),
    }));

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
