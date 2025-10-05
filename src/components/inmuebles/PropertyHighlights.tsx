"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Building2, Home, Tag } from "lucide-react";

const highlightVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type Metric = {
  label: string;
  value: string;
};

type PropertyHighlightsProps = {
  price: string;
  operation?: string | null;
  type?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  metrics?: Metric[];
  amenities?: string[];
};

const PropertyHighlights = ({
  price,
  operation,
  type,
  status,
  updatedAt,
  metrics = [],
  amenities = [],
}: PropertyHighlightsProps) => {
  const highlightCards = [
    {
      icon: Tag,
      label: "Precio",
      value: price,
      accent: true,
    },
    {
      icon: Building2,
      label: "Operación",
      value: operation ?? "Sin definir",
    },
    {
      icon: Home,
      label: "Tipo",
      value: type ?? "Sin definir",
    },
    {
      icon: BadgeCheck,
      label: "Estatus",
      value: status ?? "En revisión",
    },
  ];

  const topAmenities = amenities.slice(0, 6);

  return (
    <section className="space-y-10">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlightCards.map(({ icon: Icon, label, value, accent }, index) => (
          <motion.article
            key={label}
            className={`group relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg transition-colors duration-300 backdrop-blur ${
              accent ? "text-[var(--text-dark)]" : "text-gray-700"
            }`}
            variants={highlightVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--indigo)]/12 via-white/30 to-[var(--lime)]/18 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center justify-center rounded-full bg-[var(--indigo)]/10 p-3 text-[var(--indigo)]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.14em] text-gray-500">{label}</p>
                <p className={`text-xl font-semibold md:text-2xl ${accent ? "text-[var(--text-dark)]" : "text-gray-700"}`}>
                  {value}
                </p>
                {label === "Precio" && updatedAt ? (
                  <span className="mt-1 block text-xs font-medium text-gray-500">
                    Actualizado el {updatedAt}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {metrics.length ? (
        <div className="grid gap-4 rounded-3xl border border-white/50 bg-white/70 p-6 shadow-lg backdrop-blur md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="flex flex-col rounded-2xl bg-white/80 px-4 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              variants={highlightVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <span className="text-sm font-medium uppercase tracking-wide text-[var(--indigo)]/70">{metric.label}</span>
              <span className="mt-2 text-2xl font-semibold text-[var(--text-dark)]">{metric.value}</span>
            </motion.div>
          ))}
        </div>
      ) : null}

      {topAmenities.length ? (
        <motion.div
          className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-lg backdrop-blur"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={highlightVariants}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-[var(--text-dark)]">Amenidades destacadas</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topAmenities.map((amenity) => (
              <li
                key={amenity}
                className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-[var(--indigo)]" />
                {amenity}
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}
    </section>
  );
};

export default PropertyHighlights;
