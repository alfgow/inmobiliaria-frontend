"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ApiProperty } from "@/components/FeaturedProperties/useProperties";
import {
  MAPBOX_ATTRIBUTION,
  buildMapboxTilesUrl,
  getMapboxAccessToken,
  getAdminMapboxStyle,
} from "@/lib/mapboxConfig";

type MapboxGl = (typeof import("mapbox-gl"))["default"];
type MapboxMap = import("mapbox-gl").Map;
type MapboxMarker = import("mapbox-gl").Marker;

type AdminPropertiesMapProps = {
  properties: ApiProperty[];
  isLoading?: boolean;
};

type MapMarker = {
  id: string;
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
};

const DEFAULT_CENTER: [number, number] = [23.6345, -102.5528];
const DEFAULT_CENTER_LNG_LAT: [number, number] = [DEFAULT_CENTER[1], DEFAULT_CENTER[0]];

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const normalizeCoordinate = (value?: number | null): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
};

const AdminPropertiesMap = ({ properties, isLoading = false }: AdminPropertiesMapProps) => {
  const [mapbox, setMapbox] = useState<MapboxGl | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<MapboxMarker[]>([]);
  const mapboxToken = getMapboxAccessToken();
  const mapboxStylePath = getAdminMapboxStyle();
  const tileLayerUrl = useMemo(
    () => buildMapboxTilesUrl(mapboxToken, mapboxStylePath),
    [mapboxToken, mapboxStylePath],
  );
  const mapboxStyleUrl = useMemo(() => {
    if (!mapboxStylePath) {
      return null;
    }

    return mapboxStylePath.startsWith("mapbox://")
      ? mapboxStylePath
      : `mapbox://styles/${mapboxStylePath}`;
  }, [mapboxStylePath]);

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

  const markers = useMemo(() => {
    return properties
      .map((property) => {
        const latitude = normalizeCoordinate(property.latitude ?? property.location?.latitude);
        const longitude = normalizeCoordinate(property.longitude ?? property.location?.longitude);

        if (latitude === null || longitude === null) {
          return null;
        }

        const statusName = property.status?.name ?? property.estatus?.nombre ?? null;
        const statusColor = property.status?.color ?? property.estatus?.color ?? null;
        const statusId = Number(property.status?.id ?? property.estatus?.id ?? NaN);
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
          ? currencyFormatter.format(property.price)
          : null;

        return {
          id: property.id,
          position: [latitude, longitude] as [number, number],
          title: property.title ?? "Inmueble sin título",
          address: property.address ?? null,
          city: property.city ?? null,
          state: property.state ?? null,
          priceLabel,
          statusName,
          statusColor,
          operation: property.operation ?? null,
          isAvailable,
        } satisfies MapMarker;
      })
      .filter((marker): marker is MapMarker => Boolean(marker));
  }, [properties]);

  useEffect(() => {
    const mapContainer = mapContainerRef.current;

    if (!mapContainer || !mapbox || !mapboxToken || !mapboxStyleUrl) {
      return;
    }

    mapbox.accessToken = mapboxToken;

    const map = new mapbox.Map({
      container: mapContainer,
      style: mapboxStyleUrl,
      center: DEFAULT_CENTER_LNG_LAT,
      zoom: 4,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(new mapbox.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(
      new mapbox.AttributionControl({
        compact: true,
        customAttribution: MAPBOX_ATTRIBUTION,
      }),
    );

    const handleLoad = () => {
      map.resize();
      setIsMapReady(true);
    };

    map.once("load", handleLoad);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current.forEach((marker) => {
        marker.remove();
      });
      markersRef.current = [];
      setIsMapReady(false);
    };
  }, [mapbox, mapboxStyleUrl, mapboxToken]);

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || !mapbox || !isMapReady) {
      return;
    }

    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current = [];

    if (markers.length === 0) {
      map.easeTo({ center: DEFAULT_CENTER_LNG_LAT, zoom: 4 });
      return;
    }

    const bounds = new mapbox.LngLatBounds();

    markers.forEach((marker) => {
      const [lat, lng] = marker.position;
      const lngLat: [number, number] = [lng, lat];

      bounds.extend(lngLat);

      const markerElement = document.createElement("div");
      markerElement.className = "admin-property-marker";
      markerElement.innerHTML = `
        <div class="admin-marker ${marker.isAvailable ? "admin-marker--available" : "admin-marker--unavailable"}">
          <span class="admin-marker__pulse"></span>
          <span class="admin-marker__core"></span>
        </div>
      `;

      const popupContent = document.createElement("div");
      popupContent.className = "space-y-2";

      const title = document.createElement("p");
      title.className = "text-sm font-semibold text-[var(--text-dark)]";
      title.textContent = marker.title;
      popupContent.appendChild(title);

      if (marker.address || marker.city || marker.state) {
        const address = document.createElement("p");
        address.className = "text-xs text-gray-500";
        address.textContent = [marker.address, marker.city, marker.state]
          .filter(Boolean)
          .join(", ");
        popupContent.appendChild(address);
      }

      if (marker.priceLabel) {
        const price = document.createElement("p");
        price.className = "text-sm font-bold text-[var(--indigo)]";
        price.textContent = marker.priceLabel;
        popupContent.appendChild(price);
      }

      const badges = document.createElement("div");
      badges.className = "flex flex-wrap gap-2 text-[0.65rem] font-medium text-gray-600";

      if (marker.statusName) {
        const status = document.createElement("span");
        status.className = "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1";

        if (marker.statusColor) {
          status.style.color = marker.statusColor;
          status.style.border = `1px solid ${marker.statusColor}`;
        }

        const statusBullet = document.createElement("span");
        statusBullet.setAttribute("aria-hidden", "true");
        statusBullet.textContent = "●";

        status.appendChild(statusBullet);
        status.append(marker.statusName);
        badges.appendChild(status);
      }

      if (marker.operation) {
        const operation = document.createElement("span");
        operation.className = "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1";
        operation.textContent = marker.operation;
        badges.appendChild(operation);
      }

      const availability = document.createElement("span");
      availability.className = `inline-flex items-center gap-1 rounded-full px-2 py-1 ${
        marker.isAvailable
          ? "bg-[var(--lime)]/20 text-[var(--text-dark)]"
          : "bg-gray-200 text-gray-600"
      }`;

      const availabilityIcon = document.createElement("span");
      availabilityIcon.setAttribute("aria-hidden", "true");
      availabilityIcon.textContent = marker.isAvailable ? "✅" : "⛔";

      availability.appendChild(availabilityIcon);
      availability.append(marker.isAvailable ? "Disponible" : "No disponible");
      badges.appendChild(availability);

      popupContent.appendChild(badges);

      const popup = new mapbox.Popup({ offset: 24, maxWidth: "240px" }).setDOMContent(popupContent);

      const mapMarker = new mapbox.Marker({ element: markerElement, anchor: "bottom" })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(mapMarker);
    });

    if (!bounds.isEmpty()) {
      const padding = window.innerWidth < 640 ? 32 : 60;
      map.fitBounds(bounds, { padding, maxZoom: 14 });
    } else {
      map.easeTo({ center: DEFAULT_CENTER_LNG_LAT, zoom: 4 });
    }

    map.resize();
  }, [isMapReady, mapbox, markers]);

  const canRenderMap = Boolean(mapboxToken && mapboxStyleUrl);

  const fallbackMessage = (() => {
    if (!mapboxToken || !tileLayerUrl) {
      return "Configura la variable NEXT_PUBLIC_API_MAPBOX para visualizar el mapa administrativo.";
    }

    if (isLoading) {
      return "Cargando coordenadas de los inmuebles…";
    }

    if (markers.length === 0) {
      return "No hay propiedades con ubicación georreferenciada por ahora.";
    }

    if (!mapbox) {
      return "Preparando mapa interactivo…";
    }

    return "Estamos renderizando el nuevo mapa administrativo, aguarda un momento.";
  })();

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--indigo)]">
            Mapa interactivo
          </p>
          <h2 className="text-2xl font-semibold text-[var(--text-dark)] md:text-3xl">
            Distribución de propiedades
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          {markers.length > 0
            ? `${markers.length} propiedades con ubicación disponible`
            : "Sin propiedades georreferenciadas"}
        </div>
      </div>

      <div className="relative mt-6 h-[420px] w-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-inner">
        <div
          ref={mapContainerRef}
          className={`h-full w-full transition-opacity duration-300 ${
            canRenderMap && isMapReady && markers.length > 0 ? "opacity-100" : "opacity-0"
          }`}
        />
        {!canRenderMap || !isMapReady || markers.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-gray-500">
            {fallbackMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default AdminPropertiesMap;
