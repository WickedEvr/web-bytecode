import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Phone } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTiktok } from 'react-icons/fa6';
import MobileMenuView from './MobileMenuView';

const AltHeader: React.FC = () => {
    // Estado para controlar si el menú está abierto o no
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Funciones para abrir y cerrar
    const openMenu = () => setIsMenuOpen(true);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
        <header className="bg-white w-full py-5 px-6 md:px-12 flex items-center justify-between shadow-sm relative z-50 font-sansation select-none">
            
            {/* Lado Izquierdo: Logo y Menú */}
            <div className="flex items-center gap-6 select-none">
            <Link to="/" className="group outline-none">
                <img 
                src="/designs/variante_logo_color1.svg" 
                alt="Bytecode Logo" 
                className="h-10 md:h-12 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(6,207,214,0.4)] active:scale-95" 
                />
            </Link>
            <button 
                onClick={openMenu}
                className="text-[#06CFD6] hover:text-[#0CA3C6] hover:scale-110 active:scale-95 transition-all duration-300 p-1 outline-none"
                aria-label="Menú principal"
            >
                <Menu size={36} strokeWidth={2.5} />
            </button>
            </div>
            
            {/* Lado Derecho: Contacto, Redes Sociales y Botón Conectar */}
            <div className="flex items-center gap-6 md:gap-8">
                
                {/* Contenedor Oculto en Móvil */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    
                    {/* Número de Teléfono */}
                    <a href="tel:+15551234567" className="flex items-center gap-2 text-[#06CFD6] hover:text-[#0CA3C6] hover:scale-105 transition-all duration-300 text-lg outline-none whitespace-nowrap">
                        <Phone size={20} className="text-[#06CFD6]" />
                        <span>+1 (555) 123-4567</span>
                    </a>

                    {/* Separador Visual */}
                    <div className="w-[1px] h-6 bg-gray-200"></div>

                    {/* REDES SOCIALES (Ahora con iconos oficiales) */}
                    <div className="flex items-center gap-4">
                        <a href="https://www.facebook.com/bytecodesystems/" target="_blank" rel="noopener noreferrer" 
                            className="text-[#06CFD6] hover:text-[#06CFD6] hover:-translate-y-1 transition-all duration-300 outline-none"
                            aria-label="Facebook">
                            {/* 2. USAMOS LOS COMPONENTES DE REACT-ICONS */}
                            <FaFacebook size={23} />
                        </a>
                        
                        <a href="https://www.instagram.com/bytecodesw" target="_blank" rel="noopener noreferrer" 
                            className="text-[#06CFD6] hover:text-[#06CFD6] hover:-translate-y-1 transition-all duration-300 outline-none"
                            aria-label="Instagram">
                            <FaInstagram size={23} />
                        </a>

                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" 
                            className="text-[#06CFD6] hover:text-[#06CFD6] hover:-translate-y-1 transition-all duration-300 outline-none"
                            aria-label="TikTok">
                            <FaTiktok size={23} /> {/* Un pelín más pequeño para equilibrar visualmente */}
                        </a>

                        <a href="https://www.linkedin.com/company/bytecodesw" target="_blank" rel="noopener noreferrer" 
                            className="text-[#06CFD6] hover:text-[#06CFD6] hover:-translate-y-1 transition-all duration-300 outline-none"
                            aria-label="LinkedIn">
                            <FaLinkedinIn size={23} />
                        </a>
                    </div>

                </div>

                {/* Botón Conectar */}
                <Link 
                    to="/contacto"
                    className="bg-[#06CFD6] hover:bg-[#0CA3C6] hover:-translate-y-1 text-white font-bold text-lg py-3 px-8 md:px-10 rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(6,207,214,0.4)] hover:shadow-[0_8px_25px_rgba(6,207,214,0.6)] active:translate-y-0 outline-none shrink-0"
                >
                    Conectar
                </Link>
            </div>
        </header>
        
        {/* Menú Móvil */}
        <MobileMenuView isOpen={isMenuOpen} onClose={closeMenu} />
        </>
    );
};

export default AltHeader;
