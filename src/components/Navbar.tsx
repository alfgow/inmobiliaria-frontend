"use client";

import { Menu, Phone, X } from "lucide-react"; // Asume que instalas lucide-react para íconos
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
	{ href: "/", label: "Inicio" },
	{ href: "/inmuebles", label: "Inmuebles" },
	{ href: "/mapa", label: "Mapa" },
	{ href: "/#nosotros", label: "Nosotros" },
];

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => setIsMenuOpen((prev) => !prev);
	const closeMenu = () => setIsMenuOpen(false);

	return (
		<>
                        <header className="fixed inset-x-0 top-0 z-[1100] border-b border-white/20 bg-gradient-to-r from-green-50/80 via-white/60 to-green-50/80 backdrop-blur-xl shadow-lg">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center gap-3"
						onClick={closeMenu}
					>
						<div className="relative h-12 w-12 overflow-hidden rounded-full shadow-lg">
							<Image
								src="/logo.png"
								alt="Villanueva García"
								fill
								sizes="48px"
								className="object-contain"
								loading="lazy"
							/>
						</div>
					</Link>

					{/* Links Desktop */}
					<nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
						{links.map(({ href, label }) => (
							<Link
								key={label}
								href={href}
								className="relative flex items-center px-3 py-2 transition-colors duration-200 hover:text-green-600"
								onClick={closeMenu}
							>
								{label}

								<span className="absolute left-0 bottom-0 h-0.5 w-0 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
							</Link>
						))}
					</nav>

					{/* Acciones Desktop: Búsqueda, Teléfono, CTA */}
					<div className="hidden md:flex items-center gap-4">
						<a
							href="tel:+525584438656"
							className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition text-sm"
						>
							<Phone size={16} />
							Llamar
						</a>
						<Link
							href="#contacto"
							className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-md"
						>
							Contactar
						</Link>
					</div>

					{/* Botón hamburguesa */}
					<button
						type="button"
						onClick={toggleMenu}
						aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
						aria-expanded={isMenuOpen}
						className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow hover:bg-green-50 transition"
					>
						{isMenuOpen ? (
							<X size={20} className="text-gray-800" />
						) : (
							<Menu size={20} className="text-gray-800" />
						)}
					</button>
				</div>
			</header>

			{/* Menú Mobile (Drawer lateral) */}
                        <nav
                                className={`fixed inset-y-0 right-0 z-[1200] w-80 bg-white/95 backdrop-blur-lg shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
					isMenuOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-800">
						Menú
					</h2>
					<button
						onClick={toggleMenu}
						className="p-2"
						aria-label="Cerrar menú"
					>
						<X size={24} className="text-gray-600" />
					</button>
				</div>
				<div className="flex flex-col gap-4 p-6 pt-4 text-sm font-medium">
					{links.map(({ href, label }) => (
						<Link
							key={label}
							href={href}
							onClick={closeMenu}
							className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-green-50 hover:text-green-600 transition"
						>
							<span>{label}</span>
						</Link>
					))}
					<a
						href="tel:+525584438656"
						className="flex items-center gap-2 rounded-lg px-4 py-3 hover:bg-green-50 text-green-600 transition mt-2"
					>
						<Phone size={20} />
						Llamar ahora
					</a>
					<Link
						href="#contacto"
						onClick={closeMenu}
						className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition text-center mt-2"
					>
						Contactar
					</Link>
				</div>
			</nav>

			{/* Overlay para mobile */}
			{isMenuOpen && (
                                <div
                                        className="fixed inset-0 z-[1150] bg-black/50 md:hidden"
					onClick={toggleMenu}
				/>
			)}
		</>
	);
};

export default Navbar;
