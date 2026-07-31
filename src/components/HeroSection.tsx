"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";

const WHATSAPP_NUMBER = "525584438656";
const WHATSAPP_MESSAGE = encodeURIComponent(
	"Hola, quiero vender o rentar mi propiedad. ¿Me pueden ayudar?"
);
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const HeroSection = () => {
	const parallaxRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const parallax = parallaxRef.current;
		if (!parallax) return;

		let ticking = false;

		const handleScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					const scrolled = window.pageYOffset;
					const rate = scrolled * 0.5;
					parallax.style.transform = `translate3d(0, ${rate}px, 0)`;
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<section
			id="inicio"
			className="relative flex h-screen items-center justify-center overflow-hidden"
		>
			{/* Fondo con parallax extendido */}
			<div
				className="absolute inset-0 overflow-hidden"
				aria-hidden="true"
			>
				<div
					ref={parallaxRef}
					className="relative h-[200vh] w-full"
					style={{ willChange: "transform" }}
				>
					<Image
						src="/1.jpg"
						alt="Fachada de una residencia de lujo"
						fill
						priority={false}
						loading="lazy"
						sizes="100vw"
						className="object-cover"
					/>
				</div>
			</div>
			{/* Overlay degradado extendido */}
			<div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-green-900/20 min-h-screen" />

			{/* Contenido con offset para navbar */}
			<div className="relative z-10 flex h-full w-full max-w-4xl flex-col items-center justify-center px-6 pt-24 text-center text-white md:px-8">
				{/* Logo con animación */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="mb-8"
				>
					<Image
						src="/logo.png"
						alt="Villanueva García - Inmobiliaria de lujo"
						width={120}
						height={120}
						className="h-24 w-auto rounded-full shadow-2xl md:h-32 object-contain"
						loading="lazy"
					/>
				</motion.div>

				{/* Título */}
				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="mb-6 text-3xl font-bold leading-tight tracking-tight drop-shadow-xl sm:text-4xl md:text-5xl lg:text-6xl"
				>
					Renta o vende tu propiedad sin improvisar con tu
					patrimonio.
				</motion.h1>

				{/* Subtítulo */}
				<motion.p
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="mb-10 max-w-2xl text-lg leading-relaxed drop-shadow-md md:text-xl"
				>
					Cada interesado pasa por un proceso claro antes de
					avanzar, para reducir riesgos y evitar pérdidas de
					tiempo.
				</motion.p>

				{/* Botón CTA */}
				<motion.a
					initial={{ opacity: 0, y: 30, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					href={WHATSAPP_HREF}
					target="_blank"
					rel="noopener noreferrer"
					className="group inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-lime-500 px-6 py-4 text-base font-bold text-black shadow-2xl transition-all duration-300 hover:from-green-500 hover:to-lime-600 hover:shadow-green-500/25 focus:outline-none focus:ring-4 focus:ring-green-300 sm:w-auto sm:px-10 sm:text-lg"
					aria-label="Contactar por WhatsApp para vender o rentar mi propiedad"
				>
					<span className="relative z-10">
						Quiero vender o rentar mi propiedad
					</span>
					{/* Ripple effect sutil */}
					<div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
				</motion.a>
			</div>
		</section>
	);
};

export default HeroSection;
