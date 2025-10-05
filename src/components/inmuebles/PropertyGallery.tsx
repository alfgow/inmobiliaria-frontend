"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import type { NavigationOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

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

  if (!galleryItems.length) {
    return (
      <motion.div
        className="flex h-80 w-full items-center justify-center rounded-3xl border border-[var(--indigo)]/10 bg-gradient-to-br from-[var(--indigo)]/10 via-white to-[var(--lime)]/20 text-center shadow-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-3 px-10">
          <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Explora cada rincón</h2>
          <p className="text-base text-gray-600">
            Muy pronto tendremos fotografías de esta propiedad. Mientras tanto, solicita más información y te
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
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
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
            slideShadows: true,
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
              swiper.params.navigation.prevEl = prevButtonRef.current;
              swiper.params.navigation.nextEl = nextButtonRef.current;
            }
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {galleryItems.map((image, index) => (
            <SwiperSlide
              key={`${image.url}-${index}`}
              className="!flex w-full max-w-xl items-center justify-center px-4 sm:max-w-2xl lg:max-w-3xl"
            >
              <motion.figure
                className="group relative w-full overflow-hidden rounded-[32px] border border-white/50 bg-white/80 shadow-[0_35px_60px_-18px_rgba(30,64,175,0.45)] backdrop-blur"
                initial={{ opacity: 0.85, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={image.url}
                    alt={image.alt ?? title ?? "Imagen del inmueble"}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ background: shimmerBackground }}
                    loading="lazy"
                  />
                </motion.div>
                <motion.figcaption
                  className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                >
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.4em] text-white/70">Galería</p>
                  <p className="text-lg font-semibold text-white drop-shadow-lg">{title}</p>
                </motion.figcaption>
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M8.47 4.47a.75.75 0 011.06 0l7 7a.75.75 0 010 1.06l-7 7a.75.75 0 11-1.06-1.06L14.94 12 8.47 5.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </motion.section>
  );
};

export default PropertyGallery;
