"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

type InterestFormProps = {
  propertyTitle?: string | null;
};

type FormDataState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const defaultState: FormDataState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const whatsappNumber = "525585693681";
const localPhoneNumber = "5584438656";

const InterestForm = ({ propertyTitle }: InterestFormProps) => {
  const [formData, setFormData] = useState<FormDataState>(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const hasContactDetails = useMemo(() => {
    const { name, email, phone } = formData;

    return [name, email, phone].every((value) => value.trim().length > 0);
  }, [formData]);

  const handleChange =
    (field: keyof FormDataState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((previous) => ({ ...previous, [field]: event.target.value }));
      setError(null);
      setFeedback(null);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasContactDetails) {
      setError("Completa nombre, correo y telefono para poder contactarte.");
      return;
    }

    setFeedback("Listo. Un asesor se pondra en contacto contigo en breve.");
  };

  const whatsappHref = useMemo(() => {
    const propertyLabel = propertyTitle?.trim() || "esta propiedad";
    const message = encodeURIComponent(`Hola, me interesa ${propertyLabel}. Quiero agendar una visita.`);

    return `https://wa.me/${whatsappNumber}?text=${message}`;
  }, [propertyTitle]);

  return (
    <section className="rounded-3xl border border-[#d9e9dd] bg-white p-6 shadow-sm">
      <header className="mb-5 space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Agenda una visita</h3>
        <p className="text-sm text-gray-600">
          Comparte tus datos y te contactamos para resolver dudas y coordinar cita.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Nombre completo</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange("name")}
            placeholder="Ej. Maria Perez"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Correo electronico</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange("email")}
            placeholder="correo@ejemplo.com"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Telefono</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange("phone")}
            placeholder="55 1234 5678"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Propiedad</span>
          <input
            type="text"
            value={propertyTitle ?? "Sin titulo"}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Mensaje</span>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange("message")}
            rows={3}
            placeholder="Quiero saber disponibilidad y horarios de visita"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {feedback ? <p className="text-sm font-medium text-green-700">{feedback}</p> : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
        >
          Solicitar informacion
        </button>
      </form>

      <div className="mt-5 border-t border-gray-100 pt-5">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-100"
        >
          WhatsApp directo
        </a>
        <p className="mt-3 text-center text-xs text-gray-500">
          Tambien puedes llamar al{" "}
          <a href={`tel:${localPhoneNumber}`} className="font-medium text-gray-600 underline underline-offset-2">
            {localPhoneNumber}
          </a>
        </p>
      </div>
    </section>
  );
};

export default InterestForm;
