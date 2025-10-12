"use client";

import { useEffect, useMemo, useState } from "react";
import L, { type LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import type { ApiProperty } from "@/components/FeaturedProperties/useProperties";

type AdminPropertiesMapProps = {
  properties: ApiProperty[];
  isLoading?: boolean;
};

type MapMarker = {
  id: string;
  position: LatLngTuple;
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

const DEFAULT_CENTER: LatLngTuple = [23.6345, -102.5528];
const DEFAULT_ZOOM = 4;
const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

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

type MapBoundsControllerProps = {
  positions: LatLngTuple[];
};

const MapBoundsController = ({ positions }: MapBoundsControllerProps) => {
  const map = useMap();

  useEffect(() => {
    const mapInstance = map;

    if (!mapInstance) {
      return;
    }

    const hasMarkers = positions.length > 0;

    if (!hasMarkers) {
      mapInstance.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(positions);
    const paddingValue =
      typeof window !== "undefined" && window.innerWidth < 640 ? 32 : 60;

    mapInstance.fitBounds(bounds, {
      padding: L.point(paddingValue, paddingValue),
      maxZoom: 14,
    });
  }, [map, positions]);

  useEffect(() => {
    const mapInstance = map;

    if (!mapInstance) {
      return;
    }

    mapInstance.invalidateSize();
  }, [map]);

  return null;
};

const AdminPropertiesMap = ({ properties, isLoading = false }: AdminPropertiesMapProps) => {
  const [isMapReady, setIsMapReady] = useState(false);

  const markerIcons = useMemo(() => {
    const baseIconOptions = {
      className: "admin-property-marker",
      iconSize: [36, 36] as [number, number],
      iconAnchor: [18, 36] as [number, number],
      popupAnchor: [0, -32] as [number, number],
    };

    const createMarkerHtml = (isAvailable: boolean) => `
      <div class="admin-marker ${
        isAvailable ? "admin-marker--available" : "admin-marker--unavailable"
      }">
        <span class="admin-marker__pulse"></span>
        <span class="admin-marker__core"></span>
      </div>
    `;

    return {
      available: L.divIcon({
        ...baseIconOptions,
        html: createMarkerHtml(true),
      }),
      unavailable: L.divIcon({
        ...baseIconOptions,
        html: createMarkerHtml(false),
      }),
    };
  }, []);

  const markers = useMemo(() => {
    return properties
      .map((property) => {
        const latitude = normalizeCoordinate(
          property.latitude ?? property.location?.latitude,
        );
        const longitude = normalizeCoordinate(
          property.longitude ?? property.location?.longitude,
        );

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
          position: [latitude, longitude] as LatLngTuple,
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

  const markerPositions = useMemo(() => markers.map((marker) => marker.position), [markers]);

  const fallbackMessage = (() => {
    if (isLoading) {
      return "Cargando coordenadas de los inmuebles…";
    }

    if (markers.length === 0) {
      return "No hay propiedades con ubicación georreferenciada por ahora.";
    }

    if (!isMapReady) {
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
        <MapContainer
          className={`h-full w-full transition-opacity duration-300 ${
            isMapReady && markers.length > 0 ? "opacity-100" : "opacity-0"
          }`}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={2}
          maxZoom={18}
          scrollWheelZoom
          zoomControl
          whenCreated={(mapInstance) => {
            mapInstance.whenReady(() => {
              setIsMapReady(true);
              mapInstance.invalidateSize();
            });
          }}
        >
          <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIBUTION} />
          <MapBoundsController positions={markerPositions} />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={marker.isAvailable ? markerIcons.available : markerIcons.unavailable}
            >
              <Popup maxWidth={240} offset={[0, -24]}>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[var(--text-dark)]">
                    {marker.title}
                  </p>
                  {marker.address || marker.city || marker.state ? (
                    <p className="text-xs text-gray-500">
                      {[marker.address, marker.city, marker.state].filter(Boolean).join(", ")}
                    </p>
                  ) : null}
                  {marker.priceLabel ? (
                    <p className="text-sm font-bold text-[var(--indigo)]">{marker.priceLabel}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 text-[0.65rem] font-medium text-gray-600">
                    {marker.statusName ? (
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
                    ) : null}
                    {marker.operation ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                        {marker.operation}
                      </span>
                    ) : null}
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

        {!isMapReady || markers.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-gray-500">
            {fallbackMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default AdminPropertiesMap;
