"use client";

import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { NavigationOptions, PaginationOptions } from "swiper/types";

import "@/styles/swiper-bundle.css";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
	style: "currency",
	currency: "MXN",
	maximumFractionDigits: 0,
});

export interface Property {
	id: string;
	title: string;
	slug?: string | null;
	price: number;
	operation?: string | null;
	status?: string | null;
	coverImageUrl: string;
	location?: string | null;
}

interface PropertyCarouselProps {
	properties: Property[];
	navigationPrevRef: RefObject<HTMLButtonElement | null>;
	navigationNextRef: RefObject<HTMLButtonElement | null>;
	paginationRef: RefObject<HTMLDivElement | null>;
}

const PropertyCarousel = ({
	properties,
	navigationPrevRef,
	navigationNextRef,
	paginationRef,
}: PropertyCarouselProps) => {
	const swiperRef = useRef<SwiperInstance | null>(null);

	const totalProperties = properties.length;
	const showNav = totalProperties > 3; // flechas solo con 4+
	const shouldLoop = totalProperties > 3; // loop solo con 4+
	const showPagination = totalProperties > 1; // bullets solo si hay 2+

	useEffect(() => {
		const swiper = swiperRef.current;
		if (!swiper) return;

		// Mostrar/ocultar flechas externas
		if (navigationPrevRef.current) {
			navigationPrevRef.current.style.display = showNav ? "" : "none";
			navigationPrevRef.current.setAttribute(
				"aria-hidden",
				showNav ? "false" : "true"
			);
			navigationPrevRef.current.tabIndex = showNav ? 0 : -1;
		}
		if (navigationNextRef.current) {
			navigationNextRef.current.style.display = showNav ? "" : "none";
			navigationNextRef.current.setAttribute(
				"aria-hidden",
				showNav ? "false" : "true"
			);
			navigationNextRef.current.tabIndex = showNav ? 0 : -1;
		}

		// Loop dinámico
		if (swiper.params.loop !== shouldLoop) {
			swiper.params.loop = shouldLoop;
		}

		// Navigation dinámico
		if (showNav) {
			if (
				swiper.params.navigation &&
				typeof swiper.params.navigation !== "boolean" &&
				navigationPrevRef.current &&
				navigationNextRef.current
			) {
				swiper.params.navigation = {
					...(swiper.params.navigation as NavigationOptions),
					prevEl: navigationPrevRef.current,
					nextEl: navigationNextRef.current,
				};
				swiper.navigation.destroy();
				swiper.navigation.init();
				swiper.navigation.update();
			}
		} else {
			if (swiper.navigation) {
				try {
					swiper.navigation.destroy();
				} catch {}
			}
			swiper.params.navigation = false;
		}

		// Pagination dinámica (solo si hay 2+ propiedades)
		if (showPagination) {
			if (
				swiper.params.pagination &&
				typeof swiper.params.pagination !== "boolean" &&
				paginationRef.current
			) {
				swiper.params.pagination = {
					...(swiper.params.pagination as PaginationOptions),
					el: paginationRef.current,
					clickable: true,
				};
				swiper.pagination.destroy();
				swiper.pagination.init();
				swiper.pagination.render();
				swiper.pagination.update();
				paginationRef.current.style.display = ""; // visible
			}
		} else {
			// ocultar bullets si solo hay 1
			if (paginationRef.current)
				paginationRef.current.style.display = "none";
			if (swiper.pagination) {
				try {
					swiper.pagination.destroy();
				} catch {}
			}
			swiper.params.pagination = false;
		}

		swiper.update();
	}, [
		showNav,
		shouldLoop,
		showPagination,
		totalProperties,
		navigationPrevRef,
		navigationNextRef,
		paginationRef,
	]);

	return (
		<Swiper
			modules={[Navigation, Pagination]}
			className="swiper mySwiper w-full px-4 md:px-0 md:mx-auto md:max-w-6xl"
			spaceBetween={16} // un poco menos en mobile
			// *** Mobile: 1 por vista | Desktop: auto-width ***
			slidesPerView={1}
			breakpoints={{
				768: {
					slidesPerView: "auto",
					spaceBetween: 24,
				},
			}}
			loop={shouldLoop}
			centeredSlides
			centeredSlidesBounds
			centerInsufficientSlides
			watchOverflow
			navigation={
				showNav
					? {
							prevEl: navigationPrevRef.current,
							nextEl: navigationNextRef.current,
					  }
					: false
			}
			pagination={
				showPagination
					? {
							el: paginationRef.current,
							clickable: true,
					  }
					: false
			}
			onBeforeInit={(swiper) => {
				swiperRef.current = swiper;

				if (
					showNav &&
					swiper.params.navigation &&
					typeof swiper.params.navigation !== "boolean"
				) {
					swiper.params.navigation.prevEl = navigationPrevRef.current;
					swiper.params.navigation.nextEl = navigationNextRef.current;
				} else {
					swiper.params.navigation = false;
				}

				if (
					showPagination &&
					swiper.params.pagination &&
					typeof swiper.params.pagination !== "boolean"
				) {
					swiper.params.pagination.el = paginationRef.current;
					swiper.params.pagination.clickable = true;
				} else {
					swiper.params.pagination = false;
				}
			}}
			onSwiper={(swiper) => {
				swiperRef.current = swiper;
			}}
		>
			{properties.map((property) => {
				const formattedPrice = Number.isFinite(property.price)
					? currencyFormatter.format(property.price)
					: "Consultar";

				const statusLabel =
					property.status ?? property.operation ?? "Disponible";
				const detailsLineItems = [formattedPrice];
				if (property.operation)
					detailsLineItems.push(property.operation);
				if (property.location) detailsLineItems.push(property.location);
				const detailsLine = detailsLineItems.join(" · ");
				const detailsUrl = property.slug
					? `/inmuebles/${property.slug}`
					: "/inmuebles";

				return (
					<SwiperSlide
						key={property.id}
						className="w-full md:!w-auto" // móvil: ancho completo | desktop: auto
					>
						<div className="card-3d w-full md:w-[22rem] lg:w-[24rem] h-full flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-none backdrop-blur">
							{/* Imagen con alto uniforme: relación 16:9 en todos los breakpoints */}
							<div className="relative w-full aspect-[16/9] overflow-hidden">
								<Image
									fill
									src={property.coverImageUrl}
									alt={property.title}
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 352px"
								/>
								<span className="absolute left-3 top-3 rounded-full bg-[var(--lime)] px-3 py-1 text-xs font-bold text-black">
									{statusLabel}
								</span>
							</div>
							<div className="flex h-full flex-col p-6">
								<h3 className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold text-[var(--text-dark)]">
									{property.title}
								</h3>
								<p className="mb-4 text-gray-600">
									{detailsLine}
								</p>
								<Link
									href={detailsUrl}
									className="mt-auto inline-flex items-center justify-center rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
								>
									Ver Detalles
								</Link>
							</div>
						</div>
					</SwiperSlide>
				);
			})}
		</Swiper>
	);
};

export default PropertyCarousel;
