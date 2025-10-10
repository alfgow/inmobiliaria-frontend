import { NextResponse } from "next/server";

import getInmueblesApiClient from "@/lib/inmuebles-api";
import { normalizeProperty, type PropertyWithSignedImages, type RawProperty } from "@/lib/properties";

const mapPropertyForResponse = (property: PropertyWithSignedImages): Record<string, unknown> => ({
        id: property.id,
        title: property.titulo,
        slug: property.slug,
        description: property.descripcion,
        price: property.precio,
        priceFormatted: property.precioFormateado,
        address: property.direccion,
        neighborhood: property.colonia,
        city: property.municipio,
        state: property.estado,
        postalCode: property.codigoPostal,
        location: {
                latitude: property.latitud,
                longitude: property.longitud,
        },
        rooms: property.habitaciones,
        bathrooms: property.banos,
        halfBathrooms: null,
        parkingSpots: property.estacionamientos,
        landSizeM2: property.superficie_terreno,
        constructionSizeM2: property.superficie_construida,
        age: property.anio_construccion,
        furnished: null,
        featured: property.destacado,
        active: String(property.estatus?.id ?? "").trim() === "1",
        type: property.tipo,
        operation: property.operacion,
        status: property.estatus
                ? {
                        id: property.estatus.id,
                        name: property.estatus.nombre,
                        color: property.estatus.color,
                }
                : null,
        images: property.imagenes.map((image) => ({
                id: image.id,
                title: image.titulo,
                description: image.descripcion,
                order: image.orden,
                isCover: Boolean(image.isCover),
                isPublic: image.isPublic ?? true,
                url: image.url ?? image.signedUrl ?? image.path ?? null,
                signedUrl: image.signedUrl ?? null,
                path: image.path ?? null,
                metadata: image.metadata ?? null,
        })),
        metadata: property.metadata ?? null,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
});

export async function GET(request: Request) {
        try {
                const url = new URL(request.url);
                const searchParams = new URLSearchParams(url.search);
                const params: Record<string, string> = {};

                for (const key of searchParams.keys()) {
                        const value = searchParams.get(key);

                        if (value !== null) {
                                params[key] = value;
                        }
                }

                if (!params.limit) {
                        params.limit = "100";
                }

                const client = getInmueblesApiClient();
                const response = await client.get("/inmuebles", { params });
                const rawData = response.data?.data ?? response.data;
                const items = Array.isArray(rawData) ? (rawData as RawProperty[]) : [];

                const properties = items
                        .map((item) => normalizeProperty(item))
                        .filter((item): item is PropertyWithSignedImages => Boolean(item))
                        .map((item) => mapPropertyForResponse(item));

                const meta = response.data?.meta ?? null;
                const filters = response.data?.filters ?? null;

                return NextResponse.json({ data: properties, meta, filters });
        } catch (error) {
                console.error("Error fetching properties from API", error);

                return NextResponse.json(
                        {
                                error: "Failed to fetch properties",
                        },
                        { status: 500 }
                );
        }
}
