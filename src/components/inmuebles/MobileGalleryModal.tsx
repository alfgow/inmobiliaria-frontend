"use client";

import { AnimatePresence, motion } from "framer-motion";

type GalleryImage = {
        url: string;
        alt?: string | null;
};

type MobileGalleryModalProps = {
        activeIndex: number;
        closeModal: () => void;
        direction: "next" | "previous" | null;
        galleryItems: GalleryImage[];
        showNext: () => void;
        showPrevious: () => void;
        title?: string | null;
};

const imageVariants = {
        enter: (direction: "next" | "previous") => ({
                x: direction === "next" ? 120 : -120,
                opacity: 0,
                scale: 0.95,
        }),
        center: {
                x: 0,
                opacity: 1,
                scale: 1,
        },
        exit: (direction: "next" | "previous") => ({
                x: direction === "next" ? -120 : 120,
                opacity: 0,
                scale: 0.95,
        }),
};

const MobileGalleryModal = ({
        activeIndex,
        closeModal,
        direction,
        galleryItems,
        showNext,
        showPrevious,
        title,
}: MobileGalleryModalProps) => {
        const activeDirection = direction ?? "next";

        return (
                <motion.div
                        className="property-gallery-modal-mobile fixed inset-0 z-50 flex min-h-[100svh] w-full bg-black/95"
                        style={{
                                paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)",
                                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
                                paddingLeft: "calc(env(safe-area-inset-left, 0px) + 0.75rem)",
                                paddingRight: "calc(env(safe-area-inset-right, 0px) + 0.75rem)",
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
                                className="relative flex h-full w-full flex-1 flex-col text-white"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                onClick={(event) => event.stopPropagation()}
                        >
                                <header className="flex items-center justify-between px-1 py-2 text-sm">
                                        <button
                                                type="button"
                                                onClick={closeModal}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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

                                        {galleryItems.length > 1 && (
                                                <div className="min-w-0 flex-1 text-center font-medium text-white/80">
                                                        {activeIndex + 1} de {galleryItems.length}
                                                </div>
                                        )}

                                        <div className="h-11 w-11" aria-hidden="true" />
                                </header>

                                <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                                        <AnimatePresence initial={false} custom={activeDirection} mode="wait">
                                                <motion.img
                                                        key={galleryItems[activeIndex]?.url}
                                                        src={galleryItems[activeIndex]?.url}
                                                        alt={
                                                                galleryItems[activeIndex]?.alt ??
                                                                title ??
                                                                "Imagen del inmueble"
                                                        }
                                                        className="max-h-full w-full max-w-full select-none object-contain"
                                                        custom={activeDirection}
                                                        variants={imageVariants}
                                                        initial="enter"
                                                        animate="center"
                                                        exit="exit"
                                                        transition={{
                                                                type: "spring",
                                                                stiffness: 400,
                                                                damping: 32,
                                                        }}
                                                        drag="x"
                                                        dragConstraints={{ left: 0, right: 0 }}
                                                        dragElastic={0.2}
                                                        onDragEnd={(_, info) => {
                                                                if (info.offset.x < -80 || info.velocity.x < -0.5) {
                                                                        showNext();
                                                                } else if (info.offset.x > 80 || info.velocity.x > 0.5) {
                                                                        showPrevious();
                                                                }
                                                        }}
                                                />
                                        </AnimatePresence>

                                        {galleryItems.length > 1 && (
                                                <>
                                                        <button
                                                                type="button"
                                                                onClick={showPrevious}
                                                                className="absolute left-0 top-0 h-full w-1/3 focus:outline-none"
                                                                aria-label="Imagen anterior"
                                                        />
                                                        <button
                                                                type="button"
                                                                onClick={showNext}
                                                                className="absolute right-0 top-0 h-full w-1/3 focus:outline-none"
                                                                aria-label="Imagen siguiente"
                                                        />
                                                </>
                                        )}

                                        {galleryItems.length > 1 && (
                                                <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-4 py-1 text-xs font-medium text-white/90 backdrop-blur">
                                                        {activeIndex + 1} / {galleryItems.length}
                                                </div>
                                        )}
                                </div>

                                {title && (
                                        <footer className="px-6 pt-4 text-center text-sm text-white/80">
                                                {title}
                                        </footer>
                                )}
                        </motion.div>
                </motion.div>
        );
};

export default MobileGalleryModal;
