import Image from "next/image";
import Link from "next/link";

import { FALLBACK_IMAGE } from "@/components/FeaturedProperties/useProperties";
import type { ApiProperty } from "@/components/FeaturedProperties/useProperties";
import type { ViewMode } from "./FiltersBar";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

interface PropertyCardProps {
  property: ApiProperty;
  viewMode: ViewMode;
}

const getLocationLabel = (property: ApiProperty) => {
  const locationParts = [property.city, property.state].filter(Boolean);

  return locationParts.length > 0 ? locationParts.join(", ") : null;
};

const getPrimaryImage = (property: ApiProperty) => {
  const coverImage = property.images?.find((image) => image.isCover);

  if (coverImage?.signedUrl) {
    return coverImage.signedUrl;
  }

  const firstImage = property.images?.[0];

  return firstImage?.signedUrl ?? FALLBACK_IMAGE;
};

const PropertyCard = ({ property, viewMode }: PropertyCardProps) => {
  const imageUrl = getPrimaryImage(property);
  const locationLabel = getLocationLabel(property);
  const priceValue = property.price;
  const hasValidPrice = typeof priceValue === "number" && Number.isFinite(priceValue);
  const formattedPrice = hasValidPrice ? currencyFormatter.format(priceValue) : "Consultar";

  const statusLabel = property.status?.name ?? property.operation ?? "Disponible";
  const operationLabel = property.operation ?? "";
  const propertyHref = `/inmuebles/${property.slug}`;

  const isListMode = viewMode === "list";
  const baseArticleClasses =
    "card-3d flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl";
  const articleClasses = isListMode
    ? `${baseArticleClasses} md:h-80 md:flex-row`
    : baseArticleClasses;
  const imageWrapperClasses = isListMode
    ? "relative w-full shrink-0 aspect-[4/3] md:h-full md:w-5/12 md:aspect-auto"
    : "relative w-full shrink-0 aspect-[4/3]";
  const imageClasses = "object-cover";

  return (
    <article className={articleClasses}>
      <div className={imageWrapperClasses}>
        <Image
          fill
          src={imageUrl}
          alt={property.title}
          className={imageClasses}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--lime)] px-3 py-1 text-xs font-semibold text-black">
            {statusLabel}
          </span>
          {operationLabel && (
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              {operationLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6 p-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[var(--text-dark)]">
            {property.title}
          </h3>

          {locationLabel && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <span aria-hidden="true">📍</span>
              {locationLabel}
            </p>
          )}

          <p className="text-lg font-bold text-[var(--indigo)]">{formattedPrice}</p>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {property.status?.name && (
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">
                {property.status.name}
              </span>
            )}
            {property.operation && (
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">
                {property.operation}
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">
              ID: {property.id}
            </span>
          </div>
        </div>

        <div
          className={`flex flex-col gap-3 text-sm font-semibold md:flex-row ${
            isListMode ? "md:items-center" : ""
          }`}
        >
          <Link
            href={propertyHref}
            className="flex-1 rounded-full bg-[var(--indigo)] px-5 py-3 text-center text-white transition hover:bg-[var(--lime)] hover:text-black"
          >
            Ver información
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
