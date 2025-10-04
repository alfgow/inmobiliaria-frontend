const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="hero-parallax relative flex h-screen items-center justify-center overflow-hidden pt-24"
      style={{
        backgroundImage:
          "url('https://hips.hearstapps.com/hmg-prod/images/interior-apartamentos-quay-nueva-york-torre-lujo7-1564380044.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col items-center justify-center px-6 text-center text-white md:px-8">
        <img
          src="/logo.png"
          alt="Nombre inmobiliaria"
          className="mb-6 h-20 w-auto md:h-24"
        />
        <h1 className="mb-6 text-5xl font-bold drop-shadow-lg md:text-6xl">
          Vive el lujo que mereces
        </h1>
        <p className="mb-8 text-lg md:text-xl">
          Departamentos y residencias exclusivas en las mejores ubicaciones.
        </p>
        <a
          href="#propiedades"
          className="rounded-full bg-[var(--lime)] px-8 py-3 text-lg font-bold text-black shadow-lg transition hover:bg-lime-300"
        >
          Explorar propiedades
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
