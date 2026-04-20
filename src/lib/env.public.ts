const readOptionalEnv = (value: string | undefined) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
};

export const publicEnv = {
  mapboxToken:
    readOptionalEnv(process.env.NEXT_PUBLIC_API_MAPBOX) ??
    readOptionalEnv(process.env.NEXT_PUBLIC_MAPBOX_TOKEN) ??
    readOptionalEnv(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN),
  mapboxStyleId:
    readOptionalEnv(process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID) ??
    readOptionalEnv(process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL),
  mapboxAdminStyleId:
    readOptionalEnv(process.env.NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID) ??
    readOptionalEnv(process.env.NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_URL),
} as const;
