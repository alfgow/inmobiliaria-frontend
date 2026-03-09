import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import InterestForm from "@/components/inmuebles/InterestForm";
import PropertyDetailMap from "@/components/inmuebles/PropertyDetailMap";
import PropertyGallery from "@/components/inmuebles/PropertyGallery";
import getInmueblesApiClient from "@/lib/inmuebles-api";
import {
  getPropertyBySlug,
  normalizeProperty,
  type PropertyWithSignedImages,
  type RawProperty,
} from "@/lib/properties";

export const dynamic = "force-dynamic";

type PropertyPageProps = {
  params:
    | {
        slug: string;
      }
    | Promise<{
        slug: string;
      }>;
};

type RelatedPropertyCard = {
  slug: string;
  title: string;
  priceLabel: string;
  imageUrl: string;
  summary: string;
  operationLabel: string | null;
  statusLabel: string | null;
  statusTone: "reserved" | "rented" | "sold" | "available" | "default";
};

const FALLBACK_SIMILAR_IMAGE = "/1.png";

const hasValue = (value: unknown): boolean => value !== null && value !== undefined && value !== "";

const normalizeStatusTone = (statusLabel?: string | null): RelatedPropertyCard["statusTone"] => {
  if (!statusLabel) {
    return "default";
  }

  const normalized = statusLabel.trim().toLowerCase();

  if (normalized.includes("reservad") || normalized.includes("apartad")) {
    return "reserved";
  }

  if (normalized.includes("rentad") || normalized.includes("alquilad")) {
    return "rented";
  }

  if (normalized.includes("vendid")) {
    return "sold";
  }

  if (normalized.includes("disponible") || normalized.includes("activo")) {
    return "available";
  }

  return "default";
};

const getStatusTagClasses = (tone: RelatedPropertyCard["statusTone"]) => {
  if (tone === "reserved") {
    return "bg-amber-100 text-amber-800 border border-amber-200";
  }

  if (tone === "rented") {
    return "bg-sky-100 text-sky-800 border border-sky-200";
  }

  if (tone === "sold") {
    return "bg-rose-100 text-rose-800 border border-rose-200";
  }

  if (tone === "available") {
    return "bg-emerald-100 text-emerald-800 border border-emerald-200";
  }

  return "bg-gray-100 text-gray-700 border border-gray-200";
};

const formatSquareMeters = (value: unknown): string | null => {
  if (!hasValue(value)) {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return `${numericValue.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} m²`;
};

const formatCurrency = (value: number | null | undefined, fallback?: string | null): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }

  return "Precio no disponible";
};

const parseList = (value?: string | null) => {
  if (!value) {
    return [] as string[];
  }

  return value
    .split(/\r?\n|,|\u2022|;|\|/)
    .map((item) => item.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
};

const pickCardImage = (property: PropertyWithSignedImages): string => {
  const cover = property.imagenes.find((image) => image.isCover);
  const coverUrl = cover?.signedUrl ?? cover?.url ?? cover?.path;

  if (coverUrl) {
    return coverUrl;
  }

  const firstImage = property.imagenes[0];

  return firstImage?.signedUrl ?? firstImage?.url ?? firstImage?.path ?? FALLBACK_SIMILAR_IMAGE;
};

const buildRelatedSummary = (property: PropertyWithSignedImages): string => {
  const roomLabel = hasValue(property.habitaciones) ? `${property.habitaciones} rec` : null;
  const bathLabel = hasValue(property.banos) ? `${property.banos} baños` : null;
  const surfaceLabel = formatSquareMeters(property.superficie_construida);

  const summary = [roomLabel, bathLabel, surfaceLabel].filter(Boolean).join(" · ");

  if (summary) {
    return summary;
  }

  return [property.colonia, property.municipio, property.estado].filter(Boolean).join(", ") || "Conoce esta propiedad";
};

const getRelatedProperties = async (property: PropertyWithSignedImages): Promise<RelatedPropertyCard[]> => {
  try {
    const client = getInmueblesApiClient();
    const response = await client.get("/inmuebles", { params: { limit: 40 } });
    const rawData = response.data?.data ?? response.data;
    const items = Array.isArray(rawData) ? (rawData as RawProperty[]) : [];

    const normalizedItems = items
      .map((item) => normalizeProperty(item))
      .filter((item): item is PropertyWithSignedImages => Boolean(item))
      .filter((item) => item.slug !== property.slug);

    const scored = normalizedItems.map((candidate) => {
      let score = 0;

      if (candidate.municipio && candidate.municipio === property.municipio) {
        score += 4;
      }

      if (candidate.estado && candidate.estado === property.estado) {
        score += 3;
      }

      if (candidate.operacion && candidate.operacion === property.operacion) {
        score += 2;
      }

      if (candidate.tipo && candidate.tipo === property.tipo) {
        score += 2;
      }

      if (candidate.estatus?.nombre?.toLowerCase().includes("disponible")) {
        score += 1;
      }

      return {
        candidate,
        score,
      };
    });

    return scored
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const aTime = a.candidate.updatedAt ? new Date(a.candidate.updatedAt).getTime() : 0;
        const bTime = b.candidate.updatedAt ? new Date(b.candidate.updatedAt).getTime() : 0;

        return bTime - aTime;
      })
      .slice(0, 3)
      .map(({ candidate }) => ({
        slug: candidate.slug,
        title: candidate.titulo ?? "Inmueble recomendado",
        priceLabel: formatCurrency(candidate.precio, candidate.precioFormateado),
        imageUrl: pickCardImage(candidate),
        summary: buildRelatedSummary(candidate),
        operationLabel: candidate.operacion,
        statusLabel: candidate.estatus?.nombre ?? null,
        statusTone: normalizeStatusTone(candidate.estatus?.nombre ?? null),
      }));
  } catch (error) {
    console.error("Error loading related properties", error);

    return [];
  }
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

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const property = await getPropertyBySlug({ slug });

  if (!property) {
    return {
      title: "Inmueble no encontrado | Villanueva Garcia",
      description: "La propiedad solicitada no existe o ha sido deshabilitada.",
    };
  }

  const locationSegments = [property.colonia, property.municipio, property.estado].filter(Boolean);
  const locationLabel = locationSegments.join(", ");
  const baseTitle = property.titulo ?? "Detalle de inmueble";
  const title = `${baseTitle} | Villanueva Garcia`;
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
    .map((image) => ({
      url: image?.signedUrl ?? image?.url ?? image?.path ?? "",
      alt: (image?.metadata as { alt?: string } | null)?.alt ?? property.titulo ?? "Imagen del inmueble",
    }))
    .filter((image) => Boolean(image.url));

  const priceLabel = formatCurrency(property.precio, property.precioFormateado);
  const updatedAtLabel = property.updatedAt
    ? new Date(property.updatedAt).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const quickMetrics = [
    {
      label: "Construccion",
      value: formatSquareMeters(property.superficie_construida) ?? "Por confirmar",
    },
    {
      label: "Recamaras",
      value: hasValue(property.habitaciones) ? `${property.habitaciones}` : "Por confirmar",
    },
    {
      label: "Banos",
      value: hasValue(property.banos) ? `${property.banos}` : "Por confirmar",
    },
    {
      label: "Cajones",
      value: hasValue(property.estacionamientos) ? `${property.estacionamientos}` : "Por confirmar",
    },
  ];

  const extraMetrics = [
    {
      label: "Terreno",
      value: formatSquareMeters(property.superficie_terreno) ?? "Por confirmar",
    },
    {
      label: "Ano de construccion",
      value: hasValue(property.anio_construccion) ? `${property.anio_construccion}` : "Por confirmar",
    },
    {
      label: "Operacion",
      value: property.operacion ?? "Por confirmar",
    },
    {
      label: "Tipo",
      value: property.tipo ?? "Por confirmar",
    },
  ];

  const amenities = parseList(property.amenidades);
  const extras = parseList(property.extras);
  const descriptionParagraphs = property.descripcion
    ? property.descripcion
        .split("\n")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

  const locationSegments = [property.colonia, property.municipio, property.estado].filter(Boolean);
  const locationLabel = locationSegments.join(", ");

  const latitude = property.latitud ? Number(property.latitud) : null;
  const longitude = property.longitud ? Number(property.longitud) : null;

  const relatedProperties = await getRelatedProperties(property);

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
      <Navbar />
      <main className="min-h-screen bg-[#f3f1ec] pb-20 pt-24 md:pb-24 md:pt-32">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-5 rounded-3xl border border-[#d9e9dd] bg-white/90 p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="space-y-3">
              <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link href="/" className="transition hover:text-green-700">
                      Inicio
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href="/inmuebles" className="transition hover:text-green-700">
                      Inmuebles
                    </Link>
                  </li>
                  {property.estado ? (
                    <>
                      <li aria-hidden="true">/</li>
                      <li className="font-medium text-gray-700">{property.estado}</li>
                    </>
                  ) : null}
                </ol>
              </nav>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                  style={{ backgroundColor: statusColor ?? "#15803d" }}
                >
                  {statusName}
                </span>
                {updatedAtLabel ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
                    Actualizado: {updatedAtLabel}
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
                {property.titulo ?? "Detalle del inmueble"}
              </h1>

              <p className="text-base text-gray-600 md:text-lg">
                {property.direccion ?? locationLabel ?? "Ubicacion por confirmar"}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 px-5 py-4 text-left md:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Precio</p>
              <p className="mt-1 text-3xl font-black text-gray-900 md:text-4xl">{priceLabel}</p>
            </div>
          </header>

          <PropertyGallery images={images} title={property.titulo} />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <section className="space-y-10 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 rounded-3xl border border-[#d9e9dd] bg-white p-6 shadow-sm sm:grid-cols-4">
                {quickMetrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-[#f6fbf8] px-3 py-4 text-center"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green-700">{metric.label}</p>
                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                  </article>
                ))}
              </div>

              <section className="space-y-4 rounded-3xl border border-[#d9e9dd] bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-2xl font-bold text-gray-900">Sobre esta propiedad</h2>

                {descriptionParagraphs.length ? (
                  <div className="space-y-4 text-base leading-relaxed text-gray-700">
                    {descriptionParagraphs.map((paragraph, index) => (
                      <p key={`description-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Solicita informacion para conocer todos los detalles de este inmueble.
                  </p>
                )}

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  {extraMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl bg-[#f6fbf8] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700">{metric.label}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {amenities.length ? (
                <section className="space-y-5 rounded-3xl border border-[#d9e9dd] bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-2xl font-bold text-gray-900">Amenidades y caracteristicas</h2>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3 text-sm font-medium text-gray-700"
                      >
                        <span className="inline-flex h-2 w-2 rounded-full bg-green-600" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {extras.length ? (
                <section className="space-y-5 rounded-3xl border border-[#d9e9dd] bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-2xl font-bold text-gray-900">Detalles adicionales</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {extras.map((extra) => (
                      <li key={extra} className="rounded-2xl bg-[#f6fbf8] px-4 py-3 text-sm text-gray-700">
                        {extra}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <PropertyDetailMap
                latitude={latitude}
                longitude={longitude}
                title={property.titulo}
                address={property.direccion}
                city={property.municipio}
                state={property.estado}
                priceLabel={priceLabel}
                statusName={statusName}
                statusColor={statusColor ?? undefined}
                statusId={statusId}
                operation={property.operacion}
              />
            </section>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-5">
                <InterestForm propertyTitle={property.titulo} />

                <div className="flex items-center justify-between rounded-2xl border border-[#d9e9dd] bg-white px-4 py-3 text-sm">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 font-semibold text-gray-600 transition hover:text-green-700"
                  >
                    Compartir
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 font-semibold text-gray-600 transition hover:text-green-700"
                  >
                    Favorito
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {relatedProperties.length ? (
            <section className="mt-8 border-t border-[#d9e9dd] pt-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Propiedades similares</h2>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedProperties.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/inmuebles/${related.slug}`}
                    className="group overflow-hidden rounded-3xl border border-[#d9e9dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        fill
                        src={related.imageUrl}
                        alt={related.title}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                        {related.operationLabel ? (
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                            {related.operationLabel}
                          </span>
                        ) : null}
                        {related.statusLabel ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusTagClasses(
                              related.statusTone,
                            )}`}
                          >
                            {related.statusLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="space-y-2 p-5">
                      <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-green-700">{related.title}</h3>
                      <p className="text-sm text-gray-500">{related.summary}</p>
                      <p className="text-xl font-black text-gray-900">{related.priceLabel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyPage;

