"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MapboxGl = typeof import("mapbox-gl")["default"];
type MapboxMap = import("mapbox-gl").Map;
type MapboxMarker = import("mapbox-gl").Marker;
type MapboxPopup = import("mapbox-gl").Popup;
import {
  MAPBOX_ATTRIBUTION,
  getMapboxAccessToken,
  getPublicMapboxStyle,
} from "@/lib/mapboxConfig";
import {
  formatOperation,
  resolvePublicImageUrl,
  type PublicProperty,
} from "@/lib/property-types";

type AdminPropertiesMapProps = {
  properties: PublicProperty[];
  isLoading?: boolean;
};

type MapMarker = {
  id: string;
  slug: string | null;
  position: [number, number];
  title: string;
  address: string | null;
  city: string | null;
  state: string | null;
  priceLabel: string | null;
  statusName: string | null;
  statusColor: string | null;
  operation: string | null;
  isAvailable: boolean;
  imageUrl: string;
  locationLabel: string | null;
};

const DEFAULT_CENTER: [number, number] = [-102.5528, 23.6345];
const DEFAULT_ZOOM = 4;

const normalizeCoordinate = (value?: number | null): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

const toRgba = (color: string | null | undefined, alpha: number, fallback: string) => {
  const parsed = parseHexColor(color);

  if (!parsed) {
    return fallback;
  }

  const { r, g, b } = parsed;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildMarkerEl = (isAvailable: boolean, statusColor: string | null) => {
  const marker = document.createElement("div");
  marker.className = "admin-property-marker";
  marker.dataset.markerColor = "true";
  marker.innerHTML = `
    <div class="admin-marker ${isAvailable ? "admin-marker--available" : "admin-marker--unavailable"}">
      <span class="admin-marker__pulse" aria-hidden="true"></span>
      <span class="admin-marker__pin" role="presentation">
        <span class="admin-marker__inner" aria-hidden="true">
          ${
            isAvailable
              ? '<svg class="admin-marker__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 13.5 9.5 18 19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              : '<svg class="admin-marker__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 7 17 17M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          }
        </span>
      </span>
    </div>
  `;

  const innerMarker = marker.querySelector<HTMLElement>(".admin-marker");

  if (innerMarker) {
    innerMarker.style.setProperty("--marker-color", statusColor ?? "#7c3aed");
    innerMarker.style.setProperty("--marker-shadow", toRgba(statusColor, 0.45, "rgba(124, 58, 237, 0.45)"));
    innerMarker.style.setProperty("--marker-pulse", toRgba(statusColor, 0.2, "rgba(34, 197, 94, 0.3)"));
    innerMarker.style.setProperty("--marker-pulse-border", toRgba(statusColor, 0.35, "rgba(34, 197, 94, 0.45)"));
  }

  return marker;
};

const buildPopupContent = (marker: MapMarker) => {
  const root = document.createElement("article");
  root.className = "flex w-[68vw] max-w-[260px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 md:w-[80vw] md:max-w-[320px]";

  const statusStyle = !marker.isAvailable
    ? "color:#dc2626;border:1px solid #dc2626;background-color:#fee2e2;"
    : marker.statusColor
      ? `color:${marker.statusColor};border:1px solid ${marker.statusColor};background-color:#ffffffcc;`
      : "color:var(--text-dark);border:1px solid transparent;background-color:rgba(255,255,255,0.85);";

  root.innerHTML = `
    <div class="relative aspect-[3/2] w-full overflow-hidden bg-gray-100 md:aspect-[4/3]">
      <img
        src="${escapeHtml(marker.imageUrl)}"
        alt="${escapeHtml(`Imagen de ${marker.title}`)}"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      ${
        marker.statusName
          ? `<span class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow" style="${statusStyle}">
              <span aria-hidden="true">●</span>
              <span>${escapeHtml(marker.statusName)}</span>
              ${
                marker.isAvailable && marker.operation
                  ? `<span aria-hidden="true">•</span><span>${escapeHtml(marker.operation)}</span>`
                  : ""
              }
            </span>`
          : ""
      }
      ${
        marker.priceLabel
          ? `<span class="absolute right-3 bottom-3 rounded-full bg-[#d2ff1e] px-3 py-1 text-xs font-bold text-black shadow-md">${escapeHtml(marker.priceLabel)}</span>`
          : ""
      }
    </div>

    <div class="space-y-3 p-3 md:p-4">
      <div class="space-y-1">
        <p class="truncate text-sm font-semibold text-[var(--text-dark)]">${escapeHtml(marker.title)}</p>
        ${
          marker.locationLabel
            ? `<p class="flex items-center gap-1 text-xs text-gray-500"><span aria-hidden="true">📍</span>${escapeHtml(marker.locationLabel)}</p>`
            : ""
        }
      </div>

      <div class="flex flex-wrap items-center gap-3 text-[0.65rem] font-medium text-gray-600 md:text-xs">
        ${
          marker.slug
            ? `<a href="/inmuebles/${encodeURIComponent(marker.slug)}" class="w-[100%] rounded-full bg-[#d2ff1e] px-5 py-3 text-center text-sm font-semibold text-black shadow transition hover:opacity-90">Ver Inmueble</a>`
            : ""
        }
      </div>
    </div>
  `;

  return root;
};

const AdminPropertiesMap = ({ properties, isLoading = false }: AdminPropertiesMapProps) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapbox, setMapbox] = useState<MapboxGl | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<MapboxMarker[]>([]);
  const popupRef = useRef<MapboxPopup | null>(null);
  const mapboxToken = getMapboxAccessToken();
  const mapboxStyle = getPublicMapboxStyle();
  const hasMapboxConfig = Boolean(mapboxToken && mapboxStyle);

  const markers = useMemo<MapMarker[]>(() => {
    return properties
      .map((property) => {
        const latitude = normalizeCoordinate(property.latitude ?? property.location?.latitude);
        const longitude = normalizeCoordinate(property.longitude ?? property.location?.longitude);

        if (latitude === null || longitude === null) {
          return null;
        }

        const statusName = property.status?.name ?? null;
        const statusColor = property.status?.color ?? null;
        const statusId = Number(property.status?.id ?? NaN);
        const isAvailable =
          typeof property.isAvailable === "boolean"
            ? property.isAvailable
            : typeof property.is_available === "boolean"
              ? property.is_available
              : typeof property.active === "boolean"
                ? property.active
                : typeof statusName === "string"
                  ? statusName.toLowerCase().includes("disponible")
                  : statusId === 1;

        const priceLabel = property.priceFormatted
          ? property.priceFormatted
          : typeof property.price === "number" && Number.isFinite(property.price)
            ? new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
                maximumFractionDigits: 0,
              }).format(property.price)
            : null;

        const coverImage = property.images?.find((image) => image.isCover);
        const firstImage = property.images?.[0];
        const imageUrl = resolvePublicImageUrl(
          coverImage?.url ?? coverImage?.path ?? firstImage?.url ?? firstImage?.path ?? null,
        );

        const locationLabel = [property.address, property.city, property.state].filter(Boolean).join(", ").trim();

        const operationLabel = formatOperation(property.operation ?? null);

        return {
          id: property.id,
          slug: property.slug ?? null,
          position: [longitude, latitude] as [number, number],
          title: property.title ?? "Inmueble sin título",
          address: property.address ?? null,
          city: property.city ?? null,
          state: property.state ?? null,
          priceLabel,
          statusName,
          statusColor,
          operation: operationLabel,
          isAvailable,
          imageUrl,
          locationLabel: locationLabel.length > 0 ? locationLabel : null,
        } satisfies MapMarker;
      })
      .filter((marker): marker is MapMarker => Boolean(marker));
  }, [properties]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasMapboxConfig) {
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
  }, [hasMapboxConfig]);

  const markerPositions = useMemo(() => markers.map((marker) => marker.position), [markers]);

  useEffect(() => {
    const mapboxglInstance = mapbox;

    if (!mapboxglInstance || !mapContainerRef.current || !hasMapboxConfig) {
      return;
    }

    mapboxglInstance.accessToken = mapboxToken;

    const map = new mapboxglInstance.Map({
      container: mapContainerRef.current,
      style: mapboxStyle.startsWith("mapbox://") ? mapboxStyle : `mapbox://styles/${mapboxStyle}`,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      interactive: true,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxglInstance.NavigationControl({ showCompass: true, showZoom: true }), "top-right");
    map.addControl(
      new mapboxglInstance.AttributionControl({
        compact: true,
        customAttribution: MAPBOX_ATTRIBUTION,
      }),
    );

    map.once("load", () => {
      setIsMapReady(true);
      map.resize();

      if (markerPositions.length > 0) {
        const bounds = markerPositions.reduce((boundsAccumulator, position) => {
          boundsAccumulator.extend(position);
          return boundsAccumulator;
        }, new mapboxglInstance.LngLatBounds(markerPositions[0], markerPositions[0]));

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
            maxZoom: 14,
          });
        }
      }
    });

    mapInstanceRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      popupRef.current?.remove();
      popupRef.current = null;

      map.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, [hasMapboxConfig, mapbox, mapboxStyle, mapboxToken, markerPositions]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const mapboxglInstance = mapbox;

    if (!map || !mapboxglInstance || !hasMapboxConfig) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    popupRef.current?.remove();
    popupRef.current = null;

    const newMarkers = markers.map((marker) => {
      const markerEl = buildMarkerEl(marker.isAvailable, marker.statusColor);
      const mapMarker = new mapboxglInstance.Marker({ element: markerEl, anchor: "bottom" })
        .setLngLat(marker.position)
        .addTo(map);

      markerEl.addEventListener("click", () => {
        popupRef.current?.remove();

        const popup = new mapboxglInstance.Popup({
          offset: 24,
          maxWidth: "320px",
          className: "admin-property-popup",
        })
          .setLngLat(marker.position)
          .setDOMContent(buildPopupContent(marker))
          .addTo(map);

        popupRef.current = popup;
      });

      return mapMarker;
    });

    markersRef.current = newMarkers;

    if (markerPositions.length > 0) {
      const bounds = markerPositions.reduce((boundsAccumulator, position) => {
        boundsAccumulator.extend(position);
        return boundsAccumulator;
      }, new mapboxglInstance.LngLatBounds(markerPositions[0], markerPositions[0]));

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 14,
        });
      }
    } else {
      map.easeTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      });
    }
  }, [hasMapboxConfig, mapbox, markerPositions, markers]);

  const hasMarkers = markers.length > 0;

  const overlayMessage = !isMapReady
    ? isLoading
      ? "Cargando coordenadas de los inmuebles…"
      : "Preparando mapa interactivo…"
    : null;

  const floatingMessage = (() => {
    if (isMapReady && isLoading) {
      return {
        tone: "loading" as const,
        text: "Cargando coordenadas de los inmuebles…",
      };
    }

    if (isMapReady && !isLoading && !hasMarkers) {
      return {
        tone: "empty" as const,
        text: "No hay propiedades con ubicación georreferenciada por ahora.",
      };
    }

    return null;
  })();

  if (!hasMapboxConfig) {
    return (
      <div className="relative mt-6 overflow-hidden rounded-[32px] border border-[#d9e9dd] bg-white p-8 shadow-sm">
        <div className="flex min-h-[420px] items-center justify-center rounded-[24px] bg-white/80 text-center">
          <div className="max-w-md space-y-3">
            <p className="text-lg font-semibold text-[var(--text-dark)]">Mapa no disponible</p>
            <p className="text-sm text-gray-500">
              Configura <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> y <code>NEXT_PUBLIC_MAPBOX_STYLE_ID</code> para mostrar el mapa interactivo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-6 h-[560px] w-full overflow-hidden rounded-[32px] shadow-xl/30">
      <div className="h-full w-full overflow-hidden rounded-[inherit] transition-opacity duration-300">
        <div ref={mapContainerRef} className="h-full w-full overflow-hidden rounded-[inherit]" />
      </div>

      {overlayMessage ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-white/80 px-6 text-center text-sm text-gray-500 backdrop-blur">
          {overlayMessage}
        </div>
      ) : null}

      {floatingMessage ? (
        <div
          className={`pointer-events-none absolute inset-x-6 bottom-6 rounded-2xl px-4 py-3 text-sm shadow-lg backdrop-blur ${
            floatingMessage.tone === "loading"
              ? "bg-white/75 text-gray-600"
              : "bg-white/90 text-gray-500"
          }`}
        >
          {floatingMessage.text}
        </div>
      ) : null}
    </div>
  );
};

export default AdminPropertiesMap;
