import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PropertyGallery from "@/components/inmuebles/PropertyGallery";
import PropertyHighlights from "@/components/inmuebles/PropertyHighlights";
import InterestForm from "@/components/inmuebles/InterestForm";
import PropertyDetailMap from "@/components/inmuebles/PropertyDetailMap";
import { getPropertyBySlug, getPropertySlugs, type ImageWithSignedUrl, type PropertyWithSignedImages } from "@/lib/properties";

export const revalidate = 60;

type PropertyPageProps = {
  params:
    | {
        slug: string;
      }
    | Promise<{
        slug: string;
      }>;
};

const buildOpenGraphImages = (property: PropertyWithSignedImages | null) => {
  const openGraphImages = (property?.imagenes ?? []).flatMap((image) => {
    const imageMetadata = (image.metadata ?? {}) as { alt?: string };
    const url = image.signedUrl ?? image.url ?? image.path;

    if (!url) {
      return [] as const;
    }

    return [
      {
        url,
        alt: imageMetadata?.alt ?? property?.titulo ?? "Imagen del inmueble",
      },
    ] as const;
  });

  return openGraphImages.length > 0 ? openGraphImages : undefined;
};

export async function generateStaticParams() {
  try {
    const slugs = await getPropertySlugs();

    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("Error generating static params for properties", error);

    return [];
  }
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const property = await getPropertyBySlug({ slug });

  if (!property) {
    return {
      title: "Inmueble no encontrado | Villanueva García",
      description: "La propiedad solicitada no existe o ha sido deshabilitada.",
    };
  }

  const locationSegments = [property.colonia, property.municipio, property.estado].filter(Boolean);
  const locationLabel = locationSegments.join(", ");
  const baseTitle = property.titulo ?? "Detalle de inmueble";
  const title = `${baseTitle} | Villanueva García`;
  const description =
    property.descripcion ??
    `Conoce los detalles de ${baseTitle}${locationLabel ? ` ubicada en ${locationLabel}` : ""}.`;

  const images = buildOpenGraphImages(property);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://villanuevagarcia.mx/inmuebles/${slug}`,
      images,
    },
  };
}

const PropertyPage = async ({ params }: PropertyPageProps) => {
  const { slug } = await Promise.resolve(params);
  const property = await getPropertyBySlug({ slug });

  if (!property) {
    notFound();
  }

  const statusName = property.estatus?.nombre ?? "Sin estatus";
  const statusColor = property.estatus?.color ?? null;
  const statusId = property.estatus?.id ?? null;
  const images = (property.imagenes ?? [])
    .map((image: ImageWithSignedUrl) => ({
      url: image?.signedUrl ?? image?.url ?? image?.path ?? "",
      alt: (image?.metadata as { alt?: string } | null)?.alt ?? property.titulo ?? "Imagen del inmueble",
    }))
    .filter((image) => Boolean(image.url));

  const price =
    property.precio !== null && property.precio !== undefined
      ? new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        }).format(Number(property.precio))
      : property.precioFormateado ?? "No disponible";

  const updatedAtLabel = property.updatedAt
    ? new Date(property.updatedAt).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const metrics = [
    {
      label: "Recámaras",
      value: property.habitaciones ? `${property.habitaciones}` : "Por confirmar",
    },
    {
      label: "Baños",
      value: property.banos ? `${property.banos}` : "Por confirmar",
    },
    {
      label: "Estacionamientos",
      value: property.estacionamientos ? `${property.estacionamientos}` : "Por confirmar",
    },
    {
      label: "Construcción",
      value: property.superficie_construida
        ? `${Number(property.superficie_construida).toLocaleString("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} m²`
        : "Por confirmar",
    },
    {
      label: "Terreno",
      value: property.superficie_terreno
        ? `${Number(property.superficie_terreno).toLocaleString("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} m²`
        : "Por confirmar",
    },
    {
      label: "Año de construcción",
      value: property.anio_construccion ? `${property.anio_construccion}` : "Por confirmar",
    },
  ].filter((metric) => metric.value);

  const parseList = (value?: string | null) => {
    if (!value) {
      return [] as string[];
    }

    return value
      .split(/\r?\n|,|\u2022|;|\|/)
      .map((item) => item.replace(/^[-•\s]+/, "").trim())
      .filter(Boolean);
  };

  const amenities = parseList(property.amenidades);
  const extras = parseList(property.extras);
  const descriptionParagraphs = property.descripcion
    ? property.descripcion.split("\n").map((paragraph) => paragraph.trim()).filter(Boolean)
    : [];

  const locationSegments = [property.colonia, property.municipio, property.estado].filter(Boolean);
  const locationLabel = locationSegments.join(", ");

  const latitude = property.latitud ? Number(property.latitud) : null;
  const longitude = property.longitud ? Number(property.longitud) : null;

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
      <Navbar />
      <main className="min-h-screen bg-[#f1efeb] pt-24 pb-20 md:pt-32 md:pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center rounded-full bg-[var(--indigo)]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--indigo)]">
                {statusName}
              </span>
              {locationLabel ? (
                <span className="inline-flex items-center rounded-full border border-[var(--indigo)]/20 bg-white px-4 py-1 text-xs font-medium text-[var(--text-dark)]">
                  {locationLabel}
                </span>
              ) : null}
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-[var(--text-dark)] sm:text-4xl md:text-5xl">
                {property.titulo}
              </h1>
              <p className="text-base text-gray-600">{property.direccion}</p>
            </div>
          </header>

          <PropertyGallery images={images} title={property.titulo} />

          <PropertyHighlights
            price={price}
            operation={property.operacion}
            type={property.tipo}
            status={statusName}
            updatedAt={updatedAtLabel}
            metrics={metrics}
            amenities={amenities}
          />

          <section className="grid gap-10 lg:grid-cols-[2fr,1fr]">
            <article className="space-y-8 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-lg backdrop-blur">
              {descriptionParagraphs.length ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Descripción</h2>
                  <div className="space-y-4 text-base leading-relaxed text-gray-700">
                    {descriptionParagraphs.map((paragraph, index) => (
                      <p key={`description-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text-dark)]">Ubicación detallada</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><strong>Colonia:</strong> {property.colonia ?? "No especificada"}</li>
                    <li><strong>Municipio:</strong> {property.municipio ?? "No especificado"}</li>
                    <li><strong>Estado:</strong> {property.estado ?? "No especificado"}</li>
                    <li><strong>Código postal:</strong> {property.codigoPostal ?? "No especificado"}</li>
                  </ul>
                </div>
                {extras.length ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--text-dark)]">Detalles adicionales</h3>
                    <ul className="grid gap-2 text-sm text-gray-600">
                      {extras.map((extra) => (
                        <li key={extra} className="rounded-2xl bg-white/90 px-4 py-2 shadow-sm">
                          {extra}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {amenities.length ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text-dark)]">Amenidades completas</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {amenities.map((amenity) => (
                      <li key={amenity} className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm">
                        <span className="inline-flex h-2 w-2 rounded-full bg-[var(--lime)]" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>

            <InterestForm propertyTitle={property.titulo} />
          </section>

          <PropertyDetailMap
            latitude={latitude}
            longitude={longitude}
            title={property.titulo}
            address={property.direccion}
            city={property.municipio}
            state={property.estado}
            priceLabel={price}
            statusName={statusName}
            statusColor={statusColor ?? undefined}
            statusId={statusId}
            operation={property.operacion}
          />

          <div className="mt-4">
            <ContactSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyPage;
