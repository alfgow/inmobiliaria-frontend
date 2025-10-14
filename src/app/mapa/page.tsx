import type { Metadata } from "next";

import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import AdminPropertiesMapClient from "./AdminPropertiesMapClient";

export const metadata: Metadata = {
	title: "Mapa de propiedades | Villanueva García",
	description:
		"Visualiza en un mapa interactivo todas las propiedades disponibles de Villanueva García y conoce su disponibilidad en tiempo real.",
};

const PropertiesMapPage = () => {
	return (
		<div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
                        <header className="fixed left-0 right-0 top-0 z-[1200]">
				<Navbar />
			</header>
			<main className="min-h-screen pt-20 pb-16 md:pt-28 md:pb-20">
				<section className="bg-gradient-to-br from-white/60 via-[#f1efeb] to-white/30">
					<div className="mx-auto max-w-4xl px-6 py-8 text-center md:py-12">
						<h1 className="text-3xl font-bold text-[var(--text-dark)] md:text-4xl">
							Mapa de propiedades
						</h1>
						<p className="mt-4 text-base text-gray-600 md:text-lg">
							Explora la ubicación de cada inmueble y visualiza al
							instante cuáles se encuentran disponibles o
							reservados.
						</p>
					</div>
				</section>
				<AdminPropertiesMapClient />
				<ContactSection />
			</main>
			<Footer />
		</div>
	);
};

export default PropertiesMapPage;
