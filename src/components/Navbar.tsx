"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#", label: "Inicio" },
  { href: "#propiedades", label: "Propiedades" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="#" className="flex items-center gap-3" onClick={closeMenu}>
          <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-black/10">
            <Image
              src="/logo.png"
              alt="Villanueva García"
              fill
              className="object-cover"
              sizes="48px"
              priority
            />
          </span>
          <div className="flex flex-col text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-dark)]">
            <span>Villanueva</span>
            <span>García</span>
          </div>
        </Link>

        <button
          type="button"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--indigo)]/20 bg-white text-[var(--text-dark)] shadow-md transition hover:bg-[var(--indigo)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo)] md:hidden"
        >
          <span className="relative block h-5 w-6">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-full bg-current transition-transform duration-300 ${
                isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-0.5 w-full bg-current transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 bottom-0 block h-0.5 w-full bg-current transition-transform duration-300 ${
                isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        <nav className="hidden items-center gap-10 text-sm font-medium text-[var(--text-dark)] md:flex">
          {links.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="relative px-3 py-2 transition-colors duration-200 hover:text-[var(--indigo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo)]/60"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <nav
        className={`md:hidden ${
          isMenuOpen ? "max-h-96 border-t border-white/50" : "max-h-0"
        } overflow-hidden bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col gap-2 px-6 py-4 text-sm font-medium text-[var(--text-dark)]">
          {links.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              onClick={closeMenu}
              className="rounded-full px-4 py-2 transition-colors duration-200 hover:bg-[var(--indigo)]/10 hover:text-[var(--indigo)]"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
