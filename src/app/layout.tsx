import DynamicOfferCatalogSchema from "@/components/SEO/DynamicOfferCatalogSchema";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://www.villanuevagarcia.com";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Villanueva García Real Estate | Venta y Renta de Propiedades en CDMX y México",
	description:
		"Inmobiliaria Villanueva García ofrece venta y renta de departamentos, casas y propiedades exclusivas en CDMX y toda México. Expertos en bienes raíces de lujo, asesoría inmobiliaria, inversión segura y marketing premium para propiedades residenciales y comerciales.",
	keywords: [
		"inmobiliaria",
		"bienes raíces",
		"venta de casas",
		"renta de departamentos",
		"propiedades en CDMX",
		"real estate México",
		"inversión inmobiliaria",
		"asesoría inmobiliaria",
		"casas en venta",
		"departamentos en renta",
		"propiedades de lujo",
	],
	alternates: { canonical: siteUrl },
	openGraph: {
		type: "website",
		locale: "es_MX",
		url: siteUrl,
		siteName: "Inmobiliaria Villanueva García",
		title: "Villanueva García Real Estate | Venta y Renta de Propiedades en CDMX y México",
		description:
			"Encuentra propiedades exclusivas en venta y renta en CDMX y toda México. Inmobiliaria Villanueva García, expertos en bienes raíces de lujo y asesoría personalizada.",
		images: [
			{
				url: `${siteUrl}/1.jpg`,
				width: 1200,
				height: 630,
				alt: "Inmobiliaria Villanueva García | Real Estate México",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		site: "@villanuevagarcia",
		title: "Villanueva García Real Estate",
		description:
			"Venta y renta de propiedades exclusivas en CDMX y México. Asesoría inmobiliaria de lujo con Villanueva García Real Estate.",
		images: [`${siteUrl}/1.jpg`],
	},
	robots: { index: true, follow: true },
	metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
	themeColor: "#fbbf24",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es" data-scroll-behavior="smooth">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ServiceWorkerRegistrar />
				<DynamicOfferCatalogSchema /> {/* <-- ✅ Agregado aquí */}
				{children}
			</body>
		</html>
	);
}
