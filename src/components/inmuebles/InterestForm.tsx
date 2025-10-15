"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PhoneCall, Send } from "lucide-react";

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

const phoneNumber = "5584438656";

const InterestForm = ({ propertyTitle }: InterestFormProps) => {
  const [formData, setFormData] = useState<FormDataState>(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const hasContactDetails = useMemo(() => {
    const { name, email, phone } = formData;

    return [name, email, phone].every((value) => value.trim().length > 0);
  }, [formData]);

  const handleChange = (field: keyof FormDataState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
    setFeedback(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasContactDetails) {
      setError("Completa tu nombre, correo y teléfono para que nuestro equipo pueda contactarte.");
      return;
    }

    setFeedback("¡Gracias! Hemos recibido tu interés. Muy pronto un asesor se pondrá en contacto contigo.");
  };

  const handleCallClick = () => {
    if (!hasContactDetails) {
      setError("Por favor comparte tu nombre, correo y teléfono antes de llamar. Así podremos brindarte un mejor seguimiento.");
      return;
    }

    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <motion.section
      className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <header className="space-y-2">
        <h3 className="text-2xl font-semibold text-[var(--text-dark)]">¿Te interesa esta propiedad?</h3>
        <p className="text-sm text-gray-600">
          Déjanos tus datos y un asesor de Villanueva García te contactará para brindarte asesoría personalizada.
        </p>
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-dark)]">
            Nombre completo
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange("name")}
              className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/20"
              placeholder="¿Cómo te llamas?"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-dark)]">
            Correo electrónico
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange("email")}
              className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/20"
              placeholder="correo@ejemplo.com"
              required
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-dark)]">
            Teléfono
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange("phone")}
              className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/20"
              placeholder="10 dígitos"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-dark)]">
            Propiedad de interés
            <input
              type="text"
              name="property"
              value={propertyTitle ?? ""}
              readOnly
              className="cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 shadow-inner"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-dark)]">
          Mensaje
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange("message")}
            rows={4}
            className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/20"
            placeholder="Cuéntanos qué te gustaría saber"
          />
        </label>

        {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
        {feedback ? <p className="text-sm font-medium text-emerald-600">{feedback}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--indigo)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]/30"
          >
            <Send className="h-4 w-4" />
            Enviar interés
          </button>
          <button
            type="button"
            onClick={handleCallClick}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--indigo)]/60 bg-white px-6 py-3 text-sm font-semibold text-[var(--indigo)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]/20"
          >
            <PhoneCall className="h-4 w-4" />
            Llamar a la inmobiliaria
          </button>
        </div>
      </form>
    </motion.section>
  );
};

export default InterestForm;
