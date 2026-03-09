"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type GalleryImage = {
  url: string;
  alt?: string | null;
};

type PropertyGalleryProps = {
  images?: GalleryImage[] | null;
  title?: string | null;
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const primaryImage = galleryItems[0];
  const secondaryImages = galleryItems.slice(1, 5);
  const remainingImagesCount = Math.max(galleryItems.length - 5, 0);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openModalAt = useCallback((index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  }, []);

  const showPrevious = useCallback(() => {
    if (galleryItems.length <= 1) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => (current === 0 ? galleryItems.length - 1 : current - 1));
  }, [galleryItems.length]);

  const showNext = useCallback(() => {
    if (galleryItems.length <= 1) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => (current === galleryItems.length - 1 ? 0 : current + 1));
  }, [galleryItems.length]);

  const showPreviousMobile = useCallback(() => {
    if (galleryItems.length <= 1) {
      setMobileIndex(0);
      return;
    }

    setMobileIndex((current) => (current === 0 ? galleryItems.length - 1 : current - 1));
  }, [galleryItems.length]);

  const showNextMobile = useCallback(() => {
    if (galleryItems.length <= 1) {
      setMobileIndex(0);
      return;
    }

    setMobileIndex((current) => (current === galleryItems.length - 1 ? 0 : current + 1));
  }, [galleryItems.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) {
        return;
      }

      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [closeModal, isModalOpen, showNext, showPrevious]);

  useEffect(() => {
    if (!galleryItems.length) {
      setMobileIndex(0);
      return;
    }

    setMobileIndex((current) => (current > galleryItems.length - 1 ? 0 : current));
  }, [galleryItems.length]);

  if (!galleryItems.length) {
    return (
      <section className="rounded-3xl border border-[#d9e9dd] bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Galeria de imagenes</h2>
        <p className="mt-3 text-gray-600">
          Aun no hay fotografias disponibles para este inmueble.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-[#d9e9dd] bg-white p-3 shadow-sm md:p-4">
        <div className="relative md:hidden">
          <div
            className="relative overflow-hidden rounded-2xl"
            onTouchStart={(event) => {
              setTouchStartX(event.touches[0]?.clientX ?? null);
            }}
            onTouchEnd={(event) => {
              if (touchStartX === null) {
                return;
              }

              const endX = event.changedTouches[0]?.clientX ?? touchStartX;
              const delta = touchStartX - endX;

              if (Math.abs(delta) < 40) {
                setTouchStartX(null);
                return;
              }

              if (delta > 0) {
                showNextMobile();
              } else {
                showPreviousMobile();
              }

              setTouchStartX(null);
            }}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
            >
              {galleryItems.map((image, index) => (
                <button
                  key={`mobile-slide-${image.url}-${index}`}
                  type="button"
                  className="relative h-[290px] w-full shrink-0 overflow-hidden"
                  onClick={() => openModalAt(index)}
                  aria-label={`Abrir imagen ${index + 1}`}
                >
                  <Image
                    fill
                    src={image.url}
                    alt={image.alt ?? title ?? "Imagen del inmueble"}
                    className="object-cover"
                    sizes="100vw"
                    priority={index === 0}
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </button>
              ))}
            </div>

            {galleryItems.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPreviousMobile}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/55"
                  aria-label="Foto anterior"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 19 8 12l7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextMobile}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/55"
                  aria-label="Foto siguiente"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>

          {galleryItems.length > 1 ? (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {galleryItems.map((image, index) => (
                  <button
                    key={`mobile-dot-${image.url}-${index}`}
                    type="button"
                    onClick={() => setMobileIndex(index)}
                    aria-label={`Ir a foto ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      index === mobileIndex ? "w-5 bg-green-700" : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {mobileIndex + 1} / {galleryItems.length}
              </span>
            </div>
          ) : null}
        </div>

        <div className="hidden h-[520px] grid-cols-4 grid-rows-2 gap-3 md:grid">
          {primaryImage ? (
            <button
              type="button"
              onClick={() => openModalAt(0)}
              className="group relative col-span-1 overflow-hidden rounded-2xl md:col-span-2 md:row-span-2"
              aria-label="Abrir galeria"
            >
              <Image
                fill
                src={primaryImage.url}
                alt={primaryImage.alt ?? title ?? "Imagen del inmueble"}
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              {galleryItems.length > 1 ? (
                <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {galleryItems.length} fotos
                </span>
              ) : null}
            </button>
          ) : null}

          {Array.from({ length: 4 }).map((_, slotIndex) => {
            const image = secondaryImages[slotIndex];
            const realIndex = slotIndex + 1;
            const shouldShowOverlay = slotIndex === 3 && (remainingImagesCount > 0 || galleryItems.length > 1);

            return (
              <div key={`gallery-slot-${slotIndex}`} className="relative hidden overflow-hidden rounded-2xl md:block">
                {image ? (
                  <button
                    type="button"
                    onClick={() => openModalAt(realIndex)}
                    className="group relative block h-full w-full"
                    aria-label={`Abrir imagen ${realIndex + 1}`}
                  >
                    <Image
                      fill
                      src={image.url}
                      alt={image.alt ?? title ?? "Imagen del inmueble"}
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="25vw"
                    />
                    {shouldShowOverlay ? (
                      <span className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-bold text-white backdrop-blur-sm transition group-hover:bg-black/30">
                        {remainingImagesCount > 0 ? `+${remainingImagesCount} fotos` : "Ver galeria"}
                      </span>
                    ) : null}
                  </button>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-green-50 to-white" />
                )}

                {!image && shouldShowOverlay ? (
                  <button
                    type="button"
                    onClick={() => openModalAt(0)}
                    className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-bold text-white backdrop-blur-sm"
                    aria-label="Abrir galeria completa"
                  >
                    Ver galeria
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {galleryItems.length > 1 ? (
          <div className="mt-3 flex justify-end md:hidden">
            <button
              type="button"
              onClick={() => openModalAt(0)}
              className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Ver todas las fotos
            </button>
          </div>
        ) : null}
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/90 px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de imagenes"
          onClick={closeModal}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Cerrar galeria"
          >
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="relative flex h-full w-full max-w-6xl flex-col justify-center" onClick={(event) => event.stopPropagation()}>
            <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl bg-black">
              <Image
                fill
                src={galleryItems[activeIndex]?.url ?? ""}
                alt={galleryItems[activeIndex]?.alt ?? title ?? "Imagen del inmueble"}
                className="object-contain"
                sizes="90vw"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm font-medium text-white">
              <span>
                {activeIndex + 1} de {galleryItems.length}
              </span>
              {galleryItems.length > 1 ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PropertyGallery;

