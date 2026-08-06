"use client";

import { useMemo } from "react";

type InterestFormProps = {
  propertyUrl: string;
};

const whatsappNumber = "525644136105";

const InterestForm = ({ propertyUrl }: InterestFormProps) => {
  const whatsappHref = useMemo(() => {
    const message = encodeURIComponent(
      `Hola, vi este inmueble ${propertyUrl} y quisiera recibir información.`,
    );

    return `https://wa.me/${whatsappNumber}?text=${message}`;
  }, [propertyUrl]);

  return (
    <section className="rounded-3xl border border-[#d9e9dd] bg-white p-6 shadow-sm">
      <header className="mb-5 space-y-2">
        <h3 className="text-xl font-bold text-gray-900">Agenda una visita</h3>
        <p className="text-sm text-gray-600">
          Escríbenos por WhatsApp y te respondemos directamente.
        </p>
      </header>

      <div className="space-y-4">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
        >
          WhatsApp directo
        </a>
        <p className="text-center text-xs text-gray-500">
          También puedes hablar al número{" "}
          <a href="tel:+525584438656" className="font-semibold text-gray-700 underline underline-offset-2">
            5584438656
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default InterestForm;
