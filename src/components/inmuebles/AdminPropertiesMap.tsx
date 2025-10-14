"use client";

import L, { type LatLngTuple } from "leaflet";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import type { ApiProperty } from "@/components/FeaturedProperties/useProperties";
import {
	FALLBACK_IMAGE,
	formatOperation,
} from "@/components/FeaturedProperties/useProperties";

type AdminPropertiesMapProps = {
	properties: ApiProperty[];
	isLoading?: boolean;
};

type MapMarker = {
	id: string;
	slug: string | null;
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
	imageUrl: string;
	locationLabel: string | null;
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
			mapInstance.setView(DEFAULT_CENTER, DEFAULT_ZOOM, {
				animate: true,
			});
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

const AdminPropertiesMap = ({
	properties,
	isLoading = false,
}: AdminPropertiesMapProps) => {
	const [isMapReady, setIsMapReady] = useState(false);
	const mapRef = useRef<L.Map | null>(null);

	const handleMapReady = useCallback(() => {
		setIsMapReady(true);

		const mapInstance = mapRef.current;

		if (mapInstance instanceof L.Map) {
			mapInstance.invalidateSize();
		}
	}, []);

	const markerIcons = useMemo(() => {
		const baseIconOptions = {
			className: "admin-property-marker",
			iconSize: [24, 32] as [number, number],
			iconAnchor: [12, 30] as [number, number],
			popupAnchor: [0, -24] as [number, number],
		};

		const createMarkerHtml = (isAvailable: boolean) => {
			const icon = isAvailable
				? `<svg class="admin-marker__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 13.5 9.5 18 19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
				: `<svg class="admin-marker__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 7 17 17M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

			return `
        <div class="admin-marker ${
			isAvailable
				? "admin-marker--available"
				: "admin-marker--unavailable"
		}">
          <span class="admin-marker__pulse" aria-hidden="true"></span>
          <span class="admin-marker__pin" role="presentation">
            <span class="admin-marker__inner" aria-hidden="true">
              ${icon}
            </span>
          </span>
        </div>
      `;
		};

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
					property.latitude ?? property.location?.latitude
				);
				const longitude = normalizeCoordinate(
					property.longitude ?? property.location?.longitude
				);

				if (latitude === null || longitude === null) {
					return null;
				}

				const statusName =
					property.status?.name ?? property.estatus?.nombre ?? null;
				const statusColor =
					property.status?.color ?? property.estatus?.color ?? null;
				const statusId = Number(
					property.status?.id ?? property.estatus?.id ?? NaN
				);
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
					: typeof property.price === "number" &&
					  Number.isFinite(property.price)
					? currencyFormatter.format(property.price)
					: null;

				const coverImage = property.images?.find(
					(image) => image.isCover
				);
				const coverImageUrl =
					coverImage?.signedUrl ??
					coverImage?.url ??
					coverImage?.path ??
					null;
				const firstImage = property.images?.[0];
				const firstImageUrl =
					firstImage?.signedUrl ??
					firstImage?.url ??
					firstImage?.path ??
					null;
				const imageUrl =
					coverImageUrl ?? firstImageUrl ?? FALLBACK_IMAGE;

				const locationLabel = [
					property.address,
					property.city,
					property.state,
				]
					.filter(Boolean)
					.join(", ")
					.trim();

				const operationLabel = formatOperation(
					property.operation ?? null
				);

				return {
					id: property.id,
					slug: property.slug ?? null,
					position: [latitude, longitude] as LatLngTuple,
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
					locationLabel:
						locationLabel.length > 0 ? locationLabel : null,
				} satisfies MapMarker;
			})
			.filter((marker): marker is MapMarker => Boolean(marker));
	}, [properties]);

	const hasMarkers = markers.length > 0;
	const markerPositions = useMemo(
		() => markers.map((marker) => marker.position),
		[markers]
	);

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
					{hasMarkers
						? `${markers.length} propiedades con ubicación disponible`
						: "Sin propiedades georreferenciadas"}
				</div>
			</div>

			<div className="relative mt-6 h-[420px] w-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-inner">
				<div
					className={`h-full w-full transition-opacity duration-300 ${
						isMapReady ? "opacity-100" : "opacity-0"
					}`}
				>
					<MapContainer
						className="h-full w-full"
						center={DEFAULT_CENTER}
						zoom={DEFAULT_ZOOM}
						minZoom={2}
						maxZoom={18}
						scrollWheelZoom
						zoomControl
						ref={mapRef}
						whenReady={handleMapReady}
					>
						<TileLayer
							url={TILE_LAYER_URL}
							attribution={TILE_LAYER_ATTRIBUTION}
						/>
						<MapBoundsController positions={markerPositions} />
						{markers.map((marker) => (
							<Marker
								key={marker.id}
								position={marker.position}
								icon={
									marker.isAvailable
										? markerIcons.available
										: markerIcons.unavailable
								}
							>
								<Popup
									className="admin-property-popup"
									maxWidth={320}
									offset={[0, -24]}
								>
									<article className="flex w-[68vw] max-w-[260px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 md:w-[80vw] md:max-w-[320px]">
										<div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100 md:aspect-[4/3]">
											<img
												src={marker.imageUrl}
												alt={`Imagen de ${marker.title}`}
												className="h-full w-full object-cover"
												loading="lazy"
											/>
											{marker.statusName ? (
												<span
													className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow"
													style={
														!marker.isAvailable
															? {
																	color: "#dc2626",
																	border: "1px solid #dc2626",
																	backgroundColor:
																		"#fee2e2",
															  }
															: {
																	color:
																		marker.statusColor ||
																		"var(--text-dark)",
																	border: `1px solid ${
																		marker.statusColor ||
																		"transparent"
																	}`,
																	backgroundColor:
																		marker.statusColor
																			? "#ffffffcc"
																			: "rgba(255, 255, 255, 0.85)",
															  }
													}
												>
													<span aria-hidden="true">
														●
													</span>
													<span>
														{marker.statusName}
													</span>
													{marker.isAvailable &&
													marker.operation ? (
														<>
															<span aria-hidden="true">
																•
															</span>
															<span>
																{
																	marker.operation
																}
															</span>
														</>
													) : null}
												</span>
											) : null}
											{marker.priceLabel ? (
												<span className="absolute right-3 top-3 rounded-full bg-[#d2ff1e] px-3 py-1 text-xs font-bold text-black shadow-md">
													{marker.priceLabel}
												</span>
											) : null}
										</div>

										<div className="space-y-3 p-3 md:p-4">
											<div className="space-y-1">
												<p className="truncate text-sm font-semibold text-[var(--text-dark)]">
													{marker.title}
												</p>
												{marker.locationLabel ? (
													<p className="flex items-center gap-1 text-xs text-gray-500">
														<span aria-hidden="true">
															📍
														</span>
														{marker.locationLabel}
													</p>
												) : null}
											</div>

											<div className="flex flex-wrap items-center gap-3 text-[0.65rem] font-medium text-gray-600 md:text-xs">
												{marker.slug ? (
													<Link
														href={`/inmuebles/${marker.slug}`}
														className="w-[100%] rounded-full bg-[#d2ff1e] 
                                                        px-5 py-3 text-center text-sm font-semibold text-black 
                                                        shadow transition hover:opacity-90"
													>
														Ver Inmueble
													</Link>
												) : null}
											</div>
										</div>
									</article>
								</Popup>
							</Marker>
						))}
					</MapContainer>
				</div>

				{overlayMessage ? (
					<div className="absolute inset-0 flex items-center justify-center bg-white/80 px-6 text-center text-sm text-gray-500 backdrop-blur">
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
		</section>
	);
};

export default AdminPropertiesMap;
