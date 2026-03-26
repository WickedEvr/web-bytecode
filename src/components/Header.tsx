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
            <img src="/src/desings/logo_en_blanco.svg" alt="Bytecode" className="h-24 w-auto" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white hover:text-primary-cyan transition-colors"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 64 36" className="w-16 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 2.5L61.5 2.5" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <path d="M2.5 18L61.5 18" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <path d="M2.5 33.5L61.5 33.5" stroke="white" strokeWidth="5" strokeLinecap="round"/>
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
