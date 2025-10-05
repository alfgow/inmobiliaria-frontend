import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import InmueblesExplorer from "@/components/inmuebles/InmueblesExplorer";

export const metadata: Metadata = {
  title: "Catálogo de inmuebles | Villanueva García",
  description:
    "Explora las propiedades en venta y renta de Villanueva García. Filtra por ciudad, estatus y precio para encontrar tu próximo hogar.",
};

const InmueblesPage = () => {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
      <Navbar />
      <main className="min-h-screen bg-[#f1efeb] pt-28 pb-20">
        <section className="bg-gradient-to-br from-white/60 via-[#f1efeb] to-white/30">
          <div className="mx-auto max-w-4xl px-6 py-12 text-center">
            <h1 className="text-3xl font-bold text-[var(--text-dark)] md:text-4xl">
              Propiedades disponibles
            </h1>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              Descubre residencias exclusivas, departamentos y terrenos cuidadosamente
              seleccionados. Ajusta los filtros para encontrar la propiedad ideal.
            </p>
          </div>
        </section>
        <InmueblesExplorer />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default InmueblesPage;
