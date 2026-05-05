import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileMenuView from './MobileMenuView';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ── BARRA PRINCIPAL ── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center bg-transparent px-5 pb-6 pt-6 md:pt-6 md:pb-12 lg:pt-9.5 lg:pb-16">
        <div className="flex items-center gap-7 md:gap-10">
          <Link to="/" className="flex items-center">
            <img src="/designs/logo_en_blanco.svg" alt="Bytecode" className="h-11 w-auto transition-all duration-300 active:scale-95 md:h-14 lg:hover:scale-105 lg:hover:drop-shadow-[0_0_12px_rgba(6,207,214,0.6)]" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(true)}
            // 1. Añadimos 'group' y 'active:scale-95' para igualar el rebote del AltHeader
            className="group text-white active:scale-95 transition-all duration-300 outline-none lg:hover:text-primary-cyan lg:hover:scale-100"
            aria-label="Abrir menú"
          >
            <svg 
              viewBox="0 0 64 36" 
              // 2. Añadimos la transición y la rotación que reacciona al 'group' del botón
              className="h-5 w-8 transition-transform duration-300 md:h-6 md:w-10 lg:group-hover:rotate-90" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 3. Cambiamos stroke="white" por stroke="currentColor" para que herede el color cyan al hacer hover */}
              <path d="M2.5 2.5L61.5 2.5" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
              <path d="M2.5 18L61.5 18" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
              <path d="M2.5 33.5L61.5 33.5" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── MENÚ INTERACTIVO COMPLETO ── */}
      <MobileMenuView isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
