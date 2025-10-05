"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
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
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
        effect="coverflow"
        coverflowEffect={{ rotate: 32, stretch: -10, depth: 140, modifier: 1.2, slideShadows: true }}
        slidesPerView="auto"
        centeredSlides
        loop
        grabCursor
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1.1, spaceBetween: 16 },
          640: { slidesPerView: 1.35, spaceBetween: 24 },
          1024: { slidesPerView: 2.15, spaceBetween: 32 },
          1440: { slidesPerView: 2.75, spaceBetween: 40 },
        }}
        className="property-gallery !px-4 pb-12"
      >
        {galleryItems.map((image, index) => (
          <SwiperSlide
            key={`${image.url}-${index}`}
            className="!flex max-w-[22rem] items-center justify-center sm:max-w-[26rem] md:max-w-[30rem] lg:max-w-[34rem]"
          >
            <motion.figure
              className="group relative w-full overflow-hidden rounded-[32px] bg-slate-100/80 shadow-[0_25px_50px_-12px_rgba(30,64,175,0.35)]"
              initial={{ opacity: 0.85, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="aspect-[4/5] w-full sm:aspect-[16/10]"
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
    </motion.section>
  );
};

export default PropertyGallery;
