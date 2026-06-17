export const FALLBACK_IMAGE = "/1.jpg";
export const PUBLIC_IMAGE_BASE_URL = "https://inmuebles-alfgow.s3.mx-central-1.amazonaws.com";

export type ImageWithSignedUrl = {
  id: string;
  url: string | null;
  signedUrl: string | null;
  path: string | null;
  metadata?: Record<string, unknown> | null;
  orden?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
  isCover?: boolean;
  isPublic?: boolean;
};

export type PropertyStatus = {
  id: number | string;
  name: string | null;
  color: string | null;
};

export type PublicProperty = {
  id: string;
  title: string | null;
  slug: string | null;
  price: number | null;
  priceFormatted: string | null;
  operation: string | null;
  status: PropertyStatus | null;
  city: string | null;
  state: string | null;
  address: string | null;
  neighborhood: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  location: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  isAvailable: boolean;
  is_available: boolean;
  active: boolean;
  images: ImageWithSignedUrl[];
  featured: boolean;
  metadata: Record<string, unknown> | null;
  description: string | null;
  seoDescription: string | null;
  amenities: string | null;
  extras: string | null;
  rooms: number | null;
  bathrooms: number | null;
  parkingSpots: number | null;
  landSizeM2: number | null;
  constructionSizeM2: number | null;
  age: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  type: string | null;
};

export type FeaturedProperty = {
  id: string;
  title: string;
  slug?: string | null;
  price: number;
  operation?: string | null;
  status?: string | null;
  coverImageUrl: string;
  location?: string | null;
};

export const formatOperation = (operation?: string | null) => {
  if (!operation) {
    return null;
  }

  const normalized = operation.toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const resolvePublicImageUrl = (value?: string | null) => {
  if (!value) {
    return FALLBACK_IMAGE;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Treat non-URL strings as object keys below.
  }

  const cleanedPath = trimmed.replace(/^\/+/, "");

  return new URL(cleanedPath, `${PUBLIC_IMAGE_BASE_URL}/`).toString();
};
