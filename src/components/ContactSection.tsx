const ContactSection = () => {
  return (
    <section id="contacto" className="bg-[var(--bg-base)] py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--text-dark)]">Contáctanos</h2>
        <div className="rounded-2xl border border-white/20 bg-gray-900/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-12">
          <form className="grid grid-cols-1 gap-6">
            <input
              type="text"
              placeholder="Nombre completo"
              className="rounded-full border border-gray-300 bg-white px-6 py-3 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--lime)]"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="rounded-full border border-gray-300 bg-white px-6 py-3 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--lime)]"
            />
            <textarea
              placeholder="Tu mensaje"
              rows={5}
              className="rounded-[20px] border border-gray-300 bg-white px-6 py-3 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--lime)]"
            />
            <button
              type="submit"
              className="rounded-full bg-[var(--lime)] py-3 font-bold text-black shadow-[inset_0_-3px_8px_rgba(0,0,0,0.25),0_6px_16px_rgba(0,0,0,0.3)] transition hover:shadow-[inset_0_-4px_12px_rgba(0,0,0,0.35),0_8px_20px_rgba(0,0,0,0.4)]"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
