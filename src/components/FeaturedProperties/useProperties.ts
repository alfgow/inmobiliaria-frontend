"use client";

import { useEffect, useState } from "react";

import type { Property } from "./PropertyCarousel";

export interface ApiPropertyImage {
  s3Key: string;
  signedUrl?: string | null;
  isCover?: boolean;
}

export interface ApiPropertyStatus {
  name: string;
}

export interface ApiProperty {
  id: string;
  title: string;
  price: number;
  operation?: string | null;
  status?: ApiPropertyStatus | null;
  city?: string | null;
  state?: string | null;
  images?: ApiPropertyImage[];
}

export const FALLBACK_IMAGE = "/1.png";

export const formatOperation = (operation?: string | null) => {
  if (!operation) {
    return null;
  }

  const normalized = operation.toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const mapPropertiesFromApi = (items: ApiProperty[]): Property[] =>
  items.map((item) => {
    const coverImage =
      item.images?.find((image) => image.isCover) ?? item.images?.[0] ?? null;

    const locationParts = [item.city, item.state].filter(Boolean) as string[];

    return {
      id: item.id,
      title: item.title,
      price: item.price,
      operation: formatOperation(item.operation),
      status: item.status?.name ?? null,
      coverImageUrl: coverImage?.signedUrl ?? FALLBACK_IMAGE,
      location: locationParts.length > 0 ? locationParts.join(", ") : null,
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

        const { data } = await response.json();
        const items = Array.isArray(data) ? data : [];

        if (isMounted) {
          setProperties(items);
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
