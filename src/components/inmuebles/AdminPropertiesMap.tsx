"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useMap } from "react-leaflet";

import type { ApiProperty } from "@/components/FeaturedProperties/useProperties";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

type LeafletModule = typeof import("leaflet");
type LeafletMapInstance = import("leaflet").Map;
type LeafletDivIcon = import("leaflet").DivIcon;

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
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMapInstance | null>(null);

  const MapInstanceBridge = ({
    onMapReady,
  }: {
    onMapReady: (map: LeafletMapInstance | null) => void;
  }) => {
    const map = useMap();

    useEffect(() => {
      onMapReady(map);

      return () => {
        onMapReady(null);
      };
    }, [map, onMapReady]);

    return null;
  };

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

  const markerIcons = useMemo<{ available: LeafletDivIcon | null; unavailable: LeafletDivIcon | null }>(() => {
    if (!leaflet) {
      return { available: null, unavailable: null };
    }

    const createIconHtml = (variant: "available" | "unavailable") => `
      <div class="admin-marker ${variant === "available" ? "admin-marker--available" : "admin-marker--unavailable"}">
        <span class="admin-marker__pulse"></span>
        <span class="admin-marker__core"></span>
      </div>
    `;

    const createIcon = (variant: "available" | "unavailable") =>
      leaflet.divIcon({
        className: "admin-property-marker",
        html: createIconHtml(variant),
        iconSize: [46, 60],
        iconAnchor: [23, 58],
        popupAnchor: [0, -54],
      });

    return {
      available: createIcon("available"),
      unavailable: createIcon("unavailable"),
    };
  }, [leaflet]);

  useEffect(() => {
    if (!leaflet || !mapInstance || markers.length === 0) {
      return;
    }

    const bounds = leaflet.latLngBounds(markers.map((marker) => marker.position));

    if (bounds.isValid()) {
      mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [leaflet, mapInstance, markers]);

  const hasMarkerIcons = Boolean(markerIcons.available) && Boolean(markerIcons.unavailable);
  const canRenderMap = leaflet && hasMarkerIcons && markers.length > 0;
  const initialCenter = markers[0]?.position ?? DEFAULT_CENTER;

  const fallbackMessage = (() => {
    if (isLoading) {
      return "Cargando coordenadas de los inmuebles…";
    }

    if (markers.length === 0) {
      return "No hay propiedades con ubicación georreferenciada por ahora.";
    }

    return "Preparando mapa interactivo…";
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

      <div className="mt-6 h-[420px] w-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-inner">
        {canRenderMap ? (
          <MapContainer
            center={initialCenter}
            zoom={13}
            minZoom={4}
            scrollWheelZoom
            className="h-full w-full"
          >
            <MapInstanceBridge onMapReady={setMapInstance} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={(
                  marker.isAvailable ? markerIcons.available : markerIcons.unavailable
                )!}
              >
                <Popup>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[var(--text-dark)]">{marker.title}</p>
                    {(marker.address || marker.city || marker.state) && (
                      <p className="text-xs text-gray-500">
                        {[marker.address, marker.city, marker.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {marker.priceLabel && (
                      <p className="text-sm font-bold text-[var(--indigo)]">{marker.priceLabel}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-[0.65rem] font-medium text-gray-600">
                      {marker.statusName && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1"
                          style={
                            marker.statusColor
                              ? { color: marker.statusColor, border: `1px solid ${marker.statusColor}` }
                              : undefined
                          }
                        >
                          <span aria-hidden="true">●</span>
                          {marker.statusName}
                        </span>
                      )}
                      {marker.operation && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                          {marker.operation}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                          marker.isAvailable
                            ? "bg-[var(--lime)]/20 text-[var(--text-dark)]"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <span aria-hidden="true">{marker.isAvailable ? "✅" : "⛔"}</span>
                        {marker.isAvailable ? "Disponible" : "No disponible"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
            {fallbackMessage}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPropertiesMap;
