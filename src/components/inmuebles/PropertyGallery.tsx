"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Swiper as SwiperInstance } from "swiper";
import "@/styles/swiper-bundle.css";
import {
        Autoplay,
        EffectCoverflow,
        Navigation,
        Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { NavigationOptions } from "swiper/types";
import MobileGalleryModal from "./MobileGalleryModal";

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

type GalleryModalContentProps = {
        activeIndex: number;
        closeModal: () => void;
        direction: "next" | "previous" | null;
        galleryItems: GalleryImage[];
        showNext: () => void;
        showPrevious: () => void;
        title?: string | null;
};

const DesktopGalleryModal = ({
        activeIndex,
        closeModal,
        galleryItems,
        showNext,
        showPrevious,
        title,
}: GalleryModalContentProps) => {
        const activeImage = galleryItems[activeIndex];

        if (!activeImage) {
                return null;
        }

        return (
                <motion.div
                        className="property-gallery-modal fixed inset-0 z-50 flex min-h-[100svh] w-full items-center justify-center bg-black/95"
                        style={{
                                paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)",
                                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
                                paddingLeft: "calc(env(safe-area-inset-left, 0px) + 1rem)",
                                paddingRight: "calc(env(safe-area-inset-right, 0px) + 1rem)",
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
                                className="relative flex h-full w-full max-h-[calc(100svh-2.5rem)] max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/75 shadow-[0_45px_120px_-40px_rgba(15,23,42,0.9)] backdrop-blur"
                                initial={{ scale: 0.96, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.96, opacity: 0 }}
                                transition={{
                                        duration: 0.3,
                                        ease: "easeOut",
                                }}
                                onClick={(event) => event.stopPropagation()}
                        >
                                <header className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 text-white sm:px-6 sm:py-5">
                                        <div className="min-w-0 space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                                                        Galería
                                                </p>
                                                {title && (
                                                        <h2 className="truncate text-lg font-semibold sm:text-xl">{title}</h2>
                                                )}
                                        </div>

                                        <button
                                                type="button"
                                                onClick={closeModal}
                                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                        </button>
                                </header>

                                <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-black/30 via-black/50 to-black/70 px-3 py-6 sm:px-8 sm:py-10">
                                        {activeImage && (
                                                <motion.div
                                                        key={activeImage.url}
                                                        className="relative flex h-full w-full items-center justify-center"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{
                                                                duration: 0.4,
                                                                ease: "easeOut",
                                                        }}
                                                >
                                                        <Image
                                                                fill
                                                                src={activeImage.url}
                                                                alt={activeImage.alt ?? title ?? "Imagen del inmueble"}
                                                                className="object-contain"
                                                                sizes="(max-width: 1024px) 90vw, 960px"
                                                        />
                                                </motion.div>
                                        )}

                                        {galleryItems.length > 1 && (
                                                <>
                                                        <button
                                                                type="button"
                                                                onClick={showPrevious}
                                                                className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 transform items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 sm:flex h-12 w-12 md:left-6 md:h-14 md:w-14"
                                                                aria-label="Imagen anterior"
                                                        >
                                                                <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-6 w-6 md:h-7 md:w-7"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                                                </svg>
                                                        </button>
                                                        <button
                                                                type="button"
                                                                onClick={showNext}
                                                                className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 transform items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 sm:flex h-12 w-12 md:right-6 md:h-14 md:w-14"
                                                                aria-label="Imagen siguiente"
                                                        >
                                                                <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-6 w-6 md:h-7 md:w-7"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                        </button>
                                                </>
                                        )}

                                        {galleryItems.length > 1 && (
                                                <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 transform rounded-full bg-black/60 px-4 py-2 text-center text-sm font-medium text-white backdrop-blur sm:block md:text-base">
                                                        {activeIndex + 1} / {galleryItems.length}
                                                </div>
                                        )}
                                </div>

                                {galleryItems.length > 1 && (
                                        <footer className="flex items-center justify-between gap-6 border-t border-white/10 px-4 py-4 text-white sm:hidden">
                                                <button
                                                        type="button"
                                                        onClick={showPrevious}
                                                        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
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
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                </button>

                                                <div className="text-sm font-medium">
                                                        {activeIndex + 1} / {galleryItems.length}
                                                </div>

                                                <button
                                                        type="button"
                                                        onClick={showNext}
                                                        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
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
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                </button>
                                        </footer>
                                )}
                        </motion.div>
                </motion.div>
        );
};

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
        const [isDesktopViewport, setIsDesktopViewport] = useState(false);
        const [navigationDirection, setNavigationDirection] = useState<"next" | "previous" | null>(null);

        useEffect(() => {
                setIsMounted(true);

                return () => {
                        setIsMounted(false);
                };
        }, []);

        useEffect(() => {
                if (typeof window === "undefined") {
                        return;
                }

                const mediaQuery = window.matchMedia("(min-width: 1024px)");

                const handleChange = (event: MediaQueryListEvent) => {
                        setIsDesktopViewport(event.matches);
                };

                setIsDesktopViewport(mediaQuery.matches);

                if (typeof mediaQuery.addEventListener === "function") {
                        mediaQuery.addEventListener("change", handleChange);

                        return () => {
                                mediaQuery.removeEventListener("change", handleChange);
                        };
                }

                mediaQuery.addListener(handleChange);

                return () => {
                        mediaQuery.removeListener(handleChange);
                };
        }, []);

        const openModal = useCallback((index: number) => {
                setActiveIndex(index);
                setNavigationDirection(null);
                setIsModalOpen(true);
        }, []);

        const closeModal = useCallback(() => {
                setIsModalOpen(false);
        }, []);

        const showPrevious = useCallback(() => {
                setNavigationDirection("previous");
                setActiveIndex((current) =>
                        current === 0 ? Math.max(galleryItems.length - 1, 0) : current - 1
                );
        }, [galleryItems.length]);

        const showNext = useCallback(() => {
                setNavigationDirection("next");
                setActiveIndex((current) =>
                        current === galleryItems.length - 1 ? 0 : current + 1
                );
        }, [galleryItems.length]);

        useEffect(() => {
                if (!galleryItems.length) {
                        setActiveIndex(0);
                        setNavigationDirection(null);
                        return;
                }

                setNavigationDirection(null);
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

                                                if (
                                                        swiper.params.navigation &&
                                                        typeof swiper.params.navigation !== "boolean"
                                                ) {
                                                        const navigation = swiper.params.navigation;

                                                        navigation.prevEl = thumbnailPrevButtonRef.current;
                                                        navigation.nextEl = thumbnailNextButtonRef.current;
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
                                                                        className="relative w-full overflow-hidden aspect-[16/11] sm:aspect-[16/9]"
                                                                        whileHover={{ scale: 1.03 }}
                                                                        transition={{ duration: 0.4 }}
                                                                >
                                                                        <Image
                                                                                fill
                                                                                src={image.url}
                                                                                alt={
                                                                                        image.alt ??
                                                                                        title ??
                                                                                        "Imagen del inmueble"
                                                                                }
                                                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                                                style={{
                                                                                        background: shimmerBackground,
                                                                                }}
                                                                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 960px"
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
							{isModalOpen
								? isDesktopViewport
									? (
                                                                                <DesktopGalleryModal
                                                                                        activeIndex={activeIndex}
                                                                                        closeModal={closeModal}
                                                                                        direction={navigationDirection}
                                                                                        galleryItems={galleryItems}
                                                                                        showNext={showNext}
                                                                                        showPrevious={showPrevious}
                                                                                        title={title}
										/>
									)
									: (
                                                                                <MobileGalleryModal
                                                                                        activeIndex={activeIndex}
                                                                                        closeModal={closeModal}
                                                                                        direction={navigationDirection}
                                                                                        galleryItems={galleryItems}
                                                                                        showNext={showNext}
                                                                                        showPrevious={showPrevious}
                                                                                        title={title}
										/>
									)
							: null}
						</AnimatePresence>,

						document.body
				  )
				: null}
		</motion.section>
	);
};

export default PropertyGallery;
