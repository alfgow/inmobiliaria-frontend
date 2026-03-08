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
  normalizeToken(
    process.env.NEXT_PUBLIC_API_MAPBOX ??
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
      process.env.MAPBOX_ACCESS_TOKEN,
  );

export const getPublicMapboxStyle = () =>
  sanitizeStyle(
    process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID ?? process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL,
    DEFAULT_PUBLIC_STYLE,
  );

export const getAdminMapboxStyle = () =>
  sanitizeStyle(
    process.env.NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID ?? process.env.NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_URL,
    sanitizeStyle(
      process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID ?? process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL,
      DEFAULT_ADMIN_STYLE,
    ),
  );

export const buildMapboxTilesUrl = (token: string | undefined, stylePath: string) => {
  if (!token) {
    return null;
  }

  return `https://api.mapbox.com/styles/v1/${stylePath}/tiles/{z}/{x}/{y}?access_token=${token}`;
};
