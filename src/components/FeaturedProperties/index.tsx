"use client";

import { useEffect, useRef, useState } from "react";

import PropertyCarousel, { Property } from "./PropertyCarousel";

interface ApiPropertyImage {
  s3Key: string;
  isCover?: boolean;
}

interface ApiPropertyStatus {
  name: string;
}

interface ApiProperty {
  id: string;
  title: string;
  price: number;
  operation?: string | null;
  status?: ApiPropertyStatus | null;
  city?: string | null;
  state?: string | null;
  images?: ApiPropertyImage[];
}

const FALLBACK_IMAGE = "/1.png";

const ensureAbsoluteImageUrl = (imageKey?: string): string => {
  if (!imageKey) {
    return FALLBACK_IMAGE;
  }

  if (imageKey.startsWith("http")) {
    return imageKey;
  }

  const baseUrl = process.env.NEXT_PUBLIC_FILES_BASE_URL;

  if (baseUrl) {
    const sanitizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const sanitizedKey = imageKey.startsWith("/") ? imageKey.slice(1) : imageKey;

    return `${sanitizedBase}/${sanitizedKey}`;
  }

  return imageKey || FALLBACK_IMAGE;
};

const formatOperation = (operation?: string | null) => {
  if (!operation) {
    return null;
  }

  const normalized = operation.toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const mapPropertiesFromApi = (items: ApiProperty[]): Property[] =>
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
      coverImageUrl: ensureAbsoluteImageUrl(coverImage?.s3Key),
      location: locationParts.length > 0 ? locationParts.join(", ") : null,
    };
  });

const FeaturedProperties = () => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);
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
          setProperties(mapPropertiesFromApi(items));
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

  return (
    <section id="propiedades" className="bg-[#f1efeb] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--text-dark)]">
          Propiedades Destacadas
        </h2>

        <div className="relative">
          <div className="swiper-container">
            {isLoading && (
              <div className="flex h-56 items-center justify-center">
                <p className="text-gray-500">Cargando propiedades…</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="rounded-lg bg-red-50 p-4 text-center text-red-700">
                {error}
              </div>
            )}

            {!isLoading && !error && properties.length === 0 && (
              <div className="flex h-56 items-center justify-center">
                <p className="text-gray-500">
                  No hay propiedades destacadas disponibles por ahora.
                </p>
              </div>
            )}

            {!isLoading && !error && properties.length > 0 && (
              <PropertyCarousel
                properties={properties}
                navigationPrevRef={prevRef}
                navigationNextRef={nextRef}
                paginationRef={paginationRef}
              />
            )}
          </div>

          <button
            ref={prevRef}
            className="nav-prev absolute -left-16 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md md:flex"
            aria-label="Ver propiedad anterior"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M15.53 4.47a.75.75 0 010 1.06L9.06 12l6.47 6.47a.75.75 0 11-1.06 1.06l-7-7a.75.75 0 010-1.06l7-7a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            ref={nextRef}
            className="nav-next absolute -right-16 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md md:flex"
            aria-label="Ver siguiente propiedad"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M8.47 4.47a.75.75 0 011.06 0l7 7a.75.75 0 010 1.06l-7 7a.75.75 0 11-1.06-1.06L14.94 12 8.47 5.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <div ref={paginationRef} className="swiper-pagination !static" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
