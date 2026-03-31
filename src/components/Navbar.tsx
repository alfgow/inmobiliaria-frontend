"use client";

import { Menu, Phone, X } from "lucide-react"; // Asume que instalas lucide-react para íconos
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
	{ href: "/", label: "Inicio" },
	{ href: "/inmuebles", label: "Inmuebles" },
	{ href: "/mapa", label: "Mapa" },
	{ href: "/#nosotros", label: "Nosotros" },
];

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();

	const toggleMenu = () => setIsMenuOpen((prev) => !prev);
	const closeMenu = () => setIsMenuOpen(false);

	useEffect(() => {
		closeMenu();
	}, [pathname]);

	useEffect(() => {
		if (!isMenuOpen) {
			document.body.style.overflow = "";
			return;
		}

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = "";
		};
	}, [isMenuOpen]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) {
				closeMenu();
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

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
						aria-controls="mobile-navigation"
						className="relative z-[1300] flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 shadow transition hover:bg-green-50 md:hidden"
					>
						{isMenuOpen ? (
							<X size={20} className="text-gray-800" />
						) : (
							<Menu size={20} className="text-gray-800" />
						)}
					</button>
				</div>
			</header>

			{/* Menú Mobile */}
			<nav
				id="mobile-navigation"
				className={`fixed inset-x-0 top-[81px] z-[1200] mx-4 origin-top rounded-3xl border border-white/70 bg-white/95 shadow-2xl backdrop-blur-lg transition duration-200 ease-out md:hidden ${
					isMenuOpen
						? "pointer-events-auto translate-y-0 scale-100 opacity-100"
						: "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
				}`}
			>
				<div className="flex items-center justify-between border-b border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-800">
						Menú
					</h2>
					<button
						type="button"
						onClick={closeMenu}
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
			<div
				className={`fixed inset-0 z-[1150] bg-black/50 transition-opacity duration-200 md:hidden ${
					isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
				}`}
				onClick={closeMenu}
				aria-hidden="true"
			/>
		</>
	);
};

export default Navbar;
