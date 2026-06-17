import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import InterestForm from "@/components/inmuebles/InterestForm";
import Navbar from "@/components/Navbar";
import PropertyDetailMap from "@/components/inmuebles/PropertyDetailMap";
import PropertyGallery from "@/components/inmuebles/PropertyGallery";
import { getPropertyBySlug, getPublicProperties } from "@/lib/properties";
import { resolvePublicImageUrl, type PublicProperty } from "@/lib/property-types";
import { getPrimaryPropertyImageUrl, getRelatedProperties as selectRelatedProperties } from "@/lib/property-selection";

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

const decodeEscapedText = (value: string): string =>
  value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");

const normalizeListItem = (value: string): string => {
  const decoded = decodeEscapedText(value.trim());
  const unwrapped = decoded.replace(/^["'[\s]+|["'\s\]]+$/g, "").trim();

  return unwrapped;
};

const parseList = (value?: string | null) => {
  if (!value) {
    return [] as string[];
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed
        .flatMap((item) => (typeof item === "string" ? [normalizeListItem(item)] : []))
        .filter(Boolean);
    }

    if (typeof parsed === "string") {
      return [normalizeListItem(parsed)].filter(Boolean);
    }
  } catch {
    // Fall back to delimiter-based parsing below.
  }

  return trimmed
    .split(/\r?\n|,|\u2022|;|\|/)
    .map((item) => normalizeListItem(item.replace(/^[-•\s]+/, "")))
    .filter(Boolean);
};

const parseDescription = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return decodeEscapedText(value)
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();
};

const buildRelatedSummary = (property: PublicProperty): string => {
  const roomLabel = hasValue(property.rooms) ? `${property.rooms} rec` : null;
  const bathLabel = hasValue(property.bathrooms) ? `${property.bathrooms} baños` : null;
  const surfaceLabel = formatSquareMeters(property.constructionSizeM2);

  const summary = [roomLabel, bathLabel, surfaceLabel].filter(Boolean).join(" · ");

  if (summary) {
    return summary;
  }

  return [property.neighborhood, property.city, property.state].filter(Boolean).join(", ") || "Conoce esta propiedad";
};

const getRelatedProperties = async (property: PublicProperty): Promise<RelatedPropertyCard[]> => {
  try {
    const candidates = await getPublicProperties({ limit: 40 });
    const related = selectRelatedProperties(property, candidates, { limit: 3, priceTolerance: 3000 });

    return related
      .map((candidate) => ({
        slug: candidate.slug ?? candidate.id,
        title: candidate.title ?? "Inmueble recomendado",
        priceLabel: formatCurrency(candidate.price, candidate.priceFormatted),
        imageUrl: getPrimaryPropertyImageUrl(candidate),
        summary: buildRelatedSummary(candidate),
        operationLabel: candidate.operation,
        statusLabel: candidate.status?.name ?? null,
        statusTone: normalizeStatusTone(candidate.status?.name ?? null),
      }));
  } catch (caughtError) {
    console.error("Error loading related properties", caughtError);

    return [];
  }
};

const buildOpenGraphImages = (property: PublicProperty | null) => {
  const openGraphImages = (property?.images ?? []).flatMap((image) => {
    const imageMetadata = (image.metadata ?? {}) as { alt?: string };
    const url = resolvePublicImageUrl(image.url ?? image.path ?? null);

    if (!url) {
      return [] as const;
    }

    return [
      {
        url,
        alt: imageMetadata?.alt ?? property?.title ?? "Imagen del inmueble",
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

  const locationSegments = [property.neighborhood, property.city, property.state].filter(Boolean);
  const locationLabel = locationSegments.join(", ");
  const baseTitle = property.title ?? "Detalle de inmueble";
  const title = `${baseTitle} | Villanueva Garcia`;
  const description =
    property.seoDescription ??
    property.description ??
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

  const statusName = property.status?.name ?? "Sin estatus";
  const statusColor = property.status?.color ?? null;
  const statusId = property.status?.id ?? null;

  const images = (property.images ?? [])
    .map((image) => ({
      url: resolvePublicImageUrl(image?.url ?? image?.path ?? null),
      alt: (image?.metadata as { alt?: string } | null)?.alt ?? property.title ?? "Imagen del inmueble",
    }))
    .filter((image) => Boolean(image.url));

  const priceLabel = formatCurrency(property.price, property.priceFormatted);
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
      value: formatSquareMeters(property.constructionSizeM2) ?? "Por confirmar",
    },
    {
      label: "Recamaras",
      value: hasValue(property.rooms) ? `${property.rooms}` : "Por confirmar",
    },
    {
      label: "Banos",
      value: hasValue(property.bathrooms) ? `${property.bathrooms}` : "Por confirmar",
    },
    {
      label: "Cajones",
      value: hasValue(property.parkingSpots) ? `${property.parkingSpots}` : "Por confirmar",
    },
  ];

  const extraMetrics = [
    {
      label: "Terreno",
      value: formatSquareMeters(property.landSizeM2) ?? "Por confirmar",
    },
    {
      label: "Ano de construccion",
      value: hasValue(property.age) ? `${property.age}` : "Por confirmar",
    },
    {
      label: "Operacion",
      value: property.operation ?? "Por confirmar",
    },
    {
      label: "Tipo",
      value: property.type ?? "Por confirmar",
    },
  ];

  const amenities = parseList(property.amenities);
  const extras = parseList(property.extras);
  const descriptionText = parseDescription(property.description);
  const seoDescriptionText = parseDescription(property.seoDescription);
  const mainDescriptionText = seoDescriptionText || descriptionText;

  const locationSegments = [property.neighborhood, property.city, property.state].filter(Boolean);
  const locationLabel = locationSegments.join(", ");

  const latitude = property.latitude ? Number(property.latitude) : null;
  const longitude = property.longitude ? Number(property.longitude) : null;

  const relatedProperties = await getRelatedProperties(property);
  const relatedPropertiesCount = relatedProperties.length;
  const relatedGridClasses =
    relatedPropertiesCount === 1
      ? "mt-8 grid grid-cols-1 justify-items-center gap-6"
      : relatedPropertiesCount === 2
        ? "mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-5xl"
        : "mt-8 grid grid-cols-1 gap-6 md:grid-cols-3";

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
                  {property.state ? (
                    <>
                      <li aria-hidden="true">/</li>
                      <li className="font-medium text-gray-700">{property.state}</li>
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
                {property.title ?? "Detalle del inmueble"}
              </h1>

              <p className="text-base text-gray-600 md:text-lg">
                {property.address ?? locationLabel ?? "Ubicacion por confirmar"}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 px-5 py-4 text-left md:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Precio</p>
              <p className="mt-1 text-3xl font-black text-gray-900 md:text-4xl">{priceLabel}</p>
            </div>
          </header>

          <PropertyGallery images={images} title={property.title} />

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

                <div className="grid gap-3 sm:grid-cols-2">
                  {extraMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-[#d9e9dd] bg-[#f6fbf8] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700">{metric.label}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{metric.value}</p>
                    </div>
                  ))}
                </div>

                {mainDescriptionText ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Descripción</h3>
                    <div className="space-y-4 text-base leading-relaxed text-gray-700">
                      <p className="whitespace-pre-line break-words">{mainDescriptionText}</p>
                    </div>
                  </div>
                ) : null}

                {!mainDescriptionText ? (
                  <p className="text-gray-600">
                    Solicita informacion para conocer todos los detalles de este inmueble.
                  </p>
                ) : null}

              </section>

              {amenities.length ? (
                <section className="space-y-5 rounded-3xl border border-[#d9e9dd] bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-2xl font-bold text-gray-900">Amenidades y caracteristicas</h2>
                  <ul className="flex flex-wrap gap-3">
                    {amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm"
                      >
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
                title={property.title}
                address={property.address}
                city={property.city}
                state={property.state}
                priceLabel={priceLabel}
                statusName={statusName}
                statusColor={statusColor ?? undefined}
                statusId={statusId}
                operation={property.operation}
              />
            </section>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-5">
                <InterestForm propertyTitle={property.title} />

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
              <div className={relatedGridClasses}>
                {relatedProperties.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/inmuebles/${related.slug}`}
                    className={`group overflow-hidden rounded-3xl border border-[#d9e9dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                      relatedPropertiesCount === 1
                        ? "w-full max-w-md"
                        : relatedPropertiesCount === 2
                          ? "w-full max-w-md"
                          : ""
                    }`}
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
                      <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-green-700">
                        {related.title}
                      </h3>
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
