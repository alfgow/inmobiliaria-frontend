import Link from "next/link";

const Footer = () => {
        return (
                <footer className="bg-gray-900 py-10 text-center text-gray-400">
                        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6">
                                <p className="text-sm">&copy; 2025 Inmobiliaria Villanueva García · Todos los derechos reservados</p>

                                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                                        <Link href="/aviso-de-privacidad" className="text-gray-300 transition hover:text-white">
                                                Aviso de Privacidad
                                        </Link>
                                        <span className="hidden h-4 w-px bg-gray-700 sm:inline-block" aria-hidden="true"></span>
                                        <Link href="/terminos-y-condiciones" className="text-gray-300 transition hover:text-white">
                                                Términos y Condiciones
                                        </Link>
                                </div>

                                <p className="text-sm">
                                        Desarrollado y diseñado por{" "}
                                        <a
                                                href="https://alfgow.app"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-200 transition hover:text-white"
                                        >
                                                alfgow
                                        </a>
                                </p>
                        </div>
                </footer>
        );
};

export default Footer;
