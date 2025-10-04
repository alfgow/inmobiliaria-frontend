"use client";

import { motion } from "framer-motion";

const AboutSection = () => {
	return (
		<section
			id="nosotros"
			aria-labelledby="nosotros-title"
			className="mx-auto relative grid max-w-7xl items-center gap-8 px-4 py-16 md:gap-12 md:px-6 md:py-20 bg-gradient-to-br from-white to-gray-50/50"
		>
			{/* Divisor decorativo opcional */}
			<div className="absolute inset-0 bg-[var(--lime)]/5 rounded-3xl -z-10" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
				className="order-2 md:order-1"
			>
				<h2
					id="nosotros-title"
					className="mb-6 text-2xl font-bold text-[var(--text-dark)] md:text-3xl"
				>
					Quiénes Somos
				</h2>
				<p className="mb-8 text-gray-600 leading-relaxed text-base md:text-lg">
					Inmobiliaria Villanueva García es sinónimo de excelencia y
					confianza. Nuestra misión es brindarte una experiencia única
					al encontrar tu próximo hogar o inversión. Fusionamos
					elegancia, modernidad y total transparencia en cada paso del
					proceso, para que te sientas acompañado desde el primer
					vistazo hasta la firma final.
				</p>
				<motion.a
					href="#contacto"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="inline-block rounded-full bg-[var(--lime)] px-6 py-3 font-bold text-black text-sm md:text-base transition-all duration-300 hover:bg-lime-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--lime)]/50"
				>
					Contáctanos Hoy
				</motion.a>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, x: 20 }}
				whileInView={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
				className="order-1 md:order-2 relative"
			>
				<img
					src="https://i.pinimg.com/originals/46/7f/a5/467fa586c04424698b39fc5a38702055.jpg"
					alt="Equipo de Inmobiliaria Villanueva García trabajando en un ambiente moderno y colaborativo"
					className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-xl ring-1 ring-gray-200/50"
					loading="lazy"
				/>
				{/* Overlay sutil para más profundidad, opcional */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl" />
			</motion.div>
		</section>
	);
};

export default AboutSection;
