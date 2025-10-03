const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold tracking-wide text-[var(--text-dark)]">
          Villanueva García
        </div>
        <nav className="hidden space-x-8 font-medium md:flex">
          <a href="#" className="transition hover:text-[var(--indigo)]">
            Inicio
          </a>
          <a href="#propiedades" className="transition hover:text-[var(--indigo)]">
            Propiedades
          </a>
          <a href="#nosotros" className="transition hover:text-[var(--indigo)]">
            Nosotros
          </a>
          <a href="#contacto" className="transition hover:text-[var(--indigo)]">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
