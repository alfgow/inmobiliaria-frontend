"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
	Autoplay,
	EffectCoverflow,
	Navigation,
	Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { NavigationOptions } from "swiper/types";

type GalleryImage = {
	url: string;
	alt?: string | null;
};

type PropertyGalleryProps = {
	images?: GalleryImage[] | null;
	title?: string | null;
};

const shimmerBackground =
	"linear-gradient(120deg, rgba(124,58,237,0.25), rgba(210,255,30,0.35), rgba(124,58,237,0.25))";

const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
	const galleryItems = useMemo(() => {
		return (images ?? [])
			.map((image) => ({
				url: image?.url ?? "",
				alt: image?.alt ?? title ?? "Imagen del inmueble",
			}))
			.filter((image) => Boolean(image.url));
	}, [images, title]);

	const thumbnailPrevButtonRef = useRef<HTMLButtonElement>(null);
	const thumbnailNextButtonRef = useRef<HTMLButtonElement>(null);
	const swiperRef = useRef<SwiperInstance | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);

		return () => {
			setIsMounted(false);
		};
	}, []);

	const openModal = useCallback((index: number) => {
		setActiveIndex(index);
		setIsModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const showPrevious = useCallback(() => {
		setActiveIndex((current) =>
			current === 0 ? Math.max(galleryItems.length - 1, 0) : current - 1
		);
	}, [galleryItems.length]);

	const showNext = useCallback(() => {
		setActiveIndex((current) =>
			current === galleryItems.length - 1 ? 0 : current + 1
		);
	}, [galleryItems.length]);

	useEffect(() => {
		if (!galleryItems.length) {
			setActiveIndex(0);
			return;
		}

		setActiveIndex((current) => {
			if (current > galleryItems.length - 1) {
				return galleryItems.length - 1;
			}

			return current;
		});
	}, [galleryItems]);

	useEffect(() => {
		const swiper = swiperRef.current;

		if (
			!swiper ||
			!swiper.params.navigation ||
			typeof swiper.params.navigation === "boolean" ||
			!thumbnailPrevButtonRef.current ||
			!thumbnailNextButtonRef.current
		) {
			return;
		}

		swiper.params.navigation = {
			...(swiper.params.navigation as NavigationOptions),
			prevEl: thumbnailPrevButtonRef.current,
			nextEl: thumbnailNextButtonRef.current,
		};

		swiper.navigation.destroy();
		swiper.navigation.init();
		swiper.navigation.update();
	}, [thumbnailPrevButtonRef, thumbnailNextButtonRef]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isModalOpen) {
				return;
			}

			if (event.key === "Escape") {
				closeModal();
			}

			if (event.key === "ArrowRight") {
				showNext();
			}

			if (event.key === "ArrowLeft") {
				showPrevious();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		if (isModalOpen) {
			document.body.style.overflow = "hidden";
			document.documentElement.classList.add("gallery-modal-open");
		} else {
			document.body.style.overflow = "";
			document.documentElement.classList.remove("gallery-modal-open");
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
			document.documentElement.classList.remove("gallery-modal-open");
		};
	}, [closeModal, isModalOpen, showNext, showPrevious]);

	if (!galleryItems.length) {
		return (
			<motion.div
				className="flex h-80 w-full items-center justify-center rounded-3xl border border-[var(--indigo)]/10 bg-gradient-to-br from-[var(--indigo)]/10 via-white to-[var(--lime)]/20 text-center shadow-lg"
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div className="space-y-3 px-10">
					<h2 className="text-2xl font-semibold text-[var(--text-dark)]">
						Explora cada rincón
					</h2>
					<p className="text-base text-gray-600">
						Muy pronto tendremos fotografías de esta propiedad.
						Mientras tanto, solicita más información y te
						compartimos todo el material disponible.
					</p>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.section
			className="overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/90 via-white/70 to-[var(--indigo)]/10 p-6 shadow-xl backdrop-blur"
			initial={{ opacity: 0, y: 32 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="relative">
				<Swiper
					modules={[
						Navigation,
						Pagination,
						Autoplay,
						EffectCoverflow,
					]}
					effect="coverflow"
					centeredSlides
					slidesPerView={1.15}
					spaceBetween={0}
					loop
					grabCursor
					autoplay={{ delay: 5000, disableOnInteraction: false }}
					coverflowEffect={{
						rotate: 32,
						stretch: -12,
						depth: 220,
						modifier: 1.1,
						slideShadows: false,
					}}
					navigation={{
						prevEl: thumbnailPrevButtonRef.current,
						nextEl: thumbnailNextButtonRef.current,
					}}
					pagination={{ clickable: true }}
					breakpoints={{
						768: {
							slidesPerView: 1.5,
							coverflowEffect: {
								rotate: 22,
								stretch: -24,
							},
						},
						1024: {
							slidesPerView: 2.35,
							coverflowEffect: {
								rotate: 18,
								stretch: -32,
								depth: 260,
							},
						},
					}}
					className="property-gallery !px-4 pb-12 [&_.swiper-button-next]:hidden [&_.swiper-button-prev]:hidden"
					onBeforeInit={(swiper) => {
						swiperRef.current = swiper;

						if (typeof swiper.params.navigation !== "boolean") {
							swiper.params.navigation.prevEl =
								thumbnailPrevButtonRef.current;
							swiper.params.navigation.nextEl =
								thumbnailNextButtonRef.current;
						}
					}}
					onSwiper={(swiper) => {
						swiperRef.current = swiper;
					}}
				>
					{galleryItems.map((image, index) => (
						<SwiperSlide
							key={`${image.url}-${index}`}
							className="!flex w-full max-w-2xl items-center justify-center px-4 sm:max-w-3xl lg:max-w-4xl"
						>
							<motion.figure
								className="group relative w-full overflow-hidden rounded-[32px] border border-white/50 bg-white/80 shadow-[0_35px_60px_-18px_rgba(30,64,175,0.45)] backdrop-blur"
								initial={{ opacity: 0.85, scale: 0.94 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, ease: "easeOut" }}
								onClick={() => openModal(index)}
								role="button"
								tabIndex={0}
								onKeyDown={(event) => {
									if (
										event.key === "Enter" ||
										event.key === " "
									) {
										event.preventDefault();
										openModal(index);
									}
								}}
							>
								<motion.div
									className="w-full overflow-hidden aspect-[16/11] sm:aspect-[16/9]"
									whileHover={{ scale: 1.03 }}
									transition={{ duration: 0.4 }}
								>
									<img
										src={image.url}
										alt={
											image.alt ??
											title ??
											"Imagen del inmueble"
										}
										className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
										style={{
											background: shimmerBackground,
										}}
										loading="lazy"
									/>
								</motion.div>
								<motion.div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
							</motion.figure>
						</SwiperSlide>
					))}
				</Swiper>

				<button
					ref={thumbnailPrevButtonRef}
					className="absolute -left-10 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md md:flex"
					aria-label="Ver imagen anterior"
					type="button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							fillRule="evenodd"
							d="M15.53 4.47a.75.75 0 010 1.06L9.06 12l6.47 6.47a.75.75 0 11-1.06 1.06l-7-7a.75.75 0 010-1.06l7-7a.75.75 0 011.06 0z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
				<button
					ref={thumbnailNextButtonRef}
					className="absolute -right-10 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md md:flex"
					aria-label="Ver imagen siguiente"
					type="button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							fillRule="evenodd"
							d="M8.47 4.47a.75.75 0 011.06 0l7 7a.75.75 0 010 1.06l-7 7a.75.75 0 11-1.06-1.06L14.94 12 8.47 5.53a.75.75 0 010-1.06z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			</div>

			{isMounted
				? createPortal(
                                                <AnimatePresence>
                                                        {isModalOpen ? (
                                                <motion.div
                                                        className="property-gallery-modal fixed inset-0 z-50 flex min-h-[100svh] w-full items-center justify-center bg-black/90 px-4 backdrop-blur"
                                                        style={{
                                                                paddingTop:
                                                                        "calc(env(safe-area-inset-top, 0px) + 1.25rem)",
                                                                paddingBottom:
                                                                        "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
                                                        }}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        onClick={closeModal}
                                                        role="dialog"
                                                        aria-modal="true"
                                                        aria-label="Galería de imágenes"
                                                >
                                                        <motion.div
                                                                className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-black/75 text-white shadow-2xl ring-1 ring-white/10"
                                                                style={{
                                                                        maxHeight:
                                                                                "calc(100svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 2.5rem)",
                                                                }}
                                                                initial={{ y: 24, opacity: 0.8 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                exit={{ y: 24, opacity: 0.8 }}
                                                                transition={{
                                                                        duration: 0.32,
                                                                        ease: "easeOut",
                                                                }}
                                                                onClick={(event) => event.stopPropagation()}
                                                        >
                                                                <header
                                                                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm md:px-6 md:py-4 md:text-base"
                                                                        style={{
                                                                                paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.25rem)",
                                                                        }}
                                                                >
                                                                        <div className="min-w-0 flex-1">
                                                                                {title ? (
                                                                                        <h2 className="truncate font-medium tracking-tight">
                                                                                                {title}
                                                                                        </h2>
                                                                                ) : (
                                                                                        <span className="sr-only">Galería</span>
                                                                                )}
                                                                        </div>
                                                                        <button
                                                                                type="button"
                                                                                onClick={closeModal}
                                                                                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:h-11 md:w-11"
                                                                                aria-label="Cerrar galería"
                                                                        >
                                                                                <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        className="h-5 w-5"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth={2}
                                                                                >
                                                                                        <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M6 18L18 6M6 6l12 12"
                                                                                        />
                                                                                </svg>
                                                                        </button>
                                                                </header>

                                                                <div className="flex flex-1 flex-col">
                                                                        <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
                                                                                <motion.img
                                                                                        key={galleryItems[activeIndex]?.url}
                                                                                        src={galleryItems[activeIndex]?.url}
                                                                                        alt={galleryItems[activeIndex]?.alt ?? "Imagen del inmueble"}
                                                                                        className="h-full w-full max-w-full rounded-2xl object-contain"
                                                                                        style={{
                                                                                                backgroundImage: shimmerBackground,
                                                                                                backgroundSize: "400% 400%",
                                                                                        }}
                                                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                                        transition={{ duration: 0.35 }}
                                                                                />

                                                                                {galleryItems.length > 1 && (
                                                                                        <div className="pointer-events-none absolute inset-x-0 top-0 hidden justify-between px-6 pt-6 text-sm font-medium text-white/80 md:flex">
                                                                                                <span>
                                                                                                        {activeIndex + 1} / {galleryItems.length}
                                                                                                </span>
                                                                                                {title ? <span className="line-clamp-1 max-w-xs text-right">{title}</span> : null}
                                                                                        </div>
                                                                                )}

                                                                                {galleryItems.length > 1 && (
                                                                                        <>
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onClick={showPrevious}
                                                                                                        className="absolute left-3 top-1/2 hidden -translate-y-1/2 transform items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:flex h-12 w-12 lg:left-6 lg:h-14 lg:w-14"
                                                                                                        aria-label="Imagen anterior"
                                                                                                >
                                                                                                        <svg
                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                className="h-6 w-6"
                                                                                                                fill="none"
                                                                                                                viewBox="0 0 24 24"
                                                                                                                stroke="currentColor"
                                                                                                                strokeWidth={2}
                                                                                                        >
                                                                                                                <path
                                                                                                                        strokeLinecap="round"
                                                                                                                        strokeLinejoin="round"
                                                                                                                        d="M15 19l-7-7 7-7"
                                                                                                                />
                                                                                                        </svg>
                                                                                                </button>
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onClick={showNext}
                                                                                                        className="absolute right-3 top-1/2 hidden -translate-y-1/2 transform items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:flex h-12 w-12 lg:right-6 lg:h-14 lg:w-14"
                                                                                                        aria-label="Imagen siguiente"
                                                                                                >
                                                                                                        <svg
                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                className="h-6 w-6"
                                                                                                                fill="none"
                                                                                                                viewBox="0 0 24 24"
                                                                                                                stroke="currentColor"
                                                                                                                strokeWidth={2}
                                                                                                        >
                                                                                                                <path
                                                                                                                        strokeLinecap="round"
                                                                                                                        strokeLinejoin="round"
                                                                                                                        d="M9 5l7 7-7 7"
                                                                                                                />
                                                                                                        </svg>
                                                                                                </button>
                                                                                        </>
                                                                                )}
                                                                        </div>

                                                                        {galleryItems.length > 1 && (
                                                                                <footer
                                                                                        className="flex items-center justify-between gap-4 px-4 pb-4 text-sm"
                                                                                        style={{
                                                                                                paddingBottom:
                                                                                                        "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
                                                                                        }}
                                                                                >
                                                                                        <button
                                                                                                type="button"
                                                                                                onClick={showPrevious}
                                                                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:hidden"
                                                                                                aria-label="Imagen anterior"
                                                                                        >
                                                                                                <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        className="h-5 w-5"
                                                                                                        fill="none"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth={2}
                                                                                                >
                                                                                                        <path
                                                                                                                strokeLinecap="round"
                                                                                                                strokeLinejoin="round"
                                                                                                                d="M15 19l-7-7 7-7"
                                                                                                        />
                                                                                                </svg>
                                                                                        </button>

                                                                                        <span className="flex-1 text-center font-medium text-white/90 md:hidden">
                                                                                                {activeIndex + 1} / {galleryItems.length}
                                                                                        </span>

                                                                                        <button
                                                                                                type="button"
                                                                                                onClick={showNext}
                                                                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:hidden"
                                                                                                aria-label="Imagen siguiente"
                                                                                        >
                                                                                                <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        className="h-5 w-5"
                                                                                                        fill="none"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        stroke="currentColor"
                                                                                                        strokeWidth={2}
                                                                                                >
                                                                                                        <path
                                                                                                                strokeLinecap="round"
                                                                                                                strokeLinejoin="round"
                                                                                                                d="M9 5l7 7-7 7"
                                                                                                        />
                                                                                                </svg>
                                                                                        </button>
                                                                                </footer>
                                                                        )}
                                                                </div>
                                                        </motion.div>
                                                </motion.div>
                                        ) : null}
