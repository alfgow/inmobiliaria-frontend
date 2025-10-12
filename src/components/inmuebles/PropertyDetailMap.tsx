"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import {
  MAPBOX_ATTRIBUTION,
  buildMapboxTilesUrl,
  getMapboxAccessToken,
  getPublicMapboxStyle,
} from "@/lib/mapboxConfig";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false },
);

type LeafletModule = typeof import("leaflet");
type LeafletDivIcon = import("leaflet").DivIcon;

type PropertyDetailMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  title?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  priceLabel?: string | null;
  statusName?: string | null;
  statusColor?: string | null;
  statusId?: number | string | null;
  operation?: string | null;
};

type MarkerColorTokens = {
  core: string;
  shadow: string;
  pulse: string;
  pulseBorder: string;
};

const normalizeCoordinate = (value?: number | null): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
};

const parseHexColor = (color: string | null | undefined) => {
  if (!color || typeof color !== "string") {
    return null;
  }

  const normalized = color.trim();
  const hexMatch = normalized.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/iu);

  if (!hexMatch) {
    return null;
  }

  let value = hexMatch[1];

  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const numeric = Number.parseInt(value, 16);

  if (Number.isNaN(numeric)) {
    return null;
  }

  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  return { r, g, b } as const;
};

const buildMarkerTokens = (statusColor: string | null | undefined): MarkerColorTokens | null => {
  const parsed = parseHexColor(statusColor);

  if (!parsed) {
    return null;
  }

  const { r, g, b } = parsed;
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const toRgba = (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

  return {
    core: rgb,
    shadow: toRgba(0.45),
    pulse: toRgba(0.2),
    pulseBorder: toRgba(0.35),
  };
};

const PropertyDetailMap = ({
  latitude,
  longitude,
  title,
  address,
  city,
  state,
  priceLabel,
  statusName,
  statusColor,
  statusId,
  operation,
}: PropertyDetailMapProps) => {
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const mapboxToken = getMapboxAccessToken();
  const mapboxStylePath = getPublicMapboxStyle();

  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      const leafletModule = await import("leaflet");

      if (isMounted) {
        setLeaflet((leafletModule.default ?? leafletModule) as LeafletModule);
      }
    };

    if (typeof window !== "undefined") {
      void loadLeaflet();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedLatitude = normalizeCoordinate(latitude ?? null);
  const normalizedLongitude = normalizeCoordinate(longitude ?? null);

  const position = useMemo(() => {
    if (normalizedLatitude === null || normalizedLongitude === null) {
      return null;
    }

    return [normalizedLatitude, normalizedLongitude] as [number, number];
  }, [normalizedLatitude, normalizedLongitude]);

  const tileLayerUrl = useMemo(
    () => buildMapboxTilesUrl(mapboxToken, mapboxStylePath),
    [mapboxToken, mapboxStylePath],
  );

  const numericStatusId = useMemo(() => {
    if (typeof statusId === "number") {
      return Number.isFinite(statusId) ? statusId : null;
    }

    if (typeof statusId === "string" && statusId.trim().length > 0) {
      const parsed = Number.parseInt(statusId, 10);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return null;
  }, [statusId]);

  const isAvailable = useMemo(() => {
    if (typeof statusName === "string") {
      const normalized = statusName.toLowerCase();

      if (normalized.includes("disponible") || normalized.includes("activo")) {
        return true;
      }

      if (normalized.includes("vendido") || normalized.includes("rentado")) {
        return false;
      }
    }

    if (numericStatusId !== null) {
      return numericStatusId === 1;
    }

    return true;
  }, [numericStatusId, statusName]);

  const markerTokens = useMemo(() => buildMarkerTokens(statusColor), [statusColor]);

  const markerIcon = useMemo<LeafletDivIcon | null>(() => {
    if (!leaflet || !position) {
      return null;
    }

    const markerColorAttributes = markerTokens && isAvailable
      ? ` data-marker-color="true" style="--marker-color: ${markerTokens.core}; --marker-shadow: ${markerTokens.shadow}; --marker-pulse: ${markerTokens.pulse}; --marker-pulse-border: ${markerTokens.pulseBorder};"`
      : "";

    return leaflet.divIcon({
      className: "admin-property-marker",
      html: `
        <div class="admin-marker ${isAvailable ? "admin-marker--available" : "admin-marker--unavailable"}"${markerColorAttributes}>
          <span class="admin-marker__pulse"></span>
          <span class="admin-marker__core"></span>
        </div>
      `,
      iconSize: [46, 60],
      iconAnchor: [23, 58],
      popupAnchor: [0, -54],
    });
  }, [isAvailable, leaflet, markerTokens, position]);

  const canRenderMap = Boolean(position && tileLayerUrl && markerIcon);

  const fallbackCopy = useMemo(() => {
    if (!mapboxToken || !tileLayerUrl) {
      return {
        title: "Configura tu token de Mapbox",
        message:
          "Para visualizar el mapa necesitamos que la variable NEXT_PUBLIC_API_MAPBOX esté definida en el entorno.",
      };
    }

    if (!position) {
      return {
        title: "Mapa no disponible",
        message:
          "En cuanto contemos con las coordenadas de este inmueble podrás explorar la zona y calcular rutas fácilmente.",
      };
    }

    return {
      title: "Preparando mapa interactivo…",
      message: "Estamos cargando la nueva experiencia del mapa, esto puede tardar unos segundos.",
    };
  }, [mapboxToken, position, tileLayerUrl]);

  const locationLabel = useMemo(() => {
    return [address, city, state].filter(Boolean).join(", ");
  }, [address, city, state]);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-lg backdrop-blur">
      <div className="border-b border-white/60 bg-white/70 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--indigo)]">
          Ubicación interactiva
        </p>
        <h2 className="text-2xl font-semibold text-[var(--text-dark)] md:text-3xl">
          {title ?? "Ubicación del inmueble"}
        </h2>
        {locationLabel ? (
          <p className="mt-2 text-sm text-gray-600">{locationLabel}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
          {statusName ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
              <span
                className="h-2 w-2 rounded-full"
                style={statusColor ? { backgroundColor: statusColor } : undefined}
              />
              {statusName}
            </span>
          ) : null}
          {operation ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">{operation}</span>
          ) : null}
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
              isAvailable ? "bg-[var(--lime)]/20 text-[var(--text-dark)]" : "bg-gray-200 text-gray-600"
            }`}
          >
            <span aria-hidden="true">{isAvailable ? "✅" : "⛔"}</span>
            {isAvailable ? "Disponible" : "No disponible"}
          </span>
          {priceLabel ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[var(--indigo)]">
              {priceLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="relative h-[420px] w-full">
        {canRenderMap ? (
          <MapContainer
            center={position!}
            zoom={16}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution={MAPBOX_ATTRIBUTION}
              url={tileLayerUrl!}
              tileSize={512}
              zoomOffset={-1}
              maxZoom={20}
            />
            <Marker position={position!} icon={markerIcon!}>
              <Popup>
                <div className="space-y-2">
                  {title ? (
                    <p className="text-sm font-semibold text-[var(--text-dark)]">{title}</p>
                  ) : null}
                  {locationLabel ? <p className="text-xs text-gray-500">{locationLabel}</p> : null}
                  {priceLabel ? (
                    <p className="text-sm font-bold text-[var(--indigo)]">{priceLabel}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 text-[0.65rem] font-medium text-gray-600">
                    {statusName ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                        <span aria-hidden="true">●</span>
                        {statusName}
                      </span>
                    ) : null}
                    {operation ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                        {operation}
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                        isAvailable
                          ? "bg-[var(--lime)]/20 text-[var(--text-dark)]"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      <span aria-hidden="true">{isAvailable ? "✅" : "⛔"}</span>
                      {isAvailable ? "Disponible" : "No disponible"}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white/70 px-6 text-center">
            <p className="text-lg font-semibold text-[var(--text-dark)]">{fallbackCopy.title}</p>
            <p className="max-w-md text-sm text-gray-500">{fallbackCopy.message}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyDetailMap;
