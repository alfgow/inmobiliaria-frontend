import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
        title: "Aviso de Privacidad | Villanueva García",
        description:
                "Consulta nuestro aviso de privacidad y conoce cómo protegemos y utilizamos tus datos personales en Villanueva García.",
};

const PrivacyNoticePage = () => {
        return (
                <div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
                        <header className="fixed left-0 right-0 top-0 z-[1200]">
                                <Navbar />
                        </header>

                        <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-32 md:pb-20">
                                <div className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-200/60 backdrop-blur md:p-10">
                                        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Aviso de Privacidad</p>
                                        <h1 className="mt-3 text-3xl font-bold text-[var(--text-dark)] md:text-4xl">
                                                Protección y uso de tus datos personales
                                        </h1>
                                        <p className="mt-4 text-gray-600">
                                                Grupo Veintiuno Cero Cinco Doce S.A. de C.V., con domicilio en Ejército Nacional 505,
                                                Col. Chapultepec Granada, Alcaldía Miguel Hidalgo, CDMX, es responsable del uso y protección
                                                de tus datos personales.
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">Última fecha de actualización: Septiembre 30, 2025.</p>

                                        <section className="mt-8 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Finalidades del tratamiento</h2>
                                                <p className="text-gray-600">
                                                        Los datos personales que recabamos se utilizarán para las siguientes finalidades:
                                                </p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>Proveer los servicios solicitados.</li>
                                                        <li>
                                                                Realizar investigaciones para emitir la Póliza Jurídica de Arrendamiento Seguro y elaborar contratos de arrendamiento.
                                                        </li>
                                                        <li>Confirmar datos y resolver dudas sobre productos y servicios contratados.</li>
                                                        <li>Informar sobre cambios o nuevos productos o servicios desarrollados por la empresa.</li>
                                                        <li>Dar cumplimiento a obligaciones contraídas con nuestros clientes.</li>
                                                        <li>Evaluar la calidad del producto y del servicio contratado.</li>
                                                        <li>Realizar estudios internos sobre hábitos de consumo.</li>
                                                        <li>Informar sobre beneficios a clientes a través de promociones.</li>
                                                </ul>
                                                <p className="text-gray-600">
                                                        Si no deseas que tus datos personales sean tratados para estas finalidades, envía un correo a
                                                        <Link href="mailto:polizas@arrendamientoseguro.app" className="ml-1 font-semibold text-green-700 underline">
                                                                polizas@arrendamientoseguro.app
                                                        </Link>
                                                        . La negativa podría impedir la prestación de nuestros servicios, ya que dichos datos son esenciales.
                                                </p>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Canales de obtención</h2>
                                                <p className="text-gray-600">Los datos personales pueden recabarse a través de:</p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>La contratación directa de un servicio.</li>
                                                        <li>Solicitudes de arrendamiento en cualquiera de sus modalidades.</li>
                                                        <li>La visita a nuestra aplicación web arrendamientoseguro.app o el uso de nuestros servicios en línea.</li>
                                                        <li>Medios electrónicos utilizados para felicitaciones, observaciones, sugerencias o quejas.</li>
                                                        <li>Llamadas a nuestros números telefónicos para cualquier finalidad relacionada con los servicios.</li>
                                                </ul>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">¿Quién obtiene tus datos?</h2>
                                                <p className="text-gray-600">
                                                        Nuestro personal autorizado, incluyendo dirección, gerencia y el ejecutivo de arrendamiento seguro asignado a tu proceso.
                                                </p>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Datos personales recabados</h2>
                                                <p className="text-gray-600">Podemos solicitar, entre otros, los siguientes datos personales:</p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>Nombre completo.</li>
                                                        <li>Fotografía selfie individual para validación de identidad.</li>
                                                        <li>Dirección actual completa.</li>
                                                        <li>Datos de contacto telefónico.</li>
                                                        <li>Datos de contacto electrónico (redes sociales, correos electrónicos, etc.).</li>
                                                        <li>Registro Federal de Contribuyentes (RFC).</li>
                                                        <li>Fecha de nacimiento.</li>
                                                        <li>Datos de actividad económica: nombre, dirección, teléfonos, correos y sitios web de la empresa.</li>
                                                        <li>Sueldos, salarios, honorarios y pagos derivados de actividad económica lícita.</li>
                                                        <li>Recibos de nómina o estados de cuenta bancarios completos para validar ingresos y legitimidad.</li>
                                                </ul>
                                                <p className="text-gray-600">
                                                        Para cumplir con las finalidades descritas, trataremos estos datos como datos personales sensibles. Serán resguardados con
                                                        medidas de seguridad que garanticen su confidencialidad conforme al artículo 9 de la ley. Tu consentimiento expreso será
                                                        solicitado al contratar un servicio o utilizar nuestros canales de comunicación.
                                                </p>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Limitación de uso o divulgación</h2>
                                                <p className="text-gray-600">
                                                        Puedes solicitar dejar de recibir información mediante llamada telefónica, correo electrónico o directamente con la persona
                                                        responsable de privacidad de datos.
                                                </p>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Derechos ARCO</h2>
                                                <p className="text-gray-600">
                                                        Tienes derecho al acceso, rectificación, cancelación y oposición (ARCO) de tus datos personales, así como a revocar el
                                                        consentimiento otorgado. También puedes rectificarlos si son inexactos o incompletos, cancelarlos cuando no sean necesarios
                                                        para las finalidades señaladas o cuando desees oponerte a usos específicos.
                                                </p>
                                                <p className="text-gray-600">Presenta tu solicitud a través de los siguientes medios:</p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>
                                                                Correo electrónico:
                                                                <Link href="mailto:polizas@arrendamientoseguro.app" className="ml-1 font-semibold text-green-700 underline">
                                                                        polizas@arrendamientoseguro.app
                                                                </Link>
                                                                .
                                                        </li>
                                                        <li>De forma presencial en Ejército Nacional 505, Col. Chapultepec Granada, Alcaldía Miguel Hidalgo, CDMX. Tel. 67188645.</li>
                                                </ul>
                                                <p className="text-gray-600">El plazo de respuesta es de 5 días hábiles a partir de la recepción de la solicitud.</p>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Transferencia de datos</h2>
                                                <p className="text-gray-600">
                                                        No transferiremos tus datos personales a terceros sin tu consentimiento por escrito, salvo las excepciones previstas en el
                                                        artículo 37 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Dichas transferencias pueden
                                                        realizarse cuando:
                                                </p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>Lo requiera una ley o tratado en el que México sea parte.</li>
                                                        <li>Sea necesario para prevención o diagnóstico médico, asistencia sanitaria o gestión de servicios de salud.</li>
                                                        <li>Se efectúe a sociedades controladoras, subsidiarias o afiliadas bajo control común, o a cualquier sociedad del mismo grupo con procesos y políticas similares.</li>
                                                        <li>Sea necesaria por virtud de un contrato en interés del titular entre el responsable y un tercero.</li>
                                                        <li>Sea legalmente exigida para salvaguardar el interés público o para la procuración o administración de justicia.</li>
                                                        <li>Sea precisa para el reconocimiento, ejercicio o defensa de un derecho en un proceso judicial.</li>
                                                        <li>Sea precisa para mantener o cumplir una relación jurídica entre el responsable y el titular.</li>
                                                </ul>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Modificaciones al aviso</h2>
                                                <p className="text-gray-600">
                                                        Podemos modificar o actualizar este aviso de privacidad para atender cambios legislativos, políticas internas o nuevos
                                                        requerimientos. Las modificaciones estarán disponibles a través de:
                                                </p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>Anuncio visible en nuestra oficina.</li>
                                                        <li>Nuestra app web, en la sección “Aviso de Privacidad”.</li>
                                                </ul>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Quejas y denuncias</h2>
                                                <p className="text-gray-600">
                                                        Si consideras que tu derecho de protección de datos personales ha sido vulnerado por nuestras actuaciones, puedes presentar una
                                                        queja ante el IFAI. Para mayor información visita
                                                        <Link
                                                                href="https://www.ifai.org.mx"
                                                                className="ml-1 font-semibold text-green-700 underline"
                                                                target="_blank"
                                                                rel="noreferrer"
                                                        >
                                                                www.ifai.org.mx
                                                        </Link>
                                                        .
                                                </p>
                                        </section>
                                </div>
                        </main>

                        <Footer />
                </div>
        );
};

export default PrivacyNoticePage;
