import React, { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, WhatsAppIcon } from '../icons/SocialIcons';

const MobileMenuView = lazy(() => import('./MobileMenuView'));

const WHATSAPP_MESSAGE = "%C2%A1Hola%2C%20equipo%20de%20Bytecode!%20Me%20gustar%C3%ADa%20cotizar%20el%20desarrollo%20de%20un%20software.";

const WHATSAPP_URLS = [
    `https://wa.me/51936281137?text=${WHATSAPP_MESSAGE}`,
    `https://wa.me/51970199434?text=${WHATSAPP_MESSAGE}`,
];

const AltHeader: React.FC = () => {
    // Estado para controlar si el menú está abierto o no
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasMenuLoaded, setHasMenuLoaded] = useState(false);

    // Funciones para abrir y cerrar
    const openMenu = () => {
        setHasMenuLoaded(true);
        setIsMenuOpen(true);
    };
    const closeMenu = () => setIsMenuOpen(false);

    const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        const selectedUrl = WHATSAPP_URLS[Math.floor(Math.random() * WHATSAPP_URLS.length)];

        window.open(selectedUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
        <header className="bg-white w-full py-3 md:py-5 px-4 md:px-12 flex items-center justify-between shadow-sm relative z-50 font-sansation select-none">

            {/* Lado Izquierdo: Logo y Menú */}
            <div className="flex items-center gap-3 md:gap-6 select-none">
            <Link to="/" className="group outline-none">
                <img
                src="/vectors/designs/variante_logo_color1.svg"
                alt="Bytecode Logo"
                className="h-7 md:h-12 w-auto object-contain transition-all duration-300 ease-out active:scale-95 lg:group-hover:scale-105 lg:group-hover:drop-shadow-[0_0_12px_rgba(6,207,214,0.4)]"
                />
            </Link>
            <button
                onClick={openMenu}
                className="group text-[#0CA3C6] active:scale-95 transition-all duration-300 p-0.5 outline-none lg:hover:text-[#0CA3C6] lg:hover:scale-110"
                aria-label="Menú principal"
            >
                <Menu size={26} strokeWidth={2.5} className="transition-transform duration-300 md:hidden lg:group-hover:rotate-90" />
                <Menu size={36} strokeWidth={2.5} className="transition-transform duration-300 hidden md:block lg:group-hover:rotate-90" />
            </button>
            </div>

            {/* Lado Derecho: Redes Sociales y Botón Conectar */}
            <div className="flex items-center gap-4 md:gap-8">

                {/* REDES SOCIALES */}
                <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
                    <div className="flex items-center gap-3 md:gap-6 lg:gap-4">
                        <a href="https://www.facebook.com/bytecodesystems/" target="_blank" rel="noopener noreferrer"
                            className="text-[#0CA3C6] transition-all duration-300 outline-none lg:hover:text-[#0CA3C6] lg:hover:-translate-y-1"
                            aria-label="Facebook">
                            <FacebookIcon className="w-5 h-5 md:w-8 md:h-8 lg:w-[23px] lg:h-[23px]" />
                        </a>
                        <a href="https://www.instagram.com/bytecodesw" target="_blank" rel="noopener noreferrer"
                            className="text-[#0CA3C6] transition-all duration-300 outline-none lg:hover:text-[#0CA3C6] lg:hover:-translate-y-1"
                            aria-label="Instagram">
                            <InstagramIcon className="w-5 h-5 md:w-8 md:h-8 lg:w-[23px] lg:h-[23px]" />
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                            className="text-[#0CA3C6] transition-all duration-300 outline-none lg:hover:text-[#0CA3C6] lg:hover:-translate-y-1"
                            aria-label="TikTok">
                            <TikTokIcon className="w-5 h-5 md:w-8 md:h-8 lg:w-[23px] lg:h-[23px]" />
                        </a>
                        <a href="https://www.linkedin.com/company/bytecodesw" target="_blank" rel="noopener noreferrer"
                            className="text-[#0CA3C6] transition-all duration-300 outline-none lg:hover:text-[#0CA3C6] lg:hover:-translate-y-1"
                            aria-label="LinkedIn">
                            <LinkedInIcon className="w-5 h-5 md:w-8 md:h-8 lg:w-[23px] lg:h-[23px]" />
                        </a>
                        <a 
                            href={WHATSAPP_URLS[0]}
                            onClick={handleWhatsAppClick}
                            className="text-[#0CA3C6] transition-all duration-300 outline-none lg:hover:text-[#0CA3C6] lg:hover:-translate-y-1"
                            aria-label="WhatsApp">
                            <WhatsAppIcon className="w-5 h-5 md:w-8 md:h-8 lg:w-[24px] lg:h-[24px]" />
                        </a>
                    </div>
                </div>

                {/* Botón Conectar */}
                <Link
                    to="/contacto"
                    className="hidden lg:inline-block bg-[#0CA3C6] text-white font-bold rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(6,207,214,0.4)] active:translate-y-0 outline-none shrink-0 text-sm py-2 px-5 md:text-lg md:py-3 md:px-10 lg:hover:bg-[#0CA3C6] lg:hover:-translate-y-1 lg:hover:shadow-[0_8px_25px_rgba(6,207,214,0.6)]"
                >
                    Conectar
                </Link>
            </div>
        </header>
        
        {/* Menú Móvil */}
        {hasMenuLoaded && (
            <Suspense fallback={null}>
                <MobileMenuView isOpen={isMenuOpen} onClose={closeMenu} />
            </Suspense>
        )}
        </>
    );
};

export default AltHeader;
