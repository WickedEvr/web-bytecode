import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileMenuView from './MobileMenuView';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ── BARRA PRINCIPAL ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 py-4 flex items-center justify-between">
        {/* Izquierda: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img src="/logoBlancoBytecode.svg" alt="Bytecode" className="h-7 w-auto" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white ml-1 p-1 hover:text-primary-cyan transition-colors"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Derecha: Conectar + Sociales */}
        <div className="flex items-center gap-4">
          <Link
            to="/contacto"
            className="border border-white/70 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-white hover:text-[#060c1d] transition-colors"
          >
            Conectar
          </Link>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-primary-cyan transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-primary-cyan transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── MENÚ INTERACTIVO COMPLETO ── */}
      <MobileMenuView isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
