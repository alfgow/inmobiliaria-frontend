import { useRef } from "react";

import PropertyCarousel, { Property } from "./PropertyCarousel";

const properties: Property[] = [
  {
    id: 1,
    title: "Residencia de lujo",
    price: "$15,000,000 MXN · San Pedro",
    status: "Venta",
    image:
      "https://images.homify.com/v1488473405/p/photo/image/1881231/AP.FACHADAFINAL.jpg",
  },
  {
    id: 2,
    title: "Departamento Minimalista",
    price: "$25,000 MXN/mes · CDMX",
    status: "Renta",
    image: "https://i.pinimg.com/474x/50/b1/c0/50b1c049f56069dc5cef7e0509f90153.jpg",
  },
  {
    id: 3,
    title: "Casa de una planta",
    price: "$3,200,000 MXN · Mérida",
    status: "Venta",
    image:
      "https://www.construyehogar.com/wp-content/uploads/2014/08/Fachada-de-casa-de-una-planta.jpg",
  },
  {
    id: 4,
    title: "Casa Familiar",
    price: "$18,000 MXN/mes · Puebla",
    status: "Renta",
    image:
      "https://e1.pxfuel.com/desktop-wallpaper/621/723/desktop-wallpaper-decoration-nice-house-new-big-houses-with-beautiful-beautiful-house.jpg",
  },
  {
    id: 5,
    title: "Casa Moderna",
    price: "$4,500,000 MXN · Querétaro",
    status: "Venta",
    image:
      "https://images.homify.com/v1484591344/p/photo/image/1777441/El_Molino-Principal_2.jpg",
  },
];

const FeaturedProperties = () => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  return (
    <section id="propiedades" className="bg-[#f1efeb] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--text-dark)]">
          Propiedades Destacadas
        </h2>

        <div className="relative">
          <div className="swiper-container">
            <PropertyCarousel
              properties={properties}
              navigationPrevRef={prevRef}
              navigationNextRef={nextRef}
              paginationRef={paginationRef}
            />
          </div>

          <button
            ref={prevRef}
            className="nav-prev absolute -left-16 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md md:flex"
            aria-label="Ver propiedad anterior"
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
            ref={nextRef}
            className="nav-next absolute -right-16 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--indigo)] shadow-xl transition hover:bg-[var(--lime)] hover:text-black backdrop-blur-md md:flex"
            aria-label="Ver siguiente propiedad"
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

        <div className="mt-8 flex justify-center md:hidden">
          <div ref={paginationRef} className="swiper-pagination !static" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
