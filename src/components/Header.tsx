import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileMenuView from './MobileMenuView';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ── BARRA PRINCIPAL ── */}
      <header className="absolute top-0 left-0 right-0 z-50 px-5 pt-16 pb-6 flex items-center justify-center bg-transparent">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center">
            <img src="/designs/logo_en_blanco.svg" alt="Bytecode" className="h-14 w-auto transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(6,207,214,0.6)] active:scale-95" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(true)}
            // 1. Añadimos 'group', 'hover:scale-110' y 'active:scale-95' para igualar el rebote del AltHeader
            className="group text-white hover:text-primary-cyan hover:scale-100 active:scale-95 transition-all duration-300 outline-none"
            aria-label="Abrir menú"
          >
            <svg 
              viewBox="0 0 64 36" 
              // 2. Añadimos la transición y la rotación que reacciona al 'group' del botón
              className="w-10 h-6 transition-transform duration-300 group-hover:rotate-90" 
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
