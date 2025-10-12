"use client";

import { useEffect, useState } from "react";

import type { Property } from "./PropertyCarousel";

export interface ApiPropertyImage {
        id: string;
        signedUrl?: string | null;
        url?: string | null;
        path?: string | null;
        isCover?: boolean;
}

export interface ApiPropertyStatus {
        id: number | string;
        name?: string | null;
        color?: string | null;
}

export interface ApiPropertyLegacyStatus {
        id: number | string;
        nombre?: string | null;
        color?: string | null;
}

export interface ApiPropertyLocation {
        latitude?: number | null;
        longitude?: number | null;
}

export interface ApiProperty {
        id: string;
        title?: string | null;
        slug?: string | null;
        price?: number | null;
        priceFormatted?: string | null;
        operation?: string | null;
        status?: ApiPropertyStatus | null;
        estatus?: ApiPropertyLegacyStatus | null;
        city?: string | null;
        state?: string | null;
        address?: string | null;
        neighborhood?: string | null;
        postalCode?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        location?: ApiPropertyLocation | null;
        isAvailable?: boolean;
        is_available?: boolean;
        active?: boolean;
        images?: ApiPropertyImage[];
        featured?: boolean;
        metadata?: Record<string, unknown> | null;
}

export const FALLBACK_IMAGE = "/1.png";

export const formatOperation = (operation?: string | null) => {
	if (!operation) {
		return null;
	}

	const normalized = operation.toLowerCase();

	return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const toNumber = (value: unknown, fallback = 0): number => {
        if (typeof value === "number" && Number.isFinite(value)) {
                return value;
        }

	if (typeof value === "string") {
		const parsed = Number(value);

		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

return fallback;
};

const toNullableNumber = (value: unknown): number | null => {
        if (typeof value === "number" && Number.isFinite(value)) {
                return value;
        }

        if (typeof value === "string") {
                const parsed = Number(value);

                if (Number.isFinite(parsed)) {
                        return parsed;
                }
        }

        return null;
};

const normalizeApiProperty = (item: ApiProperty): ApiProperty => {
        const latitude = toNullableNumber(item.latitude ?? item.location?.latitude);
        const longitude = toNullableNumber(item.longitude ?? item.location?.longitude);
        const hasCoordinates = latitude !== null || longitude !== null;
        const statusId = toNumber(item.status?.id ?? item.estatus?.id, 0);
        const statusName = item.status?.name ?? item.estatus?.nombre ?? null;
        const statusColor = item.status?.color ?? item.estatus?.color ?? null;
        const normalizedStatus: ApiPropertyStatus | null = item.status
                ? {
                          id: item.status.id,
                          name: item.status.name ?? statusName ?? undefined,
                          color: item.status.color ?? statusColor ?? undefined,
                  }
                : item.estatus
                ? {
                          id: item.estatus.id,
                          name: item.estatus.nombre ?? undefined,
                          color: item.estatus.color ?? undefined,
                  }
                : null;
        const isAvailable =
                typeof item.isAvailable === "boolean"
                        ? item.isAvailable
                        : typeof item.is_available === "boolean"
                        ? item.is_available
                        : typeof item.active === "boolean"
                        ? item.active
                        : statusName
                        ? statusName.toLowerCase().includes("disponible")
                        : statusId === 1;

        return {
                ...item,
                latitude,
                longitude,
                location: hasCoordinates ? { latitude, longitude } : null,
                status: normalizedStatus,
                isAvailable,
                is_available: isAvailable,
                active: isAvailable,
        };
};

export const mapPropertiesFromApi = (items: ApiProperty[]): Property[] =>
	items
		.filter((item) => {
			const statusId = toNumber(item.status?.id, 0);
			const hasActiveStatus = statusId === 1;
			const isFeatured = item.featured === true;

			return hasActiveStatus && isFeatured;
		})
		.map((item) => {
			const coverImage =
				item.images?.find((image) => image.isCover) ??
				item.images?.[0] ??
				null;

			const locationParts = [item.city, item.state].filter(
				Boolean
			) as string[];

			return {
				id: item.id,
				title: item.title ?? "Inmueble sin título",
				slug: item.slug ?? null,
				price: toNumber(item.price, 0),
				operation: formatOperation(item.operation),
				status: item.status?.name ?? null,
				coverImageUrl:
					coverImage?.signedUrl ?? coverImage?.url ?? FALLBACK_IMAGE,
				location:
					locationParts.length > 0 ? locationParts.join(", ") : null,
			};
		});

export const useProperties = () => {
	const [properties, setProperties] = useState<ApiProperty[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchProperties = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/properties");

				if (!response.ok) {
					throw new Error("No se pudieron cargar las propiedades");
				}

                                const { data }: { data?: ApiProperty[] } = await response.json();
                                const items: ApiProperty[] = Array.isArray(data) ? data : [];
                                const normalizedItems = items.map((item) => normalizeApiProperty(item));

                                if (isMounted) {
                                        console.log(
                                                "[useProperties] Fetched properties from API:",
                                                normalizedItems
                                        );

                                        const imagesSummary = normalizedItems.map((property) => ({
                                                id: property.id,
                                                images: (property.images ?? []).map((image) => ({
                                                        id: image.id,
                                                        signedUrl: image.signedUrl,
                                                        url: image.url,
                                                        path: image.path,
                                                        isCover: image.isCover ?? false,
                                                })),
                                        }));

                                        console.log(
                                                "[useProperties] Images summary:",
                                                imagesSummary
                                        );

                                        setProperties(normalizedItems);
                                }
                        } catch (fetchError) {
				const message =
					fetchError instanceof Error
						? fetchError.message
						: "Ocurrió un error inesperado";

				if (isMounted) {
					setError(message);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		fetchProperties();

		return () => {
			isMounted = false;
		};
	}, []);

	return { properties, isLoading, error };
};
