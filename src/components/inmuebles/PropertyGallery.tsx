"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
      className="overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-2 shadow-xl backdrop-blur"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        loop
        centeredSlides
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        className="property-gallery"
      >
        {galleryItems.map((image, index) => (
          <SwiperSlide key={`${image.url}-${index}`} className="!flex items-center justify-center">
            <motion.figure
              className="group relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-slate-100/80 shadow-inner"
              initial={{ opacity: 0.85, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="aspect-[16/10] w-full sm:aspect-[16/9]"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? title ?? "Imagen del inmueble"}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ background: shimmerBackground }}
                  loading="lazy"
                />
              </motion.div>
              <motion.figcaption
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0 p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.6 }}
              >
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/80">Galería</p>
                <p className="text-lg font-semibold text-white drop-shadow">{title}</p>
              </motion.figcaption>
            </motion.figure>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.section>
  );
};

export default PropertyGallery;
