import "server-only";

const readOptionalEnv = (value: string | undefined) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
};

export const serverEnv = {
  inmueblesApiKey: readOptionalEnv(process.env.INMUEBLES_API_KEY),
  inmueblesApiBaseUrl: readOptionalEnv(process.env.INMUEBLES_API_BASE_URL),
} as const;
