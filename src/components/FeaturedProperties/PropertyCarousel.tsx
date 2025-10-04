"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import type { NavigationOptions, PaginationOptions } from "swiper/types";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export interface Property {
  id: string;
  title: string;
  price: number;
  operation?: string | null;
  status?: string | null;
  coverImageUrl: string;
  location?: string | null;
}

interface PropertyCarouselProps {
  properties: Property[];
  navigationPrevRef: RefObject<HTMLButtonElement>;
  navigationNextRef: RefObject<HTMLButtonElement>;
  paginationRef: RefObject<HTMLDivElement>;
}

const PropertyCarousel = ({
  properties,
  navigationPrevRef,
  navigationNextRef,
  paginationRef,
}: PropertyCarouselProps) => {
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const swiper = swiperRef.current;

    if (!swiper) {
      return;
    }

    if (
      swiper.params.navigation &&
      typeof swiper.params.navigation !== "boolean" &&
      navigationPrevRef.current &&
      navigationNextRef.current
    ) {
      swiper.params.navigation = {
        ...(swiper.params.navigation as NavigationOptions),
        prevEl: navigationPrevRef.current,
        nextEl: navigationNextRef.current,
      };

      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }

    if (
      swiper.params.pagination &&
      typeof swiper.params.pagination !== "boolean" &&
      paginationRef.current
    ) {
      swiper.params.pagination = {
        ...(swiper.params.pagination as PaginationOptions),
        el: paginationRef.current,
        clickable: true,
      };

      swiper.pagination.destroy();
      swiper.pagination.init();
      swiper.pagination.render();
      swiper.pagination.update();
    }
  }, [navigationPrevRef, navigationNextRef, paginationRef]);

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      className="swiper mySwiper"
      spaceBetween={30}
      slidesPerView={1}
      loop
      navigation={{
        prevEl: navigationPrevRef.current,
        nextEl: navigationNextRef.current,
      }}
      pagination={{
        el: paginationRef.current,
        clickable: true,
      }}
      breakpoints={{
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      }}
      onBeforeInit={(swiper) => {
        swiperRef.current = swiper;

        if (typeof swiper.params.navigation !== "boolean") {
          swiper.params.navigation.prevEl = navigationPrevRef.current;
          swiper.params.navigation.nextEl = navigationNextRef.current;
        }

        if (typeof swiper.params.pagination !== "boolean") {
          swiper.params.pagination.el = paginationRef.current;
        }
      }}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
    >
      {properties.map((property) => {
        const formattedPrice = Number.isFinite(property.price)
          ? currencyFormatter.format(property.price)
          : "Consultar";

        const statusLabel = property.status ?? property.operation ?? "Disponible";
        const detailsLineItems = [formattedPrice];

        if (property.operation) {
          detailsLineItems.push(property.operation);
        }

        if (property.location) {
          detailsLineItems.push(property.location);
        }

        const detailsLine = detailsLineItems.join(" · ");

        return (
          <SwiperSlide key={property.id} className="swiper-slide">
            <div className="card-3d overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="relative">
                <img
                  src={property.coverImageUrl}
                  alt={property.title}
                  className="h-56 w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-[var(--lime)] px-3 py-1 text-xs font-bold text-black">
                  {statusLabel}
                </span>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-[var(--text-dark)]">
                  {property.title}
                </h3>
                <p className="mb-4 text-gray-600">{detailsLine}</p>
                <a href="#" className="font-medium text-indigo-600 hover:underline">
                  Ver Detalles
                </a>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default PropertyCarousel;
