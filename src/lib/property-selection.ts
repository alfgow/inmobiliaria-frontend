import { FALLBACK_IMAGE, resolvePublicImageUrl, type PublicProperty } from "@/lib/property-types";

const normalizeText = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

export const getPrimaryPropertyImageUrl = (property: Pick<PublicProperty, "images">): string => {
  const orderedImages = [...(property.images ?? [])].sort(
    (left, right) =>
      (left.orden ?? Number.POSITIVE_INFINITY) - (right.orden ?? Number.POSITIVE_INFINITY),
  );

  for (const image of orderedImages) {
    const resolvedUrl = resolvePublicImageUrl(image.url ?? image.path ?? null);

    if (resolvedUrl !== FALLBACK_IMAGE) {
      return resolvedUrl;
    }
  }

  return FALLBACK_IMAGE;
};

export type RelatedPropertyMatchOptions = {
  limit?: number;
  priceTolerance?: number;
};

export const getRelatedProperties = (
  source: PublicProperty,
  candidates: PublicProperty[],
  { limit = 3, priceTolerance = 3000 }: RelatedPropertyMatchOptions = {},
): PublicProperty[] => {
  const sourcePrice = typeof source.price === "number" && Number.isFinite(source.price) ? source.price : null;
  const sourceType = normalizeText(source.type);
  const sourceOperation = normalizeText(source.operation);

  const filteredCandidates = candidates
    .filter((candidate) => candidate.slug !== source.slug)
    .filter((candidate) => candidate.isAvailable)
    .filter((candidate) => {
      if (!sourceType) {
        return true;
      }

      return normalizeText(candidate.type) === sourceType;
    })
    .filter((candidate) => {
      if (!sourceOperation) {
        return true;
      }

      return normalizeText(candidate.operation) === sourceOperation;
    })
    .filter((candidate) => {
      if (sourcePrice === null) {
        return true;
      }

      if (typeof candidate.price !== "number" || !Number.isFinite(candidate.price)) {
        return false;
      }

      return Math.abs(candidate.price - sourcePrice) <= priceTolerance;
    });

  if (!filteredCandidates.length) {
    return [];
  }

  return [...filteredCandidates]
    .sort((left, right) => {
      const leftPriceDiff =
        sourcePrice !== null && typeof left.price === "number" && Number.isFinite(left.price)
          ? Math.abs(left.price - sourcePrice)
          : Number.POSITIVE_INFINITY;
      const rightPriceDiff =
        sourcePrice !== null && typeof right.price === "number" && Number.isFinite(right.price)
          ? Math.abs(right.price - sourcePrice)
          : Number.POSITIVE_INFINITY;

      if (leftPriceDiff !== rightPriceDiff) {
        return leftPriceDiff - rightPriceDiff;
      }

      const leftUpdatedAt = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightUpdatedAt = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;

      return rightUpdatedAt - leftUpdatedAt;
    })
    .slice(0, limit);
};
