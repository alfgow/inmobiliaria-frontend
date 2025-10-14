"use client";

import Script from "next/script";
import { useMemo } from "react";
import { mapPropertiesFromApi, useProperties } from "../FeaturedProperties/useProperties";

export default function DynamicOfferCatalogSchema() {
	const { properties: apiProperties, isLoading, error } = useProperties();
	const properties = useMemo(
		() => mapPropertiesFromApi(apiProperties),
		[apiProperties]
	);

	if (isLoading || error || !properties?.length) return null;

	const offerCatalogSchema = {
		"@context": "https://schema.org",
		"@type": "OfferCatalog",
		name: "Propiedades Destacadas | Inmobiliaria Villanueva García",
		url: "https://villanuevagarcia.com/propiedades",
		description:
			"Catálogo dinámico de propiedades en venta y renta en Ciudad de México y toda la República Mexicana.",
		provider: {
			"@type": "RealEstateAgent",
			name: "Inmobiliaria Villanueva García",
			url: "https://villanuevagarcia.com",
		},
		itemListElement: properties.map((prop, index) => {
			const [city, state] =
				prop.location?.split(",").map((part) => part.trim()) ?? [];
			const isAvailable =
				typeof prop.status === "string"
					? prop.status.toLowerCase().includes("disponible")
					: true;
			const availability = isAvailable
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock";
			const price =
				typeof prop.price === "number" && Number.isFinite(prop.price)
					? prop.price.toString()
					: "0";
			const itemUrl = prop.slug
				? `https://villanuevagarcia.com/inmuebles/${prop.slug}`
				: "https://villanuevagarcia.com/propiedades";

			return {
				"@type": "Offer",
				position: index + 1,
				url: itemUrl,
				price,
				priceCurrency: "MXN",
				availability,
				itemOffered: {
					"@type": "Residence",
					name:
						prop.title ??
						"Propiedad destacada en Villanueva García",
					description: prop.operation
						? `Propiedad disponible para ${prop.operation.toLowerCase()} con Inmobiliaria Villanueva García.`
						: "Propiedad exclusiva en México.",
					image: prop.coverImageUrl,
					address: {
						"@type": "PostalAddress",
						addressLocality: city ?? "Ciudad de México",
						addressCountry: "MX",
						...(state ? { addressRegion: state } : {}),
					},
					...(prop.operation
						? {
								additionalProperty: [
									{
										"@type": "PropertyValue",
										name: "Operación",
										value: prop.operation,
									},
								],
						  }
						: {}),
				},
			};
		}),
	};

	return (
		<Script
			id="dynamic-offer-catalog"
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(offerCatalogSchema),
			}}
		/>
	);
}
