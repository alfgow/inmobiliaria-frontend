"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Navigation, Pagination, Autoplay, EffectCreative } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-creative";

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
        modules={[Navigation, Pagination, Autoplay, EffectCreative]}
        slidesPerView={1}
        spaceBetween={24}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ["-20%", 0, -1],
            rotate: [0, 0, -5],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        }}
        className="property-gallery"
      >
        {galleryItems.map((image, index) => (
          <SwiperSlide key={`${image.url}-${index}`}>
            <motion.figure
              className="relative h-[420px] w-full overflow-hidden rounded-[26px]"
              whileHover={{ scale: 0.99 }}
            >
              <img
                src={image.url}
                alt={image.alt ?? title ?? "Imagen del inmueble"}
                className="h-full w-full object-cover"
                style={{ background: shimmerBackground }}
              />
              <motion.figcaption
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </motion.figure>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.section>
  );
};

export default PropertyGallery;
