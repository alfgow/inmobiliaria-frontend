"use client";

import { useMemo, useRef } from "react";

import PropertyCarousel from "./PropertyCarousel";
import { mapPropertiesFromApi, useProperties } from "./useProperties";

const FeaturedProperties = () => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const { properties: apiProperties, isLoading, error } = useProperties();
  const properties = useMemo(
    () => mapPropertiesFromApi(apiProperties),
    [apiProperties],
  );
  const totalProperties = properties.length;
  const showDesktopNavigation = totalProperties > 3;

  return (
    <section id="propiedades" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--text-dark)]">
          Propiedades Destacadas
        </h2>

        <div className="featured-properties relative mx-auto flex max-w-6xl flex-col items-center ">
          <div className="swiper-container w-full ">
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

            {!isLoading && !error && totalProperties === 0 && (
              <div className="flex h-56 items-center justify-center">
                <p className="text-gray-500">
                  No hay propiedades destacadas disponibles por ahora.
                </p>
              </div>
            )}

            {!isLoading && !error && totalProperties > 0 && (
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
            className={`nav-prev absolute -left-16 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md ${showDesktopNavigation ? "md:flex" : "md:hidden"}`}
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
            className={`nav-next absolute -right-16 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md ${showDesktopNavigation ? "md:flex" : "md:hidden"}`}
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
          <div
            ref={paginationRef}
            className={`swiper-pagination !static ${totalProperties <= 1 ? "hidden" : ""}`}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
