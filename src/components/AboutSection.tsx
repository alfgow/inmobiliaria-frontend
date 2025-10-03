const AboutSection = () => {
  return (
    <section
      id="nosotros"
      className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2"
    >
      <div>
        <h2 className="mb-6 text-3xl font-bold text-[var(--text-dark)]">Quiénes Somos</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Inmobiliaria Villanueva García es sinónimo de excelencia. Nuestra misión es brindarte una experiencia única al
          encontrar tu próximo hogar. Fusionamos elegancia, modernidad y transparencia en cada proceso.
        </p>
        <a
          href="#contacto"
          className="rounded-full bg-[var(--lime)] px-6 py-3 font-bold text-black transition hover:bg-lime-300"
        >
          Contáctanos
        </a>
      </div>
      <img
        src="https://i.pinimg.com/originals/46/7f/a5/467fa586c04424698b39fc5a38702055.jpg"
        alt="Equipo de Inmobiliaria Villanueva García"
        className="rounded-xl shadow-lg"
      />
    </section>
  );
};

export default AboutSection;
