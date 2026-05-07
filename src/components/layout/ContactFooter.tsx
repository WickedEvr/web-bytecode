import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { WhatsAppIcon } from '../icons/SocialIcons';

const ContactFooter: React.FC = () => {
    return (
        <footer className="relative w-full mt-auto bg-transparent border-white/10 font-sansation">
            {/* Línea Separadora */}
            <div className="border-t border-white mb-8 md:mb-1 w-[86.6%] mx-auto" />

            <div className="relative mx-auto w-full max-w-[1700px] px-6 md:px-12 pt-0 pb-8 md:py-8" style={{ zIndex: 1 }}>
                {/* Contenedor inferior */}
                <div className="flex flex-col gap-8 lg:gap-9">
                    {/* --- FILA 1: Contacto --- */}
                    <div className="flex flex-col lg:flex-row lg:flex-wrap 2xl:flex-nowrap items-center lg:justify-center 2xl:justify-between w-full gap-5 lg:gap-x-10 lg:gap-y-6 2xl:gap-6 text-white font-normal text-base md:text-lg">
                        <div className="flex flex-col lg:flex-row lg:flex-wrap 2xl:flex-nowrap items-center justify-center gap-5 lg:gap-x-10 lg:gap-y-6 xl:gap-27 2xl:gap-29">
                            <span className="font-semibold text-xl md:text-2xl whitespace-nowrap">
                                Contáctanos
                            </span>

                            {/* WhatsApp 1 */}
                            <a
                                href="https://wa.me/51936281137?text=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 group outline-none"
                            >
                                <WhatsAppIcon className="text-[#06CFD6] transition-transform duration-300 shrink-0 lg:group-hover:scale-110" size={22} />
                                <span className="text-gray-300 transition-colors duration-300 whitespace-nowrap lg:group-hover:text-white" aria-label="WhatsApp">
                                    (+51) 936 281 137
                                </span>
                            </a>

                            {/* WhatsApp 2 */}
                            <a
                                href="https://wa.me/51970199434?text=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 group outline-none"
                            >
                                <WhatsAppIcon className="text-[#06CFD6] transition-transform duration-300 shrink-0 lg:group-hover:scale-110" size={22} />
                                <span className="text-gray-300 transition-colors duration-300 whitespace-nowrap lg:group-hover:text-white" aria-label="WhatsApp">
                                    (+51) 970 199 434
                                </span>
                            </a>

                            {/* Correo */}
                            <a
                                href="mailto:contacto@bytecode.com.pe?subject=Cotizaci%C3%B3n%20de%20desarrollo%20de%20software&body=%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software."
                                className="flex items-center gap-3 group outline-none"
                            >
                                <Mail className="text-[#06CFD6] transition-transform duration-300 shrink-0 lg:group-hover:scale-110" size={22} />
                                <span className="text-gray-300 transition-colors duration-300 whitespace-nowrap lg:group-hover:text-white">
                                    contacto@bytecode.com.pe
                                </span>
                            </a>
                        </div>

                        {/* Copyright (Solo visible en Escritorio Gigante 2XL) */}
                        <div className="hidden 2xl:flex flex-col items-end gap-1 shrink-0">
                            <span className="text-gray-300 text-base text-right whitespace-nowrap">
                                © 2026 Bytecode. Todos los derechos reservados.
                            </span>
                        </div>
                    </div>

                    {/* --- FILA 2: Enlaces Legales --- */}
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-14 text-gray-400 text-sm md:text-base font-normal w-full">
                        <Link to="/condiciones" className="transition-colors lg:hover:text-[#06CFD6]">Condiciones</Link>
                        <Link to="/privacidad" className="transition-colors lg:hover:text-[#06CFD6]">Privacidad</Link>
                        <Link to="/reclamaciones" className="transition-colors lg:hover:text-[#06CFD6]">Libro de Reclamaciones</Link>
                    </div>

                    {/* --- FILA 3: Copyright Móvil/Tablet/Laptop --- */}
                    <div className="flex 2xl:hidden w-full justify-center mt-2">
                        <span className="text-gray-300 text-sm md:text-base text-center">
                            © 2026 Bytecode. Todos los derechos reservados.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ContactFooter;
