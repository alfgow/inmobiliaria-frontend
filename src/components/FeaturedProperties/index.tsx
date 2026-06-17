import { getFeaturedProperties } from "@/lib/properties";

import FeaturedPropertiesClient from "./FeaturedPropertiesClient";
import type { FeaturedProperty } from "@/lib/property-types";

const FeaturedProperties = async () => {
  let properties: FeaturedProperty[] = [];
  let error: string | null = null;

  try {
    properties = await getFeaturedProperties();
  } catch (caughtError) {
    console.error("Error loading featured properties", caughtError);
    error = "No se pudieron cargar las propiedades destacadas.";
  }

  return (
    <section id="propiedades" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--text-dark)]">
          Propiedades Destacadas
        </h2>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-700">
            {error}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex h-56 items-center justify-center">
            <p className="text-gray-500">
              No hay propiedades destacadas disponibles por ahora.
            </p>
          </div>
        ) : (
          <FeaturedPropertiesClient properties={properties} />
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
