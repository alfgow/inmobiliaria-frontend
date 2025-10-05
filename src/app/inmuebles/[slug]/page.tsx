import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { getPropertyBySlug } from "@/lib/properties";

export const revalidate = 60;

type PropertyPageProps = {
  params: {
    slug: string;
  };
};

const buildOpenGraphImages = (property: any) => {
  return (property?.imagenes ?? [])
    .map((image: any) => {
      const imageMetadata = (image.metadata ?? {}) as { alt?: string };
      const url = image.url ?? image.path;

      if (!url) {
        return null;
      }

      return {
        url,
        alt: imageMetadata?.alt ?? property?.titulo ?? "Imagen del inmueble",
      };
    })
    .filter((image: { url: string } | null): image is { url: string; alt?: string } => Boolean(image));
};

export async function generateStaticParams() {
  const properties = await prisma.inmueble.findMany({
    select: { slug: true },
    where: { slug: { not: null } } as any,
  } as any);

  return (properties ?? [])
    .map((property: any) => property?.slug)
    .filter((slug: string | null | undefined): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const property = await getPropertyBySlug({ slug: params.slug });

  if (!property) {
    return {
      title: "Inmueble no encontrado | Villanueva García",
      description: "La propiedad solicitada no existe o ha sido deshabilitada.",
    };
  }

  const locationSegments = [property.colonia, property.municipio, property.estado].filter(Boolean);
  const locationLabel = locationSegments.join(", ");
  const baseTitle = property.titulo ?? "Detalle de inmueble";
  const title = `${baseTitle} | Villanueva García`;
  const description =
    property.descripcion ??
    `Conoce los detalles de ${baseTitle}${locationLabel ? ` ubicada en ${locationLabel}` : ""}.`;

  const images = buildOpenGraphImages(property);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://villanuevagarcia.mx/inmuebles/${params.slug}`,
      images,
    },
  };
}

const PropertyPage = async ({ params }: PropertyPageProps) => {
  const property = await getPropertyBySlug({ slug: params.slug });

  if (!property) {
    notFound();
  }

  const coverImage = property.imagenes?.[0]?.url ?? property.imagenes?.[0]?.path ?? null;
  const statusName = property.estatus?.nombre ?? "Sin estatus";

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
      <Navbar />
      <main className="min-h-screen bg-[#f1efeb] pt-20 pb-16 md:pt-28 md:pb-20">
        <section className="mx-auto max-w-5xl rounded-lg bg-white px-6 py-10 shadow-sm">
          <div className="space-y-8">
            <header>
              <span className="inline-flex items-center rounded-full bg-[var(--accent-light)] px-4 py-1 text-sm font-semibold text-[var(--accent-dark)]">
                {statusName}
              </span>
              <h1 className="mt-4 text-3xl font-bold text-[var(--text-dark)] md:text-4xl">
                {property.titulo}
              </h1>
              <p className="mt-2 text-base text-gray-600">{property.direccion}</p>
            </header>

            {coverImage ? (
              <div className="overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={coverImage}
                  alt={property.titulo ?? "Imagen del inmueble"}
                  className="h-64 w-full object-cover md:h-96"
                />
              </div>
            ) : null}

            {property.descripcion ? (
              <article className="space-y-4 text-lg leading-relaxed text-gray-700">
                {property.descripcion.split("\n").map((paragraph: string, index: number) => (
                  <p key={`paragraph-${index}`}>{paragraph}</p>
                ))}
              </article>
            ) : null}

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-dark)]">Detalles generales</h2>
                <ul className="mt-3 space-y-2 text-gray-700">
                  <li>
                    <strong>Operación:</strong> {property.operacion ?? "Sin especificar"}
                  </li>
                  <li>
                    <strong>Tipo:</strong> {property.tipo ?? "Sin especificar"}
                  </li>
                  <li>
                    <strong>Precio:</strong> {property.precio ? `$${property.precio}` : "No disponible"}
                  </li>
                  <li>
                    <strong>Actualización:</strong> {property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : "No disponible"}
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-dark)]">Ubicación</h2>
                <ul className="mt-3 space-y-2 text-gray-700">
                  <li>
                    <strong>Colonia:</strong> {property.colonia ?? "No especificada"}
                  </li>
                  <li>
                    <strong>Municipio:</strong> {property.municipio ?? "No especificado"}
                  </li>
                  <li>
                    <strong>Estado:</strong> {property.estado ?? "No especificado"}
                  </li>
                  <li>
                    <strong>Código postal:</strong> {property.codigoPostal ?? "No especificado"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <div className="mt-12">
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyPage;
