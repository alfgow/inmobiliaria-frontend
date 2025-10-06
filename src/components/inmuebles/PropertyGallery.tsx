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

	const prevButtonRef = useRef<HTMLButtonElement>(null);
	const nextButtonRef = useRef<HTMLButtonElement>(null);
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
			!prevButtonRef.current ||
			!nextButtonRef.current
		) {
			return;
		}

		swiper.params.navigation = {
			...(swiper.params.navigation as NavigationOptions),
			prevEl: prevButtonRef.current,
			nextEl: nextButtonRef.current,
		};

		swiper.navigation.destroy();
		swiper.navigation.init();
		swiper.navigation.update();
	}, [prevButtonRef, nextButtonRef]);

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
						prevEl: prevButtonRef.current,
						nextEl: nextButtonRef.current,
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
								prevButtonRef.current;
							swiper.params.navigation.nextEl =
								nextButtonRef.current;
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
					ref={prevButtonRef}
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
					ref={nextButtonRef}
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
                                                                        className="property-gallery-modal fixed inset-0 z-50 flex bg-slate-950/70 backdrop-blur-2xl"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                        onClick={closeModal}
                                                                >
                                                                        <motion.div
                                                                                className="relative mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-none bg-white/10 shadow-[0_35px_70px_-25px_rgba(15,23,42,0.9)] ring-1 ring-white/15 backdrop-blur-2xl sm:my-10 sm:h-auto sm:max-h-[90vh] sm:rounded-[32px]"
                                                                                initial={{
                                                                                        y: 32,
                                                                                        opacity: 0,
                                                                                        scale: 0.96,
                                                                                }}
                                                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                                                exit={{
                                                                                        y: 32,
                                                                                        opacity: 0,
                                                                                        scale: 0.96,
                                                                                }}
                                                                                transition={{
                                                                                        duration: 0.45,
                                                                                        ease: "easeOut",
                                                                                }}
                                                                                onClick={(event) =>
                                                                                        event.stopPropagation()
                                                                                }
                                                                        >
                                                                                <div className="flex items-center justify-between px-5 pb-3 pt-4 text-white sm:px-8">
                                                                                        <div className="flex min-w-0 flex-col">
                                                                                                <span className="text-xs uppercase tracking-[0.3em] text-white/60">Galería</span>
                                                                                                <span className="truncate text-base font-semibold sm:text-lg">
                                                                                                        {title ?? "Galería del inmueble"}
                                                                                                </span>
                                                                                        </div>
                                                                                        <button
                                                                                                type="button"
                                                                                                onClick={closeModal}
                                                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-semibold text-white shadow-lg transition hover:bg-white/30"
                                                                                        >
                                                                                                <span aria-hidden>×</span>
                                                                                                <span className="sr-only">Cerrar</span>
                                                                                        </button>
                                                                                </div>

                                                                                <motion.figure
                                                                                        className="relative flex-1 overflow-hidden rounded-t-[24px] border-y border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/80 sm:mx-6 sm:rounded-[28px] sm:border"
                                                                                        initial={{
                                                                                                opacity: 0,
                                                                                                scale: 0.97,
                                                                                        }}
                                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                                        transition={{
                                                                                                duration: 0.4,
                                                                                                ease: "easeOut",
                                                                                        }}
                                                                                >
                                                                                        <motion.img
                                                                                                key={
                                                                                                        galleryItems[activeIndex]
                                                                                                                ?.url
                                                                                                }
                                                                                                src={
                                                                                                        galleryItems[activeIndex]
                                                                                                                ?.url
                                                                                                }
                                                                                                alt={
                                                                                                        galleryItems[activeIndex]
                                                                                                                ?.alt ??
                                                                                                        title ??
                                                                                                        "Imagen del inmueble"
                                                                                                }
                                                                                                className="h-full w-full max-h-[70vh] object-contain sm:max-h-[65vh]"
                                                                                                initial={{
                                                                                                        opacity: 0,
                                                                                                        scale: 1.02,
                                                                                                }}
                                                                                                animate={{
                                                                                                        opacity: 1,
                                                                                                        scale: 1,
                                                                                                }}
                                                                                                transition={{
                                                                                                        duration: 0.45,
                                                                                                        ease: "easeOut",
                                                                                                }}
                                                                                        />
                                                                                        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
                                                                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                                                                                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6">
                                                                                                <button
                                                                                                        ref={prevButtonRef}
                                                                                                        type="button"
                                                                                                        onClick={showPrevious}
                                                                                                        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur transition hover:bg-white/30"
                                                                                                        aria-label="Ver imagen anterior"
                                                                                                >
                                                                                                        <svg
                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                className="h-5 w-5"
                                                                                                                fill="none"
                                                                                                                viewBox="0 0 24 24"
                                                                                                                stroke="currentColor"
                                                                                                                strokeWidth={1.5}
                                                                                                        >
                                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                                                                                        </svg>
                                                                                                </button>
                                                                                                <button
                                                                                                        ref={nextButtonRef}
                                                                                                        type="button"
                                                                                                        onClick={showNext}
                                                                                                        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur transition hover:bg-white/30"
                                                                                                        aria-label="Ver imagen siguiente"
                                                                                                >
                                                                                                        <svg
                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                className="h-5 w-5"
                                                                                                                fill="none"
                                                                                                                viewBox="0 0 24 24"
                                                                                                                stroke="currentColor"
                                                                                                                strokeWidth={1.5}
                                                                                                        >
                                                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                                                                        </svg>
                                                                                                </button>
                                                                                        </div>
                                                                                </motion.figure>

                                                                                <div className="flex flex-col gap-3 px-5 pb-6 pt-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
                                                                                        <p className="text-center text-sm text-white/70 sm:text-left">
                                                                                                Navega por la galería para conocer cada detalle del inmueble.
                                                                                        </p>
                                                                                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onClick={showPrevious}
                                                                                                        className="inline-flex w-full items-center justify-center rounded-full bg-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-md transition hover:bg-white/30 sm:w-auto"
                                                                                                >
                                                                                                        Anterior
                                                                                                </button>
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onClick={showNext}
                                                                                                        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--lime)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-black shadow-md transition hover:bg-lime-300 sm:w-auto"
                                                                                                >
                                                                                                        Siguiente
                                                                                                </button>
                                                                                        </div>
                                                                                </div>
                                                                        </motion.div>
                                                                </motion.div>
                                                        ) : null}
						</AnimatePresence>,
						document.body
				  )
				: null}
		</motion.section>
	);
};

export default PropertyGallery;
