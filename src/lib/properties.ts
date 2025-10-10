import { randomUUID } from "node:crypto";

import { isAxiosError } from "axios";

import getInmueblesApiClient from "./inmuebles-api";

export interface GetPropertyBySlugParams {
        slug: string;
        id?: string | number | bigint;
}

const parseNumber = (value: unknown): number | null => {
        if (typeof value === "number" && Number.isFinite(value)) {
                return value;
        }

        if (typeof value === "string") {
                const normalized = value.replace(/[^0-9.,-]+/g, "").replace(/,(?=\d{3})/g, "");
                const parsed = Number(normalized);

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
        candidatePaths: string[][]
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

const slugify = (value: string): string =>
        value
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

export type ImageWithSignedUrl = {
        id: string;
        url: string | null;
        signedUrl: string | null;
        path: string | null;
        metadata?: Record<string, unknown> | null;
        orden?: number | null;
        titulo?: string | null;
        descripcion?: string | null;
        isCover?: boolean;
        isPublic?: boolean;
};

export type PropertyStatus = {
        id: number | string;
        nombre: string | null;
        color: string | null;
};

export type PropertyWithSignedImages = {
        id: string;
        slug: string;
        titulo: string | null;
        descripcion: string | null;
        precio: number | null;
        precioFormateado: string | null;
        direccion: string | null;
        colonia: string | null;
        municipio: string | null;
        estado: string | null;
        codigoPostal: string | null;
        latitud: number | null;
        longitud: number | null;
        habitaciones: number | null;
        banos: number | null;
        estacionamientos: number | null;
        superficie_terreno: number | null;
        superficie_construida: number | null;
        anio_construccion: number | null;
        amenidades: string | null;
        extras: string | null;
        operacion: string | null;
        tipo: string | null;
        destacado: boolean;
        estatus: PropertyStatus | null;
        imagenes: ImageWithSignedUrl[];
        metadata?: Record<string, unknown> | null;
        createdAt: string | null;
        updatedAt: string | null;
};

type RawImage = {
        id?: string | number;
        url?: unknown;
        signed_url?: unknown;
        signedUrl?: unknown;
        path?: unknown;
        metadata?: unknown;
        orden?: unknown;
        order?: unknown;
        titulo?: unknown;
        title?: unknown;
        descripcion?: unknown;
        description?: unknown;
        is_cover?: unknown;
        isCover?: unknown;
        is_public?: unknown;
        isPublic?: unknown;
};

type RawStatus = {
        id?: unknown;
        nombre?: unknown;
        name?: unknown;
        color?: unknown;
};

export type RawProperty = {
        id?: unknown;
        slug?: unknown;
        titulo?: unknown;
        title?: unknown;
        descripcion?: unknown;
        description?: unknown;
        precio?: unknown;
        price?: unknown;
        precio_formateado?: unknown;
        price_formatted?: unknown;
        direccion?: unknown;
        address?: unknown;
        colonia?: unknown;
        neighborhood?: unknown;
        municipio?: unknown;
        city?: unknown;
        estado?: unknown;
        state?: unknown;
        codigo_postal?: unknown;
        codigoPostal?: unknown;
        postal_code?: unknown;
        latitud?: unknown;
        longitud?: unknown;
        habitaciones?: unknown;
        rooms?: unknown;
        banos?: unknown;
        bathrooms?: unknown;
        medios_banos?: unknown;
        half_bathrooms?: unknown;
        estacionamientos?: unknown;
        parking_spots?: unknown;
        superficie_terreno?: unknown;
        superficie_construida?: unknown;
        anio_construccion?: unknown;
        amenidades?: unknown;
        extras?: unknown;
        operacion?: unknown;
        operation?: unknown;
        tipo?: unknown;
        type?: unknown;
        destacado?: unknown;
        featured?: unknown;
        estatus?: RawStatus | null;
        status?: RawStatus | null;
        imagenes?: RawImage[] | null;
        images?: RawImage[] | null;
        metadata?: unknown;
        created_at?: unknown;
        updated_at?: unknown;
        createdAt?: unknown;
        updatedAt?: unknown;
};

const mapImage = (image: RawImage): ImageWithSignedUrl => {
        const idValue = image.id ?? randomUUID();
        const id = typeof idValue === "string" ? idValue : idValue !== undefined ? String(idValue) : randomUUID();
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
                (metadataSignedUrl && !metadataSignedUrl.includes("X-Amz-")
                        ? metadataSignedUrl
                        : null);
        const rawSignedUrl =
                parseNullableString(image.signed_url) ??
                parseNullableString(image.signedUrl) ??
                parseNullableString(metadataSignedUrl) ??
                (rawUrl && rawUrl.includes("X-Amz-") ? rawUrl : null);
        const path =
                parseNullableString(image.path) ??
                parseNullableString(metadataPath);

        return {
                id,
                url: rawUrl,
                signedUrl: rawSignedUrl,
                path,
                metadata,
                orden: typeof image.orden === "number" ? image.orden : typeof image.order === "number" ? image.order : null,
                titulo:
                        parseNullableString(image.titulo) ??
                        parseNullableString(image.title),
                descripcion:
                        parseNullableString(image.descripcion) ??
                        parseNullableString(image.description),
                isCover: parseBoolean(image.is_cover ?? image.isCover),
                isPublic: parseBoolean(
                        image.is_public ?? image.isPublic ?? (metadata?.isPublic as boolean | undefined)
                ),
        };
};

const mapStatus = (status: RawStatus | null | undefined): PropertyStatus | null => {
        if (!status || typeof status !== "object") {
                return null;
        }

        const id = status.id;
        const nombre = status.nombre ?? status.name;

        return {
                id: typeof id === "string" || typeof id === "number" ? id : "",
                nombre: parseNullableString(nombre),
                color: parseNullableString(status.color),
        };
};

export const normalizeProperty = (
        property: RawProperty | null | undefined
): PropertyWithSignedImages | null => {
        if (!property || typeof property !== "object") {
                return null;
        }

        const idValue = property.id;
        const id = typeof idValue === "string" || typeof idValue === "number" ? String(idValue) : "";
        const slugValue =
                parseNullableString(property.slug) ??
                (typeof property.slug === "number" ? String(property.slug) : null);
        const titleValue =
                parseNullableString(property.titulo) ??
                parseNullableString(property.title);
        const descriptionValue =
                parseNullableString(property.descripcion) ??
                parseNullableString(property.description);

        const imagesSource = Array.isArray(property.imagenes)
                ? property.imagenes
                : Array.isArray(property.images)
                ? property.images
                : [];

        const images = imagesSource.map(mapImage);

        const precio =
                parseNumber(property.precio) ??
                parseNumber(property.price);

        const surfaceTerreno = parseNumber(property.superficie_terreno);
        const surfaceConstruida = parseNumber(property.superficie_construida);

        const fallbackId = slugValue ?? (titleValue ? slugify(titleValue) : randomUUID());
        const finalId = id || fallbackId;

        return {
                id: finalId,
                slug:
                        slugValue ??
                        (titleValue ? slugify(titleValue) : finalId),
                titulo: titleValue,
                descripcion: descriptionValue,
                precio,
                precioFormateado:
                        parseNullableString(property.precio_formateado) ??
                        parseNullableString(property.price_formatted),
                direccion:
                        parseNullableString(property.direccion) ??
                        parseNullableString(property.address),
                colonia:
                        parseNullableString(property.colonia) ??
                        parseNullableString(property.neighborhood),
                municipio:
                        parseNullableString(property.municipio) ??
                        parseNullableString(property.city),
                estado:
                        parseNullableString(property.estado) ??
                        parseNullableString(property.state),
                codigoPostal:
                        parseNullableString(property.codigo_postal) ??
                        parseNullableString(property.codigoPostal) ??
                        parseNullableString(property.postal_code),
                latitud: parseNumber(property.latitud),
                longitud: parseNumber(property.longitud),
                habitaciones:
                        parseNumber(property.habitaciones) ??
                        parseNumber(property.rooms),
                banos:
                        parseNumber(property.banos) ??
                        parseNumber(property.bathrooms),
                estacionamientos:
                        parseNumber(property.estacionamientos) ??
                        parseNumber(property.parking_spots),
                superficie_terreno: surfaceTerreno,
                superficie_construida: surfaceConstruida,
                anio_construccion:
                        parseNumber(property.anio_construccion),
                amenidades: parseNullableString(property.amenidades),
                extras: parseNullableString(property.extras),
                operacion:
                        parseNullableString(property.operacion) ??
                        parseNullableString(property.operation),
                tipo: parseNullableString(property.tipo) ?? parseNullableString(property.type),
                destacado: parseBoolean(property.destacado ?? property.featured),
                estatus: mapStatus(property.estatus ?? property.status),
                imagenes: images,
                metadata:
                        property.metadata && typeof property.metadata === "object"
                                ? (property.metadata as Record<string, unknown>)
                                : null,
                createdAt:
                        parseDate(property.created_at ?? property.createdAt) ??
                        null,
                updatedAt:
                        parseDate(property.updated_at ?? property.updatedAt) ??
                        null,
        };
};

const fetchPropertyDetail = async (
        identifier: string | number | bigint
): Promise<PropertyWithSignedImages | null> => {
        try {
                const client = getInmueblesApiClient();
                const response = await client.get(`/inmuebles/${String(identifier)}`);
                const payload = (response.data?.data ?? response.data) as RawProperty | null | undefined;

                return normalizeProperty(payload);
        } catch (error) {
                if (isAxiosError(error) && error.response?.status === 404) {
                        return null;
                }

                console.error(`Error fetching property detail for identifier "${identifier}"`, error);

                return null;
        }
};

const findPropertyCandidate = (items: RawProperty[], slug: string): RawProperty | null => {
        const normalizedSlug = slug.trim().toLowerCase();
        const directMatch = items.find((item) => {
                const itemSlug =
                        parseNullableString(item.slug) ??
                        (typeof item.slug === "number" ? String(item.slug) : null);

                return itemSlug?.toLowerCase() === normalizedSlug;
        });

        if (directMatch) {
                return directMatch;
        }

        return items[0] ?? null;
};

export const getPropertyBySlug = async ({ slug, id }: GetPropertyBySlugParams): Promise<PropertyWithSignedImages | null> => {
        if (!slug && id === undefined) {
                return null;
        }

        if (id !== undefined) {
                const property = await fetchPropertyDetail(id);

                if (property) {
                        return property;
                }
        }

        if (!slug) {
                        return null;
        }

        const client = getInmueblesApiClient();

        // Intento directo por slug por si el API lo soporta como identificador.
        const directProperty = await fetchPropertyDetail(slug);

        if (directProperty) {
                return directProperty;
        }

        try {
                const response = await client.get("/inmuebles", {
                        params: {
                                search: slug,
                                limit: 20,
                        },
                });

                const data = response.data?.data ?? response.data;
                const items = Array.isArray(data) ? (data as RawProperty[]) : [];
                const candidate = findPropertyCandidate(items, slug);

                if (!candidate?.id) {
                        return null;
                }

                return fetchPropertyDetail(candidate.id as string | number | bigint);
        } catch (error) {
                console.error(`Error searching property by slug "${slug}"`, error);

                return null;
        }
};

export const getPropertySlugs = async (): Promise<string[]> => {
        try {
                const client = getInmueblesApiClient();
                const response = await client.get("/inmuebles", { params: { limit: 100 } });
                const data = response.data?.data ?? response.data;
                const items = Array.isArray(data) ? (data as RawProperty[]) : [];

                return items
                        .map((item) => {
                                const slug =
                                        parseNullableString(item.slug) ??
                                        (typeof item.slug === "number" ? String(item.slug) : null);

                                return slug;
                        })
                        .filter((value): value is string => Boolean(value));
        } catch (error) {
                console.error("Error fetching property slugs", error);

                return [];
        }
};
