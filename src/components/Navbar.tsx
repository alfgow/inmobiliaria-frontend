"use client";

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6 md:px-8">
      <div className="flex w-full max-w-5xl flex-col items-center gap-5">
        <div className="glass-fade-in flex flex-col items-center gap-3 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--indigo)] via-indigo-400 to-cyan-400 shadow-[0_20px_45px_rgba(124,58,237,0.35)] ring-4 ring-white/40">
            <div className="absolute inset-0 rounded-full bg-white/15 blur-2xl" />
            <span className="z-10 text-xl font-semibold uppercase tracking-[0.35em] text-white drop-shadow-xl">VG</span>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.45em] text-[var(--text-dark)]/75">
            Villanueva García
          </p>
        </div>

        <div className="glass-fade-in glow-pulse group relative w-full max-w-3xl transform-gpu overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl">
          <div className="flex items-center justify-between px-6 py-4 md:hidden">
            <span className="text-sm font-semibold tracking-wide text-[var(--text-dark)]/80">Menú</span>
            <button
              type="button"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/40 text-[var(--indigo)] shadow-inner transition duration-300 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo)]/50"
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
          </div>

          <nav
            className={`${
              isMenuOpen ? "flex" : "hidden md:flex"
            } flex-col items-center gap-6 px-6 pb-6 text-sm font-medium text-[var(--text-dark)] transition-all duration-300 md:flex-row md:justify-center md:gap-12 md:pb-4 md:pt-4`}
          >
            {links.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                className="relative rounded-full px-4 py-2 text-[15px] tracking-wide text-[var(--text-dark)] transition-all duration-300 ease-out hover:text-[var(--indigo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo)]/60"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="absolute inset-0 -z-10 rounded-full bg-white/40 opacity-0 transition duration-300 group-hover:opacity-100" />
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
