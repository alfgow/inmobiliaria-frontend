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

export const getMapboxAccessToken = () => process.env.NEXT_PUBLIC_API_MAPBOX;

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
