"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MapboxGl = (typeof import("mapbox-gl"))["default"];
type MapboxMap = import("mapbox-gl").Map;
type MapboxMarker = import("mapbox-gl").Marker;

import {
  MAPBOX_ATTRIBUTION,
  buildMapboxTilesUrl,
  getMapboxAccessToken,
  getPublicMapboxStyle,
} from "@/lib/mapboxConfig";

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
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapbox, setMapbox] = useState<MapboxGl | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const mapboxToken = getMapboxAccessToken();
  const mapboxStylePath = getPublicMapboxStyle();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const win = window as Window & { mapboxgl?: MapboxGl };

    if (win.mapboxgl) {
      setMapbox(win.mapboxgl);
      return;
    }

    const existingScript = document.getElementById("mapbox-gl-js") as HTMLScriptElement | null;
    const existingStylesheet = document.getElementById("mapbox-gl-css") as HTMLLinkElement | null;

    if (!existingStylesheet) {
      const stylesheet = document.createElement("link");
      stylesheet.id = "mapbox-gl-css";
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css";
      document.head.appendChild(stylesheet);
    }

    const handleScriptLoad = () => {
      setMapbox(win.mapboxgl ?? null);
    };

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        handleScriptLoad();
      } else {
        existingScript.addEventListener("load", handleScriptLoad, { once: true });
      }

      return () => {
        existingScript.removeEventListener("load", handleScriptLoad);
      };
    }

    const script = document.createElement("script");
    script.id = "mapbox-gl-js";
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js";
    script.async = true;

    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      handleScriptLoad();
    });

    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleScriptLoad);
    };
  }, []);

  const mapboxStyleUrl = useMemo(() => {
    if (!mapboxStylePath) {
      return null;
    }

    return mapboxStylePath.startsWith("mapbox://")
      ? mapboxStylePath
      : `mapbox://styles/${mapboxStylePath}`;
  }, [mapboxStylePath]);

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

  const mapboxCenter = useMemo(() => {
    if (!position) {
      return null;
    }

    return [position[1], position[0]] as [number, number];
  }, [position]);

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

  const canRenderMap = Boolean(mapbox && mapboxCenter && mapboxToken && mapboxStyleUrl);

  useEffect(() => {
    if (!mapbox || !mapContainerRef.current || !mapboxToken || !mapboxStyleUrl || !mapboxCenter) {
      return;
    }

    mapbox.accessToken = mapboxToken;

    const map = new mapbox.Map({
      container: mapContainerRef.current,
      style: mapboxStyleUrl,
      center: mapboxCenter,
      zoom: 16,
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
      cooperativeGestures: false,
    });

    map.scrollZoom?.disable?.();
    map.boxZoom?.disable?.();
    map.dragPan?.disable?.();
    map.dragRotate?.disable?.();
    map.doubleClickZoom?.disable?.();
    map.touchZoomRotate?.disable?.();
    map.touchZoomRotate?.disableRotation?.();
    map.touchPitch?.disable?.();
    map.keyboard?.disable?.();

    map.addControl(
      new mapbox.AttributionControl({
        compact: true,
        customAttribution: MAPBOX_ATTRIBUTION,
      }),
    );

    const resizeMap = () => {
      map.resize();
    };

    map.once("load", () => {
      resizeMap();
      setIsMapReady(true);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, [mapbox, mapboxCenter, mapboxStyleUrl, mapboxToken]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || !mapboxCenter || !mapbox) {
      return;
    }

    map.setCenter(mapboxCenter);

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        map.resize();
      });
    } else {
      map.resize();
    }

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const markerElement = document.createElement("div");
    markerElement.className = "admin-property-marker";

    const markerColorAttributes = markerTokens && isAvailable
      ? ` data-marker-color="true" style="--marker-color: ${markerTokens.core}; --marker-shadow: ${markerTokens.shadow}; --marker-pulse: ${markerTokens.pulse}; --marker-pulse-border: ${markerTokens.pulseBorder};"`
      : "";

    const icon = isAvailable
      ? `<svg class="admin-marker__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 13.5 9.5 18 19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<svg class="admin-marker__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 7 17 17M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    markerElement.innerHTML = `
      <div class="admin-marker ${isAvailable ? "admin-marker--available" : "admin-marker--unavailable"}"${markerColorAttributes}>
        <span class="admin-marker__pulse" aria-hidden="true"></span>
        <span class="admin-marker__pin" role="presentation">
          <span class="admin-marker__inner" aria-hidden="true">
            ${icon}
          </span>
        </span>
      </div>
    `;

    const marker = new mapbox.Marker({ element: markerElement, anchor: "bottom" })
      .setLngLat(mapboxCenter)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();

      if (markerRef.current === marker) {
        markerRef.current = null;
      }
    };
  }, [isAvailable, mapbox, mapboxCenter, markerTokens]);

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
      title: "Preparando mapa panorámico…",
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
          <div className="h-full w-full" ref={mapContainerRef} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white/70 px-6 text-center">
            <p className="text-lg font-semibold text-[var(--text-dark)]">{fallbackCopy.title}</p>
            <p className="max-w-md text-sm text-gray-500">{fallbackCopy.message}</p>
          </div>
        )}
        {canRenderMap && !isMapReady ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40">
            <span className="animate-pulse text-sm font-medium text-gray-600">Cargando mapa…</span>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default PropertyDetailMap;
