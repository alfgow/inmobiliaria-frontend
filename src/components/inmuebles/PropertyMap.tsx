"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

type PropertyMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  title?: string | null;
  address?: string | null;
};

const PropertyMap = ({ latitude, longitude, title, address }: PropertyMapProps) => {
  const numericLatitude = typeof latitude === "number" ? latitude : latitude ? Number(latitude) : null;
  const numericLongitude = typeof longitude === "number" ? longitude : longitude ? Number(longitude) : null;

  const position = useMemo(() => {
    if (typeof numericLatitude !== "number" || typeof numericLongitude !== "number") {
      return null;
    }

    if (Number.isNaN(numericLatitude) || Number.isNaN(numericLongitude)) {
      return null;
    }

    return [numericLatitude, numericLongitude] as [number, number];
  }, [numericLatitude, numericLongitude]);

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "custom-property-marker",
        html: `
          <div class="marker-shell">
            <span class="marker-pulse"></span>
            <span class="marker-core"></span>
          </div>
        `,
        iconSize: [46, 60],
        iconAnchor: [23, 58],
        popupAnchor: [0, -54],
      }),
    []
  );

  if (!position) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--indigo)]/30 bg-white/70 text-center text-gray-600">
        <p className="text-lg font-semibold text-[var(--text-dark)]">Mapa no disponible</p>
        <p className="max-w-md text-sm text-gray-500">
          En cuanto recibamos las coordenadas de este inmueble, podrás explorar la zona y calcular rutas fácilmente.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur">
      <div className="absolute left-6 top-6 z-20 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--indigo)]">
        Ubicación
      </div>
      <MapContainer
        center={position}
        zoom={16}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        boxZoom={false}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "420px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={markerIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-dark)]">{title}</p>
              {address ? <p className="text-xs text-gray-600">{address}</p> : null}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
