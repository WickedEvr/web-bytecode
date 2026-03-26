import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

/* Isotipo Bytecode */
const SwirlMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <img src="/isotipo.svg" alt="" aria-hidden="true" className={className} />
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#040e1f]">

      {/* ── CTA PRE-FOOTER ── */}
      <div className="border-t border-white/10 px-6 py-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative">
          <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight max-w-sm">
            Un clic para ti,<br />
            un salto para tu marca.
          </h2>

          <Link to="/contacto" className="btn-cyan text-lg px-16 py-3 shrink-0">
            Conectar
          </Link>

          {/* Swirl decorativo */}
          <SwirlMark className="absolute bottom-0 right-0 w-6 h-9 text-white/30 hidden md:block" />
        </div>
      </div>

      {/* ── FOOTER PRINCIPAL ── */}
      <div className="border-t border-white/10 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-gray-400 text-sm">

          {/* Contacto */}
          <div className="space-y-1">
            <p className="text-white font-semibold mb-2 text-xs uppercase tracking-widest">Contáctanos</p>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-primary-cyan shrink-0" />
              <span>(+51) 946 243 145</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-primary-cyan shrink-0" />
              <span>grupo@caplogistic.com.pe</span>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-gray-500 text-xs">
            © 2026 Bytecode. Todos los derechos reservados.
          </p>

          {/* Links */}
          <div className="flex flex-col md:flex-row gap-4 text-xs uppercase tracking-wider">
            <Link to="/condiciones" className="hover:text-primary-cyan transition-colors">
              Condiciones
            </Link>
            <Link to="/privacidad" className="hover:text-primary-cyan transition-colors">
              Privacidad
            </Link>
            <Link to="/reclamaciones" className="hover:text-primary-cyan transition-colors">
              Libro de Reclamaciones
            </Link>
          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;
