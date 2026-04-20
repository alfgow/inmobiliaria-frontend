import { publicEnv } from "@/lib/env.public";

const DEFAULT_PUBLIC_STYLE = "alfgow/cmgnbz7aw000u01ry7bnx7rzp";
const DEFAULT_ADMIN_STYLE = DEFAULT_PUBLIC_STYLE;

export const MAPBOX_ATTRIBUTION =
  '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>';

const sanitizeStyle = (style?: string, fallback = DEFAULT_PUBLIC_STYLE) => {
  if (!style || typeof style !== "string") {
    return fallback;
  }

  return style
    .replace(/^mapbox:\/\/styles\//u, "")
    .replace(/^https:\/\/api\.mapbox\.com\/styles\/v1\//u, "")
    .replace(/\/tiles?.*$/u, "")
    .trim();
};

const normalizeToken = (token?: string) => {
  if (!token) {
    return undefined;
  }

  const sanitized = token.trim();

  return sanitized.length > 0 ? sanitized : undefined;
};

export const getMapboxAccessToken = () =>
  normalizeToken(publicEnv.mapboxToken);

export const getPublicMapboxStyle = () =>
  sanitizeStyle(publicEnv.mapboxStyleId, DEFAULT_PUBLIC_STYLE);

export const getAdminMapboxStyle = () =>
  sanitizeStyle(
    publicEnv.mapboxAdminStyleId,
    sanitizeStyle(publicEnv.mapboxStyleId, DEFAULT_ADMIN_STYLE),
  );

export const buildMapboxTilesUrl = (token: string | undefined, stylePath: string) => {
  if (!token) {
    return null;
  }

  return `https://api.mapbox.com/styles/v1/${stylePath}/tiles/{z}/{x}/{y}?access_token=${token}`;
};
