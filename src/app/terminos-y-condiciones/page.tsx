import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
        title: "Términos y Condiciones | Villanueva García",
        description:
                "Consulta los términos y condiciones de nuestros servicios de arrendamiento y pólizas jurídicas en Villanueva García.",
};

const TermsPage = () => {
        return (
                <div className="bg-[var(--bg-base)] text-[var(--text-dark)]">
                        <header className="fixed left-0 right-0 top-0 z-[1200]">
                                <Navbar />
                        </header>

                        <main className="mx-auto max-w-5xl px-6 pt-24 pb-16 md:pt-32 md:pb-20">
                                <div className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-200/60 backdrop-blur md:p-10">
                                        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Términos y Condiciones</p>
                                        <h1 className="mt-3 text-3xl font-bold text-[var(--text-dark)] md:text-4xl">
                                                Alcance y condiciones del servicio
                                        </h1>
                                        <p className="mt-4 text-gray-600">
                                                Grupo Veintiuno Cero Cinco Doce S.A. de C.V., con domicilio en Ejército Nacional 505, Col. Chapultepec Granada, Alcaldía
                                                Miguel Hidalgo, CDMX, le notifica atentamente los presentes términos y condiciones del servicio.
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">Última fecha de actualización: Septiembre 30, 2025.</p>

                                        <section className="mt-8 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Alcance de nuestros servicios</h2>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>Proveer los servicios solicitados por usted, su prospecto de inquilino o su asesor inmobiliario.</li>
                                                        <li>Realizar las investigaciones de prospectos de inquilinos para elaborar contratos de arrendamiento y emitir la cobertura jurídica correspondiente.</li>
                                                        <li>Elaborar reportes de perfiles de prospectos de inquilinos con fines de contratación y emisión de cobertura jurídica.</li>
                                                        <li>Elaborar contratos de arrendamiento y emitir la póliza de cobertura jurídica contratada.</li>
                                                        <li>Confirmar datos y resolver dudas sobre los productos y servicios contratados.</li>
                                                        <li>Informar sobre cambios o nuevos productos o servicios desarrollados por la empresa.</li>
                                                        <li>Dar cumplimiento a todas las obligaciones contraídas con nuestros clientes, según lo indicado en el clausulado de la póliza jurídica solicitada.</li>
                                                </ul>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Casos y supuestos</h2>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>En todos nuestros servicios se solicitará, sin excepción, un anticipo equivalente al 50% del costo del servicio requerido para iniciar los procesos necesarios.</li>
                                                        <li>
                                                                En caso de rechazo de perfil por no cumplir con los ingresos requeridos, tener demandas de arrendamiento o demandas patrimoniales, se realizará un cobro de $500.00 MXN por cada persona investigada. El remanente del anticipo será reembolsado a la cuenta indicada por el usuario.
                                                        </li>
                                                        <li>En caso de rechazo de perfil por documentación apócrifa, datos falsos o suplantación de identidad, la empresa se reserva el derecho de no reembolsar el anticipo depositado.</li>
                                                        <li>
                                                                Para emisiones de coberturas jurídicas, los tiempos compromiso de respuesta serán:
                                                                <ul className="mt-2 list-disc space-y-1 pl-6">
                                                                        <li>Póliza clásica: de 2 a 3 días hábiles.</li>
                                                                        <li>Póliza plus: de 3 a 5 días hábiles.</li>
                                                                        <li>Los tiempos corren a partir de contar con toda la documentación requerida y el anticipo del 50% del costo del servicio.</li>
                                                                </ul>
                                                        </li>
                                                        <li>Una vez iniciado el proceso de emisión de póliza jurídica, si el cliente se desiste del proceso en cualquier fase, no se realizará ningún reembolso del anticipo depositado, ya que se considerará como honorarios del personal.</li>
                                                </ul>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Funcionarios autorizados</h2>
                                                <p className="text-gray-600">Están facultados para autorizar una póliza jurídica emitida por nuestra empresa:</p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>Alfonso Villanueva Quiroz (director y fundador).</li>
                                                        <li>Diana Berenice García Valencia (gerente y fundador).</li>
                                                </ul>
                                        </section>

                                        <section className="mt-10 space-y-4">
                                                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">Atención y contacto</h2>
                                                <p className="text-gray-600">Para dudas y comentarios, ponemos a su disposición los siguientes medios de contacto:</p>
                                                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                                                        <li>Correo electrónico: polizas@arrendamientoseguro.app</li>
                                                        <li>Teléfono de oficina: 67188645</li>
                                                        <li>Teléfono celular: 5587929965</li>
                                                        <li>Domicilio: Ejército Nacional 505, Col. Chapultepec Granada, Alcaldía Miguel Hidalgo, CDMX (con previa cita).</li>
                                                </ul>
                                                <p className="text-gray-600">Quedamos suscritos a sus dudas y comentarios.</p>
                                        </section>
                                </div>
                        </main>

                        <Footer />
                </div>
        );
};

export default TermsPage;
